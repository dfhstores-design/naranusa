import { NextResponse } from "next/server";
import { encryptProviderSecret, toProviderMetadata } from "@/lib/ai-provider-security";
import { authorizeProviderRequest } from "@/lib/ai-providers-server";
import { validateProviderInput } from "@/lib/ai-provider-validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await authorizeProviderRequest(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { data, error } = await auth.admin
    .from("ai_provider_configs")
    .select("id,owner_scope,provider_type,model,endpoint_url,daily_token_limit,enabled,priority,custom_header_names,credential_set_at,secret_ciphertext,secret_iv,secret_tag,created_at,updated_at")
    .eq("owner_scope", auth.scope)
    .order("priority", { ascending: true });
  if (error || !data) return NextResponse.json({ error: "Konfigurasi AI belum dapat dimuat." }, { status: 503 });
  return NextResponse.json({ providers: data.map((row) => toProviderMetadata(row)) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const auth = await authorizeProviderRequest(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Isi konfigurasi tidak dapat dibaca." }, { status: 400 }); }
  const parsed = validateProviderInput(body, { requireSecret: true });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (!parsed.value.secret) return NextResponse.json({ error: "Kredensial provider wajib diisi." }, { status: 400 });

  let encrypted;
  try { encrypted = encryptProviderSecret(parsed.value.secret); } catch { return NextResponse.json({ error: "Kunci enkripsi AI server belum dikonfigurasi dengan benar." }, { status: 503 }); }
  const { data, error } = await auth.admin.from("ai_provider_configs").insert({
    owner_scope: auth.scope,
    provider_type: parsed.value.providerType,
    model: parsed.value.model,
    endpoint_url: parsed.value.endpointUrl,
    daily_token_limit: parsed.value.dailyTokenLimit,
    enabled: parsed.value.enabled,
    priority: parsed.value.priority,
    custom_header_names: Object.keys(parsed.value.secret.headers || {}),
    credential_set_at: new Date().toISOString(),
    ...encrypted,
  }).select("id,owner_scope,provider_type,model,endpoint_url,daily_token_limit,enabled,priority,custom_header_names,credential_set_at,secret_ciphertext,secret_iv,secret_tag,created_at,updated_at").single();
  if (error || !data) return NextResponse.json({ error: "Konfigurasi tidak dapat disimpan. Periksa migrasi database." }, { status: 503 });
  return NextResponse.json({ provider: toProviderMetadata(data) }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
