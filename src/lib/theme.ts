/**
 * Theme resolution.
 *
 * The site ships two DaisyUI themes and follows the operating system until the
 * visitor makes an explicit choice. Once they do, the choice is stored and the
 * system preference is ignored — clearing storage returns to following it.
 */

export const THEMES = ["parchment", "inkember"] as const;

export type Theme = (typeof THEMES)[number];

export const LIGHT_THEME: Theme = "parchment";
export const DARK_THEME: Theme = "inkember";

export const THEME_STORAGE_KEY = "deval-theme";

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && THEMES.includes(value as Theme);
}

export function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writeStoredTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage is optional; the in-memory attribute still drives the UI.
  }
}

export function systemTheme(): Theme {
  return typeof window !== "undefined"
    && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_THEME
    : LIGHT_THEME;
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme === DARK_THEME ? "dark" : "light";
}

/**
 * Runs before first paint so the correct theme is painted on the very first
 * frame. Kept dependency-free and inlined into the document head.
 */
export const themeBootstrapScript = `(function(){try{
var s=localStorage.getItem("${THEME_STORAGE_KEY}");
var t=(s==="${LIGHT_THEME}"||s==="${DARK_THEME}")?s:(matchMedia("(prefers-color-scheme: dark)").matches?"${DARK_THEME}":"${LIGHT_THEME}");
document.documentElement.setAttribute("data-theme",t);
document.documentElement.style.colorScheme=t==="${DARK_THEME}"?"dark":"light";
}catch(e){}})();`;
