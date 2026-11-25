import type { ProjectId } from "./project-demos";
import type { Trace } from "./trace";
import { BROWSER_TRACE } from "./browser-flow";
import { CLIPBOARD_TRACE } from "./clipboard-flow";
import { CLIPPING_TRACE } from "./clipping-flow";
import { SYMBOLS_TRACE, ZILLOW_TRACE } from "./data-flows";
import { ROUTING_TRACE } from "./decision-flows";
import { GLINER_TRACE } from "./gliner-flow";
import { NEEDLE_TRACE } from "./passage-flows";
import { GRAPH_TRACE } from "./graph-flow";

export const TRACES: Record<ProjectId, Trace> = {
  symbols: SYMBOLS_TRACE,
  gliner: GLINER_TRACE,
  zillow: ZILLOW_TRACE,
  needle: NEEDLE_TRACE,
  browser: BROWSER_TRACE,
  routing: ROUTING_TRACE,
  clipping: CLIPPING_TRACE,
  clipboard: CLIPBOARD_TRACE,
  graph: GRAPH_TRACE,
};
