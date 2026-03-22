import sharp from "sharp";
import { THUMBNAIL_WIDTH, THUMBNAIL_QUALITY } from "@/lib/utils/constants";

export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(THUMBNAIL_WIDTH, undefined, { withoutEnlargement: true })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toBuffer();
}

export async function getImageMetadata(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format,
  };
}
