"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export type ChapterEnvironment = 'childhood_class' | 'uncle_living_room' | 'london_apartment' | 'cafe_counter'
export type InterruptType = 'drag_and_drop' | 'select' | 'walk_away' | 'none'

interface PlayNarrativeSlideProps {
  environment: ChapterEnvironment
  interruptType: InterruptType
  onInterruptComplete: () => void
  dialogueText?: string
  dialogueSpeaker?: string
}

export function PlayNarrativeSlide({
  /* environment, */
  interruptType,
  onInterruptComplete,
  dialogueText,
  dialogueSpeaker
}: PlayNarrativeSlideProps) {
  // Drag and Drop state
  const [dragSourceSelected, setDragSourceSelected] = useState(false)
  const [dragCompleted, setDragCompleted] = useState(false)

  // Dialog selection state
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleDragEnd = (e: unknown, info: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Simple mock logic for drag completion (assuming target is nearby)
    if (Math.abs(info.offset.x) > 50 || Math.abs(info.offset.y) > 50) {
      setDragCompleted(true)
      setTimeout(() => {
        onInterruptComplete()
      }, 500)
    }
  }

  const handleTapSource = () => {
    setDragSourceSelected(true)
  }

  const handleTapTarget = () => {
    if (dragSourceSelected) {
      setDragCompleted(true)
      setTimeout(() => {
        onInterruptComplete()
      }, 500)
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 overflow-hidden" dir="ltr">
      {/* Upper 50% - Scene and Characters */}
      <div className="relative w-full h-[50%] bg-slate-800 border-b border-slate-700 p-4 flex flex-col justify-end">
        {/* Environment Background Mock */}
        <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Crect fill=\'%23333\' width=\'100\' height=\'100\'/%3E%3C/svg%3E")' }} />

        {/* Character Mock */}
        <div className="relative z-10 flex justify-between items-end pb-4">
          <motion.div
            className="w-20 h-32 bg-blue-600 rounded-t-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          />
          <motion.div
            className="w-20 h-32 bg-rose-600 rounded-t-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          />
        </div>
      </div>

      {/* Lower 50% - Narrative/Interrupts */}
      <div className="relative w-full h-[50%] bg-slate-900 flex flex-col justify-end p-4 pb-12">
        {/* Dialogue Captions (Hidden during interrupts for true Zero Static Buttons feel, unless needed) */}
        <AnimatePresence>
          {interruptType === 'none' && dialogueText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 w-full max-w-sm mx-auto text-center"
            >
              {dialogueSpeaker && (
                <div className="text-white/70 text-xs uppercase font-bold mb-1 tracking-wider">{dialogueSpeaker}</div>
              )}
              <div className="text-white text-lg font-medium leading-relaxed drop-shadow-md px-4 py-2 bg-black/40 rounded-xl">
                {/* Parse Deep Dive Terms ✨ */}
                {dialogueText.split('✨').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="text-amber-400 cursor-pointer hover:text-amber-300 transition-colors">✨</span>}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interrupt Mechanics */}
        <AnimatePresence>
          {interruptType === 'drag_and_drop' && !dragCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Target */}
              <div
                className="absolute left-[70%] top-[-20%] pointer-events-auto"
                onClick={handleTapTarget}
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/50 animate-ping absolute -inset-2" />
                <div className="w-12 h-12 rounded-full border-4 border-white/80 bg-white/20 flex items-center justify-center backdrop-blur-sm cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                  <span className="text-white font-bold text-xl">◎</span>
                </div>
              </div>

              {/* Source (Draggable) */}
              <motion.div
                className="absolute left-[30%] top-[-10%] pointer-events-auto cursor-grab active:cursor-grabbing z-50"
                drag
                dragConstraints={{ left: -100, right: 300, top: -200, bottom: 100 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                onClick={handleTapSource}
                whileDrag={{ scale: 1.1 }}
              >
                <div className={`w-16 h-16 rounded-full border-2 border-amber-400/50 absolute -inset-2 ${dragSourceSelected ? 'animate-ping' : ''}`} />
                <div className="w-12 h-12 rounded-full border-4 border-amber-400 bg-amber-400/20 flex items-center justify-center backdrop-blur-sm shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                  <span className="text-amber-400 font-bold text-xl">◎</span>
                </div>
              </motion.div>

              {/* Bottom Hint */}
              <div className="absolute bottom-12 inset-x-0 flex justify-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full text-white/90 text-sm font-medium">
                  مداد را از روی میز بکشید و روی دفتر سارا رها کنید
                </div>
              </div>
            </motion.div>
          )}

          {interruptType === 'select' && !selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-12 inset-x-4 flex flex-col gap-3 z-50"
            >
              {/* Telltale-style timed bar */}
              <motion.div
                className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-2"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 10, ease: "linear" }}
              >
                <div className="h-full bg-white" />
              </motion.div>

              {['It was fine.', 'I learned a lot!', '... (Silence)'].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setSelectedOption(opt)
                    setTimeout(() => onInterruptComplete(), 1000)
                  }}
                  className="w-full text-left px-6 py-4 bg-black/60 hover:bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium transition-colors active:bg-white/20"
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}

          {interruptType === 'walk_away' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-[50%] top-[-30%] -translate-x-1/2 pointer-events-auto z-50"
            >
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  onInterruptComplete()
                }}
                className="group relative flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full border-2 border-white/50 group-hover:animate-ping absolute -inset-2 transition-all" />
                <div className="w-16 h-16 rounded-full border-4 border-white bg-white/10 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all group-hover:bg-white/20 group-hover:scale-110">
                  <span className="text-white font-bold text-2xl drop-shadow-md">◎</span>
                </div>
                <span className="text-white text-sm font-medium mt-4 px-3 py-1 bg-black/50 rounded-full backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
                  Walk away
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
