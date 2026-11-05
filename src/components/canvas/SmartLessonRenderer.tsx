"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LessonBlock } from "@/types"
import { useLearnerStore } from "@/store/useLearnerStore"
import { BlockWrapper } from "@/components/canvas/BlockWrapper"
import { HeadingIntroBlock, CalloutBlock, ToggleTableBlock, MotionCanvasBlock } from "@/components/canvas/blocks"
import {
  HeadingIntroBlock as HeadingIntroBlockType,
  CalloutBlock as CalloutBlockType,
  ToggleTableBlock as ToggleTableBlockType,
  MotionCanvasBlock as MotionCanvasBlockType,
  InteractiveCheckpointBlock as InteractiveCheckpointBlockType
} from "@/types"

interface SmartLessonRendererProps {
  lesson: LessonBlock[]
}

export function SmartLessonRenderer({ lesson }: SmartLessonRendererProps) {
  const blockStates = useLearnerStore(state => state.blockStates)
  const initializeLesson = useLearnerStore(state => state.initializeLesson)

  useEffect(() => {
    if (Object.keys(blockStates).length === 0) {
      initializeLesson('lesson-1', lesson)
    }
  }, [blockStates, initializeLesson, lesson])

  const completeContentBlock = useLearnerStore(state => state.completeContentBlock)

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [videoProgress, setVideoProgress] = useState(0)

  // Extract all checkpoints and group them into the motion_canvas slide
  const { storySlides, allVideoCheckpoints } = React.useMemo(() => {
    const allVideoCheckpoints = lesson
      .filter(b => b.type === 'interactive_checkpoint')
      .sort((a, b) => (a.triggerTimestamp ?? 0) - (b.triggerTimestamp ?? 0)) as InteractiveCheckpointBlockType[]

    const storySlides = lesson.filter(b => b.type !== 'interactive_checkpoint')

    return { storySlides, allVideoCheckpoints }
  }, [lesson])

  const currentBlock = storySlides[currentSlideIndex]
  const currentState = currentBlock ? (blockStates[currentBlock.blockId]?.state || 'locked') : 'locked'

  // Hold-to-pause logic for reading slides
  const [isReadingPaused, setIsReadingPaused] = useState(false)

  // Unified Hold/Tap logic
  const pointerDownTimeRef = React.useRef(0)
  const pointerDownXRef = React.useRef(0)
  const [isTimelinePulsing, setIsTimelinePulsing] = useState(false)

  // Independent 2.0s Reading Timer
  const READING_TIME_MS = 2000
  const [readProgress, setReadProgress] = useState(0)

  useEffect(() => {
    if (!currentBlock) return
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
  }, [currentSlideIndex, currentBlock, currentBlock?.blockId, currentState, completeContentBlock, isReadingPaused])


  if (!currentBlock) return null

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-stone-50 dark:bg-stone-950 relative sm:p-4">
      {/* Deepstash / Story Card Container */}
      <div className="w-full max-w-[420px] mx-auto bg-white dark:bg-stone-900 sm:rounded-[28px] overflow-hidden h-[100dvh] sm:h-[calc(100dvh-5rem)] sm:max-h-[820px] flex flex-col relative sm:shadow-2xl">

        {/* Segmented Top Progress Bars */}
        <div className="flex gap-1 p-4 w-full z-10 bg-gradient-to-b from-black/5 to-transparent dark:from-black/20">
          {storySlides.map((slide, idx) => {
            const b = slide
            const isCurrent = idx === currentSlideIndex
            const isReadingSlide = ['heading_intro', 'callout', 'toggle_table'].includes(b.type)

            let fillPercent = 0
            if (idx < currentSlideIndex) fillPercent = 100
            else if (idx > currentSlideIndex) fillPercent = 0
            else if (isCurrent && isReadingSlide) fillPercent = (readProgress / READING_TIME_MS) * 100
            else if (isCurrent && b.type === 'motion_canvas') fillPercent = videoProgress

            return (
              <div key={b.blockId} className="h-1.5 flex-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-stone-800 dark:bg-stone-200 transition-all duration-75 ease-linear ${isCurrent && isTimelinePulsing ? 'h-2.5 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]' : ''}`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            )
          })}
        </div>

        {/* Slide Content */}
        <div
          className="flex-1 overflow-hidden relative"
          onPointerDown={(e) => {
            const target = e.target as HTMLElement
            if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('[data-interactive="true"]')) {
              return
            }
            pointerDownTimeRef.current = Date.now()
            pointerDownXRef.current = e.clientX
            setIsReadingPaused(true)
          }}
          onPointerUp={(e) => {
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
                if (currentState === 'completed' && currentSlideIndex < storySlides.length - 1) {
                  setCurrentSlideIndex(prev => prev + 1)
                } else if (currentState !== 'completed') {
                  setIsTimelinePulsing(true)
                  setTimeout(() => setIsTimelinePulsing(false), 600)
                }
              }
            }
          }}
          onPointerCancel={() => setIsReadingPaused(false)}
          onPointerLeave={() => setIsReadingPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBlock.blockId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full w-full"
            >
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
                    currentTimeSec={0} // Managed internally now
                    isPlaying={true}
                    isPausedByHold={isReadingPaused}
                    onPlayPause={() => {}}
                  />
                )}
              </BlockWrapper>
            </motion.div>
          </AnimatePresence>
        </div>



      </div>
    </div>
  )
}
