"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Flag, Calendar, HardDrive, Maximize2, Eye, ArrowLeft } from "lucide-react";
import { CATEGORIES } from "@/lib/utils/constants";

interface ImageData {
  id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  category: string | null;
  originalUrl: string;
  thumbnailUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width: number;
  height: number;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  userId: string;
  userName: string | null;
  userImage: string | null;
  tags: string[];
}

export function ImageDetail({ imageId }: { imageId: string }) {
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`/api/images/${imageId}`)
      .then((res) => res.json())
      .then(setImage)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [imageId]);

  const handleDownload = async () => {
    if (!image) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/download/${image.id}`);
      const { downloadUrl } = await res.json();
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = image.fileName;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium">Image not found</p>
        <Link href="/" className="mt-4 inline-block text-sm text-muted-foreground hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const categoryLabel = CATEGORIES.find((c) => c.value === image.category)?.label || image.category;

  return (
    <div>
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Image */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-lg bg-muted">
            <Image
              src={image.originalUrl}
              alt={image.title}
              width={image.width}
              height={image.height}
              className="w-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold">{image.title}</h1>
            {image.description && (
              <p className="mt-2 text-sm text-muted-foreground">{image.description}</p>
            )}
          </div>

          {/* Uploader */}
          <Link
            href={`/user/${image.userId}`}
            className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
          >
            {image.userImage ? (
              <img src={image.userImage} alt="" className="h-10 w-10 rounded-full" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {image.userName?.[0] || "?"}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{image.userName || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground">View profile</p>
            </div>
          </Link>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Downloading..." : "Download Original"}
          </button>

          {/* Metadata */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Maximize2 className="h-4 w-4" />
              {image.width} x {image.height}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              {formatSize(image.fileSize)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              {image.viewCount} views &middot; {image.downloadCount} downloads
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(image.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Category */}
          {categoryLabel && (
            <div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                {categoryLabel}
              </span>
            </div>
          )}

          {/* Prompt */}
          {image.prompt && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">PROMPT</p>
              <p className="rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed">
                {image.prompt}
              </p>
            </div>
          )}

          {/* Tags */}
          {image.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {image.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-md bg-muted px-2 py-1 text-xs transition-colors hover:bg-accent"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Report */}
          <Link
            href={`/report?imageId=${image.id}`}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <Flag className="h-3 w-3" />
            Report this image
          </Link>
        </div>
      </div>
    </div>
  );
}
