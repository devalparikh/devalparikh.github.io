import clsx from "clsx";

export interface PortraitProps {
  src: string;
  alt: string;
  /** Only the polaroid renders it; the circle ignores it. */
  caption?: string;
  className?: string;
}

/**
 * The hero portrait comes in two interchangeable treatments. Both take the same
 * props, so switching the hero from one to the other is a one-word import
 * change.
 */

export function CirclePortrait({ src, alt, className }: PortraitProps) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      width={272}
      height={272}
      className={clsx(
        "size-[112px] rounded-full object-cover sm:size-[124px]",
        "ring-1 ring-[var(--rule)]",
        className,
      )}
    />
  );
}

export function PolaroidPortrait({ src, alt, caption, className }: PortraitProps) {
  return (
    <figure className={clsx("polaroid w-[124px] sm:w-[136px]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={272} height={272} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
