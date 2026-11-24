"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BookOpen, LockKeyhole, UserRound } from "lucide-react";
import NaraMascot from "@/components/nara-mascot";
import { ApiError, gasAction } from "@/lib/api";
import { saveSessionToken } from "@/lib/session";

type LoginResponse = { ok: true; token: string; username: string; peran: string };

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        <Link href="/" className="brand-link"><span className="brand-mark"><NaraMascot tiny /></span><span><strong>NaraNusa</strong><small>jelajah ilmu, seru!</small></span></Link>
        <div className="login-mascot"><NaraMascot /></div>
        <div className="login-art-copy"><p className="eyebrow light">RUANG BELAJAR KELAS 4</p><h1>Petualangan ilmu menunggumu!</h1><p>Masuk dengan akun yang disiapkan orang tua atau gurumu.</p></div>
        <span className="login-spark spark-a">✦</span><span className="login-spark spark-b">✦</span>
      </section>
      <section className="login-form-side">
        <div className="login-card">
          <span className="login-icon"><BookOpen size={22} /></span>
          <p className="eyebrow">SELAMAT DATANG KEMBALI</p>
          <h2>Masuk ke NaraNusa</h2>
          <p className="muted">Belum punya akun? Minta orang tua atau guru menyiapkannya.</p>
          <form onSubmit={submit} className="stack-form">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon"><UserRound size={19} aria-hidden="true" /><input id="username" name="username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username akunmu" /></div>
            <label htmlFor="password">Kata sandi</label>
            <div className="input-with-icon"><LockKeyhole size={19} aria-hidden="true" /><input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" /></div>
            {message && <p className="notice" role="alert">{message}</p>}
            <button type="submit" className="button primary full" disabled={busy}>{busy ? "Sedang memeriksa…" : "Masuk dan mulai belajar"}</button>
          </form>
          <p className="privacy-note">Akun memakai username. Kami tidak meminta email atau nama lengkap anak.</p>
          <Link href="/offline/" className="subtle-link">Butuh halaman offline?</Link>
        </div>
      </section>
    </main>
  );
}
