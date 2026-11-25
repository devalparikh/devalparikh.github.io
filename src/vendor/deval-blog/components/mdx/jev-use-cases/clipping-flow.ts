import type { DataFlow } from "./data-flow-types";
import type { Trace } from "./trace";

// Clip Fast has no public source; this is the article's own design, built like Needle:
// judge every window independently, then trim only the windows that matched.
// Three rounds of requests no matter how many clips the videos contain.

type Sentence = { id: string; text: string; start: number; end: number };
type Video = { id: string; title: string; transcript: Sentence[] };

export const CLIP_TOPIC = "cache invalidation";
export const CLIP_SETTINGS = { sentencesPerWindow: 3, windowThreshold: 0.6, standaloneThreshold: 1.5, paddingSentences: 1 };

function transcript(start: number, lines: string[]): Sentence[] {
  let t = start;
  return lines.map((text, i) => {
    const length = 8 + (text.length % 7);
    const sentence = { id: `s${i + 1}`, text, start: t, end: t + length };
    t += length;
    return sentence;
  });
}

export const CLIP_VIDEOS: Video[] = [
  {
    id: "video_1", title: "Building a product page",
    transcript: transcript(600, [
      "Welcome back to the product page build.",
      "Today we finish the price panel and the gallery.",
      "First, a quick word on where prices come from.",
      "Prices are read from a cache so the page loads quickly.",
      "When a price changes, the cached copy is suddenly wrong.",
      "So every price update deletes that product's cache entry.",
      "Next, let's style the buy button.",
      "Give it a clear color and a large tap target.",
      "Now the image gallery.",
      "Each thumbnail loads a smaller version of the photo.",
      "Tapping one swaps in the full image.",
      "Reviews come next, and they are cached too.",
      "A second way to keep a cache fresh is a time limit.",
      "Each review entry expires after five minutes and is fetched again.",
      "It is simpler, but people may see a stale review until it expires.",
      "Use deletion for prices and expiry for reviews.",
      "That covers keeping cached data correct.",
      "Any questions before we wrap up?",
    ]),
  },
  {
    id: "video_2", title: "Scaling profile reads",
    transcript: transcript(1200, [
      "This service handles about a million profile reads a day.",
      "Most of those reads hit a cache in front of the database.",
      "Here is what happens when someone edits their profile.",
      "After the edit is saved, we delete that user's cached profile.",
      "The next read misses the cache and reloads the updated record.",
      "That way nobody sees the old profile after an edit.",
      "Let's look at the dashboard for read latency.",
      "The median stays under ten milliseconds.",
      "Spikes line up with nightly backups.",
      "Next week we will cover database replicas.",
      "Thanks for watching.",
      "The code is linked below.",
    ]),
  },
];

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** Consecutive windows of a few sentences. Each becomes one independent yes/no question. */
export const CLIP_WINDOWS = CLIP_VIDEOS.flatMap(video => {
  const n = CLIP_SETTINGS.sentencesPerWindow;
  return Array.from({ length: Math.ceil(video.transcript.length / n) }, (_, i) => {
    const sentences = video.transcript.slice(i * n, i * n + n);
    return { key: `${video.id}_w${i + 1}`, videoId: video.id, index: i, first: sentences[0].id, last: sentences.at(-1)!.id };
  });
});

// Round 1: one request per video (or per ~20 minutes of transcript), all sent in parallel.
// The whole transcript is the shared state, so each window is judged with its surroundings in view.
const WINDOW_P: Record<string, number> = {
  video_1_w1: 0.04, video_1_w2: 0.91, video_1_w3: 0.05, video_1_w4: 0.12, video_1_w5: 0.94, video_1_w6: 0.72,
  video_2_w1: 0.08, video_2_w2: 0.93, video_2_w3: 0.06, video_2_w4: 0.02,
};
export const FIND_REQUESTS = CLIP_VIDEOS.map(video => {
  const windows = CLIP_WINDOWS.filter(w => w.videoId === video.id);
  return {
    videoId: video.id,
    state: { topic: CLIP_TOPIC, transcript: video.transcript.map(({ id, text }) => ({ id, text })) },
    questions: Object.fromEntries(windows.map(w => [w.key, {
      type: "noul",
      instructions: `Does the passage from ${w.first} to ${w.last} in \`transcript\` explain \`topic\`? Use the rest of the transcript as context only.`,
    }])),
    answers: Object.fromEntries(windows.map(w => [w.key, { type: "noul", noul: WINDOW_P[w.key] }])),
  };
});

/** Join neighboring windows that matched; an unmatched window between them starts a new clip. */
export const CLIP_REGIONS = (() => {
  const regions: { key: string; videoId: string; windows: string[] }[] = [];
  const letters = "ABCDEFGH";
  for (const video of CLIP_VIDEOS) {
    let current: string[] = [];
    const flush = () => { if (current.length) regions.push({ key: letters[regions.length], videoId: video.id, windows: current }); current = []; };
    for (const w of CLIP_WINDOWS.filter(w => w.videoId === video.id)) {
      if (WINDOW_P[w.key] >= CLIP_SETTINGS.windowThreshold) current.push(w.key); else flush();
    }
    flush();
  }
  return regions.map(region => {
    const video = CLIP_VIDEOS.find(v => v.id === region.videoId)!;
    const windows = CLIP_WINDOWS.filter(w => region.windows.includes(w.key));
    const from = Math.max(0, windows[0].index * CLIP_SETTINGS.sentencesPerWindow - CLIP_SETTINGS.paddingSentences);
    const to = Math.min(video.transcript.length, (windows.at(-1)!.index + 1) * CLIP_SETTINGS.sentencesPerWindow + CLIP_SETTINGS.paddingSentences);
    return { ...region, sentences: video.transcript.slice(from, to) };
  });
})();

// Round 2: one request trims every region at once, choosing its first and last sentence.
const TRIM: Record<string, [string, string]> = { A: ["s4", "s6"], B: ["s13", "s17"], C: ["s3", "s6"] };
const choice = (options: string[], winner: string, top: number) => {
  const rest = Math.round(((1 - top) / (options.length - 1)) * 1000) / 1000;
  const probabilities = Object.fromEntries(options.map(o => [o, o === winner ? top : rest]));
  const drift = 1 - Object.values(probabilities).reduce((a, b) => a + b, 0);
  const other = options.find(o => o !== winner)!;
  probabilities[other] = Math.round((probabilities[other] + drift) * 1000) / 1000;
  return { type: "choice", choice: winner, probabilities, confidence: Math.round((top - 0.15) * 100) / 100 };
};
export const TRIM_REQUEST = {
  state: { topic: CLIP_TOPIC, regions: Object.fromEntries(CLIP_REGIONS.map(r => [r.key, { video: r.videoId, sentences: r.sentences.map(({ id, text }) => ({ id, text })) }])) },
  questions: Object.fromEntries(CLIP_REGIONS.flatMap(r => {
    const criteria = Object.fromEntries(r.sentences.map(s => [s.id, s.text]));
    return [
      [`${r.key}_start`, { type: "choice", instructions: `In region ${r.key} of \`regions\`, which sentence should a clip about \`topic\` start on? Include the setup a viewer needs.`, criteria }],
      [`${r.key}_end`, { type: "choice", instructions: `In region ${r.key} of \`regions\`, which sentence should that clip end on? Stop after the explanation concludes.`, criteria }],
    ];
  })),
  answers: Object.fromEntries(CLIP_REGIONS.flatMap(r => {
    const ids = r.sentences.map(s => s.id);
    return [[`${r.key}_start`, choice(ids, TRIM[r.key][0], 0.86)], [`${r.key}_end`, choice(ids, TRIM[r.key][1], 0.83)]];
  })),
};

/** Code turns the chosen sentences into exact source times. No model writes a timestamp. */
export const CLIPS = CLIP_REGIONS.map(r => {
  const video = CLIP_VIDEOS.find(v => v.id === r.videoId)!;
  const [first, last] = TRIM[r.key].map(id => video.transcript.findIndex(s => s.id === id));
  const sentences = video.transcript.slice(first, last + 1);
  return { key: r.key, videoId: r.videoId, sentences: sentences.map(s => s.id), start: sentences[0].start, end: sentences.at(-1)!.end, text: sentences.map(s => s.text).join(" ") };
});

// Round 3: one request checks every clip on its own terms.
const STANDALONE = ["Depends on something said earlier", "Mostly clear, with a small missing reference", "A complete explanation with its own setup and conclusion"];
const SCORES: Record<string, [number, number, number]> = { A: [0.02, 0.2, 0.78], B: [0.05, 0.3, 0.65], C: [0.01, 0.15, 0.84] };
export const CHECK_REQUEST = {
  state: { topic: CLIP_TOPIC, clips: Object.fromEntries(CLIPS.map(c => [c.key, c.text])) },
  questions: Object.fromEntries(CLIPS.map(c => [`${c.key}_standalone`, { type: "score", instructions: `Would clip ${c.key} in \`clips\` make sense to someone who has not seen the rest of the video?`, criteria: STANDALONE }])),
  answers: Object.fromEntries(CLIPS.map(c => {
    const p = SCORES[c.key];
    return [`${c.key}_standalone`, { type: "score", score: Math.round((p[1] + 2 * p[2]) * 100) / 100, probabilities: { 0: p[0], 1: p[1], 2: p[2] }, confidence: 0.6 }];
  })),
};
export const APPROVED = CLIPS.filter(c => CHECK_REQUEST.answers[`${c.key}_standalone`].score >= CLIP_SETTINGS.standaloneThreshold)
  .map(c => ({ clip: c.key, videoId: c.videoId, start: c.start, end: c.end, time: `${clock(c.start)} to ${clock(c.end)}` }));
export const CLIP_ROUNDS = 3;

export const CLIPPING_FLOW: DataFlow = {
  input: { topic: CLIP_TOPIC, videos: CLIP_VIDEOS, settings: CLIP_SETTINGS },
  state: FIND_REQUESTS[0].state,
  questions: FIND_REQUESTS[0].questions,
  answers: FIND_REQUESTS[0].answers,
  output: { regions: CLIP_REGIONS },
  nextCalls: [FIND_REQUESTS[1], TRIM_REQUEST, CHECK_REQUEST].map(({ state, questions, answers }) => ({ state, questions, answers })),
};

const payloads = (request: { state: unknown; questions: unknown; answers: unknown }, at = "") => [
  { label: `${at}request.state`, value: request.state },
  { label: `${at}request.questions`, value: request.questions },
  { label: `${at}response.answers`, value: request.answers },
];
const matched = CLIP_WINDOWS.filter(w => WINDOW_P[w.key] >= CLIP_SETTINGS.windowThreshold);

export const CLIPPING_TRACE: Trace = {
  steps: [
    {
      actor: "model", by: "Transcriber · not Jev",
      title: "Transcribe each video",
      say: "A transcription model turns speech into sentences with start and end times. Everything after this points at those sentences.",
      show: CLIP_VIDEOS.map(v => `${v.id}  ${v.transcript.length} sentences, from ${clock(v.transcript[0].start)}`).join("\n"),
      payloads: [{ label: "transcripts with times (stay in your code)", value: CLIP_VIDEOS }],
    },
    {
      actor: "code",
      title: "Cut the transcripts into short windows",
      say: "Each window of a few sentences becomes its own yes/no question, like a paragraph in semantic search. Short windows are cheap to judge and still say enough to judge.",
      show: CLIP_VIDEOS.map(v => `${v.id}  ${CLIP_WINDOWS.filter(w => w.videoId === v.id).length} windows of ${CLIP_SETTINGS.sentencesPerWindow} sentences`).join("\n"),
      why: `This example uses ${CLIP_SETTINGS.sentencesPerWindow} sentences per window to stay small; about 5, or 30 seconds of speech, suits a real talk. A 90-minute recording is then about 240 questions, split into requests of roughly 20 minutes each.`,
      payloads: [{ label: "windows", value: CLIP_WINDOWS }],
    },
    {
      actor: "jev",
      title: "Ask which windows explain the topic",
      say: "Each video's transcript goes out in its own request, all at once. Every window is judged independently, so the topic can match in several places.",
      show: [...matched.map(w => `${w.key.padEnd(11)} ${WINDOW_P[w.key]}`), "others      0.12 or less"].join("\n"),
      why: "The whole transcript is the shared state and each question names its window, so a window is judged with the talk around it in view. A Choice would force one winner per video; independent yes/no questions find every match. Times stay in your code; Jev only sees sentence text and IDs.",
      payloads: FIND_REQUESTS.flatMap(r => payloads(r, `${r.videoId} · `)),
    },
    {
      actor: "code",
      title: "Group matching windows into clips",
      say: "Neighboring windows that matched become one candidate clip. An unmatched window in between starts a new one, so video 1 yields two clips.",
      show: CLIP_REGIONS.map(r => `clip ${r.key}  ${r.videoId}  ${r.windows.map(w => w.split("_").at(-1)).join(" + ")}`).join("\n"),
      why: `Windows at ${CLIP_SETTINGS.windowThreshold} or above count as matches. Each region is padded by one sentence on each side, so the next step can start a clip on a setup sentence that fell just outside the window.`,
      payloads: [{ label: "candidate regions (stay in your code)", value: CLIP_REGIONS }],
    },
    {
      actor: "jev",
      title: "Trim each clip to whole sentences",
      say: "One request covers every candidate: for each, which sentence should the clip start on, and which should it end on?",
      show: CLIP_REGIONS.map(r => `clip ${r.key}  ${TRIM[r.key][0]} to ${TRIM[r.key][1]}`).join("\n"),
      why: "Window edges are arbitrary; a good clip starts at its setup and stops at its conclusion. Only the matched regions reach this step, so the precise work is spent where it matters.",
      payloads: payloads(TRIM_REQUEST),
    },
    {
      actor: "code",
      title: "Read the times",
      say: "Code looks up the chosen sentences' start and end times. The cut comes from the transcript, never from a model's guess.",
      show: CLIPS.map(c => `clip ${c.key}  ${c.videoId}  ${clock(c.start)} to ${clock(c.end)}`).join("\n"),
      payloads: [{ label: "clips", value: CLIPS }],
    },
    {
      actor: "jev",
      title: "Check each clip stands on its own",
      say: "A last request asks, for every clip, whether it makes sense to someone who has not seen the rest of the video.",
      show: CLIPS.map(c => `clip ${c.key}  ${CHECK_REQUEST.answers[`${c.key}_standalone`].score} of 2`).join("\n"),
      why: `Clips scoring ${CLIP_SETTINGS.standaloneThreshold} or more go to preview. Clip B scores lowest because it opens with "a second way", which points back to clip A.`,
      payloads: payloads(CHECK_REQUEST),
    },
    {
      actor: "system", by: "Person",
      title: "Preview the clips",
      say: "A person watches each clip in the source video before anything is cut. A transcript cannot show a bad camera angle or a visual joke.",
      show: APPROVED.map(a => `clip ${a.clip}  ${a.videoId}  ${a.time}`).join("\n"),
    },
    {
      actor: "system", by: "Media worker",
      title: "Cut the approved clips",
      say: "A media worker cuts the approved intervals from the original video files.",
    },
  ],
  outcome: `Three rounds of requests, however many clips the videos contain: find (one request per transcript chunk, in parallel), trim, and check. Here that is ${FIND_REQUESTS.length + 2} requests for ${CLIPS.length} clips. Burhan reports Clip Fast selecting moments from a recording over 90 minutes long in under two seconds, for about two cents; those are his figures, and this example does not measure them.`,
  note: "Clip Fast has no public source code. This pipeline is the article's own design, following Needle's pattern of judging every passage independently. Topic, transcripts, and probabilities are invented.",
};
