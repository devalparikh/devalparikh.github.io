import test from "node:test";
import assert from "node:assert/strict";
import { searchEntries } from "../src/lib/search.ts";
import { layoutGraph } from "../src/lib/note-graph.ts";

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
