"use client";

import { Youtube, Twitter, Instagram, Globe } from "lucide-react";

interface SnsLinksProps {
  youtubeUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
}

const LINKS = [
  { key: "youtubeUrl", icon: Youtube, label: "YouTube" },
  { key: "twitterUrl", icon: Twitter, label: "Twitter / X" },
  { key: "instagramUrl", icon: Instagram, label: "Instagram" },
  { key: "websiteUrl", icon: Globe, label: "Website" },
] as const;

export function SnsLinks(props: SnsLinksProps) {
  const active = LINKS.filter((l) => props[l.key]);
  if (active.length === 0) return null;

  return (
    <div className="flex gap-3">
      {active.map(({ key, icon: Icon, label }) => (
        <a
          key={key}
          href={props[key]!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-foreground"
          title={label}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
