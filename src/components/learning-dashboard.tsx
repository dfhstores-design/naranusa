"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, ChartNoAxesColumn, Heart, MessageCircle, Sparkles, Star, Target, Trophy } from "lucide-react";
import AppShell, { useSessionUser } from "@/components/app-shell";
import NaraMascot from "@/components/nara-mascot";
import { gasAction, PublicSubject, ProgressRow } from "@/lib/api";
import { readSessionToken } from "@/lib/session";
import { curriculumNote, subjects as subjectInfo } from "@/content/curriculum";

const modeCards = [
  { mode: "topik", title: "Latihan topik", caption: "Pilih mapel dan topik", icon: BookOpen, color: "#6b56d9", tint: "#f1efff" },
  { mode: "misi", title: "Tantangan harian", caption: "Empat soal campuran", icon: Target, color: "#ec765f", tint: "#fff1ec" },
  { mode: "ujian", title: "Ujian mini", caption: "Coba soal dari 4 mapel", icon: Trophy, color: "#e4a62b", tint: "#fff7e5" },
  { mode: "cepat", title: "Mode cepat", caption: "Satu soal, mulai sekarang", icon: Sparkles, color: "#249d87", tint: "#e9f8f3" },
];

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

  return <>
    <section className="welcome-banner">
      <div><p className="eyebrow light">SELAMAT DATANG DI PETUALANGANMU</p><h2>Halo, {user?.username}! <span aria-hidden="true">✦</span></h2><p>Pilih mapel yang ingin kamu jelajahi hari ini.</p><Link href="/mapel/matematika" className="button white-button">Mulai belajar <ArrowRight size={18} /></Link></div>
      <div className="banner-mascot"><NaraMascot /></div>
      <span className="banner-star star-one">✦</span><span className="banner-star star-two">✧</span>
    </section>

    {error && <div className="notice" role="status">{error} <button className="text-button" onClick={() => window.location.reload()}>Coba lagi</button></div>}

    <section className="quick-summary" aria-label="Ringkasan progres">
      <div className="summary-icon purple"><Star size={20} fill="currentColor" /></div><div><strong>{correct} jawaban benar</strong><span>{answered} percobaan tercatat di server</span></div>
      <div className="summary-divider" />
      <div className="summary-icon green"><ChartNoAxesColumn size={20} /></div><div><strong>{catalog.length || 4} mapel</strong><span>Siap kamu jelajahi</span></div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">MATERI KELAS 4 · FASE B</p><h2>Belajar apa hari ini?</h2></div><span className="quiet-note">{busy ? "Memuat…" : "Soal dari backend pilot"}</span></div>
      <div className="subject-grid">
        {subjectInfo.map((info, index) => {
          const subject = catalog.find((item) => item.id === info.id);
          const subjectProgress = progress.filter((row) => row.topicId.startsWith(info.id === "matematika" ? "mtk-" : info.id === "bahasa-indonesia" ? "indo-" : info.id === "pendidikan-pancasila" ? "pancasila-" : "ipas-"));
          const totalCorrect = subjectProgress.reduce((sum, row) => sum + row.benar, 0);
          return <Link key={info.id} href={`/mapel/${info.id}`} className="subject-card" style={{ "--subject-color": info.color, "--subject-tint": info.tint } as React.CSSProperties}>
            <div className="subject-card-top"><span className="subject-icon">{info.icon}</span><span className="subject-index">0{index + 1}</span></div>
            <h3>{subject?.name || info.name}</h3><p>{subject?.description || info.description}</p>
            <div className="subject-card-meta"><span>{busy ? "Memuat jumlah soal…" : `${subject?.soalTersedia ?? 0} soal tersedia`}</span><span>{totalCorrect} benar</span></div>
            <span className="subject-card-arrow"><ArrowRight size={18} /></span>
          </Link>;
        })}
      </div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">CARA BELAJAR</p><h2>Pilih petualanganmu</h2></div></div>
      <div className="mode-grid">{modeCards.map((item) => { const Icon = item.icon; return item.mode === "topik" ? <Link className="mode-card" href="/mapel/matematika" key={item.mode}><span className="mode-icon" style={{ background: item.tint, color: item.color }}><Icon size={22} /></span><span><strong>{item.title}</strong><small>{item.caption}</small></span><ArrowRight size={18} /></Link> : <Link className="mode-card" href={`/latihan?mode=${item.mode}`} key={item.mode}><span className="mode-icon" style={{ background: item.tint, color: item.color }}><Icon size={22} /></span><span><strong>{item.title}</strong><small>{item.caption}</small></span><ArrowRight size={18} /></Link>; })}</div>
    </section>

    <section className="friendly-card"><span className="friendly-icon"><Heart size={20} fill="currentColor" /></span><div><strong>Belajar pelan-pelan juga hebat!</strong><p>Progres dan jawaban latihan disimpan di server, bukan di perangkat ini.</p></div><Link href="/tutor" aria-label="Baca info Tanya Nara"><MessageCircle size={20} /></Link></section>
    <footer className="page-footnote">{curriculumNote}</footer>
  </>;
}
