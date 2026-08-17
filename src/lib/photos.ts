import manifest from "@/content/photos.generated.json";

export interface PhotoExif {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  takenAt?: string;
}

export interface Photo {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio: number;
  placeholder: string;
  orientation: "landscape" | "portrait";
  exif: PhotoExif | null;
}

/**
 * `photos.generated.json` is written by `npm run photos`; the cast pins the
 * loose JSON inference back to the shape the script actually emits.
 */
const photos = manifest as unknown as {
  generatedAt: string;
  hero: Photo | null;
  gallery: Photo[];
};

export const heroPhoto = photos.hero;
export const galleryPhotos = photos.gallery;

/** Camera settings as a single line, in the order a photographer reads them. */
export function formatExifLine(exif: PhotoExif | null): string {
  if (!exif) return "";
  return [exif.focalLength, exif.aperture, exif.shutter, exif.iso]
    .filter(Boolean)
    .join(" · ");
}

export function formatTakenAt(exif: PhotoExif | null): string {
  if (!exif?.takenAt) return "";
  const date = new Date(exif.takenAt);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * EXIF records bodies as model codes. These are the ones in the library; any
 * camera without an entry falls back to the raw EXIF string.
 */
const CAMERA_NAMES: Record<string, string> = {
  "SONY ILCE-7M3": "Sony a7 III",
  "FUJIFILM X100VI": "Fujifilm X100VI",
  "Apple iPhone 13": "iPhone 13",
};

export interface GearItem {
  camera: string;
  lenses: string[];
  frames: number;
}

/**
 * The gear list is derived from the photographs themselves rather than kept as
 * a separate list that could drift out of date.
 */
export function getCameraGear(): GearItem[] {
  const byCamera = new Map<string, { lenses: Set<string>; frames: number }>();

  for (const photo of [heroPhoto, ...galleryPhotos]) {
    const camera = photo?.exif?.camera;
    if (!camera) continue;

    const entry = byCamera.get(camera) ?? { lenses: new Set<string>(), frames: 0 };
    entry.frames += 1;

    // A fixed-lens body reports its own name as the lens; that is noise here.
    const lens = photo.exif?.lens;
    if (lens && !lens.toLowerCase().includes(camera.split(" ").at(-1)!.toLowerCase())) {
      entry.lenses.add(lens);
    }

    byCamera.set(camera, entry);
  }

  return [...byCamera.entries()]
    .map(([camera, entry]) => ({
      camera: CAMERA_NAMES[camera] ?? camera,
      lenses: [...entry.lenses],
      frames: entry.frames,
    }))
    .sort((a, b) => b.frames - a.frames);
}
