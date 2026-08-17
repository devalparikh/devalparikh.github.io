"use client";

import { setInterfaceSoundEnabled } from "./interface-sound";

const STORAGE_KEY = "deval-sound-enabled";
const CHANGE_EVENT = "deval:interface-sound-change";

/** Sounds are on unless the visitor has turned them off. */
export const SOUND_ENABLED_BY_DEFAULT = true;

function read(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? SOUND_ENABLED_BY_DEFAULT : stored === "true";
  } catch {
    return SOUND_ENABLED_BY_DEFAULT;
  }
}

export function subscribeToSoundPreference(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Reading the preference is also what arms the audio engine, so the very first
 * click plays at the right setting without an extra effect to sync them.
 */
export function getSoundSnapshot(): boolean {
  const enabled = read();
  setInterfaceSoundEnabled(enabled);
  return enabled;
}

export function getSoundServerSnapshot(): boolean {
  return SOUND_ENABLED_BY_DEFAULT;
}

export function setSoundEnabled(next: boolean) {
  setInterfaceSoundEnabled(next);

  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // The in-memory preference still applies for this session.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}
