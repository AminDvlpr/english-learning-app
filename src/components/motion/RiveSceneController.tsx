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
  motionSceneId?: string
}

const STATE_MACHINE_NAME = "State Machine 1" // Common default name

export function RiveSceneController({
  assetPath,
  isCorrect,
  difficultyLevel,
  triggerName,
  resetCounter,
  currentTimeSec,
  motionSceneId,
}: RiveSceneControllerProps) {
  const isBuiltInScene = motionSceneId === 'scene_cafe_ordering'

  if (isBuiltInScene) {
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

  return (
    <RiveRuntimeCanvas
       assetPath={assetPath}
       isCorrect={isCorrect}
       difficultyLevel={difficultyLevel}
       triggerName={triggerName}
       resetCounter={resetCounter}
       currentTimeSec={currentTimeSec}
    />
  )
}

function RiveRuntimeCanvas({
  assetPath,
  isCorrect,
  difficultyLevel,
  triggerName,
  resetCounter,
  currentTimeSec,
}: Omit<RiveSceneControllerProps, 'motionSceneId'>) {
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

  const isCorrectInput = useStateMachineInput(rive, STATE_MACHINE_NAME, "isCorrect")
  const difficultyInput = useStateMachineInput(rive, STATE_MACHINE_NAME, "difficultyLevel")
  const triggerInput = useStateMachineInput(rive, STATE_MACHINE_NAME, "Trigger")
  const resetInput = useStateMachineInput(rive, STATE_MACHINE_NAME, "reset")

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

  return (
    <div className="w-full h-full flex-1 flex flex-col overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-300 ${rive ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
         <RiveComponent className="w-full h-full" />
      </div>
      {!rive && !hasError && (
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
