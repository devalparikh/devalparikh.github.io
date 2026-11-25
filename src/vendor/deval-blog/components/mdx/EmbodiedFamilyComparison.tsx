import type { CSSProperties } from "react";

const families = [
  {
    key: "vat",
    short: "VAT",
    name: "Vision-Action Transformer",
    formulaStart: "see",
    formulaEnd: "act",
    accentDark: "#55bde8",
    accentLight: "#1f6886",
    rows: [
      {
        label: "Condition on",
        value: "Frames + robot state",
        detail: "Action history can be included.",
      },
      {
        label: "Predict",
        value: "Next action or action chunk",
        detail: "Continuous values or discrete classes.",
      },
      {
        label: "Learn from",
        value: "Action prediction loss",
        detail: "Match the demonstrated control.",
      },
    ],
  },
  {
    key: "vla",
    short: "VLA",
    name: "Vision-Language-Action",
    formulaStart: "see + instruct",
    formulaEnd: "act",
    accentDark: "#e69a68",
    accentLight: "#934b20",
    rows: [
      {
        label: "Condition on",
        value: "Instruction + frames",
        detail: "Robot state may also be used.",
      },
      {
        label: "Predict",
        value: "Next action or action chunk",
        detail: "Language selects the task.",
      },
      {
        label: "Learn from",
        value: "Action-token or continuous loss",
        detail: "Still grounded in demonstrated actions.",
      },
    ],
  },
  {
    key: "wam",
    short: "WAM",
    name: "World-Action Model",
    formulaStart: "see",
    formulaEnd: "future + act",
    accentDark: "#84bd83",
    accentLight: "#376c3e",
    rows: [
      {
        label: "Condition on",
        value: "Frames or visual latents",
        detail: "Language and robot state can be optional.",
      },
      {
        label: "Predict",
        value: "Future visual states + actions",
        detail: "Model change as well as control.",
      },
      {
        label: "Learn from",
        value: "World loss + action loss",
        detail: "Later frames provide the extra signal.",
      },
    ],
  },
] as const;

export function EmbodiedFamilyComparison() {
  return (
    <figure className="efc not-prose" aria-labelledby="efc-title">
      <style>{`
        .efc {
          --efc-border: color-mix(in oklab, var(--color-base-content) 13%, transparent);
          --efc-muted: color-mix(in oklab, var(--color-base-content) 58%, transparent);
          margin: 3rem 0;
          overflow: hidden;
          border: 1px solid var(--efc-border);
          border-radius: 1.3rem;
          background: color-mix(in oklab, var(--color-base-200) 88%, transparent);
          box-shadow: 0 22px 68px rgb(0 0 0 / .14), inset 0 1px 0 rgb(255 255 255 / .035);
          color: var(--color-base-content);
          font-family: var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif;
        }
        [data-theme="parchment"] .efc {
          --efc-border: rgb(30 26 22 / .12);
          --efc-muted: #6b6560;
          box-shadow: 0 18px 52px rgb(38 31 24 / .075), inset 0 1px 0 rgb(255 255 255 / .78);
        }
        .efc-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 1rem;
          align-items: end;
          padding: clamp(1rem, 3vw, 1.4rem);
        }
        .efc-kicker {
          display: block;
          margin-bottom: .5rem;
          color: var(--efc-muted);
          font-size: .65rem;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .efc h3 {
          max-width: 34rem;
          margin: 0;
          color: var(--color-base-content);
          font-size: clamp(1.25rem, 3vw, 1.65rem);
          font-weight: 680;
          line-height: 1.08;
          letter-spacing: -.045em;
          text-wrap: balance;
        }
        .efc-head-note {
          margin: 0;
          color: var(--efc-muted);
          font: 700 .62rem/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
          text-align: right;
        }
        .efc-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1px;
          border-top: 1px solid var(--efc-border);
          background: var(--efc-border);
        }
        .efc-family {
          --efc-accent: var(--efc-accent-dark);
          display: grid;
          min-width: 0;
          grid-template-rows: auto repeat(3, minmax(6.25rem, auto));
          background: var(--color-base-100);
          transition: background 180ms ease, box-shadow 180ms ease;
        }
        [data-theme="parchment"] .efc-family {
          --efc-accent: var(--efc-accent-light);
        }
        .efc-family-head {
          min-width: 0;
          padding: 1rem 1rem .9rem;
          background:
            radial-gradient(circle at 0 0, color-mix(in oklab, var(--efc-accent) 13%, transparent), transparent 9rem),
            color-mix(in oklab, var(--color-base-200) 72%, var(--color-base-100));
        }
        .efc-family-label {
          display: flex;
          align-items: center;
          gap: .5rem;
          min-width: 0;
        }
        .efc-dot {
          width: .52rem;
          height: .52rem;
          flex: 0 0 auto;
          border-radius: 50%;
          background: var(--efc-accent);
          box-shadow: 0 0 0 .22rem color-mix(in oklab, var(--efc-accent) 13%, transparent);
        }
        .efc-family-label b {
          color: var(--efc-accent);
          font-size: .72rem;
          font-weight: 900;
          letter-spacing: .12em;
        }
        .efc-family-head h4 {
          min-height: 2.2rem;
          margin: .52rem 0 .7rem;
          color: var(--color-base-content);
          font-size: .85rem;
          font-weight: 760;
          line-height: 1.25;
          letter-spacing: -.018em;
          text-wrap: balance;
        }
        .efc-contract {
          display: grid;
          grid-template-columns: minmax(0, auto) 1.6rem minmax(0, auto);
          gap: .35rem;
          align-items: center;
          color: var(--efc-muted);
          font: 750 .58rem/1.15 ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: -.02em;
        }
        .efc-contract span:last-child {
          color: var(--efc-accent);
          text-align: right;
        }
        .efc-arrow {
          display: block;
          width: 100%;
          height: .55rem;
          color: var(--efc-accent);
        }
        .efc-cell {
          min-width: 0;
          padding: .9rem 1rem;
          border-top: 1px solid var(--efc-border);
        }
        .efc-cell span {
          display: block;
          margin-bottom: .45rem;
          color: var(--efc-muted);
          font-size: .58rem;
          font-weight: 850;
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .efc-cell strong {
          display: block;
          color: var(--color-base-content);
          font-size: .79rem;
          font-weight: 760;
          line-height: 1.28;
          letter-spacing: -.018em;
          text-wrap: pretty;
        }
        .efc-cell small {
          display: block;
          margin-top: .35rem;
          color: var(--efc-muted);
          font-size: .65rem;
          line-height: 1.35;
          text-wrap: pretty;
        }
        .efc-caption {
          margin: 0;
          padding: .85rem clamp(1rem, 3vw, 1.4rem) 1rem;
          border-top: 1px solid var(--efc-border);
          color: var(--efc-muted);
          background: color-mix(in oklab, var(--color-base-200) 66%, transparent);
          font-size: .68rem;
          line-height: 1.45;
        }
        .efc-caption b { color: var(--color-base-content); }
        @media (hover: hover) and (pointer: fine) {
          .efc-family:hover {
            background: color-mix(in oklab, var(--efc-accent) 3.5%, var(--color-base-100));
            box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--efc-accent) 22%, transparent);
          }
        }
        @media (max-width: 680px) {
          .efc-head { grid-template-columns: 1fr; }
          .efc-head-note { text-align: left; }
          .efc-grid { grid-template-columns: 1fr; }
          .efc-family { grid-template-rows: auto; }
          .efc-family-head { padding: 1rem; }
          .efc-family-head h4 { min-height: 0; }
          .efc-cell { padding: .82rem 1rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .efc-family { transition-duration: .01ms; }
        }
      `}</style>

      <header className="efc-head">
        <div>
          <span className="efc-kicker">The three families · side by side</span>
          <h3 id="efc-title">The model name matters less than its contract.</h3>
        </div>
        <p className="efc-head-note">same task<br />different condition + target</p>
      </header>

      <div className="efc-grid">
        {families.map((family) => (
          <section
            className="efc-family"
            key={family.key}
            aria-label={family.name}
            style={{
              "--efc-accent-dark": family.accentDark,
              "--efc-accent-light": family.accentLight,
            } as CSSProperties}
          >
            <div className="efc-family-head">
              <div className="efc-family-label">
                <i className="efc-dot" aria-hidden="true" />
                <b>{family.short}</b>
              </div>
              <h4>{family.name}</h4>
              <div className="efc-contract" aria-label={`${family.formulaStart} to ${family.formulaEnd}`}>
                <span>{family.formulaStart}</span>
                <svg className="efc-arrow" viewBox="0 0 32 10" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M1 5H28M23 1L28 5L23 9" fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
                </svg>
                <span>{family.formulaEnd}</span>
              </div>
            </div>

            {family.rows.map((row) => (
              <div className="efc-cell" key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
                <small>{row.detail}</small>
              </div>
            ))}
          </section>
        ))}
      </div>

      <figcaption className="efc-caption">
        <b>Read vertically for one family; scan horizontally for the change.</b> All three may use transformers and robot demonstrations.
      </figcaption>
    </figure>
  );
}
