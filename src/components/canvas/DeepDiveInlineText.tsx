'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DeepDiveData {
  id: string;
  triggerText: string;
  title: string;
  category?: string;
  explanationFa: string;
  examples?: { en: string; fa: string }[];
}

export interface HighlightWord {
  word: string;
  color: 'purple' | 'magenta' | 'emerald' | 'cyan';
  hasSparkle?: boolean;
}

export interface DeepDiveInlineTextProps {
  text: string;
  deepDives?: DeepDiveData[];
  highlightWords?: HighlightWord[];
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
}

const COLOR_MAP = {
  purple: 'text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.75)]',
  magenta: 'text-fuchsia-400 drop-shadow-[0_0_14px_rgba(232,121,249,0.8)]',
  emerald: 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.75)]',
  cyan: 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.75)]',
};

const SparkleIcon = () => (
  <motion.svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mx-1 -mt-1 text-current"
    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
  >
    <path
      d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z"
      fill="currentColor"
    />
  </motion.svg>
);

export function DeepDiveInlineText({
  text,
  deepDives = [],
  highlightWords = [],
  onOpenChange,
  className,
}: DeepDiveInlineTextProps) {
  const [activeDeepDive, setActiveDeepDive] = useState<DeepDiveData | null>(null);

  const parsedContent = useMemo(() => {
    // 1. Process inline syntax [[phrase|Title|Explanation in Persian]]
    // 2. Process highlightWords
    // 3. Process deepDives triggers

    let segments: { type: 'text' | 'deepDive' | 'highlight'; content: string; data?: unknown }[] = [{ type: 'text', content: text }];

    // Inline syntax processing
    const inlineRegex = /\[\[(.*?)\|(.*?)\|(.*?)\]\]/g;
    let newSegments: typeof segments = [];
    segments.forEach((seg) => {
      if (seg.type !== 'text') {
        newSegments.push(seg);
        return;
      }
      let lastIndex = 0;
      let match;
      inlineRegex.lastIndex = 0;
      while ((match = inlineRegex.exec(seg.content)) !== null) {
        if (match.index > lastIndex) {
          newSegments.push({ type: 'text', content: seg.content.substring(lastIndex, match.index) });
        }
        newSegments.push({
          type: 'deepDive',
          content: match[1],
          data: {
            id: `inline-${match.index}`,
            triggerText: match[1],
            title: match[2],
            explanationFa: match[3],
          },
        });
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < seg.content.length) {
        newSegments.push({ type: 'text', content: seg.content.substring(lastIndex) });
      }
    });
    segments = newSegments;

    // Process explicit deepDives
    deepDives.forEach((dd) => {
      newSegments = [];
      segments.forEach((seg) => {
        if (seg.type !== 'text') {
          newSegments.push(seg);
          return;
        }
        const regex = new RegExp(`(${dd.triggerText})`, 'gi');
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(seg.content)) !== null) {
          if (match.index > lastIndex) {
            newSegments.push({ type: 'text', content: seg.content.substring(lastIndex, match.index) });
          }
          newSegments.push({ type: 'deepDive', content: match[0], data: dd });
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < seg.content.length) {
          newSegments.push({ type: 'text', content: seg.content.substring(lastIndex) });
        }
      });
      segments = newSegments;
    });

    // Process highlights
    highlightWords.forEach((hw) => {
      newSegments = [];
      segments.forEach((seg) => {
        if (seg.type !== 'text') {
          newSegments.push(seg);
          return;
        }
        const regex = new RegExp(`(${hw.word})`, 'gi');
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(seg.content)) !== null) {
          if (match.index > lastIndex) {
            newSegments.push({ type: 'text', content: seg.content.substring(lastIndex, match.index) });
          }
          newSegments.push({ type: 'highlight', content: match[0], data: hw });
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < seg.content.length) {
          newSegments.push({ type: 'text', content: seg.content.substring(lastIndex) });
        }
      });
      segments = newSegments;
    });

    return segments;
  }, [text, deepDives, highlightWords]);

  const handleOpen = (dd: DeepDiveData) => {
    setActiveDeepDive(dd);
    onOpenChange?.(true);
  };

  const handleClose = () => {
    setActiveDeepDive(null);
    onOpenChange?.(false);
  };

  const playTTS = (textToSpeak: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <div className={cn('text-lg leading-relaxed text-neutral-800 dark:text-neutral-200', className)} dir="ltr">
        {parsedContent.map((seg, i) => {
          if (seg.type === 'deepDive') {
            return (
              <span
                key={i}
                className="relative inline-flex items-baseline cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen(seg.data as DeepDiveData);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                data-interactive="true"
              >
                <span className="border-b-2 border-dotted border-emerald-500/50 dark:border-emerald-400/50 group-hover:border-emerald-500 transition-colors">
                  {seg.content}
                </span>
                <span className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-[10px] text-emerald-600 dark:text-emerald-400 align-super">
                  ✨
                </span>
              </span>
            );
          }
          if (seg.type === 'highlight') {
            const hw = seg.data as HighlightWord;
            return (
              <span key={i} className={cn('font-medium relative inline-flex items-center', COLOR_MAP[hw.color])}>
                {seg.content}
                {hw.hasSparkle && <SparkleIcon />}
              </span>
            );
          }
          return <span key={i}>{seg.content}</span>;
        })}
      </div>

      {/* Notion-Style Deep Dive Drawer */}
      <AnimatePresence>
        {activeDeepDive && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-white dark:bg-neutral-900 rounded-t-3xl shadow-2xl p-6 pb-8 border-t border-neutral-200 dark:border-neutral-800"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-6" />

              <div className="flex items-start justify-between mb-4">
                <div>
                  {activeDeepDive.category && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 mb-2 inline-block uppercase tracking-wider">
                      {activeDeepDive.category}
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white" dir="ltr">
                    {activeDeepDive.title}
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium" dir="rtl">
                  {activeDeepDive.explanationFa}
                </p>

                {activeDeepDive.examples && activeDeepDive.examples.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Examples
                    </h4>
                    {activeDeepDive.examples.map((ex, i) => (
                      <div key={i} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <p className="text-base font-medium text-neutral-900 dark:text-neutral-100" dir="ltr">
                            {ex.en}
                          </p>
                          <button
                            onClick={() => playTTS(ex.en)}
                            className="p-1.5 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400" dir="rtl">
                          {ex.fa}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleClose}
                  className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-xl active:scale-95 transition-transform"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
