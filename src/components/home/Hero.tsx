import { GlobeHalftone } from "./GlobeHalftone";
import { HeroStage } from "./HeroStage";
import { Reveal } from "@/components/primitives/Reveal";
import { site } from "@/content/site";
import { SocialRow } from "./SocialRow";

/** Delay between letters of the name as they rise into place. */
const LETTER_STEP_MS = 45;

export function Hero() {
  const [first, ...rest] = site.name.split(" ");
  const lines = [first, rest.join(" ")];
  const letterCount = lines.join("").length;
  // Fixed at build time, which is when a static export is made.
  const year = new Date().getFullYear();

  return (
    <HeroStage>
      {/* Fixed behind the whole page: it starts large behind the name and,
          as the hero scrolls away, settles back and keeps turning behind the
          content. Positioned entirely by `--hero-progress` in CSS. */}
      <div className="globe-backdrop" aria-hidden="true">
        <GlobeHalftone className="globe-backdrop-canvas" />
      </div>

      <section className="hero">
        <div className="hero-inner">
          <Reveal index={0} className="hero-masthead kicker">
            {site.mastheadLabels.map((label) => (
              <span key={label}>[ {label} ]</span>
            ))}
            <span className="ml-auto hidden sm:inline">[ {year} ]</span>
          </Reveal>

          <h1 className="hero-name" aria-label={site.name}>
            {/* Painted first and wholly beneath the letters: a thick stroke in
                the page colour that knocks the dot field back from the
                letterforms. As a separate layer it never paints over a
                neighbouring letter, which a per-letter stroke would. */}
            <HeroName lines={lines} className="hero-name-halo" />
            <HeroName lines={lines} portrait />
          </h1>

          <div
            className="hero-rule"
            style={{ "--rule-delay": `${letterCount * LETTER_STEP_MS + 200}ms` } as React.CSSProperties}
          />

          <div className="hero-foot">
            <Reveal index={6}>
              <p className="lede hero-lede">{site.tagline}</p>
            </Reveal>
            <Reveal index={7} className="sm:justify-self-end">
              <SocialRow />
            </Reveal>
          </div>
        </div>
      </section>
    </HeroStage>
  );
}

/**
 * The name, one masked line at a time with each letter rising out of the
 * line's mask. Pure CSS from server-rendered markup, so it plays on first
 * paint with no JavaScript.
 */
function HeroName({
  lines,
  className,
  portrait = false,
}: {
  lines: string[];
  className?: string;
  portrait?: boolean;
}) {
  let letterIndex = 0;

  return (
    <span className={className ?? "hero-name-fill"} aria-hidden="true">
      {lines.map((line, lineIndex) => (
        <span key={line} className="hero-line" data-line={lineIndex}>
          <span className="hero-line-mask">
            {[...line].map((letter, i) => {
              const delay = letterIndex++ * LETTER_STEP_MS;
              return (
                <span
                  key={i}
                  className="hero-letter"
                  style={{ "--letter-delay": `${delay}ms` } as React.CSSProperties}
                >
                  {letter === " " ? " " : letter}
                </span>
              );
            })}
          </span>

          {/* The portrait sits in the first line like an inline plate. The
              halo layer keeps an empty slot of the same size so both layers
              lay out identically. */}
          {lineIndex === 0 && (
            <span className="hero-portrait-slot">
              {portrait && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={site.portrait.src}
                  alt=""
                  width={272}
                  height={272}
                  className="hero-portrait"
                />
              )}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
