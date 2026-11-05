import * as React from "react"
import { motion } from "framer-motion"
import { CalloutBlock as CalloutBlockType } from "@/types"
import { BlockLearnerState } from "@/types/lesson"
import { Volume2, Lightbulb, AlertTriangle, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Variants } from "framer-motion"

interface CalloutBlockProps {
  block: CalloutBlockType
  state?: BlockLearnerState
}

const variantStyles = {
  golden_tip: {
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    border: "border-amber-100 dark:border-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-500",
    icon: Lightbulb,
  },
  grammar_warning: {
    bg: "bg-rose-50/50 dark:bg-rose-950/20",
    border: "border-rose-100 dark:border-rose-900/30",
    iconColor: "text-rose-600 dark:text-rose-500",
    icon: AlertTriangle,
  },
  cultural_note: {
    bg: "bg-indigo-50/50 dark:bg-indigo-950/20",
    border: "border-indigo-100 dark:border-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-500",
    icon: Globe,
  },
}

export function CalloutBlock({ block }: CalloutBlockProps) {
  const styles = variantStyles[block.variant]
  const Icon = styles.icon

  const handleSpeak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  }

  const iconVariants: Variants = {
    hidden: { scale: 0.8 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
        delay: 0.1
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "w-full h-full flex flex-col justify-center px-6 py-12 gap-4",
        styles.bg,
      )}
    >
      <div className="flex items-start gap-3">
        <motion.div
          variants={iconVariants}
          className={cn("mt-0.5 shrink-0", styles.iconColor)}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        <div className="flex-1 flex flex-col gap-1.5">
          <h3 className={cn("text-base font-semibold font-sans", styles.iconColor)}>
            {block.title}
          </h3>
          <p className="text-foreground text-sm font-sans leading-relaxed">
            {block.content}
          </p>
        </div>
      </div>

      {block.bilingualExample && (
        <div className="mt-3 bg-white/40 dark:bg-slate-900/40 rounded-md p-4 border border-slate-200/30 dark:border-slate-800/30">
          <div className="flex justify-between items-start gap-4 mb-2">
            <div dir="ltr" className="text-left font-sans tracking-tight font-bold text-lg text-slate-800 dark:text-slate-200 flex-1">
              &quot;{block.bilingualExample.en}&quot;
            </div>
            <button
              className="shrink-0 p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => handleSpeak(block.bilingualExample!.en)}
              title="Listen to pronunciation"
            >
              <Volume2 className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div dir="rtl" className="text-right text-slate-600 dark:text-slate-400 font-sans text-sm">
            {block.bilingualExample.fa}
          </div>
        </div>
      )}
    </motion.div>
  )
}
