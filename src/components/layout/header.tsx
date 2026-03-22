"use client";

import Link from "next/link";
import { Search, Upload, Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/utils/constants";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "@/components/auth/user-menu";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
          {APP_NAME}
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-border"
            />
          </div>
        </form>

        {/* Actions - Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/search"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore
          </Link>
          <ThemeToggle />
          <Link
            href="/upload"
            className="ml-1 flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Upload
          </Link>
          {session?.user ? (
            <UserMenu />
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "border-b border-border md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="space-y-3 px-4 py-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-border"
              />
            </div>
          </form>
          <div className="flex gap-2">
            <Link
              href="/upload"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>
            {session?.user ? (
              <UserMenu />
            ) : (
              <Link
                href="/login"
                className="flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
