"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Portal } from "@/components/primitives/Portal";
import { NoteIcon } from "@/components/notes/NoteIcons";
import { IconButton } from "@/components/chrome/IconButton";
import { searchContent as copy } from "@/content/search";
import { searchEntries, type SearchEntry } from "@/lib/search";
import { playInterfaceSound } from "@/lib/interface-sound";

const SearchContext = createContext<() => void>(() => {});
let cached: Promise<SearchEntry[]> | undefined;
function loadIndex() {
  cached ??= Promise.all([
    import("@/lib/search-index"),
    fetch("/notes-search.json").then((response) => {
      if (!response.ok) throw new Error("Search index unavailable");
      return response.json() as Promise<SearchEntry[]>;
    }),
  ]).then(([site, notes]) => [...site.siteSearchEntries, ...notes]).catch((error) => { cached = undefined; throw error; });
  return cached;
}

export function SearchTrigger() {
  const open = useContext(SearchContext);
  return <IconButton label={copy.label} title={`${copy.label} (⌘K / Ctrl K)`} onClick={() => { open(); playInterfaceSound("tap"); }}><NoteIcon kind="search" /></IconButton>;
}

export function SiteSearch({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !event.altKey && !event.isComposing) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return <SearchContext.Provider value={() => setOpen(true)}>
    {children}
    {open && <Portal><SearchDialog onClose={() => setOpen(false)} /></Portal>}
  </SearchContext.Provider>;
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchEntries(entries, query), [entries, query]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    input.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => { if (previous?.isConnected) previous.focus({ preventScroll: true }); });
    };
  }, []);
  useEffect(() => {
    let alive = true;
    loadIndex().then((data) => { if (alive) { setEntries(data); setStatus("ready"); } }, () => { if (alive) setStatus("error"); });
    return () => { alive = false; };
  }, [attempt]);
  useEffect(() => { document.getElementById(`search-result-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active]);
  return <dialog ref={dialog} className="site-search" aria-label={copy.label}
    onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={onClose}
    onKeyDown={(event) => {
      // A drawer or lightbox underneath must not handle search's arrows/Escape.
      if (!((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) event.stopPropagation();
      if (event.key === "Tab") {
        const controls = event.currentTarget.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled]), [tabindex="0"]');
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className="search-input-row"><NoteIcon kind="search" />
      <input ref={input} type="text" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="search-results"
        aria-activedescendant={results[active] ? `search-result-${active}` : undefined}
        aria-label={copy.label} placeholder={copy.placeholder} autoComplete="off" spellCheck={false}
        value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => results.length ? (index + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length : 0);
          }
          if (event.key === "Enter" && results[active]) { event.preventDefault(); document.getElementById(`search-result-${active}`)?.click(); }
        }} />
      <button type="button" className="search-close" aria-label={copy.close} onClick={onClose}>esc</button>
    </div>
    <div className="search-scroll">
      <p className="search-section-label">{query ? copy.results : copy.suggestions}<span aria-live="polite">{status === "ready" ? results.length : ""}</span></p>
      <div id="search-results" role="listbox" aria-label={copy.results} aria-busy={status === "loading"}>
        {results.map((entry, index) => <a key={entry.href} id={`search-result-${index}`} href={entry.href}
          role="option" aria-selected={index === active} tabIndex={-1} target={entry.newTab ? "_blank" : undefined} rel={entry.newTab ? "noopener noreferrer" : undefined}
          className="search-result" onMouseEnter={() => setActive(index)} onClick={() => { playInterfaceSound("tap"); onClose(); }}>
          <NoteIcon kind={entry.section === "Notes" ? "file" : "chevron"} />
          <span className="search-result-text"><span>{entry.title}</span>{entry.detail && <small>{entry.detail}</small>}</span>
          <span className="search-result-section">{entry.section}</span><span className="search-result-enter" aria-hidden="true">↵</span>
        </a>)}
      </div>
      {status !== "ready" || !results.length ? <div className="search-message" role="status">
        {status === "loading" ? copy.loading : status === "error" ? copy.error : copy.empty}
        {status === "error" && <button type="button" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}>{copy.retry}</button>}
      </div> : null}
    </div>
    <footer className="search-footer"><span><kbd>↑</kbd><kbd>↓</kbd> {copy.navigate}</span><span><kbd>↵</kbd> {copy.open}</span><span><kbd>esc</kbd> {copy.dismiss}</span></footer>
  </dialog>;
}
