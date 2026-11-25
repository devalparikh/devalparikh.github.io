import styles from "../JevVisuals.module.css";

export function JevTrainingDiagram() {
  return <g>
    <text className={styles.sectionLabel} x="30" y="31">POST-TRAINING PATHS</text>
    <text className={styles.label} x="30" y="58">BASE MODEL</text>
    <text className={styles.label} x="275" y="58">WHAT THE TRAINING OPTIMIZES</text>
    <text className={styles.label} x="755" y="58">MODEL OUTPUT</text>

    <text className={styles.nodeTitle} x="30" y="88">INSTRUCTGPT</text>
    <path className={styles.lane} d="M225 143H275M455 143H480M715 143H755" />
    <g className={styles.node}>
      <rect x="30" y="105" width="195" height="80" rx="4" />
      <text className={styles.critical} x="127" y="138" textAnchor="middle">Pretrained GPT-3</text>
      <text className={styles.label} x="127" y="163" textAnchor="middle">Learn from text</text>
    </g>
    <g className={styles.node}>
      <rect x="275" y="105" width="180" height="80" rx="4" />
      <text className={styles.critical} x="365" y="132" textAnchor="middle">SFT</text>
      <text className={styles.label} x="365" y="154" textAnchor="middle">Example responses</text>
      <text className={styles.label} x="365" y="172" textAnchor="middle">Predict target tokens</text>
    </g>
    <g className={styles.node}>
      <rect x="480" y="105" width="235" height="80" rx="4" />
      <text className={styles.critical} x="597" y="132" textAnchor="middle">RLHF</text>
      <text className={styles.label} x="597" y="154" textAnchor="middle">Learn a reward from rankings</text>
      <text className={styles.label} x="597" y="172" textAnchor="middle">Improve responses against it</text>
    </g>
    <g className={styles.outcome} data-ready="true" data-tone="blue">
      <rect x="755" y="105" width="195" height="80" rx="4" />
      <text className={styles.comparison} x="852" y="140" textAnchor="middle">Response tokens</text>
      <text className={styles.label} x="852" y="165" textAnchor="middle">An answer you can read</text>
    </g>

    <text className={styles.nodeTitle} x="30" y="220">JEV</text>
    <path className={styles.lane} d="M225 277H275M715 277H755" />
    <g className={styles.node}>
      <rect x="30" y="237" width="195" height="80" rx="4" />
      <text className={styles.critical} x="127" y="270" textAnchor="middle">Pretrained LM</text>
      <text className={styles.label} x="127" y="295" textAnchor="middle">Learn from text</text>
    </g>
    <g className={styles.node}>
      <rect x="275" y="237" width="440" height="80" rx="4" />
      <text className={styles.critical} x="495" y="270" textAnchor="middle">RLCD</text>
      <text className={styles.ticketText} x="495" y="295" textAnchor="middle">Train calibrated decision probabilities</text>
    </g>
    <g className={styles.outcome} data-ready="true" data-tone="green">
      <rect x="755" y="237" width="195" height="80" rx="4" />
      <text className={styles.comparison} x="852" y="270" textAnchor="middle">Typed probabilities</text>
      <text className={styles.label} x="852" y="295" textAnchor="middle">Choices · scores · P(yes)</text>
    </g>

    <text className={styles.nodeTitle} x="30" y="352">KEV</text>
    <path className={styles.lane} d="M225 408H275M715 408H755" />
    <g className={styles.node}>
      <rect x="30" y="369" width="195" height="80" rx="4" />
      <text className={styles.critical} x="127" y="402" textAnchor="middle">Qwen2.5-0.5B</text>
      <text className={styles.label} x="127" y="427" textAnchor="middle">Small pretrained model</text>
    </g>
    <g className={styles.node}>
      <rect x="275" y="369" width="440" height="80" rx="4" />
      <text className={styles.comparison} x="495" y="397" textAnchor="middle">LoRA adapters + option-scoring head</text>
      <text className={styles.ticketText} x="495" y="419" textAnchor="middle">Labeled decisions → cross-entropy loss</text>
      <text className={styles.label} x="495" y="438" textAnchor="middle">Train probability toward the target option</text>
    </g>
    <g className={styles.outcome} data-ready="true" data-tone="pink">
      <rect x="755" y="369" width="195" height="80" rx="4" />
      <text className={styles.comparison} x="852" y="402" textAnchor="middle">Option probabilities</text>
      <text className={styles.label} x="852" y="427" textAnchor="middle">Score the supplied options</text>
    </g>
  </g>;
}
