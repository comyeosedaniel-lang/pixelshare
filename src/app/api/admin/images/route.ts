import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { images, imageTags } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

const ADMIN_SECRET = process.env.AUTH_SECRET?.slice(0, 12) || "admin";

function checkAuth(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret") ||
    request.nextUrl.searchParams.get("secret");
  return secret === ADMIN_SECRET;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50"), 100);

  const results = await db
    .select({
      id: images.id,
      title: images.title,
      thumbnailUrl: images.thumbnailUrl,
      originalUrl: images.originalUrl,
      width: images.width,
      height: images.height,
      category: images.category,
      downloadCount: images.downloadCount,
      viewCount: images.viewCount,
      isDeleted: images.isDeleted,
      createdAt: images.createdAt,
    })
    .from(images)
    .orderBy(desc(images.createdAt))
    .offset(offset)
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const items = hasMore ? results.slice(0, limit) : results;

  return NextResponse.json({
    images: items,
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
    total: items.length,
  });
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids, hard } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  if (hard) {
    // Hard delete: remove tags first, then images
    await db.delete(imageTags).where(inArray(imageTags.imageId, ids));
    await db.delete(images).where(inArray(images.id, ids));
  } else {
    // Soft delete
    await db
      .update(images)
      .set({ isDeleted: true })
      .where(inArray(images.id, ids));
  }

  return NextResponse.json({ deleted: ids.length });
}
