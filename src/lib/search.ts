export interface SearchEntry {
  title: string;
  href: string;
  section: string;
  detail?: string;
  text: string;
  newTab?: boolean;
}

export function searchEntries(entries: SearchEntry[], query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return entries.filter((entry) => entry.section === "Pages");
  return entries.map((entry) => {
    const title = entry.title.toLowerCase();
    const context = `${entry.section} ${entry.detail ?? ""}`.toLowerCase();
    const text = `${title} ${context} ${entry.text}`.toLowerCase();
    if (!words.every((word) => text.includes(word))) return { entry, score: 0 };
    const exact = title === query.toLowerCase().trim() ? 100 : 0;
    const score = exact + words.reduce((sum, word) => sum + (title.startsWith(word) ? 20 : title.includes(word) ? 12 : context.includes(word) ? 5 : 1), 0);
    return { entry, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title)).slice(0, 30).map(({ entry }) => entry);
}
