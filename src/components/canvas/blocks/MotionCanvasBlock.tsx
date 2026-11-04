"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MotionCanvasBlock as MotionCanvasBlockType } from "@/types"
import { BlockLearnerState } from "@/types/lesson"
import { RiveSceneController } from "@/components/motion/RiveSceneController"
import { scalePopInVariant } from "@/lib/motion-tokens"
import { useLearnerStore } from "@/store/useLearnerStore"
import { Play, Pause, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MotionCanvasBlockProps {
  block: MotionCanvasBlockType
  state: BlockLearnerState
  currentTimeSec?: number
  isPlaying: boolean
  onPlayPause: () => void
}

export function MotionCanvasBlock({ block, state, isPlaying, onPlayPause }: MotionCanvasBlockProps) {
  const [isPip, setIsPip] = useState(false)

  const { riveSignals, completeContentBlock } = useLearnerStore()

  // Independent timeline for 15s sequence
  const TOTAL_DURATION = 15.0
  const FIRST_CHECKPOINT = 4.0
  const [localTime, setLocalTime] = useState(0)

  React.useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setLocalTime(prev => {
        const next = prev + 0.1
        if (next >= TOTAL_DURATION) {
          clearInterval(interval)
          if (state === 'active') completeContentBlock(block.blockId)
          return TOTAL_DURATION
        }
        // Auto-complete at first checkpoint timestamp (4.0s)
        if (prev < FIRST_CHECKPOINT && next >= FIRST_CHECKPOINT && state === 'active') {
          completeContentBlock(block.blockId)
        }
        return next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, state, block.blockId, completeContentBlock])

  // Helper for timeline progress
  const progressPercent = (localTime / TOTAL_DURATION) * 100

  return (
    <AnimatePresence>
      <motion.div
        variants={scalePopInVariant}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-50px" }}
        className={`flex flex-col gap-4 w-full ${isPip ? 'fixed bottom-4 right-4 w-96 shadow-2xl z-50 bg-background p-4 rounded-xl border' : 'relative'}`}
      >
        {block.caption && !isPip && (
          <h2 className="text-xl font-semibold">{block.caption}</h2>
        )}

        <div className="relative group">
          <RiveSceneController
            assetPath={block.assetPath}
            isCorrect={riveSignals.isCorrect}
            difficultyLevel={riveSignals.difficultyLevel}
            triggerName={riveSignals.triggerName}
            resetCounter={riveSignals.resetCounter}
            currentTimeSec={localTime}
            motionSceneId={block.motionSceneId}
          />

          {/* PiP Toggle */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsPip(!isPip)}
          >
            {isPip ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          {/* Timeline Scrubber */}
          <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
            <div
                 className="absolute top-0 w-1 h-full bg-destructive"
                 style={{ left: `${(FIRST_CHECKPOINT / TOTAL_DURATION) * 100}%` }}
               />
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={onPlayPause}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Badge variant="outline" className="font-mono">
                {localTime.toFixed(1)}s / {TOTAL_DURATION.toFixed(1)}s
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
