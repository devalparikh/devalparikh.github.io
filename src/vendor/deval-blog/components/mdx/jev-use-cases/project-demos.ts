export type ProjectId = "symbols" | "gliner" | "zillow" | "needle" | "browser" | "routing" | "clipping" | "clipboard" | "graph";

type ProjectDemo = {
  title: string;
  creator: string;
  original: string;
  originalLabel?: string;
  source?: string;
  website?: string;
  image?: string;
  video?: string;
  width?: number;
  height?: number;
  description: string;
};

// Creator-published media, embedded from its original host. Verified 2026-09-23.
export const PROJECT_DEMOS: Record<ProjectId, ProjectDemo> = {
  symbols: {
    title: "FindSFSymbols", creator: "Tornike Gomareli",
    original: "https://github.com/tornikegomareli/FindSFSymbols#showcase", originalLabel: "Original showcase",
    source: "https://github.com/tornikegomareli/FindSFSymbols",
    image: "https://raw.githubusercontent.com/tornikegomareli/FindSFSymbols/main/docs/assets/demo-poster.jpg",
    video: "https://raw.githubusercontent.com/tornikegomareli/FindSFSymbols/main/docs/assets/demo.mp4",
    description: "Describe an icon and watch matching SF Symbols rise out of the pile. Creator’s original recording.",
  },
  gliner: {
    title: "GLiNER + Jev", creator: "William Lyon",
    original: "https://lyonwj.com/blog/typesafe-jev-knowledge-graph-extraction",
    source: "https://github.com/johnymontana/extraction-knowledge-graph-experiments",
    image: "https://lyonwj.com/static/images/typesafe-jev-knowledge-graph-extraction/business-news-graph.png",
    description: "The creator’s resulting business-news graph, with assertion-gated relationships and resolved entities. Open the image to inspect the graph.",
  },
  zillow: {
    title: "Zillow search", creator: "Justine Moore",
    original: "https://x.com/venturetwins/status/2101341075684434245",
    image: "https://pbs.twimg.com/amplify_video_thumb/2101339712464326656/img/A8yq5IoXQuhJAi32.jpg",
    video: "https://video.twimg.com/amplify_video/2101339712464326656/vid/avc1/1126x720/Fyvpi3NZU-N6Lv7e.mp4",
    width: 960, height: 613,
    description: "The listing-classification demo shared by Justine Moore. The scaled approach below illustrates how to reduce the number of listings Jev needs to evaluate.",
  },
  needle: {
    title: "Needle", creator: "Shubham Saboo",
    original: "https://x.com/saboo_shubham_/status/2101576462042366114",
    source: "https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/advanced_llm_apps/needle",
    image: "https://pbs.twimg.com/amplify_video_thumb/2101576307352203264/img/THdpZUHOSRsSoTVr.jpg",
    video: "https://video.twimg.com/amplify_video/2101576307352203264/vid/avc1/1194x720/E4q1ITpEmRal869K.mp4",
    width: 224, height: 135,
    description: "Search a page by meaning and highlight the matching source text. Original Needle extension recording.",
  },
  browser: {
    title: "Jev Ultrafast", creator: "Browser Use",
    original: "https://github.com/browser-use/jev-ultrafast#readme", originalLabel: "Original write-up",
    source: "https://github.com/browser-use/jev-ultrafast",
    image: "https://raw.githubusercontent.com/browser-use/jev-ultrafast/main/docs/flights-result.png",
    video: "https://raw.githubusercontent.com/browser-use/jev-ultrafast/main/docs/demo.mp4",
    description: "The creator’s Google Flights run from Zürich to London, recorded at 1× speed. The poster shows the completed search.",
  },
  routing: {
    title: "Magic Compose", creator: "Sawyer Hood",
    original: "https://getbb.app/marketplace/magic-compose",
    source: "https://github.com/SawyerHood/sawyer-plugins",
    image: "https://getbb.app/marketplace/v2/screenshots/magic-compose/overview.jpg",
    description: "The creator’s Magic Compose screenshot: routing choices remain visible and can be overridden before sending.",
  },
  clipping: {
    title: "Clip Fast", creator: "Burhan Usman",
    original: "https://x.com/BurhanUsman/status/2101641842441732297",
    website: "https://clipfast.lol/",
    image: "https://pbs.twimg.com/amplify_video_thumb/2101641468817338368/img/OTTt_P4JNL_duCAl.jpg",
    video: "https://video.twimg.com/amplify_video/2101641468817338368/vid/avc1/1280x720/-OIzUoBQuk0rn9i4.mp4",
    description: "Burhan’s original topic-based clipping demo, including the source preview and selected moments.",
  },
  clipboard: {
    title: "Smart Paste", creator: "nomanjack",
    original: "https://github.com/nomanjack/smart-paste#readme", originalLabel: "Original write-up",
    source: "https://github.com/nomanjack/smart-paste",
    description: "A small recreation inspired by Smart Paste. Select a field and extract a span from the supplied text. This version supplies candidate spans directly; the extension also locates their token boundaries.",
  },
  graph: {
    title: "neo4jev", creator: "Michael Hunger",
    original: "https://github.com/jexp/neo4jev#readme", originalLabel: "Original write-up",
    source: "https://github.com/jexp/neo4jev",
    description: "A small recreation inspired by neo4jev, using an invented graph stored in this page. Choose a goal and follow existing edges; this does not connect to the creator’s Neo4j database.",
  },
};
