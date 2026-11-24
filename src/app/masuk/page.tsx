"use client";
import Image from "next/image";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, BookOpen, Eye, EyeOff, LockKeyhole, UserRound, WifiOff } from "lucide-react";
import "@fontsource-variable/nunito";
import NaraMascot from "@/components/nara-mascot";
import { ApiError, gasAction } from "@/lib/api";
import { saveSessionToken } from "@/lib/session";

type LoginResponse = { ok: true; token: string; username: string; peran: string };

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const result = await gasAction<LoginResponse>("auth.login", { username, password });
      saveSessionToken(result.token);
      router.replace(result.peran === "murid" ? "/" : "/admin");
    } catch (error) {
      if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
        setMessage("Username atau password salah.");
      } else {
        setMessage(error instanceof Error ? error.message : "Tidak bisa masuk sekarang. Coba lagi.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-art" aria-label="NaraNusa">
        <Link href="/" className="brand-link">
          <span className="brand-mark" aria-hidden="true"><Image src="/pwa-edukasi-kelas4/icon.svg" alt="" aria-hidden="true" width={44} height={44} /></span>
          <span><strong>Nara<span>Nusa</span></strong><small>jelajah ilmu, seru!</small></span>
        </Link>
        <div className="login-illustration">
          <span className="login-spark spark-a" aria-hidden="true">✦</span>
          <div className="login-mascot"><NaraMascot /></div>
          <span className="login-spark spark-b" aria-hidden="true">✦</span>
        </div>
        <div className="login-art-copy"><p className="eyebrow">RUANG BELAJAR KELAS 4</p><h1>Petualangan ilmu menunggumu!</h1><p>Belajar seru bersama Nara, selangkah demi selangkah.</p></div>
      </section>
      <section className="login-form-side" aria-labelledby="login-heading">
        <div className="login-card">
          <div className="login-card-top"><span className="login-icon"><BookOpen size={26} aria-hidden="true" /></span><span className="login-card-spark" aria-hidden="true">✦</span></div>
          <p className="eyebrow">SELAMAT DATANG KEMBALI</p>
          <h2 id="login-heading">Masuk ke NaraNusa</h2>
          <p className="muted">Belum punya akun? Minta orang tua atau guru menyiapkannya.</p>
          <form onSubmit={submit} className="stack-form">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon"><UserRound size={19} aria-hidden="true" /><input id="username" name="username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username akunmu" /></div>
            <label htmlFor="password">Kata sandi</label>
            <div className="input-with-icon password-input"><LockKeyhole size={19} aria-hidden="true" /><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" /><button type="button" className="password-toggle" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button></div>
            {message && <p className="notice" role="alert">{message}</p>}
            <button type="submit" className="button primary full" disabled={busy}>{busy ? "Sedang memeriksa…" : <>Masuk dan mulai belajar <ArrowRight size={19} aria-hidden="true" /></>}</button>
          </form>
          <p className="privacy-note">Akun memakai username. Kami tidak meminta email atau nama lengkap anak.</p>
          <div className="login-roles" aria-label="Satu halaman masuk untuk semua peran"><span>Murid</span><span>Guru</span><span>Orang tua</span></div>
          <Link href="/offline/" className="subtle-link"><WifiOff size={16} aria-hidden="true" /> Butuh halaman offline?</Link>
        </div>
      </section>
    </main>
  );
}
