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
