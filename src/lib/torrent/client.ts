/* eslint-disable @typescript-eslint/no-explicit-any */

const TRACKERS = [
  "wss://tracker.webtorrent.dev",
  "wss://tracker.btorrent.xyz",
  "wss://tracker.files.fm:7073/announce",
];

let clientInstance: any = null;
let clientPromise: Promise<any> | null = null;

/**
 * Get or create a singleton WebTorrent client instance.
 * Only works in the browser.
 */
export async function getTorrentClient(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("WebTorrent can only be used in the browser");
  }

  if (clientInstance) return clientInstance;

  if (clientPromise) return clientPromise;

  clientPromise = (async () => {
    const WebTorrent = (await import("webtorrent")).default;
    clientInstance = new WebTorrent();
    return clientInstance;
  })();

  return clientPromise;
}

/**
 * Seed a file via WebTorrent. Returns the magnet URI.
 */
export async function seedFile(
  file: File | Blob,
  name: string
): Promise<{ magnetURI: string; torrent: any }> {
  const client = await getTorrentClient();

  return new Promise((resolve, reject) => {
    // Convert Blob to File if needed for proper naming
    const fileToSeed =
      file instanceof File ? file : new File([file], name, { type: file.type });

    client.seed(fileToSeed, { announce: TRACKERS }, (torrent: any) => {
      resolve({ magnetURI: torrent.magnetURI, torrent });
    });

    // Timeout after 15 seconds
    setTimeout(() => reject(new Error("Seeding timed out")), 15000);
  });
}

/**
 * Download a file via WebTorrent P2P.
 * Returns the file as a Blob, or null if timed out.
 */
export async function downloadTorrent(
  magnetUri: string,
  opts: { timeout?: number } = {}
): Promise<{
  blob: Blob | null;
  method: "p2p" | "timeout";
  torrent: any;
}> {
  const timeout = opts.timeout ?? 8000;
  const client = await getTorrentClient();

  // Check if we already have this torrent
  const existing = client.torrents.find(
    (t: any) => t.magnetURI === magnetUri
  );
  if (existing && existing.done) {
    const file = existing.files[0];
    const blob = await fileToBlob(file);
    return { blob, method: "p2p", torrent: existing };
  }

  return new Promise((resolve) => {
    let settled = false;

    const torrent = client.add(magnetUri, { announce: TRACKERS }, () => {
      // Torrent metadata received
    });

    torrent.on("done", async () => {
      if (settled) return;
      settled = true;
      const file = torrent.files[0];
      if (file) {
        const blob = await fileToBlob(file);
        resolve({ blob, method: "p2p", torrent });
      } else {
        resolve({ blob: null, method: "timeout", torrent });
      }
    });

    // Timeout fallback
    setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ blob: null, method: "timeout", torrent });
    }, timeout);
  });
}

/**
 * Add a torrent to the client (for seeding/participating).
 * Does not wait for download - just joins the swarm.
 */
export async function joinSwarm(magnetUri: string): Promise<any> {
  const client = await getTorrentClient();

  // Don't add if already exists
  const existing = client.torrents.find(
    (t: any) => t.magnetURI === magnetUri
  );
  if (existing) return existing;

  return new Promise((resolve) => {
    const torrent = client.add(magnetUri, { announce: TRACKERS });
    torrent.on("ready", () => resolve(torrent));
    // If it doesn't become ready in 10s, resolve anyway
    setTimeout(() => resolve(torrent), 10000);
  });
}

/**
 * Remove a specific torrent from the client.
 */
export async function destroyTorrent(magnetUri: string): Promise<void> {
  if (!clientInstance) return;
  const torrent = clientInstance.torrents.find(
    (t: any) => t.magnetURI === magnetUri
  );
  if (torrent) {
    torrent.destroy();
  }
}

/**
 * Get stats for a specific torrent.
 */
export function getTorrentStats(torrent: any) {
  if (!torrent) return null;
  return {
    numPeers: torrent.numPeers || 0,
    downloaded: torrent.downloaded || 0,
    uploaded: torrent.uploaded || 0,
    progress: torrent.progress || 0,
    downloadSpeed: torrent.downloadSpeed || 0,
    uploadSpeed: torrent.uploadSpeed || 0,
    done: torrent.done || false,
  };
}

/**
 * Convert a WebTorrent file to a Blob.
 */
function fileToBlob(file: any): Promise<Blob> {
  return new Promise((resolve, reject) => {
    file.getBlob((err: Error | null, blob: Blob) => {
      if (err) reject(err);
      else resolve(blob);
    });
  });
}
