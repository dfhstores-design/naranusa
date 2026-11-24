"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import AppShell from "@/components/app-shell";
import { subjectById, subjects, topics as curriculumTopics } from "@/content/curriculum";
import { gasAction, PublicTopic } from "@/lib/api";
import { readSessionToken } from "@/lib/session";

type TopicsResponse = { ok: true; topics: PublicTopic[] };

export default function SubjectTopics({ subjectId }: { subjectId: string }) {
  const subject = subjects.find((item) => item.id === subjectId) || subjects[0];
  return <AppShell audience="student" title={subject.name}><TopicContent subjectId={subject.id} /></AppShell>;
}

function TopicContent({ subjectId }: { subjectId: string }) {
  const subject = subjectById(subjectId as never);
  const [items, setItems] = useState<PublicTopic[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    const token = readSessionToken();
    if (!token) return;
    gasAction<TopicsResponse>("topics.list", { token, subjectId }).then((result) => {
      if (active) setItems(result.topics);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Belum bisa memuat topik.");
    }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [subjectId]);

  return <>
    <section className="subject-hero" style={{ "--subject-color": subject.color, "--subject-tint": subject.tint } as React.CSSProperties}>
      <span className="subject-icon large">{subject.icon}</span><div><p className="eyebrow">MATA PELAJARAN</p><h2>{subject.name}</h2><p>{subject.description}</p></div>
      <div className="subject-total"><strong>{items.reduce((n, topic) => n + topic.soalTersedia, 0)}</strong><span>soal tersedia</span></div>
    </section>
    {error && <div className="notice" role="status">{error} <button className="text-button" onClick={() => window.location.reload()}>Coba lagi</button></div>}
    <section className="topic-list">
      {busy && <div className="empty-state"><div className="mini-spinner" />Memuat topik…</div>}
      {!busy && !error && items.map((topic, index) => {
        const info = curriculumTopics.find((item) => item.id === topic.id);
        return <article className="topic-card" key={topic.id}>
          <span className="topic-number" style={{ color: subject.color, background: subject.tint }}>{String(index + 1).padStart(2, "0")}</span>
          <div className="topic-body"><p>{topic.chapter}</p><h3>{topic.title}</h3><span>{topic.objective}</span>{info && <small>{info.status === "verified-book" ? "Rujukan buku Kelas 4" : "Konteks Capaian Pembelajaran"}</small>}</div>
          {topic.soalTersedia > 0 ? <Link className="button secondary topic-button" href={`/latihan?topicId=${encodeURIComponent(topic.id)}`}>Latihan {topic.soalTersedia} soal <ArrowRight size={17} /></Link> : <span className="no-questions">Belum ada soal</span>}
        </article>;
      })}
    </section>
    <aside className="source-note"><BookOpen size={19} /><div><strong>Sumber pembelajaran</strong><p>Topik mengikuti bab buku Kelas 4 dan tujuan belajar yang dicatat untuk pilot. Soal latihan diambil dari bank server.</p><Link href="/hasil">Lihat progres belajarku <ArrowRight size={15} /></Link></div></aside>
  </>;
}
