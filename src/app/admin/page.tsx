"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Check, X, Loader2, ChevronDown } from "lucide-react";

interface AdminImage {
  id: string;
  title: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  category: string;
  downloadCount: number | null;
  viewCount: number | null;
  isDeleted: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [images, setImages] = useState<AdminImage[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const fetchImages = useCallback(
    async (offset = 0) => {
      const res = await fetch(
        `/api/admin/images?offset=${offset}&limit=50&secret=${encodeURIComponent(secret)}`
      );
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
    [secret]
  );

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await fetchImages(0);
      setImages(data.images);
      setNextOffset(data.nextOffset);
      setAuthenticated(true);
    } catch {
      setMessage("Invalid secret");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (nextOffset === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchImages(nextOffset);
      setImages((prev) => [...prev, ...data.images]);
      setNextOffset(data.nextOffset);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === images.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(images.map((img) => img.id)));
    }
  };

  const handleDelete = async (hard: boolean) => {
    if (selected.size === 0) return;
    const action = hard ? "permanently delete" : "soft-delete";
    if (!confirm(`${action} ${selected.size} image(s)?`)) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/admin/images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ ids: Array.from(selected), hard }),
      });
      const data = await res.json();
      setMessage(`Deleted ${data.deleted} image(s)`);

      if (hard) {
        setImages((prev) => prev.filter((img) => !selected.has(img.id)));
      } else {
        setImages((prev) =>
          prev.map((img) =>
            selected.has(img.id) ? { ...img, isDeleted: true } : img
          )
        );
      }
      setSelected(new Set());
    } catch {
      setMessage("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter admin secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleLogin}
            disabled={loading || !secret}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Enter"}
          </button>
          {message && (
            <p className="text-sm text-red-500">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold">Image Manager</h1>
        <span className="text-sm text-muted-foreground">
          {images.length} loaded / {selected.size} selected
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={selectAll}
            className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            {selected.size === images.length ? "Deselect All" : "Select All"}
          </button>
          <button
            onClick={() => handleDelete(false)}
            disabled={selected.size === 0 || deleting}
            className="flex items-center gap-1.5 rounded-lg border border-yellow-500/50 px-3 py-2 text-sm text-yellow-600 transition-colors hover:bg-yellow-50 disabled:opacity-40 dark:text-yellow-400 dark:hover:bg-yellow-950"
          >
            <X className="h-4 w-4" />
            Soft Delete
          </button>
          <button
            onClick={() => handleDelete(true)}
            disabled={selected.size === 0 || deleting}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4" />
            Hard Delete
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-border bg-muted px-4 py-2 text-sm">
          {message}
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => toggleSelect(img.id)}
            className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
              selected.has(img.id)
                ? "border-primary ring-2 ring-primary/30"
                : "border-transparent hover:border-border"
            } ${img.isDeleted ? "opacity-40" : ""}`}
          >
            <div className="relative aspect-square">
              <img
                src={img.thumbnailUrl}
                alt={img.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {/* Selection indicator */}
              <div
                className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                  selected.has(img.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/70 bg-black/30"
                }`}
              >
                {selected.has(img.id) && <Check className="h-3.5 w-3.5" />}
              </div>
              {img.isDeleted && (
                <div className="absolute right-2 top-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  DELETED
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-xs font-medium">{img.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {img.category} · {img.viewCount || 0} views
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {nextOffset !== null && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm transition-colors hover:bg-muted disabled:opacity-50"
          >
            {loadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
