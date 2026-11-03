"use client"

import * as React from "react"

import { AppShell } from "@/components/layout/AppShell"
import { LessonTopBar } from "@/components/layout/LessonTopBar"
import { sampleCafeLesson } from "@/data/sample-cafe-lesson"
import { useLearnerStore } from "@/store/useLearnerStore"
import { LearnerStateInspector } from "@/components/canvas/LearnerStateInspector"
import { SmartLessonRenderer } from "@/components/canvas/SmartLessonRenderer"

export default function Home() {
  const xp = useLearnerStore(state => state.xp)

  React.useEffect(() => {
    useLearnerStore.persist.onFinishHydration(() => {
      if (useLearnerStore.getState().currentLessonId !== 'lesson_cafe_001') {
        useLearnerStore.getState().initializeLesson('lesson_cafe_001', sampleCafeLesson)
      }
    })
  }, [])

  return (
    <AppShell
      topBar={
        <LessonTopBar
          title="Polite Ordering in an English Café"
          progress={Math.min(100, xp)} // Simple progress mapping
          streak={12}
          hearts={4}
        />
      }
    >
      <div className="flex gap-8 relative max-w-5xl mx-auto w-full px-4 pt-4">
        {/* Left Side: Lesson Canvas */}
        <div className="flex-1">
           <SmartLessonRenderer lesson={sampleCafeLesson} />
        </div>

        {/* Right Side: Diagnostic Inspector */}
        <div className="hidden lg:block w-80 shrink-0">
          <LearnerStateInspector />
        </div>
      </div>
    </AppShell>
  )
}
