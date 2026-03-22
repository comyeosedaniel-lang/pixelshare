import Link from "next/link";
import { LatestImages } from "@/components/images/latest-images";

export default function HomePage() {
  return (
    <div>
      {/* Compact Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The internet&apos;s source of{" "}
          <span className="text-muted-foreground">AI-generated images</span>
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Powered by creators everywhere. Free to use.
        </p>
      </section>

      {/* Image Feed */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <LatestImages />
        <div className="mt-10 text-center">
          <Link
            href="/search"
            className="inline-flex rounded-lg border border-border px-8 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Browse all images
          </Link>
        </div>
      </section>
    </div>
  );
}
