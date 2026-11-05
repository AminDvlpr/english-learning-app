import React from "react"
import { LearningPathMap } from "@/components/dashboard/LearningPathMap"
import { MasteryAnalyticsCard } from "@/components/dashboard/MasteryAnalyticsCard"
import { TieredLeaguesBoard } from "@/components/dashboard/TieredLeaguesBoard"

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 bg-background">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Your Learning Zone</h1>
        <p className="text-muted-foreground text-sm">Continue your journey and track your mastery.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Learning Paths */}
        <div className="w-full">
           <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm">
             <LearningPathMap />
           </div>
        </div>

        {/* Analytics & Leagues */}
        <div className="w-full flex flex-col gap-6">
          <div className="shrink-0">
             <MasteryAnalyticsCard />
          </div>
          <div className="flex-1 min-h-[400px]">
             <TieredLeaguesBoard />
          </div>
        </div>
      </div>
    </div>
  )
}
