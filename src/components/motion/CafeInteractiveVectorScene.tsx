"use client"

import React, { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CafeInteractiveVectorSceneProps {
  currentTimeSec: number
  isCorrect: boolean | null
  difficultyLevel: number
  triggerName: string | null
  resetCounter: number
}

export function CafeInteractiveVectorScene({
  currentTimeSec,
  isCorrect,
  triggerName,
}: CafeInteractiveVectorSceneProps) {
  // Determine scene state based on props
  const state = useMemo(() => {
    if (triggerName === 'reset') return 'idle'
    if (isCorrect === true || triggerName === 'success') return 'success_celebration'
    if (isCorrect === false || triggerName === 'error' || triggerName === 'remediation') return 'remediation_explanation'

    // Simulate pausing exactly at or after triggerTimestamp (typically 18.5s)
    if (currentTimeSec >= 18.5 && currentTimeSec < 19) return 'checkpoint_paused'

    if (currentTimeSec > 0 && currentTimeSec < 45) return 'dialogue_playing'
    return 'idle'
  }, [currentTimeSec, isCorrect, triggerName])

  return (
    <div className="relative w-full aspect-video bg-amber-50 dark:bg-amber-950/20 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-50 flex items-center justify-center pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cafe counter */}
          <rect x="0" y="300" width="800" height="150" fill="currentColor" className="text-amber-200 dark:text-amber-900" />
          {/* Coffee machine */}
          <rect x="100" y="150" width="150" height="150" rx="10" fill="currentColor" className="text-stone-400 dark:text-stone-700" />
          {/* Steam */}
          {(state === 'dialogue_playing' || state === 'success_celebration') && (
            <motion.path
              d="M175 140 Q185 100 175 60"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-stone-300 dark:text-stone-600"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: [0, 0.5, 0], pathLength: [0, 1, 1], y: [0, -20, -40] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          )}
        </svg>
      </div>

      {/* Characters */}
      <div className="relative z-10 w-full max-w-2xl flex justify-between items-end h-full pb-8">

        {/* Barista */}
        <div className="flex flex-col items-center">
          <motion.div
            className="w-24 h-32 bg-teal-600 dark:bg-teal-700 rounded-t-full rounded-b-md relative flex items-center justify-center"
            animate={state === 'success_celebration' ? { y: [0, -10, 0] } : { y: 0 }}
            transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}

          >
            {/* Face */}
            <div className="w-16 h-16 bg-orange-200 dark:bg-orange-300 rounded-full absolute -top-8 flex items-center justify-center">
               {/* Eyes */}
               <div className="flex gap-2 mb-2">
                 <div className="w-2 h-2 bg-stone-800 rounded-full" />
                 <div className="w-2 h-2 bg-stone-800 rounded-full" />
               </div>
               {/* Mouth */}
               <motion.div
                 className="absolute bottom-3 w-4 h-1 bg-stone-800 rounded-full"
                 animate={
                   state === 'success_celebration' ? { width: 12, height: 4, borderRadius: "0 0 10px 10px" } :
                   state === 'dialogue_playing' && currentTimeSec > 10 ? { height: [2, 6, 2] } :
                   { width: 8, height: 2 }
                 }
                 transition={{ repeat: state === 'dialogue_playing' && currentTimeSec > 10 ? Infinity : 0, duration: 0.3, type: "tween", ease: "easeInOut" }}
               />
            </div>
            <div className="text-white text-xs font-bold mt-4">Barista</div>
          </motion.div>
        </div>

        {/* Learner */}
        <div className="flex flex-col items-center">
          <motion.div
            className="w-24 h-32 bg-indigo-600 dark:bg-indigo-700 rounded-t-full rounded-b-md relative flex items-center justify-center"
            animate={state === 'remediation_explanation' ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
            transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
          >
             {/* Face */}
             <div className="w-16 h-16 bg-orange-100 dark:bg-orange-200 rounded-full absolute -top-8 flex items-center justify-center">
               {/* Eyes */}
               <div className="flex gap-2 mb-2">
                 <div className="w-2 h-2 bg-stone-800 rounded-full" />
                 <div className="w-2 h-2 bg-stone-800 rounded-full" />
               </div>
               {/* Mouth */}
               <motion.div
                 className="absolute bottom-3 w-6 h-1 bg-stone-800 rounded-full"
                 animate={
                   state === 'remediation_explanation' ? { width: 8, height: 6, borderRadius: "50%" } :
                   state === 'dialogue_playing' && currentTimeSec < 10 ? { height: [2, 6, 2] } :
                   { width: 8, height: 2 }
                 }
                 transition={{ repeat: state === 'dialogue_playing' && currentTimeSec < 10 ? Infinity : 0, duration: 0.3, type: "tween", ease: "easeInOut" }}
               />
             </div>
             <div className="text-white text-xs font-bold mt-4">You</div>
          </motion.div>
        </div>
      </div>

      {/* Overlays / Dialogue */}
      <AnimatePresence mode="wait">
        {state === 'dialogue_playing' && currentTimeSec < 10 && (
          <motion.div
            key="bubble-learner"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}

            className="absolute right-1/4 top-1/4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-2xl rounded-br-none shadow-lg border border-slate-200 dark:border-slate-700 text-sm font-medium"
            dir="ltr"
          >
            I would like a latte, please.
          </motion.div>
        )}

        {state === 'dialogue_playing' && currentTimeSec > 10 && (
          <motion.div
            key="bubble-barista"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}

            className="absolute left-1/4 top-1/4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-2xl rounded-bl-none shadow-lg border border-slate-200 dark:border-slate-700 text-sm font-medium"
            dir="ltr"
          >
            Certainly! For here or to go?
          </motion.div>
        )}

        {state === 'checkpoint_paused' && (
          <motion.div
            key="checkpoint"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}

            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20"
          >
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-w-sm">
               <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Checkpoint Reached</h3>
               <p className="text-sm text-slate-600 dark:text-slate-400">Answer the question to continue the scene.</p>
            </div>
          </motion.div>
        )}

        {state === 'success_celebration' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}

            className="absolute inset-x-8 top-1/4 bg-emerald-500 text-white p-4 rounded-xl shadow-xl flex items-center justify-center gap-4 z-20"
          >
            <div className="text-3xl">✨</div>
            <div className="font-bold text-lg">Perfect Request!</div>
            <div className="text-3xl">✨</div>
          </motion.div>
        )}

        {state === 'remediation_explanation' && (
          <motion.div
            key="remediation"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}

            className="absolute inset-4 top-auto bottom-8 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-2xl border-2 border-destructive/50 flex flex-col gap-2 z-20"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-destructive uppercase tracking-wider">Grammar Note</span>
              <span className="text-xs text-slate-500">Imperative vs Modal</span>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-start gap-2 bg-destructive/5 p-2 rounded">
                <span className="text-destructive font-bold">✕</span>
                <span className="text-slate-700 dark:text-slate-300">&quot;Give me a latte&quot; sounds demanding (imperative).</span>
              </div>
              <div className="flex items-start gap-2 bg-success/5 p-2 rounded">
                <span className="text-success font-bold">✓</span>
                <span className="text-slate-700 dark:text-slate-300">&quot;Could I please have a latte?&quot; is a polite request.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
