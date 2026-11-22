import { isIP } from "node:net";
import { AI_PROVIDER_TYPES, type AIProviderType, type ProviderConfigInput, type ProviderSecretPayload } from "./ai-provider-types.ts";

export type ProviderInputResult = { ok: true; value: ProviderConfigInput } | { ok: false; error: string };

function isUnsafeIp(hostname: string): boolean {
  const version = isIP(hostname);
  if (version === 4) {
    const parts = hostname.split(".").map(Number);
    return parts[0] === 0 || parts[0] === 10 || parts[0] === 127
      || (parts[0] === 169 && parts[1] === 254)
      || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
      || (parts[0] === 192 && parts[1] === 168)
      || (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127);
  }
  if (version === 6) {
    const lower = hostname.toLowerCase();
    return lower === "::1" || lower === "::" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80:") || lower.startsWith("::ffff:127.");
  }
  return false;
}

export function isSafeCustomEndpoint(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (url.protocol !== "https:" || url.username || url.password || url.hash || url.search) return false;
    if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal") || hostname === "metadata.google.internal") return false;
    if (isUnsafeIp(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function parseHeaders(value: unknown): Record<string, string> | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Header kustom harus berupa objek JSON.");
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 24) throw new Error("Maksimal 24 header kustom.");
  const headers: Record<string, string> = {};
  const forbidden = new Set(["host", "content-length", "connection", "transfer-encoding", "proxy-authorization", "set-cookie"]);
  for (const [name, raw] of entries) {
    if (!/^[A-Za-z0-9-]{1,80}$/.test(name) || forbidden.has(name.toLowerCase())) throw new Error("Nama header kustom tidak valid atau dilarang.");
    if (typeof raw !== "string" || raw.length > 2048 || /[\r\n]/.test(raw)) throw new Error("Nilai header kustom tidak valid.");
    headers[name] = raw;
  }
  return headers;
}

export function validateProviderInput(body: unknown, options: { requireSecret: boolean }): ProviderInputResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "Isi konfigurasi tidak valid." };
  const data = body as Record<string, unknown>;
  if (!AI_PROVIDER_TYPES.includes(data.providerType as AIProviderType)) return { ok: false, error: "Pilih penyedia AI yang didukung." };
  if (typeof data.model !== "string" || !/^[A-Za-z0-9._:/-]{1,120}$/.test(data.model)) return { ok: false, error: "Nama model tidak valid." };

  const providerType = data.providerType as AIProviderType;
  let endpointUrl: string | null = null;
  if (providerType === "custom") {
    if (!isSafeCustomEndpoint(data.endpointUrl)) return { ok: false, error: "Endpoint kustom harus berupa URL HTTPS publik yang valid; alamat lokal dan IP privat tidak diizinkan." };
    endpointUrl = data.endpointUrl;
  }

  let dailyTokenLimit: number | null = null;
  if (data.dailyTokenLimit !== undefined && data.dailyTokenLimit !== null && data.dailyTokenLimit !== "") {
    const parsed = typeof data.dailyTokenLimit === "number" ? data.dailyTokenLimit : Number(data.dailyTokenLimit);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 10_000_000_000) return { ok: false, error: "Batas token harian harus berupa bilangan bulat positif." };
    dailyTokenLimit = parsed;
  }

  const enabled = data.enabled === undefined ? true : data.enabled;
  if (typeof enabled !== "boolean") return { ok: false, error: "Status aktif tidak valid." };
  const priority = data.priority === undefined || data.priority === "" ? 100 : Number(data.priority);
  if (!Number.isInteger(priority) || priority < 0 || priority > 10_000) return { ok: false, error: "Prioritas harus bilangan bulat 0–10000." };

  try {
    const apiKey = typeof data.apiKey === "string" && data.apiKey.trim() ? data.apiKey.trim() : undefined;
    if (typeof data.apiKey === "string" && data.apiKey.length > 4096) return { ok: false, error: "Kunci API terlalu panjang." };
    const headers = parseHeaders(data.customHeaders);
    const secret: ProviderSecretPayload | undefined = apiKey || (headers && Object.keys(headers).length > 0)
      ? { ...(apiKey ? { apiKey } : {}), ...(headers ? { headers } : {}) }
      : undefined;

    if (options.requireSecret && providerType !== "custom" && !apiKey) return { ok: false, error: "Kunci API wajib diisi untuk penyedia ini." };
    if (options.requireSecret && providerType === "custom" && !secret) return { ok: false, error: "Isi kunci API atau sedikitnya satu header autentikasi kustom." };

    return {
      ok: true,
      value: { providerType, model: data.model, endpointUrl, dailyTokenLimit, enabled, priority, ...(secret ? { secret } : {}) },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Header kustom tidak valid." };
  }
}
