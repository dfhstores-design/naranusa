"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight, Star } from "lucide-react";
import AppShell from "@/components/app-shell";
import { CharacterArt } from "@/components/character-art";
import { subjectById, subjects } from "@/content/curriculum";
import { gasAction, ProgressRow, PublicTopic } from "@/lib/api";
import { readSessionToken } from "@/lib/session";
import "@/components/student-alignment.css";
import "@/components/mockup.css";

type TopicsResponse = { ok: true; topics: PublicTopic[] };
type ProgressResponse = { ok: true; progress: ProgressRow[] };
type TopicFilter = "all" | "not-tried" | "tried";

export default function SubjectTopics({ subjectId }: { subjectId: string }) {
  const subject = subjects.find((item) => item.id === subjectId) || subjects[0];
  return <AppShell audience="student" title={subject.name}><TopicContent subjectId={subject.id} /></AppShell>;
}

function TopicContent({ subjectId }: { subjectId: string }) {
  const subject = subjectById(subjectId as never);
  const [items, setItems] = useState<PublicTopic[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [progressReady, setProgressReady] = useState(false);
  const [filter, setFilter] = useState<TopicFilter>("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    const token = readSessionToken();
    if (!token) return;
    gasAction<ProgressResponse>("progress.get", { token }).then((result) => {
      if (active) {
        setProgress(result.progress);
        setProgressReady(true);
      }
    }).catch(() => undefined);
    gasAction<TopicsResponse>("topics.list", { token, subjectId }).then((result) => {
      if (active) setItems(result.topics);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Belum bisa memuat topik.");
    }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [subjectId]);

  const attemptedCount = items.filter((topic) => (progress.find((row) => row.topicId === topic.id)?.percobaan || 0) > 0).length;
  const totalSoal = items.reduce((n, topic) => n + topic.soalTersedia, 0);
  const visibleTopics = items.filter((topic) => {
    const attempted = (progress.find((row) => row.topicId === topic.id)?.percobaan || 0) > 0;
    return filter === "all" || (filter === "tried" ? attempted : !attempted);
  });

  return <div className="student-alignment student-topics" style={{ "--subject-color": subject.color } as React.CSSProperties}>
    <section className="subject-hero">
      <span className="subject-icon large">{subject.icon}</span><div><p className="eyebrow">MATA PELAJARAN</p><h2>{subject.name}</h2><p>{busy ? "Memuat…" : `${items.length} topik • ${totalSoal} soal`}</p></div>
    </section>
    {error && <div className="notice" role="status">{error} <button className="text-button" onClick={() => window.location.reload()}>Coba lagi</button></div>}
    {progressReady && !busy && items.length > 0 && <div className="topic-filters" role="group" aria-label="Saring topik">
      <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Semua <span>{items.length}</span></button>
      <button type="button" aria-pressed={filter === "not-tried"} onClick={() => setFilter("not-tried")}>Belum selesai <span>{items.length - attemptedCount}</span></button>
      <button type="button" aria-pressed={filter === "tried"} onClick={() => setFilter("tried")}>Sudah selesai <span>{attemptedCount}</span></button>
    </div>}
    <section className="topic-rows" aria-label="Daftar topik">
      {busy && <div className="empty-state"><div className="mini-spinner" />Memuat topik…</div>}
      {!busy && !error && visibleTopics.map((topic) => {
        const attempted = (progress.find((row) => row.topicId === topic.id)?.percobaan || 0) > 0;
        return <Link className="topic-row" key={topic.id} href={`/latihan?topicId=${encodeURIComponent(topic.id)}`}>
          {attempted && <Star size={18} className="topic-star" fill="currentColor" aria-label="Sudah dicoba" />}
          <span>{topic.title}</span>
          <span className="topic-count">{topic.soalTersedia} soal</span>
          <ChevronRight size={19} className="topic-go" />
        </Link>;
      })}
      {!busy && !error && visibleTopics.length === 0 && <p className="empty-state">Belum ada topik dalam pilihan ini. Coba pilihan yang lain, ya.</p>}
    </section>
    <aside className="topic-encouragement"><CharacterArt character="nusa" variant={{ type: "avatar" }} size={56} alt="Avatar Nusa menyemangati" /><p><strong>Satu topik kecil pun langkah besar.</strong><br />Pilih yang membuatmu penasaran, lalu belajar dengan santai.</p></aside>
    <p style={{ marginTop: 14 }}><Link href="/hasil" className="text-link">Lihat progres belajarku <ArrowRight size={15} /></Link></p>
  </div>;
}
