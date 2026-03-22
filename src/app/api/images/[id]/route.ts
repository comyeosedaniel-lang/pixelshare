import { NextRequest, NextResponse } from "next/server";
import { getImageById, getImageTags, incrementViewCount, softDeleteImage, updateImage, replaceImageTags } from "@/lib/db/queries/images";
import { auth } from "@/lib/auth/auth";

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

  // thumbnailUrl is base64 data URL, originalUrl is empty for P2P uploads
  return NextResponse.json({
    ...image,
    tags: imageTags,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const image = await getImageById(id);

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
  if (image.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, prompt, category, tags } = body;

  await updateImage(id, session.user.id, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description: description || null }),
    ...(prompt !== undefined && { prompt: prompt || null }),
    ...(category !== undefined && { category: category as "character" | "landscape" | "abstract" | "architecture" | "portrait" | "sci_fi" | "fantasy" | "nature" | "concept_art" | "illustration" | "photo_realistic" | "other" }),
  });

  if (Array.isArray(tags)) {
    await replaceImageTags(id, tags);
  }

  return NextResponse.json({ ok: true });
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
