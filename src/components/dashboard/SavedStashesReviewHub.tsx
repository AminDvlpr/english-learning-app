"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { useCourseStore } from "@/store/useCourseStore"
import { Volume2, CheckCircle2, RotateCcw, BrainCircuit } from "lucide-react"

export function SavedStashesReviewHub() {
  const { savedStashes, completeStashReview } = useCourseStore()
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({})

  // Separate stashes into "Due Now" and "Remembered" based on SRS
  const now = Date.now()
  const dueStashes = savedStashes.filter(s => s.nextReviewAt <= now)
  const rememberedStashes = savedStashes.filter(s => s.nextReviewAt > now)

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Stop any current audio
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleReview = (lessonId: string, remembered: boolean) => {
    completeStashReview(lessonId, remembered)
  }

  const toggleFlip = (lessonId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }))
  }

  const renderStashCard = (stash: typeof savedStashes[0], isDue: boolean) => {
    const isFlipped = flippedCards[stash.lessonId]

    return (
      <div key={stash.lessonId} className="relative w-full perspective-1000 h-[300px]" style={{ perspective: '1000px' }}>
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of Card */}
          <div
            className="absolute inset-0 backface-hidden bg-card border-2 border-border shadow-sm rounded-2xl p-5 flex flex-col justify-between cursor-pointer"
            onClick={() => toggleFlip(stash.lessonId)}
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <Badge variant={isDue ? "destructive" : "secondary"}>
                  {isDue ? 'مرور روزانه' : `مرحله ${stash.srsStage}`}
                </Badge>
                <BrainCircuit className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg leading-tight mt-2">{stash.lessonTitle}</h3>
              <p className="text-muted-foreground text-sm mt-1">{stash.takeawayFa}</p>
            </div>
            <div className="text-center text-xs font-medium text-muted-foreground flex items-center justify-center gap-1">
              <RotateCcw className="w-3 h-3" /> برای چرخش ضربه بزنید
            </div>
          </div>

          {/* Back of Card */}
          <div
            className="absolute inset-0 backface-hidden bg-primary/5 border-2 border-primary/20 shadow-sm rounded-2xl p-5 flex flex-col justify-between overflow-y-auto"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="flex-1 space-y-4">
              {stash.keyPhrases.map((phrase, idx) => (
                <div key={idx} className="bg-background rounded-lg p-3 shadow-sm border border-border">
                  <div className="flex justify-between items-start gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); playTTS(phrase.en); }}
                      className="text-primary hover:text-primary/80 shrink-0 p-1"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-sm text-foreground text-left flex-1" dir="ltr">{phrase.en}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{phrase.fa}</p>
                </div>
              ))}
            </div>

            {isDue && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => { e.stopPropagation(); handleReview(stash.lessonId, false); }}
                  className="flex-1 bg-destructive/10 text-destructive text-sm font-bold py-2 rounded-xl border border-destructive/20 shadow-sm"
                >
                  نیاز به تمرین
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReview(stash.lessonId, true); toggleFlip(stash.lessonId); }}
                  className="flex-1 bg-primary text-primary-foreground text-sm font-bold py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm hover:opacity-90"
                >
                  <CheckCircle2 className="w-4 h-4" /> یاد گرفتم
                </button>
              </div>
            )}
            {!isDue && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleFlip(stash.lessonId); }}
                className="w-full text-center text-xs font-bold text-muted-foreground mt-4 hover:text-foreground"
              >
                بستن فلش‌کارت
              </button>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  // Default phrases from Amin & Sara's episodes if no stashes are saved
  const mockStashes = [{
    courseId: "mock-course",
    lessonId: "mock-1",
    lessonTitle: "اپیزود ۱: تولد و دعوا",
    takeawayEn: "Birthday party vocabulary",
    takeawayFa: "کلمات مربوط به جشن تولد",
    srsStage: 1,
    nextReviewAt: 0,
    savedAt: 0,
    keyPhrases: [
      { en: "Happy birthday to you!", fa: "تولدت مبارک!", grammarNoteFa: "" },
      { en: "Make a wish and blow out the candles.", fa: "آرزو کن و شمع‌ها رو فوت کن.", grammarNoteFa: "" }
    ]
  }]

  const displayDue = savedStashes.length > 0 ? dueStashes : mockStashes
  const displayRemembered = rememberedStashes

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">

      <div className="pb-1 border-b-2 border-border/50 mb-2">
        <h2 className="text-xl font-black relative inline-block">
          مرور با دایی‌جان
          <span className="absolute bottom-1 left-0 w-full h-2.5 bg-amber-300/60 -z-10 rounded-sm"></span>
        </h2>
      </div>

      {displayDue.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="bg-destructive w-2 h-2 rounded-full animate-pulse" />
            مرور امروز ({displayDue.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayDue.map(stash => renderStashCard(stash, true))}
          </div>
        </div>
      )}

      {displayRemembered.length > 0 && (
        <div className="space-y-3 mt-4">
          <h3 className="text-lg font-bold text-muted-foreground">
            یادگرفته‌شده‌ها ({displayRemembered.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayRemembered.map(stash => renderStashCard(stash, false))}
          </div>
        </div>
      )}

      {savedStashes.length === 0 && (
        <div className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl text-center">
          شما هنوز هیچ درسی را ذخیره نکرده‌اید. این فلش‌کارت‌ها به صورت نمونه نمایش داده شده‌اند.
        </div>
      )}

    </div>
  )
}

function Badge({ children, variant = 'secondary' }: { children: React.ReactNode, variant?: 'secondary' | 'destructive' }) {
  const base = "px-2 py-0.5 rounded-full text-xs font-medium"
  const variants = {
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground"
  }
  return <span className={`${base} ${variants[variant]}`}>{children}</span>
}
