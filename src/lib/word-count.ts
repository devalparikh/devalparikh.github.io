/**
 * Counts the words a reader reads in an MDX post: prose, headings, lists and
 * tables. Frontmatter, code, JSX figures, import/export lines, comments and
 * link targets are not prose, so they are skipped. Runs at build time; the
 * covers print the result and the shelf sizes books by it.
 *
 * Kept dependency-free so `node --experimental-strip-types` can test it.
 */
export function countWords(mdx: string): number {
  let text = mdx.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  text = text.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, " ");
  text = text.replace(/^(?:import|export)\s.*$/gm, " ");
  text = text.replace(/<!--[\s\S]*?-->|\{\/\*[\s\S]*?\*\/\}/g, " ");
  text = stripJsx(text);
  text = text.replace(/`[^`\n]*`/g, " ");
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, " ");
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu);
  return words?.length ?? 0;
}

/**
 * Removes JSX tags and `{expressions}`, skipping over quoted strings and
 * nested braces inside attributes so multi-line props never leak into prose.
 * Text between an opening and closing tag is kept - it is visible copy.
 */
function stripJsx(text: string): string {
  let out = "";
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    const next = text[index + 1] ?? "";
    if (char === "<" && /[A-Za-z/]/.test(next)) {
      index = skipTag(text, index);
      out += " ";
    } else if (char === "{") {
      index = skipBraces(text, index);
      out += " ";
    } else {
      out += char;
      index++;
    }
  }
  return out;
}

function skipTag(text: string, start: number): number {
  let index = start + 1;
  while (index < text.length) {
    const char = text[index];
    if (char === '"' || char === "'") index = text.indexOf(char, index + 1) + 1 || text.length;
    else if (char === "{") index = skipBraces(text, index);
    else if (char === ">") return index + 1;
    else index++;
  }
  return index;
}

function skipBraces(text: string, start: number): number {
  let depth = 0;
  let index = start;
  while (index < text.length) {
    const char = text[index];
    if (char === '"' || char === "'" || char === "`") {
      index = text.indexOf(char, index + 1) + 1 || text.length;
      continue;
    }
    if (char === "{") depth++;
    if (char === "}") depth--;
    index++;
    if (depth === 0) return index;
  }
  return index;
}

/** "6,861 words" - grouped so the cover footer reads at a glance. */
export function formatWordCount(words: number): string {
  return `${words.toLocaleString("en-US")} words`;
}
