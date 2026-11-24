"use client";
import Image from "next/image";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import "@fontsource-variable/nunito";
import { CharacterArt } from "@/components/character-art";
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
          <span className="brand-mark" aria-hidden="true"><Image src="/naranusa/icon.svg" alt="" aria-hidden="true" width={44} height={44} /></span>
          <span><strong>Nara<span>Nusa</span></strong><small>jelajah ilmu, seru!</small></span>
        </Link>
        <div className="login-illustration">
          <span className="login-spark spark-a" aria-hidden="true">✦</span>
          <div className="login-mascot"><CharacterArt character="nara" alt="Nara melambai" /><CharacterArt character="nusa" alt="Nusa menyapa" /></div>
          <span className="login-spark spark-b" aria-hidden="true">✦</span>
        </div>
        <div className="login-art-copy"><h1>Belajar seru bareng Nara &amp; Nusa!</h1><p>Satu tempat untuk menjelajah ilmu bersama.</p></div>
      </section>
      <section className="login-form-side" aria-labelledby="login-heading">
        <div className="login-card">
          <h2 id="login-heading">Selamat datang!</h2>
          <p className="muted">Masuk untuk mulai belajar bersama.</p>
          <form onSubmit={submit} className="stack-form">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon"><UserRound size={19} aria-hidden="true" /><input id="username" name="username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username akunmu" /></div>
            <label htmlFor="password">Kata sandi</label>
            <div className="input-with-icon password-input"><LockKeyhole size={19} aria-hidden="true" /><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" /><button type="button" className="password-toggle" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button></div>
            {message && <p className="notice" role="alert">{message}</p>}
            <button type="submit" className="button primary full" disabled={busy}>{busy ? "Sedang memeriksa…" : <>Masuk <ArrowRight size={19} aria-hidden="true" /></>}</button>
          </form>
          <p className="privacy-note">Lupa kata sandi? Minta bantuan guru atau wali untuk meresetnya.</p>
          <div className="login-roles" aria-label="Satu halaman masuk untuk semua peran"><span>Murid</span><span>Guru</span><span>Orang tua</span></div>
          <p className="login-role-note">Satu layar masuk untuk semua. Setelah masuk, tampilan menyesuaikan peran.</p>
        </div>
      </section>
    </main>
  );
}
