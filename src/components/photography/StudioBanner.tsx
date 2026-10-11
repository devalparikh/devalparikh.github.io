import { studio } from "@/content/studio";

/** Repeats per run; enough that one run outspans the widest screen. */
const REPEATS = 3;

/**
 * "STUDIO DEVAL" on an endless loop behind the Preview window. Pure CSS: two
 * identical runs slide left by one run's width, then start over unseen.
 */
export function StudioBanner() {
  const text = studio.title.join(" ");

  return (
    <div className="studio-banner" aria-hidden="true">
      <div className="studio-banner-track">
        {[0, 1].map((run) => (
          <div key={run} className="studio-banner-run">
            {Array.from({ length: REPEATS }, (_, i) => (
              <span key={i} className="contents">
                <span>{text}</span>
                <Starburst />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A twelve-point burst between repeats, after the one on Karo's banner. */
function Starburst() {
  const points = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? 50 : 19;
    return `${(50 + radius * Math.cos(angle)).toFixed(2)},${(50 + radius * Math.sin(angle)).toFixed(2)}`;
  });

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <polygon points={points.join(" ")} fill="currentColor" />
    </svg>
  );
}
