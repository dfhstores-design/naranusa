import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Next.js exports to the repository subfolder", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*"export"/);
  assert.match(config, /basePath:\s*"\/naranusa"/);
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
  assert.match(worker, /naranusa-shell-v3/);
  assert.match(worker, /_next\/static/);
  assert.doesNotMatch(worker, /\.post\(|method:\s*["']POST/i);
});

test("deployment workflow blocks publication on public-artifact verification", () => {
  const workflow = read(".github/workflows/deploy.yml");
  assert.match(workflow, /pnpm verify:export/);
  assert.match(read("package.json"), /"verify:export"/);
});

test("login uses the approved palette and a reversible password visibility control", () => {
  const login = read("src/app/masuk/page.tsx");
  const css = read("src/app/globals.css");
  assert.match(login, /type=\{showPassword \? "text" : "password"\}/);
  assert.match(login, /aria-pressed=\{showPassword\}/);
  assert.match(login, /Tampilkan kata sandi/);
  assert.match(login, /Sembunyikan kata sandi/);
  assert.match(css, /font-family: "Nunito Variable"/);
  assert.match(css, /\.login-art \.brand-link > span:last-child small \{[^}]*color: #2f315b/);
  assert.doesNotMatch(css, /(?:linear|radial|conic)-gradient\s*\(/i);
  assert.doesNotMatch(css, /#6654c9|#8474dc|#725de5|#4c3da2|#e9e5ff|#fcfbff|#8879df/i);
});
