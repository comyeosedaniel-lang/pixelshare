"use client";

import { useEffect, useState } from "react";
import { MasonryGrid } from "./masonry-grid";
import type { ImageCardData } from "./image-card";

export function LatestImages() {
  const [images, setImages] = useState<ImageCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/images?limit=12&sort=newest")
      .then((res) => res.json())
      .then((data) => setImages(data.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
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
