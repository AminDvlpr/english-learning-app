"use client"

import * as React from "react"
import { CourseDocument, CourseLesson, CourseSlide } from "@/types/course"
import { LessonBlock } from "@/types/lesson"
import { SmartLessonRenderer } from "@/components/canvas/SmartLessonRenderer"
import { BlockEditorForm } from "./BlockEditorForm"
import { JsonSchemaInspector } from "./JsonSchemaInspector"
import { Button } from "@/components/ui/button"
import { Save, Plus, Trash2, } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useCourseStore } from "@/store/useCourseStore"
import { useLearnerStore } from "@/store/useLearnerStore"

// Mock mapper for the preview
function mapCourseSlideToMockBlock(slide: CourseSlide): LessonBlock {
  if (slide.format === 'play' || slide.format === 'watch' || slide.format === 'listen') {
    return {
      blockId: slide.id,
      order: slide.order,
      type: 'motion_canvas',
      motionSceneId: slide.format === 'play' ? 'amin_sara_scene' : 'video_scene',
      assetPath: '',
      maxContinuousDurationSec: slide.videoDurationSec || 60,
    } as LessonBlock
  }

  return {
    blockId: slide.id,
    order: slide.order,
    type: 'heading_intro',
    title: slide.title || 'Slide',
    subtitle: slide.notionHeader?.quoteBarText || '',
    topicTag: slide.chapterBadge || 'General',
    iconIdentifier: 'info',
    estimatedDuration: 1
  } as LessonBlock
}

export function LessonBuilderStudio() {
  const { courses, saveCourseToSharedFolder, syncCoursesFromApi } = useCourseStore()

  const [activeCourseId, setActiveCourseId] = React.useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = React.useState<string | null>(null)
  const [activeSlideId, setActiveSlideId] = React.useState<string | null>(null)

  const [localCourse, setLocalCourse] = React.useState<CourseDocument | null>(null)

  const initializeLesson = useLearnerStore(state => state.initializeLesson)

  React.useEffect(() => {
    syncCoursesFromApi()
  }, [syncCoursesFromApi])

  React.useEffect(() => {
    if (courses.length > 0 && !activeCourseId) {
      handleSelectCourse(courses[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, activeCourseId])

  const handleSelectCourse = (id: string) => {
    const course = courses.find(c => c.id === id)
    if (course) {
      setActiveCourseId(course.id)
      setLocalCourse(JSON.parse(JSON.stringify(course)))
      setActiveLessonId(course.lessons[0]?.id || null)
      setActiveSlideId(course.lessons[0]?.slides[0]?.id || null)
    }
  }

  const handleCreateNewCourse = () => {
    const newCourse: CourseDocument = {
      id: `course_${Date.now()}`,
      slug: `course-${Date.now()}`,
      titleFa: 'New Course',
      titleEn: 'New Course',
      descriptionFa: 'Course Description',
      levelRange: 'A1-A2',
      coverEmoji: '🆕',
      coverGradient: 'linear-gradient(to right, #ccc, #eee)',
      lessons: []
    }
    setActiveCourseId(newCourse.id)
    setLocalCourse(newCourse)
    setActiveLessonId(null)
    setActiveSlideId(null)
  }

  const handleAddLesson = () => {
    if (!localCourse) return
    const newLesson: CourseLesson = {
      id: `lesson_${Date.now()}`,
      courseId: localCourse.id,
      order: localCourse.lessons.length + 1,
      chapterNumber: 1,
      chapterTitleFa: 'New Chapter',
      title: 'New Lesson',
      subtitleFa: 'Lesson Subtitle',
      level: 'A1',
      coverEmoji: '📝',
      coverGradient: 'linear-gradient(to right, #ccc, #eee)',
      formatTags: ['read'],
      estimatedMinutes: 5,
      slides: [],
      summaryStash: {
        lessonId: `lesson_${Date.now()}`,
        courseId: localCourse.id,
        lessonTitle: 'New Lesson',
        keyPhrases: [],
        takeawayFa: ''
      }
    }
    const updated = { ...localCourse, lessons: [...localCourse.lessons, newLesson] }
    setLocalCourse(updated)
    setActiveLessonId(newLesson.id)
  }

  const handleAddSlide = () => {
    if (!localCourse || !activeLessonId) return
    const newSlide: CourseSlide = {
      id: `slide_${Date.now()}`,
      order: 1,
      format: 'read',
      title: 'New Slide',
      chapterBadge: 'Chapter 1',
      deepDives: [],
      interrupts: []
    }
    const updated = {
      ...localCourse,
      lessons: localCourse.lessons.map(l => {
        if (l.id === activeLessonId) {
          return { ...l, slides: [...l.slides, { ...newSlide, order: l.slides.length + 1 }] }
        }
        return l
      })
    }
    setLocalCourse(updated)
    setActiveSlideId(newSlide.id)
  }

  const handleSlideChange = (updatedSlide: CourseSlide) => {
    if (!localCourse || !activeLessonId) return
    const updated = {
      ...localCourse,
      lessons: localCourse.lessons.map(l => {
        if (l.id === activeLessonId) {
          return {
            ...l,
            slides: l.slides.map(s => s.id === updatedSlide.id ? updatedSlide : s)
          }
        }
        return l
      })
    }
    setLocalCourse(updated)
  }

  const handleDeleteSlide = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!localCourse || !activeLessonId) return
    const updated = {
      ...localCourse,
      lessons: localCourse.lessons.map(l => {
        if (l.id === activeLessonId) {
          return { ...l, slides: l.slides.filter(s => s.id !== slideId).map((s, i) => ({ ...s, order: i + 1 })) }
        }
        return l
      })
    }
    setLocalCourse(updated)
    if (activeSlideId === slideId) setActiveSlideId(null)
  }

  const handleSaveCourse = async () => {
    if (!localCourse) return
    try {
      await saveCourseToSharedFolder(localCourse)
      alert(`Saved to src/data/courses/${localCourse.id}.json`)
    } catch {
      alert("Error saving course")
    }
  }

  const activeLesson = localCourse?.lessons.find(l => l.id === activeLessonId)
  const activeSlide = activeLesson?.slides.find(s => s.id === activeSlideId)

  // Update mock renderer when active lesson changes
  const previewBlocks = React.useMemo(() => {
    if (!activeLesson) return []
    return activeLesson.slides.map(mapCourseSlideToMockBlock)
  }, [activeLesson])

  React.useEffect(() => {
    if (previewBlocks.length > 0) {
      initializeLesson('preview', previewBlocks)
    }
  }, [previewBlocks, initializeLesson])

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full p-4 w-full">
      {/* Left Pane: Editor */}
      <div className="w-full md:w-1/2 flex flex-col gap-6 overflow-y-auto pr-2">
        <JsonSchemaInspector course={localCourse} setCourse={setLocalCourse} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Course Architecture</CardTitle>
            <Button size="sm" onClick={handleSaveCourse} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Save className="h-4 w-4 mr-2" /> Save to Shared Courses Directory
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">

            <div className="flex items-center gap-2">
              <select
                className="flex-1 p-2 border rounded-md font-medium"
                value={activeCourseId || ''}
                onChange={(e) => handleSelectCourse(e.target.value)}
              >
                <option value="" disabled>Select Course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.titleEn}</option>
                ))}
              </select>
              <Button variant="outline" onClick={handleCreateNewCourse}>
                <Plus className="h-4 w-4 mr-1"/> New Course
              </Button>
            </div>

            {localCourse && (
              <div className="space-y-4 mt-2">
                <div className="flex gap-2 border-b pb-2 overflow-x-auto">
                  {localCourse.lessons.map(lesson => (
                    <Button
                      key={lesson.id}
                      variant={activeLessonId === lesson.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveLessonId(lesson.id)}
                    >
                      {lesson.title}
                    </Button>
                  ))}
                  <Button variant="ghost" size="sm" onClick={handleAddLesson}><Plus className="h-4 w-4 mr-1"/> Lesson</Button>
                </div>

                {activeLesson && (
                  <div className="flex flex-col gap-2">
                    {activeLesson.slides.map((slide, index) => (
                      <div
                        key={slide.id}
                        onClick={() => setActiveSlideId(slide.id)}
                        className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${activeSlideId === slide.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono w-4">{index + 1}</span>
                          <div>
                            <div className="font-medium text-sm capitalize">{slide.format} Slide</div>
                            <div className="text-xs text-muted-foreground">{slide.title || slide.id}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDeleteSlide(slide.id, e)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddSlide} className="mt-2 w-fit">
                      <Plus className="h-4 w-4 mr-1"/> Add Slide
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {activeSlide && (
          <BlockEditorForm
            slide={activeSlide}
            onChange={handleSlideChange}
          />
        )}
      </div>

      {/* Right Pane: Live Preview */}
      <div className="w-full md:w-1/2 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)]">
        <div className="p-4 border-b bg-muted/50 flex justify-between items-center shrink-0">
          <h2 className="font-semibold">Live Preview</h2>
          <Button variant="secondary" size="sm" onClick={() => initializeLesson('preview', previewBlocks)}>
            Reset State
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50 relative">
           {/* Fallback mock renderer for track 4 components */}
           {previewBlocks.length > 0 ? (
             <SmartLessonRenderer lesson={previewBlocks} />
           ) : (
             <div className="h-full flex items-center justify-center text-muted-foreground">Select a slide to preview</div>
           )}
        </div>
      </div>
    </div>
  )
}
