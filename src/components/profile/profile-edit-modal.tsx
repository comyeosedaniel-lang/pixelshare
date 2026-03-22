"use client";

import { useState } from "react";
import { X, Loader2, Check } from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  bio: string | null;
  youtubeUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
}

interface ProfileEditModalProps {
  user: UserProfile;
  onClose: () => void;
  onSaved: () => void;
}

export function ProfileEditModal({ user, onClose, onSaved }: ProfileEditModalProps) {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [youtubeUrl, setYoutubeUrl] = useState(user.youtubeUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(user.twitterUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(user.instagramUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(user.websiteUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          youtubeUrl: youtubeUrl.trim(),
          twitterUrl: twitterUrl.trim(),
          instagramUrl: instagramUrl.trim(),
          websiteUrl: websiteUrl.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
              maxLength={255}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/500</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Social Links</p>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">YouTube</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="https://youtube.com/@channel"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Twitter / X</label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="https://x.com/username"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Instagram</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="https://instagram.com/username"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Website</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="https://yoursite.com"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
