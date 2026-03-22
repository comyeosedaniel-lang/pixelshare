"use client";

import { ImageCard, type ImageCardData } from "./image-card";

interface MasonryGridProps {
  images: ImageCardData[];
}

export function MasonryGrid({ images }: MasonryGridProps) {
  if (images.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        No images found
      </div>
    );
  }

  return (
    <div className="columns-2 gap-5 sm:columns-3 lg:columns-4 xl:columns-5">
      {images.map((image) => (
        <div key={image.id} className="mb-5 break-inside-avoid">
          <ImageCard image={image} />
        </div>
      ))}
    </div>
  );
}
