import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { images, tags, imageTags } from "@/lib/db/schema";
import { completeUploadSchema } from "@/lib/validations/upload";
import { getFromStorage, uploadToStorage } from "@/lib/r2/operations";
import { getPublicUrl } from "@/lib/r2/presigned";
import { computeSha256 } from "@/lib/image-processing/hash";
import { computePHash } from "@/lib/image-processing/phash";
import { generateThumbnail, getImageMetadata } from "@/lib/image-processing/thumbnail";

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

  const { key, title, description, tags: tagNames, category, prompt } =
    parsed.data;

  try {
    // 1. Fetch the uploaded file from storage
    const fileBuffer = await getFromStorage(key);

    // 2. Compute SHA-256 hash
    const sha256Hash = computeSha256(fileBuffer);

    // 3. Check for exact duplicate
    const existing = await db.query.images.findFirst({
      where: eq(images.sha256Hash, sha256Hash),
    });
    if (existing) {
      return NextResponse.json(
        { error: "This exact image already exists", imageId: existing.id },
        { status: 409 }
      );
    }

    // 4. Get image metadata
    const metadata = await getImageMetadata(fileBuffer);
    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        { error: "Invalid image file" },
        { status: 400 }
      );
    }

    // 5. Compute perceptual hash
    const pHash = await computePHash(fileBuffer);

    // 6. Generate thumbnail
    const thumbnailBuffer = await generateThumbnail(fileBuffer);
    const thumbnailKey = `thumbnails/${session.user.id}/${nanoid()}.webp`;
    await uploadToStorage(thumbnailKey, thumbnailBuffer, "image/webp");

    // 7. Extract file info from key
    const fileName = key.split("/").pop() || "unknown";
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };

    // 8. Insert image record
    const [newImage] = await db
      .insert(images)
      .values({
        userId: session.user.id,
        title,
        description: description || null,
        prompt: prompt || null,
        category: category as "character" | "landscape" | "abstract" | "architecture" | "portrait" | "sci_fi" | "fantasy" | "nature" | "concept_art" | "illustration" | "photo_realistic" | "other",
        originalUrl: key,
        thumbnailUrl: thumbnailKey,
        fileName,
        mimeType: mimeMap[ext] || "image/jpeg",
        fileSize: fileBuffer.length,
        width: metadata.width,
        height: metadata.height,
        sha256Hash,
        pHash,
      })
      .returning({ id: images.id });

    // 9. Handle tags
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

    return NextResponse.json({
      imageId: newImage.id,
      thumbnailUrl: getPublicUrl(thumbnailKey),
    });
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
