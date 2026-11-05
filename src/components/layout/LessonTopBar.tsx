"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { X, Flame, Heart, Volume2, VolumeX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StreakPopover, HeartRecoveryModal } from "../gamification"
import { useGamificationStore } from "@/store/useGamificationStore"
import { Gem, Cloud, HardDrive, PenTool, LayoutDashboard } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { audioFeedback } from "@/lib/audio-feedback"
import { AuthModal } from "@/components/auth/AuthModal"
import { isSupabaseConfigured } from "@/lib/supabase/client"

export interface LessonTopBarProps {
  title: string
  progress: number
  streak?: number
  hearts?: number
  onClose?: () => void
  children?: React.ReactNode
}

export function LessonTopBar({
  // title is kept in type but not used in UI to save space
  progress,
  onClose,
  children,
}: LessonTopBarProps) {
  const [isMuted, setIsMuted] = React.useState(false)
  const { streakDays, hearts, gems, checkHeartRegeneration } = useGamificationStore()
  const [heartModalOpen, setHeartModalOpen] = React.useState(false)
  const [authModalOpen, setAuthModalOpen] = React.useState(false)

  const isCloud = isSupabaseConfigured()

  React.useEffect(() => {
    const interval = setInterval(checkHeartRegeneration, 60000);
    checkHeartRegeneration();
    return () => clearInterval(interval);
  }, [checkHeartRegeneration])

  React.useEffect(() => {
    setIsMuted(audioFeedback.isMuted())
  }, [])

  const handleToggleMute = () => {
    const newMutedState = audioFeedback.toggleMute()
    setIsMuted(newMutedState)
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-14 md:h-16 items-center justify-between max-w-4xl mx-auto px-2 md:px-4">

        {/* Left: Close, Nav, View Switcher */}
        <div className="flex items-center gap-1">
          {onClose && (
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose} aria-label="Close lesson">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground" title="Dashboard">
               <LayoutDashboard className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/builder">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground" title="Builder">
               <PenTool className="h-4 w-4" />
            </Button>
          </Link>
          {children}
        </div>

        {/* Center: Progress Bar */}
        <div className="flex-1 flex justify-center max-w-[100px] w-full px-2">
          <Progress value={progress} className="w-full h-2" indicatorClassName="bg-success" />
        </div>

        {/* Right: Stats (Streak, Hearts, Audio Toggle) */}
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setAuthModalOpen(true)} aria-label="Account Sync">
            {isCloud ? (
               <Cloud className="h-4 w-4 text-success" />
            ) : (
               <HardDrive className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>

          <StreakPopover>
            <motion.div
              key={streakDays}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1 text-warning font-bold cursor-pointer hover:opacity-80 text-sm"
            >
              <Flame className="h-4 w-4 fill-warning text-warning" />
              <span>{streakDays}</span>
            </motion.div>
          </StreakPopover>
          <motion.div
            key={hearts}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-1 text-destructive font-bold cursor-pointer hover:opacity-80 text-sm"
            onClick={() => setHeartModalOpen(true)}
          >
            <Heart className="h-4 w-4 fill-destructive text-destructive" />
            <span>{hearts}</span>
          </motion.div>
          <motion.div
            key={gems}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-1 text-info font-bold text-sm"
          >
            <Gem className="h-4 w-4 fill-sky-500/25 text-sky-500" />
            <span>{gems}</span>
          </motion.div>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleToggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

      </div>
      <HeartRecoveryModal open={heartModalOpen} onOpenChange={setHeartModalOpen} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </motion.header>
  )
}
