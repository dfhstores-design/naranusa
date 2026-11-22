import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { EncryptedProviderSecret, ProviderConfigRow, ProviderMetadata, ProviderScope, ProviderSecretPayload } from "./ai-provider-types.ts";

export function providerScopeForRole(role: unknown): ProviderScope | null {
  if (role === "teacher" || role === "admin") return "teacher_admin";
  if (role === "owner") return "application_owner";
  return null;
}

export function canAccessProviderScope(role: unknown, requestedScope: ProviderScope): boolean {
  return providerScopeForRole(role) === requestedScope;
}

function getEncryptionKey(keyInput = process.env.AI_CONFIG_ENCRYPTION_KEY): Buffer {
  if (!keyInput) throw new Error("AI_CONFIG_ENCRYPTION_KEY is not configured.");
  const key = /^[a-f0-9]{64}$/i.test(keyInput) ? Buffer.from(keyInput, "hex") : Buffer.from(keyInput, "base64");
  if (key.length !== 32) throw new Error("AI_CONFIG_ENCRYPTION_KEY must encode exactly 32 bytes as base64 or 64 hex characters.");
  return key;
}

export function encryptProviderSecret(payload: ProviderSecretPayload, keyInput?: string): EncryptedProviderSecret {
  const key = getEncryptionKey(keyInput);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    secret_ciphertext: ciphertext.toString("base64"),
    secret_iv: iv.toString("base64"),
    secret_tag: tag.toString("base64"),
  };
}

export function decryptProviderSecret(secret: EncryptedProviderSecret, keyInput?: string): ProviderSecretPayload {
  const key = getEncryptionKey(keyInput);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(secret.secret_iv, "base64"));
  decipher.setAuthTag(Buffer.from(secret.secret_tag, "base64"));
  const cleartext = Buffer.concat([
    decipher.update(Buffer.from(secret.secret_ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
  const parsed: unknown = JSON.parse(cleartext);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Stored provider secret is invalid.");
  const record = parsed as Record<string, unknown>;
  const apiKey = typeof record.apiKey === "string" ? record.apiKey : undefined;
  const headers = record.headers && typeof record.headers === "object" && !Array.isArray(record.headers)
    ? Object.fromEntries(Object.entries(record.headers).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
    : undefined;
  return { ...(apiKey ? { apiKey } : {}), ...(headers ? { headers } : {}) };
}

export function toProviderMetadata(row: Pick<ProviderConfigRow, "id" | "provider_type" | "model" | "endpoint_url" | "daily_token_limit" | "enabled" | "priority" | "custom_header_names" | "credential_set_at" | "created_at" | "updated_at">): ProviderMetadata {
  return {
    id: row.id,
    providerType: row.provider_type,
    model: row.model,
    endpointUrl: row.endpoint_url,
    dailyTokenLimit: row.daily_token_limit,
    enabled: row.enabled,
    priority: row.priority,
    hasCredentials: Boolean(row.credential_set_at),
    customHeaderNames: Array.isArray(row.custom_header_names) ? [...row.custom_header_names] : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
