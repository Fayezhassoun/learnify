export type Topic = {
  id: string;
  title: string;
  description: string;
  accent: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  lessonCount: number;
};

export type Lesson = {
  id: string;
  topicId: string;
  title: string;
  hook: string;
  creator: string;
  duration: string;
  thumbnail: string;
  transcript: string;
  keyPoints: string[];
  quiz: string;
  nextStep: string;
  difficulty: Topic["level"];
};

