import { decryptProviderSecret } from "./ai-provider-security";
import { ProviderPoolUnavailableError, runSharedProviderPool } from "./ai-provider-pool";
import { requestWithProvider } from "./ai-provider-adapters";
import type { ProviderCandidate, ProviderConfigRow } from "./ai-provider-types";
import { createServiceClient } from "./ai-providers-server";

const utcDate = () => new Date().toISOString().slice(0, 10);

export async function askSharedAI(systemInstruction: string, userText: string, maxOutputTokens = 220): Promise<string> {
  const admin = createServiceClient();
  if (!admin) throw new ProviderPoolUnavailableError();
  const { data: rows, error: configError } = await admin
    .from("ai_provider_configs")
    .select("id,owner_scope,provider_type,model,endpoint_url,daily_token_limit,enabled,priority,custom_header_names,credential_set_at,secret_ciphertext,secret_iv,secret_tag,created_at,updated_at")
    .eq("enabled", true)
    .order("priority", { ascending: true });
  if (configError || !rows) throw new ProviderPoolUnavailableError();
  if (!rows.length) throw new ProviderPoolUnavailableError();

  const today = utcDate();
  const ids = rows.map((row) => row.id as string);
  const { data: usageRows, error: usageError } = await admin
    .from("ai_provider_daily_usage")
    .select("provider_id,tokens_used,quota_exhausted")
    .eq("usage_date", today)
    .in("provider_id", ids);
  if (usageError || !usageRows) throw new ProviderPoolUnavailableError();
  const usage = new Map<string, { tokens: number; exhausted: boolean }>();
  for (const row of usageRows) usage.set(row.provider_id as string, {
    tokens: Number(row.tokens_used) || 0,
    exhausted: Boolean(row.quota_exhausted),
  });

  const candidates: ProviderCandidate[] = [];
  for (const raw of rows) {
    const row = raw as ProviderConfigRow;
    try {
      const daily = usage.get(row.id);
      candidates.push({
        id: row.id,
        ownerScope: row.owner_scope,
        providerType: row.provider_type,
        model: row.model,
        endpointUrl: row.endpoint_url,
        enabled: row.enabled,
        dailyTokenLimit: row.daily_token_limit,
        tokensUsedToday: daily?.tokens || 0,
        quotaExhaustedToday: daily?.exhausted || false,
        priority: row.priority,
        secret: decryptProviderSecret(row),
      });
    } catch {
      // A corrupt/missing encrypted record is skipped; secret material is never logged.
    }
  }
  if (!candidates.length) throw new ProviderPoolUnavailableError();

  const result = await runSharedProviderPool(
    candidates,
    (candidate) => requestWithProvider(candidate, { systemInstruction, userText, maxOutputTokens }),
    async (providerId, totalTokens) => {
      const { error } = await admin.rpc("record_ai_provider_usage", {
        p_provider_id: providerId,
        p_usage_date: today,
        p_tokens: Math.max(0, Math.floor(totalTokens)),
      });
      if (error) throw error;
    },
    async (providerId) => {
      const { error } = await admin.rpc("mark_ai_provider_daily_quota", {
        p_provider_id: providerId,
        p_usage_date: today,
      });
      if (error) throw error;
    },
  );
  return result.value.text;
}
