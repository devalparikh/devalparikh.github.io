import test from "node:test";
import assert from "node:assert/strict";
import { buildNotes, isNotePath, parseNoteMetadata } from "./lib/notes.mjs";

const file = (name, content) => ({ path: `knowledge/${name}.md`, content });

test("only publishes eligible notes and removes author comments", async () => {
  const notes = await buildNotes([
    file("Public", "# Public\nHello %%secret annotation%% world."),
    file("Private", "---\nprivate: true\n---\nprivate"),
    file("Draft", "---\nstatus: draft\n---\ndraft"),
    file("Draft flag", "---\ndraft: true\n---\ndraft"),
    file("Unpublished", "---\npublish: false\n---\nprivate"),
    file("Explicit private", "---\nstatus: private\n---\nprivate"),
    file("templates/Template", "template"), file("private/Hidden", "hidden"),
    file(".obsidian/Hidden", "hidden"), file("README", "readme"), file("Empty", "\n"),
    { path: "agents/Agent.md", content: "agent" },
  ]);
  assert.equal(notes.length, 1);
  assert.doesNotMatch(JSON.stringify(notes), /secret annotation|private|draft|hidden|readme/);
  assert.equal(isNotePath("knowledge/code/Java.md"), true);
  assert.equal(isNotePath("knowledge/drafts/Foo.md"), false);
});

test("resolves wikilinks, aliases, heading links, and Markdown paths without touching code", async () => {
  const notes = await buildNotes([
    file("code/First", "# First\n[[Second|Read more]] [[alias#Some Heading]] [[#Local heading]] [second](Second.md) [[Missing]]\n\n## Local heading\n`[[Second]]`\n\n```js\n[[Second]]\n```"),
    file("code/Second", "---\naliases: [alias]\n---\n# Second\n## Some Heading\nBody"),
  ]);
  const first = notes.find((note) => note.title === "First");
  const second = notes.find((note) => note.title === "Second");
  assert.match(first.html, /href="\/notes\/code\/second\/">Read more/);
  assert.match(first.html, /href="\/notes\/code\/second\/#some-heading"/);
  assert.match(first.html, /href="\/notes\/code\/first\/#local-heading"/);
  assert.match(first.html, /<code>\[\[Second\]\]<\/code>/);
  assert.match(second.html, /id="some-heading"/);
  assert.doesNotMatch(first.html, /href="[^"]*Missing/);
  assert.deepEqual(first.outgoing, ["code/second"]);
});

test("rejects ambiguous links and colliding slugs", async () => {
  const notes = await buildNotes([file("a/Shared", "one"), file("b/Shared", "two"), file("Index", "[[Shared]] [[a/Shared]]")]);
  assert.match(notes.find((note) => note.title === "Index").html, /Shared <a href="\/notes\/a\/shared\//);
  await assert.rejects(buildNotes([file("A B", "one"), file("A-B", "two")]), /Duplicate/);
});

test("renders tables, tasks and callouts while rejecting active HTML", async () => {
  const [note] = await buildNotes([file("Safe", "<script>alert(1)</script>\n\n[x](javascript:alert%281%29)\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n- [x] Done\n\n> [!note]\n> Useful\n\n## Same\n## Same")]);
  assert.doesNotMatch(note.html, /<script|javascript:/);
  assert.match(note.html, /<table>/);
  assert.match(note.html, /type="checkbox"/);
  assert.match(note.html, /note: Useful/);
  assert.match(note.html, /id="same-1"/);
});

test("only includes images referenced by published notes", async () => {
  const notes = await buildNotes([
    file("Public", "![[images/diagram.png|Diagram]] ![[Gone.png]]"),
    file("Private", "---\nprivate: true\n---\n![[secret.png]]"),
  ], ["knowledge/images/diagram.png", "knowledge/secret.png"]);
  assert.deepEqual(notes[0].attachments, ["knowledge/images/diagram.png"]);
  assert.match(notes[0].html, /<img src="\/img\/notes\/[^" ]+\.png" alt="Diagram"/);
  assert.match(notes[0].html, /loading="lazy" decoding="async"/);
  assert.doesNotMatch(notes[0].html, /src="[^"]*Gone/);
});

test("a complete resync removes deleted and newly private notes", async () => {
  const before = await buildNotes([file("Keep", "[[Remove]]"), file("Remove", "was public")]);
  assert.equal(before.length, 2);
  const after = await buildNotes([file("Keep", "[[Remove]]"), file("Remove", "---\nprivate: true\n---\nnow private")]);
  assert.equal(after.length, 1);
  assert.deepEqual(after[0].outgoing, []);
  assert.doesNotMatch(after[0].html, /href/);
  assert.equal((await buildNotes([])).length, 0);
});

test("invalid metadata fails instead of exposing unfiltered content", async () => {
  await assert.rejects(buildNotes([file("Broken", "---\nprivate: [broken\n---\nbody")]), /Invalid YAML/);
});

test("uses the Obsidian filename when the first heading is a section or embed", async () => {
  const notes = await buildNotes([file("Tools", "# ![[Message Queue]]"), file("Java", "# Background\nSome context")]);
  assert.deepEqual(notes.map((note) => note.title), ["Java", "Tools"]);
});

test("table of contents matches sanitized heading IDs and keeps the vault hierarchy", async () => {
  const [note] = await buildNotes([file("Systems/Networking/Example", "# Example\n## A **bold** heading\n### Repeat\n### Repeat\n> #### Inside a callout\n\n```md\n## Not a heading\n```\n\n%%## Private heading%%")]);
  assert.deepEqual(note.folders, ["Systems", "Networking"]);
  assert.deepEqual(note.toc, [
    { id: "a-bold-heading", text: "A bold heading", depth: 2 },
    { id: "repeat", text: "Repeat", depth: 3 },
    { id: "repeat-1", text: "Repeat", depth: 3 },
    { id: "inside-a-callout", text: "Inside a callout", depth: 4 },
  ]);
  for (const heading of note.toc) assert.ok(note.html.includes(`id="${heading.id}"`));
  assert.doesNotMatch(JSON.stringify(note.toc), /Private|Not a heading/);
});


test("rejects executable frontmatter before private filtering without executing it", async () => {
  for (const language of ["javascript", "js", "JavaScript", "json", "coffee", "constructor", "__proto__", " yaml javascript"]) {
    for (const prefix of ["", "\uFEFF"]) {
      globalThis.__notesCanary = 0;
      await assert.rejects(buildNotes([file("Canary", `${prefix}---${language}\n(globalThis.__notesCanary++, {private:true})\n---\nSynthetic body`)]), /Only YAML/);
      assert.equal(globalThis.__notesCanary, 0);
    }
  }
  delete globalThis.__notesCanary;
});

test("YAML aliases, dates, lists, strings and body survive safe parsing", async () => {
  for (const header of ["---", "---yaml", "---yml", "--- yaml", "---yaml  "]) {
    const [note] = await buildNotes([file("Fixture", `${header}\r\ntitle: Example\r\ntags: &tags [one, two]\r\naliases: *tags\r\nupdated: 2026-01-02\r\nprivate: false\r\nsummary: |\r\n  Multiple lines\r\n---\r\n# Example\n**Body** and \`code\``)]);
    assert.equal(note.title, "Example");
    assert.deepEqual(note.tags, ["one", "two"]);
    assert.equal(note.updated, "2026-01-02");
    assert.match(note.html, /<strong>Body<\/strong> and <code>code<\/code>/);
  }
  await assert.rejects(buildNotes([file("Invalid", "---\nprivate: !!js/function function() {}\n---\nBody")]), /Invalid YAML/);
  await assert.rejects(buildNotes([file("Unclosed", "---\nprivate: true")]), /Unclosed/);
});


test("attachments reuse private, draft, template and hidden path exclusions", async () => {
  for (const folder of ["private", "Private", "draft", "drafts", "template", "templates", ".hidden"]) {
    for (const target of ["diagram.png", `${folder}/diagram.png`, `/knowledge/${folder}/diagram.png`]) {
      const [note] = await buildNotes([file("Public", `![[${target}]] ![image](${target})`)], [`knowledge/${folder}/diagram.png`]);
      assert.deepEqual(note.attachments, []);
      assert.doesNotMatch(note.html, /<img/);
    }
  }
});

test("retains public images, rejects collisions and traversal, and handles explicit paths", async () => {
  const assets = ["knowledge/private/diagram.png", "knowledge/images/diagram.png", "knowledge/a/shared.png", "knowledge/b/shared.png", "outside/leak.png", "knowledge/../leak.png", "knowledge/link/../leak.png"];
  const [note] = await buildNotes([file("folder/Public", "![[diagram.png]] ![public](../images/diagram.png) ![[a/shared.png]] ![[shared.png]] ![[../../outside/leak.png]] ![[private/diagram.png]]")], assets);
  assert.deepEqual(note.attachments, ["knowledge/images/diagram.png", "knowledge/a/shared.png"]);
  assert.equal((note.html.match(/<img/g) ?? []).length, 3);
});


test("delimiter-prefix YAML keys cannot hide later publication flags", async () => {
  for (const opening of ["---", "---yaml", "---yml", "--- yaml", "--- yml"]) {
    for (const newline of ["\n", "\r\n"]) {
      for (const nearMiss of ["---custom: value", "----: value", "---#custom: value"]) {
        const source = [opening, "title: Example", nearMiss, "private: true", "---", "Synthetic private body"].join(newline);
        assert.equal(parseNoteMetadata(source).data.private, true);
        assert.deepEqual(await buildNotes([file("Example", source)]), []);
      }
    }
  }
  for (const flag of ["draft: true", "publish: false", "published: false", "status: private", "status: draft"]) {
    assert.deepEqual(await buildNotes([file("Example", `---\ntitle: Example\n---custom: value\n${flag}\n---\nSynthetic body`)]), []);
  }
});

test("exact closing lines preserve all metadata and the unmodified body", () => {
  for (const newline of ["\n", "\r\n"]) {
    for (const close of ["---", "--- \t"]) {
      const body = `First${newline}${newline}---custom: body text${newline}`;
      const source = ["---yaml", "title: Example", "---custom: value", "private: false", close, body].join(newline);
      const parsed = parseNoteMetadata(source);
      assert.deepEqual(parsed.data, {title: "Example", "---custom": "value", private: false});
      assert.equal(parsed.content, body);
    }
  }
  assert.deepEqual(parseNoteMetadata("---\n---"), {data: {}, content: ""});
  assert.equal(parseNoteMetadata("---\ntitle: Example\n---").data.title, "Example");
});

test("near-misses do not close metadata and malformed roots fail without source disclosure", () => {
  for (const close of ["---custom: value", "----", "--- # comment", " ---", "---\rprivate: true", "---\u2028private: true"]) {
    assert.throws(() => parseNoteMetadata(`---\ntitle: Example\n${close}`), /Unclosed YAML/);
  }
  for (const metadata of ["title: Example\n--- custom: value\nprivate: true", "private: [broken", "- private", "null", "scalar", "2026-01-02", "private: true\nprivate: false", "private: !!js/function function() {}"]) {
    assert.throws(() => parseNoteMetadata(`---\n${metadata}\n---\nSynthetic body`), {message: "Invalid YAML note metadata"});
  }
  assert.throws(() => parseNoteMetadata("---\ntitle: Example\n---custom: [broken\nprivate: true\n---\nBody"), /Invalid YAML/);
});
