import { NextResponse } from "next/server";
import { encryptProviderSecret, toProviderMetadata } from "@/lib/ai-provider-security";
import { authorizeProviderRequest } from "@/lib/ai-providers-server";
import { validateProviderInput } from "@/lib/ai-provider-validation";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  const auth = await authorizeProviderRequest(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "ID konfigurasi tidak valid." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Isi konfigurasi tidak dapat dibaca." }, { status: 400 }); }
  const { data: current, error: lookupError } = await auth.admin.from("ai_provider_configs")
    .select("id,provider_type,secret_ciphertext,secret_iv,secret_tag,custom_header_names")
    .eq("id", id).eq("owner_scope", auth.scope).maybeSingle();
  if (lookupError) return NextResponse.json({ error: "Konfigurasi tidak dapat diperiksa." }, { status: 503 });
  if (!current) return NextResponse.json({ error: "Konfigurasi tidak ditemukan." }, { status: 404 });

  const untrusted = body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {};
  const willChangeType = untrusted.providerType !== current.provider_type;
  const parsed = validateProviderInput(body, { requireSecret: willChangeType });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const patch: Record<string, unknown> = {
    provider_type: parsed.value.providerType,
    model: parsed.value.model,
    endpoint_url: parsed.value.endpointUrl,
    daily_token_limit: parsed.value.dailyTokenLimit,
    enabled: parsed.value.enabled,
    priority: parsed.value.priority,
    updated_at: new Date().toISOString(),
  };
  if (parsed.value.secret) {
    try { Object.assign(patch, encryptProviderSecret(parsed.value.secret)); } catch {
      return NextResponse.json({ error: "Kunci enkripsi AI server belum dikonfigurasi dengan benar." }, { status: 503 });
    }
    patch.credential_set_at = new Date().toISOString();
    patch.custom_header_names = Object.keys(parsed.value.secret.headers || {});
  }
  const { data, error } = await auth.admin.from("ai_provider_configs").update(patch)
    .eq("id", id).eq("owner_scope", auth.scope)
    .select("id,owner_scope,provider_type,model,endpoint_url,daily_token_limit,enabled,priority,custom_header_names,credential_set_at,secret_ciphertext,secret_iv,secret_tag,created_at,updated_at").single();
  if (error || !data) return NextResponse.json({ error: "Konfigurasi tidak dapat diperbarui." }, { status: 503 });
  return NextResponse.json({ provider: toProviderMetadata(data) }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request, context: Context) {
  const auth = await authorizeProviderRequest(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "ID konfigurasi tidak valid." }, { status: 400 });
  const { data, error } = await auth.admin.from("ai_provider_configs").delete()
    .eq("id", id).eq("owner_scope", auth.scope).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "Konfigurasi tidak dapat dihapus." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Konfigurasi tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
