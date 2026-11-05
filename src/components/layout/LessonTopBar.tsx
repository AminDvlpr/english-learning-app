"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Flame } from "lucide-react"

import { StreakPopover, HeartRecoveryModal } from "../gamification"
import { useGamificationStore } from "@/store/useGamificationStore"
import { Gem } from "lucide-react"
import { AuthModal } from "@/components/auth/AuthModal"

export interface LessonTopBarProps {
  title: string
  progress: number
  streak?: number
  hearts?: number
  onClose?: () => void
}

export function LessonTopBar({}: LessonTopBarProps) {
  const { streakDays, checkHeartRegeneration, gems } = useGamificationStore()
  const [heartModalOpen, setHeartModalOpen] = React.useState(false)
  const [authModalOpen, setAuthModalOpen] = React.useState(false)

  const [userName, setUserName] = React.useState("کاربر مهمان")

  React.useEffect(() => {
    const savedName = localStorage.getItem('english-app-user-name')
    if (savedName) setUserName(savedName)
  }, [])

  React.useEffect(() => {
    const interval = setInterval(checkHeartRegeneration, 60000);
    checkHeartRegeneration();
    return () => clearInterval(interval);
  }, [checkHeartRegeneration])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      dir="rtl"
    >
      <div className="flex h-16 items-center justify-between px-4 w-full">

        {/* Right: User Avatar & Info */}
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 shrink-0">
             <span className="font-bold text-primary">{userName.substring(0, 1)}</span>
          </div>
          <div className="flex flex-col text-right">
             <span className="text-sm font-bold truncate max-w-[100px] leading-tight">{userName}</span>
             <span className="text-[10px] text-muted-foreground font-medium">سطح ۱</span>
          </div>
        </div>

        {/* Center: Streak and Gems */}
        <div className="flex items-center gap-3 justify-center w-1/3">
          <StreakPopover>
            <motion.div
              key={streakDays}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1 text-warning font-bold cursor-pointer hover:opacity-80 text-sm"
              dir="ltr"
            >
              <Flame className="h-4 w-4 fill-warning text-warning" />
              <span>{streakDays}</span>
            </motion.div>
          </StreakPopover>
          <motion.div
            key={gems}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-1 text-sky-500 font-bold text-sm"
            dir="ltr"
          >
            <Gem className="h-4 w-4 fill-sky-500/20 text-sky-500" />
            <span>{gems}</span>
          </motion.div>
        </div>

        {/* Left: Level Pill */}
        <div className="flex items-center gap-2 justify-end w-1/3">
          <div className="bg-indigo-600 text-white font-black px-3.5 py-1 rounded-xl border-2 border-neutral-900 shadow-[2px_2px_0px_#171717] text-xs tracking-wider" dir="ltr">
             LEVEL 1
          </div>
        </div>

      </div>
      <HeartRecoveryModal open={heartModalOpen} onOpenChange={setHeartModalOpen} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </motion.header>
  )
}
