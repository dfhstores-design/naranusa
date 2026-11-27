"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Calculator, Flame, Globe2, Heart, Languages, Monitor, MoonStar, Music, Volleyball } from "lucide-react";
import Link from "next/link";
import AppShell, { useSessionUser } from "@/components/app-shell";
import { CharacterImage } from "@/components/character-art";
import { gasAction, PublicSubject, ProgressRow } from "@/lib/api";
import { streakFrom } from "@/lib/progress-summary";
import { readSessionToken } from "@/lib/session";
import { subjects as subjectInfo, topics as staticTopics } from "@/content/curriculum";
import { getSubjectsCached } from "@/lib/catalog-cache";
import { readJenjang, saveJenjang, readJenjangBaru, tandaiJenjangDilihat, jenjangLabel } from "@/lib/jenjang";
import { JenjangPicker, KartuJenjangBaru } from "@/components/jenjang-picker";
import "@/components/student-alignment.css";
import "@/components/mockup.css";
import "@/components/home-approved.css";

type ProgressResponse = { ok: true; progress: ProgressRow[] };

const subjectIcons = {
  matematika: Calculator,
  "bahasa-indonesia": BookOpen,
  ipas: Globe2,
  "pendidikan-pancasila": Heart,
  "teknologi-informasi-komunikasi": Monitor,
  "pendidikan-agama-islam": MoonStar,
  pjok: Volleyball,
  seni: Music,
  "bahasa-inggris": Languages,
};

export default function LearningDashboard() {
  return <AppShell audience="student" title="Beranda"><DashboardContent /></AppShell>;
}

function DashboardContent() {
  const user = useSessionUser();
  const [catalog, setCatalog] = useState<PublicSubject[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [jenjang, setJenjang] = useState(4);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [jenjangBaru, setJenjangBaru] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const token = readSessionToken();
    if (!token) return;
    Promise.all([
      getSubjectsCached(token),
      gasAction<ProgressResponse>("progress.get", { token }),
    ]).then(([subjects, progressResult]) => {
      if (!active) return;
      setCatalog(subjects);
      setProgress(progressResult.progress);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Belum bisa memuat data belajar.");
    }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user?.username) return;
    setJenjang(readJenjang(user.username));
    setJenjangBaru(readJenjangBaru(user.username));
  }, [user?.username]);

  function pilihJenjang(n: number) {
    saveJenjang(user?.username, n);
    setJenjang(n);
    setPickerOpen(false);
  }

  function tutupKartuBaru(coba: boolean) {
    if (coba && jenjangBaru !== null) pilihJenjang(jenjangBaru);
    if (jenjangBaru !== null) tandaiJenjangDilihat(user?.username, jenjangBaru);
    setJenjangBaru(null);
  }

  const streak = streakFrom(progress);
  const displayName = user?.nama_tampilan?.trim() || user?.username || "Teman";

  return <div className="student-alignment student-home home-approved">
    <header className="home-approved-greeting">
      <CharacterImage character={user?.karakter || "nara"} variant="face" size={56} className="greeting-avatar" alt={`Avatar ${user?.karakter || "Nara"}`} />
      <div className="greeting-copy">
        <h2>Halo, {displayName}!</h2>
        <p>Mau belajar apa hari ini?</p>
      </div>
      <button type="button" className="jenjang-pill" aria-expanded={pickerOpen} aria-label="Ganti kelas" onClick={() => setPickerOpen((v) => !v)}>{jenjangLabel(jenjang)} ▾</button>
    </header>

    {pickerOpen && <JenjangPicker username={user?.username} value={jenjang} onChange={pilihJenjang} />}
    {jenjangBaru !== null && <KartuJenjangBaru jenjang={jenjangBaru} onCoba={() => tutupKartuBaru(true)} onNanti={() => tutupKartuBaru(false)} />}

    <section className="home-streak-card" aria-label={`Streak ${streak} hari`}>
      <Flame className="home-streak-icon" size={31} fill="currentColor" aria-hidden="true" />
      <div>
        <h3>Streak {busy ? "…" : streak} hari!</h3>
        <p>Terus pertahankan, kamu hebat!</p>
      </div>
    </section>

    {error && <div className="notice" role="status">{error}</div>}

    <section className="home-subject-section" aria-labelledby="home-subject-heading">
      <div className="section-heading"><h2 id="home-subject-heading">Pilih Mata Pelajaran</h2></div>
      <div className="home-subject-list">
        {subjectInfo.map((info) => {
          const subject = catalog.find((item) => item.id === info.id);
          const topicCount = staticTopics.filter((t) => t.subjectId === info.id).length;
          const questionCount = subject?.soalTersedia;
          const newSubject = info.id === "teknologi-informasi-komunikasi" || info.id === "pendidikan-agama-islam" || info.id === "pjok" || info.id === "seni" || info.id === "bahasa-inggris";
          const Icon = subjectIcons[info.id];
          const name = subject?.name || info.name;
          const meta = busy ? "Memuat…" : subject ? `${topicCount} bab · ${questionCount} soal` : "Jumlah soal belum tersedia";
          return <Link key={info.id} href={`/mapel/${info.id}`} className={`home-subject-card${newSubject ? " home-subject-card-new" : ""}`} style={{ "--subject-color": info.color } as React.CSSProperties} aria-label={`${name}${newSubject ? " Baru" : ""} ${meta}`}>
            <span className="home-subject-icon" aria-hidden="true"><Icon size={25} strokeWidth={2.25} /></span>
            <span className="home-subject-copy">
              <span className="home-subject-title">{name}{newSubject && <span className="home-new-badge">Baru</span>}</span>
              <span className="home-subject-meta">{meta}</span>
            </span>
            <ArrowRight className="home-subject-arrow" size={21} aria-hidden="true" />
          </Link>;
        })}
      </div>
    </section>

    <footer className="home-footer">
      <Link className="home-footer-link" href="/tentang">Tentang NaraNusa</Link>
      <span aria-hidden="true">·</span>
      <a className="home-footer-link" href="https://sociabuzz.com/andri_ndi/tribe" target="_blank" rel="noreferrer">Dukung NaraNusa</a>
    </footer>
  </div>;
}
