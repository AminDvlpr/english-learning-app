"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MotionCanvasBlock as MotionCanvasBlockType, InteractiveCheckpointBlock as InteractiveCheckpointBlockType } from "@/types"
import { InteractiveCheckpointBlock } from "@/components/checkpoints/InteractiveCheckpointBlock"
import { BlockLearnerState } from "@/types/lesson"
import { RiveSceneController } from "@/components/motion/RiveSceneController"
import { scalePopInVariant } from "@/lib/motion-tokens"
import { useLearnerStore } from "@/store/useLearnerStore"

interface MotionCanvasBlockProps {
  checkpoints?: InteractiveCheckpointBlockType[]
  onProgress?: (percent: number) => void
  block: MotionCanvasBlockType
  state: BlockLearnerState
  currentTimeSec?: number
  isPlaying: boolean
  isPausedByHold?: boolean
  onPlayPause: () => void
}

export function MotionCanvasBlock({ block, state, checkpoints = [], onProgress, isPausedByHold }: MotionCanvasBlockProps) {
    const [localIsPlaying, setLocalIsPlaying] = useState(true)

  const { riveSignals, completeContentBlock, triggerCheckpointVerification } = useLearnerStore()

  // Independent timeline for 15s sequence
  const TOTAL_DURATION = 15.0
    const [localTime, setLocalTime] = useState(0)

  // Sync with checkpoints
  const blockStates = useLearnerStore(state => state.blockStates)
  const [solvedCheckpointIds, setSolvedCheckpointIds] = useState<Set<string>>(new Set())

  // Find next unsolved checkpoint
  const nextCheckpoint = checkpoints.find(cp => !solvedCheckpointIds.has(cp.blockId))

  const activeCheckpointState = nextCheckpoint ? blockStates[nextCheckpoint.blockId]?.state : null

  // Auto-resume logic
  React.useEffect(() => {
    if (activeCheckpointState === 'completed' && nextCheckpoint) {
        // Wait 1s then resume
        const timer = setTimeout(() => {
            setSolvedCheckpointIds(prev => new Set(prev).add(nextCheckpoint.blockId))
            setLocalIsPlaying(true)
        }, 1000)
        return () => clearTimeout(timer)
    }
  }, [activeCheckpointState, nextCheckpoint])

  React.useEffect(() => {
    if (!localIsPlaying || isPausedByHold) return
    const interval = setInterval(() => {
      setLocalTime(prev => {
        let next = prev + 0.1
        // Auto-pause at checkpoint
        if (nextCheckpoint && next >= nextCheckpoint.triggerTimestamp && activeCheckpointState !== 'completed') {
           next = nextCheckpoint.triggerTimestamp
           if (activeCheckpointState !== 'verification-required' && activeCheckpointState !== 'adaptive-remediation') {
              triggerCheckpointVerification(nextCheckpoint.blockId)
           }
           setLocalIsPlaying(false)
           return next
        }

        if (next >= TOTAL_DURATION) {
          clearInterval(interval)
          if (state === 'active') completeContentBlock(block.blockId)
          return TOTAL_DURATION
        }
        // Auto-complete at end of video if not already
        if (prev < TOTAL_DURATION && next >= TOTAL_DURATION && state === 'active') {
          completeContentBlock(block.blockId)
        }
        return next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [localIsPlaying, state, block.blockId, completeContentBlock, nextCheckpoint, activeCheckpointState, isPausedByHold, triggerCheckpointVerification])

  // Helper for timeline progress
  const progressPercent = (localTime / TOTAL_DURATION) * 100
  React.useEffect(() => {
    if (onProgress) onProgress(progressPercent)
  }, [progressPercent, onProgress])

  return (
    <AnimatePresence>
      <motion.div
        variants={scalePopInVariant}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-50px" }}
        className="w-full h-full flex-1 flex flex-col relative overflow-hidden"
      >


        <div className="w-full h-full relative">
          <RiveSceneController
            assetPath={block.assetPath}
            isCorrect={riveSignals.isCorrect}
            difficultyLevel={riveSignals.difficultyLevel}
            triggerName={riveSignals.triggerName}
            resetCounter={riveSignals.resetCounter}
            currentTimeSec={localTime}
            motionSceneId={block.motionSceneId}
          />


        </div>

        {/* Checkpoint Overlay */}
          {nextCheckpoint && localTime >= nextCheckpoint.triggerTimestamp && (
             <div
                className="absolute inset-x-0 bottom-0 z-30 pointer-events-auto bg-gradient-to-t from-black/85 via-black/60 to-transparent pt-12 pb-14 px-4"
                data-interactive="true"
                onPointerDown={(e) => e.stopPropagation()}
             >
               <InteractiveCheckpointBlock
                 block={nextCheckpoint}
                 state={activeCheckpointState || 'locked'}
               />
             </div>
          )}
              </motion.div>
    </AnimatePresence>
  )
}
