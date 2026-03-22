"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function TosAgreementPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/tos/accept", { method: "POST" });
      if (res.ok) {
        await update();
        router.replace("/");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Please sign in first.</p>
        <Link href="/login" className="mt-2 inline-block text-sm underline">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold">Terms of Service Agreement</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Please review and accept the following terms before using Pixelshare.
      </p>

      <div className="mt-6 space-y-4 rounded-xl border border-border p-5 text-sm leading-relaxed text-muted-foreground">
        <div>
          <h3 className="font-semibold text-foreground">AI-Generated Images Only</h3>
          <p>This platform is exclusively for AI-generated images (Midjourney, Stable Diffusion, DALL-E, etc.).</p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground">No Copyright Claims</h3>
          <p>
            AI-generated images uploaded to Pixelshare are shared freely. You acknowledge that purely
            AI-generated images may not be eligible for copyright protection under current law, and you
            waive any exclusive rights to the uploaded content.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground">User Responsibilities</h3>
          <p>
            You must not upload illegal content, content that infringes third-party rights, inappropriate
            content involving minors, or any content that violates applicable laws.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground">Content Removal</h3>
          <p>
            We reserve the right to remove any content and terminate accounts that violate these terms.
          </p>
        </div>

        <div className="text-xs">
          Full details:{" "}
          <Link href="/legal/terms" className="underline hover:text-foreground" target="_blank">
            Terms of Service
          </Link>
          {" · "}
          <Link href="/legal/privacy" className="underline hover:text-foreground" target="_blank">
            Privacy Policy
          </Link>
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
        />
        <span className="text-sm">
          I have read and agree to the Terms of Service and Privacy Policy. I understand that
          uploaded AI-generated images are shared without copyright claims.
        </span>
      </label>

      <button
        onClick={handleAccept}
        disabled={!agreed || submitting}
        className="mt-6 w-full rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          "Accept and Continue"
        )}
      </button>
    </div>
  );
}
