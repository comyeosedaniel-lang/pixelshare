declare module "webtorrent" {
  export default class WebTorrent {
    constructor(opts?: Record<string, unknown>);
    torrents: Array<Record<string, unknown>>;
    seed(
      input: File | Blob | File[],
      opts: Record<string, unknown>,
      cb: (torrent: Record<string, unknown>) => void
    ): void;
    add(
      magnetUri: string,
      opts?: Record<string, unknown>,
      cb?: () => void
    ): Record<string, unknown>;
    destroy(cb?: () => void): void;
  }
}
