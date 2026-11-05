'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeepDiveInlineText, DeepDiveData, HighlightWord } from '../DeepDiveInlineText';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DialogueLine {
  id: string;
  character: string;
  avatarUrl: string;
  text: string;
  voiceURI?: string;
  lang?: string;
}

export interface AudioInterrupt {
  triggerAtLineIndex: number;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export interface ListenStorySlideProps {
  id: string;
  title: string;
  dialogueLines: DialogueLine[];
  deepDives?: DeepDiveData[];
  highlightWords?: HighlightWord[];
  interrupts?: AudioInterrupt[];
  isPausedByHold?: boolean;
  onSlideComplete?: () => void;
  className?: string;
}

export function ListenStorySlide({

  title,
  dialogueLines,
  deepDives = [],
  highlightWords = [],
  interrupts = [],
  isPausedByHold = false,
  onSlideComplete,
  className,
}: ListenStorySlideProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1); // -1 means hasn't started
  const [activeInterrupt, setActiveInterrupt] = useState<AudioInterrupt | null>(null);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-scroll to current line
  useEffect(() => {
    if (scrollRef.current && currentLineIndex >= 0) {
      const activeEl = scrollRef.current.children[currentLineIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex]);

  // Handle Play/Pause logic
  useEffect(() => {
    if (isPausedByHold || isDeepDiveOpen || activeInterrupt) {
      if (isPlaying && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      }
    } else if (!isPlaying && currentLineIndex >= 0 && currentLineIndex < dialogueLines.length) {
       // We resume if not explicitly paused.
       // In a real app, user tap to play starts the flow.
    }
  }, [isPausedByHold, isDeepDiveOpen, activeInterrupt, isPlaying, currentLineIndex, dialogueLines.length]);

  const speakLine = (index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (index >= dialogueLines.length) {
      setIsPlaying(false);
      onSlideComplete?.();
      return;
    }

    const line = dialogueLines[index];
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = line.lang || 'en-US';

    // Attempt to set dual-voice if available
    const voices = window.speechSynthesis.getVoices();
    if (line.voiceURI) {
      const selectedVoice = voices.find(v => v.voiceURI === line.voiceURI);
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      // Check for interrupt
      const interrupt = interrupts.find(i => i.triggerAtLineIndex === index);
      if (interrupt) {
        setActiveInterrupt(interrupt);
        setIsPlaying(false);
      } else {
        const nextIndex = index + 1;
        setCurrentLineIndex(nextIndex);
        if (nextIndex < dialogueLines.length) {
          speakLine(nextIndex);
        } else {
          setIsPlaying(false);
          onSlideComplete?.();
        }
      }
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    setCurrentLineIndex(index);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        speakLine(currentLineIndex === -1 ? 0 : currentLineIndex);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleInterruptOption = (isCorrect: boolean) => {
    if (isCorrect) {
      setActiveInterrupt(null);
      const nextIndex = currentLineIndex + 1;
      setCurrentLineIndex(nextIndex);
      if (nextIndex < dialogueLines.length) {
        speakLine(nextIndex);
      } else {
        onSlideComplete?.();
      }
    }
  };

  return (
    <div className={cn("w-full h-full bg-neutral-900 text-white flex flex-col relative", className)}>
      {/* Header */}
      <div className="pt-12 pb-4 px-6 shrink-0 flex items-center justify-between z-10 bg-gradient-to-b from-neutral-900 to-transparent">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
      </div>

      {/* Equalizer Waveform */}
      <div className="h-14 w-full max-w-[280px] mx-auto flex items-end justify-center gap-1 shrink-0 mb-4 px-4 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 max-w-[5px] min-w-[3px] bg-emerald-500 rounded-t-full origin-bottom"
            animate={{
              height: isPlaying ? ['20%', '100%', '30%', '80%', '20%'] : '10%',
            }}
            transition={{
              duration: 1 + Math.random(),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.05
            }}
          />
        ))}
      </div>

      {/* Auto-scrolling Transcript */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 pb-32 space-y-6 scroll-smooth snap-y"
      >
        {dialogueLines.map((line, idx) => {
          const isActive = idx === currentLineIndex;
          const isPast = idx < currentLineIndex;
          return (
            <div
              key={line.id}
              className={cn(
                "flex gap-4 snap-center transition-opacity duration-300",
                isActive ? "opacity-100" : isPast ? "opacity-40" : "opacity-20"
              )}
            >
              <img
                src={line.avatarUrl}
                alt={line.character}
                className={cn(
                  "w-10 h-10 rounded-full object-cover shrink-0 border-2",
                  isActive ? "border-emerald-500" : "border-transparent"
                )}
              />
              <div className="flex-1 pt-1">
                <p className="text-xs text-neutral-400 font-medium mb-1">{line.character}</p>
                <div className={cn(
                  "text-lg font-medium",
                  isActive ? "text-white drop-shadow-md" : "text-neutral-300"
                )}>
                  {/* Using DeepDiveInlineText so dialogue supports Deep Dives */}
                  <DeepDiveInlineText
                    text={line.text}
                    deepDives={deepDives}
                    highlightWords={highlightWords}
                    onOpenChange={setIsDeepDiveOpen}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Interrupt (Frosted Glass Question) */}
      <AnimatePresence>
        {activeInterrupt && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 p-6 pt-8 bg-neutral-800/80 backdrop-blur-xl rounded-t-3xl border-t border-white/10 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-6">{activeInterrupt.question}</h3>
            <div className="flex flex-col gap-3">
              {activeInterrupt.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleInterruptOption(opt.isCorrect)}
                  className="w-full p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 active:scale-95 transition-all text-left font-medium"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
