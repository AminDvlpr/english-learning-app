"use client"

import React, { useState, useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { InteractiveCheckpointBlock, BlockLearnerState } from '@/types'
import { Button } from '@/components/ui/button'
import { UI_SPRING } from '@/lib/motion-tokens'

interface Props {
  block: InteractiveCheckpointBlock
  onSubmit: (id: string) => void
  state: BlockLearnerState
}

export function MicroSprintReflexExercise({ block, onSubmit, state }: Props) {
  const [isActive, setIsActive] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const timeLimit = block.question.timeLimitSec || 3
  const controls = useAnimationControls()

  // When the component falls into adaptive-remediation, allow user to retry.
  useEffect(() => {
    if (state === 'adaptive-remediation') {
      setIsActive(false)
      setHasSubmitted(false)
    }
  }, [state])

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isActive && !hasSubmitted) {
      controls.start({
        width: '0%',
        transition: { duration: timeLimit, ease: 'linear' }
      })

      timeout = setTimeout(() => {
        if (!hasSubmitted) {
          setHasSubmitted(true)
          controls.stop()
          onSubmit('timeout')
        }
      }, timeLimit * 1000)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
      controls.stop()
    }
  }, [isActive, timeLimit, controls, onSubmit, hasSubmitted])

  const handleOptionSubmit = (id: string) => {
    if (!hasSubmitted) {
      setHasSubmitted(true)
      controls.stop()
      onSubmit(id)
    }
  }

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-white text-center mb-2 font-medium drop-shadow-md" dir="rtl">
          برای پاسخ به این سوال فقط {timeLimit} ثانیه فرصت دارید.
        </p>
        <Button
          size="lg"
          onClick={() => setIsActive(true)}
          className="w-full sm:w-auto min-w-[200px] text-lg py-6"
        >
          {state === 'adaptive-remediation' ? 'دوباره تلاش کنید' : 'شروع چالش ۳ ثانیه‌ای'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4" dir="ltr">
      {/* Timer Bar */}
      <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full bg-white"
          initial={{ width: '100%' }}
          animate={controls}
        />
      </div>

      {block.question.options?.map((opt, i) => (
        <motion.div
          key={opt.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...UI_SPRING, delay: i * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start font-mono h-auto py-4 px-6 text-left whitespace-normal text-base bg-black/40 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md rounded-2xl transition-all shadow-lg"
            onClick={() => handleOptionSubmit(opt.id)}
            disabled={hasSubmitted}
          >
            {opt.text}
          </Button>
        </motion.div>
      ))}
    </div>
  )
}
