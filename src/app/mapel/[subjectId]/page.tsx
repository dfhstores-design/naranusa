import SubjectTopics from "@/components/subject-topics";
import { subjects } from "@/content/curriculum";

export function generateStaticParams() {
  return subjects.map((subject) => ({ subjectId: subject.id }));
}

export default async function SubjectPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;
  return <SubjectTopics subjectId={subjectId} />;
}
