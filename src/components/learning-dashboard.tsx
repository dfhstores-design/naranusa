"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChartColumn,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  Flame,
  Heart,
  Home,
  Leaf,
  LockKeyhole,
  Sparkles,
  Star,
  Target,
  Trophy,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { questions, sourcesByIds, subjectById, subjects, topics, type Question, type SubjectId } from "@/content/curriculum";
import { getLearnerAvailableQuestions } from "@/lib/learner-questions";
import { useLearningStore } from "@/store/learning-store";
import NaraMascot from "@/components/nara-mascot";
import { Progress } from "@/components/ui";

type View = "home" | "topics" | "progress";
type QuizMode = "Misi harian" | "Tantangan harian" | "Latihan topik" | "Ujian mini" | "Mode cepat";

type QuizSession = {
  items: Question[];
  index: number;
  selected: number | null;
  submitted: boolean;
  mode: QuizMode;
  correct: number;
};

const navigation: { id: View; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "topics", label: "Jelajahi topik", icon: BookOpen },
  { id: "progress", label: "Progresku", icon: ChartColumn },
];

const modeCards: { title: QuizMode; caption: string; icon: typeof Target; color: string; tint: string }[] = [
  { title: "Latihan topik", caption: "Pilih mapel favoritmu", icon: BookOpen, color: "#6956d7", tint: "#f0edff" },
  { title: "Tantangan harian", caption: "4 soal, satu dari tiap mapel", icon: Target, color: "#e77559", tint: "#fff0eb" },
  { title: "Ujian mini", caption: "Coba semua soal contoh", icon: Trophy, color: "#d49a22", tint: "#fff7e4" },
  { title: "Mode cepat", caption: "Satu soal, mulai sekarang", icon: Sparkles, color: "#299984", tint: "#e9f8f3" },
];

export default function LearningDashboard() {
  const [view, setView] = useState<View>("home");
  const [focusSubject, setFocusSubject] = useState<SubjectId>("matematika");
  const [quiz, setQuiz] = useState<QuizSession | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [toast, setToast] = useState("");
  const [todayLabel, setTodayLabel] = useState("");
  const xp = useLearningStore((state) => state.xp);
  const stars = useLearningStore((state) => state.stars);
  const streak = useLearningStore((state) => state.streak);
  const answered = useLearningStore((state) => state.answered);
  const recordAnswer = useLearningStore((state) => state.recordAnswer);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setTodayLabel(new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" }).format(new Date()).toLocaleUpperCase("id-ID"));
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setShowInstall(true);
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    window.addEventListener("beforeinstallprompt", beforeInstall);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      window.removeEventListener("beforeinstallprompt", beforeInstall);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const correctCount = Object.values(answered).filter(Boolean).length;

  const focusTopics = useMemo(() => topics.filter((topic) => topic.subjectId === focusSubject), [focusSubject]);
  const learnerQuestions = useMemo(() => getLearnerAvailableQuestions(questions), []);
  const focusQuestions = useMemo(() => learnerQuestions.filter((question) => question.subjectId === focusSubject), [focusSubject, learnerQuestions]);

  function setPage(next: View) {
    setView(next);
    if (next === "topics") setFocusSubject("matematika");
  }

  function openSubject(subjectId: SubjectId) {
    setFocusSubject(subjectId);
    setView("topics");
  }

  function startQuiz(mode: QuizMode, subjectId?: SubjectId, topicId?: string) {
    const pool = learnerQuestions.filter((question) => (!subjectId || question.subjectId === subjectId) && (!topicId || question.topicId === topicId));
    const items = mode === "Mode cepat" ? pool.slice(0, 1) : topicId || mode === "Ujian mini" ? pool : pool.slice(0, 4);
    if (items.length === 0) {
      setToast("Soal untuk topik ini sedang disiapkan.");
      return;
    }
    setQuiz({ items, index: 0, selected: null, submitted: false, mode, correct: 0 });
  }

  function submitAnswer() {
    if (!quiz || quiz.selected === null || quiz.submitted) return;
    const current = quiz.items[quiz.index];
    const isCorrect = quiz.selected === current.answerIndex;
    recordAnswer(current.id, isCorrect);
    setQuiz({ ...quiz, submitted: true, correct: quiz.correct + (isCorrect ? 1 : 0) });
  }

  function moveNext() {
    if (!quiz) return;
    if (quiz.index + 1 >= quiz.items.length) {
      setQuiz({ ...quiz, index: quiz.items.length, submitted: false });
      return;
    }
    setQuiz({ ...quiz, index: quiz.index + 1, selected: null, submitted: false });
  }

  async function installApp() {
    if (!installEvent) {
      setToast("Gunakan menu browser ‘Tambahkan ke layar utama’ untuk memasang aplikasi.");
      return;
    }
    await installEvent.prompt();
    setInstallEvent(null);
    setShowInstall(false);
  }

  const activeQuestion = quiz && quiz.index < quiz.items.length ? quiz.items[quiz.index] : null;
  const activeSubject = activeQuestion ? subjectById(activeQuestion.subjectId) : null;
  const activeTopic = activeQuestion ? topics.find((topic) => topic.id === activeQuestion.topicId) : null;
  const questionSources = activeQuestion ? sourcesByIds(activeQuestion.sourceIds) : [];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-label">MENU BELAJAR</div>
        <nav className="side-nav" aria-label="Navigasi utama">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={`side-nav-item ${view === item.id ? "is-active" : ""}`} onClick={() => setPage(item.id)}>
                <Icon size={18} strokeWidth={2.2} />
                <span>{item.label}</span>
                {view === item.id && <span className="nav-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-subjects">
          <div className="sidebar-label">MAPEL KELAS 4</div>
          {subjects.map((subject) => (
            <button key={subject.id} className="side-subject-item" onClick={() => openSubject(subject.id)}>
              <span className="subject-mini-icon" style={{ color: subject.color, background: subject.tint }}>{subject.icon}</span>
              <span>{subject.name}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="parent-callout">
            <div className="parent-callout-icon"><Heart size={17} fill="currentColor" /></div>
            <p>Temani langkah kecilnya, setiap hari.</p>
            <button onClick={() => setPage("progress")}>Lihat ringkasan <ArrowRight size={13} /></button>
          </div>
          <div className="profile-row">
            <div className="profile-avatar">A</div>
            <div className="profile-copy"><strong>Alya Putri</strong><span>Kelas 4 · Petualang</span></div>
            <span className="profile-star"><Star size={14} fill="currentColor" /> {stars}</span>
          </div>
        </div>
      </aside>

      <section className="main-column">
        <header className="topbar">
          <div className="mobile-brand"><Brand compact /></div>
          <div className="breadcrumb"><span>Belajar</span><ChevronRight size={14} /> <strong>{view === "home" ? "Beranda" : view === "topics" ? "Jelajahi topik" : "Progresku"}</strong></div>
          <div className="topbar-actions">
            <span className={`connection-pill ${isOnline ? "online" : "offline"}`} title={isOnline ? "Siap online dan offline" : "Sedang offline"}>
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isOnline ? "Siap belajar" : "Mode offline"}
            </span>
            {showInstall && <button className="install-button" onClick={installApp}><Download size={15} /> Pasang</button>}
            <div className="top-streak"><Flame size={17} fill="#f4a340" color="#ee9131" /><strong>{streak}</strong><span>hari</span></div>
            <button className="top-avatar" aria-label="Profil Alya">A</button>
          </div>
        </header>

        <div className="page-content">
          {view === "home" && (
            <>
              <section className="welcome-row">
                <div>
                  <p className="eyebrow">{todayLabel || "HARI INI"} <span className="eyebrow-dot" /> KELAS 4</p>
                  <h1>Halo, Alya! <span className="wave">✦</span></h1>
                  <p className="welcome-subtitle">Prototipe demo: contoh soal belum ditinjau guru.</p>
                </div>
                <div className="welcome-note"><span className="note-spark">✦</span><span>Belajar sedikit<br />jadi hebat!</span></div>
              </section>

              <section className="hero-card">
                <div className="hero-content">
                  <div className="hero-kicker"><Sparkles size={15} /> CONTOH MISI</div>
                  <h2>Petualangan<br /><em>empat mapel!</em></h2>
                  <p>Jawab 4 soal pilihan Nara. Setiap jawaban benar membuka bintang baru.</p>
                  <div className="hero-meta"><span><Clock3 size={15} /> ± 5 menit</span><span className="meta-separator" /><span><Star size={15} /> +40 XP</span></div>
                  <button className="hero-button" onClick={() => startQuiz("Misi harian")}>Mulai misi <ArrowRight size={17} /></button>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="hero-sun" />
                  <div className="hero-doodle hero-doodle-one">✦</div>
                  <div className="hero-doodle hero-doodle-two">·</div>
                  <div className="hero-blob"><NaraMascot /></div>
                  <div className="hero-speech">Ayo, kita<br />mulai! <span>☺</span></div>
                  <div className="hero-leaf leaf-a"><Leaf size={31} /></div>
                  <div className="hero-leaf leaf-b"><Leaf size={23} /></div>
                </div>
                <div className="hero-wave" />
              </section>

              <section className="quick-stats" aria-label="Ringkasan belajar">
                <div className="stat-item"><span className="stat-icon stat-purple"><Sparkles size={17} /></span><span className="stat-copy"><strong>{xp} XP</strong><small>Level 3 · Penjelajah</small></span><Progress aria-label="Progres XP menuju level berikutnya" value={Math.min((xp % 200) / 2, 100)} className="stat-progress" /></div>
                <div className="stat-divider" />
                <div className="stat-item"><span className="stat-icon stat-yellow"><Star size={18} fill="currentColor" /></span><span className="stat-copy"><strong>{stars} bintang</strong><small>Kumpulkan lebih banyak</small></span><span className="stat-trailing">✦</span></div>
                <div className="stat-divider" />
                <div className="stat-item"><span className="stat-icon stat-orange"><Flame size={18} fill="currentColor" /></span><span className="stat-copy"><strong>{streak} hari beruntun</strong><small>Semangatnya keren!</small></span><div className="streak-dots"><b /><b /><b /><b className="empty" /><b className="empty" /></div></div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div><p className="section-overline">PILIH PETUALANGANMU</p><h2>Belajar apa hari ini?</h2></div>
                  <button className="text-link" onClick={() => setPage("topics")}>Semua topik <ArrowRight size={15} /></button>
                </div>
                <div className="subject-grid">
                  {subjects.map((subject, index) => {
                    const subjectQuestion = learnerQuestions.find((question) => question.subjectId === subject.id);
                    const subjectQuestionCount = learnerQuestions.filter((question) => question.subjectId === subject.id).length;
                    const done = subjectQuestion ? answered[subjectQuestion.id] === true : false;
                    return (
                      <motion.button key={subject.id} className="subject-card" onClick={() => openSubject(subject.id)} style={{ "--subject-color": subject.color, "--subject-tint": subject.tint } as React.CSSProperties} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                        <div className="subject-card-top"><span className="subject-emoji">{subject.icon}</span><span className="subject-number">0{index + 1}</span></div>
                        <h3>{subject.name}</h3>
                        <p>{subject.description}</p>
                        <div className="subject-card-bottom"><span>{subjectQuestionCount ? `${subjectQuestionCount} soal tersedia` : "Soal sedang disiapkan"}</span><span className="subject-arrow"><ChevronRight size={17} /></span></div>
                        <div className="subject-progress"><span style={{ width: done ? "100%" : "8%" }} /></div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              <section className="section-block modes-section">
                <div className="section-heading">
                  <div><p className="section-overline">CARA BELAJAR</p><h2>Pilih mode seru</h2></div>
                </div>
                <div className="mode-grid">
                  {modeCards.map((mode) => {
                    const Icon = mode.icon;
                    return <button key={mode.title} className="mode-card" onClick={() => mode.title === "Latihan topik" ? setPage("topics") : startQuiz(mode.title)}>
                      <span className="mode-icon" style={{ color: mode.color, background: mode.tint }}><Icon size={19} /></span>
                      <span className="mode-copy"><strong>{mode.title}</strong><small>{mode.caption}</small></span>
                      <ChevronRight size={17} className="mode-chevron" />
                    </button>;
                  })}
                </div>
              </section>

              <footer className="content-footer"><ShieldBadge /> <span>Topik dan contoh soal merujuk buku serta CP resmi. <button onClick={() => setPage("topics")}>Lihat sumber</button></span><span className="footer-privacy"><LockKeyhole size={12} /> Progres tersimpan di perangkat ini</span></footer>
            </>
          )}

          {view === "topics" && (
            <>
              <section className="subpage-heading">
                <p className="section-overline">MATERI KELAS 4 · FASE B</p>
                <h1>Jelajahi topik <span className="wave">✦</span></h1>
                <p className="welcome-subtitle">Pilih mapel, lalu buka topik yang ingin kamu pelajari.</p>
              </section>
              <div className="subject-tabs" role="tablist" aria-label="Pilih mata pelajaran">
                {subjects.map((subject) => <button key={subject.id} role="tab" aria-selected={focusSubject === subject.id} className={`subject-tab ${focusSubject === subject.id ? "active" : ""}`} style={{ "--tab-color": subject.color } as React.CSSProperties} onClick={() => setFocusSubject(subject.id)}><span>{subject.icon}</span>{subject.name}</button>)}
              </div>
              <div className="topic-header-card" style={{ "--subject-tint": subjectById(focusSubject).tint, "--subject-color": subjectById(focusSubject).color } as React.CSSProperties}>
                <div className="topic-header-icon">{subjectById(focusSubject).icon}</div>
                <div><h2>{subjectById(focusSubject).name}</h2><p>{subjectById(focusSubject).description}</p></div>
                <div className="topic-header-count"><strong>{focusTopics.length}</strong><span>topik rujukan</span></div>
              </div>
              <div className="topic-list">
                {focusTopics.map((topic, index) => {
                  const relatedQuestions = focusQuestions.filter((question) => question.topicId === topic.id);
                  return <article className="topic-row" key={topic.id}>
                    <span className="topic-index" style={{ color: subjectById(focusSubject).color, background: subjectById(focusSubject).tint }}>{String(index + 1).padStart(2, "0")}</span>
                    <div className="topic-copy"><p>{topic.chapter}</p><h3>{topic.title}</h3><span>{topic.objective}</span></div>
                    {relatedQuestions.length ? <button className="topic-action" onClick={() => startQuiz("Latihan topik", focusSubject, topic.id)}>Latihan {relatedQuestions.length} soal <ArrowRight size={15} /></button> : <span className="topic-coming">Soal belum tersedia</span>}
                  </article>;
                })}
              </div>
              <div className="curriculum-callout"><div className="callout-icon"><BookOpen size={19} /></div><div><strong>Catatan kurikulum</strong><p>{"CP Fase B biasanya mencakup kelas 3–4. Daftar topik di sini mengikuti bab buku Kelas 4; susunan belajar bisa menyesuaikan sekolah."}</p></div></div>
              <div className="source-panel">
                <div className="source-panel-heading"><div><p className="section-overline">RUJUKAN MATERI</p><h2>Sumber yang dipakai</h2></div><span className="verified-pill"><Check size={13} /> Rujukan tercatat</span></div>
                <div className="source-links">
                  {sourcesByIds(subjectById(focusSubject).sourceIds).map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="source-link-card">
                    <span className="source-link-icon"><BookOpen size={16} /></span><span className="source-link-copy"><strong>{source.title}</strong><small>{source.publisher} · {source.year}</small><small className="source-evidence">{source.evidence}</small></span><ExternalLink size={14} className="source-external" />
                  </a>)}
                </div>
              </div>
              <footer className="content-footer"><ShieldBadge /><span>Contoh soal baru disusun dari tujuan/topik pada rujukan di atas; bukan salinan soal buku.</span><span className="footer-privacy"><LockKeyhole size={12} /> Tanpa papan peringkat publik</span></footer>
            </>
          )}

          {view === "progress" && (
            <>
              <section className="subpage-heading">
                <p className="section-overline">CATATAN PETUALANGAN</p>
                <h1>Progres belajar Alya <span className="wave">✦</span></h1>
                <p className="welcome-subtitle">Ringkasan sederhana yang bisa dilihat bersama orang tua.</p>
              </section>
              <section className="progress-hero">
                <div className="progress-hero-copy"><span className="hero-kicker"><Award size={15} /> SEMANGAT TERUS</span><h2>Setiap langkah<br />itu kemajuan!</h2><p>Progres di prototipe ini tersimpan di perangkat yang kamu pakai. Data tidak dikirim ke server.</p></div>
                <div className="progress-score"><div className="score-circle"><strong>{correctCount}</strong><span>benar</span></div><small>dari {questions.length} soal contoh</small></div>
              </section>
              <section className="progress-subjects">
                <div className="section-heading"><div><p className="section-overline">PETA BELAJAR</p><h2>Langkah per mapel</h2></div><span className="demo-tag">Data perangkat ini</span></div>
                {subjects.map((subject) => {
                  const question = questions.find((item) => item.subjectId === subject.id);
                  const completed = question && answered[question.id] === true;
                  return <div className="progress-subject-row" key={subject.id}>
                    <span className="progress-subject-icon" style={{ color: subject.color, background: subject.tint }}>{subject.icon}</span>
                    <div className="progress-subject-name"><strong>{subject.name}</strong><small>{completed ? "1 soal contoh benar" : "Belum ada soal contoh benar"}</small></div>
                    <div className="progress-bar"><span style={{ width: completed ? "100%" : "0%", background: subject.color }} /></div>
                    <span className="progress-percent">{completed ? "1/1" : "0/1"}</span>
                  </div>;
                })}
              </section>
              <div className="parent-note"><span className="parent-note-icon"><Heart size={17} fill="currentColor" /></span><p><strong>Untuk orang tua:</strong> ini prototipe awal. Sinkronisasi akun, laporan mingguan, dan pengaturan wali belum tersambung. Jawaban latihan contoh disimpan lokal pada browser.</p></div>
              <button className="reset-progress" onClick={() => { useLearningStore.getState().resetDemoProgress(); setToast("Progres contoh dikembalikan."); }}><X size={14} /> Reset progres contoh</button>
            </>
          )}
        </div>
      </section>

      <nav className="mobile-nav" aria-label="Navigasi bawah">
        {navigation.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setPage(item.id)}><Icon size={19} /><span>{item.label}</span></button>;
        })}
      </nav>

      <AnimatePresence>
        {quiz && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setQuiz(null); }}>
          <motion.section className="quiz-modal" role="dialog" aria-modal="true" aria-label="Latihan soal" initial={{ y: 24, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 16, opacity: 0, scale: 0.98 }} transition={{ type: "spring", damping: 24, stiffness: 260 }}>
            <div className="quiz-modal-top"><button className="icon-button" onClick={() => setQuiz(null)} aria-label="Tutup latihan"><X size={19} /></button><div className="quiz-progress-text"><span>{quiz.mode}</span><strong>{quiz.index >= quiz.items.length ? "Selesai!" : `Soal ${quiz.index + 1} dari ${quiz.items.length}`}</strong></div><span className="quiz-mini-logo">N</span></div>
            {activeQuestion && activeSubject && activeTopic ? <>
              <div className="quiz-progress-track"><span style={{ width: `${((quiz.index + (quiz.submitted ? 1 : 0)) / quiz.items.length) * 100}%`, background: activeSubject.color }} /></div>
              <div className="quiz-subject-line"><span style={{ color: activeSubject.color, background: activeSubject.tint }}>{activeSubject.icon}</span><div><strong>{activeSubject.name}</strong><small>{activeTopic.chapter}</small></div><span className="question-tag">Soal contoh</span></div>
              <h2 className="question-stem">{activeQuestion.stem}</h2>
              <div className="answer-list" role="radiogroup" aria-label="Pilihan jawaban">
                {activeQuestion.choices.map((choice, index) => {
                  const selected = quiz.selected === index;
                  const correctChoice = quiz.submitted && index === activeQuestion.answerIndex;
                  const wrongChoice = quiz.submitted && selected && index !== activeQuestion.answerIndex;
                  return <button key={choice} className={`answer-option ${selected ? "selected" : ""} ${correctChoice ? "correct" : ""} ${wrongChoice ? "wrong" : ""}`} role="radio" aria-checked={selected} disabled={quiz.submitted} onClick={() => setQuiz({ ...quiz, selected: index })}>
                    <span className="choice-letter">{String.fromCharCode(65 + index)}</span><span>{choice}</span>{correctChoice && <Check size={18} className="answer-mark" />}{wrongChoice && <X size={18} className="answer-mark" />}
                  </button>;
                })}
              </div>
              {quiz.submitted && <motion.div className={`answer-feedback ${quiz.selected === activeQuestion.answerIndex ? "is-right" : "is-wrong"}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <span className="feedback-icon">{quiz.selected === activeQuestion.answerIndex ? <Check size={18} /> : <Heart size={18} />}</span><div><strong>{quiz.selected === activeQuestion.answerIndex ? "Hebat, jawabanmu benar!" : "Belum tepat, yuk belajar lagi."}</strong><p>{activeQuestion.explanation}</p><small>Sumber: {activeQuestion.sourceLocator}</small></div>
              </motion.div>}
              <div className="quiz-source-row"><span><BookOpen size={14} /> Berdasarkan rujukan</span><div>{questionSources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" title={source.title}><ExternalLink size={13} /> {source.year}</a>)}</div></div>
              <div className="quiz-actions">
                {!quiz.submitted ? <button className="primary-button" disabled={quiz.selected === null} onClick={submitAnswer}>Periksa jawaban <ArrowRight size={16} /></button> : <button className="primary-button" onClick={moveNext}>{quiz.index + 1 >= quiz.items.length ? "Lihat hasil" : "Lanjut soal"} <ArrowRight size={16} /></button>}
                {!quiz.submitted && <button className="quiet-button" onClick={() => setQuiz(null)}>Nanti saja</button>}
              </div>
            </> : <div className="quiz-finish">
              <div className="finish-art"><NaraMascot small /></div><p className="section-overline">PETUALANGAN SELESAI</p><h2>Kamu sudah berusaha hebat!</h2><p>Benar {quiz.correct} dari {quiz.items.length} soal. Setiap latihan bikin kamu makin paham.</p><div className="finish-rewards"><span><Star size={17} fill="currentColor" /> +{quiz.correct * 10} XP</span><span><Sparkles size={17} /> {quiz.correct} jawaban benar</span></div><button className="primary-button" onClick={() => setQuiz(null)}>Kembali ke belajar <ArrowRight size={16} /></button>
              </div>}
          </motion.section>
        </motion.div>}
      </AnimatePresence>

      <AnimatePresence>{toast && <motion.div className="toast-message" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>{toast}</motion.div>}</AnimatePresence>
    </main>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? "compact" : ""}`}>
    <span className="brand-mark"><NaraMascot tiny /></span>
    <span className="brand-copy"><strong>NaraNusa</strong><small>jelajah ilmu, seru!</small></span>
  </div>;
}

function ShieldBadge() {
  return <span className="source-shield"><BookOpen size={14} /></span>;
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice?: Promise<{ outcome: "accepted" | "dismissed" }> };
