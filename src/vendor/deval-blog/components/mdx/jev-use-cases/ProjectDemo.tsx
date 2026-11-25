"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@blog/hooks/usePrefersReducedMotion";
import { PROJECT_DEMOS, type ProjectId } from "./project-demos";
import styles from "./ProjectDemo.module.css";

export function JevProjectLinks({ project }: { project: ProjectId }) {
  const demo = PROJECT_DEMOS[project];
  return <div className={`not-prose ${styles.links}`} aria-label={`${demo.title} resources`}>
    <a href={demo.original} target="_blank" rel="noreferrer">{demo.originalLabel ?? "Original post"} ↗</a>
    {demo.source ? <a href={demo.source} target="_blank" rel="noreferrer">Source code ↗</a> : <span>Source code not published in the post</span>}
    <a href={`#demo-${project}`}>{demo.video ? "Watch demo ↓" : demo.image ? "View demo ↓" : "Try demo ↓"}</a>
    {demo.website && <a href={demo.website} target="_blank" rel="noreferrer">Creator’s app ↗</a>}
  </div>;
}

export function JevProjectDemo({ project }: { project: ProjectId }) {
  const demo = PROJECT_DEMOS[project];
  const video = useRef<HTMLVideoElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const reduced = usePrefersReducedMotion();
  const clearWait = () => { clearTimeout(timer.current); timer.current = undefined; };
  const fail = () => { clearWait(); video.current?.pause(); setFailed(true); };
  useEffect(() => {
    const media = video.current;
    if (!media) return;
    const pause = () => media.pause();
    const visibility = () => { if (document.hidden) pause(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); });
    observer.observe(media);
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); clearTimeout(timer.current); pause(); };
  }, [attempt, failed]);
  useEffect(() => { if (reduced) video.current?.pause(); }, [reduced]);

  return <figure id={`demo-${project}`} data-project-demo={project} className={`not-prose ${styles.figure}`}>
    <div className={styles.media}>
      {demo.video && !failed ? <video key={attempt} ref={video} src={demo.video} controls playsInline preload="none" poster={demo.image}
        width={demo.width ?? 1280} height={demo.height ?? 720} aria-label={`${demo.title}: original creator demo`}
        onError={fail} onPlaying={clearWait} onCanPlay={clearWait} onPause={clearWait}
        onWaiting={() => { clearWait(); timer.current = setTimeout(fail, 15_000); }}>
        <a href={demo.original}>Watch the original demo</a>
      </video> : demo.image && !imageFailed ? <a href={demo.image} target="_blank" rel="noreferrer" aria-label={`Open ${demo.title} image at full size`}>
        <Image unoptimized src={demo.image} width={demo.width ?? 1280} height={demo.height ?? 720} alt={demo.description} loading="lazy" onError={() => setImageFailed(true)} />
      </a> : <p className={styles.mediaError}>The creator’s image could not load. <a href={demo.original} target="_blank" rel="noreferrer">View the original demo ↗</a></p>}
      {failed && <div className={styles.mediaError} role="status">The recording could not play here. {demo.image && !imageFailed && "The preview is shown above. "}
        <a href={demo.original} target="_blank" rel="noreferrer">Watch at the source ↗</a>
        <button type="button" onClick={() => { setFailed(false); setImageFailed(false); setAttempt(n => n + 1); }}>Retry video</button>
      </div>}
    </div>
    <figcaption>{demo.description} <a href={demo.original} target="_blank" rel="noreferrer">{demo.creator} ↗</a></figcaption>
  </figure>;
}
