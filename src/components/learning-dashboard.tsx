"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, ChartNoAxesColumn, Heart, MessageCircle, Sparkles, Star, Target, Trophy } from "lucide-react";
import AppShell, { useSessionUser } from "@/components/app-shell";
import { CharacterArt } from "@/components/character-art";
import { gasAction, PublicSubject, ProgressRow } from "@/lib/api";
import { readSessionToken } from "@/lib/session";
import { curriculumNote, subjects as subjectInfo, topics as curriculumTopics } from "@/content/curriculum";
import "@/components/student-alignment.css";

const modeCards = [
  { mode: "topik", title: "Latihan topik", caption: "Pilih mapel dan topik", icon: BookOpen, color: "#6b56d9" },
  { mode: "misi", title: "Tantangan harian", caption: "Empat soal campuran", icon: Target, color: "#ec765f" },
  { mode: "ujian", title: "Ujian mini", caption: "Coba soal dari 4 mapel", icon: Trophy, color: "#e4a62b" },
  { mode: "cepat", title: "Mode cepat", caption: "Satu soal, mulai sekarang", icon: Sparkles, color: "#249d87" },
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
  const latestProgress = progress.reduce<ProgressRow | null>((latest, row) => {
    if (!latest) return row;
    const rowDate = Date.parse(row.terakhir_pada) || 0;
    const latestDate = Date.parse(latest.terakhir_pada) || 0;
    return rowDate > latestDate ? row : latest;
  }, null);
  const continueTopic = latestProgress ? curriculumTopics.find((topic) => topic.id === latestProgress.topicId) : undefined;

  return <div className="student-alignment student-home">
    <section className="welcome-banner">
      <div><p className="eyebrow light">SELAMAT DATANG DI PETUALANGANMU</p><h2>Halo, {user?.username}! <span aria-hidden="true">✦</span></h2><p>{continueTopic ? `Terakhir kamu belajar: ${continueTopic.title}` : "Pilih mapel yang ingin kamu jelajahi hari ini."}</p>{continueTopic && <Link href={`/latihan?topicId=${encodeURIComponent(continueTopic.id)}`} className="button white-button">Lanjutkan belajar <ArrowRight size={18} /></Link>}</div>
      <div className="banner-mascot"><CharacterArt character="nara" variant={{ type: "avatar" }} size={168} alt="Avatar Nara" /></div>
      <span className="banner-star star-one">✦</span><span className="banner-star star-two">✧</span>
    </section>

    {error && <div className="notice" role="status">{error} <button className="text-button" onClick={() => window.location.reload()}>Coba lagi</button></div>}

    <section className="quick-summary" aria-label="Ringkasan progres">
      <div className="summary-icon purple"><Star size={20} fill="currentColor" /></div><div><strong>{busy ? "Memuat…" : error ? "— jawaban benar" : `${correct} jawaban benar`}</strong><span>{busy ? "Mengambil progres dari server" : error ? "Progres belum tersedia" : `${answered} percobaan tercatat di server`}</span></div>
      <div className="summary-divider" />
      <div className="summary-icon green"><ChartNoAxesColumn size={20} /></div><div><strong>{busy ? "Memuat…" : error ? "— mapel" : `${catalog.length} mapel`}</strong><span>Siap kamu jelajahi</span></div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">MATERI KELAS 4 · FASE B</p><h2>Belajar apa hari ini?</h2></div><span className="quiet-note">{busy ? "Memuat…" : "Soal dari backend pilot"}</span></div>
      <div className="subject-grid">
        {subjectInfo.map((info, index) => {
          const subject = catalog.find((item) => item.id === info.id);
          const subjectProgress = progress.filter((row) => row.topicId.startsWith(info.id === "matematika" ? "mtk-" : info.id === "bahasa-indonesia" ? "indo-" : info.id === "pendidikan-pancasila" ? "pancasila-" : "ipas-"));
          const totalCorrect = subjectProgress.reduce((sum, row) => sum + row.benar, 0);
          return <Link key={info.id} href={`/mapel/${info.id}`} className={`subject-card subject-${info.id}`} style={{ "--subject-color": info.color, "--subject-tint": `color-mix(in srgb, ${info.color} 11%, white)` } as React.CSSProperties}>
            <div className="subject-card-top"><span className="subject-icon">{info.icon}</span><span className="subject-index">0{index + 1}</span></div>
            <h3>{subject?.name || info.name}</h3><p>{subject?.description || info.description}</p>
            <div className="subject-card-meta"><span>{busy ? "Memuat jumlah soal…" : error || !subject ? "Jumlah soal belum tersedia" : `${subject.soalTersedia} soal tersedia`}</span><span>{error ? "Progres —" : `${totalCorrect} benar`}</span></div>
            <span className="subject-card-arrow"><ArrowRight size={18} /></span>
          </Link>;
        })}
      </div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">CARA BELAJAR</p><h2>Pilih petualanganmu</h2></div></div>
      <div className="mode-grid">{modeCards.map((item) => { const Icon = item.icon; const contents = <><span className="mode-icon" style={{ background: `color-mix(in srgb, ${item.color} 12%, white)`, color: item.color }}><Icon size={22} /></span><span><strong>{item.title}</strong><small>{item.caption}</small></span><ArrowRight size={18} /></>; return item.mode === "topik" ? <Link className="mode-card" href="/mapel/matematika" key={item.mode}>{contents}</Link> : <Link className="mode-card" href={`/latihan?mode=${item.mode}`} key={item.mode}>{contents}</Link>; })}</div>
    </section>

    <section className="friendly-card"><span className="friendly-icon"><Heart size={20} fill="currentColor" /></span><div><strong>Belajar pelan-pelan juga hebat!</strong><p>Progres dan jawaban latihan disimpan di server. Tutor belum aktif.</p></div><span className="friendly-status" aria-label="Tutor belum aktif"><MessageCircle size={20} /></span></section>
    <footer className="page-footnote">{curriculumNote}</footer>
  </div>;
}
