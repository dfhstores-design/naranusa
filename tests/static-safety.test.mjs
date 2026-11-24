import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Next.js exports to the repository subfolder", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*"export"/);
  assert.match(config, /basePath:\s*"\/pwa-edukasi-kelas4"/);
  assert.match(config, /trailingSlash:\s*true/);
});

test("dynamic API routes and Supabase client are absent", () => {
  assert.equal(existsSync(new URL("../src/app/api", import.meta.url)), false);
  assert.equal(existsSync(new URL("../src/lib/supabase.ts", import.meta.url)), false);
  assert.doesNotMatch(read("package.json"), /@supabase\/supabase-js/);
});

test("student curriculum uses metadata rather than importing the question bank", () => {
  assert.doesNotMatch(read("src/content/curriculum.ts"), /question-bank/);
  assert.doesNotMatch(read("src/components/quiz-screen.tsx"), /question-bank/);
});

test("API wrapper grades through GAS and the worker only caches static app resources", () => {
  assert.match(read("src/components/quiz-screen.tsx"), /"answers\.submit"/);
  assert.match(read("src/components/quiz-screen.tsx"), /"questions\.forTopic"/);
  const worker = read("public/sw.js");
  assert.match(worker, /naranusa-shell-v2/);
  assert.match(worker, /_next\/static/);
  assert.doesNotMatch(worker, /\.post\(|method:\s*["']POST/i);
});

test("deployment workflow blocks publication on public-artifact verification", () => {
  const workflow = read(".github/workflows/deploy.yml");
  assert.match(workflow, /pnpm verify:export/);
  assert.match(read("package.json"), /"verify:export"/);
});
