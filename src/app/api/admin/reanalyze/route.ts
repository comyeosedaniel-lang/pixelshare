import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { images, tags, imageTags } from "@/lib/db/schema";
import { eq, and, or, ilike, sql } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CATEGORY_VALUES = [
  "character", "landscape", "abstract", "architecture", "portrait",
  "sci_fi", "fantasy", "nature", "concept_art", "illustration",
  "photo_realistic", "other",
];

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find images that look like they have filename-based titles
  // (contain underscores, dashes, numbers patterns typical of filenames)
  const allImages = await db
    .select({
      id: images.id,
      title: images.title,
      originalUrl: images.originalUrl,
      userId: images.userId,
    })
    .from(images)
    .where(
      and(
        eq(images.userId, session.user.id),
        eq(images.isDeleted, false),
        or(
          // Typical filename patterns
          ilike(images.title, "%img%"),
          ilike(images.title, "%image%"),
          ilike(images.title, "%screenshot%"),
          ilike(images.title, "%photo%"),
          ilike(images.title, "%download%"),
          ilike(images.title, "%untitled%"),
          ilike(images.title, "%_%"),
          ilike(images.title, "%--%"),
          sql`${images.title} ~ '^[0-9]'`,
          sql`${images.title} ~ '\([0-9]+\)$'`,
          sql`length(${images.title}) < 5`,
        )
      )
    )
    .limit(500);

  if (allImages.length === 0) {
    return NextResponse.json({ message: "No images need re-analysis", updated: 0 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  let updated = 0;
  const errors: string[] = [];

  for (const img of allImages) {
    try {
      // Fetch the image from Cloudinary (use thumbnail for smaller size)
      const thumbUrl = img.originalUrl.replace(
        "/upload/",
        "/upload/w_512,q_70,f_webp/"
      );
      const imgRes = await fetch(thumbUrl);
      if (!imgRes.ok) continue;

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const base64 = buffer.toString("base64");

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "image/webp",
            data: base64,
          },
        },
        {
          text: `Analyze this AI-generated image and return a JSON object with:
- "title": A creative, concise title (max 80 chars, English)
- "description": A brief description of the image (max 200 chars, English)
- "tags": An array of 3-8 relevant tags (lowercase, single words or short phrases)
- "category": One of: ${CATEGORY_VALUES.join(", ")}
- "prompt": Your best guess of the AI prompt that could have generated this image (max 300 chars, English)

Return ONLY valid JSON, no markdown or explanation.`,
        },
      ]);

      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const parsed = JSON.parse(jsonMatch[0]);

      const analysis = {
        title: String(parsed.title || "").slice(0, 80) || img.title,
        description: String(parsed.description || "").slice(0, 200) || null,
        prompt: String(parsed.prompt || "").slice(0, 300) || null,
        category: CATEGORY_VALUES.includes(parsed.category) ? parsed.category : "other",
      };

      const tagNames: string[] = Array.isArray(parsed.tags)
        ? parsed.tags.map((t: string) => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 8)
        : [];

      // Update image
      await db
        .update(images)
        .set({
          title: analysis.title,
          description: analysis.description,
          prompt: analysis.prompt,
          category: analysis.category as typeof images.category.enumValues[number],
        })
        .where(eq(images.id, img.id));

      // Replace tags
      if (tagNames.length > 0) {
        await db.delete(imageTags).where(eq(imageTags.imageId, img.id));
        for (const tagName of tagNames) {
          const normalized = tagName.toLowerCase().trim();
          if (!normalized) continue;
          let tag = await db.query.tags.findFirst({ where: eq(tags.name, normalized) });
          if (!tag) {
            const [newTag] = await db.insert(tags).values({ name: normalized }).returning();
            tag = newTag;
          }
          await db.insert(imageTags).values({ imageId: img.id, tagId: tag.id }).onConflictDoNothing();
        }
      }

      updated++;
    } catch (err) {
      errors.push(`${img.id}: ${err instanceof Error ? err.message : "failed"}`);
    }

    // Rate limit: ~10 requests per minute to stay within Gemini free tier
    await new Promise((r) => setTimeout(r, 6000));
  }

  return NextResponse.json({
    total: allImages.length,
    updated,
    errors: errors.length > 0 ? errors : undefined,
  });
}
