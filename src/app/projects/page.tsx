import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { CollectionView } from "@/components/collection/CollectionView";
import { PageHeader } from "@/components/primitives/PageHeader";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: projects.title,
  description: projects.description,
};

export default function ProjectsPage() {
  return (
    <PageFrame>
      <PageHeader title={projects.title} description={projects.description} />
      <CollectionView collection={projects} />
    </PageFrame>
  );
}
