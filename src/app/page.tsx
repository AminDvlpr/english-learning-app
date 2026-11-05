"use client"

import * as React from "react"
import { AppShell } from "@/components/layout/AppShell"
import { LessonTopBar } from "@/components/layout/LessonTopBar"
import { lessonFeed } from "@/data/lesson-feed"
import { useLearnerStore } from "@/store/useLearnerStore"
import { useCourseStore } from "@/store/useCourseStore"
import { useGamificationStore } from "@/store/useGamificationStore"
import { LessonCompletionModal } from "@/components/gamification"
import { startSyncService, stopSyncService } from "@/lib/supabase/sync-service"
import { VerticalLessonFeed } from "@/components/canvas/VerticalLessonFeed"
import { ExplorerGridView } from "@/components/canvas/ExplorerGridView"
import { LayoutGrid, ScrollText } from "lucide-react"

export default function Home() {
  const [isClient, setIsClient] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'feed' | 'explorer'>('feed')

  React.useEffect(() => { setIsClient(true) }, [])

  const xp = useGamificationStore(state => state.xp)
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

  return (
    <AppShell
      topBar={
        <LessonTopBar
          title="English Learning Feed"
          progress={Math.min(100, xp)}
        >
          {isClient && (
            <div className="flex bg-background/80 backdrop-blur border border-border rounded-full p-0.5 ml-1">
               <button
                  onClick={() => setViewMode('feed')}
                  className={`p-1.5 rounded-full transition-colors ${viewMode === 'feed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Story Feed View"
               >
                  <ScrollText className="w-4 h-4" />
               </button>
               <button
                  onClick={() => setViewMode('explorer')}
                  className={`p-1.5 rounded-full transition-colors ${viewMode === 'explorer' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Explorer Grid View"
               >
                  <LayoutGrid className="w-4 h-4" />
               </button>
            </div>
          )}
        </LessonTopBar>
      }
    >
      <div className="relative w-full h-full flex flex-col flex-1">
        {/* Main Content */}
        <div className="flex-1 w-full relative flex flex-col">
          {viewMode === 'feed' ? (
             <VerticalLessonFeed
                lessonFeed={lessonFeed}
                lessons={enrolledCourseLessons.length > 0 ? enrolledCourseLessons : undefined}
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
      </div>

      {isClient && <LessonCompletionModal open={showCompletionModal} onOpenChange={setShowCompletionModal} />}
    </AppShell>
  )
}
