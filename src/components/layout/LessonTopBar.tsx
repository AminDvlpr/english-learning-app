"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { X, Flame, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export interface LessonTopBarProps {
  title: string
  progress: number
  streak?: number
  hearts?: number
  onClose?: () => void
}

export function LessonTopBar({
  title,
  progress,
  streak = 0,
  hearts = 5,
  onClose,
}: LessonTopBarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between max-w-4xl mx-auto px-4 md:px-8">

        {/* Left: Close and Title */}
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close lesson">
            <X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Button>
          <h1 className="text-sm md:text-base font-semibold truncate hidden sm:block">
            {title}
          </h1>
        </div>

        {/* Center: Progress Bar */}
        <div className="flex-1 flex justify-center max-w-md w-full px-4">
          <Progress value={progress} className="w-full" indicatorClassName="bg-success" />
        </div>

        {/* Right: Stats (Streak, Hearts) */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="flex items-center gap-1.5 text-warning font-bold">
            <Flame className="h-5 w-5 fill-warning text-warning" />
            <span>{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 text-destructive font-bold">
            <Heart className="h-5 w-5 fill-destructive text-destructive" />
            <span>{hearts}</span>
          </div>
        </div>

      </div>
    </motion.header>
  )
}
