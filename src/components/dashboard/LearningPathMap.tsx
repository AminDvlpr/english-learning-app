"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getLearningPaths, LearningPath } from "@/data/curriculum-paths"
import { useLearnerStore } from "@/store/useLearnerStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, CheckCircle2, Lock, Clock, Layers } from "lucide-react"
import Link from "next/link"

// Simple SVG Ring Component
const ProgressRing = ({ progress }: { progress: number }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
        <circle
          className="text-muted/30"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="22"
          cy="22"
        />
        <motion.circle
          className="text-success"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="22"
          cy="22"
        />
      </svg>
      <span className="absolute text-[10px] font-bold">{Math.round(progress)}%</span>
    </div>
  )
}

export function LearningPathMap() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const { currentLessonId, masteryScore } = useLearnerStore()

  useEffect(() => {
    setPaths(getLearningPaths())
  }, [])

  return (
    <div className="space-y-8">
      {paths.map((path) => (
        <div key={path.id} className="space-y-4">
          <div className="px-1">
            <h2 className="text-xl font-bold tracking-tight">{path.title}</h2>
            <p className="text-sm text-muted-foreground">{path.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* Connecting line for visual structure */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border hidden md:block" />

            {path.lessons.map((lesson, lessonIndex) => {
              const isCurrentLesson = currentLessonId === lesson.id
              const isMastered = isCurrentLesson && masteryScore >= 0.8
              const progress = isCurrentLesson ? masteryScore * 100 : 0
              const isLocked = !isCurrentLesson && lessonIndex > 0 && !path.lessons[lessonIndex-1].isCustom && currentLessonId !== path.lessons[lessonIndex-1].id

              return (
                <Card
                  key={lesson.id}
                  className={`relative overflow-hidden transition-all hover:shadow-md ${isLocked ? 'opacity-70 bg-muted/50' : 'bg-card'}`}
                >
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        {lesson.title}
                        {lesson.isCustom && <Badge variant="secondary" className="text-[10px]">Custom</Badge>}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.estimatedTimeMin}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" /> {lesson.blockCount} blocks
                        </span>
                      </CardDescription>
                    </div>
                    <ProgressRing progress={progress} />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mt-2">
                       <Badge
                          variant={lesson.difficulty === 'beginner' ? 'default' : lesson.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
                          className="capitalize"
                       >
                         {lesson.difficulty}
                       </Badge>

                       {isLocked ? (
                          <Button variant="outline" size="sm" disabled className="gap-2">
                            <Lock className="w-4 h-4" /> Locked
                          </Button>
                       ) : isMastered ? (
                          <Button variant="default" size="sm" className="gap-2 bg-success text-success-foreground hover:bg-success/90" asChild>
                            <Link href="/">
                              <CheckCircle2 className="w-4 h-4" /> Review
                            </Link>
                          </Button>
                       ) : (
                          <Button variant="default" size="sm" className="gap-2" asChild>
                             <Link href="/">
                               <Play className="w-4 h-4" /> {progress > 0 ? "Continue" : "Start"}
                             </Link>
                          </Button>
                       )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
