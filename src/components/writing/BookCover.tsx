import { useId, type CSSProperties } from "react";
import type { CoverDesign } from "@/content/writing";
import { formatWordCount } from "@/lib/word-count";
import { coverArt } from "./covers";

export interface CoverPost {
  slug: string;
  words: number;
  year: number;
  /** Chronological issue number, oldest first. */
  issue: number;
  cover: CoverDesign;
}

const ink = (name: string) => `var(--cover-${name})`;

/**
 * Headline size in container-width units: as large as the poster wants, but
 * never wider than the cover. Grotesk capitals run about 0.64em each.
 */
export function headlineSize(lines: string[]) {
  const longest = Math.max(...lines.map((line) => line.length));
  return Math.min(17, 84 / (longest * 0.64));
}

/**
 * One editorial cover: Swiss layout, a big uppercase grotesk headline at the
 * top or bottom left, an italic subtitle, tiny corner labels, the drawing,
 * and a footer with author, year and word count. Sized entirely in container
 * units, so the same markup reads as a full cover, a shelf book or a thumb.
 *
 * All of it is decorative to assistive tech - the link around it carries the
 * real title.
 */
export function BookCover({ post, playing = false }: { post: CoverPost; playing?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const Art = coverArt[post.slug];
  const { cover } = post;
  const style = {
    "--g": ink(cover.ground),
    "--k1": ink(cover.inks[0]),
    "--k2": ink(cover.inks[1]),
    "--t": ink(cover.text),
    "--headline": `${headlineSize(cover.title)}cqw`,
  } as CSSProperties;

  return (
    <div className="cover" data-headline={cover.headline} data-playing={playing} data-cover={post.slug} style={style} aria-hidden="true">
      <div className="cover-corners">
        <span>No. {String(post.issue).padStart(2, "0")}</span>
        <span>{cover.label}</span>
      </div>
      <div className="cover-art">{Art && <Art uid={uid} />}</div>
      <div className="cover-head">
        <p className="cover-title">
          {cover.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <p className="cover-subtitle">{cover.subtitle}</p>
      </div>
      <p className="cover-footer">
        <span>Deval Parikh</span>
        <span aria-hidden="true">·</span>
        <span>{post.year}</span>
        <span aria-hidden="true">·</span>
        <span>{formatWordCount(post.words)}</span>
      </p>
    </div>
  );
}
