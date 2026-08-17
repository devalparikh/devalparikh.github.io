"use client";

import { useCallback, useState } from "react";
import clsx from "clsx";
import type { Photo } from "@/lib/photos";

interface PhotoFrameProps {
  photo: Photo;
  priority?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * An image that holds its own aspect ratio from the first frame and fades in
 * over its blur placeholder, so the gallery never reflows while loading.
 */
export function PhotoFrame({ photo, priority, className, onClick }: PhotoFrameProps) {
  const [loaded, setLoaded] = useState(false);

  /**
   * A cached image can finish decoding before React attaches `onLoad`, which
   * would leave it stuck at zero opacity — so check `complete` on attach too.
   */
  const captureImage = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete) setLoaded(true);
  }, []);

  const image = (
    <span
      className={clsx("block w-full overflow-hidden rounded-md bg-cover bg-center", className)}
      style={{
        aspectRatio: `${photo.width} / ${photo.height}`,
        backgroundImage: `url(${photo.placeholder})`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={captureImage}
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={clsx(
          "h-full w-full object-cover transition-opacity duration-700 ease-out",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );

  if (!onClick) return image;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${photo.alt}`}
      className="group block w-full overflow-hidden rounded-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.012]"
    >
      {image}
    </button>
  );
}
