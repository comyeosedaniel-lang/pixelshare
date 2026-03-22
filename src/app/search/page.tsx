"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MasonryGrid } from "@/components/images/masonry-grid";
import { InfiniteScroll } from "@/components/images/infinite-scroll";
import { CATEGORIES } from "@/lib/utils/constants";
import type { ImageCardData } from "@/components/images/image-card";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [images, setImages] = useState<ImageCardData[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const fetchImages = useCallback(
    async (offset?: number) => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category !== "all") params.set("category", category);
      params.set("sort", sort);
      if (offset) params.set("offset", String(offset));

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
        setNextOffset(data.nextOffset);
      })
      .finally(() => setLoading(false));
  }, [fetchImages]);

  const loadMore = useCallback(async () => {
    if (nextOffset === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchImages(nextOffset);
      setImages((prev) => {
        const existingIds = new Set(prev.map((img) => img.id));
        const newImages = data.images.filter(
          (img: ImageCardData) => !existingIds.has(img.id)
        );
        return [...prev, ...newImages];
      });
      setNextOffset(data.nextOffset);
    } finally {
      setLoadingMore(false);
    }
  }, [nextOffset, loadingMore, fetchImages]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        {query ? (
          <h1 className="text-2xl font-bold tracking-tight">
            Results for &ldquo;{query}&rdquo;
          </h1>
        ) : (
          <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm outline-none transition-colors hover:bg-muted focus:ring-2 focus:ring-ring"
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
          className="rounded-full border border-border bg-background px-4 py-2 text-sm outline-none transition-colors hover:bg-muted focus:ring-2 focus:ring-ring"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Viewed</option>
          <option value="downloads">Most Downloaded</option>
          <option value="random">Random</option>
        </select>

        {!loading && (
          <span className="ml-auto text-sm text-muted-foreground">
            {images.length} image{images.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="columns-2 gap-5 sm:columns-3 lg:columns-4 xl:columns-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="mb-5 break-inside-avoid animate-pulse rounded-lg bg-muted"
              style={{ height: `${200 + (i % 3) * 80}px` }}
            />
          ))}
        </div>
      ) : (
        <>
          <MasonryGrid images={images} />
          <InfiniteScroll
            hasMore={nextOffset !== null}
            isLoading={loadingMore}
            onLoadMore={loadMore}
          />
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="columns-2 gap-5 sm:columns-3 lg:columns-4 xl:columns-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="mb-5 break-inside-avoid animate-pulse rounded-lg bg-muted"
                style={{ height: `${200 + (i % 3) * 80}px` }}
              />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
