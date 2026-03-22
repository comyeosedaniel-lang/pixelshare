import type { Metadata } from "next";
import Link from "next/link";
import { UploadForm } from "@/components/upload/upload-form";

export const metadata: Metadata = {
  title: "Upload",
};

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upload AI Image</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share your AI-generated images with the community. Only AI-generated images are allowed.
          </p>
        </div>
        <Link
          href="/bulk-upload"
          className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Bulk Upload
        </Link>
      </div>
      <div className="mt-8">
        <UploadForm />
      </div>
    </div>
  );
}
