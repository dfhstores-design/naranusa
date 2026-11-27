"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Calculator, Flame, Globe2, Heart, Languages, Monitor, MoonStar, Music, Volleyball } from "lucide-react";
import Link from "next/link";
import AppShell, { useSessionUser } from "@/components/app-shell";
import { CharacterImage } from "@/components/character-art";
import { gasAction, PublicSubject, PublicTopic, ProgressRow } from "@/lib/api";
import { streakFrom } from "@/lib/progress-summary";
import { readSessionToken } from "@/lib/session";
import { subjects as subjectInfo } from "@/content/curriculum";
import "@/components/student-alignment.css";
import "@/components/mockup.css";
import "@/components/home-approved.css";

type SubjectResponse = { ok: true; subjects: PublicSubject[] };
type TopicsResponse = { ok: true; topics: PublicTopic[] };
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
  const [topicLists, setTopicLists] = useState<Record<string, PublicTopic[]>>({});
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
    ]).then(async ([subjectResult, progressResult]) => {
      if (!active) return;
      setCatalog(subjectResult.subjects);
      setProgress(progressResult.progress);
      const fetchedTopics = await Promise.allSettled(subjectResult.subjects.map(async (subject) => {
        const response = await gasAction<TopicsResponse>("topics.list", { token, subjectId: subject.id });
        return [subject.id, response.topics] as const;
      }));
      if (!active) return;
      setTopicLists(Object.fromEntries(fetchedTopics.flatMap((result) => result.status === "fulfilled" ? [result.value] : [])));
      if (fetchedTopics.some((result) => result.status === "rejected")) setError("Sebagian jumlah soal belum bisa dimuat. Coba lagi, ya.");
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Belum bisa memuat data belajar.");
    }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  const streak = streakFrom(progress);
  const displayName = user?.nama_tampilan?.trim() || user?.username || "Teman";

  return <div className="student-alignment student-home home-approved">
    <header className="home-approved-greeting">
      <CharacterImage character={user?.karakter || "nara"} variant="face" size={56} className="greeting-avatar" alt={`Avatar ${user?.karakter || "Nara"}`} />
      <div className="greeting-copy">
        <h2>Halo, {displayName}!</h2>
        <p>Mau belajar apa hari ini?</p>
      </div>
    </header>

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
          const items = topicLists[info.id];
          const questionCount = items?.reduce((sum, topic) => sum + topic.soalTersedia, 0);
          const topicCount = items?.length;
          const newSubject = info.id === "teknologi-informasi-komunikasi" || info.id === "pendidikan-agama-islam" || info.id === "pjok" || info.id === "seni" || info.id === "bahasa-inggris";
          const Icon = subjectIcons[info.id];
          const name = subject?.name || info.name;
          const meta = busy ? "Memuat…" : items ? `${topicCount} bab · ${questionCount} soal` : "Jumlah soal belum tersedia";
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
  </div>;
}
