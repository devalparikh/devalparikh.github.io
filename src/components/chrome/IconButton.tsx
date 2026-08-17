import type { ReactNode } from "react";
import clsx from "clsx";

interface IconButtonProps {
  children: ReactNode;
  label: string;
  onClick: () => void;
  title?: string;
  pressed?: boolean;
  className?: string;
}

/** The shared 36px square button used by every control in the nav bar. */
export function IconButton({
  children,
  label,
  onClick,
  title,
  pressed,
  className,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={title ?? label}
      className={clsx(
        "grid size-9 shrink-0 place-items-center rounded-lg text-neutral-content",
        "transition-[background-color,color,transform] duration-150 ease-out",
        "hover:bg-base-200 hover:text-base-content active:scale-95",
        "[&_svg]:size-[17px]",
        className,
      )}
    >
      {children}
    </button>
  );
}
