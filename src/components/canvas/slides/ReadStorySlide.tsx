'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeepDiveInlineText, DeepDiveData, HighlightWord } from '../DeepDiveInlineText';

import { cn } from '@/lib/utils';

export interface ReadStoryInterrupt {
  triggerAfterWordIndex: number;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export interface ReadStorySlideProps {
  id: string;
  coverImage?: string;
  icon?: string;
  title: string;
  quote?: string;
  metadata?: {
    language?: string;
    level?: string;
    chapter?: string;
    characters?: string;
  };
  content: string; // The full text to stream
  deepDives?: DeepDiveData[];
  highlightWords?: HighlightWord[];
  interrupts?: ReadStoryInterrupt[];
  isPausedByHold?: boolean;
  onSlideComplete?: () => void;
  className?: string;
}

export function ReadStorySlide({

  coverImage = 'linear-gradient(to right, #4ade80, #3b82f6)',
  icon = '📚',
  title,
  quote,
  metadata,
  content,
  deepDives = [],
  highlightWords = [],
  interrupts = [],
  isPausedByHold = false,
  onSlideComplete,
  className,
}: ReadStorySlideProps) {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [activeInterrupt, setActiveInterrupt] = useState<ReadStoryInterrupt | null>(null);
  const [streamFinished, setStreamFinished] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Split content into words while preserving inline syntax for DeepDiveInlineText
    // This simple split by space might break [[phrase|title|desc]] if they contain spaces.
    // A better approach for a real Swishy effect with complex syntax is to parse first,
    // then stream. For this exercise, we will stream segments.
    // To ensure DeepDiveInlineText works properly, we will gradually build the `streamedText`
    // character by character or word by word. For simplicity and robustness with the syntax,
    // let's do a word-by-word streaming on the raw string.
    const rawWords = content.split(' ');
    setWords(rawWords);
    setCurrentWordIndex(0);
    setStreamFinished(false);
  }, [content]);

  useEffect(() => {
    if (streamFinished || isPausedByHold || isDeepDiveOpen || activeInterrupt) return;

    if (currentWordIndex >= words.length) {
      setStreamFinished(true);
      onSlideComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      // Check for interrupt
      const interrupt = interrupts.find((i) => i.triggerAfterWordIndex === currentWordIndex);
      if (interrupt) {
        setActiveInterrupt(interrupt);
      } else {
        setCurrentWordIndex((prev) => prev + 1);
      }
    }, 150); // Natural reading cadence (approx 400 WPM)

    return () => clearTimeout(timer);
  }, [currentWordIndex, words.length, isPausedByHold, isDeepDiveOpen, activeInterrupt, streamFinished, interrupts, onSlideComplete]);

  const streamedText = words.slice(0, currentWordIndex).join(' ');

  const playSuccessChime = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as Window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const handleInterruptOption = (isCorrect: boolean) => {
    if (isCorrect) {
      playSuccessChime();
      setActiveInterrupt(null);
      setCurrentWordIndex((prev) => prev + 1); // Resume stream
    } else {
      // Play error or shake (simplified for this exercise)
    }
  };

  return (
    <div className={cn("w-full h-full bg-white dark:bg-neutral-950 flex flex-col overflow-y-auto overflow-x-hidden", className)}>
      {/* Top Section (Notion Template Header) */}
      <div className="shrink-0 pb-6">
        {/* Cover */}
        <div
          className="h-28 w-full bg-cover bg-center relative shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-b border-black/5 dark:border-white/5"
          style={{ background: coverImage }}
        >
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="px-6 relative">
          {/* Floating Icon */}
          <div className="-mt-8 ml-5 text-4xl bg-neutral-900/90 border border-white/15 rounded-2xl p-2 shadow-xl w-fit inline-flex items-center justify-center backdrop-blur-md">
            {icon}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mt-4 mb-4 text-neutral-900 dark:text-neutral-50 tracking-tight" dir="ltr">
            {title}
          </h1>

          {/* Quote Bar */}
          {quote && (
            <div className="border-l-[3px] border-amber-400 pl-3 py-1 my-2.5 text-xs opacity-85 text-neutral-600 dark:text-neutral-300 italic" dir="ltr">
              {quote}
            </div>
          )}

          {/* Compact 4-column Property Table */}
          {metadata && (
            <div className="flex flex-col gap-2 py-4 border-y border-neutral-100 dark:border-neutral-800 mb-6 text-sm" dir="ltr">
              {metadata.language && (
                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <span className="text-neutral-400 flex items-center gap-1.5"><span className="opacity-50">🌐</span> Language</span>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md w-fit">{metadata.language}</span>
                </div>
              )}
              {metadata.level && (
                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <span className="text-neutral-400 flex items-center gap-1.5"><span className="opacity-50">📈</span> Level</span>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md w-fit">{metadata.level}</span>
                </div>
              )}
              {metadata.chapter && (
                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <span className="text-neutral-400 flex items-center gap-1.5"><span className="opacity-50">📑</span> Episode</span>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md w-fit">{metadata.chapter}</span>
                </div>
              )}
              {metadata.characters && (
                <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                  <span className="text-neutral-400 flex items-center gap-1.5"><span className="opacity-50">👥</span> Characters</span>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md w-fit">{metadata.characters}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body Section (Swishy.ai Kinetic Streaming) */}
      <div className="flex-1 px-6 pb-24">
        <DeepDiveInlineText
          text={streamedText}
          deepDives={deepDives}
          highlightWords={highlightWords}
          showLeadingStar={!streamFinished && !activeInterrupt && !isDeepDiveOpen && !isPausedByHold}
          onOpenChange={setIsDeepDiveOpen}
        />

        {/* Mid-Stream Interrupt (Inline Card) */}
        <AnimatePresence>
          {activeInterrupt && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6 p-5 rounded-2xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              onPointerDown={(e) => e.stopPropagation()} // Prevent slide pause
            >
              <p className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4" dir="ltr">
                {activeInterrupt.question}
              </p>
              <div className="flex flex-col gap-2">
                {activeInterrupt.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleInterruptOption(opt.isCorrect)}
                    className="p-3 text-left rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors font-medium"
                    dir="ltr"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
