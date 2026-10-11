import { navItems } from "@/content/nav";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import { writing } from "@/content/writing";
import { hasDetail } from "@/components/collection/entry-helpers";
import type { SearchEntry } from "./search";

// Loaded on demand with the note-text JSON, never the note HTML or vault.
export const siteSearchEntries: SearchEntry[] = [
  ...navItems.map((item) => ({ title: item.label, href: item.destination ?? item.href, section: "Pages", text: item.label, newTab: item.newTab })),
  ...[projects, experience, writing].flatMap((collection) => collection.entries.map((entry) => ({
    title: entry.title,
    href: hasDetail(entry) ? `/${collection.id}/#${entry.id}` : entry.href ?? `/${collection.id}/`,
    section: collection.title,
    detail: entry.subtitle ?? entry.summary ?? entry.badge,
    text: [entry.subtitle, entry.summary, entry.tags?.join(" "), entry.highlights?.join(" "), ...entry.sections?.map((section) => `${section.heading} ${section.body ?? ""} ${section.bullets?.join(" ") ?? ""}`) ?? []].filter(Boolean).join(" "),
    newTab: !hasDetail(entry) && !!entry.href?.startsWith("http"),
  }))),
];
