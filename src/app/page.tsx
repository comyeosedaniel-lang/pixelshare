import Link from "next/link";
import { Upload, Search, Download } from "lucide-react";
import { APP_NAME } from "@/lib/utils/constants";
import { LatestImages } from "@/components/images/latest-images";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Share AI Images,{" "}
            <span className="text-muted-foreground">Freely</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            The open platform for AI-generated images. Upload, share,
            and discover amazing creations. No server storage — powered by P2P.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/search"
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Search className="h-4 w-4" />
              Browse Images
            </Link>
            <Link
              href="/upload"
              className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">How It Works</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Upload</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your AI-generated images directly from your browser
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Discover</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse and search thousands of AI creations by style, tool, or category
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Download className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Download</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get high-quality originals for free — no strings attached
            </p>
          </div>
        </div>
      </section>

      {/* Latest Images */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest Images</h2>
          <Link
            href="/search"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>
        <LatestImages />
      </section>
    </div>
  );
}
