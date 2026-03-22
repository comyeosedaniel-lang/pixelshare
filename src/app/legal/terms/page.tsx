import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Pixelshare, you agree to be bound by these Terms of Service.
            If you do not agree, please do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. AI-Generated Images Only</h2>
          <p>
            This platform is exclusively for AI-generated images. By uploading, you confirm that
            the image was created using AI tools (e.g., Midjourney, Stable Diffusion, DALL-E).
            Uploading non-AI-generated content or content you do not have rights to share is prohibited.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. User Responsibilities</h2>
          <p>You are responsible for the content you upload. You must not upload:</p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>Illegal content of any kind</li>
            <li>Content that infringes on third-party intellectual property</li>
            <li>Malicious files disguised as images</li>
            <li>Content depicting minors in any inappropriate context</li>
            <li>Harassment, hate speech, or violent content</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. Platform Role</h2>
          <p>
            Pixelshare acts as a platform and conduit for sharing. We do not claim ownership of
            uploaded content. We reserve the right to remove any content at our discretion.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. DMCA / Copyright</h2>
          <p>
            We comply with the Digital Millennium Copyright Act (DMCA) and Korean Copyright Law.
            If you believe content infringes your rights, please submit a report through our
            reporting system.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">6. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violations of these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">7. Disclaimer</h2>
          <p>
            The platform is provided &ldquo;as is&rdquo; without warranties of any kind. We are not
            liable for any damages arising from your use of the platform.
          </p>
        </section>
      </div>
    </div>
  );
}
