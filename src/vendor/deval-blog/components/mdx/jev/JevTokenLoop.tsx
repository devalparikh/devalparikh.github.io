import { useId } from "react";
import styles from "../JevVisuals.module.css";

export function JevTokenLoop() {
  const arrow = useId();
  return <figure className={`not-prose ${styles.figure}`}>
    <div className={styles.shell}>
      <svg className={styles.diagram} viewBox="0 0 980 350" role="img" aria-label="A cached autoregressive generation loop">
        <desc>Prefill processes the prompt once and supplies the first next-token scores. Choose a token. Stop for an ending token or output limit; otherwise emit and process that token using the cache, extend the cache, and return to token selection with the new scores. The loop returns to decoding, never to prefill.</desc>
        <defs><marker id={arrow} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="var(--diagram-muted)" /></marker></defs>
        <g fill="none" stroke="var(--diagram-muted)" strokeWidth="1.2" markerEnd={`url(#${arrow})`}>
          <path d="M210 97H280" /><path d="M460 97H540" /><path d="M720 97H790" />
          <path d="M120 137V229" /><path d="M630 137V229" />
          <path d="M540 270H370V137" /><path d="M210 270H305V315H780V270H720" />
        </g>
        <g className={styles.node}>
          <rect x="30" y="57" width="180" height="80" rx="4" />
          <text className={styles.critical} x="120" y="91" textAnchor="middle">Prefill</text>
          <text className={styles.ticketText} x="120" y="114" textAnchor="middle">Process the prompt</text>
        </g>
        <g className={styles.node}>
          <rect x="280" y="57" width="180" height="80" rx="4" />
          <text className={styles.critical} x="370" y="91" textAnchor="middle">Choose token</text>
          <text className={styles.ticketText} x="370" y="114" textAnchor="middle">Sample or take max</text>
        </g>
        <g className={styles.node}>
          <rect x="540" y="57" width="180" height="80" rx="4" />
          <text className={styles.comparison} x="630" y="91" textAnchor="middle">Ending or limit?</text>
          <text className={styles.ticketText} x="630" y="114" textAnchor="middle">Check before next step</text>
        </g>
        <g className={styles.outcome} data-tone="green" data-ready="true">
          <rect x="790" y="57" width="160" height="80" rx="4" />
          <text className={styles.critical} x="870" y="104" textAnchor="middle">Stop</text>
        </g>
        <g className={styles.node}>
          <rect x="30" y="230" width="180" height="80" rx="4" />
          <text className={styles.critical} x="120" y="264" textAnchor="middle">KV cache</text>
          <text className={styles.ticketText} x="120" y="287" textAnchor="middle">Kept across steps</text>
        </g>
        <g className={styles.node}>
          <rect x="540" y="230" width="180" height="80" rx="4" />
          <text className={styles.critical} x="630" y="264" textAnchor="middle">Decode</text>
          <text className={styles.ticketText} x="630" y="287" textAnchor="middle">Process newest token</text>
        </g>
        <text className={styles.label} x="30" y="30">PREFILL ONCE · REPEAT THE DECODE LOOP</text>
        <text className={styles.label} x="230" y="82">scores</text>
        <text className={styles.label} x="740" y="82">yes</text>
        <text className={styles.ticketText} x="647" y="185">no: emit token</text>
        <text className={styles.ticketText} x="135" y="185">store</text>
        <text className={styles.ticketText} x="390" y="252">next scores</text>
        <text className={styles.ticketText} x="420" y="336">reuse cache and append new K/V</text>
      </svg>
    </div>
  </figure>;
}
