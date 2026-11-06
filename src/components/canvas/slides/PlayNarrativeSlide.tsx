"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"

export type ChapterEnvironment = 'childhood_class' | 'uncle_living_room' | 'london_apartment' | 'cafe_counter' | 'painting_studio' | 'uncle_tea_room' | 'immigration_office'
export type InterruptType = 'drag_and_drop' | 'select' | 'walk_away' | 'none' | 'pressure_choice' | 'investigate' | 'document_inspection'

export type CharacterExpression = 'neutral' | 'happy' | 'mocking' | 'strict_frown' | 'nervous' | 'proud'

export interface LivingPuppetProps {
  name: string
  expression: CharacterExpression
  isSpeaking: boolean
  isWalking: boolean
  color: string
}

function LivingPuppet({ name, expression, isSpeaking, isWalking, color }: LivingPuppetProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const mouthControls = useAnimation()

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 3500)
    return () => clearInterval(blinkInterval)
  }, [])

  useEffect(() => {
    if (isSpeaking) {
      mouthControls.start({
        scaleY: [1, 0.2, 0.8, 0.4, 1],
        transition: { repeat: Infinity, duration: 0.6, type: "tween" }
      })
    } else {
      mouthControls.stop()
      mouthControls.set({ scaleY: 1 })
    }
  }, [isSpeaking, mouthControls])

  return (
    <motion.div
      className="relative w-24 h-40 flex flex-col justify-end items-center origin-bottom shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: isWalking ? [0, -10, 0] : 0,
        transition: isWalking ? { repeat: Infinity, duration: 0.5, type: "tween" } : {}
      }}
    >
      <motion.div
        className="w-full h-full rounded-t-[40px] flex flex-col items-center pt-8 border-4 border-slate-900"
        style={{ backgroundColor: color, originY: 1 }}
        animate={{ scaleY: [1, 1.025, 1] }}
        transition={{ repeat: Infinity, duration: 3, type: "tween", ease: "easeInOut" }}
      >
        <div className="absolute top-[-30px] bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
          {name}
        </div>

        {/* Face */}
        <div className="flex gap-3 mb-2">
          {/* Eyes */}
          <div className="w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden relative">
             <motion.div className="w-full h-full bg-slate-900 absolute" animate={{ scaleY: isBlinking ? 0.1 : 1 }} transition={{ duration: 0.1 }} />
             {expression === 'strict_frown' && <div className="absolute -top-1 w-4 h-1 bg-slate-900 rotate-12" />}
          </div>
          <div className="w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden relative">
             <motion.div className="w-full h-full bg-slate-900 absolute" animate={{ scaleY: isBlinking ? 0.1 : 1 }} transition={{ duration: 0.1 }} />
             {expression === 'strict_frown' && <div className="absolute -top-1 w-4 h-1 bg-slate-900 -rotate-12" />}
          </div>
        </div>

        {/* Mouth */}
        <motion.div
          className="w-4 h-2 bg-slate-900 rounded-full"
          animate={mouthControls}
          style={{
            borderRadius: expression === 'happy' || expression === 'mocking' || expression === 'proud' ? '0 0 10px 10px' :
                          expression === 'strict_frown' ? '10px 10px 0 0' : '4px',
            width: expression === 'nervous' ? '6px' : '16px'
          }}
        />

        {/* Perspiration/Sweat for nervous */}
        {expression === 'nervous' && (
          <div className="absolute top-6 right-2 w-1.5 h-2 bg-blue-300 rounded-full opacity-70 animate-bounce" />
        )}
      </motion.div>
    </motion.div>
  )
}

function ApprovalMeter({ score }: { score: number }) {
  const [delta, setDelta] = useState<number | null>(null)
  const prevScoreRef = useRef(score)

  useEffect(() => {
    if (score !== prevScoreRef.current) {
      setDelta(score - prevScoreRef.current)
      prevScoreRef.current = score
      const t = setTimeout(() => setDelta(null), 2000)
      return () => clearTimeout(t)
    }
  }, [score])

  let icon = '😠'
  if (score >= 80) icon = '😍'
  else if (score >= 50) icon = '😊'
  else if (score >= 25) icon = '😐'

  return (
    <div className="absolute top-4 inset-x-0 flex justify-center z-50 pointer-events-none">
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl">
        <span className="text-2xl drop-shadow-md relative">
          {icon}
          <AnimatePresence>
            {delta !== null && (
              <motion.span
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -25, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute left-0 right-0 text-center text-sm font-bold drop-shadow-md ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {delta > 0 ? '+' : ''}{delta}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, score))}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
        <span className="text-white/80 text-xs font-medium" dir="rtl">رضایت دایی‌جان</span>
      </div>
    </div>
  )
}

function VisaDocument({ onComplete }: { onComplete: () => void }) {
  const [selectedError, setSelectedError] = useState<string | null>(null)
  const [corrected, setCorrected] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm p-6 flex flex-col justify-center items-center"
    >
      <div className="w-full max-w-sm bg-amber-50 rounded-xl shadow-2xl p-6 text-slate-800 font-serif relative">
        <h3 className="text-xl font-bold border-b-2 border-slate-300 pb-2 mb-4 text-center uppercase tracking-widest">
          UK Visa Application
        </h3>

        <div className="space-y-4 text-sm">
          <div>
            <span className="font-bold text-slate-500">Name:</span> Amin
          </div>
          <div>
            <span className="font-bold text-slate-500">Purpose of Visit:</span> Tourism
          </div>
          <div className="relative">
            <span className="font-bold text-slate-500">Occupation:</span>{' '}
            {!corrected ? (
              <span
                className="bg-red-200 text-red-900 px-1 rounded cursor-pointer animate-pulse"
                onClick={() => setSelectedError('occupation')}
              >
                Enginer (Unmployed)
              </span>
            ) : (
              <span className="bg-green-200 text-green-900 px-1 rounded">Software Engineer</span>
            )}

            {selectedError === 'occupation' && !corrected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 p-2 z-10 w-full"
              >
                <div className="text-xs text-slate-500 mb-2 font-sans" dir="rtl">گزینه صحیح را انتخاب کنید:</div>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded font-sans text-sm border border-transparent hover:border-slate-200 transition-colors"
                  onClick={() => setSelectedError(null)}
                >
                  Enginer (Unmployed)
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-green-50 rounded font-sans text-sm border border-transparent hover:border-green-200 transition-colors"
                  onClick={() => setCorrected(true)}
                >
                  Software Engineer
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled={!corrected}
            onClick={() => onComplete()}
            className={`px-6 py-3 rounded-xl font-bold font-sans transition-all ${corrected ? 'bg-blue-600 text-white shadow-lg hover:scale-105 active:scale-95' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
          >
            Approve & Submit to Officer
          </button>
        </div>

        {/* Mock Stamp */}
        {corrected && (
          <motion.div
            initial={{ opacity: 0, scale: 2, rotate: -20 }}
            animate={{ opacity: 0.8, scale: 1, rotate: -10 }}
            className="absolute top-8 right-4 border-4 border-green-600 text-green-600 font-bold px-3 py-1 rounded uppercase tracking-wider text-xl mix-blend-multiply"
          >
            VERIFIED
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export interface PlayNarrativeSlideProps {
  environment: ChapterEnvironment
  interruptType: InterruptType
  onInterruptComplete: () => void
  dialogueText?: string
  dialogueSpeaker?: string
  hasApprovalMeter?: boolean
  storyNodes?: unknown[] // to support full node-graph
  playScene?: Record<string, unknown> & { characters?: { name: string }[], objects?: { id: string, xPercent: number, yPercent: number, emoji: string, label: string }[] } // to support legacy format
}


function TopControls() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  return (
    <>
      <div className="absolute top-10 left-4 z-40 flex items-center gap-2.5 pointer-events-auto">
        <button type="button" onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying) }} className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center text-white text-lg hover:bg-black/60 transition-colors">
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted) }} className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center text-white text-lg hover:bg-black/60 transition-colors">
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
      <div className="absolute top-10 right-4 z-40 pointer-events-auto">
        <button type="button" onClick={(e) => { e.stopPropagation(); }} className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md border border-white/15 flex items-center justify-center text-white text-lg hover:bg-black/60 transition-colors">
          ⤢
        </button>
      </div>
    </>
  )
}

export function PlayNarrativeSlide(props: PlayNarrativeSlideProps) {
  if (props.environment === 'childhood_class') {
    return <Episode1StoryRunner onComplete={props.onInterruptComplete || (() => {})} />
  }
  return <LegacyPlayNarrativeSlide {...props} />
}

function LegacyPlayNarrativeSlide({
  /* environment, */
  interruptType,
  onInterruptComplete,
  dialogueText,
  dialogueSpeaker,
  hasApprovalMeter,
  /* storyNodes, */
  playScene
}: PlayNarrativeSlideProps) {

  // Inventory and Investigation State
  const [inventory, setInventory] = useState<{ id: string; label: string; emoji: string }[]>([])
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [inspectedText, setInspectedText] = useState<string | null>(null)

  // Drag and Drop state
  const [dragSourceSelected, setDragSourceSelected] = useState(false)
  const [dragCompleted, setDragCompleted] = useState(false)

  // Dialog selection state
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Timer State for pressure choices
  const [timeLeft, setTimeLeft] = useState(5)
  const [isPausedByHold, setIsPausedByHold] = useState(false)

  // Camera State
  const [cameraFocus, setCameraFocus] = useState<'speaker_zoom' | 'pressure_closeup' | 'wide_explore'>('wide_explore')
  const stageRef = useRef<HTMLDivElement>(null)

  // Approval Score State
  const [approvalScore, setApprovalScore] = useState(50)

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

  // Timer effect for pressure choices
  useEffect(() => {
    if ((interruptType === 'select' || interruptType === 'pressure_choice') && !selectedOption && !isPausedByHold) {
      if (timeLeft > 0) {
        const t = setTimeout(() => setTimeLeft(prev => prev - 0.1), 100)
        return () => clearTimeout(t)
      } else if (timeLeft <= 0) {
        // Auto-Silence consequence
        setSelectedOption("... (Silence / سکوت)")
        setApprovalScore(prev => Math.max(0, prev - 15))
        setTimeout(() => onInterruptComplete(), 2000)
      }
    }
  }, [interruptType, selectedOption, isPausedByHold, timeLeft, onInterruptComplete])

  // Derived state to determine actual active state from newer or older formats
  useEffect(() => {
    if (interruptType === 'pressure_choice') {
      setCameraFocus('pressure_closeup')
      setTimeLeft(5) // Reset timer when switching to pressure choice
    } else if (interruptType === 'investigate') {
      setCameraFocus('wide_explore')
    } else if (dialogueSpeaker) {
      setCameraFocus('speaker_zoom')
    } else {
      setCameraFocus('wide_explore')
    }
  }, [interruptType, dialogueSpeaker])

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 overflow-hidden" dir="ltr">
      <TopControls />
      {hasApprovalMeter && <ApprovalMeter score={approvalScore} />}
      {/* Upper 50% - Scene and Characters (2.5D Parallax Camera Rig) */}
      <div className="relative w-full h-[50%] bg-slate-800 border-b border-slate-700 overflow-hidden" ref={stageRef}>

        <motion.div
          className="w-full h-full cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: -300, right: 300 }}
          dragElastic={0.1}
          animate={{
            scale: cameraFocus === 'pressure_closeup' ? 1.22 : cameraFocus === 'speaker_zoom' ? 1.14 : 1.0,
            x: cameraFocus === 'speaker_zoom' && dialogueSpeaker === 'Amin' ? 40 : cameraFocus === 'speaker_zoom' && dialogueSpeaker !== 'Amin' ? -40 : 0
          }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.8 }}
        >
          {/* Background Layer (0.1x Parallax) */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40"
            style={{
              width: '120%', left: '-10%',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Crect fill=\'%23333\' width=\'100\' height=\'100\'/%3E%3C/svg%3E")'
            }}
          />

          {/* Midground Layer (1.0x Parallax) - Characters & Furniture */}
          <motion.div className="absolute inset-0 flex justify-between items-end pb-4 px-10 pointer-events-none">
            {/* Proceedurally Rendered Living Puppets */}
            <LivingPuppet
              name="Amin"
              color="#3b82f6"
              expression={(dialogueSpeaker === 'Amin' && interruptType === 'none') ? 'neutral' : 'nervous'}
              isSpeaking={dialogueSpeaker === 'Amin'}
              isWalking={false}
            />

            {(dialogueSpeaker === 'Sara' || playScene?.characters?.some(c => c.name === 'Sara')) && (
              <LivingPuppet
                name="Sara"
                color="#f43f5e"
                expression="mocking"
                isSpeaking={dialogueSpeaker === 'Sara'}
                isWalking={false}
              />
            )}

            {(dialogueSpeaker === 'Uncle' || playScene?.characters?.some(c => c.name === 'Uncle')) && (
              <LivingPuppet
                name="Uncle"
                color="#8b5cf6"
                expression="strict_frown"
                isSpeaking={dialogueSpeaker === 'Uncle'}
                isWalking={false}
              />
            )}
          </motion.div>

          {/* Foreground Layer (1.2x Parallax) - Props & Vignette */}
          <motion.div
            className="absolute inset-0 pointer-events-none shadow-[inset_0_-20px_40px_rgba(0,0,0,0.5)]"
          >
            {/* Proceedurally Rendered Investigation Hotspots */}
            {(interruptType === 'investigate' || (playScene?.objects && playScene.objects.length > 0)) && (playScene?.objects || [
              { id: 'h1', xPercent: 20, yPercent: 60, emoji: '🖌️', label: 'Red Brush' },
              { id: 'h2', xPercent: 80, yPercent: 40, emoji: '☕', label: 'Persian Tea' }
            ]).map((obj) => (
              !inventory.find(i => i.id === obj.id) && (
                <div
                  key={obj.id}
                  className="absolute pointer-events-auto"
                  style={{ left: `${obj.xPercent}%`, top: `${obj.yPercent}%` }}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => { e.stopPropagation(); setActiveHotspot(obj.id) }}
                    className="relative flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-white/50 animate-ping absolute" />
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm shadow-[0_0_10px_rgba(255,255,255,0.5)] flex items-center justify-center">
                      <span className="text-white text-sm font-bold">◎</span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {activeHotspot === obj.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-xl"
                      >
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => {
                            setInspectedText(`Hmm, looks like a ${obj.label}. ${obj.emoji}`)
                            setActiveHotspot(null)
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          <span>👁️</span> Look
                        </button>
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => {
                            setInventory(prev => [...prev, obj])
                            setActiveHotspot(null)
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-lg text-white text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          <span>✋</span> Grab
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            ))}
          </motion.div>
        </motion.div>

      </div>

      {/* Lower 50% - Narrative/Interrupts */}
      <div className="relative w-full h-[50%] bg-slate-900 flex flex-col justify-end p-4 pb-12">
        {/* Monologue / Inspected Text */}
        <AnimatePresence>
          {inspectedText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 inset-x-4 z-50 text-center"
              onClick={() => setInspectedText(null)}
            >
              <div className="inline-block bg-white text-black px-4 py-2 rounded-2xl rounded-tl-sm shadow-xl font-medium max-w-[80%] cursor-pointer">
                {inspectedText}
                <div className="text-xs text-slate-500 mt-1" dir="rtl">«(برای بستن ضربه بزنید)»</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialogue Captions (Hidden during interrupts for true Zero Static Buttons feel, unless needed) */}
        <AnimatePresence>
          {interruptType === 'none' && dialogueText && !inspectedText && (
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

        {/* Slide-Up Inventory Drawer (کیف آیتم‌ها) */}
        <AnimatePresence>
          {inventory.length > 0 && interruptType !== 'select' && interruptType !== 'pressure_choice' && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-0 inset-x-0 bg-slate-800/90 backdrop-blur-md border-t border-slate-700 p-4 z-40 rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex flex-col gap-2"
            >
              <div className="text-xs text-white/50 text-center font-medium" dir="rtl">کیف آیتم‌ها (بکشید و رها کنید)</div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar justify-center pb-2">
                {inventory.map(item => (
                  <motion.div
                    key={item.id}
                    drag
                    dragConstraints={{ left: -100, right: 100, top: -400, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                      if (info.offset.y < -100) {
                        // Mock dropping on target
                        setInventory(prev => prev.filter(i => i.id !== item.id))
                        setInspectedText(`Used ${item.label}!`)
                        if (item.label.includes('Red')) setApprovalScore(prev => Math.min(100, prev + 15))
                      }
                    }}
                    className="w-14 h-14 bg-slate-700 border-2 border-slate-600 rounded-xl flex items-center justify-center text-2xl shadow-inner cursor-grab active:cursor-grabbing shrink-0"
                  >
                    {item.emoji}
                  </motion.div>
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
                className="absolute left-[70%] top-[30%] pointer-events-auto"
                onClick={handleTapTarget}
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/50 animate-ping absolute -inset-2" />
                <div className="w-12 h-12 rounded-full border-4 border-white/80 bg-white/20 flex items-center justify-center backdrop-blur-sm cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                  <span className="text-white font-bold text-xl">◎</span>
                </div>
              </div>

              {/* Source (Draggable) */}
              <motion.div
                className="absolute left-[30%] top-[40%] pointer-events-auto cursor-grab active:cursor-grabbing z-50"
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

          {(interruptType === 'select' || interruptType === 'pressure_choice') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-12 inset-x-4 flex flex-col gap-3 z-50"
              onPointerDown={() => setIsPausedByHold(true)}
              onPointerUp={() => setIsPausedByHold(false)}
              onPointerLeave={() => setIsPausedByHold(false)}
            >
              {!selectedOption ? (
                <>
                  {/* Telltale-style 5.0s glowing countdown bar */}
                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-2 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                    <motion.div
                      className={`h-full ${timeLeft < 1.5 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'}`}
                      style={{ width: `${(timeLeft / 5) * 100}%` }}
                      layout
                    />
                  </div>

                  {['It was fine.', 'I learned a lot!', '... (Silence / سکوت)'].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        setSelectedOption(opt)
                        if (opt.includes('Silence')) {
                          setApprovalScore(prev => Math.max(0, prev - 15))
                        } else {
                          setApprovalScore(prev => Math.min(100, prev + 15))
                        }
                        setTimeout(() => onInterruptComplete(), 1000)
                      }}
                      className="w-full text-left px-6 py-4 bg-black/60 hover:bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium transition-colors active:bg-white/20"
                    >
                      {opt}
                    </button>
                  ))}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full text-center px-6 py-6 bg-black/80 backdrop-blur-md border border-white/30 rounded-xl text-white font-bold"
                >
                  <div className="mb-2 text-amber-400 text-sm" dir="rtl">
                    {selectedOption.includes('Silence') ? 'سکوت طولانی باعث ناامیدی دایی‌جان شد!' : 'انتخاب ثبت شد'}
                  </div>
                  {selectedOption}
                </motion.div>
              )}
            </motion.div>
          )}

          {interruptType === 'document_inspection' && (
            <VisaDocument onComplete={() => onInterruptComplete()} />
          )}

          {interruptType === 'walk_away' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-[50%] top-[25%] -translate-x-1/2 pointer-events-auto z-50"
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
                <span className="text-white text-sm font-medium mt-4 px-3 py-1 bg-black/50 rounded-full backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity" dir="rtl">
                  ترک کردن
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}



const EP1_SCENES = [
  {
    narrator: "من امین، در یک خانواده مذهبی در خانه مادربزرگم به دنیا اومدم؛ جایی که دخترخاله‌ام سارا در همان شب به دنیا اومد. این بود که همیشه برای ما یک کیک تولد می‌گرفتن که سر اون هم دعوا بود!",
    desc: "امین و سارا برای فوت کردن شمع کیک تولد همدیگر را هل می‌دهند و سارا کیک تولد را می‌کوبد توی صورت امین و مهمان‌ها قاه‌قاه می‌خندند!",
    bg: "bg-gradient-to-br from-amber-600 to-red-900",
    art: <svg viewBox='0 0 100 100' className='w-32 h-32'><rect x='20' y='50' width='60' height='40' fill='#fcd34d'/><rect x='30' y='30' width='40' height='20' fill='#f472b6'/><path d='M45 10 L50 25 L55 10 Z' fill='#ef4444'/></svg>
  },
  {
    narrator: "به طور کلی ما از بچگی با هم سر جنگ داشتیم سر هر چیز مسخره، حتی قاشق و چنگال!",
    desc: "سر میز ناهار، امین چنگال را به زور از دست سارا می‌کشد، سارا جیغ می‌زند و امین به شکل طنز و اغراق‌آمیز با چنگال به سارا حمله می‌کند.",
    bg: "bg-gradient-to-br from-orange-700 to-amber-900",
    art: <svg viewBox='0 0 100 100' className='w-32 h-32'><path d='M40 20 v40 h20 v-40 h-5 v30 h-10 v-30 Z M50 60 v30 h-2 v-30 Z' fill='#94a3b8'/></svg>
  },
  {
    narrator: "و البته سنگین‌ترین رقابت ما از زمانی شروع شد که رفتیم مدرسه. اولش سر امتحانات برای هم کری می‌خوندیم که کی نمره‌ش بالاتر می‌شه و کم‌کم قضیه ناموسی شده بود؛ جوری که حاضر بودم هرطور شده نمره بالاتر بگیرم!",
    desc: "امین سر جلسه امتحان در حال نگاه کردن به برگه تقلب است که معلم بالای سرش ظاهر می‌شود، مچش را می‌گیرد و می‌گوید: «خاک بر سرت، تو آخر درس یاد نمی‌گیری!»",
    bg: "bg-gradient-to-br from-slate-700 to-slate-900",
    art: <svg viewBox='0 0 100 100' className='w-32 h-32'><rect x='20' y='10' width='60' height='80' fill='#f8fafc' stroke='#334155' strokeWidth='4'/><line x1='30' y1='30' x2='70' y2='30' stroke='#334155' strokeWidth='4'/><line x1='30' y1='50' x2='70' y2='50' stroke='#334155' strokeWidth='4'/><line x1='30' y1='70' x2='50' y2='70' stroke='#334155' strokeWidth='4'/></svg>
  },
  {
    narrator: "خب چیکار می‌کردم؟ ها؟ هرچقدر هم بخونم سارا باهوش‌تره، اصلاً بهتره ولش کن \"مدرسه که مهم نیست\"... تا این جمله رو گفتم...",
    desc: "سارا رو به مادرش می‌گوید: «مامان می‌خوام برم کلاس زبان!» و مادرش با محبت می‌گوید: «قربونت برم فردا عصر می‌ریم برای ثبت‌نام.»",
    bg: "bg-gradient-to-br from-blue-700 to-indigo-900",
    art: <svg viewBox='0 0 100 100' className='w-32 h-32'><circle cx='50' cy='40' r='30' fill='#fef08a'/><rect x='40' y='70' width='20' height='20' fill='#94a3b8'/></svg>
  },
  {
    narrator: "کلاس هفتم بودیم که این فاجعه رخ داد! من تو ریاضی و فارسی موندم، حالا برم زبان! اشکالی نداره، بالاخره هرکسی یه استعدادی داره؛ شاید من ریاضی‌م خوب نباشه اما زبانم قطعاً از سارا می‌زنه جلو و بالاخره پوزشو به خاک می‌مالم! دختره پررو!",
    desc: "در کلاس زبان، معلم سؤالی از امین می‌پرسد و امین عرق می‌ریزد و «اِن و مِن» می‌کند؛ سارا دستش را بالا می‌برد، جواب می‌دهد و رو به امین می‌گوید: «خنگ خدا! برو بشین کتاب زبان هفتم رو بخون، سال دیگه بازم زبان داریم حداقل توی مدرسه بلد باشی!»",
    bg: "bg-gradient-to-br from-cyan-700 to-blue-900",
    art: <svg viewBox='0 0 100 100' className='w-32 h-32'><circle cx='50' cy='30' r='20' fill='#fca5a5'/><path d='M20 90 Q 50 60 80 90' fill='none' stroke='#fca5a5' strokeWidth='8'/><line x1='80' y1='60' x2='90' y2='20' stroke='#fca5a5' strokeWidth='8'/></svg>
  },
  {
    narrator: "ای بابا، پس اینم هیچی... البته شاید توی نقاشی خوب باشم! به مامانم گفتم می‌خوام برم کلاس نقاشی.",
    desc: "امین در حیاط خانه به مادرش می‌گوید می‌خواهد برود کلاس نقاشی و مادرش با دمپایی می‌افتد دنبال امین دور حوض آبی حیاط!",
    bg: "bg-gradient-to-br from-sky-600 to-cyan-900",
    art: <svg viewBox='0 0 100 100' className='w-32 h-32'><path d='M30 80 Q 20 20 50 20 Q 80 20 70 80 Z' fill='#38bdf8'/><path d='M50 20 L40 50 M50 20 L60 50' stroke='#0284c7' strokeWidth='6'/></svg>
  },
  {
    narrator: "ولی بالاخره راضی شد! مامانو می‌گم. رفتیم کلاس نقاشی ولی از شانس من، معلم زبانمون معلم نقاشی‌مون هم بود! مگه می‌شه؟!",
    desc: "همان معلم زبان با یک کتاب نقاشی بزرگ ایستاده، کتاب را روبه‌روی امین و سارا روی میز می‌گذارد و می‌گوید: «این طرح را رنگ کنید.»",
    bg: "bg-gradient-to-br from-purple-700 to-fuchsia-900",
    art: <svg viewBox='0 0 100 100' className='w-32 h-32'><path d='M20 50 Q 50 10 80 50 Q 50 90 20 50 Z' fill='#fca5a5'/><circle cx='40' cy='40' r='10' fill='#ef4444'/><circle cx='60' cy='40' r='10' fill='#3b82f6'/><circle cx='50' cy='60' r='10' fill='#eab308'/></svg>
  }
]

function Episode1StoryRunner({ onComplete }: { onComplete: () => void }) {
  const [sceneIndex, setSceneIndex] = useState(0)


  // Coloring Game State
  const [coloredParts, setColoredParts] = useState<string[]>([])
  const [gameFailed, setGameFailed] = useState(false)
  const targetColors = ['RED', 'YELLOW', 'GREEN', 'BLUE'] // roof, sun, tree, window

  const handleNext = () => {
    if (sceneIndex < 7) {
      setSceneIndex(sceneIndex + 1)
    }
  }

  const handlePencilClick = (color: string) => {
    const currentPartIndex = coloredParts.length
    if (currentPartIndex >= 4) return

    if (color === targetColors[currentPartIndex]) {
      const newParts = [...coloredParts, color]
      setColoredParts(newParts)
      if (newParts.length === 4) {
        setTimeout(() => setSceneIndex(8), 1000)
      }
    } else {
      setGameFailed(true)
      setTimeout(() => setSceneIndex(8), 1000)
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 overflow-hidden" dir="rtl">
      <TopControls />

      <AnimatePresence mode="wait">
        {sceneIndex < 7 && (
          <motion.div
            key={sceneIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${EP1_SCENES[sceneIndex].bg} flex flex-col items-center justify-center p-6 text-center`}
            onClick={handleNext}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-8xl mb-8 drop-shadow-2xl"
            >
              {EP1_SCENES[sceneIndex].art}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-lg leading-relaxed drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] mb-4 font-bold text-2xl"
            >
              «{EP1_SCENES[sceneIndex].narrator}»
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/70 text-sm italic bg-black/20 p-3 rounded-lg border border-white/5"
            >
              {EP1_SCENES[sceneIndex].desc}
            </motion.div>

            <div className="absolute bottom-6 right-6 text-white/50 text-sm animate-pulse">
              برای ادامه ضربه بزنید...
            </div>
          </motion.div>
        )}

        {sceneIndex === 7 && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#2d1b11] flex flex-col items-center justify-center p-4"
          >
            <div className="text-amber-200 text-lg mb-4 text-center font-bold px-4 py-2 bg-black/30 rounded-full border border-amber-900/50 shadow-lg">
              «ای بابا! این مدادها که همه مشکی‌ان! فقط رنگش رو روش نوشته اونم به انگلیسی!»
            </div>

            {/* Book */}
            <div className="flex bg-white w-full max-w-[400px] h-64 rounded-lg shadow-2xl overflow-hidden mb-6 relative">
              {/* Left Page (Reference) */}
              <div className="w-1/2 border-l border-slate-300 p-2 flex flex-col items-center justify-center bg-amber-50">
                 <div className="relative w-32 h-32">
                    {/* Sun */}
                    <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-yellow-400 border-2 border-slate-800" />
                    {/* House */}
                    <div className="absolute bottom-0 left-4 w-24 h-20 bg-amber-100 border-2 border-slate-800" />
                    {/* Roof */}
                    <div className="absolute bottom-20 left-2 w-28 h-12 bg-red-500 border-2 border-slate-800" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                    {/* Window */}
                    <div className="absolute bottom-6 left-12 w-8 h-8 bg-blue-400 border-2 border-slate-800" />
                    {/* Tree */}
                    <div className="absolute bottom-0 -right-2 w-8 h-20 bg-green-500 border-2 border-slate-800 rounded-t-full" />
                 </div>
              </div>
              {/* Right Page (Outline to color) */}
              <div className="w-1/2 p-2 flex flex-col items-center justify-center relative">
                 <div className="relative w-32 h-32">
                    {/* Sun */}
                    <div className={`absolute top-0 right-0 w-8 h-8 rounded-full border-2 border-slate-800 transition-colors duration-500 ${coloredParts.includes('YELLOW') ? 'bg-yellow-400' : 'bg-transparent'}`} />
                    {/* House (Base) */}
                    <div className="absolute bottom-0 left-4 w-24 h-20 bg-transparent border-2 border-slate-800" />
                    {/* Roof */}
                    <div className={`absolute bottom-20 left-2 w-28 h-12 border-2 border-slate-800 transition-colors duration-500 ${coloredParts.includes('RED') ? 'bg-red-500' : 'bg-transparent'}`} style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                    {/* Window */}
                    <div className={`absolute bottom-6 left-12 w-8 h-8 border-2 border-slate-800 transition-colors duration-500 ${coloredParts.includes('BLUE') ? 'bg-blue-400' : 'bg-transparent'}`} />
                    {/* Tree */}
                    <div className={`absolute bottom-0 -right-2 w-8 h-20 border-2 border-slate-800 rounded-t-full transition-colors duration-500 ${coloredParts.includes('GREEN') ? 'bg-green-500' : 'bg-transparent'}`} />

                    {/* Amin's Hand pointing at the next target */}
                    {coloredParts.length < 4 && !gameFailed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
                        transition={{ y: { repeat: Infinity, duration: 1 } }}
                        className="absolute z-10 text-3xl drop-shadow-lg"
                        style={{
                          top: coloredParts.length === 0 ? '50%' : // Roof
                               coloredParts.length === 1 ? '-10%' : // Sun
                               coloredParts.length === 2 ? '60%' : // Tree
                               '60%', // Window
                          left: coloredParts.length === 0 ? '30%' : // Roof
                                coloredParts.length === 1 ? '70%' : // Sun
                                coloredParts.length === 2 ? '90%' : // Tree
                                '30%' // Window
                        }}
                      >
                        👇
                      </motion.div>
                    )}
                 </div>
              </div>
            </div>

            {/* Pencils */}
            <div className="flex flex-wrap justify-center gap-3 w-full max-w-[400px]">
              {['RED', 'BLUE', 'YELLOW', 'GREEN', 'PURPLE', 'ORANGE'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => handlePencilClick(color)}
                  disabled={gameFailed || coloredParts.length >= 4}
                  className="w-16 h-32 bg-slate-900 border-2 border-slate-700 rounded-t-full flex items-center justify-center relative overflow-hidden group shadow-xl active:scale-95 transition-transform"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
                  <div className="text-white font-bold text-xs rotate-[-90deg] tracking-widest pointer-events-none">
                    {color}
                  </div>
                  {/* Pencil Tip */}
                  <div className="absolute top-0 inset-x-0 h-8 bg-slate-800 rounded-t-full border-b border-slate-700 pointer-events-none" />
                </button>
              ))}
            </div>

          </motion.div>
        )}

        {sceneIndex === 8 && (
          <motion.div
            key="ending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 flex flex-col justify-between ${!gameFailed ? 'bg-gradient-to-br from-green-700 to-emerald-900' : 'bg-gradient-to-br from-red-700 to-rose-900'} p-4`}
          >
            {/* Scene Header */}
            <div className="mt-20 text-center">
               {!gameFailed ? (
                 <>
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ type: 'spring', bounce: 0.5 }} className="text-8xl drop-shadow-2xl mb-4">👦</motion.div>
                   <div className="text-white text-2xl font-bold bg-black/40 px-6 py-3 rounded-xl inline-block shadow-xl border border-white/20">
                     «به‌به به این هوش و ذکاوتم!»
                   </div>
                 </>
               ) : (
                 <>
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ type: 'spring', bounce: 0.5 }} className="text-8xl drop-shadow-2xl mb-4">👧</motion.div>
                   <div className="text-white text-2xl font-bold bg-black/40 px-6 py-3 rounded-xl inline-block shadow-xl border border-white/20">
                     «ای بابا، سارا برنده شد!»
                   </div>
                 </>
               )}
            </div>

            {/* Bottom Educational Box */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-t-2xl p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center w-full max-w-[430px] mx-auto"
            >
              <h3 className="text-slate-800 font-bold text-lg mb-4">رنگ‌های یاد گرفته شده</h3>

              <div className="flex flex-wrap justify-center gap-2 mb-6" dir="ltr">
                {[
                  { en: 'RED', fa: 'قرمز', bg: 'bg-red-500' },
                  { en: 'YELLOW', fa: 'زرد', bg: 'bg-yellow-400' },
                  { en: 'GREEN', fa: 'سبز', bg: 'bg-green-500' },
                  { en: 'BLUE', fa: 'آبی', bg: 'bg-blue-500' },
                  { en: 'PURPLE', fa: 'بنفش', bg: 'bg-purple-500' },
                  { en: 'ORANGE', fa: 'نارنجی', bg: 'bg-orange-500' }
                ].map((c, i) => (
                  <motion.div
                    key={c.en}
                    initial={gameFailed ? { opacity: 0, scale: 0.5 } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: gameFailed ? i * 0.2 + 1 : 0 }}
                    className={`${c.bg} text-white px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-md text-sm`}
                  >
                    <span className="font-bold">{c.en}</span>
                    <span className="opacity-75">|</span>
                    <span dir="rtl">{c.fa}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => onComplete()}
                  className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
                >
                  ادامه
                </button>
                <button
                  type="button"
                  onClick={() => { /* Mock Add to Leitner */ alert('اضافه شد!') }}
                  className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-amber-400 active:scale-95 transition-all flex justify-center items-center gap-2"
                >
                  <span>نشان‌دار کردن</span>
                  <span className="text-xl">🔖</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
