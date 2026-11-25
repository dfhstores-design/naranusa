import Image from "next/image";

const BASE_PATH = "/naranusa";

export type CharacterName = "nara" | "nusa";
export type NaraExpression =
  | "greeting"
  | "thinking"
  | "aha"
  | "celebrating"
  | "gentle-concern";
export type NusaExpression =
  | "thumbs-up"
  | "surprised"
  | "confused"
  | "laughing"
  | "ready";
export type CharacterExpression = NaraExpression | NusaExpression;

export type NaraPose =
  | "wave"
  | "holding-book"
  | "pointing"
  | "star-high-five";
export type NusaPose =
  | "thumbs-up"
  | "holding-pencil"
  | "looking-at-map"
  | "jogging-backpack";
export type CharacterPose = NaraPose | NusaPose;

type CharacterVariant<Character extends CharacterName> =
  | { type: "avatar" }
  | (Character extends "nara"
      ? { type: "expression"; name: NaraExpression }
      : { type: "expression"; name: NusaExpression })
  | (Character extends "nara"
      ? { type: "pose"; name: NaraPose }
      : { type: "pose"; name: NusaPose });

type CharacterArtProps<Character extends CharacterName> = {
  character: Character;
  variant?: CharacterVariant<Character>;
  size?: number;
  className?: string;
  alt?: string;
};

const labels: Record<CharacterName, string> = { nara: "Nara", nusa: "Nusa" };

/**
 * Renders a character illustration from /public/characters.
 *
 * Sejak 25 Nov 2026, art karakternya adalah POTONGAN LANGSUNG dari lembar
 * karakter yang dikirim Andri (IMG-20261124-WA0006.jpg) — bukan gambar baru:
 * - full-body: nara-full.png (380x533) / nusa-full.png (400x538), background
 *   dihapus (transparan) — dipakai untuk semua ekspresi & pose, karena lembar
 *   hanya punya satu pose tiap karakter.
 * - avatar: nara-face.png / nusa-face.png (260x260, potongan wajah dari lembar).
 * Ukuran width/height mengikuti rasio asli PNG supaya tidak gepeng: SVG dulu
 * letterbox sendiri, PNG tidak.
 */
export function CharacterArt<Character extends CharacterName>({
  character,
  variant,
  size = 240,
  className,
  alt,
}: CharacterArtProps<Character>) {
  const selected =
    variant ??
    ({
      type: "pose",
      name: character === "nara" ? "wave" : "thumbs-up",
    } as CharacterVariant<Character>);
  const isAvatar = selected.type === "avatar";
  const asset = isAvatar
    ? `${character}-face.png`
    : `${character}-full.png`;
  // Rasio asli file PNG (supaya <img> tidak gepeng di tempat tanpa CSS).
  const natural = isAvatar
    ? { w: 260, h: 260 }
    : character === "nara"
      ? { w: 380, h: 533 }
      : { w: 400, h: 538 };
  const width = size;
  const height = Math.round((size * natural.h) / natural.w);

  return (
    <Image
      src={`${BASE_PATH}/characters/${asset}`}
      alt={alt ?? `${labels[character]} — ${selected.type === "avatar" ? "avatar" : selected.name}`}
      width={width}
      height={height}
      className={className}
      unoptimized
      draggable={false}
    />
  );
}
