const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

interface EntryMediaProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

function isVideo(src: string) {
  return VIDEO_EXTENSIONS.some((extension) => src.toLowerCase().endsWith(extension));
}

/**
 * The visual at the top of a detail drawer. Video plays inline, muted and
 * looping, so it behaves like the animated GIFs it sits alongside; everything
 * else renders as an image.
 */
export function EntryMedia({ src, alt, width, height }: EntryMediaProps) {
  const className =
    "w-full rounded-lg border border-[var(--rule)] bg-base-200 object-cover";

  if (isVideo(src)) {
    return (
      <video
        src={src}
        className={className}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
      style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
    />
  );
}
