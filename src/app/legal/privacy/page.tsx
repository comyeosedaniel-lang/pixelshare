import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>When you sign in via Google or GitHub, we collect:</p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>Name and email address</li>
            <li>Profile picture URL</li>
            <li>OAuth tokens (stored securely, never shared)</li>
          </ul>
          <p className="mt-2">When you upload images, we collect:</p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            <li>Image files and metadata (title, description, tags)</li>
            <li>File hashes for integrity and duplicate detection</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="ml-4 list-disc space-y-1">
            <li>To provide and maintain the platform</li>
            <li>To display your uploaded images to other users</li>
            <li>To detect and prevent abuse</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">3. Data Storage</h2>
          <p>
            Your data is stored on Neon (PostgreSQL) and Cloudflare R2. Servers may be located
            outside your country. By using the platform, you consent to this transfer.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">4. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share data with law enforcement
            when required by law.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">5. Your Rights</h2>
          <p>
            You may request deletion of your account and data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">6. Cookies</h2>
          <p>
            We use essential cookies for authentication sessions. No tracking cookies are used.
          </p>
        </section>
      </div>
    </div>
  );
}
