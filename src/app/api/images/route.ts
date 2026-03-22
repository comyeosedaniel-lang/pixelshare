import { NextRequest, NextResponse } from "next/server";
import { getImages } from "@/lib/db/queries/images";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const offset = parseInt(searchParams.get("offset") || "0") || 0;
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 50);
  const category = searchParams.get("category") || undefined;
  const query = searchParams.get("q") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const sort = (searchParams.get("sort") || "newest") as
    | "newest"
    | "popular"
    | "downloads"
    | "random";

  const result = await getImages({
    offset,
    limit,
    category,
    query,
    userId,
    sort,
  });

  return NextResponse.json({
    images: result.images,
    hasMore: result.hasMore,
    nextOffset: result.nextOffset,
  });
}
