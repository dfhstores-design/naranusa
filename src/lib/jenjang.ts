export const JENJANG_LIST = [1, 2, 3, 4, 5, 6] as const;

export const JENJANG_TERSEDIA: number[] = [4];

export type Jenjang = 1 | 2 | 3 | 4 | 5 | 6;

const DEFAULT_JENJANG = 4;

function jenjangKey(username: string): string {
  return `naranusa-jenjang-${username}`;
}

function dilihatKey(username: string): string {
  return `naranusa-jenjang-dilihat-${username}`;
}

export function readJenjang(username: string | null | undefined): number {
  if (!username) return DEFAULT_JENJANG;
  try {
    const raw = window.localStorage.getItem(jenjangKey(username));
    if (!raw) return DEFAULT_JENJANG;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 1 || value > 6) return DEFAULT_JENJANG;
    if (!JENJANG_TERSEDIA.includes(value)) return DEFAULT_JENJANG;
    return value;
  } catch {
    return DEFAULT_JENJANG;
  }
}

export function saveJenjang(username: string | null | undefined, jenjang: number): void {
  if (!username) return;
  try {
    window.localStorage.setItem(jenjangKey(username), String(jenjang));
  } catch {
    /* mode privat bisa melempar */
  }
}

export function jenjangLabel(n: number): string {
  return `Kelas ${n}`;
}

function readDilihat(username: string): number[] | null {
  try {
    const raw = window.localStorage.getItem(dilihatKey(username));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((item): item is number => typeof item === "number");
  } catch {
    return null;
  }
}

function writeDilihat(username: string, list: number[]): void {
  try {
    window.localStorage.setItem(dilihatKey(username), JSON.stringify(list));
  } catch {
    /* mode privat bisa melempar */
  }
}

export function readJenjangBaru(username: string | null | undefined): number | null {
  if (!username) return null;
  const dilihat = readDilihat(username);
  if (dilihat === null) {
    writeDilihat(username, [...JENJANG_TERSEDIA]);
    return null;
  }
  const kandidat = [...JENJANG_TERSEDIA].sort((a, b) => a - b).find((n) => !dilihat.includes(n));
  return kandidat ?? null;
}

export function tandaiJenjangDilihat(username: string | null | undefined, jenjang: number): void {
  if (!username) return;
  const dilihat = readDilihat(username) ?? [];
  if (dilihat.includes(jenjang)) return;
  writeDilihat(username, [...dilihat, jenjang]);
}
