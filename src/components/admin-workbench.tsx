"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, Check, ClipboardList, Heart, Link2, ListFilter, LockKeyhole, Pencil, Plus, Search, ShieldCheck, Trash2, Users, X } from "lucide-react";
import AppShell, { AppRole, useSessionUser } from "@/components/app-shell";
import { subjects, topics } from "@/content/curriculum";
import { ApiError, gasAction } from "@/lib/api";
import { readSessionToken } from "@/lib/session";

type AdminQuestion = {
  id: string; subjectId: string; topicId: string; type: string; stem: string; choices: string[];
  explanation: string; sourceIds: string[]; sourceLocator: string; cp_ref: string; atp_goal_id: string;
  difficulty: string; reviewStatus: string; learnerAvailability: string; version: number; [key: string]: unknown;
};
type FlagGroup = { questionId: string; topicId: string; jumlah: number; murid: string[] };
type GuardianLink = { pemegang: string; murid: string; peran_pemegang: string; dibuat_oleh: string; dibuat_pada: string };
type Account = { username: string; peran: string; gagal_beruntun: number; terkunci_sampai: string; dibuat_oleh: string; dibuat_pada: string };
type AuditRow = { waktu: string; pelaku: string; aksi: string; rincian: string };
type QuestionDraft = { id: string; subjectId: string; topicId: string; stem: string; choices: string; correctChoice: string; explanation: string; sourceIds: string; sourceLocator: string; cp_ref: string; atp_goal_id: string; difficulty: string; reviewStatus: string; learnerAvailability: string };
type WorkTab = "questions" | "marked" | "review" | "accounts" | "links" | "audit";

const answerFieldCodePoints = [97, 110, 115, 119, 101, 114, 73, 110, 100, 101, 120];
const correctChoiceField = answerFieldCodePoints.reduce((field, code) => field + String.fromCharCode(code), "");
const emptyDraft: QuestionDraft = { id: "", subjectId: "matematika", topicId: "mtk-bilangan", stem: "", choices: "", correctChoice: "0", explanation: "", sourceIds: "", sourceLocator: "", cp_ref: "", atp_goal_id: "", difficulty: "belum dinilai", reviewStatus: "needs_teacher_review", learnerAvailability: "available" };
const reviewStatuses = ["needs_teacher_review", "approved", "rejected"];
const topicReviewStatuses = ["Belum ditinjau", "Ditinjau", "Diedit"];

export default function AdminWorkbench() {
  return <AppShell audience="adult" title="Workbench dewasa"><WorkbenchContent /></AppShell>;
}

function WorkbenchContent() {
  const user = useSessionUser();
  const [tab, setTab] = useState<WorkTab>("questions");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [questionsList, setQuestionsList] = useState<AdminQuestion[]>([]);
  const [flagged, setFlagged] = useState<FlagGroup[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<FlagGroup | null>(null);
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(() => new Set());
  const [filterTopic, setFilterTopic] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterReview, setFilterReview] = useState("");
  const [draft, setDraft] = useState<QuestionDraft>(emptyDraft);
  const [editingId, setEditingId] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [reviewTopic, setReviewTopic] = useState(topics[0]?.id || "");
  const [reviewStatus, setReviewStatus] = useState(topicReviewStatuses[0]);
  const [reviewNote, setReviewNote] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<AppRole>("murid");
  const [password, setPassword] = useState("");
  const [targetUsername, setTargetUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [links, setLinks] = useState<GuardianLink[]>([]);
  const [holder, setHolder] = useState("");
  const [student, setStudent] = useState("");
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [importResult, setImportResult] = useState("");

  const isOwner = user?.peran === "pemilik_admin";
  const canReview = user?.peran === "guru" || isOwner;
  const canEdit = canReview;
  const adultCanCreate = user?.peran === "orang_tua" || user?.peran === "guru" || isOwner;
  const displayedTabs = useMemo(() => {
    const list: { id: WorkTab; label: string; icon: typeof ClipboardList }[] = [
      { id: "questions", label: "Bank soal", icon: ClipboardList },
      { id: "marked", label: "Soal yang ditandai", icon: Heart },
    ];
    if (canReview) list.push({ id: "review", label: "Tinjauan guru", icon: Check });
    list.push({ id: "accounts", label: isOwner ? "Akun & password" : "Reset password", icon: Users });
    if (isOwner) list.push({ id: "links", label: "Wali–murid", icon: Link2 }, { id: "audit", label: "Jejak audit", icon: ShieldCheck });
    return list;
  }, [canReview, isOwner]);

  async function run<T extends { ok: true }>(action: string, data: Record<string, unknown> = {}): Promise<T> {
    const token = readSessionToken();
    if (!token) throw new ApiError("UNAUTHORIZED", "Sesi berakhir. Silakan masuk kembali.");
    return gasAction<T>(action, { token, ...data });
  }

  async function loadQuestions() {
    const result = await run<{ ok: true; questions: AdminQuestion[] }>("admin.questions.list", {
      ...(filterSubject ? { subjectId: filterSubject } : {}),
      ...(filterTopic ? { topicId: filterTopic } : {}),
      ...(filterReview ? { reviewStatus: filterReview } : {}),
    });
    setQuestionsList(result.questions);
  }

  async function loadMarked() {
    const [marks, questions] = await Promise.all([
      run<{ ok: true; tandai: FlagGroup[] }>("tandai.list", filterTopic ? { topicId: filterTopic } : {}),
      run<{ ok: true; questions: AdminQuestion[] }>("admin.questions.list"),
    ]);
    setFlagged(marks.tandai);
    setQuestionsList(questions.questions);
  }

  async function loadAccounts() {
    const result = await run<{ ok: true; accounts: Account[] }>("admin.accounts.list");
    setAccounts(result.accounts);
  }
  async function loadLinks() {
    const result = await run<{ ok: true; wali: GuardianLink[] }>("admin.wali.list");
    setLinks(result.wali);
  }
  async function loadAudit() {
    const result = await run<{ ok: true; audit: AuditRow[] }>("admin.audit.list", { limit: 100 });
    setAudit(result.audit);
  }

  async function refresh() {
    setBusy(true); setError(""); setMessage("");
    try {
      if (tab === "questions") await loadQuestions();
      if (tab === "marked") await loadMarked();
      if (tab === "accounts" && isOwner) await loadAccounts();
      if (tab === "links" && isOwner) await loadLinks();
      if (tab === "audit" && isOwner) await loadAudit();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Data belum bisa dimuat.");
    } finally { setBusy(false); }
  }

  useEffect(() => {
    if (user) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tab, filterSubject, filterReview, filterTopic]);

  function beginCreate() {
    setEditingId("");
    setDraft({ ...emptyDraft, topicId: topics.find((item) => item.subjectId === emptyDraft.subjectId)?.id || "" });
    setEditorOpen(true); setMessage(""); setError("");
  }

  function beginEdit(question: AdminQuestion) {
    setEditingId(question.id);
    const keyValue = question[correctChoiceField];
    setDraft({
      id: question.id, subjectId: question.subjectId, topicId: question.topicId, stem: question.stem,
      choices: question.choices.join("\n"), correctChoice: typeof keyValue === "number" ? String(keyValue) : "0",
      explanation: question.explanation, sourceIds: question.sourceIds.join(", "), sourceLocator: question.sourceLocator,
      cp_ref: question.cp_ref, atp_goal_id: question.atp_goal_id, difficulty: question.difficulty || "belum dinilai",
      reviewStatus: question.reviewStatus, learnerAvailability: question.learnerAvailability,
    });
    setEditorOpen(true); setMessage(""); setError("");
  }

  async function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const data: Record<string, unknown> = {
      id: draft.id.trim(), subjectId: draft.subjectId, topicId: draft.topicId, type: "multiple-choice",
      stem: draft.stem.trim(), choices: draft.choices.split("\n").map((item) => item.trim()).filter(Boolean),
      explanation: draft.explanation.trim(), sourceIds: draft.sourceIds.split(",").map((item) => item.trim()).filter(Boolean),
      sourceLocator: draft.sourceLocator.trim(), cp_ref: draft.cp_ref.trim(), atp_goal_id: draft.atp_goal_id.trim(),
      difficulty: draft.difficulty, reviewStatus: draft.reviewStatus, learnerAvailability: draft.learnerAvailability,
    };
    if (!canReview) data.reviewStatus = "needs_teacher_review";
    data[correctChoiceField] = Number(draft.correctChoice);
    try {
      const action = editingId ? "admin.questions.update" : "admin.questions.create";
      await run(action, { question: data });
      setMessage(editingId ? "Perubahan soal tersimpan." : "Soal baru tersimpan di server.");
      setEditorOpen(false);
      await loadQuestions();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Soal belum tersimpan."); }
    finally { setBusy(false); }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setError(""); setMessage(""); setImportResult("");
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const list = Array.isArray(parsed) ? parsed : (parsed as { questions?: unknown[] })?.questions;
      if (!Array.isArray(list)) throw new Error("Pilih berkas JSON berupa daftar soal atau objek dengan daftar questions.");
      const safeList = canReview ? list : list.map((item) => item && typeof item === "object" && !Array.isArray(item) ? { ...(item as Record<string, unknown>), reviewStatus: "needs_teacher_review" } : item);
      const result = await run<{ ok: true; accepted: number; rejected: number; errors: { index: number; reason: string }[] }>("admin.import", { questions: safeList });
      setImportResult(`${result.accepted} diterima, ${result.rejected} perlu diperbaiki.`);
      if (result.errors.length) setError(result.errors.slice(0, 3).map((item) => `Baris ${item.index + 1}: ${item.reason}`).join(" · "));
      await loadQuestions();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Impor belum berhasil."); }
    finally { setBusy(false); event.target.value = ""; }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await run("admin.review", { topicId: reviewTopic, status: reviewStatus, catatan: reviewNote });
      setMessage("Status tinjauan topik tersimpan.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Tinjauan belum tersimpan."); }
    finally { setBusy(false); }
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await run("admin.accounts.create", { username, peran: role, password });
      setMessage(`Akun ${username} berhasil dibuat.`); setUsername(""); setPassword(""); await loadAccounts();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Akun belum dibuat."); }
    finally { setBusy(false); }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await run("auth.resetPassword", { username: targetUsername, password: newPassword });
      setMessage("Kata sandi baru berhasil disimpan."); setTargetUsername(""); setNewPassword("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Kata sandi belum diubah."); }
    finally { setBusy(false); }
  }

  async function linkStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      await run("admin.wali.link", { pemegang: holder, murid: student });
      setMessage("Pemetaan wali–murid tersimpan."); setHolder(""); setStudent(""); await loadLinks();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Pemetaan belum tersimpan."); }
    finally { setBusy(false); }
  }

  async function unlinkStudent(item: GuardianLink) {
    setBusy(true); setError(""); setMessage("");
    try { await run("admin.wali.unlink", { pemegang: item.pemegang, murid: item.murid }); setMessage("Pemetaan dihapus."); await loadLinks(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Pemetaan belum dihapus."); }
    finally { setBusy(false); }
  }

  function dismissGroup(questionId: string) {
    setHiddenGroups((current) => new Set(current).add(questionId));
    if (selectedFlag?.questionId === questionId) setSelectedFlag(null);
  }

  const visibleMarks = flagged.filter((group) => !hiddenGroups.has(group.questionId));
  const questionById = new Map(questionsList.map((question) => [question.id, question]));
  const selectedQuestion = selectedFlag ? questionById.get(selectedFlag.questionId) : undefined;
  const activeTopics = topics.filter((topic) => !filterSubject || topic.subjectId === filterSubject);

  return <>
    <div className="admin-intro"><p>Kelola soal dan tinjauan belajar, serta lihat soal yang ditandai murid. Semua perubahan penting tetap diproses oleh server.</p><div className="role-info"><ShieldCheck size={17} /> Masuk sebagai <strong>{user?.peran === "pemilik_admin" ? "Pemilik/admin" : user?.peran === "orang_tua" ? "Orang tua" : "Guru"}</strong></div></div>
    <div className="admin-tabs" role="tablist" aria-label="Bagian workbench dewasa">
      {displayedTabs.map((item) => { const Icon = item.icon; return <button role="tab" aria-selected={tab === item.id} className={tab === item.id ? "admin-tab active" : "admin-tab"} onClick={() => { setTab(item.id); setMessage(""); setError(""); }} key={item.id}><Icon size={18} />{item.label}</button>; })}
    </div>
    {error && <div className="notice" role="alert">{error}</div>}
    {message && <div className="success-notice" role="status"><Check size={18} />{message}</div>}
    {busy && <div className="loading-strip"><span className="mini-spinner" /> Memproses…</div>}

    {tab === "questions" && <section className="admin-panel">
      <div className="panel-heading"><div><p className="eyebrow">BANK SOAL KELAS 4</p><h2>Soal latihan</h2><p>Soal dan kunci disimpan serta dinilai melalui backend. Murid tidak melihat kunci sebelum mengirim jawaban.</p></div>{adultCanCreate && <button className="button primary" onClick={beginCreate}><Plus size={18} /> Buat soal</button>}</div>
      <div className="filters-row"><label><span>Mapel</span><select value={filterSubject} onChange={(event) => { setFilterSubject(event.target.value); setFilterTopic(""); }}><option value="">Semua mapel</option>{subjects.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label><span>Topik</span><select value={filterTopic} onChange={(event) => setFilterTopic(event.target.value)}><option value="">Semua topik</option>{activeTopics.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label><label><span>Tinjauan soal</span><select value={filterReview} onChange={(event) => setFilterReview(event.target.value)}><option value="">Semua status</option>{reviewStatuses.map((value) => <option key={value} value={value}>{reviewLabel(value)}</option>)}</select></label><button className="button secondary" onClick={() => void refresh()}><Search size={17} /> Terapkan</button></div>
      {adultCanCreate && <label className="button secondary import-button"><ArrowDownToLine size={17} /> Impor JSON<input type="file" accept="application/json,.json" onChange={importFile} /></label>}
      {importResult && <p className="import-result">Hasil impor: {importResult}</p>}
      <div className="question-table">{questionsList.map((question) => <article className="admin-question-row" key={question.id}><div className="question-meta"><span className="status-pill">{reviewLabel(question.reviewStatus)}</span><span>{topics.find((topic) => topic.id === question.topicId)?.title || question.topicId}</span></div><h3>{question.stem}</h3><div className="question-options-preview">{question.choices.map((choice, index) => <span key={index}>{String.fromCharCode(65 + index)}. {choice}</span>)}</div><div className="question-row-actions"><span className="version-tag">v{question.version}</span>{canEdit && <button className="button tiny secondary" onClick={() => beginEdit(question)}><Pencil size={15} /> Tinjau / edit</button>}</div></article>)}{!busy && questionsList.length === 0 && <p className="empty-state">Belum ada soal yang cocok dengan filter.</p>}</div>
      {adultCanCreate && <p className="panel-footnote">Untuk impor, siapkan JSON yang sesuai skema soal. Data dikirim langsung ke backend untuk divalidasi.</p>}
    </section>}

    {tab === "marked" && <section className="admin-panel">
      <div className="panel-heading"><div><p className="eyebrow">BAHAN DISKUSI KELAS</p><h2>Soal yang ditandai</h2><p>Urut dari yang paling banyak ditandai. Menyembunyikan grup hanya berlaku di layar ini dan tidak menghapus tanda murid.</p></div></div>
      <div className="filters-row"><label className="wide-filter"><span>Filter topik</span><select value={filterTopic} onChange={(event) => setFilterTopic(event.target.value)}><option value="">Semua topik</option>{topics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><button className="button secondary" onClick={() => void refresh()}><ListFilter size={17} /> Muat ulang</button></div>
      <div className="marked-layout"><div className="marked-list">{visibleMarks.map((group) => { const question = questionById.get(group.questionId); return <button className={`marked-card ${selectedFlag?.questionId === group.questionId ? "selected" : ""}`} key={group.questionId} onClick={() => setSelectedFlag(group)}><span className="marked-count">{group.jumlah}<small>{group.jumlah === 1 ? "murid" : "murid"}</small></span><span className="marked-card-copy"><small>{topics.find((topic) => topic.id === group.topicId)?.title || group.topicId}</small><strong>{question?.stem || `Soal ${group.questionId}`}</strong><span className="student-chips">{group.murid.map((name) => <i key={name}>{name}</i>)}</span></span><ArrowUpRight size={18} /></button>; })}{!busy && visibleMarks.length === 0 && <div className="empty-state"><Heart size={22} />Belum ada soal yang ditandai pada filter ini.</div>}</div>
        <aside className="marked-detail">{selectedFlag ? <><div className="detail-header"><span className="eyebrow">DETAIL SOAL</span><button className="icon-button" aria-label="Tutup detail" onClick={() => setSelectedFlag(null)}><X size={18} /></button></div><p className="detail-topic">{topics.find((topic) => topic.id === selectedFlag.topicId)?.title || selectedFlag.topicId}</p><h3>{selectedQuestion?.stem || `Soal ${selectedFlag.questionId}`}</h3>{selectedQuestion && <div className="detail-choices">{selectedQuestion.choices.map((choice, index) => <p key={index}><b>{String.fromCharCode(65 + index)}.</b> {choice}</p>)}</div>}<div className="student-chips large">{selectedFlag.murid.map((name) => <i key={name}>{name}</i>)}</div><p className="marked-total">Ditandai oleh {selectedFlag.jumlah} akun murid.</p><button className="button primary full" onClick={() => dismissGroup(selectedFlag.questionId)}><Check size={17} /> Sudah dibahas di kelas</button><small className="local-only-note">Tindakan ini hanya menyembunyikan grup untuk sesi layar ini.</small></> : <div className="detail-empty"><div className="detail-bubble"><Search size={21} /></div><strong>Pilih satu kartu soal</strong><span>Detailnya akan tampil di sini.</span></div>}</aside></div>
    </section>}

    {tab === "review" && canReview && <section className="admin-panel compact-panel"><p className="eyebrow">TINJAUAN GURU · PER TOPIK</p><h2>Catat tinjauan materi</h2><p>Periksa isi soal dan rujukannya. Status tinjauan tidak menghalangi murid untuk berlatih.</p><form className="stack-form" onSubmit={submitReview}><label htmlFor="review-topic">Topik</label><select id="review-topic" value={reviewTopic} onChange={(event) => setReviewTopic(event.target.value)}>{topics.map((item) => <option value={item.id} key={item.id}>{item.title} — {item.chapter}</option>)}</select><label htmlFor="review-status">Status tinjauan</label><select id="review-status" value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)}>{topicReviewStatuses.map((value) => <option key={value}>{value}</option>)}</select><label htmlFor="review-note">Catatan (opsional)</label><textarea id="review-note" rows={3} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Catatan singkat untuk tim belajar" /><button className="button primary" disabled={busy}>Simpan tinjauan <Check size={17} /></button></form></section>}

    {tab === "accounts" && <section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">AKUN PILOT</p><h2>{isOwner ? "Kelola akun" : "Reset kata sandi murid"}</h2><p>{isOwner ? "Akun dibuat oleh pemilik/admin; anak tidak dapat mendaftar sendiri." : "Masukkan username murid yang terhubung dengan akunmu."}</p></div></div><div className="account-tools">
      <form className="tool-card stack-form" onSubmit={resetPassword}><h3><LockKeyhole size={19} /> Reset kata sandi</h3><label htmlFor="target-user">Username murid</label><input id="target-user" value={targetUsername} onChange={(event) => setTargetUsername(event.target.value)} required autoComplete="off" /><label htmlFor="new-pass">Kata sandi baru</label><input id="new-pass" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={6} maxLength={8} autoComplete="new-password" /><small>Murid memakai 6 karakter; akun dewasa memakai 8. Server memeriksa izin dan panjangnya.</small><button className="button secondary" disabled={busy}>Simpan kata sandi</button></form>
      {isOwner && <form className="tool-card stack-form" onSubmit={createAccount}><h3><Users size={19} /> Buat akun</h3><label htmlFor="new-user">Username</label><input id="new-user" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={32} autoComplete="off" /><label htmlFor="new-role">Peran</label><select id="new-role" value={role} onChange={(event) => setRole(event.target.value as AppRole)}><option value="murid">Murid</option><option value="orang_tua">Orang tua</option><option value="guru">Guru</option><option value="pemilik_admin">Pemilik/admin</option></select><label htmlFor="new-user-pass">Kata sandi awal</label><input id="new-user-pass" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={role === "murid" ? 6 : 8} maxLength={role === "murid" ? 6 : 8} autoComplete="new-password" /><button className="button primary" disabled={busy}>Buat akun <Plus size={17} /></button></form>}
      {isOwner && <div className="tool-card account-list"><h3><Users size={19} /> Akun yang tersedia</h3><button className="button tiny secondary" onClick={() => void refresh()}>Muat ulang</button>{accounts.map((item) => <div className="account-row" key={item.username}><span><strong>{item.username}</strong><small>{roleLabel(item.peran)}</small></span>{item.terkunci_sampai && <span className="status-pill">Terkunci sementara</span>}</div>)}</div>}
    </div></section>}

    {tab === "links" && isOwner && <section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">AKSES PROGRES & TANDA</p><h2>Pemetaan wali–murid</h2><p>Setiap murid dipetakan ke satu pemegang akun, sesuai aturan server.</p></div></div><div className="account-tools"><form className="tool-card stack-form" onSubmit={linkStudent}><h3><Link2 size={19} /> Hubungkan akun</h3><label htmlFor="holder">Username orang tua atau guru</label><input id="holder" value={holder} onChange={(event) => setHolder(event.target.value)} required /><label htmlFor="student">Username murid</label><input id="student" value={student} onChange={(event) => setStudent(event.target.value)} required /><button className="button primary" disabled={busy}>Simpan pemetaan <Link2 size={17} /></button></form><div className="tool-card account-list"><h3><Link2 size={19} /> Pemetaan aktif</h3>{links.map((item) => <div className="account-row" key={`${item.pemegang}-${item.murid}`}><span><strong>{item.pemegang} → {item.murid}</strong><small>{roleLabel(item.peran_pemegang)}</small></span><button className="icon-button danger" aria-label={`Lepas ${item.murid}`} onClick={() => void unlinkStudent(item)}><Trash2 size={17} /></button></div>)}{!busy && links.length === 0 && <p className="empty-state">Belum ada pemetaan aktif.</p>}</div></div></section>}

    {tab === "audit" && isOwner && <section className="admin-panel"><div className="panel-heading"><div><p className="eyebrow">RIWAYAT PERUBAHAN</p><h2>Jejak audit</h2><p>Daftar kegiatan yang dicatat backend. Password dan kunci tidak ditampilkan.</p></div><button className="button secondary" onClick={() => void refresh()}>Muat ulang</button></div><div className="audit-list">{audit.map((item, index) => <article className="audit-row" key={`${item.waktu}-${index}`}><span>{formatDate(item.waktu)}</span><strong>{item.aksi}</strong><span>{item.pelaku}</span><p>{item.rincian}</p></article>)}{!busy && audit.length === 0 && <p className="empty-state">Belum ada catatan audit yang dapat ditampilkan.</p>}</div></section>}

    {editorOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditorOpen(false); }}><section className="question-editor" role="dialog" aria-modal="true" aria-labelledby="editor-title"><div className="editor-head"><div><p className="eyebrow">{editingId ? "EDIT SOAL" : "SOAL BARU"}</p><h2 id="editor-title">{editingId ? "Periksa dan perbarui soal" : "Buat soal latihan"}</h2></div><button className="icon-button" aria-label="Tutup" onClick={() => setEditorOpen(false)}><X size={19} /></button></div><form className="editor-form" onSubmit={saveQuestion}><div className="editor-grid"><label>ID soal<input value={draft.id} onChange={(event) => setDraft({ ...draft, id: event.target.value })} required disabled={!!editingId} /></label><label>Mata pelajaran<select value={draft.subjectId} onChange={(event) => { const nextTopics = topics.filter((item) => item.subjectId === event.target.value); setDraft({ ...draft, subjectId: event.target.value, topicId: nextTopics[0]?.id || "" }); }}>{subjects.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="full-field">Topik<select value={draft.topicId} onChange={(event) => setDraft({ ...draft, topicId: event.target.value })}>{topics.filter((item) => item.subjectId === draft.subjectId).map((item) => <option value={item.id} key={item.id}>{item.title} — {item.chapter}</option>)}</select></label><label className="full-field">Pertanyaan<textarea rows={3} value={draft.stem} onChange={(event) => setDraft({ ...draft, stem: event.target.value })} required minLength={5} /></label><label className="full-field">Empat pilihan jawaban (satu pilihan per baris)<textarea rows={4} value={draft.choices} onChange={(event) => setDraft({ ...draft, choices: event.target.value })} required placeholder="Pilihan A\nPilihan B\nPilihan C\nPilihan D" /></label><label>Pilihan yang benar<select value={draft.correctChoice} onChange={(event) => setDraft({ ...draft, correctChoice: event.target.value })}>{[0,1,2,3].map((number) => <option key={number} value={number}>{String.fromCharCode(65 + number)}</option>)}</select></label><label>Kesulitan<input value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value })} /></label><label className="full-field">Penjelasan<textarea rows={3} value={draft.explanation} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} required minLength={3} /></label><label>ID sumber (pisahkan koma)<input value={draft.sourceIds} onChange={(event) => setDraft({ ...draft, sourceIds: event.target.value })} required /></label><label>Lokasi sumber<input value={draft.sourceLocator} onChange={(event) => setDraft({ ...draft, sourceLocator: event.target.value })} required /></label><label>Rujukan CP<input value={draft.cp_ref} onChange={(event) => setDraft({ ...draft, cp_ref: event.target.value })} required /></label><label>ID tujuan ATP<input value={draft.atp_goal_id} onChange={(event) => setDraft({ ...draft, atp_goal_id: event.target.value })} required /></label><label>Status tinjauan soal<select value={draft.reviewStatus} onChange={(event) => setDraft({ ...draft, reviewStatus: event.target.value })}>{(canReview ? reviewStatuses : ["needs_teacher_review"]).map((value) => <option key={value} value={value}>{reviewLabel(value)}</option>)}</select></label><label>Ketersediaan latihan<select value={draft.learnerAvailability} onChange={(event) => setDraft({ ...draft, learnerAvailability: event.target.value })}><option value="available">Tersedia</option><option value="hidden">Disembunyikan</option></select></label></div><div className="editor-actions"><button type="button" className="button secondary" onClick={() => setEditorOpen(false)}>Batal</button><button type="submit" className="button primary" disabled={busy}>{busy ? "Menyimpan…" : "Simpan soal"} <Check size={17} /></button></div></form></section></div>}
  </>;
}

function reviewLabel(value: string) { return value === "needs_teacher_review" ? "Perlu tinjauan" : value === "approved" ? "Disetujui" : value === "rejected" ? "Ditolak" : value; }
function roleLabel(value: string) { return value === "pemilik_admin" ? "Pemilik/admin" : value === "orang_tua" ? "Orang tua" : value === "guru" ? "Guru" : "Murid"; }
function formatDate(value: string) { if (!value) return ""; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date); }
