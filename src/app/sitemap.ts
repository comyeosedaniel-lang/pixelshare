import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { images } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pixelshare.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/search`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/get-started`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/upload`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/legal/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/legal/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/legal/dmca`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic image pages (latest 1000)
  const recentImages = await db
    .select({ id: images.id, updatedAt: images.updatedAt })
    .from(images)
    .where(eq(images.isDeleted, false))
    .orderBy(desc(images.createdAt))
    .limit(1000);

  const imagePages: MetadataRoute.Sitemap = recentImages.map((img) => ({
    url: `${BASE_URL}/image/${img.id}`,
    lastModified: img.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...imagePages];
}
