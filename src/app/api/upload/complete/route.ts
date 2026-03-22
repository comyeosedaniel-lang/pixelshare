import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { images, tags, imageTags } from "@/lib/db/schema";
import { completeUploadSchema } from "@/lib/validations/upload";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = completeUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    title,
    description,
    tags: tagNames,
    category,
    prompt,
    cloudinaryPublicId,
    cloudinaryUrl,
    fileName,
    mimeType,
    fileSize,
    width,
    height,
  } = parsed.data;

  try {
    // Generate thumbnail URL via Cloudinary transformations
    const thumbnailUrl = cloudinaryUrl.replace(
      "/upload/",
      "/upload/w_400,q_75,f_webp/"
    );

    const [newImage] = await db
      .insert(images)
      .values({
        userId: session.user.id,
        title,
        description: description || null,
        prompt: prompt || null,
        category: category as "character" | "landscape" | "abstract" | "architecture" | "portrait" | "sci_fi" | "fantasy" | "nature" | "concept_art" | "illustration" | "photo_realistic" | "other",
        originalUrl: cloudinaryUrl,
        thumbnailUrl,
        fileName,
        mimeType,
        fileSize,
        width,
        height,
        sha256Hash: createHash("sha256").update(cloudinaryPublicId).digest("hex"),
        pHash: null,
      })
      .returning({ id: images.id });

    // Handle tags
    if (tagNames.length > 0) {
      for (const tagName of tagNames) {
        const normalized = tagName.toLowerCase().trim();
        if (!normalized) continue;

        let tag = await db.query.tags.findFirst({
          where: eq(tags.name, normalized),
        });

        if (!tag) {
          const [newTag] = await db
            .insert(tags)
            .values({ name: normalized })
            .returning();
          tag = newTag;
        }

        await db
          .insert(imageTags)
          .values({ imageId: newImage.id, tagId: tag.id })
          .onConflictDoNothing();
      }
    }

    return NextResponse.json({ imageId: newImage.id });
  } catch (error) {
    console.error("Upload complete error:", error);
    const message = error instanceof Error ? error.message : "Failed to process upload";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
