"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BookOpen, Check, Flag, Heart, Star, X } from "lucide-react";
import AppShell, { useSessionUser } from "@/components/app-shell";
import NaraMascot from "@/components/nara-mascot";
import { CharacterArt } from "@/components/character-art";
import { subjects, topics, sourcesByIds } from "@/content/curriculum";
import { AnswerResult, gasAction, PublicQuestion } from "@/lib/api";
import { readSessionToken } from "@/lib/session";
import "@/components/student-alignment.css";
import "@/components/mockup.css";

type QuestionListResponse = { ok: true; questions: PublicQuestion[] };
type QuizMode = "topic" | "misi" | "ujian" | "cepat";

export default function QuizScreen() {
  return <AppShell audience="student" title="Latihan soal"><QuizContent /></AppShell>;
}

function QuizContent() {
  const user = useSessionUser();
  const [topicId, setTopicId] = useState("");
  const [mode, setMode] = useState<QuizMode>("topic");
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [busy, setBusy] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [marked, setMarked] = useState<Set<string>>(() => new Set());
  const [markBusy, setMarkBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTopic = params.get("topicId") || topics[0]?.id || "";
    const requestedMode = params.get("mode");
    const nextMode: QuizMode = requestedTopic ? "topic" : requestedMode === "misi" || requestedMode === "ujian" || requestedMode === "cepat" ? requestedMode : "topic";
    setTopicId(requestedTopic);
    setMode(nextMode);
  }, []);

  useEffect(() => {
    if (mode === "topic" && !topicId) return;
    let active = true;
    const token = readSessionToken();
    if (!token) return;
    setBusy(true);
    setError("");
    const topicIds = mode === "topic" ? [topicId] : subjects.map((subject) => topics.find((topic) => topic.subjectId === subject.id)?.id).filter((id): id is string => !!id);
    Promise.all(topicIds.map((id) => gasAction<QuestionListResponse>("questions.forTopic", { token, topicId: id })))
      .then((responses) => {
        if (!active) return;
        const lists = responses.map((response) => response.questions);
        let merged = lists.flat();
        if (mode === "misi") merged = lists.map((list) => list[0]).filter((item): item is PublicQuestion => !!item);
        if (mode === "ujian") merged = lists.flatMap((list) => list.slice(0, 2));
        if (mode === "cepat") merged = lists.map((list) => list[0]).filter((item): item is PublicQuestion => !!item).slice(0, 1);
        setQuestions(merged);
        if (merged.length === 0) setError("Belum ada soal untuk latihan ini. Pilih topik lain, ya.");
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Belum bisa memuat soal. Coba lagi.");
      })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [mode, topicId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const current = questions[index];
  const topic = current ? topics.find((item) => item.id === current.topicId) : topicId ? topics.find((item) => item.id === topicId) : null;
  const subject = current ? subjects.find((item) => item.id === current.subjectId) : topic ? subjects.find((item) => item.id === topic.subjectId) : null;
  const sourceLinks = useMemo(() => current ? sourcesByIds(current.sourceIds) : [], [current]);
  const isMarked = current ? marked.has(current.id) : false;
  const label = mode === "misi" ? "Tantangan harian" : mode === "ujian" ? "Ujian mini" : mode === "cepat" ? "Mode cepat" : "Latihan topik";
  const sameSubjectTopics = topic ? topics.filter((item) => item.subjectId === topic.subjectId) : [];
  const nextTopic = topic ? sameSubjectTopics[sameSubjectTopics.findIndex((item) => item.id === topic.id) + 1] : undefined;

  async function submitAnswer() {
    if (!current || choice === null || result || submitting) return;
    const token = readSessionToken();
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      const answer = await gasAction<{ ok: true } & AnswerResult>("answers.submit", { token, questionId: current.id, choice });
      setResult(answer);
      if (answer.correct) setCorrectCount((count) => count + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Jawaban belum terkirim. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleDifficult() {
    if (!current || markBusy) return;
    const token = readSessionToken();
    if (!token) return;
    setMarkBusy(true);
    setError("");
    try {
      await gasAction<{ ok: true }>(isMarked ? "tandai.hapus" : "tandai.tambah", { token, questionId: current.id });
      setMarked((before) => {
        const next = new Set(before);
        if (isMarked) next.delete(current.id); else next.add(current.id);
        return next;
      });
      setToast(isMarked ? "Tanda soal sulit dibatalkan." : "Ditandai — guru akan bahas di kelas");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Tanda belum tersimpan. Coba lagi.");
    } finally {
      setMarkBusy(false);
    }
  }

  function nextQuestion() {
    setIndex((value) => value + 1);
    setChoice(null);
    setResult(null);
    setError("");
  }

  return <div className="student-alignment student-quiz">
    <div className="content-toolbar"><Link href={topic ? `/mapel/${topic.subjectId}` : "/"} className="back-link"><X size={18} /> Tutup</Link><span className="pill-label">{label}</span></div>
    {busy && <div className="message-card inline-loading"><div className="mini-spinner" /><p>Menyiapkan soal dari server…</p></div>}
    {!busy && error && questions.length === 0 && <div className="message-card"><div className="mascot-disc"><NaraMascot small /></div><p>{error}</p><button className="button secondary" onClick={() => window.location.reload()}>Coba lagi</button></div>}
    {!busy && current && subject && topic && <section className="quiz-card">
      <div className="quiz-topline"><div className="quiz-subject"><span className="subject-icon" style={{ color: subject.color, background: subject.tint }}>{subject.icon}</span><div><strong>{subject.name} • {topic.title}</strong></div></div><div className="quiz-topline-right"><span className="quiz-stars-chip"><Star size={15} fill="currentColor" />+10</span><span className="question-counter">{index + 1} / {questions.length}</span></div></div>
      <div className="quiz-progress"><span style={{ width: `${((index + (result ? 1 : 0)) / questions.length) * 100}%`, background: subject.color }} /></div>
      <div className="quiz-difficult-row"><button className={`flag-button ${isMarked ? "marked" : ""}`} onClick={toggleDifficult} disabled={markBusy} aria-pressed={isMarked}><Flag size={18} fill={isMarked ? "currentColor" : "none"} />{isMarked ? "Soal ditandai sulit" : "Soal ini susah"}</button><span>Guru bisa melihat soal yang ditandai</span></div>
      <h2 className="question-text">{current.stem}</h2>
      <div className="answer-options" role="radiogroup" aria-label="Pilih satu jawaban">
        {current.choices.map((text, optionIndex) => {
          const selected = choice === optionIndex;
          const incorrectSelection = result && selected && !result.correct;
          return <button className={`answer-choice no-bullet ${selected ? "selected" : ""} ${result && result.correct && selected ? "is-correct" : ""} ${incorrectSelection ? "is-wrong" : ""}`} key={`${current.id}-${optionIndex}`} role="radio" aria-checked={selected} disabled={!!result} onClick={() => setChoice(optionIndex)}>
            <span>{text}</span>{result && selected && result.correct && <Check size={21} className="choice-check" />}{incorrectSelection && <X size={21} className="choice-check" />}
          </button>;
        })}
      </div>
      {error && questions.length > 0 && <p className="notice" role="status">{error}</p>}
      {result && <div className={`answer-result ${result.correct ? "success" : "try-again"}`} role="status">
        <span className="result-icon">{result.correct ? <Check size={21} /> : <Heart size={21} />}</span><div><strong>{result.correct ? "Hebat, jawabanmu benar!" : "Belum tepat, yuk belajar lagi."}</strong><p>{result.explanation}</p><small>Rujukan: {current.sourceLocator || "materi belajar Kelas 4"}</small></div>
        {result.correct && <span className="floating-star">⭐ +10</span>}
      </div>}
      <div className="quiz-sources"><span><BookOpen size={16} /> Rujukan materi</span><div>{sourceLinks.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>{source.title} ↗</a>)}</div></div>
      <div className="quiz-controls">{!result ? <button className="button primary" disabled={choice === null || submitting} onClick={submitAnswer}>{submitting ? "Memeriksa…" : "Periksa dulu, baru lanjut"} <ArrowRight size={18} /></button> : <button className="button primary" onClick={nextQuestion}>{index + 1 === questions.length ? "Lihat hasil" : "Soal berikutnya"} <ArrowRight size={18} /></button>}</div>
    </section>}
    {!busy && !error && !current && questions.length > 0 && <section className="message-card finish-card"><div className="result-characters"><CharacterArt character="nara" variant={{ type: "expression", name: "celebrating" }} size={124} alt="Nara merayakan usahamu" /><CharacterArt character="nusa" variant={{ type: "expression", name: "laughing" }} size={124} alt="Nusa ikut merayakan" /></div><div className="finish-stars" aria-hidden="true"><span>★</span><span>★</span><span>★</span></div><p className="eyebrow">PETUALANGAN SELESAI</p><h2>Hebat, {user?.username}!{topic ? ` Topik ${topic.title} selesai!` : ""}</h2><p>Benar {correctCount} dari {questions.length} soal. Setiap latihan membuatmu makin paham.</p>
      <div className="finish-stats">
        <div className="stat-card"><span className="stat-icon teal"><BadgeCheck size={22} /></span><strong>Benar {correctCount} dari {questions.length}</strong><span>Jawaban benar</span></div>
        <div className="stat-card"><span className="stat-icon amber"><Star size={22} fill="currentColor" /></span><strong>+{correctCount * 10} XP</strong><span>Bintang baru</span></div>
        <div className="stat-card"><span className="stat-icon coral"><Flag size={22} /></span><strong>{marked.size} soal</strong><span>Ditandai susah</span></div>
      </div>
      {marked.size > 0 && <div className="finish-quote"><CharacterArt character="nara" variant={{ type: "avatar" }} size={52} alt="Avatar Nara" /><p><strong>Soal yang kamu tandai akan dibahas guru di kelas.</strong><br />Hebat, kamu berani bilang soal mana yang susah!</p></div>}
      <div className="finish-actions">{nextTopic ? <Link className="button primary" href={`/latihan?topicId=${encodeURIComponent(nextTopic.id)}`}>Topik berikutnya <ArrowRight size={18} /></Link> : topic ? <Link className="button primary" href={`/mapel/${topic.subjectId}`}>Topik berikutnya <ArrowRight size={18} /></Link> : null}<Link className="button secondary" href="/">Kembali ke Beranda <ArrowRight size={18} /></Link></div></section>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}
