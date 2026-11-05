"use client"

import * as React from "react"
import { AppShell } from "@/components/layout/AppShell"
import { lessonFeed } from "@/data/lesson-feed"
import { useLearnerStore } from "@/store/useLearnerStore"
import { useCourseStore } from "@/store/useCourseStore"
import { LessonCompletionModal } from "@/components/gamification"
import { startSyncService, stopSyncService } from "@/lib/supabase/sync-service"
import { VerticalLessonFeed } from "@/components/canvas/VerticalLessonFeed"
import { ExplorerGridView } from "@/components/canvas/ExplorerGridView"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const [isClient, setIsClient] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'feed' | 'explorer'>('explorer')

  React.useEffect(() => { setIsClient(true) }, [])

  const { courses, syncCoursesFromApi, enrolledCourseIds } = useCourseStore()

  const [showCompletionModal, setShowCompletionModal] = React.useState(false)

  React.useEffect(() => {
    startSyncService()
    syncCoursesFromApi()
    return () => stopSyncService()
  }, [syncCoursesFromApi])

  // Initialize ALL blocks from the feed into the learner store
  React.useEffect(() => {
    useLearnerStore.persist.onFinishHydration(() => {
      const allBlocks = lessonFeed.flatMap(lesson => lesson.blocks);
      // Initialize if we don't have the blocks
      const currentBlocks = Object.keys(useLearnerStore.getState().blockStates);
      if (currentBlocks.length < allBlocks.length) {
         useLearnerStore.getState().initializeLesson('feed_all', allBlocks)
      }
    })
  }, [])

  // Aggregate all enrolled courses lessons to feed them to the vertical feed as well
  // For now, we still mostly rely on lessonFeed for legacy display, but we'll merge them.
  const enrolledCourseLessons = React.useMemo(() => {
    return courses
      .filter(course => enrolledCourseIds.includes(course.id))
      .flatMap(course => course.lessons)
  }, [courses, enrolledCourseIds])

  const [activeTab, setActiveTab] = React.useState("اکسپلور")

  React.useEffect(() => {
    const handleTabChange = () => {
      const tab = localStorage.getItem('english-app-active-tab')
      if (tab) setActiveTab(tab)
    }
    handleTabChange()
    window.addEventListener('tab-changed', handleTabChange)
    return () => window.removeEventListener('tab-changed', handleTabChange)
  }, [])

  return (
    <AppShell topBar={null}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${viewMode}`}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden"
        >
          {/* Main Content */}
          <div className="flex-1 w-full relative flex flex-col">
            {viewMode === 'feed' ? (
               <VerticalLessonFeed
                  lessons={enrolledCourseLessons}
               />
            ) : (
               <ExplorerGridView
                  lessonFeed={lessonFeed}
                  courses={courses}
                  onExploreLesson={(lessonId) => {
                      setViewMode('feed')
                      setTimeout(() => {
                          const el = document.getElementById(`lesson-container-${lessonId}`);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                  }}
               />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {isClient && <LessonCompletionModal open={showCompletionModal} onOpenChange={setShowCompletionModal} />}
    </AppShell>
  )
}
