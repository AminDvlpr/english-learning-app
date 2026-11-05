import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CourseDocument, LessonSummaryStash, LeitnerFlashcard } from '@/types/course';
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
  leitnerCards: LeitnerFlashcard[];
  uncleApprovalMeter: number;
  sessionFlags: Record<string, boolean | string>;
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
  addLeitnerCard: (card: Omit<LeitnerFlashcard, 'id' | 'boxNumber' | 'nextReviewAt'>) => void;
  reviewLeitnerCard: (id: string, remembered: boolean) => void;
  updateUncleApproval: (delta: number) => void;
  setSessionFlag: (key: string, value: boolean | string) => void;
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
  leitnerCards: [
    {
      id: 'card-1',
      wordOrPhrase: 'Give me that pencil!',
      translationFa: 'اون مداد رو به من بده!',
      explanationFa: 'جمله امری با Give',
      boxNumber: 1,
      nextReviewAt: Date.now(),
      sourceLessonTitle: 'Childhood Rivalry & Mischief'
    },
    {
      id: 'card-2',
      wordOrPhrase: 'May I have a word?',
      translationFa: 'میشه یه صحبتی داشته باشیم؟',
      explanationFa: 'کاربرد May برای درخواست محترمانه',
      boxNumber: 2,
      nextReviewAt: Date.now() + 86400000,
      sourceLessonTitle: "Youth Love & Uncle's Approval"
    },
    {
      id: 'card-3',
      wordOrPhrase: 'I would like to sign the lease.',
      translationFa: 'من می خواهم قرارداد اجاره را امضا کنم.',
      explanationFa: 'استفاده از would like برای درخواست رسمی',
      boxNumber: 3,
      nextReviewAt: Date.now() + 86400000 * 3,
      sourceLessonTitle: 'Adulthood Migration & Survival'
    },
    {
      id: 'card-4',
      wordOrPhrase: 'Would you care for some fresh tea?',
      translationFa: 'میل دارید کمی چای تازه بنوشید؟',
      explanationFa: 'پیشنهاد مودبانه',
      boxNumber: 4,
      nextReviewAt: Date.now() + 86400000 * 7,
      sourceLessonTitle: 'The Tea Ceremony'
    }
  ],
  uncleApprovalMeter: 60,
  sessionFlags: {},
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

      addLeitnerCard: (card) => {
        const { leitnerCards } = get();
        if (leitnerCards.some(c => c.wordOrPhrase === card.wordOrPhrase)) return;

        const newCard: LeitnerFlashcard = {
          ...card,
          id: `card-${Date.now()}`,
          boxNumber: 1,
          nextReviewAt: Date.now()
        };

        const newCards = [...leitnerCards, newCard];
        set({ leitnerCards: newCards });
        if (typeof window !== 'undefined') {
          localStorage.setItem('english-app-leitner-cards', JSON.stringify(newCards));
        }
      },

      reviewLeitnerCard: (id, remembered) => {
        const { leitnerCards } = get();
        const cardIndex = leitnerCards.findIndex(c => c.id === id);
        if (cardIndex === -1) return;

        const card = leitnerCards[cardIndex];
        let newBox = card.boxNumber;

        if (remembered) {
          newBox = Math.min(5, newBox + 1) as 1 | 2 | 3 | 4 | 5;
        } else {
          newBox = 1;
        }

        const intervals = [1, 3, 7, 14, 30];
        const days = intervals[newBox - 1];

        const newCard: LeitnerFlashcard = {
          ...card,
          boxNumber: newBox,
          nextReviewAt: Date.now() + days * 24 * 60 * 60 * 1000
        };

        const newCards = [...leitnerCards];
        newCards[cardIndex] = newCard;
        set({ leitnerCards: newCards });
        if (typeof window !== 'undefined') {
          localStorage.setItem('english-app-leitner-cards', JSON.stringify(newCards));
        }
      },

      updateUncleApproval: (delta) => {
        const { uncleApprovalMeter } = get();
        set({ uncleApprovalMeter: Math.max(0, Math.min(100, uncleApprovalMeter + delta)) });
      },

      setSessionFlag: (key, value) => {
        const { sessionFlags } = get();
        set({ sessionFlags: { ...sessionFlags, [key]: value } });
      }
    }),
    {
      name: 'english-app-course-store',
      skipHydration: true,
      merge: (persistedState: unknown, currentState: CourseState & CourseActions) => {
        const merged = { ...currentState, ...(persistedState as Partial<CourseState & CourseActions>) };

        // Ensure we always use the latest INITIAL_COURSES for titles and slides,
        // but preserve user state like active statuses if possible, although the courses
        // are static data, we just replace the courses array with the latest INITIAL_COURSES
        merged.courses = currentState.courses;
        return merged;
      },
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          const localCards = localStorage.getItem('english-app-leitner-cards');
          if (localCards) {
            try {
              state.leitnerCards = JSON.parse(localCards);
            } catch (e) {
              console.error('Failed to parse leitner cards from local storage', e);
            }
          }
        }
      }
    }
  )
);
