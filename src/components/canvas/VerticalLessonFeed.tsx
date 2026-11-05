"use client"

import React, { useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FeedLesson } from "@/data/lesson-feed"
import { SmartLessonRenderer } from "@/components/canvas/SmartLessonRenderer"
import { useLearnerStore } from "@/store/useLearnerStore"
import { useCourseStore } from "@/store/useCourseStore"
import { CourseLesson } from "@/types/course"

import { Unlock, Loader2 } from "lucide-react"

interface VerticalLessonFeedProps {
  lessonFeed?: FeedLesson[]
  lessons?: CourseLesson[] // For CourseLesson format
}

export function VerticalLessonFeed({ lessonFeed, lessons }: VerticalLessonFeedProps) {
  const blockStates = useLearnerStore(state => state.blockStates)
  const masteredLessonIds = useCourseStore(state => state.masteredLessonIds)
  const feedRef = useRef<HTMLDivElement>(null)

  const isCourseFormat = !!lessons && lessons.length > 0
  const feed = isCourseFormat ? lessons! : lessonFeed!

  // Map lesson IDs to their mastered status
  const masteredLessonsMap = useMemo(() => {
    const map: Record<string, boolean> = {}

    if (isCourseFormat) {
      feed.forEach(lesson => {
        map[lesson.id] = masteredLessonIds.includes(lesson.id)
      })
    } else {
      (feed as FeedLesson[]).forEach(lesson => {
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
    }
    return map;
  }, [feed, blockStates, masteredLessonIds, isCourseFormat])

  // Determine how many lessons to show.
  // We show all mastered lessons, plus the FIRST unmastered lesson.
  const visibleLessonsCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < feed.length; i++) {
      count++;
      if (!masteredLessonsMap[feed[i].id]) {
        break; // Stop at the first unmastered lesson
      }
    }
    return count;
  }, [feed, masteredLessonsMap])

  const visibleLessons = feed.slice(0, visibleLessonsCount)

  return (
    <div
      ref={feedRef}
      className="flex-1 w-full h-full overflow-y-auto snap-y snap-mandatory bg-background relative no-scrollbar"
    >
      {visibleLessons.map((lesson, index) => {
        const isMastered = masteredLessonsMap[lesson.id];
        const isLastVisible = index === visibleLessonsCount - 1;
        const hasMoreLessons = index < feed.length - 1;

        return (
          <div
            key={lesson.id}
            id={`lesson-container-${lesson.id}`}
            className="w-full h-full shrink-0 snap-start flex flex-col relative overflow-hidden"
          >
            {/* Lesson Content Wrapper */}
            <div className="flex-1 w-full h-full relative flex items-center justify-center bg-background">
              <SmartLessonRenderer lesson={lesson as CourseLesson} />
            </div>

            {/* Bottom Gate Indicator */}
            {hasMoreLessons && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
                <AnimatePresence mode="wait">
                  {!isMastered ? (
                    <motion.div
                      key="locked"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-2 inset-x-0 z-30 flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-white/55 drop-shadow pointer-events-none"
                      dir="rtl"
                    >
                      <Loader2 className="h-3 w-3 animate-spin text-white/50"/>
                      <span>قفل است</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="unlocked"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-primary text-primary-foreground shadow-lg rounded-full px-6 py-3 flex items-center gap-3 pointer-events-auto cursor-pointer"
                      onClick={() => {
                        const nextId = feed[index + 1]?.id
                        if (nextId) {
                          const el = document.getElementById(`lesson-container-${nextId}`)
                          if (el) el.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                    >
                      <Unlock className="w-5 h-5" />
                      <span className="text-sm font-medium" dir="rtl">
                        ✨ آفرین! حالا صفحه را به پایین اسکرول کنید تا وارد درس بعدی شوید ↓
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
