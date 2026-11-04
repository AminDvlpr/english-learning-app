import React from "react"
import { LearningPathMap } from "@/components/dashboard/LearningPathMap"
import { MasteryAnalyticsCard } from "@/components/dashboard/MasteryAnalyticsCard"
import { TieredLeaguesBoard } from "@/components/dashboard/TieredLeaguesBoard"

export default function DashboardPage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Your Learning Zone</h1>
        <p className="text-muted-foreground text-lg">Continue your journey and track your mastery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Learning Paths (Takes up 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm">
             <LearningPathMap />
           </div>
        </div>

        {/* Right Column: Analytics & Leagues */}
        <div className="space-y-6 lg:h-[800px] flex flex-col">
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
