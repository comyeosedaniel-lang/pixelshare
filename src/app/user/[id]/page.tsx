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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <div className="py-20 text-center text-muted-foreground">User not found</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-10 flex items-center gap-6">
        {user.image ? (
          <img src={user.image} alt="" className="h-20 w-20 rounded-full" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold">
            {user.name?.[0] || "?"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.name || "Anonymous"}</h1>
          {user.bio && <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>}
          <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              {user.imageCount} images
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              {user.totalDownloads} downloads
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {user.totalViews} views
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {new Date(user.createdAt).toLocaleDateString()}
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
