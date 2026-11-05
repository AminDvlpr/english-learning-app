"use client"

import React, { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FeedLesson } from "@/data/lesson-feed"
import { useLearnerStore } from "@/store/useLearnerStore"
import { useCourseStore } from "@/store/useCourseStore"
import { Lock, Unlock, PlaySquare, Compass, Play, Headphones, Tv, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CourseDocument } from "@/types/course"

interface ExplorerGridViewProps {
  lessonFeed: FeedLesson[]
  courses?: CourseDocument[] // Pass from page.tsx
  onExploreLesson: (lessonId: string) => void
}

type TabType = 'For You' | 'Explore' | 'Play' | 'Listen' | 'Watch'

const TABS: { id: TabType; icon: React.ReactNode; label: string }[] = [
  { id: 'For You', icon: <Compass className="w-4 h-4" />, label: 'For You' },
  { id: 'Explore', icon: <BookOpen className="w-4 h-4" />, label: 'Explore' },
  { id: 'Play', icon: <Play className="w-4 h-4" />, label: 'Play' },
  { id: 'Listen', icon: <Headphones className="w-4 h-4" />, label: 'Listen' },
  { id: 'Watch', icon: <Tv className="w-4 h-4" />, label: 'Watch' },
]

const getGradientProps = (gradient?: string) => {
  if (!gradient) return { className: 'bg-gradient-to-br from-indigo-500 to-purple-600' };
  if (gradient.includes('linear-gradient') || gradient.includes('radial-gradient') || gradient.startsWith('#') || gradient.startsWith('rgb')) {
    return { className: '', style: { background: gradient } };
  }
  return { className: gradient };
};

export function ExplorerGridView({ lessonFeed, courses = [], onExploreLesson }: ExplorerGridViewProps) {
  const blockStates = useLearnerStore(state => state.blockStates)
  const { enrolledCourseIds, enrollInCourse } = useCourseStore()

  const [activeTab, setActiveTab] = useState<TabType>('For You')
  const [selectedCourseGate, setSelectedCourseGate] = useState<CourseDocument | null>(null)

  // Memoize all lessons across all courses for the filtered tabs
  const allCourseLessons = useMemo(() => {
    return courses.flatMap(course =>
      course.lessons.map(lesson => ({
        ...lesson,
        courseId: course.id,
        course
      }))
    )
  }, [courses])

  const masteredMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    lessonFeed.forEach(lesson => {
      if (lesson.blocks.length === 0) {
        map[lesson.id] = false;
        return;
      }
      map[lesson.id] = lesson.blocks.every(b => blockStates[b.blockId]?.state === "completed");
    })
    return map;
  }, [lessonFeed, blockStates])

  const activeLessonId = useMemo(() => {
    for (const lesson of lessonFeed) {
      if (!masteredMap[lesson.id]) {
        return lesson.id;
      }
    }
    return lessonFeed[lessonFeed.length - 1]?.id || '';
  }, [lessonFeed, masteredMap])

  const handleLessonTap = (lessonId: string, courseId?: string, isUnlocked = true) => {
    if (courseId && !enrolledCourseIds.includes(courseId)) {
      const course = courses.find(c => c.id === courseId)
      if (course) {
        setSelectedCourseGate(course)
        return
      }
    }

    if (isUnlocked) {
      onExploreLesson(lessonId)
    }
  }

  const handleEnrollAndStart = () => {
    if (selectedCourseGate) {
      enrollInCourse(selectedCourseGate.id)
      setSelectedCourseGate(null)
      onExploreLesson(selectedCourseGate.lessons[0].id)
    }
  }

  return (
    <div className="flex-1 w-full bg-background flex flex-col overflow-hidden relative">

      {/* 5-Tab Bar (Sticky) */}
      <div className="w-full bg-background/95 backdrop-blur-sm z-20 border-b border-border/50 sticky top-0 px-2 py-3 flex gap-1 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full flex-1 overflow-y-auto p-3 flex flex-col gap-4 pb-24">

        {/* TAB CONTENT: For You */}
        {activeTab === 'For You' && (
          <div className="flex flex-col gap-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Your Path</h1>
                <p className="text-muted-foreground text-sm mt-1">Continue where you left off.</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mt-2">
              {lessonFeed.map((lesson, index) => {
                const isMastered = masteredMap[lesson.id];
                const isUnlocked = index === 0 || masteredMap[lessonFeed[index - 1].id];

                return (
                  <motion.div
                    key={lesson.id}
                    whileHover={isUnlocked ? { scale: 1.02 } : {}}
                    whileTap={isUnlocked ? { scale: 0.98 } : {}}
                    onClick={() => handleLessonTap(lesson.id, undefined, isUnlocked)}
                    className={`relative rounded-xl overflow-hidden aspect-[4/5] border bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-900 ${isUnlocked ? 'cursor-pointer border-border hover:border-primary/50' : 'cursor-not-allowed border-border/50 opacity-80'}`}
                  >
                    <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url(${lesson.coverArtwork})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-wrap gap-2">
                          {lesson.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-background/80 backdrop-blur text-foreground border-none text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {isMastered ? (
                            <div className="bg-primary/90 text-primary-foreground p-1.5 rounded-full backdrop-blur">
                                <Unlock className="w-3.5 h-3.5" />
                            </div>
                        ) : !isUnlocked ? (
                            <div className="bg-black/50 text-white p-1.5 rounded-full backdrop-blur">
                                <Lock className="w-3.5 h-3.5" />
                            </div>
                        ) : null}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1 leading-tight">{lesson.title}</h3>
                        <p className="text-white/80 text-[10px] font-medium">{lesson.blocks.length} blocks</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB CONTENT: Explore */}
        {activeTab === 'Explore' && (
          <div className="flex flex-col gap-4">
             <div>
                <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
                <p className="text-muted-foreground text-sm mt-1">Discover new topics and journeys.</p>
            </div>
            {courses.map(course => {
              const isEnrolled = enrolledCourseIds.includes(course.id)
              return (
                <div key={course.id} onClick={() => !isEnrolled && setSelectedCourseGate(course)} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div {...getGradientProps(course.coverGradient)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getGradientProps(course.coverGradient).className}`}>
                      {course.coverEmoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base leading-tight" dir="rtl">{course.titleFa}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{course.titleEn}</p>
                    </div>
                    {isEnrolled ? (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Enrolled</Badge>
                    ) : (
                      <Badge variant="outline">Enroll Now</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="bg-muted px-2 py-1 rounded-md">{course.levelRange}</span>
                    <span className="bg-muted px-2 py-1 rounded-md">{course.lessons.length} Lessons</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* TAB CONTENT: Formats (Play, Listen, Watch) */}
        {['Play', 'Listen', 'Watch'].includes(activeTab) && (
          <div className="flex flex-col gap-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{activeTab} Mode</h1>
                <p className="text-muted-foreground text-sm mt-1">Filter by {activeTab.toLowerCase()} formats.</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mt-2">
              {allCourseLessons
                .filter(l => l.formatTags.includes(activeTab.toLowerCase() as "read" | "watch" | "listen" | "play"))
                .map((lesson) => {
                  const isEnrolled = enrolledCourseIds.includes(lesson.courseId)

                  return (
                    <motion.div
                      key={lesson.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLessonTap(lesson.id, lesson.courseId, true)}
                      className="relative rounded-xl overflow-hidden aspect-square border border-border cursor-pointer flex flex-col"
                    >
                      <div {...getGradientProps(lesson.coverGradient)} className={`flex-1 flex items-center justify-center text-4xl ${getGradientProps(lesson.coverGradient).className}`}>
                         {lesson.coverEmoji}
                      </div>
                      <div className="p-3 bg-card border-t border-border flex flex-col gap-1">
                        <h3 className="text-xs font-bold leading-tight line-clamp-2">{lesson.title}</h3>
                        {!isEnrolled && (
                           <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                              <Lock className="w-3 h-3" /> Requires Enrollment
                           </div>
                        )}
                      </div>
                    </motion.div>
                  )
              })}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Bottom CTA for "For You" only */}
      {activeTab === 'For You' && (
        <div className="absolute bottom-4 left-0 right-0 px-4 z-10 flex justify-center">
          <Button size="lg" onClick={() => onExploreLesson(activeLessonId)} className="w-full max-w-sm gap-2 shadow-xl rounded-full h-14 text-base font-semibold">
              <PlaySquare className="w-5 h-5" />
              Continue Learning
          </Button>
        </div>
      )}

      {/* Unified Course Enrollment Gate (Bottom Sheet) */}
      <AnimatePresence>
        {selectedCourseGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end"
            onClick={() => setSelectedCourseGate(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-background rounded-t-3xl p-6 pb-10 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-2" />

              <div {...getGradientProps(selectedCourseGate.coverGradient)} className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-4xl shadow-sm ${getGradientProps(selectedCourseGate.coverGradient).className}`}>
                {selectedCourseGate.coverEmoji}
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold" dir="rtl">{selectedCourseGate.titleFa}</h2>
                <p className="text-muted-foreground text-sm mt-1">{selectedCourseGate.titleEn}</p>
              </div>

              <p className="text-sm text-center leading-relaxed mt-2" dir="rtl">
                {selectedCourseGate.descriptionFa}
              </p>

              <div className="flex gap-4 justify-center mt-2 mb-4">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold">{selectedCourseGate.lessons.length}</span>
                  <span className="text-xs text-muted-foreground">Lessons</span>
                </div>
                <div className="w-px bg-border" />
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold">{selectedCourseGate.levelRange}</span>
                  <span className="text-xs text-muted-foreground">Level</span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleEnrollAndStart}
                className="w-full rounded-2xl h-14 text-lg font-bold bg-primary text-primary-foreground shadow-lg"
              >
                ثبت‌نام رایگان در این دوره و شروع
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
