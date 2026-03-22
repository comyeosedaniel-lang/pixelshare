import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/utils/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pixelshare.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${APP_NAME} — Free AI Image Sharing`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "AI images",
    "AI art",
    "AI generated",
    "free images",
    "image sharing",
    "AI artwork",
    "prompt sharing",
    "creative commons",
    "free stock images",
  ],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — Free AI Image Sharing`,
    description: APP_DESCRIPTION,
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Free AI Image Sharing`,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: "WqMm31Vce88aL7vRd1zTM2tRUpnROZEOslreSpfXvXk",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${syne.variable} ${inter.className}`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
