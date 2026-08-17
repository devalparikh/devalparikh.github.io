import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { CollectionView } from "@/components/collection/CollectionView";
import { PageHeader } from "@/components/primitives/PageHeader";
import { writing } from "@/content/writing";

export const metadata: Metadata = {
  title: writing.title,
  description: writing.description,
};

export default function WritingPage() {
  return (
    <PageFrame>
      <PageHeader title={writing.title} description={writing.description} />
      <CollectionView collection={writing} />
    </PageFrame>
  );
}
