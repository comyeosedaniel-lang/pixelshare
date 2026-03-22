import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

const CATEGORY_VALUES = [
  "character", "landscape", "abstract", "architecture", "portrait",
  "sci_fi", "fantasy", "nature", "concept_art", "illustration",
  "photo_realistic", "other",
];

const PROMPT = `Analyze this AI-generated image and return a JSON object with:
- "title": A creative, concise title (max 80 chars, English)
- "description": A brief description of the image (max 200 chars, English)
- "tags": An array of 3-8 relevant tags (lowercase, single words or short phrases)
- "category": One of: ${CATEGORY_VALUES.join(", ")}
- "prompt": Your best guess of the AI prompt that could have generated this image (max 300 chars, English)
- "nsfw": boolean — true if this image contains ANY of: nudity, sexual content, suggestive poses, gore, extreme violence, drug use, hate symbols, or content involving minors in inappropriate contexts. Be strict.

Return ONLY valid JSON, no markdown or explanation.`;

async function analyzeWithCloudflare(base64: string, mimeType: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_AI_TOKEN;
  if (!accountId || !token) throw new Error("Cloudflare AI not configured");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          },
        ],
        max_tokens: 1024,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudflare AI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.result?.response || "";
}

async function analyzeWithGemini(base64: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini not configured");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64 } },
    { text: PROMPT },
  ]);

  return result.response.text().trim();
}

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

    // Try Cloudflare Workers AI first (100K free/day), fallback to Gemini
    let text = "";
    try {
      text = await analyzeWithCloudflare(base64, file.type);
    } catch (cfError) {
      console.warn("Cloudflare AI failed, trying Gemini:", cfError);
      text = await analyzeWithGemini(base64, file.type);
    }

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
    console.error("AI analysis error:", error);
    const msg = error instanceof Error ? error.message : "";
    const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("RATE_LIMIT");
    return NextResponse.json(
      { error: isQuota ? "AI quota exceeded — fill in details manually" : "Image analysis failed", quota: isQuota },
      { status: isQuota ? 429 : 500 }
    );
  }
}
