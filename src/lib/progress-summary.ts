import type { ProgressRow } from "@/lib/api";

/** Bintang: +10 per jawaban benar (sesuai "⭐ +10" di mockup 04). */
export function starsFor(correct: number) {
  return correct * 10;
}

/** Hari beruntun: tanggal latihan berurutan (WIB) sampai hari ini / kemarin. */
export function streakFrom(rows: ProgressRow[]): number {
  const days = new Set<string>();
  for (const row of rows) {
    const d = new Date(row.terakhir_pada);
    if (Number.isNaN(d.getTime())) continue;
    days.add(d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }));
  }
  if (days.size === 0) return 0;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const cursor = new Date(today + "T00:00:00+07:00");
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(cursor.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
