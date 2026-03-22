// Standalone script to re-analyze existing images with Gemini AI
// Usage: node scripts/reanalyze.mjs

import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CATEGORY_VALUES = [
  "character", "landscape", "abstract", "architecture", "portrait",
  "sci_fi", "fantasy", "nature", "concept_art", "illustration",
  "photo_realistic", "other",
];

async function main() {
  // Find images with filename-like titles (contain UUID patterns, underscores, etc.)
  const { rows: imgs } = await pool.query(`
    SELECT id, title, original_url
    FROM images
    WHERE is_deleted = false
      AND (
        title ~ '_[a-f0-9]{8}-'
        OR title ~ '^[a-z0-9]{2,}_'
        OR title ~ '\\([0-9]+\\)$'
        OR title ~ '^[0-9]+'
        OR title ILIKE '%img%'
        OR title ILIKE '%screenshot%'
        OR title ILIKE '%download%'
        OR title ILIKE '%untitled%'
        OR length(title) > 60
      )
    ORDER BY created_at DESC
    LIMIT 1000
  `);

  console.log(`Found ${imgs.length} images to re-analyze`);
  if (imgs.length === 0) {
    await pool.end();
    return;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i];
    console.log(`[${i + 1}/${imgs.length}] Analyzing: ${img.title.slice(0, 50)}...`);

    try {
      // Fetch thumbnail from Cloudinary
      const thumbUrl = img.original_url.replace(
        "/upload/",
        "/upload/w_512,q_70,f_webp/"
      );
      const imgRes = await fetch(thumbUrl);
      if (!imgRes.ok) {
        console.log(`  Skip: failed to fetch image`);
        errors++;
        continue;
      }

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const base64 = buffer.toString("base64");

      const result = await model.generateContent([
        { inlineData: { mimeType: "image/webp", data: base64 } },
        {
          text: `Analyze this AI-generated image and return a JSON object with:
- "title": A creative, concise title (max 80 chars, English)
- "description": A brief description (max 200 chars, English)
- "tags": An array of 3-8 relevant tags (lowercase)
- "category": One of: ${CATEGORY_VALUES.join(", ")}
- "prompt": Best guess of the AI prompt (max 300 chars, English)

Return ONLY valid JSON.`,
        },
      ]);

      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`  Skip: no JSON in response`);
        errors++;
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const title = String(parsed.title || "").slice(0, 80);
      const description = String(parsed.description || "").slice(0, 200);
      const prompt = String(parsed.prompt || "").slice(0, 300);
      const category = CATEGORY_VALUES.includes(parsed.category) ? parsed.category : "other";
      const tagNames = Array.isArray(parsed.tags)
        ? parsed.tags.map(t => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 8)
        : [];

      // Update image
      await pool.query(
        `UPDATE images SET title = $1, description = $2, prompt = $3, category = $4 WHERE id = $5`,
        [title || img.title, description || null, prompt || null, category, img.id]
      );

      // Replace tags
      if (tagNames.length > 0) {
        await pool.query(`DELETE FROM image_tags WHERE image_id = $1`, [img.id]);
        for (const tagName of tagNames) {
          // Upsert tag
          const { rows: existing } = await pool.query(
            `SELECT id FROM tags WHERE name = $1`, [tagName]
          );
          let tagId;
          if (existing.length > 0) {
            tagId = existing[0].id;
          } else {
            const { rows: newTag } = await pool.query(
              `INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id`,
              [tagName]
            );
            tagId = newTag[0].id;
          }
          await pool.query(
            `INSERT INTO image_tags (image_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [img.id, tagId]
          );
        }
      }

      updated++;
      console.log(`  -> "${title}" [${category}] tags: ${tagNames.join(", ")}`);
    } catch (err) {
      console.log(`  Error: ${err.message}`);
      errors++;
    }

    // Rate limit: Gemini free tier ~15 req/min
    await new Promise(r => setTimeout(r, 4500));
  }

  console.log(`\nDone! Updated: ${updated}, Errors: ${errors}, Total: ${imgs.length}`);
  await pool.end();
}

main().catch(console.error);
