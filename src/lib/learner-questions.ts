export type LearnerQuestionRecord = {
  topicId: string;
  learnerAvailability: "available" | "hidden";
  reviewStatus: string;
};

export function getLearnerAvailableQuestions<T extends LearnerQuestionRecord>(records: T[]): T[] {
  return records.filter((record) => record.learnerAvailability === "available");
}

export function getLearnerQuestionsForTopic<T extends LearnerQuestionRecord>(records: T[], topicId: string): T[] {
  return getLearnerAvailableQuestions(records).filter((record) => record.topicId === topicId);
}
