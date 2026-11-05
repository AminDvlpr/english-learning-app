"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLearnerStore } from "@/store/useLearnerStore"
import { useGamificationStore } from "@/store/useGamificationStore"
import { motion } from "framer-motion"
import { Target, TrendingUp, Zap, Clock, Brain, ListChecks, MessageSquare, FastForward } from "lucide-react"

export function MasteryAnalyticsCard() {
  const { masteryScore, currentDifficulty, blockStates } = useLearnerStore()
  const { activeTimeTodaySec } = useGamificationStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const activeMinutes = Math.floor(activeTimeTodaySec / 60)
  const streakGoalMinutes = 10


  // Calculate first try accuracy from block states (checkpoints only)
  let firstTryCount = 0
  let totalCheckpointsAttempted = 0
  Object.values(blockStates).forEach(state => {
      if (state.attempts && state.attempts.length > 0) {
          totalCheckpointsAttempted++
          if (state.attempts[0].isCorrect) {
              firstTryCount++
          }
      }
  })
  const accuracy = totalCheckpointsAttempted > 0 ? Math.round((firstTryCount / totalCheckpointsAttempted) * 100) : 0

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm shadow-sm" dir="rtl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          پروفایل و میدان نبرد
        </CardTitle>
        <CardDescription>آمار عملکرد زنده شما بر اساس درس‌های اخیر</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Mastery Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="flex items-center gap-2 font-medium text-muted-foreground">
               <Target className="w-4 h-4" /> تسلط کلی
            </span>
            <span className="font-bold text-lg" dir="ltr">{Math.round(masteryScore * 100)}%</span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${masteryScore * 100}%` }}
              transition={{ duration: 1, type: "tween" }}
            />
          </div>
        </div>

        {/* First-Try Accuracy */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="flex items-center gap-2 font-medium text-muted-foreground">
               <Zap className="w-4 h-4 text-warning" /> دقت در اولین تلاش
            </span>
            <span className="font-bold text-lg" dir="ltr">{accuracy}%</span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
             <motion.div
              className="h-full bg-warning"
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 1, type: "tween" }}
            />
          </div>
        </div>

        {/* Daily Active Time */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="flex items-center gap-2 font-medium text-muted-foreground">
               <Clock className="w-4 h-4 text-sky-500" /> زمان مطالعه روزانه
            </span>
            <span className="font-bold text-sm" dir="ltr">
                <span className={activeMinutes >= streakGoalMinutes ? "text-success" : ""}>{activeMinutes}</span> / {streakGoalMinutes} min
            </span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
             <motion.div
              className={`h-full ${activeMinutes >= streakGoalMinutes ? "bg-success" : "bg-sky-500"}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((activeMinutes / streakGoalMinutes) * 100, 100)}%` }}
              transition={{ duration: 1, type: "tween" }}
            />
          </div>
        </div>

        {/* Current Adaptive Tier */}
        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
           <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
             <Brain className="w-4 h-4 text-primary" /> سطح دشواری
           </span>
           <span className="px-3 py-1 bg-secondary rounded-full text-xs font-semibold capitalize tracking-wide">
             {currentDifficulty === 'beginner' ? 'مبتدی' : currentDifficulty === 'intermediate' ? 'متوسط' : 'پیشرفته'}
           </span>
        </div>

        {/* Skill Breakdown */}
        <div className="pt-2">
          <h4 className="text-sm font-semibold mb-3">تحلیل مهارت‌ها</h4>
          <div className="space-y-3">
             <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                   <MessageSquare className="w-4 h-4 text-muted-foreground" /> مکالمات
                </span>
                <span className="font-medium text-success">عالی</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                   <ListChecks className="w-4 h-4 text-muted-foreground" /> یادآوری لغات
                </span>
                <span className="font-medium">متوسط</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                   <FastForward className="w-4 h-4 text-muted-foreground" /> سرعت واکنش
                </span>
                <span className="font-medium text-warning">نیاز به تمرین</span>
             </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
