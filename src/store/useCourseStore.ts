import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CourseDocument, LessonSummaryStash } from '@/types/course';
import { INITIAL_COURSES } from '@/data/courses';

export interface CourseState {
  courses: CourseDocument[];
  enrolledCourseIds: string[];
  activeCourseId: string;
  activeLessonId: string;
  completedSlideIds: Record<string, boolean>;
  masteredLessonIds: string[];
  savedStashes: (LessonSummaryStash & { savedAt: number; nextReviewAt: number; srsStage: number })[];
  hasSeenGestureGuide: boolean;
  userName: string | null;
  userLevel: number;
  activeBottomTab: 'explore' | 'uncle' | 'ranking' | 'challenge' | 'profile';
}

export interface CourseActions {
  syncCoursesFromApi: () => Promise<void>;
  saveCourseToSharedFolder: (course: CourseDocument) => Promise<void>;
  enrollInCourse: (courseId: string) => void;
  saveLessonStash: (stash: LessonSummaryStash) => void;
  completeStashReview: (lessonId: string, remembered: boolean) => void;
  dismissGestureGuide: () => void;
  loginWithName: (name: string) => void;
  logoutUser: () => void;
  setActiveBottomTab: (tab: 'explore' | 'uncle' | 'ranking' | 'challenge' | 'profile') => void;
}

const initialState: CourseState = {
  courses: INITIAL_COURSES,
  enrolledCourseIds: ['amin-sara-journey'],
  activeCourseId: 'amin-sara-journey',
  activeLessonId: 'lesson-1',
  completedSlideIds: {},
  masteredLessonIds: [],
  savedStashes: [],
  hasSeenGestureGuide: false,
  userName: null,
  userLevel: 1,
  activeBottomTab: 'explore',
};

export const useCourseStore = create<CourseState & CourseActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      syncCoursesFromApi: async () => {
        try {
          const response = await fetch('/api/courses');
          if (response.ok) {
            const data = await response.json();
            set({ courses: data.courses });
          }
        } catch (error) {
          console.error('Failed to sync courses:', error);
        }
      },

      saveCourseToSharedFolder: async (course: CourseDocument) => {
        try {
          const response = await fetch('/api/courses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(course),
          });
          if (response.ok) {
            // Update local state as well
            const { courses } = get();
            const existingIndex = courses.findIndex(c => c.id === course.id);
            if (existingIndex >= 0) {
              const newCourses = [...courses];
              newCourses[existingIndex] = course;
              set({ courses: newCourses });
            } else {
              set({ courses: [...courses, course] });
            }
          }
        } catch (error) {
          console.error('Failed to save course:', error);
        }
      },

      enrollInCourse: (courseId: string) => {
        const { enrolledCourseIds } = get();
        if (!enrolledCourseIds.includes(courseId)) {
          set({ enrolledCourseIds: [...enrolledCourseIds, courseId] });
        }
      },

      saveLessonStash: (stash: LessonSummaryStash) => {
        const { savedStashes } = get();
        const existingIndex = savedStashes.findIndex(s => s.lessonId === stash.lessonId);

        const newStash = {
          ...stash,
          savedAt: Date.now(),
          nextReviewAt: Date.now() + 24 * 60 * 60 * 1000, // 1 day later
          srsStage: 1,
        };

        if (existingIndex >= 0) {
          const newStashes = [...savedStashes];
          newStashes[existingIndex] = newStash;
          set({ savedStashes: newStashes });
        } else {
          set({ savedStashes: [...savedStashes, newStash] });
        }
      },

      completeStashReview: (lessonId: string, remembered: boolean) => {
        const { savedStashes } = get();
        const stashIndex = savedStashes.findIndex(s => s.lessonId === lessonId);

        if (stashIndex >= 0) {
          const stash = savedStashes[stashIndex];
          let newStage = stash.srsStage;

          if (remembered) {
            newStage += 1;
          } else {
            newStage = Math.max(1, newStage - 1);
          }

          // Simple SRS interval: 2^stage days
          const daysToNextReview = Math.pow(2, newStage);

          const updatedStash = {
            ...stash,
            srsStage: newStage,
            nextReviewAt: Date.now() + daysToNextReview * 24 * 60 * 60 * 1000,
          };

          const newStashes = [...savedStashes];
          newStashes[stashIndex] = updatedStash;
          set({ savedStashes: newStashes });
        }
      },

      dismissGestureGuide: () => set({ hasSeenGestureGuide: true }),

      loginWithName: (name: string) => set({ userName: name }),

      logoutUser: () => set({ userName: null }),

      setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),
    }),
    {
      name: 'english-app-course-store',
      skipHydration: true,
    }
  )
);
