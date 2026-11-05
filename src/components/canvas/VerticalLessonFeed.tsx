"use client"

import React, { useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FeedLesson } from "@/data/lesson-feed"
import { SmartLessonRenderer } from "@/components/canvas/SmartLessonRenderer"
import { useLearnerStore } from "@/store/useLearnerStore"

import { Lock, Unlock } from "lucide-react"

interface VerticalLessonFeedProps {
  lessonFeed: FeedLesson[]
}

export function VerticalLessonFeed({ lessonFeed }: VerticalLessonFeedProps) {
  const blockStates = useLearnerStore(state => state.blockStates)
  const feedRef = useRef<HTMLDivElement>(null)

  // Map lesson IDs to their mastered status based on blockStates
  const masteredLessonsMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    lessonFeed.forEach(lesson => {
      const lessonBlocks = lesson.blocks;
      if (lessonBlocks.length === 0) {
        map[lesson.id] = false;
        return;
      }

      const allMastered = lessonBlocks.every(block => {
        const state = blockStates[block.blockId]?.state;
        return state === "completed";
      });
      map[lesson.id] = allMastered;
    })
    return map;
  }, [lessonFeed, blockStates])

  // Determine how many lessons to show.
  // We show all mastered lessons, plus the FIRST unmastered lesson.
  const visibleLessonsCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < lessonFeed.length; i++) {
      count++;
      if (!masteredLessonsMap[lessonFeed[i].id]) {
        break; // Stop at the first unmastered lesson
      }
    }
    return count;
  }, [lessonFeed, masteredLessonsMap])

  const visibleLessons = lessonFeed.slice(0, visibleLessonsCount)

  return (
    <div
      ref={feedRef}
      className="flex-1 w-full h-full overflow-y-auto snap-y snap-mandatory bg-stone-950 relative no-scrollbar"
    >
      {visibleLessons.map((lesson, index) => {
        const isMastered = masteredLessonsMap[lesson.id];
        const isLastVisible = index === visibleLessonsCount - 1;
        const hasMoreLessons = index < lessonFeed.length - 1;

        return (
          <div
            key={lesson.id}
            id={`lesson-container-${lesson.id}`}
            className="snap-start min-h-full w-full flex flex-col relative"
          >
            {/* Lesson Content Wrapper */}
            <div className="flex-1 w-full h-full relative flex items-center justify-center bg-stone-950">
              <SmartLessonRenderer lesson={lesson.blocks} />
            </div>

            {/* Bottom Gate Indicator */}
            {hasMoreLessons && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
                <AnimatePresence mode="wait">
                  {!isMastered ? (
                    <motion.div
                      key="locked"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="bg-card/90 backdrop-blur border border-border shadow-lg rounded-full px-6 py-3 flex items-center gap-3"
                    >
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        🔒 Complete all story slides in this card to unlock scrolling down to the next lesson
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="unlocked"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-primary text-primary-foreground shadow-lg rounded-full px-6 py-3 flex items-center gap-3 pointer-events-auto"
                    >
                      <Unlock className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        ✨ Lesson Mastered! Scroll down for Next Lesson ↓
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* If it's the very last lesson in the entire feed and it's mastered */}
            {isLastVisible && !hasMoreLessons && isMastered && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary text-primary-foreground shadow-lg rounded-full px-6 py-3 flex items-center gap-3"
                    >
                        <span className="text-sm font-medium">
                            🎉 You&apos;ve completed all lessons!
                        </span>
                    </motion.div>
                </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
