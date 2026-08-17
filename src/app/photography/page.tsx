import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { Gallery } from "@/components/photography/Gallery";
import { PhotoFrame } from "@/components/photography/PhotoFrame";
import { PageHeader } from "@/components/primitives/PageHeader";
import { Reveal } from "@/components/primitives/Reveal";
import { galleryPhotos, heroPhoto } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Photography",
  description: "Photographs by Deval Parikh.",
};

export default function PhotographyPage() {
  return (
    <PageFrame>
      <PageHeader title="Photography" description="Frames worth keeping." />

      {heroPhoto && (
        <Reveal index={2} className="mt-9">
          <PhotoFrame photo={heroPhoto} priority className="max-h-[68vh]" />
        </Reveal>
      )}

      <div className="mt-12">
        <Gallery photos={galleryPhotos} />
      </div>
    </PageFrame>
  );
}
