"use client";

import { useEffect, useState, useCallback, use } from "react";
import { MasonryGrid } from "@/components/images/masonry-grid";
import { InfiniteScroll } from "@/components/images/infinite-scroll";
import { Calendar, Download, Eye, ImageIcon } from "lucide-react";
import type { ImageCardData } from "@/components/images/image-card";

interface UserProfile {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  createdAt: string;
  imageCount: number;
  totalDownloads: number;
  totalViews: number;
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<ImageCardData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/user/${id}`).then((r) => r.json()),
      fetch(`/api/images?userId=${id}`).then((r) => r.json()),
    ]).then(([userData, imagesData]) => {
      setUser(userData);
      setImages(imagesData.images);
      setNextCursor(imagesData.nextCursor);
      setLoading(false);
    });
  }, [id]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const res = await fetch(`/api/images?userId=${id}&cursor=${nextCursor}`);
    const data = await res.json();
    setImages((prev) => [...prev, ...data.images]);
    setNextCursor(data.nextCursor);
    setLoadingMore(false);
  }, [id, nextCursor, loadingMore]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="animate-pulse">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-muted" />
            <div className="space-y-3">
              <div className="h-6 w-40 rounded bg-muted" />
              <div className="h-4 w-64 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-10 columns-2 gap-5 sm:columns-3 lg:columns-4 xl:columns-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="mb-5 break-inside-avoid animate-pulse rounded-lg bg-muted"
                style={{ height: `${200 + (i % 3) * 80}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="py-20 text-center text-muted-foreground">User not found</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-10 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-6">
        {user.image ? (
          <img src={user.image} alt="" className="h-24 w-24 rounded-full" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-3xl font-bold">
            {user.name?.[0] || "?"}
          </div>
        )}
        <div className="mt-4 sm:mt-1">
          <h1 className="text-2xl font-bold tracking-tight">{user.name || "Anonymous"}</h1>
          {user.bio && <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>}
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              {user.imageCount} images
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="h-4 w-4" />
              {user.totalDownloads.toLocaleString()} downloads
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {user.totalViews.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <MasonryGrid images={images} />
      <InfiniteScroll
        hasMore={!!nextCursor}
        isLoading={loadingMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
