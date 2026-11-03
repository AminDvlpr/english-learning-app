"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { InteractiveCheckpointBlock } from '@/types'
import { Button } from '@/components/ui/button'
import { UI_SPRING } from '@/lib/motion-tokens'

interface Props {
  block: InteractiveCheckpointBlock
  onSubmit: (id: string) => void
}

export function BranchingDecisionExercise({ block, onSubmit }: Props) {
  return (
    <div className="flex flex-col gap-3" dir="ltr">
      {block.question.options?.map((opt, i) => (
        <motion.div
          key={opt.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...UI_SPRING, delay: i * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="w-full justify-start font-mono h-auto py-4 px-6 text-left whitespace-normal text-base shadow-sm hover:shadow-md transition-shadow"
            onClick={() => onSubmit(opt.id)}
          >
            {opt.text}
          </Button>
        </motion.div>
      ))}
    </div>
  )
}
