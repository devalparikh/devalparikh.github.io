"use client";

import { useSyncExternalStore } from "react";
import { playInterfaceSound } from "@/lib/interface-sound";
import {
  getSoundServerSnapshot,
  getSoundSnapshot,
  setSoundEnabled,
  subscribeToSoundPreference,
} from "@/lib/sound-preference";
import { IconButton } from "./IconButton";

export function SoundToggle() {
  const enabled = useSyncExternalStore(
    subscribeToSoundPreference,
    getSoundSnapshot,
    getSoundServerSnapshot,
  );

  return (
    <IconButton
      pressed={enabled}
      label={enabled ? "Turn interface sounds off" : "Turn interface sounds on"}
      title={enabled ? "Interface sounds on" : "Interface sounds off"}
      onClick={() => {
        setSoundEnabled(!enabled);
        if (!enabled) playInterfaceSound("ready");
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6.8 8.5H4v7h2.8L11 19V5Z" />
        {enabled ? (
          <>
            <path d="M15 9.2a4 4 0 0 1 0 5.6" />
            <path d="M17.7 6.7a7.4 7.4 0 0 1 0 10.6" />
          </>
        ) : (
          <path d="m15.2 10.2 4 4m0-4-4 4" />
        )}
      </svg>
    </IconButton>
  );
}
