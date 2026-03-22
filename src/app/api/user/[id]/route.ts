import { NextRequest, NextResponse } from "next/server";
import { eq, and, count, sql } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users, images } from "@/lib/db/schema";
import { updateProfileSchema } from "@/lib/validations/profile";

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
    youtubeUrl: user.youtubeUrl,
    twitterUrl: user.twitterUrl,
    instagramUrl: user.instagramUrl,
    websiteUrl: user.websiteUrl,
    tosAcceptedAt: user.tosAcceptedAt,
    createdAt: user.createdAt,
    imageCount: stats[0]?.imageCount || 0,
    totalDownloads: stats[0]?.totalDownloads || 0,
    totalViews: stats[0]?.totalViews || 0,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id || session.user.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, bio, youtubeUrl, twitterUrl, instagramUrl, websiteUrl } = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (name !== undefined) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio || null;
  if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl || null;
  if (twitterUrl !== undefined) updateData.twitterUrl = twitterUrl || null;
  if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl || null;
  if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl || null;

  await db.update(users).set(updateData).where(eq(users.id, id));

  return NextResponse.json({ success: true });
}
