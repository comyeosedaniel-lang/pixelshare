"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Flag, ArrowLeft } from "lucide-react";
import Link from "next/link";

const REASONS = [
  { value: "copyright", label: "Copyright Infringement" },
  { value: "illegal_content", label: "Illegal Content" },
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "misleading", label: "Misleading Content" },
  { value: "other", label: "Other" },
];

export default function ReportPage() {
  const searchParams = useSearchParams();
  const imageId = searchParams.get("imageId") || "";
  const router = useRouter();

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !imageId) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId,
          reason,
          description: description.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit report");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Flag className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold">Report Submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for your report. We will review it as soon as possible.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-muted-foreground hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link
        href={imageId ? `/image/${imageId}` : "/"}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="text-2xl font-bold">Report Image</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Report content that violates our terms of service or applicable laws.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium">Reason *</label>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={(e) => setReason(e.target.value)}
                  className="accent-primary"
                />
                <span className="text-sm">{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Additional Details</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/20"
            placeholder="Provide additional context (optional)"
            rows={4}
            maxLength={2000}
          />
        </div>

        <button
          type="submit"
          disabled={!reason || submitting}
          className="w-full rounded-lg bg-destructive px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
