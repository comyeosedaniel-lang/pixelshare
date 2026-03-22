import { NextRequest, NextResponse } from "next/server";
import { getImageById, incrementDownloadCount } from "@/lib/db/queries/images";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const image = await getImageById(id);

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  incrementDownloadCount(id);

  return NextResponse.json({
    downloadUrl: image.originalUrl,
    fileName: image.fileName,
  });
}
