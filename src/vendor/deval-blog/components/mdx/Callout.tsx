interface CalloutProps {
  type?: "info" | "warning" | "error" | "success";
  children: React.ReactNode;
}

const icons: Record<string, React.ReactNode> = {
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 shrink-0 text-blue-400/80" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 shrink-0 text-amber-400/80" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 shrink-0 text-red-400/80" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 shrink-0 text-emerald-400/80" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const styles: Record<string, string> = {
  info: "border-l-2 border-blue-400/50 bg-blue-400/5",
  warning: "border-l-2 border-amber-400/50 bg-amber-400/5",
  error: "border-l-2 border-red-400/50 bg-red-400/5",
  success: "border-l-2 border-emerald-400/50 bg-emerald-400/5",
};

export function Callout({ type = "info", children }: CalloutProps) {
  return (
    <div className={`${styles[type]} my-6 not-prose flex items-start gap-3 rounded-r-lg px-4 py-3.5`}>
      {icons[type]}
      <div className="text-sm text-neutral-content leading-relaxed">{children}</div>
    </div>
  );
}
