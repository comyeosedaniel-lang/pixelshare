import { NextRequest, NextResponse } from "next/server";
import { getImageById, incrementDownloadCount } from "@/lib/db/queries/images";
import { getDownloadPresignedUrl } from "@/lib/r2/presigned";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const image = await getImageById(id);

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  // Generate presigned download URL
  const downloadUrl = await getDownloadPresignedUrl(image.originalUrl);

  // Increment download count
  incrementDownloadCount(id);

  return NextResponse.json({ downloadUrl });
}
