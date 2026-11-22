export type TutorGroundingTopic = {
  subjectId: string;
  chapter: string;
  title: string;
  objective: string;
};

export type TutorGroundingSource = {
  id: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  evidence: string;
};

export type TutorGroundingContext = {
  subject: string;
  chapter: string;
  topic: string;
  learningObjective: string;
  verifiedReferences: TutorGroundingSource[];
};

/** Build a fail-closed tutor context without relying on reviewed question examples. */
export function buildTutorGroundingContext(
  topic: TutorGroundingTopic,
  sources: TutorGroundingSource[],
): TutorGroundingContext | null {
  if (!topic.subjectId.trim() || !topic.chapter.trim() || !topic.title.trim() || !topic.objective.trim()) return null;

  const verifiedReferences = sources.filter((source) =>
    source.id.trim() &&
    source.title.trim() &&
    source.publisher.trim() &&
    source.year.trim() &&
    source.evidence.trim() &&
    source.url.trim().toLowerCase().startsWith("https://"),
  );
  if (verifiedReferences.length === 0) return null;

  return {
    subject: topic.subjectId,
    chapter: topic.chapter,
    topic: topic.title,
    learningObjective: topic.objective,
    verifiedReferences,
  };
}
