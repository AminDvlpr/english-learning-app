"use client"

import React from "react"
import { motion } from "framer-motion"
import { LessonBlock } from "@/types"
import { staggerContainerVariant } from "@/lib/motion-tokens"
import { useLearnerStore } from "@/store/useLearnerStore"
import { MotionBlockWrapper } from "@/components/motion/MotionBlockWrapper"
import { useInteractiveLesson } from "@/hooks/useInteractiveLesson"
import { HeadingIntroBlock, CalloutBlock, ToggleTableBlock, MotionCanvasBlock } from "@/components/canvas/blocks"
import {
  HeadingIntroBlock as HeadingIntroBlockType,
  CalloutBlock as CalloutBlockType,
  ToggleTableBlock as ToggleTableBlockType,
  MotionCanvasBlock as MotionCanvasBlockType,
  InteractiveCheckpointBlock as InteractiveCheckpointBlockType
} from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SmartLessonRendererProps {
  lesson: LessonBlock[]
}

export function SmartLessonRenderer({ lesson }: SmartLessonRendererProps) {
  const blockStates = useLearnerStore(state => state.blockStates)
  const submitCheckpointAnswer = useLearnerStore(state => state.submitCheckpointAnswer)

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
      <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm mb-8 p-3 flex justify-between items-center text-sm">
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
                  <Card className={`w-full transition-all duration-300 ${bState === 'locked' ? 'opacity-50 backdrop-blur-[2px]' : ''}`}>
                    <CardHeader>
                      <CardTitle className="text-lg flex justify-between items-center">
                        <span className="capitalize">Interactive Checkpoint</span>
                        <Badge>{block.difficultyLevel || 'N/A'}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 border rounded-md bg-background">
                        <p className="font-semibold mb-4" dir="rtl">{(block as InteractiveCheckpointBlockType).question.prompt}</p>
                        <div className="flex flex-col gap-2">
                          {(block as InteractiveCheckpointBlockType).question.options?.map(opt => (
                            <Button
                              key={opt.id}
                              variant="outline"
                              className="justify-start font-mono h-auto py-3 text-left whitespace-normal"
                              dir="ltr"
                              onClick={() => submitCheckpointAnswer(block.blockId, opt.id)}
                              disabled={bState !== 'verification-required' && bState !== 'adaptive-remediation'}
                            >
                              {opt.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </MotionBlockWrapper>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
