"use client";

import { socials } from "@/content/site";
import { socialIcons } from "@/components/primitives/icons";
import { playInterfaceSound } from "@/lib/interface-sound";

export function SocialRow() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
      {socials.map((social) => {
        const Icon = socialIcons[social.id];

        return (
          <li key={social.id}>
            <a
              href={social.href}
              target={social.external ? "_blank" : undefined}
              rel={social.external ? "noopener noreferrer" : undefined}
              onClick={() => playInterfaceSound("tap")}
              className="group inline-flex items-center gap-1.5 rounded text-[0.8rem] text-neutral-content transition-colors duration-200 hover:text-primary"
            >
              {Icon && (
                <Icon className="size-[15px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5" />
              )}
              {social.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
