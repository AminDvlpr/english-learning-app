"use client"

import React, { useState } from 'react'
import { InteractiveCheckpointBlock } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  block: InteractiveCheckpointBlock
  onSubmit: (id: string) => void
}

export function StoryQuestionBoxExercise({ block, onSubmit }: Props) {
  const [inputValue, setInputValue] = useState('')

  const wordHints = block.question.options?.map(opt => opt.text) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSubmit(inputValue.trim())
    }
  }

  return (
    <div className="bg-transparent w-full flex flex-col items-center gap-4 relative">
      {/* Story Sticker Box */}
      <div className="bg-white rounded-xl shadow-md w-full max-w-sm overflow-hidden text-center">
        <div className="bg-white py-3 px-4 font-semibold text-gray-800 text-sm border-b">
          Barista asks:
        </div>
        <div className="py-6 px-4 text-gray-900 font-bold text-lg">
          {block.question.prompt}
        </div>
      </div>

      {/* Hints (Optional for styling) */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm mt-2">
        {wordHints.map((hint, idx) => (
          <button
            key={idx}
            type="button"
            className="bg-black/30 hover:bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
            onClick={() => setInputValue(prev => prev ? `${prev} ${hint}` : hint)}
          >
            {hint}
          </button>
        ))}
      </div>

      {/* Story Reply Input Area */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex items-center gap-2 mt-4 bg-black/20 p-1.5 rounded-full backdrop-blur-md border border-white/20">
        <div className="w-8 h-8 rounded-full bg-white/30 flex-shrink-0 flex items-center justify-center text-white text-xs overflow-hidden">
          {/* Avatar placeholder */}
          <span role="img" aria-label="user">👤</span>
        </div>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your polite order in English..."
          className="flex-1 bg-transparent border-none text-white placeholder:text-white/70 focus-visible:ring-0 h-10"
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          className="rounded-full px-4 text-sm font-semibold bg-white text-black hover:bg-gray-200 h-9"
          disabled={!inputValue.trim()}
        >
          Send
        </Button>
      </form>
    </div>
  )
}
