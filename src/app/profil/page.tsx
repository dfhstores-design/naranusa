"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, Flame, LogOut, Star } from "lucide-react";
import AppShell, { useSessionUser } from "@/components/app-shell";
import { CharacterArt } from "@/components/character-art";
import { gasAction, ProgressRow } from "@/lib/api";
import { starsFor, streakFrom } from "@/lib/progress-summary";
import { clearSessionToken, readSessionToken } from "@/lib/session";
import "@/components/student-alignment.css";
import "@/components/mockup.css";

type ProgressResponse = { ok: true; progress: ProgressRow[] };

export default function ProfilePage() {
  return <AppShell audience="student" title="Profil"><ProfileContent /></AppShell>;
}

function ProfileContent() {
  const user = useSessionUser();
  const router = useRouter();
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    const token = readSessionToken();
    if (!token) return;
    gasAction<ProgressResponse>("progress.get", { token }).then((result) => {
      if (active) setRows(result.progress);
    }).catch(() => undefined).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  const answered = rows.reduce((sum, row) => sum + row.percobaan, 0);
  const correct = rows.reduce((sum, row) => sum + row.benar, 0);

  async function logout() {
    const token = readSessionToken();
    try { if (token) await gasAction<{ ok: true }>("auth.logout", { token }); } catch { /* Keluar lokal tetap jalan. */ }
    clearSessionToken();
    router.replace("/masuk");
  }

  return <div className="student-alignment">
    <section className="profile-card">
      <CharacterArt character="nara" variant={{ type: "avatar" }} size={72} className="profile-avatar" alt="Avatar Nara" />
      <div><h2>{user?.username}</h2><p>Murid · Kelas 4 · Fase B</p></div>
    </section>
    <section className="stat-row" aria-label="Ringkasan progres">
      <div className="stat-card"><span className="stat-icon amber"><Star size={22} fill="currentColor" /></span><strong>{busy ? "…" : starsFor(correct)}</strong><span>Bintang</span></div>
      <div className="stat-card"><span className="stat-icon coral"><Flame size={22} fill="currentColor" /></span><strong>{busy ? "…" : streakFrom(rows)}</strong><span>Hari beruntun</span></div>
      <div className="stat-card"><span className="stat-icon teal"><BadgeCheck size={22} /></span><strong>{busy ? "…" : answered}</strong><span>Soal selesai</span></div>
    </section>
    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">AKUNMU</p><h2>Apa yang bisa kamu lakukan di sini?</h2></div></div>
      <p><Link href="/hasil" className="text-link">Lihat progres belajarku <ArrowRight size={15} /></Link></p>
      <p style={{ color: "#73758f", fontSize: 14, marginTop: 12 }}>Tutor belum aktif. Lupa kata sandi? Minta bantuan guru atau wali untuk meresetnya.</p>
      <button className="button secondary" onClick={logout}><LogOut size={18} /> Keluar</button>
    </section>
  </div>;
}
