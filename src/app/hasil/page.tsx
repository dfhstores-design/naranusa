"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Star } from "lucide-react";
import AppShell from "@/components/app-shell";
import { subjects, topics } from "@/content/curriculum";
import { gasAction, ProgressRow } from "@/lib/api";
import { readSessionToken } from "@/lib/session";
import "@/components/student-alignment.css";

type ProgressResponse = { ok: true; progress: ProgressRow[] };

export default function ResultsPage() {
  return <AppShell audience="student" title="Progres belajarku"><ProgressContent /></AppShell>;
}

function ProgressContent() {
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    let active = true;
    const token = readSessionToken();
    if (!token) return;
    gasAction<ProgressResponse>("progress.get", { token }).then((result) => { if (active) setRows(result.progress); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Belum bisa memuat progres."); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);
  const totalCorrect = rows.reduce((sum, row) => sum + row.benar, 0);
  const totalAttempts = rows.reduce((sum, row) => sum + row.percobaan, 0);

  return <div className="student-alignment student-progress">
    <section className="progress-hero"><div><p className="eyebrow light">LANGKAH KECIL, KEMAJUAN BESAR</p><h2>Setiap usaha itu berarti.</h2><p>Ini ringkasan latihanmu yang tersimpan di server.</p></div><div className="score-orb"><strong>{busy ? "…" : error ? "—" : totalCorrect}</strong><span>jawaban benar</span></div></section>
    {error && <div className="notice" role="status">{error} <button className="text-button" onClick={() => window.location.reload()}>Coba lagi</button></div>}
    <section className="content-section progress-panel"><div className="section-heading"><div><p className="eyebrow">PETA BELAJAR</p><h2>Progres per mapel</h2></div><span className="quiet-note">{busy ? "Memuat…" : error ? "Progres belum tersedia" : `${totalAttempts} percobaan tersimpan`}</span></div>
      {subjects.map((subject) => {
        const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
        const topicProgress = subjectTopics.map((topic) => ({ topic, row: rows.find((row) => row.topicId === topic.id) }));
        const total = topicProgress.reduce((sum, item) => sum + (item.row?.percobaan || 0), 0);
        const correct = topicProgress.reduce((sum, item) => sum + (item.row?.benar || 0), 0);
        return <article className="progress-subject" key={subject.id}>
          <div className="progress-subject-head"><span className="subject-icon" style={{ color: subject.color }}>{subject.icon}</span><div><strong>{subject.name}</strong><small>{error ? "Data belum tersedia" : `${correct} benar · ${total} percobaan`}</small></div><span className="progress-count">{error ? "—" : `${topicProgress.filter((item) => (item.row?.percobaan || 0) > 0).length}/${subjectTopics.length} topik`}</span></div>
          <div className="topic-progress-list">{topicProgress.map(({ topic, row }) => <div className="topic-progress-row" key={topic.id}><span>{topic.title}</span><span>{error ? "Data belum tersedia" : row ? `${row.benar} benar dari ${row.percobaan} percobaan` : "Belum dicoba"}</span>{!error && <div className="bar"><i style={{ width: `${row && row.percobaan ? Math.min(100, row.benar / row.percobaan * 100) : 0}%`, background: subject.color }} /></div>}</div>)}</div>
          <Link href={`/mapel/${subject.id}`} className="text-link">Lanjut belajar <ArrowRight size={15} /></Link>
        </article>;
      })}
      {!busy && !error && rows.length === 0 && <p className="empty-state">Belum ada latihan tercatat. Mulai dari topik yang kamu suka.</p>}
    </section>
    <aside className="source-note"><Star size={18} /><p>Jawaban dan progres tersimpan di server agar bisa dilihat bersama orang tua atau guru yang berwenang.</p><BookOpen size={18} /></aside>
  </div>;
}
