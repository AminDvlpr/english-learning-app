import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GamificationState {
  xp: number;
  hearts: number;
  gems: number;
  streakDays: number;
  hasStreakFreeze: boolean;
  lastActiveDate: string | null;
  lastHeartLossTime: number | null;
  activeTimeTodaySec: number;
}

export interface GamificationActions {
  addXP: (amount: number) => void;
  deductHeart: () => void;
  restoreHeart: () => void;
  addGems: (amount: number) => void;
  updateActiveTime: (seconds: number) => void;
  completeLesson: () => void;
  checkHeartRegeneration: () => void;
  checkStreak: (forceIncrement?: boolean) => void;
  buyStreakFreeze: () => void;
}

const MAX_HEARTS = 5;
const HEART_REGEN_MS = 30 * 60 * 1000; // 30 minutes

const initialState: GamificationState = {
  xp: 0,
  hearts: MAX_HEARTS,
  gems: 0,
  streakDays: 0,
  hasStreakFreeze: false,
  lastActiveDate: null,
  lastHeartLossTime: null,
  activeTimeTodaySec: 0,
};

export const useGamificationStore = create<GamificationState & GamificationActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),

      addGems: (amount) => set((state) => ({ gems: state.gems + amount })),

      deductHeart: () => {
        const { hearts, lastHeartLossTime } = get();
        if (hearts > 0) {
          set({
            hearts: hearts - 1,
            lastHeartLossTime: lastHeartLossTime || Date.now(),
          });
        }
      },

      restoreHeart: () => {
        const { hearts } = get();
        if (hearts < MAX_HEARTS) {
          const newHearts = hearts + 1;
          set({
            hearts: newHearts,
            lastHeartLossTime: newHearts === MAX_HEARTS ? null : Date.now(),
          });
        }
      },

      checkHeartRegeneration: () => {
        const { hearts, lastHeartLossTime } = get();
        if (hearts < MAX_HEARTS && lastHeartLossTime) {
          const now = Date.now();
          const elapsed = now - lastHeartLossTime;
          const heartsToRestore = Math.floor(elapsed / HEART_REGEN_MS);

          if (heartsToRestore > 0) {
            const newHearts = Math.min(MAX_HEARTS, hearts + heartsToRestore);
            set({
              hearts: newHearts,
              lastHeartLossTime: newHearts === MAX_HEARTS ? null : now - (elapsed % HEART_REGEN_MS),
            });
          }
        }
      },

      updateActiveTime: (seconds) => {
        const todayDateStr = new Date().toISOString().split('T')[0];
        const { lastActiveDate, activeTimeTodaySec } = get();

        let newActiveTime = activeTimeTodaySec;
        if (lastActiveDate !== todayDateStr) {
          newActiveTime = seconds;
        } else {
          newActiveTime += seconds;
        }

        set({
          activeTimeTodaySec: newActiveTime,
          lastActiveDate: todayDateStr
        });
        get().checkStreak();
      },

      completeLesson: () => {
          const todayDateStr = new Date().toISOString().split('T')[0];
          set({ lastActiveDate: todayDateStr });
          get().checkStreak(true);
      },

      checkStreak: (forceIncrement = false) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const { lastActiveDate, activeTimeTodaySec, streakDays, hasStreakFreeze } = get();

        // Already active today
        if (lastActiveDate === todayStr && (forceIncrement || activeTimeTodaySec >= 600)) {
           // Streak is safe
           return;
        }

        if (lastActiveDate === yesterdayStr) {
           if (forceIncrement || activeTimeTodaySec >= 600) {
               set({ streakDays: streakDays + 1, lastActiveDate: todayStr});
           }
        } else if (lastActiveDate !== todayStr && lastActiveDate !== yesterdayStr && lastActiveDate !== null) {
            // Missed a day
            if (hasStreakFreeze) {
                set({ hasStreakFreeze: false, lastActiveDate: yesterdayStr });
                // We keep the streak. Then immediately check again.
                if (forceIncrement || activeTimeTodaySec >= 600) {
                    set({ streakDays: streakDays + 1, lastActiveDate: todayStr});
                }
            } else {
                if (forceIncrement || activeTimeTodaySec >= 600) {
                    set({ streakDays: 1, lastActiveDate: todayStr});
                } else {
                    set({ streakDays: 0 }); // Lost streak
                }
            }
        } else if (lastActiveDate === null) {
            if (forceIncrement || activeTimeTodaySec >= 600) {
                set({ streakDays: 1, lastActiveDate: todayStr});
            }
        }
      },

      buyStreakFreeze: () => {
         const { gems, hasStreakFreeze } = get();
         if (!hasStreakFreeze && gems >= 50) {
             set({ gems: gems - 50, hasStreakFreeze: true });
         }
      }

    }),
    {
      name: 'gamification-storage',
      skipHydration: true,
    }
  )
);
