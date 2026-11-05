"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LessonBlock } from "@/types"
import { CourseLesson, CourseSlide } from "@/types/course"
import { useLearnerStore } from "@/store/useLearnerStore"
import { useCourseStore } from "@/store/useCourseStore"
import { BlockWrapper } from "@/components/canvas/BlockWrapper"
import { HeadingIntroBlock, CalloutBlock, ToggleTableBlock, MotionCanvasBlock } from "@/components/canvas/blocks"
import {
  HeadingIntroBlock as HeadingIntroBlockType,
  CalloutBlock as CalloutBlockType,
  ToggleTableBlock as ToggleTableBlockType,
  MotionCanvasBlock as MotionCanvasBlockType,
  InteractiveCheckpointBlock as InteractiveCheckpointBlockType
} from "@/types"

import { ReadStorySlide } from "./slides/ReadStorySlide"
import { ListenStorySlide } from "./slides/ListenStorySlide"
import { PlayNarrativeSlide } from "./slides/PlayNarrativeSlide"
import { GestureOnboardingOverlay } from "./GestureOnboardingOverlay"
import { LessonSummaryStashSlide } from "./LessonSummaryStashSlide"

interface SmartLessonRendererProps {
  lesson: LessonBlock[] | CourseLesson
}

export function SmartLessonRenderer({ lesson }: SmartLessonRendererProps) {
  const isCourseLesson = !Array.isArray(lesson)
  const courseLesson = isCourseLesson ? lesson as CourseLesson : null
  const legacyBlocks = React.useMemo(() => !isCourseLesson ? lesson as LessonBlock[] : [], [isCourseLesson, lesson])

  const blockStates = useLearnerStore(state => state.blockStates)
  const initializeLesson = useLearnerStore(state => state.initializeLesson)
  const completeContentBlock = useLearnerStore(state => state.completeContentBlock)

  const { hasSeenGestureGuide, saveLessonStash, masteredLessonIds } = useCourseStore()

  useEffect(() => {
    if (!isCourseLesson && Object.keys(blockStates).length === 0) {
      initializeLesson('lesson-1', legacyBlocks)
    }
  }, [blockStates, initializeLesson, isCourseLesson, legacyBlocks])

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [videoProgress, setVideoProgress] = useState(0)

  // Hold-to-pause logic
  const [isReadingPaused, setIsReadingPaused] = useState(false)
  const pointerDownTimeRef = React.useRef(0)
  const pointerDownXRef = React.useRef(0)
  const [isTimelinePulsing, setIsTimelinePulsing] = useState(false)

  // Independent 2.0s Reading Timer for legacy blocks
  const READING_TIME_MS = 2000
  const [readProgress, setReadProgress] = useState(0)

  // ==========================================
  // LEGACY MODE LOGIC (LessonBlock[])
  // ==========================================
  const { storySlides, allVideoCheckpoints } = React.useMemo(() => {
    if (isCourseLesson) return { storySlides: [], allVideoCheckpoints: [] }
    const allVideoCheckpoints = legacyBlocks
      .filter(b => b.type === 'interactive_checkpoint')
      .sort((a, b) => (a.triggerTimestamp ?? 0) - (b.triggerTimestamp ?? 0)) as InteractiveCheckpointBlockType[]
    const storySlides = legacyBlocks.filter(b => b.type !== 'interactive_checkpoint')
    return { storySlides, allVideoCheckpoints }
  }, [isCourseLesson, legacyBlocks])

  const currentBlock = storySlides[currentSlideIndex]
  const currentState = currentBlock ? (blockStates[currentBlock.blockId]?.state || 'locked') : 'locked'

  useEffect(() => {
    if (isCourseLesson || !currentBlock) return
    const isReadingBlock = ['heading_intro', 'callout', 'toggle_table'].includes(currentBlock.type)

    if (isReadingBlock && currentState === 'active' && !isReadingPaused) {
      setReadProgress(0)
      const interval = setInterval(() => {
        setReadProgress(prev => {
          const next = prev + 50
          if (next >= READING_TIME_MS) {
            clearInterval(interval)
            completeContentBlock(currentBlock.blockId)
            return READING_TIME_MS
          }
          return next
        })
      }, 50)
      return () => clearInterval(interval)
    } else {
      setReadProgress(currentState === 'completed' ? READING_TIME_MS : 0)
    }
  }, [currentSlideIndex, currentBlock, currentState, completeContentBlock, isReadingPaused, isCourseLesson])

  // ==========================================
  // COURSE LESSON MODE LOGIC (CourseLesson)
  // ==========================================
  const totalSlides = isCourseLesson ? (courseLesson?.slides.length || 0) + 1 : storySlides.length

  // Progress states for Course Slides
  const [courseSlideCompleted, setCourseSlideCompleted] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (isCourseLesson) {
      setReadProgress(0)
      if (!courseSlideCompleted[currentSlideIndex]) {
        // Auto-complete simple slides after 3 seconds for demo purposes
        // In a real app, the slide itself would call a complete function
        const timer = setTimeout(() => {
           setCourseSlideCompleted(prev => ({ ...prev, [currentSlideIndex]: true }))
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [currentSlideIndex, isCourseLesson, courseSlideCompleted])

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsReadingPaused(false)
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('[data-interactive="true"]')) {
      return
    }
    const holdDuration = Date.now() - pointerDownTimeRef.current
    if (holdDuration < 220) {
      const rect = e.currentTarget.getBoundingClientRect()
      const isLeft = e.clientX - rect.left < rect.width * 0.3
      if (isLeft) {
        if (currentSlideIndex > 0) {
          setCurrentSlideIndex(prev => prev - 1)
          setReadProgress(0)
          setVideoProgress(0)
        }
      } else {
        const canAdvance = isCourseLesson
            ? courseSlideCompleted[currentSlideIndex] || currentSlideIndex === totalSlides - 1
            : currentState === 'completed'

        if (canAdvance && currentSlideIndex < totalSlides - 1) {
          setCurrentSlideIndex(prev => prev + 1)
        } else if (!canAdvance) {
          setIsTimelinePulsing(true)
          setTimeout(() => setIsTimelinePulsing(false), 600)
        }
      }
    }
  }

  const renderLegacyBlock = () => {
      if (!currentBlock) return null;
      return (
        <BlockWrapper block={currentBlock} state={currentState}>
            {currentBlock.type === 'heading_intro' && (
                <HeadingIntroBlock block={currentBlock as HeadingIntroBlockType} state={currentState} />
            )}
            {currentBlock.type === 'callout' && (
                <CalloutBlock block={currentBlock as CalloutBlockType} state={currentState} />
            )}
            {currentBlock.type === 'toggle_table' && (
                <ToggleTableBlock block={currentBlock as ToggleTableBlockType} state={currentState} />
            )}
            {currentBlock.type === 'motion_canvas' && (
                <MotionCanvasBlock
                block={currentBlock as MotionCanvasBlockType}
                state={currentState}
                checkpoints={allVideoCheckpoints}
                onProgress={setVideoProgress}
                currentTimeSec={0}
                isPlaying={true}
                isPausedByHold={isReadingPaused}
                onPlayPause={() => {}}
                />
            )}
        </BlockWrapper>
      )
  }

  const renderCourseSlide = (slide: CourseSlide) => {
      switch (slide.format) {
          case 'read': return <ReadStorySlide id={slide.id} title={slide.title} content={slide.kineticParagraphs?.[0]?.textEn || "No content"} />;
          case 'listen': return <ListenStorySlide id={slide.id} title={slide.title} dialogueLines={[]} />;
          case 'play': return <PlayNarrativeSlide environment="cafe_counter" interruptType="none" onInterruptComplete={() => {}} />;
          case 'watch': return <MotionCanvasBlock block={{type: "motion_canvas", blockId: slide.id, order: slide.order, motionSceneId: "scene", assetPath: "/assets/rive/wrong-order-scene.riv", maxContinuousDurationSec: slide.videoDurationSec || 60}} state={"active"} checkpoints={[]} onProgress={setVideoProgress} currentTimeSec={0} isPlaying={true} isPausedByHold={isReadingPaused} onPlayPause={() => {}} />;
          default: return null;
      }
  }


  if (!isCourseLesson && !currentBlock) return null
  if (isCourseLesson && !courseLesson) return null

  return (
    <div className="w-full h-full flex-1 flex flex-col bg-background text-foreground relative overflow-hidden">

        {!hasSeenGestureGuide && (
            <GestureOnboardingOverlay onDismiss={() => useCourseStore.setState({ hasSeenGestureGuide: true })} />
        )}

        {/* Segmented Top Progress Bars */}
        <div className="flex gap-1 p-4 w-full z-10 bg-gradient-to-b from-black/5 to-transparent dark:from-black/20 absolute top-0 left-0 right-0 pointer-events-none">
          {Array.from({ length: totalSlides }).map((_, idx) => {
            const isCurrent = idx === currentSlideIndex
            let fillPercent = 0

            if (idx < currentSlideIndex) fillPercent = 100
            else if (idx > currentSlideIndex) fillPercent = 0
            else {
                if (isCourseLesson) {
                    fillPercent = courseSlideCompleted[idx] ? 100 : 0
                } else {
                    const b = storySlides[idx]
                    const isReadingSlide = b && ['heading_intro', 'callout', 'toggle_table'].includes(b.type)
                    if (isReadingSlide) fillPercent = (readProgress / READING_TIME_MS) * 100
                    else if (b?.type === 'motion_canvas') fillPercent = videoProgress
                }
            }

            return (
              <div key={idx} className={`flex-1 bg-stone-200/50 dark:bg-stone-700/50 backdrop-blur rounded-full transition-all duration-200 ${isCurrent && isTimelinePulsing ? 'h-2.5 ring-2 ring-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.9)]' : 'h-1.5'}`}>
                <div
                  className={`h-full rounded-full bg-stone-800 dark:bg-stone-200 transition-all duration-75 ease-linear ${isCurrent && isTimelinePulsing ? 'bg-amber-400' : ''}`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            )
          })}
        </div>

        {/* Slide Content */}
        <div
          className="flex-1 overflow-hidden relative pt-12"
          onPointerDown={(e) => {
            const target = e.target as HTMLElement
            if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('[data-interactive="true"]')) {
              return
            }
            pointerDownTimeRef.current = Date.now()
            pointerDownXRef.current = e.clientX
            setIsReadingPaused(true)
          }}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setIsReadingPaused(false)}
          onPointerLeave={() => setIsReadingPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full w-full"
            >
              {isCourseLesson ? (
                  currentSlideIndex < courseLesson!.slides.length ? (
                      renderCourseSlide(courseLesson!.slides[currentSlideIndex])
                  ) : (
                      <LessonSummaryStashSlide
                        xpEarned={150}
                        gemsEarned={20}
                        keyPhrases={courseLesson!.summaryStash.keyPhrases}
                        onNextLesson={() => {
                           saveLessonStash(courseLesson!.summaryStash)
                           useCourseStore.setState({ masteredLessonIds: [...masteredLessonIds, courseLesson!.id] })
                        }}
                      />
                  )
              ) : (
                  renderLegacyBlock()
              )}
            </motion.div>
          </AnimatePresence>
        </div>
    </div>
  )
}
