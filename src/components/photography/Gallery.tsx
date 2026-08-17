"use client";

import { useState } from "react";
import { Reveal } from "@/components/primitives/Reveal";
import { playInterfaceSound } from "@/lib/interface-sound";
import { formatExifLine, type Photo } from "@/lib/photos";
import { Lightbox } from "./Lightbox";
import { PhotoFrame } from "./PhotoFrame";

/**
 * Masonry columns rather than a fixed grid — the frames are a mix of portrait
 * and landscape and cropping them all to one ratio would waste the shots.
 */
export function Gallery({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 sm:gap-5">
        {photos.map((photo, index) => (
          <Reveal
            key={photo.id}
            onScroll
            index={index % 2}
            className="mb-4 break-inside-avoid sm:mb-5"
          >
            <figure>
              <PhotoFrame
                photo={photo}
                priority={index < 2}
                onClick={() => {
                  playInterfaceSound("tap");
                  setOpenIndex(index);
                }}
              />
              {photo.exif && (
                <figcaption className="mt-1.5 font-mono text-[0.62rem] text-neutral-content">
                  {[photo.exif.camera, formatExifLine(photo.exif)]
                    .filter(Boolean)
                    .join("  ·  ")}
                </figcaption>
              )}
            </figure>
          </Reveal>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox photos={photos} startIndex={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}
