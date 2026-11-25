import styles from "../TransformerVisuals.module.css";

export function OutputDiagram() {
  return <g>
    {[0, 1].map(row => {
      const y = 70 + row * 155;
      return <g key={row}>
        <text className={styles.critical} x="30" y={y - 33}>{row === 0 ? "Text generation" : "Text embeddings"}</text>
        <text className={styles.label} x="30" y={y - 12}>FINAL TOKEN STATES</text>
        {Array.from({ length: 5 }, (_, index) => <g key={index} data-tone={row === 0 && index === 4 ? "green" : "blue"} opacity={row === 0 && index !== 4 ? .4 : 1}>
          <rect className={styles.packet} x={30 + index * 45} y={y} width="33" height="54" rx="3" />
          {[0, 1, 2, 3].map(bar => <rect key={bar} className={styles.barFill} x={36 + index * 45} y={y + 9 + bar * 10} width={9 + (index * 3 + bar * 7) % 15} height="4" />)}
        </g>)}
        <path className={styles.lane} d={`M244 ${y + 27}H327M534 ${y + 27}H600M758 ${y + 27}H805`} />
        <g className={styles.node}>
          <rect x="327" y={y} width="207" height="54" rx="3" />
          <text className={styles.comparison} x="430" y={y + 23} textAnchor="middle">{row === 0 ? "Select last position" : "Pool or select"}</text>
          <text className={styles.label} x="430" y={y + 42} textAnchor="middle">{row === 0 ? "The state at “is”" : "Mean, special token, or last token"}</text>
        </g>
        <g className={styles.node}>
          <rect x="600" y={y} width="158" height="54" rx="3" />
          <text className={styles.comparison} x="679" y={y + 32} textAnchor="middle">{row === 0 ? "LM head" : "Text vector"}</text>
        </g>
        <g className={styles.outcome} data-tone={row === 0 ? "green" : "blue"} data-ready="true">
          <rect x="805" y={y} width="145" height="54" rx="3" />
          <text className={styles.comparison} x="878" y={y + 23} textAnchor="middle">{row === 0 ? "Next token" : "Compare texts"}</text>
          <text className={styles.label} x="878" y={y + 42} textAnchor="middle">{row === 0 ? "“Paris”" : "e.g. cosine similarity"}</text>
        </g>
      </g>;
    })}
    <line className={styles.divider} x1="30" y1="156" x2="950" y2="156" />
  </g>;
}
