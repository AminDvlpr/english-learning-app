import { useState, useEffect, useRef } from 'react';
import { useLearnerStore } from '@/store/useLearnerStore';
import { LessonBlock } from '@/types';

export function useInteractiveLesson(lessonBlocks: LessonBlock[]) {
  const [syncedBlockId, setSyncedBlockId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [activeLearningTimeSec, setActiveLearningTimeSec] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const { triggerCheckpointVerification, blockStates } = useLearnerStore();

  // Active Engagement Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startTimer = () => {
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          setActiveLearningTimeSec((prev) => prev + 1);
        }
      }, 1000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startTimer();
      } else {
        clearInterval(interval);
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Scroll-to-Timeline Sync using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const blockId = entry.target.getAttribute('data-block-id');
            if (blockId) {
              setSyncedBlockId(blockId);
            }
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '-20% 0px -50% 0px', // Trigger when element is near the middle of the screen
        threshold: 0,
      }
    );

    const blockElements = document.querySelectorAll('[data-block-id]');
    blockElements.forEach((el) => observer.observe(el));

    return () => {
      blockElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [lessonBlocks]);

  // Timeline Playback Loop
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();

      const loop = (now: number) => {
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTimeSec((prevTime) => prevTime + delta);

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } else {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  // Gating & Side-effects Monitoring
  useEffect(() => {
    if (!isPlaying) return;

    // Check for max continuous duration of the motion canvas block itself
    const motionBlock = lessonBlocks.find(b => b.type === 'motion_canvas');
    if (motionBlock && motionBlock.type === 'motion_canvas') {
      if (currentTimeSec >= motionBlock.maxContinuousDurationSec) {
        setIsPlaying(false);
        setCurrentTimeSec(motionBlock.maxContinuousDurationSec);
        return;
      }
    }

    // Check if we cross any interactive checkpoint's triggerTimestamp
    for (const block of lessonBlocks) {
      if (block.type === 'interactive_checkpoint' && block.triggerTimestamp) {
        const trigger = block.triggerTimestamp;
        // Using a small window epsilon to detect crossing the trigger boundary smoothly
        const epsilon = 0.1;
        if (currentTimeSec >= trigger && currentTimeSec - trigger < epsilon) {
          const blockState = blockStates[block.blockId]?.state;
          // If checkpoint is not completed, we should pause and gate
          if (blockState !== 'completed') {
            setIsPlaying(false);
            setCurrentTimeSec(trigger);
            triggerCheckpointVerification(block.blockId);

            // Scroll to the checkpoint block smoothly
            setTimeout(() => {
              const el = document.querySelector(`[data-block-id="${block.blockId}"]`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
            return;
          }
        }
      }
    }
  }, [currentTimeSec, isPlaying, lessonBlocks, triggerCheckpointVerification, blockStates]);

  return {
    currentTimeSec,
    setCurrentTimeSec,
    isPlaying,
    setIsPlaying,
    syncedBlockId,
    activeLearningTimeSec,
  };
}
