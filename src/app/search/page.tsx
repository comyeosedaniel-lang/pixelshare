"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MasonryGrid } from "@/components/images/masonry-grid";
import { InfiniteScroll } from "@/components/images/infinite-scroll";
import { CATEGORIES } from "@/lib/utils/constants";
import type { ImageCardData } from "@/components/images/image-card";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [images, setImages] = useState<ImageCardData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const fetchImages = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category !== "all") params.set("category", category);
      params.set("sort", sort);
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/images?${params}`);
      return res.json();
    },
    [query, category, sort]
  );

  useEffect(() => {
    setLoading(true);
    setImages([]);
    fetchImages()
      .then((data) => {
        setImages(data.images);
        setNextCursor(data.nextCursor);
      })
      .finally(() => setLoading(false));
  }, [fetchImages]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const data = await fetchImages(nextCursor);
    setImages((prev) => [...prev, ...data.images]);
    setNextCursor(data.nextCursor);
    setLoadingMore(false);
  }, [nextCursor, loadingMore, fetchImages]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        {query ? (
          <h1 className="text-2xl font-bold">
            Results for &ldquo;{query}&rdquo;
          </h1>
        ) : (
          <h1 className="text-2xl font-bold">Browse Images</h1>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Viewed</option>
          <option value="downloads">Most Downloaded</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <>
          <MasonryGrid images={images} />
          <InfiniteScroll
            hasMore={!!nextCursor}
            isLoading={loadingMore}
            onLoadMore={loadMore}
          />
        </>
      )}
    </div>
  );
}
