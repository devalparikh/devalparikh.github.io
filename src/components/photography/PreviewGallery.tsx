"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import clsx from "clsx";
import { playInterfaceSound } from "@/lib/interface-sound";
import { cameraName, formatExifLine, formatTakenAt, lensName, type Photo } from "@/lib/photos";
import {
  onStudioViewRequest,
  readHashView,
  subscribeToHash,
  type StudioView,
} from "@/lib/studio-view";
import { Lightbox } from "./Lightbox";
import { ExpandIcon, GridIcon, InfoIcon, SidebarIcon, SingleIcon } from "./PreviewIcons";

const SWIPE_THRESHOLD_PX = 48;

/**
 * The photography page's gallery, framed as a macOS Preview window.
 *
 * - Preview view: a thumbnail sidebar (a filmstrip under 640px) and the photo
 *   on a stage. The stage opens the full-screen lightbox; it swipes on touch.
 * - Grid view: a contact sheet of every frame. Picking one opens it in the
 *   Preview view.
 * - The (i) button floats an Inspector over the window, as Preview does, with
 *   the file and the camera, lens and exposure it was made with.
 */
export function PreviewGallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  // A view picked in the window or by the hero's pills wins; until then a
  // `#grid` / `#preview` fragment decides, and the Preview view is the default.
  const [chosenView, setView] = useState<StudioView | null>(null);
  const hashView = useSyncExternalStore(subscribeToHash, readHashView, () => null);
  const view = chosenView ?? hashView ?? "preview";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  const windowRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => onStudioViewRequest(setView), []);

  if (photos.length === 0) return null;
  const photo = photos[index];

  const select = (next: number) => {
    const wrapped = (next + photos.length) % photos.length;
    if (wrapped === index) return;
    setIndex(wrapped);
    playInterfaceSound("tap");
  };

  const switchView = (next: StudioView) => {
    if (next === view) return;
    setView(next);
    playInterfaceSound("toggle");
  };

  const markLoaded = (id: string) => {
    setLoaded((state) => (state[id] ? state : { ...state, [id]: true }));
  };

  // Arrow keys step through the photos from anywhere in the window.
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && infoOpen) {
      setInfoOpen(false);
      return;
    }
    if (view !== "preview") return;
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + photos.length) % photos.length;
    select(next);
    // Keep focus on the matching thumbnail when the sidebar had it.
    if ((event.target as HTMLElement).getAttribute("role") === "tab") {
      tabsRef.current[next]?.focus();
    }
  };

  const title = view === "grid" ? "Studio Deval" : `${photo.alt}.webp`;
  const subtitle =
    view === "grid"
      ? `${photos.length} photographs`
      : formatExifLine(photo.exif) || `${photo.width} × ${photo.height}`;

  return (
    <section id="gallery" className="studio-gallery" aria-label="Photographs">
      {/* Fragment targets: they scroll the window into view under the nav. */}
      <span id="preview" className="studio-anchor" />
      <span id="grid" className="studio-anchor" />

      <div
        ref={windowRef}
        className="pv-window"
        data-view={view}
        data-sidebar={sidebarOpen}
        onKeyDown={onKeyDown}
      >
        <div className="pv-titlebar">
          <span className="pv-lights" aria-hidden="true">
            <i data-light="close" />
            <i data-light="minimize" />
            <i data-light="zoom" />
          </span>

          <ToolButton
            label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            pressed={sidebarOpen}
            disabled={view === "grid"}
            className="pv-desktop-only"
            onClick={() => {
              setSidebarOpen((open) => !open);
              playInterfaceSound("toggle");
            }}
          >
            <SidebarIcon />
          </ToolButton>

          <div className="pv-title">
            <span className="pv-filename">{title}</span>
            <span className="pv-subtitle">{subtitle}</span>
          </div>

          <div className="pv-tools">
            <div className="pv-segmented" role="group" aria-label="View">
              <ToolButton
                label="Preview"
                pressed={view === "preview"}
                onClick={() => switchView("preview")}
              >
                <SingleIcon />
              </ToolButton>
              <ToolButton label="Grid" pressed={view === "grid"} onClick={() => switchView("grid")}>
                <GridIcon />
              </ToolButton>
            </div>

            <ToolButton
              label={infoOpen ? "Hide info" : "Show info"}
              pressed={infoOpen}
              onClick={() => {
                setInfoOpen((open) => !open);
                playInterfaceSound("toggle");
              }}
            >
              <InfoIcon />
            </ToolButton>

            <ToolButton
              label="View full screen"
              onClick={() => {
                setLightboxOpen(true);
                playInterfaceSound("tap");
              }}
            >
              <ExpandIcon />
            </ToolButton>
          </div>
        </div>

        {view === "preview" ? (
          <div className="pv-body">
            <div
              role="tablist"
              aria-label="Photographs"
              aria-orientation="vertical"
              className="pv-sidebar"
            >
              {photos.map((item, i) => (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabsRef.current[i] = node;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={item.alt}
                  tabIndex={i === index ? 0 : -1}
                  onClick={() => select(i)}
                  className="pv-thumb"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumb}
                    alt=""
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                    style={{ aspectRatio: `${item.width} / ${item.height}` }}
                  />
                  <span className="pv-thumb-index">{i + 1}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              role="tabpanel"
              aria-label={`${photo.alt} - view full screen`}
              className="pv-stage"
              onClick={() => {
                setLightboxOpen(true);
                playInterfaceSound("tap");
              }}
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0].clientX;
              }}
              onTouchEnd={(event) => {
                const start = touchStartX.current;
                touchStartX.current = null;
                if (start === null) return;
                const delta = event.changedTouches[0].clientX - start;
                if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
                  // A swipe is not a tap: keep it from opening the lightbox.
                  event.preventDefault();
                  select(index + (delta < 0 ? 1 : -1));
                }
              }}
            >
              <span
                className="pv-photo"
                style={{
                  aspectRatio: `${photo.width} / ${photo.height}`,
                  backgroundImage: `url(${photo.placeholder})`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={photo.id}
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  decoding="async"
                  ref={(node) => {
                    // A cached file can finish before React attaches onLoad.
                    if (node?.complete) markLoaded(photo.id);
                  }}
                  onLoad={() => markLoaded(photo.id)}
                  className={clsx(loaded[photo.id] ? "opacity-100" : "opacity-0")}
                />
              </span>
            </button>
          </div>
        ) : (
          <ul className="pv-grid">
            {photos.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-label={`Open ${item.alt}`}
                  aria-current={i === index ? "true" : undefined}
                  className="pv-tile"
                  onClick={() => {
                    setIndex(i);
                    setView("preview");
                    playInterfaceSound("tap");
                    windowRef.current?.scrollIntoView({ block: "start" });
                    // The tile unmounts with the grid; hand focus to its
                    // thumbnail so the arrow keys keep working.
                    requestAnimationFrame(() => tabsRef.current[i]?.focus({ preventScroll: true }));
                  }}
                >
                  <span
                    className="pv-tile-frame"
                    style={{
                      aspectRatio: `${item.width} / ${item.height}`,
                      backgroundImage: `url(${item.placeholder})`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumb} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="pv-tile-name">{item.alt}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {infoOpen && <Inspector photo={photo} onClose={() => setInfoOpen(false)} />}
      </div>

      {lightboxOpen && (
        <Lightbox photos={photos} startIndex={index} onClose={() => setLightboxOpen(false)} />
      )}
    </section>
  );
}

function ToolButton({
  label,
  pressed,
  disabled,
  className,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  className?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={clsx("pv-tool", className)}
    >
      {children}
    </button>
  );
}

/**
 * Preview's Inspector: a small floating panel over the window with the file
 * and how the frame was made. Rows with nothing to say are left out.
 */
function Inspector({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  const exif = photo.exif;
  const general: [string, string | undefined][] = [
    ["Name", `${photo.alt}.webp`],
    ["Dimensions", `${photo.width} × ${photo.height}`],
    ["Size", photo.outputBytes ? `${Math.round(photo.outputBytes / 1024)} KB` : undefined],
    ["Taken", formatTakenAt(exif)],
  ];
  const capture: [string, string | undefined][] = [
    ["Camera", exif?.camera ? cameraName(exif.camera) : undefined],
    ["Lens", exif ? lensName(exif) : undefined],
    ["Focal length", exif?.focalLength],
    ["Aperture", exif?.aperture],
    ["Shutter", exif?.shutter],
    ["ISO", exif?.iso?.replace(/^ISO\s*/, "")],
  ];

  return (
    <aside className="pv-inspector" aria-label={`${photo.alt} info`}>
      <div className="pv-inspector-bar">
        <button type="button" aria-label="Close info" className="pv-inspector-close" onClick={onClose}>
          <i data-light="close" />
        </button>
        <span>{photo.alt} Info</span>
      </div>

      <InspectorGroup title="General" rows={general} />
      <InspectorGroup title="Exif" rows={capture} />
    </aside>
  );
}

function InspectorGroup({ title, rows }: { title: string; rows: [string, string | undefined][] }) {
  const present = rows.filter((row): row is [string, string] => Boolean(row[1]));
  if (present.length === 0) return null;

  return (
    <div className="pv-inspector-group">
      <p className="pv-inspector-heading">{title}</p>
      <dl>
        {present.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
