"use client";

import Link from "next/link";
import Image from "next/image";
import { Download, ArrowDown } from "lucide-react";

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
    <div className="group relative overflow-hidden rounded-lg bg-muted">
      <Link href={`/image/${image.id}`} className="block">
        <div style={{ paddingBottom: `${aspectRatio * 100}%` }} className="relative">
          <Image
            src={image.thumbnailUrl}
            alt={image.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      {/* Hover Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Top-right: Download button */}
      <div className="absolute right-3 top-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(`/api/download/${image.id}`, "_blank");
          }}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          title="Download"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom: User info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
        <div className="flex items-center justify-between">
          {image.userName ? (
            <Link
              href={`/user/${image.userId}`}
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {image.userImage ? (
                <img
                  src={image.userImage}
                  alt={image.userName}
                  className="h-7 w-7 rounded-full border border-white/30"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-medium text-white">
                  {image.userName[0]}
                </div>
              )}
              <span className="text-sm font-medium text-white drop-shadow-sm">
                {image.userName}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
