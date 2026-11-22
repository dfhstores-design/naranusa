import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { ProviderCandidate, ProviderRequestResult } from "./ai-provider-types";
import { ProviderRequestError } from "./ai-provider-pool";

const ANTHROPIC_VERSION = "2026-10-21";
const MAX_RESPONSE_BYTES = 1_000_000;

type ChatPrompt = { systemInstruction: string; userText: string; maxOutputTokens: number };

type ProviderErrorBody = {
  error?: { code?: unknown; type?: unknown; status?: unknown; message?: unknown };
  code?: unknown;
  message?: unknown;
};

function safeString(value: unknown): string {
  return typeof value === "string" ? value.slice(0, 500) : "";
}

function assertPublicAddress(address: string) {
  const version = isIP(address);
  if (version === 4) {
    const p = address.split(".").map(Number);
    const privateOrLocal = p[0] === 0 || p[0] === 10 || p[0] === 127 || (p[0] === 169 && p[1] === 254)
      || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168)
      || (p[0] === 100 && p[1] >= 64 && p[1] <= 127) || p[0] >= 224;
    if (privateOrLocal) throw new Error("Custom endpoint resolves to a non-public address.");
  } else if (version === 6) {
    const lower = address.toLowerCase();
    if (lower === "::" || lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80:") || lower.startsWith("::ffff:127.")) {
      throw new Error("Custom endpoint resolves to a non-public address.");
    }
  }
}

async function assertSafeCustomHost(endpoint: string) {
  const url = new URL(endpoint);
  const records = await lookup(url.hostname, { all: true, verbatim: true });
  if (!records.length) throw new Error("Custom endpoint host could not be resolved.");
  for (const record of records) assertPublicAddress(record.address);
}

function compatibleEndpoint(candidate: ProviderCandidate): string {
  if (candidate.providerType === "openai") return "https://api.openai.com/v1/chat/completions";
  if (candidate.providerType === "deepseek") return "https://api.deepseek.com/chat/completions";
  const base = candidate.endpointUrl;
  if (!base) throw new Error("Custom provider endpoint is missing.");
  const clean = base.replace(/\/+$/, "");
  return clean.endsWith("/chat/completions") ? clean : `${clean}/chat/completions`;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length > MAX_RESPONSE_BYTES) throw new ProviderRequestError("Provider response exceeded the safe size limit.", response.status, "response_too_large");
  try { return JSON.parse(text) as unknown; } catch { return {}; }
}

async function postJson(url: string, headers: Record<string, string>, body: unknown, provider: string): Promise<{ response: Response; data: unknown }> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  const data = await readJson(response);
  if (!response.ok) {
    const error = data && typeof data === "object" ? data as ProviderErrorBody : {};
    const providerError = error.error && typeof error.error === "object" ? error.error : {};
    const code = safeString(providerError.code) || safeString(providerError.type) || safeString(providerError.status) || safeString(error.code);
    const message = safeString(providerError.message) || safeString(error.message);
    throw new ProviderRequestError(`${provider}: ${message || `HTTP ${response.status}`}`, response.status, code);
  }
  return { response, data };
}

function extractOpenAI(data: unknown): ProviderRequestResult {
  const root = data && typeof data === "object" ? data as Record<string, unknown> : {};
  const choices = Array.isArray(root.choices) ? root.choices : [];
  const message = choices[0] && typeof choices[0] === "object" ? (choices[0] as Record<string, unknown>).message : null;
  const content = message && typeof message === "object" ? (message as Record<string, unknown>).content : "";
  const usage = root.usage && typeof root.usage === "object" ? root.usage as Record<string, unknown> : {};
  const text = typeof content === "string" ? content.trim() : "";
  if (!text) throw new ProviderRequestError("Provider returned no text.", undefined, "empty_response");
  return { text, totalTokens: Number.isFinite(Number(usage.total_tokens)) ? Math.max(0, Number(usage.total_tokens)) : 0 };
}

export async function requestWithProvider(candidate: ProviderCandidate, prompt: ChatPrompt): Promise<ProviderRequestResult> {
  const { providerType, model, secret } = candidate;
  if (providerType === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const { data } = await postJson(url, { "x-goog-api-key": secret.apiKey || "" }, {
      systemInstruction: { parts: [{ text: prompt.systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: prompt.userText }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: prompt.maxOutputTokens },
    }, "Gemini");
    const root = data && typeof data === "object" ? data as Record<string, unknown> : {};
    const candidates = Array.isArray(root.candidates) ? root.candidates : [];
    const content = candidates[0] && typeof candidates[0] === "object" ? (candidates[0] as Record<string, unknown>).content : null;
    const parts = content && typeof content === "object" && Array.isArray((content as Record<string, unknown>).parts) ? (content as Record<string, unknown>).parts as unknown[] : [];
    const text = parts.map((part) => part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string" ? (part as Record<string, unknown>).text : "").join(" ").trim();
    const usage = root.usageMetadata && typeof root.usageMetadata === "object" ? root.usageMetadata as Record<string, unknown> : {};
    if (!text) throw new ProviderRequestError("Gemini returned no text.", undefined, "empty_response");
    return { text, totalTokens: Number.isFinite(Number(usage.totalTokenCount)) ? Math.max(0, Number(usage.totalTokenCount)) : 0 };
  }

  if (providerType === "claude") {
    const { data } = await postJson("https://api.anthropic.com/v1/messages", {
      "x-api-key": secret.apiKey || "",
      "anthropic-version": ANTHROPIC_VERSION,
    }, {
      model,
      max_tokens: prompt.maxOutputTokens,
      system: prompt.systemInstruction,
      messages: [{ role: "user", content: prompt.userText }],
    }, "Claude");
    const root = data && typeof data === "object" ? data as Record<string, unknown> : {};
    const content = Array.isArray(root.content) ? root.content : [];
    const text = content.map((part) => part && typeof part === "object" && typeof (part as Record<string, unknown>).text === "string" ? (part as Record<string, unknown>).text : "").join(" ").trim();
    const usage = root.usage && typeof root.usage === "object" ? root.usage as Record<string, unknown> : {};
    if (!text) throw new ProviderRequestError("Claude returned no text.", undefined, "empty_response");
    return { text, totalTokens: Math.max(0, Number(usage.input_tokens) || 0) + Math.max(0, Number(usage.output_tokens) || 0) };
  }

  const endpoint = compatibleEndpoint(candidate);
  if (providerType === "custom") await assertSafeCustomHost(endpoint);
  const headers: Record<string, string> = {};
  if (providerType === "custom") {
    for (const [name, value] of Object.entries(secret.headers || {})) headers[name] = value;
  }
  const hasAuthorization = Object.keys(headers).some((name) => name.toLowerCase() === "authorization" || name.toLowerCase() === "x-api-key");
  if (secret.apiKey && !hasAuthorization) headers.Authorization = `Bearer ${secret.apiKey}`;
  if (providerType !== "custom" && secret.apiKey) headers.Authorization = `Bearer ${secret.apiKey}`;
  const { data } = await postJson(endpoint, headers, {
    model,
    messages: [
      { role: "system", content: prompt.systemInstruction },
      { role: "user", content: prompt.userText },
    ],
    temperature: 0.2,
    max_tokens: prompt.maxOutputTokens,
  }, providerType === "deepseek" ? "DeepSeek" : providerType === "openai" ? "OpenAI" : "Custom provider");
  return extractOpenAI(data);
}
