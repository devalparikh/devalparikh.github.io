import type { ReactNode } from "react";
import { Arrow, Box, Canvas } from "./drawing";
import { ZILLOW_COUNTS, ZILLOW_QUERY, ZILLOW_WORKLOAD } from "./zillow-model";
import { CLIP_ROUNDS, CLIP_SETTINGS, CLIP_TOPIC, CLIP_VIDEOS, CLIP_WINDOWS, CLIPS, FIND_REQUESTS } from "./clipping-flow";
import styles from "./UseCases.module.css";

function Architecture({ label, description, height, caption, children }: { label: string; description: string; height: number; caption: string; children: ReactNode }) {
  return <figure className={`not-prose ${styles.figure}`}><div className={styles.shell}><Canvas label={label} description={description} height={height}>{children}</Canvas></div><figcaption>{caption}</figcaption></figure>;
}

export function JevSearchArchitecture() {
  return <Architecture height={230} label="Local retrieval followed by independent semantic judgments" description="FindSFSymbols uses local embeddings to shortlist 48 of 3,832 symbols. One Jev request asks a separate relevance question per shortlisted icon. The interface ranks symbols by the returned probabilities." caption="FindSFSymbols’ documented pipeline. A relevant icon discarded by the shortlist cannot be recovered by the later judge.">
    <text x={26} y={28} className={styles.title}>“Things you can wear”</text>
    <Box x={26} y={60} title="Local embedding search" lines={["3,832 symbols → 48", "Names + keywords"]} />
    <Arrow x1={266} y1={109} x2={330} y2={109} />
    <Box x={330} y={60} title="One Jev request" lines={["state: query + 48 icons", "questions: 48 Nouls"]} />
    <Arrow x1={570} y1={109} x2={634} y2={109} />
    <Box x={634} y={60} title="Rank + display" lines={["T-shirt, shoes, sunglasses", "Multiple good matches"]} selected />
    <text x={26} y={197} className={styles.small}>Retrieval limits the work. Independent judgments refine the shortlist.</text>
  </Architecture>;
}

export function JevZillowArchitecture() {
  const { corpus, survivors, requirements, predicates, batchSize, routingRequests } = ZILLOW_WORKLOAD;
  const { allJevQuestions, allJevRequests, semanticQuestions, semanticRequests, totalScaledRequests } = ZILLOW_COUNTS;
  const count = (value: number) => value.toLocaleString("en-US");
  const clauses = ZILLOW_QUERY.split(", ");
  const queryLines = [`${clauses.slice(0, 3).join(", ")},`, clauses.slice(3).join(", ")];
  const exact = requirements - predicates;
  return <Architecture height={660} label="Everything through Jev compared with tools first, Jev for the rest" description={`Both paths answer the same query over the same ${count(corpus)} listings: ${ZILLOW_QUERY} Everything through Jev asks all ${requirements} requirements as yes/no questions on every listing: ${count(allJevQuestions)} questions in ${count(allJevRequests)} requests of ${batchSize} listings, and even price, bedrooms, and freeway distance are judged from listing text. Tools first asks Jev once to route the ${requirements} requirements, lets the database and geo tools check ${exact} of them exactly, which leaves ${survivors} listings, then asks Jev the remaining ${predicates} questions: ${count(semanticQuestions)} questions in ${semanticRequests} requests, ${totalScaledRequests} requests in total.`} caption={`Invented workload: ${count(corpus)} listings, ${survivors} of which pass the exact filters, ${batchSize} listings per request in both paths. Counts compare fresh Jev work, not measured latency.`}>
    <text x={26} y={28} className={styles.title}>{`Same query, same ${count(corpus)} listings`}</text>
    {queryLines.map((line, index) => <text key={line} x={26} y={60 + index * 22}>{line}</text>)}
    <text x={26} y={126} className={styles.small}>{`EXACT DATA (${exact}): 4+ beds · under $1.2M · near Arlington · not near a freeway`}</text>
    <text x={26} y={148} className={styles.small}>{`JUDGMENT (${predicates}): modern · renovated`}</text>
    <line x1={26} y1={172} x2={874} y2={172} className={styles.line} />

    <text x={26} y={202} className={styles.title}>Everything through Jev</text>
    <text x={874} y={202} textAnchor="end" className={styles.title}>{`${count(allJevRequests)} Jev requests`}</text>
    <Box x={26} y={226} title={`${count(corpus)} listings`} lines={["Every listing", `All ${requirements} requirements`]} />
    <Arrow x1={266} y1={275} x2={330} y2={275} />
    <Box x={330} y={226} title={`Jev: ${count(allJevQuestions)} Nouls`} lines={[`${count(corpus)} × ${requirements} questions`, `${batchSize} listings per request`]} />
    <Arrow x1={570} y1={275} x2={634} y2={275} />
    <Box x={634} y={226} title="Keep yes on all six" lines={["Price and beds read from text", "Freeway guessed from text"]} />
    <text x={26} y={356} className={styles.amber}>Numbers and distances are judged from prose, where they are easy to get wrong or absent.</text>
    <line x1={26} y1={382} x2={874} y2={382} className={styles.line} />

    <text x={26} y={412} className={styles.title}>Tools first, Jev for the rest</text>
    <text x={874} y={412} textAnchor="end" className={styles.title}>{`${totalScaledRequests} Jev requests`}</text>
    <Box x={26} y={436} title="Jev: route each requirement" lines={[`${routingRequests} request, ${requirements} Choices`, `${exact} → tools · ${predicates} → custom`]} />
    <Arrow x1={266} y1={485} x2={330} y2={485} active />
    <Box x={330} y={436} title="Database + geo tools" lines={[`${count(corpus)} → ${survivors} listings`, "Exact, no model"]} />
    <Arrow x1={570} y1={485} x2={634} y2={485} active />
    <Box x={634} y={436} title={`Jev: ${count(semanticQuestions)} Nouls`} lines={[`${survivors} × ${predicates} questions`, `${semanticRequests} requests`]} selected />
    <line x1={26} y1={582} x2={874} y2={582} className={styles.line} />
    <text x={26} y={614} className={styles.critical}>{`${count(allJevQuestions)} vs ${count(semanticQuestions)} Jev questions`}</text>
    <text x={26} y={642} className={styles.small}>Jev still helps in the second path: it decides which tool can check each requirement.</text>
  </Architecture>;
}

export function JevClippingArchitecture() {
  const X0 = 130;
  const CELL = 124;
  const per = CLIP_SETTINGS.sentencesPerWindow;
  const clock = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  const rows = CLIP_VIDEOS.map((video, row) => ({ video, y: 62 + row * 110 }));
  return <Architecture height={470} label="Every window judged at once, then trimmed and checked" description={`Each transcript is cut into windows of ${per} sentences and every window gets its own yes/no question, one request per video, sent in parallel. In video_1, windows 2, 5, and 6 match, so it yields two clips; video_2 yields one. A second request trims every clip to whole sentences, and a third checks that each clip makes sense on its own. Three rounds, however many clips.`} caption="Invented transcripts and probabilities. Window size is 3 sentences here; about 5, or 30 seconds of speech, suits a real talk.">
    <text x={26} y={28} className={styles.title}>{`Topic: ${CLIP_TOPIC}`}</text>
    {rows.map(({ video, y }) => <g key={video.id}>
      <text x={26} y={y + 17}>{video.id}</text>
      {CLIP_WINDOWS.filter(w => w.videoId === video.id).map(w => {
        const p = (FIND_REQUESTS.find(r => r.videoId === video.id)!.answers as Record<string, { noul: number }>)[w.key].noul;
        const hit = p >= CLIP_SETTINGS.windowThreshold;
        return <g key={w.key} data-window={w.key} data-match={hit}>
          <rect x={X0 + w.index * CELL} y={y} width={CELL - 6} height={34} rx={3} className={hit ? styles.selected : styles.box} />
          <text x={X0 + w.index * CELL + 10} y={y + 17} className={hit ? styles.green : styles.muted}>{`w${w.index + 1}  ${p.toFixed(2)}`}</text>
        </g>;
      })}
      {CLIPS.filter(c => c.videoId === video.id).map(c => {
        const first = video.transcript.findIndex(s => s.id === c.sentences[0]);
        const last = video.transcript.findIndex(s => s.id === c.sentences.at(-1));
        const x1 = X0 + (first / per) * CELL;
        const x2 = X0 + ((last + 1) / per) * CELL - 6;
        return <g key={c.key} data-clip={c.key}>
          <path d={`M${x1} ${y + 44} v8 H${x2} v-8`} className={styles.edgeFact} />
          <text x={x1} y={y + 70} className={styles.small}>{`clip ${c.key}  ${clock(c.start)} to ${clock(c.end)}`}</text>
        </g>;
      })}
    </g>)}
    <line x1={26} y1={290} x2={874} y2={290} className={styles.line} />
    <Box x={26} y={310} title="1. Find" lines={["Yes/no per window", "One request per video"]} />
    <Arrow x1={266} y1={359} x2={330} y2={359} active />
    <Box x={330} y={310} title="2. Trim" lines={["First and last sentence", "All clips, one request"]} />
    <Arrow x1={570} y1={359} x2={634} y2={359} active />
    <Box x={634} y={310} title="3. Check" lines={["Clear on its own?", "All clips, one request"]} selected />
    <text x={26} y={446} className={styles.critical}>{`${CLIP_ROUNDS} rounds, however many clips`}</text>
  </Architecture>;
}
