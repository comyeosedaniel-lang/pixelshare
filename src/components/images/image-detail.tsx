"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Flag, Calendar, HardDrive, Maximize2, Eye, ArrowLeft, Share2 } from "lucide-react";
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

  const handleShare = async () => {
    if (!image) return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: image.title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="animate-pulse">
          <div className="mb-6 h-4 w-16 rounded bg-muted" />
          <div className="aspect-[4/3] rounded-xl bg-muted" />
          <div className="mt-6 h-8 w-2/3 rounded bg-muted" />
          <div className="mt-4 h-4 w-1/3 rounded bg-muted" />
        </div>
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
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Back */}
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Image */}
      <div className="overflow-hidden rounded-xl bg-muted/50">
        <div className="flex items-center justify-center" style={{ maxHeight: "75vh" }}>
          <Image
            src={image.originalUrl}
            alt={image.title}
            width={image.width}
            height={image.height}
            className="h-auto max-h-[75vh] w-auto max-w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* Info section below image */}
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Left: Title + description + actions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title + User row */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">{image.title}</h1>
              {image.description && (
                <p className="mt-2 text-muted-foreground leading-relaxed">{image.description}</p>
              )}
            </div>
          </div>

          {/* Uploader */}
          <Link
            href={`/user/${image.userId}`}
            className="inline-flex items-center gap-3 rounded-full border border-border py-1.5 pl-1.5 pr-4 transition-colors hover:bg-muted"
          >
            {image.userImage ? (
              <img src={image.userImage} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {image.userName?.[0] || "?"}
              </div>
            )}
            <span className="text-sm font-medium">{image.userName || "Anonymous"}</span>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Downloading..." : "Download"}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {/* Prompt */}
          {image.prompt && (
            <div className="rounded-xl border border-border p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Prompt
              </p>
              <p className="font-mono text-sm leading-relaxed text-foreground/80">
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
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar: Metadata */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Maximize2 className="h-4 w-4" />
                  Resolution
                </span>
                <span className="font-medium">{image.width} &times; {image.height}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="h-4 w-4" />
                  Size
                </span>
                <span className="font-medium">{formatSize(image.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  Views
                </span>
                <span className="font-medium">{image.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  Downloads
                </span>
                <span className="font-medium">{image.downloadCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Uploaded
                </span>
                <span className="font-medium">
                  {new Date(image.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Category */}
            {categoryLabel && (
              <div className="border-t border-border pt-4">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {categoryLabel}
                </span>
              </div>
            )}
          </div>

          {/* Report */}
          <Link
            href={`/report?imageId=${image.id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            <Flag className="h-3.5 w-3.5" />
            Report this image
          </Link>
        </div>
      </div>
    </div>
  );
}
