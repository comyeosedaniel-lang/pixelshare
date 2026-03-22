import Link from "next/link";
import { APP_NAME } from "@/lib/utils/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {APP_NAME}. AI images shared freely.
          </p>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/get-started" className="transition-colors hover:text-foreground">
              Get Started
            </Link>
            <Link href="/legal/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/legal/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/legal/dmca" className="transition-colors hover:text-foreground">
              DMCA
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
