"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Flame, Star } from "lucide-react";
import AppShell, { useSessionUser } from "@/components/app-shell";
import { CharacterArt } from "@/components/character-art";
import { gasAction, PublicSubject, ProgressRow } from "@/lib/api";
import { starsFor, streakFrom } from "@/lib/progress-summary";
import { readSessionToken } from "@/lib/session";
import { subjects as subjectInfo, topics as curriculumTopics } from "@/content/curriculum";
import "@/components/student-alignment.css";
import "@/components/mockup.css";

type SubjectResponse = { ok: true; subjects: PublicSubject[] };
type ProgressResponse = { ok: true; progress: ProgressRow[] };

export default function LearningDashboard() {
  return <AppShell audience="student" title="Beranda"><DashboardContent /></AppShell>;
}

function DashboardContent() {
  const user = useSessionUser();
  const [catalog, setCatalog] = useState<PublicSubject[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    const token = readSessionToken();
    if (!token) return;
    Promise.all([
      gasAction<SubjectResponse>("subjects.list", { token }),
      gasAction<ProgressResponse>("progress.get", { token }),
    ]).then(([subjectResult, progressResult]) => {
      if (!active) return;
      setCatalog(subjectResult.subjects);
      setProgress(progressResult.progress);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Belum bisa memuat data belajar.");
    }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  const answered = progress.reduce((sum, row) => sum + row.percobaan, 0);
  const correct = progress.reduce((sum, row) => sum + row.benar, 0);
  const stars = starsFor(correct);
  const streak = streakFrom(progress);
  const latestProgress = progress.reduce<ProgressRow | null>((latest, row) => {
    if (!latest) return row;
    const rowDate = Date.parse(row.terakhir_pada) || 0;
    const latestDate = Date.parse(latest.terakhir_pada) || 0;
    return rowDate > latestDate ? row : latest;
  }, null);
  const continueTopic = latestProgress ? curriculumTopics.find((topic) => topic.id === latestProgress.topicId) : undefined;
  const continueSubject = continueTopic ? subjectInfo.find((item) => item.id === continueTopic.subjectId) : undefined;
  const continueDone = latestProgress ? Math.min(latestProgress.percobaan, 5) : 0;

  return <div className="student-alignment student-home">
    <div className="greeting-row">
      <CharacterArt character="nara" variant={{ type: "avatar" }} size={52} className="greeting-avatar" alt="Avatar Nara" />
      <h2>Halo, {user?.username}!</h2>
      <span className="star-total"><Star size={18} fill="currentColor" />{busy ? "…" : stars}</span>
    </div>

    <section className="continue-card" aria-label="Lanjutkan belajar">
      {continueTopic && continueSubject ? <>
        <p className="eyebrow light">LANJUTKAN BELAJAR</p>
        <h3>{continueSubject.name} • {continueTopic.title}</h3>
        <p>Soal {continueDone} dari 5</p>
        <div className="continue-progress" role="progressbar" aria-valuenow={continueDone} aria-valuemin={0} aria-valuemax={5}><i style={{ width: `${(continueDone / 5) * 100}%` }} /></div>
        <Link href={`/latihan?topicId=${encodeURIComponent(continueTopic.id)}`} className="continue-pill">Lanjut <ArrowRight size={18} /></Link>
      </> : <>
        <p className="eyebrow light">MULAI PETUALANGANMU</p>
        <h3>Belajar apa hari ini?</h3>
        <p>Pilih mapel dan topik pertamamu.</p>
        <Link href="/mapel/matematika" className="continue-pill">Mulai belajar <ArrowRight size={18} /></Link>
      </>}
    </section>

    {error && <div className="notice" role="status">{error} <button className="text-button" onClick={() => window.location.reload()}>Coba lagi</button></div>}

    <section className="stat-row" aria-label="Ringkasan bintang dan progres">
      <div className="stat-card"><span className="stat-icon amber"><Star size={22} fill="currentColor" /></span><strong>{busy ? "…" : stars}</strong><span>Bintang</span></div>
      <div className="stat-card"><span className="stat-icon coral"><Flame size={22} fill="currentColor" /></span><strong>{busy ? "…" : streak}</strong><span>Hari beruntun</span></div>
      <div className="stat-card"><span className="stat-icon teal"><BadgeCheck size={22} /></span><strong>{busy ? "…" : answered}</strong><span>Soal selesai</span></div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">KELAS 4 · FASE B</p><h2>Pilih mapel</h2></div></div>
      <div className="subject-tiles">
        {subjectInfo.map((info) => {
          const subject = catalog.find((item) => item.id === info.id);
          return <Link key={info.id} href={`/mapel/${info.id}`} className="subject-tile" style={{ background: `color-mix(in srgb, ${info.color} 13%, white)` }}>
            <span className="tile-icon" style={{ color: info.color }}>{info.icon}</span>
            <h3>{subject?.name || info.name}</h3>
            <span>{busy ? "Memuat…" : error || !subject ? "Soal tersedia" : `${subject.soalTersedia} soal`}</span>
            <ArrowRight size={18} className="tile-arrow" />
          </Link>;
        })}
      </div>
    </section>
  </div>;
}
