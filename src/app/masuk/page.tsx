"use client";

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
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 128 128" aria-hidden="true">
              <rect width="128" height="128" rx="34" fill="#249d87" />
              <circle cx="65" cy="67" r="43" fill="#fff8e9" />
              <path d="M42 47c8-17 38-21 54-7 8 7 12 18 10 30-3 17-17 30-35 30-12 0-24-7-29-18-6-11-6-24 0-35Z" fill="#f3b545" />
              <path d="M50 45c9-12 28-17 42-8-4 8-12 12-22 13l-20-5Z" fill="#ec765f" />
              <path d="M76 61c17-7 32-3 39 4-9 7-21 10-37 7l-2-11Z" fill="#ec765f" />
              <circle cx="72" cy="59" r="5" fill="#2f315b" />
              <circle cx="74" cy="57" r="1.5" fill="#fff8e9" />
              <path d="M49 97c7 8 23 11 36 5" fill="none" stroke="#2f315b" strokeWidth="5" strokeLinecap="round" />
              <path d="M48 111h18m9 0h15" stroke="#ec765f" strokeWidth="5" strokeLinecap="round" />
              <path d="M98 26 102 16m8 20 10-5" stroke="#fff8e9" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
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
