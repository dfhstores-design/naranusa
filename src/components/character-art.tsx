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

/** Renders a source-controlled character illustration from /public/characters. */
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
  const asset =
    selected.type === "avatar"
      ? `${character}-avatar.svg`
      : `${character}-${selected.type}-${selected.name}.svg`;

  return (
    <Image
      src={`${BASE_PATH}/characters/${asset}`}
      alt={alt ?? `${labels[character]} — ${selected.type === "avatar" ? "avatar" : selected.name}`}
      width={size}
      height={size}
      className={className}
      unoptimized
      draggable={false}
    />
  );
}
