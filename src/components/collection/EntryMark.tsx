import clsx from "clsx";
import type { EntryMark as Mark } from "@/content/types";

interface EntryMarkProps {
  mark: Mark;
  label: string;
  className?: string;
}

/**
 * A fixed square keeps every row's text starting at the same x position,
 * whether the company ships a square logo or only a wide wordmark.
 */
export function EntryMark({ mark, label, className }: EntryMarkProps) {
  const classes = clsx(
    "grid size-[22px] shrink-0 place-items-center overflow-hidden rounded-[5px]",
    className,
  );

  if (mark.src) {
    return (
      <span className={clsx(classes, "bg-base-200/60")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mark.src}
          alt=""
          width={22}
          height={22}
          loading="lazy"
          decoding="async"
          className="size-[16px] object-contain"
        />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <span
      className={clsx(classes, "font-mono text-[0.56rem] font-semibold leading-none text-white")}
      style={{ backgroundColor: mark.color ?? "var(--color-primary)" }}
    >
      {mark.monogram}
      <span className="sr-only">{label}</span>
    </span>
  );
}
