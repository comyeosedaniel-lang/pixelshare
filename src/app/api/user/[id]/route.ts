import { NextRequest, NextResponse } from "next/server";
import { eq, and, count, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, images } from "@/lib/db/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get stats
  const stats = await db
    .select({
      imageCount: count(images.id),
      totalDownloads: sql<number>`coalesce(sum(${images.downloadCount}), 0)`,
      totalViews: sql<number>`coalesce(sum(${images.viewCount}), 0)`,
    })
    .from(images)
    .where(and(eq(images.userId, id), eq(images.isDeleted, false)));

  return NextResponse.json({
    id: user.id,
    name: user.name,
    image: user.image,
    bio: user.bio,
    createdAt: user.createdAt,
    imageCount: stats[0]?.imageCount || 0,
    totalDownloads: stats[0]?.totalDownloads || 0,
    totalViews: stats[0]?.totalViews || 0,
  });
}
