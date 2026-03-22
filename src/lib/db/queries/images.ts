import { db } from "@/lib/db";
import { images, imageTags, tags, users } from "@/lib/db/schema";
import { eq, desc, and, sql, ilike, or, type SQL } from "drizzle-orm";
import { IMAGES_PER_PAGE } from "@/lib/utils/constants";

export type ImageWithUser = Awaited<ReturnType<typeof getImages>>["images"][number];

export async function getImages({
  offset = 0,
  limit = IMAGES_PER_PAGE,
  category,
  query,
  userId,
  sort = "newest",
}: {
  offset?: number;
  limit?: number;
  category?: string;
  query?: string;
  userId?: string;
  sort?: "newest" | "popular" | "downloads" | "random";
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

  const isRandom = sort === "random";

  const orderBy = isRandom
    ? [sql`RANDOM()`]
    : sort === "popular"
      ? [desc(images.viewCount), desc(images.createdAt)]
      : sort === "downloads"
        ? [desc(images.downloadCount), desc(images.createdAt)]
        : [desc(images.createdAt)];

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
    .orderBy(...orderBy)
    .offset(offset)
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const items = hasMore ? results.slice(0, limit) : results;

  return { images: items, hasMore, nextOffset: hasMore ? offset + limit : null };
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

type CategoryType = "character" | "landscape" | "abstract" | "architecture" | "portrait" | "sci_fi" | "fantasy" | "nature" | "concept_art" | "illustration" | "photo_realistic" | "other";

export async function updateImage(
  id: string,
  userId: string,
  data: {
    title?: string;
    description?: string | null;
    prompt?: string | null;
    category?: CategoryType;
  }
) {
  await db
    .update(images)
    .set(data)
    .where(and(eq(images.id, id), eq(images.userId, userId)));
}

export async function replaceImageTags(imageId: string, tagNames: string[]) {
  // Delete existing tags
  await db.delete(imageTags).where(eq(imageTags.imageId, imageId));

  // Insert new tags
  for (const tagName of tagNames) {
    const normalized = tagName.toLowerCase().trim();
    if (!normalized) continue;

    let tag = await db.query.tags.findFirst({
      where: eq(tags.name, normalized),
    });

    if (!tag) {
      const [newTag] = await db
        .insert(tags)
        .values({ name: normalized })
        .returning();
      tag = newTag;
    }

    await db
      .insert(imageTags)
      .values({ imageId, tagId: tag.id })
      .onConflictDoNothing();
  }
}
