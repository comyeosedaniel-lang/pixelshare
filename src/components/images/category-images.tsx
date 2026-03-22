"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ImageCard, type ImageCardData } from "./image-card";
import { ArrowRight } from "lucide-react";

interface CategoryImagesProps {
  category: string;
  label: string;
}

export function CategoryImages({ category, label }: CategoryImagesProps) {
  const [images, setImages] = useState<ImageCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/images?category=${category}&limit=6&sort=random`)
      .then((res) => res.json())
      .then((data) => setImages(data.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  if (loading) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{label}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{label}</h3>
        <Link
          href={`/search?category=${category}`}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    </div>
  );
}
