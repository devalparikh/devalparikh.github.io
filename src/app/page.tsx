import { PageFrame } from "@/components/chrome/PageFrame";
import { Hero } from "@/components/home/Hero";
import { PreviewList } from "@/components/home/PreviewList";
import { Reveal } from "@/components/primitives/Reveal";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { writing } from "@/content/writing";

export default function HomePage() {
  return (
    <PageFrame hero={<Hero />}>
      <Reveal onScroll as="section">
        <p className="kicker">Now</p>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed">{site.blurb}</p>
      </Reveal>

      <PreviewList collection={experience} href="/experience" index={0} />
      <PreviewList collection={projects} href="/projects" index={0} />
      <PreviewList collection={writing} href="/writing" index={0} />
    </PageFrame>
  );
}
