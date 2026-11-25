import { PROJECT_DEMOS, type ProjectId } from "./project-demos";
import { PAYLOAD_VISUALS } from "./payload-visuals";
import { TRACES } from "./traces";
import { TraceSteps } from "./TraceSteps";
import { ZillowSemanticLoop } from "./ZillowSemanticLoop";
import styles from "./Trace.module.css";

/** The example's whole pipeline in runtime order; each step expands to its own payload. */
export function JevDataFlow({ project }: { project: ProjectId }) {
  const trace = TRACES[project];
  const title = PROJECT_DEMOS[project].title;
  return <figure className={`not-prose ${styles.figure}`} aria-label={`${title} pipeline`}>
    <TraceSteps steps={trace.steps} visuals={PAYLOAD_VISUALS[project]} label={`${title}: steps in order`} />
    {project === "zillow" && <ZillowSemanticLoop />}
    {trace.repeat && <p className={styles.repeat}><span aria-hidden="true">↻ </span>{trace.repeat}</p>}
    {trace.outcome && <p className={styles.outcome}>{trace.outcome}</p>}
    {trace.note && <figcaption>{trace.note}</figcaption>}
  </figure>;
}
