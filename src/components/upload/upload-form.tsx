"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import { CATEGORIES, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from "@/lib/utils/constants";

type UploadStep = "select" | "details" | "uploading" | "done";

export function UploadForm() {
  const router = useRouter();
  const [step, setStep] = useState<UploadStep>("select");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState("other");
  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setError(null);

    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type as typeof ALLOWED_MIME_TYPES[number])) {
      setError("Only JPG, PNG, and WebP images are allowed");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError("File size must be under 50MB");
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
    setStep("details");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 20) {
        setTags([...tags, tag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;

    setStep("uploading");
    setProgress(10);
    setError(null);

    try {
      // Step 1: Get presigned URL
      const presignedRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignedRes.ok) {
        const err = await presignedRes.json();
        throw new Error(err.error || "Failed to get upload URL");
      }

      const { uploadUrl, key } = await presignedRes.json();
      setProgress(30);

      // Step 2: Upload directly to Supabase Storage via signed URL
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
      }
      setProgress(70);

      // Step 3: Complete upload (server processes image)
      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          title: title.trim(),
          description: description.trim() || undefined,
          tags,
          category,
          prompt: prompt.trim() || undefined,
        }),
      });

      if (!completeRes.ok) {
        const err = await completeRes.json();
        throw new Error(err.error || "Failed to process upload");
      }

      const { imageId } = await completeRes.json();
      setProgress(100);
      setStep("done");

      // Redirect to image page after brief delay
      setTimeout(() => router.push(`/image/${imageId}`), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStep("details");
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setTitle("");
    setDescription("");
    setTags([]);
    setTagInput("");
    setCategory("other");
    setPrompt("");
    setStep("select");
    setError(null);
    setProgress(0);
  };

  // Step: File selection
  if (step === "select") {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-foreground/20 hover:bg-muted/50"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".jpg,.jpeg,.png,.webp";
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) handleFileSelect(f);
          };
          input.click();
        }}
      >
        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">Drop your image here or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, or WebP up to 50MB
        </p>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  // Step: Uploading
  if (step === "uploading" || step === "done") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        {step === "uploading" ? (
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-muted-foreground" />
        ) : (
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        <p className="font-medium">
          {step === "done" ? "Upload complete!" : "Processing..."}
        </p>
        <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{progress}%</p>
      </div>
    );
  }

  // Step: Details form
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="relative">
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 w-full rounded-lg object-contain bg-muted"
          />
        )}
        <button
          onClick={resetForm}
          className="absolute right-2 top-2 rounded-full bg-background/80 p-1 backdrop-blur-sm transition-colors hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/20"
          placeholder="Give your image a title"
          maxLength={500}
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/20"
          placeholder="Describe your image (optional)"
          rows={3}
          maxLength={2000}
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/20"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Prompt */}
      <div>
        <label className="mb-1 block text-sm font-medium">AI Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-foreground/20"
          placeholder="The AI prompt you used (optional)"
          rows={2}
          maxLength={5000}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1 block text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-background p-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs"
            >
              {tag}
              <button onClick={() => removeTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="min-w-[100px] flex-1 bg-transparent text-sm outline-none"
            placeholder={tags.length < 20 ? "Add tag and press Enter" : "Max 20 tags"}
            disabled={tags.length >= 20}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleUpload}
        disabled={!title.trim()}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Upload Image
      </button>
    </div>
  );
}
