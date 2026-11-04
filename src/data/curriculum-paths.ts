import { DifficultyLevel } from "@/types";

export interface PathLesson {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  estimatedTimeMin: number;
  blockCount: number;
  isCustom?: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  lessons: PathLesson[];
}

export const staticLearningPaths: LearningPath[] = [
  {
    id: "path-1",
    title: "Path 1: Real-World Social & Café English",
    description: "Master everyday conversations, ordering food, and making friends.",
    lessons: [
      {
        id: "cafe-basics",
        title: "Ordering at a Café",
        difficulty: "beginner",
        estimatedTimeMin: 15,
        blockCount: 12,
      },
      {
        id: "small-talk",
        title: "Friendly Small Talk",
        difficulty: "beginner",
        estimatedTimeMin: 10,
        blockCount: 8,
      }
    ]
  },
  {
    id: "path-2",
    title: "Path 2: Tech & Workplace Communication",
    description: "Professional vocabulary and clear communication for the office.",
    lessons: [
      {
        id: "daily-standup",
        title: "Daily Standup Updates",
        difficulty: "intermediate",
        estimatedTimeMin: 20,
        blockCount: 15,
      },
      {
        id: "polite-requests",
        title: "Making Polite Requests",
        difficulty: "intermediate",
        estimatedTimeMin: 15,
        blockCount: 10,
      }
    ]
  },
  {
    id: "path-3",
    title: "Path 3: Fluent Travel & Problem Solving",
    description: "Navigate airports, hotels, and unexpected situations with ease.",
    lessons: [
      {
        id: "airport-security",
        title: "Navigating Airport Security",
        difficulty: "advanced",
        estimatedTimeMin: 25,
        blockCount: 18,
      }
    ]
  }
];

// Helper to get all paths, including any custom ones from local storage
export function getLearningPaths(): LearningPath[] {
  if (typeof window === "undefined") {
    return staticLearningPaths;
  }

  const customLessonsData = localStorage.getItem('builder-saved-lessons');
  if (!customLessonsData) return staticLearningPaths;

  try {
    const customLessons: Record<string, {id: string, title?: string, blocks?: unknown[]}> = JSON.parse(customLessonsData);
    const customLessonsList: PathLesson[] = Object.values(customLessons).map(lesson => ({
        id: lesson.id,
        title: lesson.title || "Custom Lesson",
        difficulty: "intermediate" as DifficultyLevel, // default
        estimatedTimeMin: 10,
        blockCount: lesson.blocks?.length || 0,
        isCustom: true
    }));

    if (customLessonsList.length > 0) {
        return [
            ...staticLearningPaths,
            {
                id: "custom-path",
                title: "Custom Built Lessons",
                description: "Lessons you've created in the Lesson Builder Studio.",
                lessons: customLessonsList
            }
        ];
    }
  } catch (e) {
    console.error("Failed to parse custom lessons", e);
  }

  return staticLearningPaths;
}
