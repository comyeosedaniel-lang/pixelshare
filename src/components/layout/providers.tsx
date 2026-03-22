"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { TosGate } from "@/components/auth/tos-gate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TosGate>{children}</TosGate>
      </ThemeProvider>
    </SessionProvider>
  );
}
