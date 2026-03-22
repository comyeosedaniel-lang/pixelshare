import { NextRequest, NextResponse } from "next/server";
import { getImages } from "@/lib/db/queries/images";
import { getPublicUrl } from "@/lib/r2/presigned";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const cursor = searchParams.get("cursor") || undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 50);
  const category = searchParams.get("category") || undefined;
  const query = searchParams.get("q") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const sort = (searchParams.get("sort") || "newest") as
    | "newest"
    | "popular"
    | "downloads";

  const result = await getImages({
    cursor,
    limit,
    category,
    query,
    userId,
    sort,
  });

  const imagesWithUrls = result.images.map((img) => ({
    ...img,
    thumbnailUrl: getPublicUrl(img.thumbnailUrl),
    originalUrl: getPublicUrl(img.originalUrl),
  }));

  return NextResponse.json({
    images: imagesWithUrls,
    nextCursor: result.nextCursor,
  });
}
