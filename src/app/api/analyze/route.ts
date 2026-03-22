import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CATEGORY_VALUES = [
  "character", "landscape", "abstract", "architecture", "portrait",
  "sci_fi", "fantasy", "nature", "concept_art", "illustration",
  "photo_realistic", "other",
];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
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
- "nsfw": boolean — true if this image contains ANY of: nudity, sexual content, suggestive poses, gore, extreme violence, drug use, hate symbols, or content involving minors in inappropriate contexts. Be strict.

Return ONLY valid JSON, no markdown or explanation.`,
      },
    ]);

    const text = result.response.text().trim();
    // Extract JSON from response (may have markdown code block)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and sanitize
    const nsfw = parsed.nsfw === true;

    const analysis = {
      title: String(parsed.title || "").slice(0, 80) || "Untitled",
      description: String(parsed.description || "").slice(0, 200),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map((t: string) => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 8)
        : [],
      category: CATEGORY_VALUES.includes(parsed.category) ? parsed.category : "other",
      prompt: String(parsed.prompt || "").slice(0, 300),
      nsfw,
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    const msg = error instanceof Error ? error.message : "";
    const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("RATE_LIMIT");
    return NextResponse.json(
      { error: isQuota ? "AI quota exceeded — fill in details manually" : "Image analysis failed", quota: isQuota },
      { status: isQuota ? 429 : 500 }
    );
  }
}
