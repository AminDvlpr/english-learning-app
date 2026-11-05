"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InteractiveCheckpointBlock } from '@/types'
import { Button } from '@/components/ui/button'
import { UI_SPRING } from '@/lib/motion-tokens'

interface Props {
  block: InteractiveCheckpointBlock
  onSubmit: (id: string) => void
}

export function SlotMatchingExercise({ block, onSubmit }: Props) {
  // Shuffle available words initially
  const [availableWords, setAvailableWords] = useState<string[]>([])

  // Array storing the word placed in each slot index, or null if empty
  const [slots, setSlots] = useState<(string | null)[]>([])

  useEffect(() => {
    const expectedSlots = block.question.slots || []
    const words = expectedSlots.map(s => s.expected)
    // Simple shuffle
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    setAvailableWords(shuffled)
    setSlots(new Array(expectedSlots.length).fill(null))
  }, [block.question.slots])

  const handleWordTap = (word: string) => {
    // Find first empty slot
    const firstEmptyIndex = slots.findIndex(s => s === null)
    if (firstEmptyIndex !== -1) {
      const newSlots = [...slots]
      newSlots[firstEmptyIndex] = word
      setSlots(newSlots)
      setAvailableWords(prev => {
        const idx = prev.indexOf(word)
        if (idx === -1) return prev
        const next = [...prev]
        next.splice(idx, 1)
        return next
      })
    }
  }

  const handleSlotTap = (index: number) => {
    const word = slots[index]
    if (word) {
      // Remove from slot, put back into available
      const newSlots = [...slots]
      newSlots[index] = null
      setSlots(newSlots)
      setAvailableWords(prev => [...prev, word])
    }
  }

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, word: string, sourceIndex: number | null) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ word, sourceIndex }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault() // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropToSlot = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault()
    const dataStr = e.dataTransfer.getData('text/plain')
    if (!dataStr) return
    const data = JSON.parse(dataStr)
    const word: string = data.word
    const sourceIndex: number | null = data.sourceIndex

    // If there's already a word in this slot, we handle swapping or rejecting.
    // For simplicity, if target is empty, we place it. If occupied, we swap.
    const currentWordInTarget = slots[targetIndex]

    const newSlots = [...slots]

    if (sourceIndex !== null) {
      // Moving from one slot to another
      newSlots[sourceIndex] = currentWordInTarget
      newSlots[targetIndex] = word
      setSlots(newSlots)
    } else {
      // Moving from available words to a slot
      newSlots[targetIndex] = word
      setSlots(newSlots)

      setAvailableWords(prev => {
        const idx = prev.indexOf(word)
        if (idx === -1) return prev
        const next = [...prev]
        next.splice(idx, 1)
        if (currentWordInTarget) {
            next.push(currentWordInTarget)
        }
        return next
      })
    }
  }

  const handleDropToAvailable = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const dataStr = e.dataTransfer.getData('text/plain')
      if (!dataStr) return
      const data = JSON.parse(dataStr)
      const word: string = data.word
      const sourceIndex: number | null = data.sourceIndex

      if (sourceIndex !== null) {
          // Moving from slot to available words
          const newSlots = [...slots]
          newSlots[sourceIndex] = null
          setSlots(newSlots)
          setAvailableWords(prev => [...prev, word])
      }
  }
  // --------------------------------

  const handleSubmit = () => {
    onSubmit(JSON.stringify(slots))
  }

  const isComplete = slots.every(s => s !== null)

  return (
    <div className="flex flex-col gap-6" dir="ltr">
      <div className="flex flex-wrap gap-2 min-h-16 p-4 rounded-xl bg-black/40 border border-white/20 text-white">
        {slots.map((word, i) => (
          <div
            key={`slot-${i}`}
            onClick={() => handleSlotTap(i)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropToSlot(e, i)}
            className={`
              h-10 min-w-16 rounded-md flex items-center justify-center cursor-pointer transition-colors px-4 font-mono text-sm
              ${word ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-white/10 border-2 border-dashed border-white/30'}
            `}
          >
            {word && (
              <motion.div
                layoutId={`word-${word}`}
                transition={UI_SPRING}
              >
                <div
                  draggable
                  onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, word, i)}
                  className="w-full h-full flex items-center justify-center cursor-grab"
                >
                  {word}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div
        className="flex flex-wrap gap-2 min-h-16 p-2 rounded-xl border border-transparent hover:border-dashed hover:border-border transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDropToAvailable}
      >
        <AnimatePresence>
          {availableWords.map((word, i) => (
            <motion.div
              layoutId={`word-${word}`}
              key={`available-${word}-${i}`}
              transition={UI_SPRING}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, word, null)}
                onClick={() => handleWordTap(word)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-white/30 bg-white/20 hover:bg-white/30 text-white h-10 px-4 py-2 font-mono cursor-pointer backdrop-blur-md"
              >
                {word}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isComplete}
        className="w-full mt-4 transition-all bg-white text-black hover:bg-gray-200"
        size="lg"
      >
        Submit Answer
      </Button>
    </div>
  )
}
