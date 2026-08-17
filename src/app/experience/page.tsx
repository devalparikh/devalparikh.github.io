import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { CollectionView } from "@/components/collection/CollectionView";
import { PageHeader } from "@/components/primitives/PageHeader";
import { experience } from "@/content/experience";

export const metadata: Metadata = {
  title: experience.title,
  description: experience.description,
};

export default function ExperiencePage() {
  return (
    <PageFrame>
      <PageHeader title={experience.title} description={experience.description} />
      <CollectionView collection={experience} />
    </PageFrame>
  );
}
