import type { Metadata } from "next";
import { BulkUploadForm } from "@/components/upload/bulk-upload-form";

export const metadata: Metadata = {
  title: "Bulk Upload",
};

export default function BulkUploadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Bulk Upload</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload multiple AI images at once. Gemini AI will automatically generate titles, tags, and descriptions.
      </p>
      <div className="mt-6">
        <BulkUploadForm />
      </div>
    </div>
  );
}
