import * as React from "react"
import { motion } from "framer-motion"
import { HeadingIntroBlock as HeadingIntroBlockType } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Clock, Coffee, BookOpen } from "lucide-react" // Or whatever icons are appropriate based on iconIdentifier
import { BlockLearnerState } from "@/types/lesson"
import type { Variants } from "framer-motion"

interface HeadingIntroBlockProps {
  block: HeadingIntroBlockType
  state?: BlockLearnerState
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

export function HeadingIntroBlock({ block }: HeadingIntroBlockProps) {
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
    <div className="flex flex-col gap-6 p-6 bg-transparent text-card-foreground">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border-none rounded-sm font-medium tracking-wide">
            {block.topicTag}
          </Badge>

          <motion.h1
            className="text-4xl font-serif font-bold tracking-tight text-foreground flex flex-wrap gap-x-2"
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

          <p className="text-xl text-muted-foreground font-sans leading-relaxed">{block.subtitle}</p>
        </div>

        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0">
          {getIcon(block.iconIdentifier)}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-500 font-sans">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{block.estimatedDuration} min read</span>
        </div>
        <Badge variant="outline" className="capitalize border-slate-200 dark:border-slate-800 font-normal">
          {block.difficultyLevel}
        </Badge>
      </div>
    </div>
  )
}
