import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BlockRuntimeState, DifficultyLevel, RiveSignals, LessonBlock, InteractiveCheckpointBlock } from '@/types';
import { evaluateCheckpointAttempt } from '@/lib/adaptive-engine';
import { useGamificationStore } from '@/store/useGamificationStore';

export interface LearnerState {
  currentLessonId: string | null;
  blockStates: Record<string, BlockRuntimeState>;
  currentDifficulty: DifficultyLevel;
  masteryScore: number; // 0 to 1
  activeBlockId: string | null;
  riveSignals: RiveSignals;
  lessonBlocks: LessonBlock[];
  xp: number;
}

export interface LearnerActions {
  initializeLesson: (lessonId: string, blocks: LessonBlock[]) => void;
  completeContentBlock: (blockId: string) => void;
  triggerCheckpointVerification: (blockId: string) => void;
  submitCheckpointAnswer: (blockId: string, selectedOptionId: string) => void;
  requestSmartHint: (blockId: string) => void;
  resetLesson: () => void;
}

export type LearnerStore = LearnerState & LearnerActions;

const initialState: LearnerState = {
  currentLessonId: null,
  blockStates: {},
  currentDifficulty: 'beginner',
  masteryScore: 0,
  activeBlockId: null,
  riveSignals: {
    isCorrect: null,
    difficultyLevel: 1,
    triggerName: null,
    resetCounter: 0,
  },
  lessonBlocks: [],
  xp: 0,
};

const getNextDifficulty = (current: DifficultyLevel, transition: 'easier' | 'same' | 'harder'): DifficultyLevel => {
  const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
  const currentIndex = levels.indexOf(current);
  if (transition === 'harder') return levels[Math.min(currentIndex + 1, 2)];
  if (transition === 'easier') return levels[Math.max(currentIndex - 1, 0)];
  return current;
};

const getDifficultyNumber = (level: DifficultyLevel): number => {
    switch(level) {
        case 'beginner': return 1;
        case 'intermediate': return 2;
        case 'advanced': return 3;
    }
}

export const useLearnerStore = create<LearnerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeLesson: (lessonId, blocks) => {
        const blockStates: Record<string, BlockRuntimeState> = {};
        blocks.forEach((block, index) => {
          blockStates[block.blockId] = {
            blockId: block.blockId,
            state: index === 0 ? 'active' : 'locked',
            attempts: [],
            isHintActive: false,
          };
        });
        set({
          currentLessonId: lessonId,
          lessonBlocks: blocks,
          blockStates,
          activeBlockId: blocks[0]?.blockId || null,
          masteryScore: 0,
          currentDifficulty: 'beginner',
          xp: 0,
          riveSignals: { isCorrect: null, difficultyLevel: 1, triggerName: null, resetCounter: 0 },
        });
      },

      completeContentBlock: (blockId) => {
        const { blockStates, lessonBlocks } = get();
        const blockState = blockStates[blockId];

        if (!blockState || blockState.state === 'locked' || blockState.state === 'verification-required') {
            return;
        }

        const newBlockStates = { ...blockStates };
        newBlockStates[blockId] = { ...blockState, state: 'completed' };

        const blockIndex = lessonBlocks.findIndex(b => b.blockId === blockId);
        let nextActiveBlockId = get().activeBlockId;

        if (blockIndex !== -1 && blockIndex + 1 < lessonBlocks.length) {
            const nextBlockId = lessonBlocks[blockIndex + 1].blockId;
            newBlockStates[nextBlockId] = { ...newBlockStates[nextBlockId], state: 'active' };
            nextActiveBlockId = nextBlockId;
        }

        useGamificationStore.getState().addXP(5);
        set((state) => ({
            blockStates: newBlockStates,
            xp: state.xp + 5,
            activeBlockId: nextActiveBlockId
        }));
      },

      triggerCheckpointVerification: (blockId) => {
          const { blockStates, lessonBlocks } = get();
          const blockState = blockStates[blockId];

          if (!blockState || blockState.state === 'completed') return;

          const newBlockStates = { ...blockStates };
          const blockIndex = lessonBlocks.findIndex(b => b.blockId === blockId);

          if (blockIndex !== -1) {
              for (let i = 0; i < blockIndex; i++) {
                  const b = lessonBlocks[i];
                  if (b.type !== 'interactive_checkpoint' && newBlockStates[b.blockId].state !== 'completed') {
                      newBlockStates[b.blockId] = { ...newBlockStates[b.blockId], state: 'completed' };
                  }
              }
          }

          newBlockStates[blockId] = { ...blockState, state: 'verification-required' };

          set({
              blockStates: newBlockStates,
              activeBlockId: blockId
          });
      },

      submitCheckpointAnswer: (blockId, selectedOptionId) => {
        const { blockStates, lessonBlocks, currentDifficulty, masteryScore } = get();
        const block = lessonBlocks.find(b => b.blockId === blockId);
        const blockState = blockStates[blockId];

        if (!block || block.type !== 'interactive_checkpoint' || !blockState) return;

        if (blockState.state === 'locked' || blockState.state === 'completed') return;

        const attemptCount = blockState.attempts.length + 1;

        const gamificationStore = useGamificationStore.getState();
        const result = evaluateCheckpointAttempt(
            block as InteractiveCheckpointBlock,
            selectedOptionId,
            attemptCount,
            currentDifficulty
        );

        if (result.xpAwarded > 0) {
            gamificationStore.addXP(result.xpAwarded);
        }
        if (result.gemsAwarded && result.gemsAwarded > 0) {
            gamificationStore.addGems(result.gemsAwarded);
        }
        if (!result.isCorrect) {
            gamificationStore.deductHeart();
        }

        const newAttempts = [...blockState.attempts, {
            timestamp: Date.now(),
            selectedOptionId,
            isCorrect: result.isCorrect
        }];

        const newDifficulty = getNextDifficulty(currentDifficulty, result.nextDifficulty);
        const newMasteryScore = Math.min(1, masteryScore + result.masteryDelta);

        const newBlockStates = { ...blockStates };
        newBlockStates[blockId] = {
            ...blockState,
            state: result.nextState,
            attempts: newAttempts,
            isHintActive: result.provideSmartHint || blockState.isHintActive
        };

        let nextActiveBlockId = get().activeBlockId;

        // If completed, unlock next block
        if (result.nextState === 'completed') {
             const blockIndex = lessonBlocks.findIndex(b => b.blockId === blockId);
             if (blockIndex !== -1 && blockIndex + 1 < lessonBlocks.length) {
                const nextBlockId = lessonBlocks[blockIndex + 1].blockId;
                newBlockStates[nextBlockId] = { ...newBlockStates[nextBlockId], state: 'active' };
                nextActiveBlockId = nextBlockId;
            }
        }

        set((state) => ({
            blockStates: newBlockStates,
            xp: state.xp + result.xpAwarded,
            currentDifficulty: newDifficulty,
            masteryScore: newMasteryScore,
            activeBlockId: nextActiveBlockId,
            riveSignals: {
                isCorrect: result.isCorrect,
                difficultyLevel: getDifficultyNumber(newDifficulty),
                triggerName: result.triggerRemediationAnimation ? 'remediation' : (result.isCorrect ? 'success' : 'error'),
                resetCounter: state.riveSignals.resetCounter + 1
            }
        }));
      },

      requestSmartHint: (blockId) => {
          const { blockStates } = get();
          const blockState = blockStates[blockId];
          if (!blockState) return;

          set({
              blockStates: {
                  ...blockStates,
                  [blockId]: { ...blockState, isHintActive: true }
              }
          })
      },

      resetLesson: () => {
          set(initialState);
      }
    }),
    {
      name: 'learner-storage',
      skipHydration: true, // Will handle hydration manually for SSR
    }
  )
);
