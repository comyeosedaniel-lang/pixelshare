"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import { CATEGORIES, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from "@/lib/utils/constants";

type UploadStep = "select" | "details" | "uploading" | "done";

const MAX_DIMENSION = 2048;
const COMPRESS_QUALITY = 0.85;

function compressImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;

      // Resize if exceeds max dimension
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

export function UploadForm() {
  const router = useRouter();
  const [step, setStep] = useState<UploadStep>("select");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState("other");
  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [legalAgreed, setLegalAgreed] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
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

    // Auto-analyze with AI
    setAnalyzing(true);
    try {
      const { blob } = await compressImage(selectedFile);
      const formData = new FormData();
      formData.append("file", new File([blob], "image.webp", { type: "image/webp" }));
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.tags?.length) setTags(data.tags);
        if (data.category) setCategory(data.category);
        if (data.prompt) setPrompt(data.prompt);
      }
    } catch {
      // Analysis failed — keep filename-based title, user can edit manually
    } finally {
      setAnalyzing(false);
    }
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
      // Step 1: Compress image
      setStatusText("Compressing image...");
      const { blob: compressed, width: cWidth, height: cHeight } = await compressImage(file);
      setProgress(15);

      // Step 2: Get Cloudinary signature from our server
      setStatusText("Preparing upload...");
      const sigRes = await fetch("/api/upload/presigned", { method: "POST" });
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json();
      setProgress(20);

      // Step 3: Upload compressed image to Cloudinary
      setStatusText("Uploading image...");
      const uploadFile = new File([compressed], file.name.replace(/\.[^/.]+$/, ".webp"), {
        type: "image/webp",
      });
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("signature", signature);
      formData.append("timestamp", String(timestamp));
      formData.append("folder", folder);
      formData.append("api_key", apiKey);

      const xhr = new XMLHttpRequest();
      const cloudinaryResult = await new Promise<{
        public_id: string;
        secure_url: string;
        width: number;
        height: number;
        bytes: number;
        format: string;
      }>((resolve, reject) => {
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 55) + 25;
            setProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Cloudinary upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Upload network error"));
        xhr.send(formData);
      });
      setProgress(85);

      // Step 4: Save metadata to our server
      setStatusText("Saving...");
      const res = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          tags,
          category,
          prompt: prompt.trim() || undefined,
          cloudinaryPublicId: cloudinaryResult.public_id,
          cloudinaryUrl: cloudinaryResult.secure_url,
          fileName: file.name,
          mimeType: "image/webp",
          fileSize: cloudinaryResult.bytes,
          width: cWidth,
          height: cHeight,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save image");
      }

      const { imageId } = await res.json();
      setProgress(100);
      setStatusText("Done!");
      setStep("done");

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
    setStatusText("");
    setLegalAgreed(false);
  };

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
          {step === "done" ? "Upload complete!" : statusText}
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

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-muted">
        {preview && (
          <img src={preview} alt="Preview" className="max-h-72 w-full object-contain" />
        )}
        <button
          onClick={resetForm}
          className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {analyzing && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          AI analyzing image...
        </div>
      )}

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

      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/20"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

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

      <div>
        <label className="mb-1 block text-sm font-medium">Tags</label>
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-background p-2">
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
              {tag}
              <button onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>
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

      {/* Legal Agreement */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={legalAgreed}
            onChange={(e) => setLegalAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            I confirm this is an AI-generated image, I have the rights to share it, it does not infringe
            any copyright, and I agree to share it freely without copyright claims. I have read and agree
            to the{" "}
            <a href="/legal/terms" target="_blank" className="underline text-foreground">
              Terms of Service
            </a>.
          </span>
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!title.trim() || !legalAgreed || analyzing}
        className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Upload Image
      </button>
    </div>
  );
}
