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
        <div className="map-banner" aria-hidden="true">
          <svg width="118" height="44" viewBox="0 0 118 44" role="img" aria-label="Peta Indonesia">
            <path d="M6 26Q10 12 20 10q6 2 2 12-4 10-12 6-6-2-4-2Z" fill="#249d87" />
            <path d="M28 30q12-4 30-2 2 4-8 5-14 1-22-1Z" fill="#f3b545" />
            <path d="M52 12q10-6 18 0 4 8-4 14-10 0-14-6Z" fill="#ec765f" />
            <path d="M76 14q4-6 8-2-2 8-6 10-4-2-2-8Z" fill="#2f315b" />
            <path d="M90 16q10-8 20-4 6 6 0 12-10 2-18-2-4-4-2-6Z" fill="#249d87" />
          </svg>
          <span className="map-steps"><i>1</i><i>2</i><i>3</i></span>
          <p>Kelas 4 · Fase B · Kurikulum Merdeka</p>
        </div>
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
          <div className="login-roles" aria-label="Satu halaman masuk untuk semua peran"><span>Murid</span><span>Guru</span><span>Wali</span></div>
          <p className="login-role-note">Satu layar masuk untuk semua. Setelah masuk, tampilan menyesuaikan peran.</p>
        </div>
      </section>
    </main>
  );
}
