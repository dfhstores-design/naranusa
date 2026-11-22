export const AI_PROVIDER_TYPES = ["gemini", "claude", "openai", "deepseek", "custom"] as const;

export type AIProviderType = (typeof AI_PROVIDER_TYPES)[number];
export type ProviderScope = "teacher_admin" | "application_owner";
export type LearnerAvailability = "available" | "hidden";
export type QuestionReviewStatus = "needs_teacher_review" | "teacher_approved";

export type ProviderSecretPayload = {
  apiKey?: string;
  headers?: Record<string, string>;
};

export type EncryptedProviderSecret = {
  secret_ciphertext: string;
  secret_iv: string;
  secret_tag: string;
};

export type ProviderConfigRow = {
  id: string;
  owner_scope: ProviderScope;
  provider_type: AIProviderType;
  model: string;
  endpoint_url: string | null;
  daily_token_limit: number | null;
  enabled: boolean;
  priority: number;
  custom_header_names: string[];
  credential_set_at: string | null;
  secret_ciphertext: string;
  secret_iv: string;
  secret_tag: string;
  created_at: string;
  updated_at: string;
};

export type ProviderMetadata = {
  id: string;
  providerType: AIProviderType;
  model: string;
  endpointUrl: string | null;
  dailyTokenLimit: number | null;
  enabled: boolean;
  priority: number;
  hasCredentials: boolean;
  customHeaderNames: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProviderCandidate = {
  id: string;
  ownerScope: ProviderScope;
  providerType: AIProviderType;
  model: string;
  endpointUrl: string | null;
  enabled: boolean;
  dailyTokenLimit: number | null;
  tokensUsedToday: number;
  quotaExhaustedToday: boolean;
  priority: number;
  secret: ProviderSecretPayload;
};

export type ProviderRequestResult = {
  text: string;
  totalTokens: number;
};

export type ProviderConfigInput = {
  providerType: AIProviderType;
  model: string;
  endpointUrl: string | null;
  dailyTokenLimit: number | null;
  enabled: boolean;
  priority: number;
  secret?: ProviderSecretPayload;
};
