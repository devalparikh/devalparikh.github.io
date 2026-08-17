import { GlobeHalftone } from "./GlobeHalftone";
import { Reveal } from "@/components/primitives/Reveal";
import { site } from "@/content/site";
import { SocialRow } from "./SocialRow";

export function Hero() {
  return (
    <section className="hero">
      {/* Sits behind the copy and is clipped by the section, so only the top of
          the globe shows, rising from the bottom edge to the middle. */}
      <div className="hero-globe" aria-hidden="true">
        <GlobeHalftone className="hero-globe-canvas" />
      </div>

      <div className="hero-content">
        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:justify-center sm:gap-10 sm:text-left">
          <Reveal index={0} className="shrink-0">
            <figure className="polaroid w-[124px] sm:w-[136px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.portrait.src} alt={site.portrait.alt} width={272} height={272} />
              <figcaption>{site.portrait.caption}</figcaption>
            </figure>
          </Reveal>

          <div className="hero-plate max-w-md">
            <Reveal index={1}>
              <h1 className="display text-[2.1rem] sm:text-[2.6rem]">{site.name}</h1>
            </Reveal>

            <Reveal index={2}>
              <p className="kicker kicker-lead mt-3">{site.role}</p>
            </Reveal>

            <Reveal index={3}>
              <p className="lede mt-4 text-[0.9rem]">{site.tagline}</p>
            </Reveal>

            <Reveal index={4} className="mt-5">
              <SocialRow />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
