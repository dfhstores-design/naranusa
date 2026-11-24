import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve("out");
if (!existsSync(root)) {
  console.error("Static export is missing: build the site before verifying it.");
  process.exit(1);
}

const files = [];
async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.isFile()) files.push(path);
  }
}
await collect(root);

const bannedNames = /(?:^|\/)(?:\.env(?:\..*)?|[^/]*(?:question[-_ ]?bank|soal[-_ ]?bank)[^/]*)$/i;
const bannedStrings = [
  ["answer-key field identifier", /(?:answerIndex|answer_index|answerKey|correctAnswer|correct_answer|jawabanBenar|kunciJawaban)/i],
  ["serialized question-bank reference", /question[-_]bank\.json/i],
  ["password hash or salt field", /(?:password_hash|passwordHash|\bsalt\b)/i],
  ["Google API key", /AIza[0-9A-Za-z_-]{30,}/],
  ["OpenAI or other sk-style secret", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,})\b/],
  ["AWS access key", /\bAKIA[0-9A-Z]{16}\b/],
  ["Google OAuth client secret", /\bGOCSPX-[A-Za-z0-9_-]{20,}\b/],
  ["private key material", /-----BEGIN (?:RSA|EC|OPENSSH|PRIVATE) KEY-----/],
  ["JWT-like credential", /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}\b/],
  ["email address", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ["Indonesian mobile number", /(?<!\d)(?:\+?62|0)8\d{8,12}(?!\d)/],
  ["NIK-shaped personal identifier", /(?<!\d)[1-9]\d{5}(?:0[1-9]|[12]\d|3[01]|4[1-6]|5\d|6\d|7[01])(?:0[1-9]|1[0-2])\d{2}\d{4}(?!\d)/],
];

const problems = [];
for (const path of files) {
  const name = relative(root, path).replaceAll("\\", "/");
  if (bannedNames.test(name)) problems.push(`${name}: forbidden artifact filename`);
  const content = (await readFile(path)).toString("utf8");
  for (const [label, pattern] of bannedStrings) {
    if (pattern.test(content)) problems.push(`${name}: contains ${label}`);
  }
}

if (problems.length) {
  console.error(`Public export safety check failed (${problems.length} finding(s)):`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Public export safety check passed (${files.length} files scanned).`);
