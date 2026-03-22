import { db } from "@/lib/db";
import { images, imageTags, tags, users } from "@/lib/db/schema";
import { eq, desc, and, sql, ilike, or, type SQL } from "drizzle-orm";
import { IMAGES_PER_PAGE } from "@/lib/utils/constants";

export type ImageWithUser = Awaited<ReturnType<typeof getImages>>["images"][number];

export async function getImages({
  cursor,
  limit = IMAGES_PER_PAGE,
  category,
  query,
  userId,
  sort = "newest",
}: {
  cursor?: string;
  limit?: number;
  category?: string;
  query?: string;
  userId?: string;
  sort?: "newest" | "popular" | "downloads";
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditions: SQL<any>[] = [
    eq(images.isDeleted, false),
    eq(images.moderationOk, true),
  ];

  if (category && category !== "all") {
    conditions.push(sql`${images.category} = ${category}`);
  }

  if (userId) {
    conditions.push(eq(images.userId, userId));
  }

  if (query) {
    conditions.push(
      or(
        ilike(images.title, `%${query}%`),
        ilike(images.description, `%${query}%`),
        ilike(images.prompt, `%${query}%`)
      )!
    );
  }

  if (cursor) {
    conditions.push(sql`${images.createdAt} < ${new Date(cursor)}`);
  }

  const orderBy =
    sort === "popular"
      ? desc(images.viewCount)
      : sort === "downloads"
        ? desc(images.downloadCount)
        : desc(images.createdAt);

  const results = await db
    .select({
      id: images.id,
      title: images.title,
      description: images.description,
      category: images.category,
      thumbnailUrl: images.thumbnailUrl,
      originalUrl: images.originalUrl,
      width: images.width,
      height: images.height,
      downloadCount: images.downloadCount,
      viewCount: images.viewCount,
      createdAt: images.createdAt,
      userName: users.name,
      userImage: users.image,
      userId: users.id,
    })
    .from(images)
    .leftJoin(users, eq(images.userId, users.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const items = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore
    ? items[items.length - 1].createdAt.toISOString()
    : null;

  return { images: items, nextCursor };
}

export async function getImageById(id: string) {
  const result = await db
    .select({
      id: images.id,
      title: images.title,
      description: images.description,
      prompt: images.prompt,
      category: images.category,
      originalUrl: images.originalUrl,
      thumbnailUrl: images.thumbnailUrl,
      fileName: images.fileName,
      mimeType: images.mimeType,
      fileSize: images.fileSize,
      width: images.width,
      height: images.height,
      downloadCount: images.downloadCount,
      viewCount: images.viewCount,
      createdAt: images.createdAt,
      userId: images.userId,
      userName: users.name,
      userImage: users.image,
      magnetUri: images.magnetUri,
    })
    .from(images)
    .leftJoin(users, eq(images.userId, users.id))
    .where(and(eq(images.id, id), eq(images.isDeleted, false)))
    .limit(1);

  return result[0] || null;
}

export async function getImageTags(imageId: string) {
  const result = await db
    .select({ name: tags.name })
    .from(imageTags)
    .innerJoin(tags, eq(imageTags.tagId, tags.id))
    .where(eq(imageTags.imageId, imageId));

  return result.map((r) => r.name);
}

export async function incrementViewCount(id: string) {
  await db
    .update(images)
    .set({ viewCount: sql`${images.viewCount} + 1` })
    .where(eq(images.id, id));
}

export async function incrementDownloadCount(id: string) {
  await db
    .update(images)
    .set({ downloadCount: sql`${images.downloadCount} + 1` })
    .where(eq(images.id, id));
}

export async function softDeleteImage(id: string, userId: string) {
  await db
    .update(images)
    .set({ isDeleted: true })
    .where(and(eq(images.id, id), eq(images.userId, userId)));
}
