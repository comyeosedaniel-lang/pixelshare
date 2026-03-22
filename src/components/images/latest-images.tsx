"use client";

import { useEffect, useState } from "react";
import { MasonryGrid } from "./masonry-grid";
import type { ImageCardData } from "./image-card";

export function LatestImages() {
  const [images, setImages] = useState<ImageCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/images?limit=30&sort=random")
      .then((res) => res.json())
      .then((data) => setImages(data.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="columns-2 gap-5 sm:columns-3 lg:columns-4 xl:columns-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="mb-5 break-inside-avoid animate-pulse rounded-lg bg-muted"
            style={{ height: `${200 + (i % 3) * 80}px` }}
          />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No images yet. Be the first to upload!
      </p>
    );
  }

  return <MasonryGrid images={images} />;
}
