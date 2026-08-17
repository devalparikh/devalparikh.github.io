import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { PageHeader } from "@/components/primitives/PageHeader";
import { Reveal } from "@/components/primitives/Reveal";
import { ExternalIcon } from "@/components/primitives/ExternalIcon";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `${site.name}'s resume.`,
};

export default function ResumePage() {
  return (
    <PageFrame>
      <PageHeader title="Resume" />

      <Reveal index={2} className="mt-7">
        <a
          href={site.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm underline decoration-[color-mix(in_oklab,currentColor_28%,transparent)] underline-offset-4 transition-colors duration-150 hover:text-primary hover:decoration-current"
        >
          Open the PDF
          <ExternalIcon />
        </a>
      </Reveal>

      <Reveal index={3} className="mt-8">
        <object
          data={site.resume}
          type="application/pdf"
          aria-label={`${site.name} resume`}
          className="h-[min(78vh,900px)] w-full rounded-lg border border-[var(--rule)] bg-base-200"
        >
          <p className="p-6 text-sm text-neutral-content">
            Your browser cannot display PDFs inline -{" "}
            <a href={site.resume} className="underline underline-offset-4">
              download the resume
            </a>{" "}
            instead.
          </p>
        </object>
      </Reveal>
    </PageFrame>
  );
}
