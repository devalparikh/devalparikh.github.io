"use client";

import {
  applyTheme,
  DARK_THEME,
  LIGHT_THEME,
  readStoredTheme,
  systemTheme,
  writeStoredTheme,
  type Theme,
} from "./theme";

const THEME_CHANGE_EVENT = "deval:theme-change";

/**
 * The theme lives outside React - in localStorage, on the `<html>` element and
 * in the OS preference - so components read it through `useSyncExternalStore`
 * rather than mirroring it into state.
 */
export function subscribeToTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  media.addEventListener("change", onChange);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** An explicit choice wins; otherwise the site keeps following the system. */
export function getThemeSnapshot(): Theme {
  return readStoredTheme() ?? systemTheme();
}

/** Server and first client render agree on the light theme; the pre-paint
 *  bootstrap script has already set the real one on `<html>`. */
export function getThemeServerSnapshot(): Theme {
  return LIGHT_THEME;
}

export function setTheme(theme: Theme) {
  writeStoredTheme(theme);
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function nextTheme(current: Theme): Theme {
  return current === DARK_THEME ? LIGHT_THEME : DARK_THEME;
}
