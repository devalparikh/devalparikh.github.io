import { studio } from "@/content/studio";

/** Repeats per run; enough that one run outspans the widest screen. */
const REPEATS = 4;

/**
 * "STUDIO DEVAL" on an endless loop behind the Preview window, repeat after
 * repeat with only a slight gap between them. Pure CSS: two identical runs
 * slide left by one run's width, then start over unseen.
 */
export function StudioBanner() {
  const text = studio.title.join(" ");

  return (
    <div className="studio-banner" aria-hidden="true">
      <div className="studio-banner-track">
        {[0, 1].map((run) => (
          <div key={run} className="studio-banner-run">
            {Array.from({ length: REPEATS }, (_, i) => (
              <span key={i}>{text}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
