"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import type { AIProviderType, ProviderMetadata } from "@/lib/ai-provider-types";

const labels: Record<AIProviderType, string> = {
  gemini: "Gemini",
  claude: "Claude",
  openai: "OpenAI",
  deepseek: "DeepSeek",
  custom: "Endpoint kustom (OpenAI-compatible)",
};
const defaultModels: Record<AIProviderType, string> = {
  gemini: "gemini-2.5-flash",
  claude: "claude-sonnet-4-5",
  openai: "gpt-4.1-mini",
  deepseek: "deepseek-chat",
  custom: "custom-model",
};

type FormState = {
  providerType: AIProviderType;
  model: string;
  endpointUrl: string;
  apiKey: string;
  customHeaders: string;
  dailyTokenLimit: string;
  enabled: boolean;
  priority: string;
};
const emptyForm = (): FormState => ({ providerType: "gemini", model: defaultModels.gemini, endpointUrl: "", apiKey: "", customHeaders: "", dailyTokenLimit: "", enabled: true, priority: "100" });

export default function AIProviderSettings({ scopeTitle }: { scopeTitle: string }) {
  const [accessToken, setAccessToken] = useState("");
  const [providers, setProviders] = useState<ProviderMetadata[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (token: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai-provider-configs", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Konfigurasi belum dapat dimuat.");
      setProviders(Array.isArray(data.providers) ? data.providers : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Konfigurasi belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      setError("Supabase Auth belum dikonfigurasi. Lengkapi URL dan anon key publik untuk masuk.");
      return;
    }
    void client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const token = data.session?.access_token || "";
      setAccessToken(token);
      if (token) void load(token);
      else {
        setLoading(false);
        setError("Silakan masuk melalui halaman Masuk menggunakan akun yang telah diberi peran Guru/Admin atau Owner.");
      }
    });
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const token = session?.access_token || "";
      setAccessToken(token);
      if (token) void load(token);
      else {
        setProviders([]);
        setLoading(false);
      }
    });
    return () => { mounted = false; subscription.subscription.unsubscribe(); };
  }, [load]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function beginEdit(provider: ProviderMetadata) {
    setEditingId(provider.id);
    setForm({
      providerType: provider.providerType,
      model: provider.model,
      endpointUrl: provider.endpointUrl || "",
      apiKey: "",
      customHeaders: "",
      dailyTokenLimit: provider.dailyTokenLimit === null ? "" : String(provider.dailyTokenLimit),
      enabled: provider.enabled,
      priority: String(provider.priority),
    });
    setNotice("Kunci tersimpan tidak dapat dibaca. Isi kunci atau header hanya jika ingin menggantinya; jika dibiarkan kosong, kredensial lama tetap dipakai.");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    let customHeaders: Record<string, string> | undefined;
    try {
      if (form.customHeaders.trim()) {
        const parsed: unknown = JSON.parse(form.customHeaders);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || Object.values(parsed).some((value) => typeof value !== "string")) throw new Error();
        customHeaders = parsed as Record<string, string>;
      }
    } catch {
      setSaving(false);
      setError("Header kustom harus berupa objek JSON berisi nama dan nilai teks.");
      return;
    }
    const payload: Record<string, unknown> = {
      providerType: form.providerType,
      model: form.model,
      endpointUrl: form.providerType === "custom" ? form.endpointUrl : null,
      dailyTokenLimit: form.dailyTokenLimit || null,
      enabled: form.enabled,
      priority: Number(form.priority),
    };
    if (form.apiKey) payload.apiKey = form.apiKey;
    if (customHeaders) payload.customHeaders = customHeaders;
    try {
      const response = await fetch(editingId ? `/api/ai-provider-configs/${editingId}` : "/api/ai-provider-configs", {
        method: editingId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Konfigurasi tidak dapat disimpan.");
      setForm(emptyForm());
      setEditingId(null);
      setNotice("Konfigurasi tersimpan. Rahasia dienkripsi di server dan tidak dikirim kembali ke browser.");
      await load(accessToken);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Konfigurasi tidak dapat disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(provider: ProviderMetadata) {
    if (!window.confirm(`Hapus konfigurasi ${labels[provider.providerType]} (${provider.model}) dari scope ini?`)) return;
    setError("");
    try {
      const response = await fetch(`/api/ai-provider-configs/${provider.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Konfigurasi tidak dapat dihapus.");
      if (editingId === provider.id) { setEditingId(null); setForm(emptyForm()); }
      setNotice("Konfigurasi dihapus dari scope ini.");
      await load(accessToken);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Konfigurasi tidak dapat dihapus.");
    }
  }

  return <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 text-slate-800">
    <Link href="/" className="text-sm text-violet-700">← Kembali ke NaraNusa</Link>
    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Pengaturan AI · {scopeTitle}</p>
    <h1 className="mt-2 text-3xl font-bold">Penyedia AI</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Konfigurasi ini privat untuk scope {scopeTitle}. Provider aktif dari scope Guru/Admin dan Owner masuk ke satu pool server-side untuk failover. Kunci API dan nilai header tidak pernah ditampilkan kembali.</p>
    {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
    {notice && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-semibold">{editingId ? "Ubah provider" : "Tambah provider"}</h2>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">Penyedia
          <select value={form.providerType} onChange={(event) => { const providerType = event.target.value as AIProviderType; updateField("providerType", providerType); updateField("model", defaultModels[providerType]); }} className="rounded-lg border border-slate-300 px-3 py-2.5">
            {(Object.keys(labels) as AIProviderType[]).map((key) => <option key={key} value={key}>{labels[key]}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">Model
          <input required value={form.model} onChange={(event) => updateField("model", event.target.value)} maxLength={120} className="rounded-lg border border-slate-300 px-3 py-2.5" />
        </label>
        {form.providerType === "custom" && <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">URL HTTPS endpoint OpenAI-compatible
          <input required type="url" value={form.endpointUrl} onChange={(event) => updateField("endpointUrl", event.target.value)} placeholder="https://api.example.com/v1" className="rounded-lg border border-slate-300 px-3 py-2.5" />
        </label>}
        <label className="grid gap-1.5 text-sm font-medium">Kunci API {editingId ? "(opsional untuk mengganti)" : ""}
          <input type="password" autoComplete="new-password" value={form.apiKey} onChange={(event) => updateField("apiKey", event.target.value)} maxLength={4096} className="rounded-lg border border-slate-300 px-3 py-2.5" placeholder={editingId ? "Tidak ditampilkan; kosongkan untuk mempertahankan" : "Diinput hanya saat konfigurasi"} />
        </label>
        {form.providerType === "custom" && <label className="grid gap-1.5 text-sm font-medium">Header kustom (JSON; opsional)
          <textarea value={form.customHeaders} onChange={(event) => updateField("customHeaders", event.target.value)} rows={3} autoComplete="off" spellCheck={false} className="rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-xs" placeholder={'{"Authorization":"Bearer ..."}'} />
        </label>}
        <label className="grid gap-1.5 text-sm font-medium">Batas token harian (opsional)
          <input inputMode="numeric" value={form.dailyTokenLimit} onChange={(event) => updateField("dailyTokenLimit", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5" placeholder="Kosong = tanpa batas internal" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">Prioritas (angka lebih kecil dicoba lebih dulu)
          <input type="number" min="0" max="10000" value={form.priority} onChange={(event) => updateField("priority", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5" />
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(event) => updateField("enabled", event.target.checked)} /> Aktifkan di pool bersama</label>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button disabled={saving || !accessToken} className="rounded-lg bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Menyimpan…" : editingId ? "Simpan perubahan" : "Tambah ke pool"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm()); setNotice(""); }} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm">Batal</button>}
        </div>
      </form>
    </section>

    <section className="mt-8">
      <div className="flex items-end justify-between gap-3"><div><h2 className="text-xl font-semibold">Konfigurasi scope ini</h2><p className="mt-1 text-sm text-slate-600">Tidak ada endpoint untuk membaca plaintext kredensial.</p></div><button disabled={!accessToken || loading} onClick={() => void load(accessToken)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Muat ulang</button></div>
      {loading ? <p className="mt-5 text-sm text-slate-500">Memuat…</p> : providers.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">Belum ada provider pada scope ini.</p> : <div className="mt-4 grid gap-3">
        {providers.map((provider) => <article key={provider.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{labels[provider.providerType]} · {provider.model}</h3><span className={`rounded-full px-2 py-0.5 text-xs ${provider.enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{provider.enabled ? "Aktif" : "Nonaktif"}</span></div>
            {provider.endpointUrl && <p className="mt-1 break-all text-xs text-slate-600">Endpoint: {provider.endpointUrl}</p>}
            <p className="mt-1 text-xs text-slate-600">Kredensial: {provider.hasCredentials ? "tersimpan terenkripsi" : "belum diisi"} · Header tersimpan: {provider.customHeaderNames.length ? provider.customHeaderNames.join(", ") : "tidak ada"} · Batas harian: {provider.dailyTokenLimit ?? "tanpa batas internal"} · Prioritas: {provider.priority}</p>
          </div><div className="mt-3 flex shrink-0 gap-2 sm:mt-0"><button onClick={() => beginEdit(provider)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Ubah</button><button onClick={() => void remove(provider)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-700">Hapus</button></div>
        </article>)}
      </div>}
    </section>
    <p className="mt-8 text-xs leading-5 text-slate-500">Batas kuota harian provider dan usage dicatat menurut tanggal UTC. Pengaturan provider belum membuat aplikasi siap produksi: autentikasi murid, persetujuan wali, pembatasan permintaan/rate, dan kontrol biaya tetap wajib ditambahkan sebelum tutor dipakai anak.</p>
  </main>;
}
