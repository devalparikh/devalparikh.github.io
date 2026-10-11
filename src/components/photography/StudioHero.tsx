import { stickers, studio } from "@/content/studio";
import type { Photo } from "@/lib/photos";
import { PhotoTrail } from "./PhotoTrail";
import { StudioPills } from "./StudioPills";

/** Delay between letters of the title as they rise into place. */
const LETTER_STEP_MS = 40;

interface StudioHeroProps {
  photos: Photo[];
  /** One line on the cameras the photographs were made with. */
  gearLine: string;
}

/**
 * "STUDIO DEVAL" set huge in bold Helvetica, with a trail of small polaroids
 * that pop up under the cursor and fall away as it moves.
 */
export function StudioHero({ photos, gearLine }: StudioHeroProps) {
  let letterIndex = 0;

  return (
    <section className="studio-hero">
      <PhotoTrail photos={photos} stickers={stickers} />

      <p className="studio-label">
        <span>{studio.label}</span>
      </p>

      <h1 className="studio-title" aria-label={studio.title.join(" ")}>
        {studio.title.map((word) => (
          <span key={word} className="studio-title-word" aria-hidden="true">
            {[...word].map((letter, i) => (
              <span
                key={i}
                className="studio-letter"
                style={{ "--letter-delay": `${letterIndex++ * LETTER_STEP_MS}ms` } as React.CSSProperties}
              >
                {letter}
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div className="studio-hero-foot">
        <p className="studio-intro">
          {photos.length} frames. <strong>{gearLine}</strong>
        </p>
        <StudioPills />
      </div>

      <p className="studio-scroll-cue" aria-hidden="true">
        <span>Scroll to</span>
        <span className="studio-scroll-rule" />
        <span>Discover more</span>
      </p>
    </section>
  );
}
