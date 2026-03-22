import { NextRequest, NextResponse } from "next/server";
import { getImageById, getImageTags, incrementViewCount, softDeleteImage } from "@/lib/db/queries/images";
import { auth } from "@/lib/auth/auth";
import { getPublicUrl } from "@/lib/r2/presigned";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const image = await getImageById(id);

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  // Increment view count (fire and forget)
  incrementViewCount(id);

  const imageTags = await getImageTags(id);

  return NextResponse.json({
    ...image,
    thumbnailUrl: getPublicUrl(image.thumbnailUrl),
    originalUrl: getPublicUrl(image.originalUrl),
    tags: imageTags,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await softDeleteImage(id, session.user.id);

  return NextResponse.json({ ok: true });
}
