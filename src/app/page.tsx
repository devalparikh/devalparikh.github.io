import { PageFrame } from "@/components/chrome/PageFrame";
import { Hero } from "@/components/home/Hero";
import { PhotoPeek } from "@/components/home/PhotoPeek";
import { PreviewList } from "@/components/home/PreviewList";
import { Reveal } from "@/components/primitives/Reveal";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { writing } from "@/content/writing";
import { galleryPhotos, heroPhoto } from "@/lib/photos";

/** How many photographs the home page's Preview window holds. */
const PEEK_COUNT = 7;

export default function HomePage() {
  const photos = heroPhoto ? [heroPhoto, ...galleryPhotos] : galleryPhotos;

  return (
    <PageFrame hero={<Hero />}>
      <Reveal onScroll as="section">
        <p className="kicker">currently</p>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed">{site.blurb}</p>
      </Reveal>

      <PreviewList collection={experience} href="/experience" index={0} />
      <PreviewList collection={projects} href="/projects" index={0} />
      <PreviewList collection={writing} href="/writing" index={0} />
      <PhotoPeek photos={photos.slice(0, PEEK_COUNT)} total={photos.length} />
    </PageFrame>
  );
}
