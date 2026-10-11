import test from "node:test";
import assert from "node:assert/strict";
import { parseNotesBrowseState } from "../src/lib/notes-browse.ts";
import { searchEntries } from "../src/lib/search.ts";
import { layoutGraph, zoomGraph, graphLabels } from "../src/lib/note-graph.ts";

test("search ranks exact titles above body matches and requires every query word", () => {
  const entries = [
    { title: "Networking", href: "/notes/networking/", section: "Notes", text: "VPC gateway configuration" },
    { title: "VPC", href: "/notes/vpc/", section: "Notes", text: "subnet configuration" },
    { title: "Projects", href: "/projects/", section: "Pages", text: "" },
  ];
  assert.equal(searchEntries(entries, "vpc")[0].title, "VPC");
  assert.deepEqual(searchEntries(entries, "vpc gateway").map((entry) => entry.title), ["Networking"]);
  assert.deepEqual(searchEntries(entries, "  ").map((entry) => entry.title), ["Projects"]);
  assert.deepEqual(searchEntries(entries, "absent term"), []);
});

test("local graph includes incoming and outgoing notes, deduplicates edges, and ignores missing targets", () => {
  const notes = [
    { id: "a", title: "A", folders: [], outgoing: ["b", "private"] },
    { id: "b", title: "B", folders: [], outgoing: ["a"] },
    { id: "c", title: "C", folders: [], outgoing: ["a"] },
    { id: "d", title: "D", folders: [], outgoing: [] },
  ];
  const { nodes, edges } = layoutGraph(notes, "a");
  assert.deepEqual(nodes.map((node) => node.id), ["a", "b", "c"]);
  assert.equal(edges.length, 2);
  assert.equal(nodes.find((node) => node.id === "a").degree, 2);
  for (const node of nodes) assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
  assert.equal(layoutGraph(notes).nodes.length, 4);
  assert.deepEqual(layoutGraph([]), { nodes: [], edges: [] });
  const isolated = layoutGraph(notes, "d");
  assert.equal(isolated.nodes.length, 1);
  assert.equal(isolated.edges.length, 0);
  assert.equal(isolated.nodes[0].x, 300);
});


test("zoom stays anchored at the pointer and clamps at both limits", () => {
  const before = { x: 42, y: -18, scale: 1.4 };
  const anchor = { x: 85, y: 60 };
  for (const factor of [0.0001, 0.8, 1.3, 1000]) {
    const after = zoomGraph(before, factor, anchor);
    assert.ok(after.scale >= 0.5 && after.scale <= 4);
    assert.ok(Math.abs((anchor.x - before.x) / before.scale - (anchor.x - after.x) / after.scale) < 1e-10);
    assert.ok(Math.abs((anchor.y - before.y) / before.scale - (anchor.y - after.y) / after.scale) < 1e-10);
  }
});

test("graph shows useful labels when zoomed out and always includes the focused note", () => {
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: String(i), title: `Note ${i}`, folders: [], outgoing: [], degree: i % 3,
    x: 60 + (i % 4) * 140, y: 60 + Math.floor(i / 4) * 130,
  }));
  const labels = graphLabels(nodes, { x: 0, y: 0, scale: 0.5 }, 600, 420, false);
  assert.ok(labels.size >= 3);
  assert.ok(graphLabels(nodes, { x: 0, y: 0, scale: 1 }, 600, 420, false, undefined, "0").has("0"));
});

test("crowded hubs keep label priority over isolated notes on desktop, mobile, and zoom out", () => {
  const hubs = Array.from({ length: 8 }, (_, i) => ({
    id: `hub-${i}`, title: `Connected note ${i}`, folders: [], outgoing: [], degree: 20 - i,
    x: 220 + (i % 4) * 35, y: 190 + Math.floor(i / 4) * 45,
  }));
  const neighbors = hubs.map((hub, i) => ({ ...hub, id: `neighbor-${i}`, title: `Neighbor ${i}`, degree: 1, y: hub.y + 17 }));
  const isolated = Array.from({ length: 12 }, (_, i) => ({
    id: `isolated-${i}`, title: `Isolated ${i}`, folders: [], outgoing: [], degree: 0,
    x: 70 + (i % 4) * 140, y: i < 4 ? 60 : 340 + Math.floor((i - 4) / 4) * 70,
  }));
  const nodes = [...hubs, ...neighbors, ...isolated];
  for (const size of [11, 20]) for (const scale of [1, 0.5]) {
    const view = { x: 0, y: 0, scale };
    const labels = graphLabels(nodes, view, 600, 500, false, undefined, undefined, size);
    for (const hub of hubs.slice(0, 3)) assert.ok(labels.has(hub.id), `${hub.id} must remain visible at size ${size}, scale ${scale}`);
    assert.ok(!isolated.some((node) => labels.has(node.id)));
    const focused = graphLabels(nodes, view, 600, 500, false, undefined, "isolated-0", size);
    assert.ok(focused.has("isolated-0"));
    assert.ok(focused.has("hub-0"));
  }
});

test("browse memory retains filters, graph viewport, and separate scroll positions", () => {
  const saved = { controls: { view: "graph", query: "cache", topic: "distributed systems", graph: { x: 82, y: -19, scale: 1.8 } }, scroll: { list: 970, graph: 110 } };
  assert.deepEqual(parseNotesBrowseState(JSON.stringify(saved)), saved);
  assert.equal(parseNotesBrowseState("invalid JSON").controls.view, "list");
  const invalid = parseNotesBrowseState(JSON.stringify({ controls: { graph: { x: "wrong", scale: 100 } }, scroll: { list: -10 } }));
  assert.equal(invalid.controls.graph.x, 0);
  assert.equal(invalid.controls.graph.scale, 4);
  assert.equal(invalid.scroll.list, 0);
});
