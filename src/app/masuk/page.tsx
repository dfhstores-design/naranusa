"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowLeft, BookOpen, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import NaraMascot from "@/components/nara-mascot";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Akun belum tersambung. Tambahkan URL Supabase dan anon key pada konfigurasi lokal/server untuk mengaktifkan masuk.");
      return;
    }
    setBusy(true);
    const result = mode === "sign-in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (mode === "sign-up" && !result.data.session) {
      setMessage("Akun dibuat. Cek email untuk konfirmasi sebelum masuk.");
      return;
    }
    setMessage("Berhasil masuk. Selamat belajar!");
    window.setTimeout(() => router.push("/"), 650);
  }

  return (
    <main className="auth-shell">
      <section className="auth-visual">
        <Link href="/" className="auth-back"><ArrowLeft size={16} /> Kembali ke beranda</Link>
        <div className="auth-art-circle"><NaraMascot small /></div>
        <div className="auth-visual-copy"><span className="hero-kicker"><SparkleIcon /> RUANG BELAJAR NARANUSA</span><h1>Petualangan ilmu<br />menunggumu!</h1><p>Ini halaman masuk prototipe; progres belajar masih tersimpan di perangkat ini.</p></div>
        <span className="auth-spark auth-spark-one">✦</span><span className="auth-spark auth-spark-two">✦</span>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-brand"><span className="auth-brand-icon"><BookOpen size={18} /></span><strong>NaraNusa</strong></div>
        <div className="auth-form-card">
          <p className="section-overline">SELAMAT DATANG</p>
          <h2>{mode === "sign-in" ? "Masuk ke akunmu" : "Buat akun belajar"}</h2>
          <p className="auth-subtitle">Gunakan email yang terhubung ke akun belajar keluarga.</p>
          <form onSubmit={submit}>
            <label className="auth-label" htmlFor="email">Email</label>
            <div className="auth-input-wrap"><Mail size={16} /><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" /></div>
            <label className="auth-label" htmlFor="password">Kata sandi</label>
            <div className="auth-input-wrap"><LockKeyhole size={16} /><input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" /><button type="button" className="password-toggle" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
            {message && <div className="auth-message" role="status">{message}</div>}
            <Button type="submit" className="auth-submit" disabled={busy}>{busy ? "Sedang memeriksa…" : mode === "sign-in" ? "Masuk" : "Buat akun"}</Button>
          </form>
          <p className="auth-toggle">{mode === "sign-in" ? "Belum punya akun?" : "Sudah punya akun?"} <button onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setMessage(""); }}>{mode === "sign-in" ? "Daftar" : "Masuk"}</button></p>
          <div className="auth-security"><ShieldCheck size={15} /><span>Gunakan akun yang dikelola orang tua/wali. Prototipe ini tidak meminta nama sekolah atau data sensitif anak.</span></div>
        </div>
        <p className="auth-footer">Sinkronisasi progres belum tersedia, termasuk setelah Supabase dikonfigurasi.</p>
      </section>
    </main>
  );
}

function SparkleIcon() {
  return <span aria-hidden="true" style={{ fontSize: 14 }}>✦</span>;
}
