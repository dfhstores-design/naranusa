"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import TutorCard from "@/components/tutor-card";
import NaraMascot from "@/components/nara-mascot";
import { subjects, topics, type SubjectId } from "@/content/curriculum";
import { Card } from "@/components/ui";

export default function TutorPage() {
  const [subjectId, setSubjectId] = useState<SubjectId>("matematika");
  const availableTopics = useMemo(() => topics.filter((topic) => topic.subjectId === subjectId), [subjectId]);
  const [topicId, setTopicId] = useState(availableTopics[0]?.id || "mtk-bilangan");
  const selectedTopicId = availableTopics.some((topic) => topic.id === topicId) ? topicId : availableTopics[0]?.id || "mtk-bilangan";

  function changeSubject(nextSubject: SubjectId) {
    setSubjectId(nextSubject);
    const firstTopic = topics.find((topic) => topic.subjectId === nextSubject);
    if (firstTopic) setTopicId(firstTopic.id);
  }

  return (
    <main className="tutor-page-shell">
      <div className="tutor-page-top"><Link href="/" className="auth-back"><ArrowLeft size={16} /> Kembali ke beranda</Link><span className="auth-brand"><span className="auth-brand-icon"><MessageCircle size={17} /></span><strong>Tanya Nara</strong></span></div>
      <Card asChild className="tutor-page-card"><section>
        <div className="tutor-page-hero"><div><span className="hero-kicker tutor-page-kicker">TEMAN BELAJAR</span><h1>Ada yang ingin<br />kamu tanyakan?</h1><p>Pilih mapel dan topik dulu, supaya jawaban Nara tetap sesuai bahan belajar.</p></div><div className="tutor-page-mascot"><NaraMascot small /></div></div>
        <div className="tutor-topic-picker">
          <label htmlFor="tutor-subject">Mata pelajaran</label>
          <select id="tutor-subject" value={subjectId} onChange={(event) => changeSubject(event.target.value as SubjectId)}>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <label htmlFor="tutor-topic">Topik</label>
          <select id="tutor-topic" value={selectedTopicId} onChange={(event) => setTopicId(event.target.value)}>
            {availableTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.chapter} — {topic.title}</option>)}
          </select>
        </div>
        <TutorCard topicId={selectedTopicId} />
        <p className="tutor-page-safety">Jangan bagikan nama lengkap, sekolah, alamat, atau nomor telepon. Jika Nara belum punya rujukan yang cukup, ia seharusnya mengatakannya.</p>
      </section></Card>
    </main>
  );
}
