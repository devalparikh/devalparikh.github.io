import { site, socials } from "@/content/site";
import { ExternalIcon } from "@/components/primitives/ExternalIcon";
import { SmartLink } from "@/components/primitives/SmartLink";

export function Footer() {
  return (
    <footer className="mx-auto mt-24 max-w-3xl px-5 pb-16 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--rule)] pt-6">
        <p className="text-xs text-neutral-content">
          © {new Date().getFullYear()} {site.name}
        </p>

        <ul className="flex flex-wrap items-center gap-4">
          {socials.map((social) => (
            <li key={social.id}>
              <SmartLink
                href={social.href}
                className="inline-flex items-center gap-1 text-xs text-neutral-content transition-colors duration-150 hover:text-primary"
              >
                {social.label}
                {social.external && <ExternalIcon />}
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
