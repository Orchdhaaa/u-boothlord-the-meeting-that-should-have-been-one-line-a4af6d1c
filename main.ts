// The Meeting That Should Have Been One Line — entry program.
// Writes one sentence to /output/entry.txt.
// The grader runs this with no arguments and no environment:
//   env -i /usr/bin/node main.ts
// Output directory: MAKEFUN_OUTPUT_DIR, then OUTPUT_DIR, then /output.
// The program never deletes or moves /output; it only creates entry.txt inside it.
// Deterministic: no network, no clock, no randomness; the same bytes every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "This meeting is just the email nobody read, read out loud.";

const MAX_CHARS = 200;

function outputDir() {
  const fromEnv =
    process.env.MAKEFUN_OUTPUT_DIR || process.env.OUTPUT_DIR || "";
  return fromEnv.trim() !== "" ? fromEnv : "/output";
}

// Enforce everything the gate and the brief require of the line, and
// return its character count. A single sentence: exactly one sentence
// ender, and it must be the final character. No em dash anywhere.
function validateEntry(text) {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`entry is ${chars} characters, gate needs 1-${MAX_CHARS}`);
  }
  if (text.trim() === "") {
    throw new Error("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.includes("\u2014")) {
    throw new Error("entry must not contain an em dash");
  }
  const enders = [...text].filter((ch) => ch === "." || ch === "!" || ch === "?");
  const last = text[text.length - 1];
  if (enders.length !== 1 || (last !== "." && last !== "!" && last !== "?")) {
    throw new Error("entry must be exactly one sentence");
  }
  return chars;
}

function main() {
  const chars = validateEntry(ENTRY);

  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, ENTRY, "utf8");

  // Read the file back and confirm it holds exactly the entry text.
  const written = readFileSync(target, "utf8");
  if (written !== ENTRY) {
    throw new Error("entry.txt does not match the entry text");
  }
  const bytes = Buffer.byteLength(written, "utf8");
  if (bytes !== Buffer.byteLength(ENTRY, "utf8")) {
    throw new Error("entry.txt byte length does not match the entry text");
  }
  // The brief's first criterion: the line must be unmistakably about the meeting itself.
  if (!/meeting/i.test(written) || !/email/i.test(written)) {
    throw new Error("entry text must mention the meeting and the email");
  }
  console.log(`wrote ${target} (${chars} characters, ${bytes} bytes)`);
}

main();
