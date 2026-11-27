"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, BookOpen, Calculator, Flame, Globe2, Heart, Languages, Monitor, MoonStar, Music, Star, Volleyball } from "lucide-react";
import AppShell, { useSessionUser, useUpdateSessionUser } from "@/components/app-shell";
import { CharacterImage, StudentCharacterName } from "@/components/character-art";
import { gasAction, ProgressRow } from "@/lib/api";
import { JenjangPicker } from "@/components/jenjang-picker";
import { jenjangLabel, readJenjang, saveJenjang } from "@/lib/jenjang";
import { starsFor, streakFrom } from "@/lib/progress-summary";
import { readSessionToken } from "@/lib/session";
import { subjects, topics } from "@/content/curriculum";
import "@/components/student-alignment.css";
import "@/components/mockup.css";

type ProgressResponse = { ok: true; progress: ProgressRow[] };
type CharacterResponse = { ok: true };

const characters: { id: StudentCharacterName; name: string }[] = [
  { id: "nara", name: "Nara" },
  { id: "nusa", name: "Nusa" },
  { id: "sari", name: "Sari" },
  { id: "bima", name: "Bima" },
  { id: "dita", name: "Dita" },
  { id: "rafi", name: "Rafi" },
  { id: "lina", name: "Lina" },
  { id: "wayan", name: "Wayan" },
];

export default function ProfilePage() {
  return <AppShell audience="student" title="Profilku"><ProfileContent /></AppShell>;
}

function ProfileContent() {
  const user = useSessionUser();
  const updateSessionUser = useUpdateSessionUser();
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [character, setCharacter] = useState<StudentCharacterName>(user?.karakter || "nara");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [jenjangSekarang, setJenjangSekarang] = useState(4);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (user?.username) setJenjangSekarang(readJenjang(user.username));
  }, [user?.username]);

  useEffect(() => {
    let active = true;
    const token = readSessionToken();
    if (!token) return;
    gasAction<ProgressResponse>("progress.get", { token }).then((result) => {
      if (active) setRows(result.progress);
    }).catch(() => undefined).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (user?.karakter) setCharacter(user.karakter);
  }, [user?.karakter]);

  const correct = rows.reduce((sum, row) => sum + row.benar, 0);
  const answered = rows.reduce((sum, row) => sum + row.percobaan, 0);
  const subjectStars = useMemo(() => {
    const totals = new Map<string, number>();
    for (const row of rows) {
      const subjectId = topics.find((topic) => topic.id === row.topicId)?.subjectId;
      if (subjectId) totals.set(subjectId, (totals.get(subjectId) || 0) + row.benar);
    }
    return subjects.map((subject) => ({
      ...subject,
      stars: starsFor(totals.get(subject.id) || 0),
    }));
  }, [rows]);

  async function chooseCharacter(next: StudentCharacterName) {
    if (next === character || saving) return;
    const previous = user?.karakter || character;
    const token = readSessionToken();
    if (!token) {
      setMessage("Sesi belajar tidak ditemukan. Masuk kembali, ya.");
      return;
    }
    setSaving(true);
    setMessage("");
    setCharacter(next);
    updateSessionUser?.({ karakter: next });
    try {
      await gasAction<CharacterResponse>("me.setKarakter", { token, karakter: next });
    } catch (reason) {
      setCharacter(previous);
      updateSessionUser?.({ karakter: previous });
      setMessage(reason instanceof Error ? reason.message : "Karakter belum tersimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const displayName = user?.nama_tampilan?.trim() || user?.username || "Murid";
  const characterName = characters.find((item) => item.id === character)?.name || "Nara";
  const starScale = Math.max(1, ...subjectStars.map((subject) => subject.stars));
  const subjectIcons: Record<string, typeof Calculator> = {
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

  return <div className="student-alignment student-profile">
    <section className="profile-card profile-hero" aria-label="Profil anak">
      <div className="profile-art-frame">
        <CharacterImage character={character} variant="full" size={188} className="profile-character-full" alt={`${characterName}, karakter terpilih`} />
      </div>
      <div className="profile-identity">
        <span className="profile-character-label">Karakter: {characterName}</span>
        <h2>{displayName}</h2>
        <span className="profile-username">{user?.username}</span>
        <div className="profile-stat-cards" aria-label="Statistik belajar">
          <div><Star size={18} fill="currentColor" /><strong>{busy ? "…" : starsFor(correct)}</strong><span>Bintang</span></div>
          <div><Flame size={18} /><strong>{busy ? "…" : streakFrom(rows)}</strong><span>Hari streak</span></div>
          <div><BadgeCheck size={18} /><strong>{busy ? "…" : answered}</strong><span>Soal selesai</span></div>
        </div>
      </div>
    </section>

    <section className="profile-section" aria-labelledby="choose-character-title">
      <div className="profile-section-heading"><h2 id="choose-character-title">Pilih Karaktermu</h2>{saving && <span role="status">Menyimpan…</span>}</div>
      <div className="character-grid" role="radiogroup" aria-label="Pilih karakter">
        {characters.map((item) => <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={character === item.id}
          aria-label={`Wajah ${item.name}`}
          disabled={saving}
          onClick={() => void chooseCharacter(item.id)}
          className={`character-option${character === item.id ? " selected" : ""}`}
        >
          <CharacterImage character={item.id} variant="face" size={70} className="character-face" alt="" />
          <span>{item.name}</span>
          {character === item.id && <span className="character-selected-mark" aria-hidden="true">✓</span>}
        </button>)}
      </div>
      {message && <p className="notice profile-message" role="alert">{message}</p>}
    </section>

    <section className="profile-section" aria-labelledby="profile-kelas-heading">
      <div className="profile-section-heading">
        <h2 id="profile-kelas-heading">Kelasku</h2>
        <span>Sekarang kamu di {jenjangLabel(jenjangSekarang)}.</span>
      </div>
      <button type="button" className="jenjang-pill" aria-expanded={pickerOpen} aria-label="Ganti kelas" onClick={() => setPickerOpen((v) => !v)}>{jenjangLabel(jenjangSekarang)} ▾</button>
      {pickerOpen && <JenjangPicker
        username={user?.username}
        value={jenjangSekarang}
        onChange={(n) => {
          saveJenjang(user?.username, n);
          setJenjangSekarang(n);
          setPickerOpen(false);
        }}
      />}
    </section>

    <section className="profile-section" aria-labelledby="subject-stars-title">
      <div className="profile-section-heading"><h2 id="subject-stars-title">Bintang per Mapel</h2><span>progres belajar</span></div>
      <div className="subject-star-list">
        {subjectStars.map((subject) => {
          const Icon = subjectIcons[subject.id] || BookOpen;
          const name = subject.shortName === "MTK" ? "Matematika" : subject.shortName === "B. Indo" ? "B. Indonesia" : subject.shortName === "P. Pancasila" ? "PP" : subject.shortName;
          return <div className="subject-star-row" key={subject.id} style={{ "--subject-color": subject.color } as React.CSSProperties}>
            <span className="subject-star-icon" aria-hidden="true"><Icon size={18} /></span>
            <span className="subject-star-detail"><strong>{name}</strong><span className="subject-star-track" aria-hidden="true"><i style={{ width: `${subject.stars / starScale * 100}%` }} /></span></span>
            <span className="subject-star-count"><Star size={15} fill="currentColor" />{busy ? "…" : subject.stars}</span>
          </div>;
        })}
      </div>
    </section>
  </div>;
}
