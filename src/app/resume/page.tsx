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

/**
 * PDF open parameters. `navpanes`/`pagemode` close the side panel in Acrobat
 * and Edge; Chrome ignores both, so `toolbar=0` is what actually hides its
 * thumbnail rail. The "Open the PDF" link above covers the controls that
 * removes. `view=Fit` scales the page to the frame instead of opening at 100%.
 */
const VIEWER_PARAMS =
  "#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&pagemode=none&view=Fit";

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
          data={`${site.resume}${VIEWER_PARAMS}`}
          type="application/pdf"
          aria-label={`${site.name} resume`}
          className="mx-auto block h-[min(85vh,1000px)] w-auto max-w-full rounded-lg border border-[var(--rule)] bg-base-200 [aspect-ratio:8.5/11]"
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
