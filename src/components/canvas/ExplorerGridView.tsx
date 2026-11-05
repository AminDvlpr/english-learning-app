"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { FeedLesson } from "@/data/lesson-feed"
import { useLearnerStore } from "@/store/useLearnerStore"
import { Lock, Unlock, PlaySquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ExplorerGridViewProps {
  lessonFeed: FeedLesson[]
  onExploreLesson: (lessonId: string) => void
}

export function ExplorerGridView({ lessonFeed, onExploreLesson }: ExplorerGridViewProps) {
  const blockStates = useLearnerStore(state => state.blockStates)

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

  // Determine which lesson is currently active (first unmastered, or last if all mastered)
  const activeLessonId = useMemo(() => {
    for (const lesson of lessonFeed) {
      if (!masteredMap[lesson.id]) {
        return lesson.id;
      }
    }
    return lessonFeed[lessonFeed.length - 1].id;
  }, [lessonFeed, masteredMap])


  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-background p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Explore Path</h1>
                <p className="text-muted-foreground mt-1">Discover interactive stories and puzzles.</p>
            </div>
            <Button size="lg" onClick={() => onExploreLesson(activeLessonId)} className="gap-2 shrink-0">
                <PlaySquare className="w-5 h-5" />
                Unlock Exploring More
            </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessonFeed.map((lesson, index) => {
            const isMastered = masteredMap[lesson.id];

            // It's unlocked if it's mastered OR if the previous one is mastered (or it's the first)
            const isUnlocked = index === 0 || masteredMap[lessonFeed[index - 1].id];

            return (
              <motion.div
                key={lesson.id}
                whileHover={isUnlocked ? { scale: 1.02 } : {}}
                whileTap={isUnlocked ? { scale: 0.98 } : {}}
                onClick={() => isUnlocked && onExploreLesson(lesson.id)}
                className={`relative rounded-xl overflow-hidden aspect-[4/5] border ${isUnlocked ? 'cursor-pointer border-border hover:border-primary/50' : 'cursor-not-allowed border-border/50 opacity-80'}`}
              >
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${lesson.coverArtwork})` }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-2">
                      {lesson.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-background/80 backdrop-blur text-foreground border-none">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {isMastered ? (
                        <div className="bg-primary/90 text-primary-foreground p-2 rounded-full backdrop-blur">
                            <Unlock className="w-4 h-4" />
                        </div>
                    ) : !isUnlocked ? (
                        <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur">
                            <Lock className="w-4 h-4" />
                        </div>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                        {lesson.title}
                    </h3>
                    <p className="text-white/80 text-sm font-medium">
                        {lesson.blocks.length} interactive blocks
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
