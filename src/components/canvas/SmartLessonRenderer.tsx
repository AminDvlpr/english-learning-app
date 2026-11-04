"use client"

import React, { useEffect } from "react"
import { motion } from "framer-motion"
import { LessonBlock } from "@/types"
import { staggerContainerVariant } from "@/lib/motion-tokens"
import { useLearnerStore } from "@/store/useLearnerStore"
import { MotionBlockWrapper } from "@/components/motion/MotionBlockWrapper"
import { useInteractiveLesson } from "@/hooks/useInteractiveLesson"
import { HeadingIntroBlock, CalloutBlock, ToggleTableBlock, MotionCanvasBlock } from "@/components/canvas/blocks"
import { InteractiveCheckpointBlock } from "@/components/checkpoints/InteractiveCheckpointBlock"
import {
  HeadingIntroBlock as HeadingIntroBlockType,
  CalloutBlock as CalloutBlockType,
  ToggleTableBlock as ToggleTableBlockType,
  MotionCanvasBlock as MotionCanvasBlockType,
  InteractiveCheckpointBlock as InteractiveCheckpointBlockType
} from "@/types"
import { Badge } from "@/components/ui/badge"

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

  const {
    currentTimeSec,
    isPlaying,
    setIsPlaying,
    syncedBlockId,
    activeLearningTimeSec,
  } = useInteractiveLesson(lesson)

  // Status bar logic
  const syncedBlock = lesson.find(b => b.blockId === syncedBlockId)

  return (
    <div className="flex flex-col w-full relative">
      {/* Visual Sync Status Bar */}
      <div className="sticky top-[64px] z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm mb-8 p-3 flex justify-between items-center text-sm">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="font-mono">
             Synced: {syncedBlock ? syncedBlock.type : 'None'}
          </Badge>
          <Badge variant="outline" className="font-mono">
            Focus: {syncedBlockId || '...'}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground font-mono">
             Time: {activeLearningTimeSec}s
          </span>
          <span className="text-muted-foreground font-mono">
             Motion: {currentTimeSec.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Lesson Canvas */}
      <motion.div
        variants={staggerContainerVariant}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col gap-8 pb-24 w-full"
      >
        {lesson.map((block) => {
          const bState = blockStates[block.blockId]?.state || 'locked';

          return (
            <div key={block.blockId} data-block-id={block.blockId}>
              <MotionBlockWrapper block={block} state={bState}>
                {block.type === 'heading_intro' && (
                  <HeadingIntroBlock block={block as HeadingIntroBlockType} state={bState} />
                )}

                {block.type === 'callout' && (
                  <CalloutBlock block={block as CalloutBlockType} state={bState} />
                )}

                {block.type === 'toggle_table' && (
                  <ToggleTableBlock block={block as ToggleTableBlockType} state={bState} />
                )}

                {block.type === 'motion_canvas' && (
                  <MotionCanvasBlock
                    block={block as MotionCanvasBlockType}
                    state={bState}
                    currentTimeSec={currentTimeSec}
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                  />
                )}

                {block.type === 'interactive_checkpoint' && (
                  <InteractiveCheckpointBlock
                    block={block as InteractiveCheckpointBlockType}
                    state={bState}
                  />
                )}
              </MotionBlockWrapper>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
