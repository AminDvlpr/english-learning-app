'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Gem, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LessonSummaryStashSlideProps {
  xpEarned: number;
  gemsEarned: number;
  keyPhrases: { en: string; fa: string }[];
  onNextLesson?: () => void;
  className?: string;
}

export function LessonSummaryStashSlide({
  xpEarned,
  gemsEarned,
  keyPhrases,
  onNextLesson,
  className,
}: LessonSummaryStashSlideProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, dispatch to store/API
  };

  return (
    <div className={cn("w-full h-full bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-between p-6 relative overflow-hidden", className)}>
      {/* Confetti / Glow Background (Simplified) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
        <div className="w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full absolute top-[-10%]" />
        <div className="w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full absolute bottom-[10%]" />
      </div>

      <div className="w-full flex-1 flex flex-col items-center z-10 pt-12">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-3xl shadow-xl flex items-center justify-center mb-6"
        >
          <Star className="w-12 h-12 text-white fill-current" />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-neutral-900 dark:text-white mb-2"
        >
          Lesson Mastered!
        </motion.h2>

        {/* Rewards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-6 my-8"
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-amber-500">+{xpEarned}</span>
            <span className="text-sm text-neutral-500 font-bold uppercase tracking-widest">XP</span>
          </div>
          <div className="w-px bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-blue-500 flex items-center gap-1">
              +{gemsEarned} <Gem className="w-5 h-5 fill-current" />
            </span>
            <span className="text-sm text-neutral-500 font-bold uppercase tracking-widest">Gems</span>
          </div>
        </motion.div>

        {/* Key Phrases */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800 mb-8"
        >
          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Key Takeaways</h3>
          <div className="space-y-4">
            {keyPhrases.map((phrase, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="font-medium text-neutral-900 dark:text-neutral-100" dir="ltr">{phrase.en}</span>
                <span className="text-sm text-neutral-500" dir="rtl">{phrase.fa}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save Toggle */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleSave}
          className={cn(
            "w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all",
            isSaved
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          )}
        >
          {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          {isSaved ? "Saved to Stash!" : "Save Summary to My Stash / ذخیره خلاصه برای مرور"}
        </motion.button>
      </div>

      {/* Pulsing Next Prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="w-full pb-8 pt-4 flex flex-col items-center z-10 cursor-pointer"
        onClick={onNextLesson}
      >
        <span className="text-sm font-medium text-neutral-500 mb-2 animate-pulse">
          ✨ Scroll down for Next Lesson
        </span>
        <div className="w-6 h-10 border-2 border-neutral-300 dark:border-neutral-700 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-neutral-400 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
