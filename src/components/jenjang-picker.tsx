"use client";

import { useState } from "react";
import { CharacterArt } from "@/components/character-art";
import { JENJANG_LIST, JENJANG_TERSEDIA, jenjangLabel } from "@/lib/jenjang";

type JenjangPickerProps = {
  username: string | null | undefined;
  value: number;
  onChange: (n: number) => void;
};

export function JenjangPicker({ value, onChange }: JenjangPickerProps) {
  const [note, setNote] = useState("");

  return <div className="jenjang-picker" role="group" aria-label="Pilih kelas">
    <div className="jenjang-option-list">
      {JENJANG_LIST.map((n) => {
        const tersedia = JENJANG_TERSEDIA.includes(n);
        const selected = tersedia && n === value;
        return <button
          key={n}
          type="button"
          className={`jenjang-option${selected ? " selected" : ""}${tersedia ? "" : " segera"}`}
          aria-pressed={selected}
          onClick={() => {
            if (!tersedia) {
              setNote(`Kelas ${n} masih disiapkan, tunggu ya! Nara lagi membuat soal untuk kelas ini. Balik lagi nanti, ya!`);
              return;
            }
            setNote("");
            onChange(n);
          }}
        >
          <span>{jenjangLabel(n)}</span>
          {!tersedia && <span className="jenjang-segera-badge">segera</span>}
        </button>;
      })}
    </div>
    {note && <p className="jenjang-note" role="status">{note}</p>}
  </div>;
}

type KartuJenjangBaruProps = {
  jenjang: number;
  onCoba: () => void;
  onNanti: () => void;
};

export function KartuJenjangBaru({ jenjang, onCoba, onNanti }: KartuJenjangBaruProps) {
  return <div className="kartu-jenjang-baru">
    <CharacterArt character="nara" variant={{ type: "expression", name: "celebrating" }} size={124} alt="Nara merayakan" />
    <div className="kartu-jenjang-baru-copy">
      <h3>{jenjangLabel(jenjang)} sudah ada! Mau coba?</h3>
      <div className="kartu-jenjang-baru-actions">
        <button type="button" className="button primary" onClick={onCoba}>Coba, yuk!</button>
        <button type="button" className="button secondary" onClick={onNanti}>Nanti dulu</button>
      </div>
    </div>
  </div>;
}
