"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
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
}

export function ImageDetail({ imageId }: { imageId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = session?.user?.id === image?.userId;

  useEffect(() => {
    fetch(`/api/images/${imageId}`)
      .then((res) => res.json())
      .then(setImage)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [imageId]);

  const startEditing = useCallback(() => {
    if (!image) return;
    setEditTitle(image.title);
    setEditDescription(image.description || "");
    setEditPrompt(image.prompt || "");
    setEditCategory(image.category || "other");
    setEditTags(image.tags.join(", "));
    setEditing(true);
  }, [image]);

  const handleSave = async () => {
    if (!image) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/images/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          prompt: editPrompt,
          category: editCategory,
          tags: editTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        setImage({
          ...image,
          title: editTitle,
          description: editDescription || null,
          prompt: editPrompt || null,
          category: editCategory,
          tags: editTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!image) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/images/${image.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!image) return;
    fetch(`/api/download/${image.id}`);
    const link = document.createElement("a");
    link.href = image.originalUrl;
    link.download = image.fileName;
    link.target = "_blank";
    link.click();
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
        <div className="flex items-center justify-center" style={{ maxHeight: "75vh" }}>
          {image.originalUrl.startsWith("http") ? (
            <Image
              src={image.originalUrl}
              alt={image.title}
              width={image.width}
              height={image.height}
              className="h-auto max-h-[75vh] w-auto max-w-full object-contain"
              priority
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Image unavailable (legacy upload)
            </div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {editing ? (
            /* Edit Form */
            <div className="space-y-4 rounded-xl border border-border p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Edit Image</h2>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Prompt
                </label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="e.g. landscape, cyberpunk, neon"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || !editTitle.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Display Mode */
            <>
              <div>
                <div className="flex items-start gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{image.title}</h1>
                  {isOwner && (
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={startEditing}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {image.description && (
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {image.description}
                  </p>
                )}
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

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  <Download className="h-4 w-4" />
                  Download
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
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Maximize2 className="h-4 w-4" /> Resolution
                </span>
                <span className="font-medium">{image.width} &times; {image.height}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="h-4 w-4" /> Size
                </span>
                <span className="font-medium">{formatSize(image.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" /> Views
                </span>
                <span className="font-medium">{image.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Download className="h-4 w-4" /> Downloads
                </span>
                <span className="font-medium">{image.downloadCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Uploaded
                </span>
                <span className="font-medium">
                  {new Date(image.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {categoryLabel && (
              <div className="border-t border-border pt-4">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {categoryLabel}
                </span>
              </div>
            )}
          </div>

          <Link
            href={`/report?imageId=${image.id}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            <Flag className="h-3.5 w-3.5" />
            Report this image
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Delete Image</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete &ldquo;{image.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
