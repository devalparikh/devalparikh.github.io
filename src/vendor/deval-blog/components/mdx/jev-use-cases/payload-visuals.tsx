import type { ReactNode } from "react";
import { BrowserSnapshot } from "./BrowserSnapshot";
import { DECISION_1, DECISION_2, OBSERVATIONS, STEP_1, STEP_2 } from "./browser-flow";
import type { ProjectId } from "./project-demos";

// Pictures shown inside a trace step when its IDs are hard to read as JSON. Keyed by step number.
export const PAYLOAD_VISUALS: Partial<Record<ProjectId, Record<number, ReactNode>>> = {
  browser: {
    2: <BrowserSnapshot observation={OBSERVATIONS.empty} label="The snapshot's controls, each outlined by its recorded box and labeled with the number the model sees. Where from? is 1 and maps to local actions e1 (type) and e2 (click). The cabin dropdown is 4, with options 4:1 and 4:2." />,
    4: <BrowserSnapshot observation={OBSERVATIONS.empty} decision={DECISION_1} answers={STEP_1.answers} label="TYPE_TEXT was chosen, so only type_text_target is used. Number 1 resolves to local action e1, the Where from? field. The click and select answers are ignored." />,
    7: <BrowserSnapshot observation={OBSERVATIONS.suggestions} previous={OBSERVATIONS.empty} label="After typing Zurich, two autocomplete options appear as numbers 2 and 3. Every control below them is renumbered: Where to? moves from 2 to 4 and Search from 5 to 7, though their nodes are unchanged." />,
    9: <BrowserSnapshot observation={OBSERVATIONS.suggestions} decision={DECISION_2} answers={STEP_2.answers} label={`CLICK was chosen with click_target 2, which resolves to local action ${DECISION_2.actionId}, the Zürich ZRH suggestion.`} />,
  },
};
