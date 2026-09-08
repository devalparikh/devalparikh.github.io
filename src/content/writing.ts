import { ALL_FILTER, type Collection } from "./types";

/**
 * Articles published elsewhere. Each entry carries the publication as a badge
 * so the row makes the source obvious before the link is followed.
 */
export const writing: Collection = {
  id: "writing",
  title: "Writing",
  description: "Articles published across the web.",
  filters: [
    ALL_FILTER,
    { id: "ai", label: "AI / ML" },
    { id: "fullstack", label: "Full Stack" },
    { id: "systems", label: "Systems" },
  ],
  entries: [
    {
      id: "durable-execution",
      title: "Durable execution vs atomic execution",
      badge: "deval.blog",
      summary:
        "A blog post comparing durable and atomic execution strategies.",
      categories: ["systems"],
      href: "https://deval.blog/blog/tech/durable-execution-vs-atomic-execution",
    },
    {
      id: "speculative-decoding",
      title: "Speculative decoding",
      badge: "deval.blog",
      summary:
        "A knowledge post on speculative decoding, a technique to speed up LLM inference by using a smaller model to generate candidate tokens and a larger model to verify them.",
      categories: ["ai"],
      href: "https://deval.blog/blog/tech/speculative-decoding",
    },
    {
      id: "vision-action-transformers",
      title: "Vision-Action Transformers vs. VLA vs. World-Action Models",
      badge: "deval.blog",
      summary:
        "A blog post comparing different approaches to vision-action learning.",
      categories: ["ai"],
      href: "https://deval.blog/blog/tech/vision-action-transformers-vla-wam",
    },
    {
      id: "graphrag-architecture",
      title: "Building a 6x Faster GraphRAG: Typed Graphs, FAISS, and Two-Phase Retrieval",
      badge: "Rolodex",
      summary:
        "A custom GraphRAG system optimized for structured data like GitHub repos, achieving ~6x faster indexing with typed entity schemas and two-phase retrieval.",
      categories: ["ai"],
      href: "https://rolodex.dev/blog/custom-graphrag-architecture",
    },
    {
      id: "visualizing-backpropagation",
      title: "Visualizing Backpropagation in Neural Network Training at Any Scale",
      badge: "Towards Data Science",
      summary:
        "Using HiPlot to generate parallel coordinate plots to visualize deep learning model training.",
      categories: ["ai"],
      href: "https://towardsdatascience.com/visualizing-backpropagation-in-neural-network-training-2647f5977fdb",
    },
    {
      id: "realtime-nlp-chat",
      title: "Building a Real Time Chat Application with NLP Capabilities",
      badge: "Towards Data Science",
      summary:
        "A chat app with sentiment analysis and tone detection using TensorFlow JS Deep Learning API, IBM Cloud, Node.JS, Web Sockets, and React.",
      categories: ["fullstack", "ai"],
      href: "https://towardsdatascience.com/building-a-real-time-chat-application-with-nlp-super-powers-ce800e19cb2b",
    },
  ],
};
