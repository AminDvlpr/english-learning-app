"use client"
import React from "react"
import { LearningPathMap } from "@/components/dashboard/LearningPathMap"
import { MasteryAnalyticsCard } from "@/components/dashboard/MasteryAnalyticsCard"
import { TieredLeaguesBoard } from "@/components/dashboard/TieredLeaguesBoard"
import { SavedStashesReviewHub } from "@/components/dashboard/SavedStashesReviewHub"
import { AppShell } from "@/components/layout/AppShell"
import { LessonTopBar } from "@/components/layout/LessonTopBar"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState("دایی‌جان")

  React.useEffect(() => {
    const handleTabChange = () => {
      const tab = localStorage.getItem('english-app-active-tab')
      if (tab) setActiveTab(tab)
    }

    // Initial read
    handleTabChange()

    window.addEventListener('tab-changed', handleTabChange)
    return () => window.removeEventListener('tab-changed', handleTabChange)
  }, [])

  return (
    <AppShell
      topBar={
        <LessonTopBar title="داشبورد" progress={100}>
           <Link href="/">
             <Button variant="ghost" size="sm" className="text-muted-foreground gap-1 ml-2">
               <span className="text-xs">&larr; بازگشت</span>
             </Button>
           </Link>
        </LessonTopBar>
      }
    >
      <div className="flex-1 w-full overflow-y-auto no-scrollbar p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 bg-background" dir="rtl">

        {activeTab === "دایی‌جان" && (
          <div className="w-full">
             <SavedStashesReviewHub />
          </div>
        )}

        {activeTab === "مسیر یادگیری" && (
          <div className="w-full">
             <div className="bg-card border-2 border-border/50 rounded-2xl p-4 shadow-sm">
               <LearningPathMap />
             </div>
          </div>
        )}

        {activeTab === "رنکینگ" && (
          <div className="w-full flex-1 min-h-[400px]">
             <TieredLeaguesBoard />
          </div>
        )}

        {(activeTab === "پروفایل" || activeTab === "چالش") && (
          <div className="w-full">
             <MasteryAnalyticsCard />
          </div>
        )}

      </div>
    </AppShell>
  )
}
