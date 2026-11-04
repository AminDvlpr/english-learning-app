"use client"

import * as React from "react"

import { AppShell } from "@/components/layout/AppShell"
import { LessonTopBar } from "@/components/layout/LessonTopBar"
import { sampleCafeLesson } from "@/data/sample-cafe-lesson"
import { useLearnerStore } from "@/store/useLearnerStore"
import { useGamificationStore } from "@/store/useGamificationStore"
import { LearnerStateInspector } from "@/components/canvas/LearnerStateInspector"
import { SmartLessonRenderer } from "@/components/canvas/SmartLessonRenderer"
import { LessonCompletionModal } from "@/components/gamification"
import { startSyncService, stopSyncService } from "@/lib/supabase/sync-service"

export default function Home() {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => { setIsClient(true) }, [])

  const xp = useGamificationStore(state => state.xp)
  const blockStates = useLearnerStore(state => state.blockStates)

  const isLessonComplete = React.useMemo(() => {
    if (Object.keys(blockStates).length === 0) return false;
    return Object.values(blockStates).every(b => b.state === "completed");
  }, [blockStates])

  const [showCompletionModal, setShowCompletionModal] = React.useState(false)

  React.useEffect(() => {
    startSyncService()
    return () => {
      stopSyncService()
    }
  }, [])

  React.useEffect(() => {
    if (isLessonComplete) {
      setShowCompletionModal(true)
    }
  }, [isLessonComplete])

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
      {isClient && <LessonCompletionModal open={showCompletionModal} onOpenChange={setShowCompletionModal} />}
    </AppShell>
  )
}
