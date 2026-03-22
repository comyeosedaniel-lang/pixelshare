import type { Metadata } from "next";

export const metadata: Metadata = { title: "DMCA Policy" };

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">DMCA Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Notice and Takedown</h2>
          <p>
            Pixelshare respects intellectual property rights and complies with the Digital
            Millennium Copyright Act (DMCA) and Korean Copyright Law (Articles 102-104).
          </p>
          <p className="mt-2">
            If you believe that content on our platform infringes your copyright, you may
            submit a takedown notice through our reporting system.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">How to File a Report</h2>
          <ol className="ml-4 list-decimal space-y-2">
            <li>Navigate to the image in question</li>
            <li>Click the &ldquo;Report&rdquo; button</li>
            <li>Select &ldquo;Copyright Infringement&rdquo; as the reason</li>
            <li>Provide details about your claim</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Our Response</h2>
          <p>
            Upon receiving a valid takedown notice, we will promptly remove or disable
            access to the reported content. Repeat infringers will have their accounts
            terminated.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">AI-Generated Content</h2>
          <p>
            This platform is designed for AI-generated images only. Under current U.S. law
            (as of 2025), purely AI-generated images are generally not eligible for copyright
            protection. However, we still honor takedown requests and will review each case
            individually.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Counter-Notice</h2>
          <p>
            If you believe your content was removed in error, you may submit a counter-notice
            through our reporting system with a detailed explanation.
          </p>
        </section>
      </div>
    </div>
  );
}
