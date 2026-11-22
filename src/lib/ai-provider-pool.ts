export type QuotaCandidate = {
  id: string;
  enabled: boolean;
  dailyTokenLimit: number | null;
  tokensUsedToday: number;
  quotaExhaustedToday: boolean;
  priority: number;
};

export class ProviderPoolUnavailableError extends Error {
  constructor() {
    super("No configured AI provider is currently available.");
    this.name = "ProviderPoolUnavailableError";
  }
}

export class ProviderRequestError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ProviderRequestError";
    this.status = status;
    this.code = code;
  }
}

export function isDailyQuotaError(error: unknown): boolean {
  const candidate = error as { status?: unknown; code?: unknown; message?: unknown };
  const text = `${typeof candidate?.code === "string" ? candidate.code : ""} ${typeof candidate?.message === "string" ? candidate.message : ""}`.toLowerCase();
  return /resource[_ -]?exhausted|insufficient[_ -]?quota|daily|per[- ]day|day limit|token quota|quota.*token|quota.*day|daily.*limit/.test(text)
    || (candidate?.status === 429 && /quota|token|day|daily/.test(text));
}

export function selectEligibleProviders<T extends QuotaCandidate>(candidates: T[]): T[] {
  return candidates
    .filter((candidate) => candidate.enabled && !candidate.quotaExhaustedToday
      && (candidate.dailyTokenLimit === null || candidate.tokensUsedToday < candidate.dailyTokenLimit))
    .sort((left, right) => left.priority - right.priority);
}

export async function runSharedProviderPool<T extends QuotaCandidate, R extends { totalTokens: number }>(
  candidates: T[],
  call: (candidate: T) => Promise<R>,
  onUsage: (providerId: string, totalTokens: number) => Promise<void>,
  onDailyQuota: (providerId: string) => Promise<void>,
): Promise<{ providerId: string; value: R }> {
  const eligible = selectEligibleProviders(candidates);
  if (eligible.length === 0) throw new ProviderPoolUnavailableError();

  for (const candidate of eligible) {
    try {
      const value = await call(candidate);
      try {
        await onUsage(candidate.id, Math.max(0, Math.floor(value.totalTokens)));
      } catch {
        // Do not repeat a successful paid provider request if usage accounting is temporarily unavailable.
      }
      return { providerId: candidate.id, value };
    } catch (error) {
      if (isDailyQuotaError(error)) {
        try {
          await onDailyQuota(candidate.id);
        } catch {
          // Continue to a different configured provider even if writing the quota marker fails.
        }
      }
      // Provider errors are deliberately not returned to clients because their text can contain sensitive details.
    }
  }

  throw new ProviderPoolUnavailableError();
}
