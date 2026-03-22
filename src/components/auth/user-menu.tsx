"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, User, Upload } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border transition-colors hover:border-foreground/20"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-background p-1 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
          <Link
            href={`/user/${session.user.id}`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Link>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
