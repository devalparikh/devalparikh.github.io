import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { PageHeader } from "@/components/primitives/PageHeader";
import { OpenResume } from "@/components/resume/OpenResume";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `${site.name}'s resume.`,
};

// The embedded page is preserved in ResumePreview.tsx.disabled.
export default function ResumePage() {
  return (
    <PageFrame>
      <PageHeader title="Resume" />
      <OpenResume />
    </PageFrame>
  );
}
