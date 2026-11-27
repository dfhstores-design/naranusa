"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import AppShell from "@/components/app-shell";
import { subjects } from "@/content/curriculum";
import { gasAction, ProgressRow } from "@/lib/api";
import { starsFor } from "@/lib/progress-summary";
import { readSessionToken } from "@/lib/session";
import "@/components/student-alignment.css";
import "@/components/mockup.css";

type ProgressResponse = { ok: true; progress: ProgressRow[] };

export default function RewardsPage() {
  return <AppShell audience="student" title="Hadiah"><RewardsContent /></AppShell>;
}

function RewardsContent() {
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const token = readSessionToken();
    if (!token) return;
    gasAction<ProgressResponse>("progress.get", { token }).then((result) => {
      if (active) setRows(result.progress);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Belum bisa memuat hadiah.");
    }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  const totalCorrect = rows.reduce((sum, row) => sum + row.benar, 0);
  const totalStars = starsFor(totalCorrect);

  return <div className="student-alignment">
    <section className="reward-hero"><span className="big-star" aria-hidden="true">★</span><div><h2>{busy ? "Memuat…" : `Kamu punya ${totalStars} bintang!`}</h2><p>Setiap jawaban benar = 10 bintang. Bintang ini hadiah untuk usahamu sendiri.</p></div></section>
    {error && <div className="notice" role="status">{error} <button className="text-button" onClick={() => window.location.reload()}>Coba lagi</button></div>}
    <section className="content-section">
      <div className="section-heading"><div><p className="eyebrow">BINTANG PER MAPEL</p><h2>Dari mana bintangmu datang?</h2></div></div>
      <div className="stat-row" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        {subjects.map((subject) => {
          const subjectRows = rows.filter((row) => row.topicId.startsWith(subject.id === "matematika" ? "mtk-" : subject.id === "bahasa-indonesia" ? "indo-" : subject.id === "pendidikan-pancasila" ? "pancasila-" : subject.id === "teknologi-informasi-komunikasi" ? "tik-" : subject.id === "pendidikan-agama-islam" ? "pai-" : subject.id === "pjok" ? "pjok-" : subject.id === "seni" ? "seni-" : subject.id === "bahasa-inggris" ? "inggris-" : "ipas-"));
          const correct = subjectRows.reduce((sum, row) => sum + row.benar, 0);
          const attempts = subjectRows.reduce((sum, row) => sum + row.percobaan, 0);
          return <div className="stat-card" key={subject.id}>
            <span className="stat-icon amber"><Star size={22} fill="currentColor" /></span>
            <strong>{busy ? "…" : starsFor(correct)}</strong>
            <span>{subject.name}</span>
            <span>{busy ? "" : `${correct} benar · ${attempts} soal`}</span>
          </div>;
        })}
      </div>
    </section>
    <p style={{ marginTop: 18, color: "#73758f", fontSize: 14 }}>Tidak ada peringkat antar anak — bintangmu hanya untukmu, bukan untuk dibandingkan.</p>
  </div>;
}
