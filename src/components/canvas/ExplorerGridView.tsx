"use client"

import React, { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FeedLesson } from "@/data/lesson-feed"
import { useCourseStore } from "@/store/useCourseStore"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseDocument } from "@/types/course"

interface ExplorerGridViewProps {
  lessonFeed: FeedLesson[]
  courses?: CourseDocument[] // Pass from page.tsx
  onExploreLesson: (lessonId: string) => void
}

type TabType = 'همه' | 'داستانی' | 'ویدیویی' | 'صوتی' | 'دوره‌های من'

const TABS: { id: TabType; label: string }[] = [
  { id: 'همه', label: 'همه' },
  { id: 'داستانی', label: 'داستانی' },
  { id: 'ویدیویی', label: 'ویدیویی' },
  { id: 'صوتی', label: 'صوتی' },
  { id: 'دوره‌های من', label: 'دوره‌های من' },
]

const getGradientProps = (gradient?: string) => {
  if (!gradient) return { className: 'bg-gradient-to-br from-indigo-500 to-purple-600' };
  if (gradient.includes('linear-gradient') || gradient.includes('radial-gradient') || gradient.startsWith('#') || gradient.startsWith('rgb')) {
    return { className: '', style: { background: gradient } };
  }
  return { className: gradient };
};

export function ExplorerGridView({ courses = [], onExploreLesson }: ExplorerGridViewProps) {
  const { enrolledCourseIds, enrollInCourse } = useCourseStore()

  const [activeTab, setActiveTab] = useState<TabType>('همه')
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

      {/* 5-Tab Bar (Sticky Glassmorphism) */}
      <div className="sticky top-3 z-30 mx-3 my-2 px-2 py-1.5 rounded-2xl bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar" dir="rtl">
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
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-24 custom-scrollbar">
        <div className="grid grid-cols-2 auto-rows-[145px] gap-2 mt-2" dir="rtl">
          {allCourseLessons
            .filter(lesson => {
               if (activeTab === 'همه') return true;
               if (activeTab === 'دوره‌های من') return enrolledCourseIds.includes(lesson.courseId);
               if (activeTab === 'داستانی') return lesson.formatTags.includes('read') || lesson.formatTags.includes('play');
               if (activeTab === 'ویدیویی') return lesson.formatTags.includes('watch');
               if (activeTab === 'صوتی') return lesson.formatTags.includes('listen');
               return true;
            })
            .map((lesson) => {
            const isEnrolled = enrolledCourseIds.includes(lesson.courseId)
            const spanClass = isEnrolled ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
            const cleanTitle = lesson.title.replace(/\s*\([^)]*\)/g, '').trim();

            return (
              <motion.div
                key={lesson.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLessonTap(lesson.id, lesson.courseId, true)}
                className={`relative rounded-xl overflow-hidden border border-border cursor-pointer flex flex-col bg-card ${spanClass}`}
              >
                <div {...getGradientProps(lesson.coverGradient)} className={`flex-1 flex items-center justify-center ${isEnrolled ? 'text-6xl' : 'text-4xl'} ${getGradientProps(lesson.coverGradient).className}`}>
                  {lesson.coverEmoji}
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur">
                  {isEnrolled ? "در حال یادگیری ✨" : "ثبت‌نام رایگان"}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-1">
                  <h3 className={`${isEnrolled ? 'text-sm' : 'text-xs'} font-bold text-white leading-tight line-clamp-2 text-right`} dir="rtl">{cleanTitle}</h3>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

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
                className="w-full rounded-2xl h-14 text-lg font-bold bg-amber-500 text-black shadow-lg"
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                شروع (+۱ سطح)
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
