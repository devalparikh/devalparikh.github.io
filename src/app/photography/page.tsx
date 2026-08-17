import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { Gallery } from "@/components/photography/Gallery";
import { PhotoFrame } from "@/components/photography/PhotoFrame";
import { PageHeader } from "@/components/primitives/PageHeader";
import { Reveal } from "@/components/primitives/Reveal";
import { galleryPhotos, getCameraGear, heroPhoto } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Photography",
  description: "Photographs by Deval Parikh.",
};

export default function PhotographyPage() {
  const gear = getCameraGear();

  return (
    <PageFrame>
      <PageHeader title="Photography" />

      {heroPhoto && (
        <Reveal index={1} className="mt-9">
          <PhotoFrame photo={heroPhoto} priority className="max-h-[68vh]" />
        </Reveal>
      )}

      <div className="mt-12">
        <Gallery photos={galleryPhotos} />
      </div>

      {gear.length > 0 && (
        <Reveal onScroll as="section" className="mt-16 border-t border-[var(--rule)] pt-7">
          <h2 className="kicker">Gear</h2>

          <ul className="mt-4 grid gap-2.5">
            {gear.map((item) => (
              <li key={item.camera} className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-sm text-base-content">{item.camera}</span>
                {item.lenses.map((lens) => (
                  <span key={lens} className="font-mono text-[0.68rem] text-neutral-content">
                    {lens}
                  </span>
                ))}
                <span className="ml-auto font-mono text-[0.62rem] tabular-nums text-neutral-content/70">
                  {item.frames} {item.frames === 1 ? "frame" : "frames"}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </PageFrame>
  );
}
