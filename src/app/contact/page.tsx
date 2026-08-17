import type { Metadata } from "next";
import { PageFrame } from "@/components/chrome/PageFrame";
import { PageHeader } from "@/components/primitives/PageHeader";
import { Reveal } from "@/components/primitives/Reveal";
import { socialIcons } from "@/components/primitives/icons";
import { socials } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ways to get in touch with Deval Parikh.",
};

export default function ContactPage() {
  return (
    <PageFrame>
      <PageHeader
        title="Contact"
        description="Want to get in touch? Reach out through any of the links below."
      />

      <Reveal index={2} className="mt-9">
        <ul className="row-list">
          {socials.map((social) => {
            const Icon = socialIcons[social.id];

            return (
              <li key={social.id}>
                <a
                  href={social.href}
                  target={social.external ? "_blank" : undefined}
                  rel={social.external ? "noopener noreferrer" : undefined}
                  className="row"
                >
                  <span className="row-caret" aria-hidden="true">
                    ›
                  </span>
                  <span className="flex min-w-0 items-center gap-2.5">
                    {Icon && <Icon className="size-4 shrink-0 text-neutral-content" />}
                    <span className="row-title">{social.label}</span>
                    {social.external && (
                      <span className="row-arrow" aria-hidden="true">
                        ↗
                      </span>
                    )}
                  </span>
                  <span className="row-meta">{social.value}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </Reveal>

      <Reveal index={3} className="mt-10">
        <p className="text-sm text-neutral-content">
          Fastest route is email. I read everything.
        </p>
      </Reveal>
    </PageFrame>
  );
}
