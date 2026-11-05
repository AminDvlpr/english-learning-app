"use client"
import React from "react"
import { LearningPathMap } from "@/components/dashboard/LearningPathMap"
import { MasteryAnalyticsCard } from "@/components/dashboard/MasteryAnalyticsCard"
import { TieredLeaguesBoard } from "@/components/dashboard/TieredLeaguesBoard"
import { SavedStashesReviewHub } from "@/components/dashboard/SavedStashesReviewHub"
import { AppShell } from "@/components/layout/AppShell"
import { motion, AnimatePresence } from "framer-motion"

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
    <AppShell topBar={null}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden"
        >
          <div className="flex-1 w-full overflow-y-auto no-scrollbar p-4 pb-24 bg-background" dir="rtl">
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
                 <MasteryAnalyticsCard viewMode={activeTab === "چالش" ? "challenge" : "profile"} />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}
