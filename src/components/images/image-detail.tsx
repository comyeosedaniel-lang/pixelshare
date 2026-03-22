"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Flag,
  Calendar,
  HardDrive,
  Maximize2,
  Eye,
  ArrowLeft,
  Share2,
  Wifi,
  Globe,
} from "lucide-react";
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
  magnetUri: string | null;
}

type DownloadMethod = "idle" | "p2p" | "http" | "done";

export function ImageDetail({ imageId }: { imageId: string }) {
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadMethod, setDownloadMethod] = useState<DownloadMethod>("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [peerCount, setPeerCount] = useState(0);
  const [seeding, setSeeding] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const torrentRef = useRef<any>(null);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`/api/images/${imageId}`)
      .then((res) => res.json())
      .then(setImage)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [imageId]);

  // Join the swarm for seeding when page loads (if magnetUri exists)
  useEffect(() => {
    if (!image?.magnetUri) return;

    let cancelled = false;

    (async () => {
      try {
        const { joinSwarm, getTorrentStats } = await import(
          "@/lib/torrent/client"
        );
        const torrent = await joinSwarm(image.magnetUri!);
        if (cancelled) return;

        torrentRef.current = torrent;

        if (torrent.done) {
          setSeeding(true);
        }

        torrent.on("done", () => {
          if (!cancelled) setSeeding(true);
        });

        // Update peer stats periodically
        statsIntervalRef.current = setInterval(() => {
          if (cancelled) return;
          const stats = getTorrentStats(torrent);
          if (stats) {
            setPeerCount(stats.numPeers);
          }
        }, 3000);
      } catch {
        // WebTorrent not available (e.g. SSR or old browser)
      }
    })();

    return () => {
      cancelled = true;
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [image?.magnetUri]);

  const handleDownload = useCallback(async () => {
    if (!image) return;
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadMethod("idle");

    try {
      // Get download info from API
      const res = await fetch(`/api/download/${image.id}`);
      const { downloadUrl, magnetUri, fileName } = await res.json();

      // Try P2P first if magnet URI is available
      if (magnetUri) {
        setDownloadMethod("p2p");

        try {
          const { downloadTorrent, getTorrentStats } = await import(
            "@/lib/torrent/client"
          );

          // Track progress during P2P download
          const progressInterval = setInterval(() => {
            if (torrentRef.current) {
              const stats = getTorrentStats(torrentRef.current);
              if (stats) {
                setDownloadProgress(Math.round(stats.progress * 100));
                setPeerCount(stats.numPeers);
              }
            }
          }, 500);

          const result = await downloadTorrent(magnetUri, { timeout: 8000 });
          clearInterval(progressInterval);

          if (result.blob && result.method === "p2p") {
            // P2P download succeeded!
            setDownloadProgress(100);
            triggerBlobDownload(result.blob, fileName || image.fileName);
            setDownloadMethod("done");
            setDownloading(false);
            setSeeding(true);
            torrentRef.current = result.torrent;
            return;
          }
        } catch {
          // P2P failed, fall through to HTTP
        }
      }

      // HTTP fallback
      setDownloadMethod("http");
      setDownloadProgress(50);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName || image.fileName;
      link.click();
      setDownloadProgress(100);
      setDownloadMethod("done");
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [image]);

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
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-muted-foreground hover:underline"
        >
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

  const categoryLabel =
    CATEGORIES.find((c) => c.value === image.category)?.label || image.category;

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
        <div
          className="flex items-center justify-center"
          style={{ maxHeight: "75vh" }}
        >
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
          {/* Title */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">
                {image.title}
              </h1>
              {image.description && (
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {image.description}
                </p>
              )}
            </div>
          </div>

          {/* Uploader */}
          <Link
            href={`/user/${image.userId}`}
            className="inline-flex items-center gap-3 rounded-full border border-border py-1.5 pl-1.5 pr-4 transition-colors hover:bg-muted"
          >
            {image.userImage ? (
              <img
                src={image.userImage}
                alt=""
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {image.userName?.[0] || "?"}
              </div>
            )}
            <span className="text-sm font-medium">
              {image.userName || "Anonymous"}
            </span>
          </Link>

          {/* Action buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {downloading
                  ? downloadMethod === "p2p"
                    ? `P2P ${downloadProgress}%`
                    : "Downloading..."
                  : "Download"}
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>

            {/* Download progress bar */}
            {downloading && downloadProgress > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {downloadMethod === "p2p" && (
                    <span className="inline-flex items-center gap-1">
                      <Wifi className="h-3 w-3" />
                      P2P from {peerCount} peer{peerCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {downloadMethod === "http" && (
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Direct download
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* P2P Status Badge */}
            {image.magnetUri && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wifi className="h-3.5 w-3.5" />
                {seeding ? (
                  <span className="text-green-600 dark:text-green-400">
                    Seeding{peerCount > 0 ? ` to ${peerCount} peer${peerCount !== 1 ? "s" : ""}` : ""}
                  </span>
                ) : peerCount > 0 ? (
                  <span>
                    {peerCount} peer{peerCount !== 1 ? "s" : ""} available
                  </span>
                ) : (
                  <span>P2P enabled</span>
                )}
              </div>
            )}
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
                <span className="font-medium">
                  {image.width} &times; {image.height}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="h-4 w-4" />
                  Size
                </span>
                <span className="font-medium">
                  {formatSize(image.fileSize)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  Views
                </span>
                <span className="font-medium">
                  {image.viewCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Download className="h-4 w-4" />
                  Downloads
                </span>
                <span className="font-medium">
                  {image.downloadCount.toLocaleString()}
                </span>
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
              {/* P2P Transfer Mode */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Wifi className="h-4 w-4" />
                  Transfer
                </span>
                <span className="font-medium">
                  {image.magnetUri ? "P2P + HTTP" : "HTTP"}
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

/** Trigger a file download from a Blob */
function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
