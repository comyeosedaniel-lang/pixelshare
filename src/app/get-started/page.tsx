import type { Metadata } from "next";
import Link from "next/link";
import { Upload, Search, Download, UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Get Started",
};

const STEPS = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign in with Google or GitHub to get started. It takes just a few seconds — no email verification needed.",
  },
  {
    icon: Search,
    title: "Discover AI Images",
    description:
      "Browse the gallery, search by keyword, or filter by category to find amazing AI-generated artwork from the community.",
  },
  {
    icon: Upload,
    title: "Share Your Creations",
    description:
      "Upload your AI-generated images to share with the world. Add titles, descriptions, tags, and the prompt you used to create them.",
  },
  {
    icon: Download,
    title: "Download Freely",
    description:
      "All images shared on Pixelshare are free to download and use. Images are shared without copyright restrictions.",
  },
];

export default function GetStartedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Get Started with Pixelshare</h1>
      <p className="mt-2 text-muted-foreground">
        Learn how to use the platform in a few simple steps.
      </p>

      <div className="mt-10 space-y-10">
        {STEPS.map((step, i) => (
          <div key={i} className="flex gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
              <step.icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                <span className="text-muted-foreground">Step {i + 1}.</span>{" "}
                {step.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/login"
          className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Sign In to Start
        </Link>
        <Link
          href="/search"
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          Browse Images
        </Link>
      </div>
    </div>
  );
}
