"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MotionCanvasBlock as MotionCanvasBlockType } from "@/types"
import { BlockLearnerState } from "@/types/lesson"
import { RiveSceneController } from "@/components/motion/RiveSceneController"
import { scalePopInVariant } from "@/lib/motion-tokens"
import { useLearnerStore } from "@/store/useLearnerStore"
import { Play, Pause, Minimize2, Maximize2, RotateCcw, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MotionCanvasBlockProps {
  block: MotionCanvasBlockType
  state: BlockLearnerState
  currentTimeSec: number
  isPlaying: boolean
  onPlayPause: () => void
}

export function MotionCanvasBlock({ block, state, currentTimeSec, isPlaying, onPlayPause }: MotionCanvasBlockProps) {
  const [isPip, setIsPip] = useState(false)

  // Learner store binding for diagnostic testing buttons
  const { riveSignals, completeContentBlock } = useLearnerStore()

  // Helper for timeline progress
  const progressPercent = (currentTimeSec / block.maxContinuousDurationSec) * 100

  // Manual tests per requirements (using internal state override for testing UI, ideally this is driven by the store during real usage)
  const [testState, setTestState] = useState<{ isCorrect: boolean | null, triggerName: string | null, resetCounter: number }>({
    isCorrect: null, triggerName: null, resetCounter: 0
  })

  const runDiagnostic = (action: 'success' | 'error' | 'reset') => {
    if (action === 'success') {
      setTestState(prev => ({ isCorrect: true, triggerName: 'success', resetCounter: prev.resetCounter }))
    } else if (action === 'error') {
      setTestState(prev => ({ isCorrect: false, triggerName: 'error', resetCounter: prev.resetCounter }))
    } else if (action === 'reset') {
      setTestState(prev => ({ isCorrect: null, triggerName: 'reset', resetCounter: prev.resetCounter + 1 }))
      // In real scenario, we might want a store action for reset, but omitting here since we removed setCurrentTimeSec from local state.
    }
  }

  // Merge store signals with diagnostic overrides for the Rive controller
  const mergedIsCorrect = testState.isCorrect !== null ? testState.isCorrect : riveSignals.isCorrect
  const mergedTriggerName = testState.triggerName || riveSignals.triggerName
  const mergedResetCounter = testState.resetCounter || riveSignals.resetCounter

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
            isCorrect={mergedIsCorrect}
            difficultyLevel={riveSignals.difficultyLevel}
            triggerName={mergedTriggerName}
            resetCounter={mergedResetCounter}
            currentTimeSec={currentTimeSec}
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
            {block.triggerTimestamp && (
               <div
                 className="absolute top-0 w-1 h-full bg-destructive"
                 style={{ left: `${(block.triggerTimestamp / block.maxContinuousDurationSec) * 100}%` }}
               />
            )}
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={onPlayPause}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Badge variant="outline" className="font-mono">
                {currentTimeSec.toFixed(1)}s / {block.maxContinuousDurationSec.toFixed(1)}s
              </Badge>
            </div>

            {/* Diagnostic Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => runDiagnostic('success')} title="Test Success">
                <Check className="w-4 h-4 text-success" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => runDiagnostic('error')} title="Test Error">
                <X className="w-4 h-4 text-destructive" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => runDiagnostic('reset')} title="Test Reset">
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {state === 'active' && !isPip && (
          <Button
            className="mt-4 w-full sm:w-auto self-start"
            onClick={() => completeContentBlock(block.blockId)}
          >
            Complete & Continue
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
