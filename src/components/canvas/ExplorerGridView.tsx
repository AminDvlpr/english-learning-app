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
    <div className="flex-1 w-full bg-background p-3 flex flex-col overflow-y-auto">
      <div className="w-full flex flex-col gap-4 pb-20">
        <div className="flex flex-col gap-2 mb-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Explore Path</h1>
                <p className="text-muted-foreground text-sm mt-1">Discover interactive stories and puzzles.</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 flex-1">
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
                    <h3 className="text-sm font-bold text-white mb-1 leading-tight">
                        {lesson.title}
                    </h3>
                    <p className="text-white/80 text-xs font-medium">
                        {lesson.blocks.length} blocks
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="absolute bottom-4 left-0 right-0 px-4 z-10 flex justify-center">
        <Button size="lg" onClick={() => onExploreLesson(activeLessonId)} className="w-full max-w-sm gap-2 shadow-xl rounded-full h-14 text-base font-semibold">
            <PlaySquare className="w-5 h-5" />
            Unlock Exploring More
        </Button>
      </div>
    </div>
  )
}
