import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { encryptProviderSecret, decryptProviderSecret, providerScopeForRole, canAccessProviderScope, toProviderMetadata } from "../src/lib/ai-provider-security.ts";
import { ProviderRequestError, isDailyQuotaError, runSharedProviderPool, selectEligibleProviders } from "../src/lib/ai-provider-pool.ts";
import { getLearnerAvailableQuestions, getLearnerQuestionsForTopic } from "../src/lib/learner-questions.ts";

const root = new URL("../src/content/", import.meta.url);
const questions = JSON.parse(readFileSync(new URL("question-bank.json", root), "utf8")) as Array<Record<string, unknown> & {
  id: string; subjectId: string; topicId: string; stem: string; choices: string[]; answerIndex: number;
  explanation: string; sourceIds: string[]; sourceLocator: string; type: string; reviewStatus: string; learnerAvailability: string;
}>;

test("role scope memisahkan konfigurasi Guru/Admin dan Owner", () => {
  assert.equal(providerScopeForRole("teacher"), "teacher_admin");
  assert.equal(providerScopeForRole("admin"), "teacher_admin");
  assert.equal(providerScopeForRole("owner"), "application_owner");
  assert.equal(providerScopeForRole("student"), null);
  assert.equal(canAccessProviderScope("teacher", "teacher_admin"), true);
  assert.equal(canAccessProviderScope("teacher", "application_owner"), false);
  assert.equal(canAccessProviderScope("owner", "teacher_admin"), false);
  assert.equal(canAccessProviderScope("owner", "application_owner"), true);
});

test("rahasia dienkripsi, dapat dipulihkan di server, dan metadata tidak memuat secret", () => {
  const key = Buffer.alloc(32, 7).toString("base64");
  const payload = { apiKey: "mock-secret-api-key", headers: { Authorization: "Bearer mock-header-secret" } };
  const encrypted = encryptProviderSecret(payload, key);
  assert.equal(decryptProviderSecret(encrypted, key).apiKey, payload.apiKey);
  assert.deepEqual(decryptProviderSecret(encrypted, key).headers, payload.headers);
  assert.doesNotMatch(JSON.stringify(encrypted), /mock-secret/);
  const metadata = toProviderMetadata({
    id: "config-1", provider_type: "custom", model: "mock-model", endpoint_url: "https://api.example.test/v1",
    daily_token_limit: 9000, enabled: true, priority: 5, custom_header_names: ["Authorization"],
    credential_set_at: "2026-01-01T00:00:00Z", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z",
  });
  assert.equal(metadata.hasCredentials, true);
  assert.deepEqual(metadata.customHeaderNames, ["Authorization"]);
  assert.equal("apiKey" in metadata, false);
  assert.equal("headers" in metadata, false);
  assert.equal("secret_ciphertext" in metadata, false);
});

test("provider yang mencapai kuota harian ditandai lalu pool failover ke provider berikutnya", async () => {
  const providers = [
    { id: "quota", ownerScope: "teacher_admin" as const, providerType: "gemini" as const, model: "mock", endpointUrl: null, enabled: true, dailyTokenLimit: null, tokensUsedToday: 0, quotaExhaustedToday: false, priority: 1, secret: { apiKey: "mock" } },
    { id: "backup", ownerScope: "application_owner" as const, providerType: "openai" as const, model: "mock", endpointUrl: null, enabled: true, dailyTokenLimit: 100, tokensUsedToday: 10, quotaExhaustedToday: false, priority: 2, secret: { apiKey: "mock" } },
  ];
  assert.equal(isDailyQuotaError(new ProviderRequestError("daily token quota exceeded", 429, "RESOURCE_EXHAUSTED")), true);
  const attempted: string[] = [];
  const marked: string[] = [];
  const used: Array<[string, number]> = [];
  const result = await runSharedProviderPool(
    providers,
    async (provider) => {
      attempted.push(provider.id);
      if (provider.id === "quota") throw new ProviderRequestError("daily token quota exceeded", 429, "RESOURCE_EXHAUSTED");
      return { text: "mock answer", totalTokens: 17 };
    },
    async (providerId, tokens) => { used.push([providerId, tokens]); },
    async (providerId) => { marked.push(providerId); },
  );
  assert.deepEqual(attempted, ["quota", "backup"]);
  assert.deepEqual(marked, ["quota"]);
  assert.deepEqual(used, [["backup", 17]]);
  assert.equal(result.providerId, "backup");
  assert.equal(result.value.text, "mock answer");
  assert.deepEqual(selectEligibleProviders([
    { id: "at-limit", enabled: true, dailyTokenLimit: 10, tokensUsedToday: 10, quotaExhaustedToday: false, priority: 1 },
    { id: "marked", enabled: true, dailyTokenLimit: null, tokensUsedToday: 0, quotaExhaustedToday: true, priority: 2 },
    { id: "good", enabled: true, dailyTokenLimit: 10, tokensUsedToday: 9, quotaExhaustedToday: false, priority: 3 },
  ]).map((item) => item.id), ["good"]);
});

test("semua 130 soal tersedia untuk murid, lima per topik, tetap menunggu tinjauan guru", () => {
  assert.equal(questions.length, 130);
  assert.equal(new Set(questions.map((question) => question.id)).size, 130);
  const available = getLearnerAvailableQuestions(questions);
  assert.equal(available.length, 130);
  const counts = new Map<string, number>();
  for (const question of questions) {
    counts.set(question.topicId, (counts.get(question.topicId) || 0) + 1);
    assert.equal(question.learnerAvailability, "available", question.id);
    assert.equal(question.reviewStatus, "needs_teacher_review", question.id);
    assert.equal(question.type, "multiple-choice", question.id);
    assert.equal(question.choices.length, 4, question.id);
    assert.ok(question.answerIndex >= 0 && question.answerIndex < 4, question.id);
    assert.ok(question.explanation.trim(), question.id);
    assert.ok(question.sourceIds.length > 0 && question.sourceLocator.trim(), question.id);
  }
  assert.equal(counts.size, 26);
  assert.ok([...counts.values()].every((count) => count === 5));
  assert.equal(getLearnerQuestionsForTopic(available, "mtk-bilangan").length, 5);
  assert.ok(questions.some((question) => question.id === "q-mtk-place-value-001"));
  assert.ok(questions.some((question) => question.id === "q-indo-persuasif-001"));
  assert.ok(questions.some((question) => question.id === "q-ipas-energy-001"));
  assert.ok(questions.some((question) => question.id === "q-pancasila-duty-001"));
  assert.equal(new Set(questions.map((question) => question.stem.trim().toLocaleLowerCase("id-ID"))).size, 130);
});
