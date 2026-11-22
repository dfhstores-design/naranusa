"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, MessageCircle, Send } from "lucide-react";
import { questions, topicById } from "@/content/curriculum";
import { Badge, Button } from "@/components/ui";

export default function TutorCard({ topicId }: { topicId: string }) {
  const topic = topicById(topicId);
  const hasExample = questions.some((item) => item.topicId === topicId && item.reviewStatus === "teacher_approved");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function askTutor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAnswer("");
    setBusy(true);
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, studentQuestion: question }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Nara belum bisa menjawab sekarang.");
      setAnswer(data.answer);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Nara belum bisa menjawab sekarang.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tutor-card">
      <div className="tutor-card-heading"><span className="tutor-avatar"><MessageCircle size={17} /></span><div><strong>Tanya Nara</strong><small>Penjelasan sederhana dari topik terpilih</small></div><Badge variant="secondary" className="tutor-beta">BETA</Badge></div>
      <p className="tutor-context">Topik aktif: <b>{topic.title}</b>. {hasExample ? "Nara diarahkan untuk menggunakan contoh soal, pembahasan, dan rujukan yang tersedia; jawabannya tetap perlu diperiksa." : "Tanya Nara belum tersedia karena belum ada contoh soal dan pembahasan yang disetujui guru."}</p>
      <form className="tutor-form" onSubmit={askTutor}>
        <label className="sr-only" htmlFor="tutor-question">Tulis pertanyaan tentang topik {topic.title}</label>
        <input id="tutor-question" value={question} onChange={(event) => setQuestion(event.target.value.slice(0, 300))} placeholder={hasExample ? "Bagian mana yang ingin kamu pahami?" : "Belum tersedia untuk topik ini"} maxLength={300} disabled={!hasExample} />
        <Button type="submit" className="tutor-send" disabled={!hasExample || busy || question.trim().length < 3} aria-label="Kirim pertanyaan">{busy ? <LoaderCircle size={15} className="spin" /> : <Send size={15} />}</Button>
      </form>
      <div className="tutor-meta"><span>{question.length}/300 karakter</span><span>Jangan tulis nama lengkap atau data pribadi.</span></div>
      {(error || answer) && <div className={`tutor-response ${error ? "tutor-error" : ""}`} role="status">{error || answer}</div>}
      <p className="tutor-footnote">AI opsional: memerlukan kunci Gemini dan contoh soal yang disetujui guru. Sebelum digunakan anak, diperlukan persetujuan wali dan perlindungan privasi serta pembatasan penggunaan di server.</p>
    </section>
  );
}
