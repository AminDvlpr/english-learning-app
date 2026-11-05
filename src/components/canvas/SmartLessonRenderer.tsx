"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LessonBlock } from "@/types"
import { useLearnerStore } from "@/store/useLearnerStore"
import { MotionBlockWrapper } from "@/components/motion/MotionBlockWrapper"
import { HeadingIntroBlock, CalloutBlock, ToggleTableBlock, MotionCanvasBlock } from "@/components/canvas/blocks"
import { InteractiveCheckpointBlock } from "@/components/checkpoints/InteractiveCheckpointBlock"
import {
  HeadingIntroBlock as HeadingIntroBlockType,
  CalloutBlock as CalloutBlockType,
  ToggleTableBlock as ToggleTableBlockType,
  MotionCanvasBlock as MotionCanvasBlockType,
  InteractiveCheckpointBlock as InteractiveCheckpointBlockType
} from "@/types"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  const currentBlock = lesson[currentSlideIndex]
  const currentState = currentBlock ? (blockStates[currentBlock.blockId]?.state || 'locked') : 'locked'

  // Independent 2.0s Reading Timer
  const READING_TIME_MS = 2000
  const [readProgress, setReadProgress] = useState(0)

  useEffect(() => {
    if (!currentBlock) return
    const isReadingBlock = ['heading_intro', 'callout', 'toggle_table'].includes(currentBlock.type)

    if (isReadingBlock && currentState === 'active') {
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
  }, [currentSlideIndex, currentBlock, currentBlock?.blockId, currentState, completeContentBlock])


  const goNext = () => {
    if (currentState === 'completed' && currentSlideIndex < lesson.length - 1) {
      setCurrentSlideIndex(prev => prev + 1)
    }
  }

  const goPrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1)
    }
  }

  if (!currentBlock) return null

  return (
    <div className="flex flex-col w-full min-h-screen bg-stone-50 dark:bg-stone-950 relative sm:p-4 pb-24">
      {/* Deepstash / Story Card Container */}
      <div className="max-w-xl mx-auto w-full bg-white dark:bg-stone-900 sm:rounded-[32px] sm:shadow-2xl overflow-hidden min-h-[100dvh] sm:min-h-[800px] flex flex-col relative border-x sm:border border-stone-200 dark:border-stone-800">

        {/* Segmented Top Progress Bars */}
        <div className="flex gap-1 p-4 w-full z-10 bg-gradient-to-b from-black/5 to-transparent dark:from-black/20">
          {lesson.map((b, idx) => {
            const bState = blockStates[b.blockId]?.state || 'locked'
            const isCompleted = bState === 'completed'
            const isCurrent = idx === currentSlideIndex
            const isReadingSlide = ['heading_intro', 'callout', 'toggle_table'].includes(b.type)

            let fillPercent = 0
            if (isCompleted || idx < currentSlideIndex) fillPercent = 100
            else if (isCurrent && isReadingSlide) fillPercent = (readProgress / READING_TIME_MS) * 100

            return (
              <div key={b.blockId} className="h-1.5 flex-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-stone-800 dark:bg-stone-200 transition-all duration-75 ease-linear"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            )
          })}
        </div>

        {/* Slide Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-24 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBlock.blockId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="py-4"
            >
              <MotionBlockWrapper block={currentBlock} state={currentState}>
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
                    currentTimeSec={0} // Managed internally now
                    isPlaying={true}
                    onPlayPause={() => {}}
                  />
                )}
                {currentBlock.type === 'interactive_checkpoint' && (
                  <InteractiveCheckpointBlock
                    block={currentBlock as InteractiveCheckpointBlockType}
                    state={currentState}
                  />
                )}
              </MotionBlockWrapper>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 flex justify-between items-center z-20">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={currentSlideIndex === 0}
            className="rounded-full text-stone-600 dark:text-stone-400"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Prev
          </Button>

          <Button
            onClick={goNext}
            disabled={currentState !== 'completed' || currentSlideIndex === lesson.length - 1}
            className="rounded-full px-8 bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white transition-all shadow-md"
          >
            Next Slide
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

      </div>
    </div>
  )
}
