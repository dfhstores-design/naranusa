import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { providerScopeForRole } from "./ai-provider-security";
import type { ProviderScope } from "./ai-provider-types";

type AuthorizedProviderUser = {
  ok: true;
  userId: string;
  role: string;
  scope: ProviderScope;
  admin: SupabaseClient;
};

type AuthorizationFailure = { ok: false; status: 401 | 403 | 503; error: string };
export type ProviderAuthorization = AuthorizedProviderUser | AuthorizationFailure;

function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function createServiceClient(): SupabaseClient | null {
  const url = supabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function authorizeProviderRequest(request: Request, requiredScope?: ProviderScope): Promise<ProviderAuthorization> {
  const url = supabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const admin = createServiceClient();
  if (!url || !anonKey || !admin) {
    return { ok: false, status: 503, error: "Konfigurasi autentikasi server belum lengkap." };
  }
  const authorization = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) return { ok: false, status: 401, error: "Silakan masuk kembali untuk mengelola konfigurasi." };

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${match[1]}` } },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(match[1]);
  if (authError || !user) return { ok: false, status: 401, error: "Sesi masuk tidak valid atau sudah kedaluwarsa." };

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || !profile?.role || typeof profile.role !== "string") {
    return { ok: false, status: 403, error: "Profil peran tidak dapat diverifikasi." };
  }
  const scope = providerScopeForRole(profile.role);
  if (!scope || (requiredScope && scope !== requiredScope)) {
    return { ok: false, status: 403, error: "Peran akun ini tidak memiliki akses ke konfigurasi tersebut." };
  }
  return { ok: true, userId: user.id, role: profile.role, scope, admin };
}
