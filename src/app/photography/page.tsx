import type { Metadata } from "next";
import { PreviewGallery } from "@/components/photography/PreviewGallery";
import { StudioBanner } from "@/components/photography/StudioBanner";
import { StudioFrame } from "@/components/photography/StudioFrame";
import { StudioHero } from "@/components/photography/StudioHero";
import { Reveal } from "@/components/primitives/Reveal";
import { galleryPhotos, getCameraGear, heroPhoto } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Photography",
  description: "Studio Deval - photographs by Deval Parikh.",
};

export default function PhotographyPage() {
  const gear = getCameraGear();
  // The `hero` source still leads: it is the first frame in the window.
  const photos = heroPhoto ? [heroPhoto, ...galleryPhotos] : galleryPhotos;
  const gearLine = `Shot on ${new Intl.ListFormat("en", { type: "conjunction" }).format(
    gear.map((item) => item.camera),
  )}.`;

  return (
    <StudioFrame hero={<StudioHero photos={photos} gearLine={gearLine} />}>
      <div className="studio-stage">
        <StudioBanner />
        <Reveal onScroll>
          <PreviewGallery photos={photos} />
        </Reveal>
      </div>

      {gear.length > 0 && (
        <Reveal onScroll as="section" className="studio-gear">
          <h2 id="gear" className="studio-label">
            <span>Gear</span>
          </h2>

          <ul>
            {gear.map((item) => (
              <li key={item.camera}>
                <span className="studio-gear-camera">{item.camera}</span>
                <span className="studio-gear-lenses">{item.lenses.join(", ")}</span>
                <span className="studio-gear-count">
                  {item.frames} {item.frames === 1 ? "frame" : "frames"}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </StudioFrame>
  );
}
