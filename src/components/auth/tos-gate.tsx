"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_PATHS = [
  "/login",
  "/tos-agreement",
  "/legal",
  "/get-started",
  "/api",
];

export function TosGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      status === "authenticated" &&
      !session?.user?.tosAcceptedAt &&
      !PUBLIC_PATHS.some((p) => pathname.startsWith(p))
    ) {
      router.replace("/tos-agreement");
    }
  }, [status, session, pathname, router]);

  return <>{children}</>;
}
