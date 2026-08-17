import { Reveal } from "./Reveal";

interface PageHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
}

/** The consistent opening block on every non-home page. */
export function PageHeader({ kicker, title, description }: PageHeaderProps) {
  return (
    <header>
      {kicker && (
        <Reveal index={0}>
          <p className="kicker">{kicker}</p>
        </Reveal>
      )}
      <Reveal index={kicker ? 1 : 0}>
        <h1 className="display mt-2 text-4xl sm:text-5xl">{title}</h1>
      </Reveal>
      {description && (
        <Reveal index={kicker ? 2 : 1}>
          <p className="lede mt-4 max-w-xl">{description}</p>
        </Reveal>
      )}
    </header>
  );
}
