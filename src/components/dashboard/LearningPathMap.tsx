"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getLearningPaths } from "@/data/curriculum-paths"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Lock, Clock } from "lucide-react"
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
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null)

  useEffect(() => {
    getLearningPaths()
  }, [])

  return (
    <div className="space-y-8" dir="rtl">

      <div className="pb-1 border-b-2 border-border/50 mb-2">
        <h2 className="text-xl font-black relative inline-block">
          مسیر یادگیری
          <span className="absolute bottom-1 left-0 w-full h-2.5 bg-amber-300/60 -z-10 rounded-sm"></span>
        </h2>
      </div>

      <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 relative">
            {/* Connecting line for visual structure */}
            <div className="absolute right-6 top-6 bottom-6 w-0.5 bg-border block" />

            {/* Mock Episode 1 - Unlocked */}
            <Card
              className="relative overflow-hidden transition-all shadow-md bg-card border-2 border-primary/20 hover:border-primary/40 cursor-pointer"
              onClick={() => setSelectedEpisode('ep1')}
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 relative z-10">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <span className="text-xl">🎂</span> اپیزود ۱: تولد و دعوا
                  </CardTitle>
                  <CardDescription className="flex items-center gap-3 text-xs pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ۱۵ دقیقه
                    </span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Play className="w-3 h-3 fill-primary" /> در حال پخش
                    </span>
                  </CardDescription>
                </div>
                <ProgressRing progress={45} />
              </CardHeader>
            </Card>

            {/* Mock Episode 2 - Locked */}
            <Card
              className="relative overflow-hidden transition-all opacity-70 bg-muted/30 border-2 border-dashed border-border/50"
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 relative z-10">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-muted-foreground">
                    <span className="text-xl opacity-50">🎨</span> اپیزود ۲: کلاس نقاشی
                  </CardTitle>
                  <CardDescription className="flex items-center gap-3 text-xs pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ۲۰ دقیقه
                    </span>
                  </CardDescription>
                </div>
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/50 text-muted-foreground">
                   <Lock className="w-5 h-5" />
                </div>
              </CardHeader>
            </Card>

            {/* Mock Episode 3 - Locked */}
            <Card
              className="relative overflow-hidden transition-all opacity-70 bg-muted/30 border-2 border-dashed border-border/50"
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 relative z-10">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-muted-foreground">
                    <span className="text-xl opacity-50">🎒</span> اپیزود ۳: مدرسه
                  </CardTitle>
                  <CardDescription className="flex items-center gap-3 text-xs pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ۲۵ دقیقه
                    </span>
                  </CardDescription>
                </div>
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/50 text-muted-foreground">
                   <Lock className="w-5 h-5" />
                </div>
              </CardHeader>
            </Card>
          </div>
      </div>

      {/* Episode Bottom Sheet Modal */}
      {selectedEpisode && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={() => setSelectedEpisode(null)} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative bg-background rounded-t-[32px] p-6 pb-12 shadow-2xl border-t border-border z-10"
          >
             <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-6" />
             <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                <span className="text-3xl">🎂</span> اپیزود ۱: تولد و دعوا
             </h2>
             <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                آشنایی با امین و سارا و شروع رقابت... در این قسمت با مفاهیم اولیه، مکالمات روزمره و جملات کاربردی در مهمانی‌ها آشنا می‌شویم.
             </p>

             <Link href="/">
                <button className="bg-amber-300 hover:bg-amber-400 text-neutral-900 border-2 border-neutral-900 shadow-[3px_3px_0px_#171717] rounded-2xl py-3.5 px-5 flex items-center justify-between w-full font-bold transition-transform active:translate-y-[2px] active:shadow-none">
                   <div className="flex items-center gap-2">
                      <span className="bg-neutral-900 text-amber-300 text-xs px-2 py-0.5 rounded-md">۱+ سطح</span>
                   </div>
                   <div className="flex items-center gap-2 text-lg">
                      شروع <Play className="w-5 h-5 fill-neutral-900" />
                   </div>
                </button>
             </Link>
          </motion.div>
        </div>
      )}

    </div>
  )
}
