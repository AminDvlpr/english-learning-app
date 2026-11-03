"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Play, ArrowRight, Volume2, Snail, Diamond, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UI_SPRING } from '@/lib/motion-tokens'

export interface AdaptiveFeedbackBannerProps {
  state: 'completed' | 'adaptive-remediation'
  feedbackText?: string
  smartHintText?: string
  targetPhraseEn?: string
  xpAwarded: number
  gemsAwarded: number
  onSpeakNormal: () => void
  onSpeakSlow: () => void
  onRetry?: () => void
}

export function AdaptiveFeedbackBanner({
  state,
  feedbackText,
  smartHintText,
  targetPhraseEn,
  xpAwarded,
  gemsAwarded,
  onSpeakNormal,
  onSpeakSlow,
  onRetry
}: AdaptiveFeedbackBannerProps) {
  const isCompleted = state === 'completed'
  const isRemediation = state === 'adaptive-remediation'

  if (!isCompleted && !isRemediation) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={UI_SPRING}
        className={`w-full rounded-xl overflow-hidden border ${
          isCompleted
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
            : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
        }`}
      >
        <div className="p-4 sm:p-5 flex flex-col gap-4">

          {/* Header Row */}
          <div className="flex justify-between items-start gap-3">
            <div className="flex gap-3">
              {isCompleted ? (
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              )}

              <div className="flex flex-col pt-0.5">
                <h4 className={`font-semibold text-lg ${
                  isCompleted ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'
                }`}>
                  {isCompleted ? 'Excellent!' : 'Not quite right'}
                </h4>
                {feedbackText && (
                  <p className={`text-sm mt-1 leading-relaxed ${
                    isCompleted ? 'text-emerald-800 dark:text-emerald-200' : 'text-amber-800 dark:text-amber-200'
                  }`} dir="rtl">
                    {feedbackText}
                  </p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
              {xpAwarded > 0 && (
                <Badge variant="outline" className={`font-mono text-sm shadow-sm ${
                  isCompleted ? 'border-emerald-300 text-emerald-700 bg-emerald-100/50' : 'border-amber-300 text-amber-700 bg-amber-100/50'
                }`}>
                  +{xpAwarded} XP
                </Badge>
              )}
              {gemsAwarded > 0 && (
                <Badge variant="outline" className="font-mono text-sm shadow-sm border-blue-300 text-blue-700 bg-blue-100/50">
                  <Diamond className="w-3 h-3 mr-1 fill-blue-500 text-blue-500" />
                  +{gemsAwarded}
                </Badge>
              )}
            </div>
          </div>

          {/* Smart Hint Area (Only in remediation) */}
          {isRemediation && smartHintText && (
            <div className="mt-2 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span> Smart Hint
              </h5>
              <p className="text-indigo-800 dark:text-indigo-300 text-sm leading-relaxed" dir="rtl">
                {smartHintText}
              </p>
            </div>
          )}

          {/* Target Phrase & Audio (Applicable in both states if phrase exists) */}
          {targetPhraseEn && (
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3 bg-white/60 dark:bg-slate-900/40 rounded-lg p-3 border border-slate-200/50 dark:border-slate-800/50">
              <span className="font-serif font-medium text-lg text-slate-800 dark:text-slate-200" dir="ltr">
                {targetPhraseEn}
              </span>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300" onClick={onSpeakSlow} title="Listen slowly (0.75x)">
                  <Snail className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={onSpeakNormal} title="Listen normally (1.0x)">
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-2 flex items-center justify-between">
            {isRemediation ? (
              <>
                <Badge variant="secondary" className="text-xs font-normal text-muted-foreground bg-black/5 dark:bg-white/5 border-none">
                  <TrendingDown className="w-3 h-3 mr-1 inline-block" />
                  Difficulty adjusted -&gt; Easier
                </Badge>
                <Button variant="default" size="sm" onClick={onRetry} className="bg-amber-600 hover:bg-amber-700 text-white shadow-md">
                  Try Again
                  <Play className="w-4 h-4 ml-2 fill-current" />
                </Button>
              </>
            ) : (
              <div className="flex-1 flex justify-end">
                 <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-100/50 font-normal">
                    Next block unlocked <ArrowRight className="w-3 h-3 ml-1" />
                 </Badge>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}
