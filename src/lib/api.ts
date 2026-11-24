import { clearSessionToken } from "@/lib/session";

export const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycby7vl0iYoN02nvmdmnr_B8ubWxXOF-mZpf4MSuGC22LtjKknr9j9XnoYFe4m-fqdA-n/exec";

export type ApiEnvelope = { ok: boolean; error?: { code: string; message: string } };
export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export type PublicSubject = {
  id: string; name: string; shortName: string; icon: string; color: string; tint: string;
  description: string; soalTersedia: number;
};
export type PublicTopic = {
  id: string; subjectId: string; title: string; chapter: string; objective: string; soalTersedia: number;
};
export type PublicQuestion = {
  id: string; subjectId: string; topicId: string; type: string; stem: string;
  choices: string[]; sourceIds: string[]; sourceLocator: string; cp_ref: string;
  atp_goal_id: string; difficulty: string; version: number;
};
export type ProgressRow = {
  username: string; topicId: string; percobaan: number; benar: number; terakhir_pada: string;
};
export type AnswerResult = {
  correct: boolean; explanation: string;
  progress: { topicId: string; percobaan: number; benar: number };
};

export async function gasAction<T extends ApiEnvelope>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(GAS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ action, ...payload }),
      cache: "no-store",
      redirect: "follow",
    });
  } catch {
    throw new ApiError("NETWORK", "Koneksi belum tersambung. Periksa internet, lalu coba lagi.");
  }

  let data: ApiEnvelope;
  try {
    data = (await response.json()) as ApiEnvelope;
  } catch {
    throw new ApiError("NETWORK", "Server belum memberi jawaban yang bisa dibaca. Coba lagi.");
  }
  if (!response.ok) throw new ApiError("HTTP_" + response.status, "Permintaan belum berhasil. Coba lagi.");
  if (!data.ok) {
    if (action !== "auth.login" && data.error?.code === "UNAUTHORIZED" && typeof window !== "undefined") {
      clearSessionToken();
      window.location.assign("/pwa-edukasi-kelas4/masuk/");
    }
    throw new ApiError(data.error?.code || "UNKNOWN", data.error?.message || "Permintaan belum berhasil. Coba lagi.");
  }
  return data as T;
}
