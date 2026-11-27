import { gasAction, PublicSubject, PublicTopic } from "@/lib/api";

type SubjectsResponse = { ok: true; subjects: PublicSubject[] };
type TopicsResponse = { ok: true; topics: PublicTopic[] };

const SUBJECTS_KEY = "naranusa-katalog-mapel";

function topicsKey(subjectId: string): string {
  return `naranusa-katalog-topik-${subjectId}`;
}

function readArray<T>(key: string): T[] | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

function writeArray<T>(key: string, value: T[]): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* mode privat bisa melempar */
  }
}

export async function getSubjectsCached(token: string): Promise<PublicSubject[]> {
  const cached = readArray<PublicSubject>(SUBJECTS_KEY);
  if (cached) return cached;
  const response = await gasAction<SubjectsResponse>("subjects.list", { token });
  writeArray(SUBJECTS_KEY, response.subjects);
  return response.subjects;
}

export async function getTopicsCached(token: string, subjectId: string): Promise<PublicTopic[]> {
  const key = topicsKey(subjectId);
  const cached = readArray<PublicTopic>(key);
  if (cached) return cached;
  const response = await gasAction<TopicsResponse>("topics.list", { token, subjectId });
  writeArray(key, response.topics);
  return response.topics;
}
