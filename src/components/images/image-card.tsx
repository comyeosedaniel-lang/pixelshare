"use client";

import Link from "next/link";
import Image from "next/image";
import { Download, Eye } from "lucide-react";

export interface ImageCardData {
  id: string;
  title: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  downloadCount: number | null;
  viewCount: number | null;
  userName: string | null;
  userImage: string | null;
  userId: string | null;
}

interface ImageCardProps {
  image: ImageCardData;
}

export function ImageCard({ image }: ImageCardProps) {
  const aspectRatio = image.height / image.width;

  return (
    <Link href={`/image/${image.id}`} className="group relative block overflow-hidden rounded-lg">
      <div style={{ paddingBottom: `${aspectRatio * 100}%` }} className="relative">
        <Image
          src={image.thumbnailUrl}
          alt={image.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {/* Top - User */}
        {image.userName && (
          <div className="absolute left-3 top-3 flex items-center gap-2">
            {image.userImage && (
              <img
                src={image.userImage}
                alt={image.userName}
                className="h-6 w-6 rounded-full"
              />
            )}
            <span className="text-xs font-medium text-white">{image.userName}</span>
          </div>
        )}

        {/* Bottom - Stats */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <p className="truncate text-sm font-medium text-white">{image.title}</p>
          <div className="flex items-center gap-3 text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {image.viewCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {image.downloadCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
