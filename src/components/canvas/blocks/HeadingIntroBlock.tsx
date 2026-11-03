import * as React from "react"
import { motion } from "framer-motion"
import { HeadingIntroBlock as HeadingIntroBlockType } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Coffee, BookOpen } from "lucide-react" // Or whatever icons are appropriate based on iconIdentifier
import { useLearnerStore } from "@/store/useLearnerStore"
import { BlockLearnerState } from "@/types/lesson"
import type { Variants } from "framer-motion"

interface HeadingIntroBlockProps {
  block: HeadingIntroBlockType
  state: BlockLearnerState
}

const getIcon = (identifier: string) => {
  switch (identifier) {
    case 'coffee':
      return <Coffee className="w-6 h-6 text-primary" />
    case 'book':
      return <BookOpen className="w-6 h-6 text-primary" />
    default:
      return <BookOpen className="w-6 h-6 text-primary" />
  }
}

export function HeadingIntroBlock({ block, state }: HeadingIntroBlockProps) {
  const completeContentBlock = useLearnerStore(s => s.completeContentBlock)
  const isCompleted = state === 'completed'
  const isActive = state === 'active'

  // Staggered words for title
  const words = block.title.split(" ")

  const wordVariants: Variants = {
    initial: { y: "100%" },
    animate: {
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            {block.topicTag}
          </Badge>

          <motion.h1
            className="text-3xl font-bold tracking-tight text-foreground flex flex-wrap gap-x-2"
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {words.map((word, i) => (
              <span key={i} className="overflow-hidden inline-block">
                <motion.span variants={wordVariants} className="inline-block">
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <p className="text-lg text-muted-foreground">{block.subtitle}</p>
        </div>

        <div className="p-4 bg-primary/10 rounded-full shrink-0">
          {getIcon(block.iconIdentifier)}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{block.estimatedDuration} min read</span>
        </div>
        <Badge variant="outline" className="capitalize">
          {block.difficultyLevel}
        </Badge>
      </div>

      {isActive && (
        <Button
          className="mt-4 w-full sm:w-auto self-start"
          onClick={() => completeContentBlock(block.blockId)}
        >
          Continue / مطالعه شد و ادامه (+5 XP)
        </Button>
      )}

      {isCompleted && (
        <div className="mt-4 w-full sm:w-auto self-start px-4 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium text-center">
          Completed
        </div>
      )}
    </div>
  )
}
