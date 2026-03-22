"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Loader2,
  Sparkles,
  Check,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { CATEGORIES, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from "@/lib/utils/constants";

const MAX_DIMENSION = 2048;
const COMPRESS_QUALITY = 0.85;

function compressImage(
  file: File
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round(height * (MAX_DIMENSION / width));
          width = MAX_DIMENSION;
        } else {
          width = Math.round(width * (MAX_DIMENSION / height));
          height = MAX_DIMENSION;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve({ blob, width, height });
          else reject(new Error("Compression failed"));
        },
        "image/webp",
        COMPRESS_QUALITY
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

interface FileItem {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  prompt: string;
  status: "pending" | "analyzing" | "ready" | "uploading" | "done" | "error";
  error?: string;
}

export function BulkUploadForm() {
  const router = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [legalAgreed, setLegalAgreed] = useState(true);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const items: FileItem[] = [];
    for (const file of Array.from(newFiles)) {
      if (
        !ALLOWED_MIME_TYPES.includes(
          file.type as (typeof ALLOWED_MIME_TYPES)[number]
        )
      )
        continue;
      if (file.size > MAX_FILE_SIZE_BYTES) continue;

      const preview = URL.createObjectURL(file);
      items.push({
        id: crypto.randomUUID(),
        file,
        preview,
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: "",
        tags: [],
        category: "other",
        prompt: "",
        status: "pending",
      });
    }
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const updateFile = (id: string, updates: Partial<FileItem>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const analyzeAll = async () => {
    const pending = files.filter(
      (f) => f.status === "pending" || f.status === "error"
    );
    for (const item of pending) {
      updateFile(item.id, { status: "analyzing" });
      try {
        const formData = new FormData();
        // Send a smaller version for analysis (save bandwidth)
        const { blob } = await compressImage(item.file);
        formData.append(
          "file",
          new File([blob], "image.webp", { type: "image/webp" })
        );

        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Analysis failed");

        const data = await res.json();
        updateFile(item.id, {
          title: data.title || item.title,
          description: data.description || "",
          tags: data.tags || [],
          category: data.category || "other",
          prompt: data.prompt || "",
          status: "ready",
        });
      } catch {
        updateFile(item.id, { status: "error", error: "Analysis failed" });
      }
    }
  };

  const analyzeOne = async (item: FileItem): Promise<Partial<FileItem>> => {
    const formData = new FormData();
    const { blob } = await compressImage(item.file);
    formData.append(
      "file",
      new File([blob], "image.webp", { type: "image/webp" })
    );
    const res = await fetch("/api/analyze", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Analysis failed");
    const data = await res.json();
    return {
      title: data.title || item.title,
      description: data.description || "",
      tags: data.tags || [],
      category: data.category || "other",
      prompt: data.prompt || "",
    };
  };

  const uploadAll = async () => {
    const toUpload = files.filter(
      (f) => f.status === "ready" || f.status === "pending"
    );
    if (toUpload.length === 0) return;

    setUploading(true);
    setProgress({ current: 0, total: toUpload.length });

    for (let i = 0; i < toUpload.length; i++) {
      const item = toUpload[i];
      setProgress({ current: i + 1, total: toUpload.length });

      try {
        // Auto-analyze if pending (not yet analyzed)
        let meta = {
          title: item.title,
          description: item.description,
          tags: item.tags,
          category: item.category,
          prompt: item.prompt,
        };
        if (item.status === "pending") {
          updateFile(item.id, { status: "analyzing" });
          try {
            const analyzed = await analyzeOne(item);
            meta = { ...meta, ...analyzed };
            updateFile(item.id, { ...analyzed, status: "uploading" });
          } catch {
            // Analysis failed — keep filename-based title, continue upload
            updateFile(item.id, { status: "uploading" });
          }
        } else {
          updateFile(item.id, { status: "uploading" });
        }

        // Compress
        const { blob, width, height } = await compressImage(item.file);

        // Get signature
        const sigRes = await fetch("/api/upload/presigned", {
          method: "POST",
        });
        if (!sigRes.ok) throw new Error("Failed to get signature");
        const { signature, timestamp, folder, cloudName, apiKey } =
          await sigRes.json();

        // Upload to Cloudinary
        const uploadFile = new File([blob], "image.webp", {
          type: "image/webp",
        });
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("signature", signature);
        formData.append("timestamp", String(timestamp));
        formData.append("folder", folder);
        formData.append("api_key", apiKey);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        if (!cloudRes.ok) throw new Error("Upload failed");
        const cloudData = await cloudRes.json();

        // Save metadata with AI-analyzed title (not filename)
        const saveRes = await fetch("/api/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: meta.title.trim() || "Untitled",
            description: meta.description.trim() || undefined,
            tags: meta.tags,
            category: meta.category,
            prompt: meta.prompt.trim() || undefined,
            cloudinaryPublicId: cloudData.public_id,
            cloudinaryUrl: cloudData.secure_url,
            fileName: item.file.name,
            mimeType: "image/webp",
            fileSize: cloudData.bytes,
            width,
            height,
          }),
        });
        if (!saveRes.ok) throw new Error("Save failed");

        updateFile(item.id, { status: "done" });
      } catch (err) {
        updateFile(item.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    setUploading(false);

    // If all done, redirect after delay
    const allDone = files.every(
      (f) => f.status === "done" || toUpload.every((r) => r.id !== f.id)
    );
    if (allDone) {
      setTimeout(() => router.push("/"), 1500);
    }
  };

  const readyCount = files.filter(
    (f) => f.status === "ready" || f.status === "pending"
  ).length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const allAnalyzed = files.length > 0 && files.every((f) => f.status !== "pending");

  if (files.length === 0) {
    return (
      <div
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".jpg,.jpeg,.png,.webp";
          input.multiple = true;
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files;
            if (f) addFiles(f);
          };
          input.click();
        }}
        className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-foreground/20 hover:bg-muted/50"
      >
        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop images here or click to browse
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Select multiple files. JPG, PNG, or WebP up to 50MB each.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={analyzeAll}
          disabled={uploading || files.every((f) => f.status !== "pending" && f.status !== "error")}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          AI Analyze All ({files.filter((f) => f.status === "pending" || f.status === "error").length})
        </button>

        <button
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".jpg,.jpeg,.png,.webp";
            input.multiple = true;
            input.onchange = (e) => {
              const f = (e.target as HTMLInputElement).files;
              if (f) addFiles(f);
            };
            input.click();
          }}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          Add More
        </button>

        <span className="text-sm text-muted-foreground">
          {files.length} images
          {doneCount > 0 && ` · ${doneCount} uploaded`}
        </span>
      </div>

      {/* File grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((item) => (
          <div
            key={item.id}
            className={`relative rounded-xl border p-3 ${
              item.status === "done"
                ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20"
                : item.status === "error"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border"
            }`}
          >
            {/* Preview */}
            <div className="relative mb-3 overflow-hidden rounded-lg bg-muted">
              <img
                src={item.preview}
                alt=""
                className="h-32 w-full object-cover"
              />
              {item.status !== "done" && item.status !== "uploading" && (
                <button
                  onClick={() => removeFile(item.id)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              {/* Status overlay */}
              {(item.status === "analyzing" || item.status === "uploading") && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              {item.status === "done" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
              )}
              {item.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-2">
              <input
                type="text"
                value={item.title}
                onChange={(e) =>
                  updateFile(item.id, { title: e.target.value })
                }
                disabled={item.status === "uploading" || item.status === "done"}
                className="w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-foreground/20 disabled:opacity-50"
                placeholder="Title"
              />

              <select
                value={item.category}
                onChange={(e) =>
                  updateFile(item.id, { category: e.target.value })
                }
                disabled={item.status === "uploading" || item.status === "done"}
                className="w-full rounded border border-border bg-background px-2 py-1 text-xs outline-none disabled:opacity-50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {item.error && (
                <p className="text-xs text-destructive">{item.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Content Policy + Legal */}
      <div className="space-y-4 border-t border-border pt-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="mb-2 text-sm font-bold text-destructive">
            Prohibited Content — Immediate Ban
          </p>
          <ul className="mb-3 space-y-1 text-xs text-muted-foreground">
            <li>- Child sexual abuse material (CSAM) or any depiction of minors in sexual contexts</li>
            <li>- Pornographic, sexually explicit, or obscene content</li>
            <li>- Graphic violence, gore, or content promoting self-harm</li>
            <li>- Hate speech, terrorism, or content inciting violence</li>
            <li>- Real person deepfakes or non-consensual intimate imagery</li>
          </ul>
          <p className="text-xs font-semibold text-destructive">
            Uploading prohibited content will result in permanent account termination and may be reported to law enforcement.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={legalAgreed}
              onChange={(e) => setLegalAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              I confirm all images are AI-generated, do not contain any prohibited content listed above,
              do not infringe any copyright, and I agree to share them freely under the platform&apos;s{" "}
              <a
                href="/legal/terms"
                target="_blank"
                className="text-foreground underline"
              >
                Terms of Service
              </a>.
            </span>
          </label>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{
                  width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Uploading {progress.current} of {progress.total}...
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={uploadAll}
            disabled={!legalAgreed || readyCount === 0 || uploading}
            className="flex-1 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {uploading
              ? `Uploading ${progress.current}/${progress.total}...`
              : `Upload ${readyCount} Images`}
          </button>

          {!uploading && (
            <button
              onClick={() => {
                files.forEach((f) => URL.revokeObjectURL(f.preview));
                setFiles([]);
              }}
              className="rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
