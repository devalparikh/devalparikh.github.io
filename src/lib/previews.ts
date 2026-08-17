import manifest from "@/content/previews.generated.json";

export interface Preview {
  src: string;
  width: number;
  height: number;
  /** The og:image URL this was taken from. */
  source: string;
  fetchedAt: string;
}

/**
 * Share images captured from linked sites by `npm run previews`. Projects that
 * ship their own screenshot set `image` on the entry and never reach this.
 */
const previews = manifest as Record<string, Preview>;

export function getPreview(id: string): Preview | null {
  return previews[id] ?? null;
}
