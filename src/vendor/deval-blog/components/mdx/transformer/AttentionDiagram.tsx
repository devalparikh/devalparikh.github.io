import styles from "../TransformerVisuals.module.css";

export const ATTENTION_HEIGHT = 440;
export const ATTENTION_TOKENS = ["The", "capital", "of", "France", "is"] as const;

type AttentionMode = "causal" | "bidirectional";

export function canAttend(query: number, key: number, mode: AttentionMode) {
  return Number.isInteger(query) && Number.isInteger(key) && query >= 0 && key >= 0
    && (mode === "bidirectional" || key <= query);
}

export function AttentionDiagram({ selected, mode }: {
  selected: number;
  mode: AttentionMode;
}) {
  const query = Math.min(ATTENTION_TOKENS.length - 1, Math.max(0, Math.trunc(selected)));
  const token = ATTENTION_TOKENS[query];
  const allowedCount = ATTENTION_TOKENS.filter((_, key) => canAttend(query, key, mode)).length;
  const blockedCount = ATTENTION_TOKENS.length - allowedCount;

  return <g
    data-attention-mode={mode}
    data-attention-query={query}
    data-attention-allowed-count={allowedCount}
    data-attention-blocked-count={blockedCount}
  >
    <text className={styles.comparison} x="30" y="34">Which tokens can read each other?</text>
    <text className={styles.label} x="279" y="63" textAnchor="middle">KEYS: MATCH AGAINST THE QUERY</text>
    {ATTENTION_TOKENS.map((keyToken, key) => <text
      key={keyToken}
      className={styles.ticketText}
      x={159 + key * 57}
      y="88"
      textAnchor="middle"
    >{keyToken}</text>)}

    {ATTENTION_TOKENS.map((queryToken, queryIndex) => {
      const rowY = 102 + queryIndex * 47;
      const active = queryIndex === query;
      return <g key={queryToken} data-attention-row={queryIndex} data-selected={active}>
        {active && <rect
          x="25" y={rowY - 4} width="407" height="48" rx="4"
          fill="color-mix(in srgb, var(--diagram-blue) 7%, var(--diagram-bg))"
          stroke="var(--diagram-blue)" strokeWidth="1"
        />}
        <text
          className={active ? styles.comparison : styles.ticketText}
          x="116" y={rowY + 25} textAnchor="end"
          fill={active ? "var(--diagram-blue)" : undefined}
        >{queryToken}</text>
        {ATTENTION_TOKENS.map((_, key) => {
          const allowed = canAttend(queryIndex, key, mode);
          const cellX = 134 + key * 57;
          return <g
            key={key}
            data-attention-cell={`${queryIndex}-${key}`}
            data-attention-allowed={allowed}
            data-attention-selected={active}
          >
            <rect
              x={cellX} y={rowY} width="50" height="40" rx="3"
              fill={allowed
                ? `color-mix(in srgb, var(--diagram-blue) ${active ? 19 : 7}%, var(--diagram-bg))`
                : "var(--diagram-paper)"}
              stroke={allowed && active ? "var(--diagram-blue)" : "var(--diagram-border)"}
              strokeWidth="1"
            />
            {allowed ? <circle
              cx={cellX + 25} cy={rowY + 20} r={active ? 4 : 2.5}
              fill={active ? "var(--diagram-blue)" : "var(--diagram-muted)"}
            /> : <path
              d={`M${cellX + 21} ${rowY + 16}l8 8m0 -8l-8 8`}
              fill="none" stroke="var(--diagram-muted)" strokeWidth="1"
            />}
          </g>;
        })}
      </g>;
    })}

    <circle cx="43" cy="355" r="3" fill="var(--diagram-blue)" />
    <text className={styles.ticketText} x="54" y="359">Can read</text>
    <path d="M153 351l8 8m0 -8l-8 8" stroke="var(--diagram-muted)" strokeWidth="1" />
    <text className={styles.ticketText} x="170" y="359">Blocked</text>
    <text className={styles.comparison} x="30" y="394">
      {token} can read {allowedCount} of 5 tokens
    </text>
    <text className={styles.ticketText} x="30" y="415">
      {blockedCount > 0 ? `${blockedCount} later ${blockedCount === 1 ? "token stays" : "tokens stay"} hidden` : "All five tokens are available"}
    </text>

    <line className={styles.divider} x1="462" y1="26" x2="462" y2="419" />
    <text className={styles.comparison} x="490" y="34">One attention head for “{token}”</text>

    <g className={styles.node} data-active="true">
      <rect x="612" y="55" width="210" height="47" rx="4" />
      <text className={styles.comparison} x="717" y="76" textAnchor="middle">{token} · query Q</text>
      <text className={styles.label} x="717" y="92" textAnchor="middle">What information matches?</text>
    </g>

    {ATTENTION_TOKENS.map((keyToken, key) => {
      const allowed = canAttend(query, key, mode);
      const center = 534 + key * 91;
      return <g key={keyToken} data-attention-key={key} data-attention-blocked={!allowed}>
        <path
          className={allowed ? styles.route : styles.lane}
          d={`M717 102C717 120 ${center} 120 ${center} 140`}
          opacity={allowed ? 0.8 : 0.4}
        />
        <rect
          x={center - 37} y="140" width="74" height="45" rx="3"
          fill={allowed ? "color-mix(in srgb, var(--diagram-blue) 9%, var(--diagram-bg))" : "var(--diagram-paper)"}
          stroke={allowed ? "var(--diagram-blue)" : "var(--diagram-border)"}
        />
        <text className={styles.ticketText} x={center} y="159" textAnchor="middle">{keyToken}</text>
        <text className={styles.label} x={center} y="176" textAnchor="middle">{allowed ? "key K" : "blocked"}</text>
        {allowed ? <>
          <path className={styles.route} d={`M${center} 185V251`} opacity=".7" />
          <rect x={center - 35} y="207" width="70" height="18" fill="var(--diagram-bg)" />
          <text className={styles.label} x={center} y="220" textAnchor="middle">weight</text>
          <g data-tone="green">
            <rect className={styles.packet} x={center - 30} y="251" width="60" height="29" rx="3" />
            <text className={styles.ticketText} x={center} y="270" textAnchor="middle">value V</text>
            <path className={styles.route} d={`M${center} 280C${center} 307 717 300 717 323`} opacity=".7" />
          </g>
        </> : <>
          <text className={styles.label} x={center} y="220" textAnchor="middle">weight 0</text>
          <path d={`M${center - 5} 260l10 10m0 -10l-10 10`} stroke="var(--diagram-muted)" strokeWidth="1" />
        </>}
      </g>;
    })}

    <g className={styles.outcome} data-ready="true" data-tone="green">
      <rect x="602" y="323" width="230" height="45" rx="4" />
      <text className={styles.comparison} x="717" y="344" textAnchor="middle">Weighted mix of values</text>
      <text className={styles.label} x="717" y="360" textAnchor="middle">More weight → more contribution</text>
    </g>
    <path className={styles.route} data-tone="green" d="M717 368V389m-4 -5l4 5 4 -5" />
    <text className={styles.comparison} x="717" y="410" textAnchor="middle">Attention output for “{token}”</text>
  </g>;
}
