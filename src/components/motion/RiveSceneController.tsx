"use client"

import React, { useEffect, useState } from "react"
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas"
import { CafeInteractiveVectorScene } from "./CafeInteractiveVectorScene"

interface RiveSceneControllerProps {
  assetPath: string
  isCorrect: boolean | null
  difficultyLevel: number
  triggerName: string | null
  resetCounter: number
  currentTimeSec: number
}

const STATE_MACHINE_NAME = "State Machine 1" // Common default name

export function RiveSceneController({
  assetPath,
  isCorrect,
  difficultyLevel,
  triggerName,
  resetCounter,
  currentTimeSec,
}: RiveSceneControllerProps) {
  const [hasError, setHasError] = useState(false)

  const { RiveComponent, rive } = useRive({
    src: assetPath,
    stateMachines: STATE_MACHINE_NAME,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
    autoplay: true,
    onLoadError: () => setHasError(true),
  })

  // Define inputs matching the contract
  const isCorrectInput = useStateMachineInput(rive, STATE_MACHINE_NAME, "isCorrect")
  const difficultyInput = useStateMachineInput(rive, STATE_MACHINE_NAME, "difficultyLevel")
  const triggerInput = useStateMachineInput(rive, STATE_MACHINE_NAME, "Trigger")
  const resetInput = useStateMachineInput(rive, STATE_MACHINE_NAME, "reset")

  // Sync props to Rive inputs
  useEffect(() => {
    if (isCorrectInput && isCorrect !== null) {
      isCorrectInput.value = isCorrect
    }
  }, [isCorrect, isCorrectInput])

  useEffect(() => {
    if (difficultyInput) {
      difficultyInput.value = difficultyLevel
    }
  }, [difficultyLevel, difficultyInput])

  useEffect(() => {
    if (triggerInput && triggerName) {
      triggerInput.fire()
    }
  }, [triggerName, triggerInput])

  useEffect(() => {
    if (resetInput && resetCounter > 0) {
      resetInput.fire()
    }
  }, [resetCounter, resetInput])

  // If Rive fails to load (e.g. file missing), fallback to our vector scene
  if (hasError) {
    return (
      <CafeInteractiveVectorScene
        currentTimeSec={currentTimeSec}
        isCorrect={isCorrect}
        difficultyLevel={difficultyLevel}
        triggerName={triggerName}
        resetCounter={resetCounter}
      />
    )
  }

  // Also render fallback while rive is loading (which handles cases where fetch hasn't resolved/failed yet but we want immediate display)
  // or render both with Rive superimposed and fallback hidden once Rive is ready.
  // The simplest is to just render RiveComponent if no error. If the file doesn't exist, onLoadError will catch it.

  return (
    <div className="relative w-full aspect-video bg-muted rounded-xl overflow-hidden shadow-inner">
      <div className={`absolute inset-0 transition-opacity duration-300 ${rive ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
         <RiveComponent className="w-full h-full" />
      </div>
      {!rive && !hasError && (
        // Temporary render fallback during loading to ensure 100% visual experience immediately
        <div className="absolute inset-0">
          <CafeInteractiveVectorScene
            currentTimeSec={currentTimeSec}
            isCorrect={isCorrect}
            difficultyLevel={difficultyLevel}
            triggerName={triggerName}
            resetCounter={resetCounter}
          />
        </div>
      )}
    </div>
  )
}
