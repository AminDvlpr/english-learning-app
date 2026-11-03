import * as React from "react"
import { motion } from "framer-motion"
import { CalloutBlock as CalloutBlockType } from "@/types"
import { Button } from "@/components/ui/button"
import { useLearnerStore } from "@/store/useLearnerStore"
import { BlockLearnerState } from "@/types/lesson"
import { Volume2, Lightbulb, AlertTriangle, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Variants } from "framer-motion"

interface CalloutBlockProps {
  block: CalloutBlockType
  state: BlockLearnerState
}

const variantStyles = {
  golden_tip: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900/50",
    iconColor: "text-amber-500 dark:text-amber-400",
    icon: Lightbulb,
  },
  grammar_warning: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-900/50",
    iconColor: "text-rose-500 dark:text-rose-400",
    icon: AlertTriangle,
  },
  cultural_note: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-900/50",
    iconColor: "text-indigo-500 dark:text-indigo-400",
    icon: Globe,
  },
}

export function CalloutBlock({ block, state }: CalloutBlockProps) {
  const completeContentBlock = useLearnerStore(s => s.completeContentBlock)
  const isCompleted = state === 'completed'
  const isActive = state === 'active'

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
        "flex flex-col gap-4 p-6 rounded-xl border shadow-sm",
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start gap-4">
        <motion.div
          variants={iconVariants}
          className={cn("p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm shrink-0", styles.iconColor)}
        >
          <Icon className="w-6 h-6" />
        </motion.div>

        <div className="flex-1 flex flex-col gap-2 pt-1">
          <h3 className={cn("text-lg font-semibold", styles.iconColor)}>
            {block.title}
          </h3>
          <p className="text-foreground leading-relaxed">
            {block.content}
          </p>
        </div>
      </div>

      {block.bilingualExample && (
        <div className="mt-2 bg-white/60 dark:bg-slate-900/60 rounded-lg p-4 border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div dir="ltr" className="text-left font-medium text-lg text-slate-800 dark:text-slate-200 font-serif flex-1">
              &quot;{block.bilingualExample.en}&quot;
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
              onClick={() => handleSpeak(block.bilingualExample!.en)}
              title="Listen to pronunciation"
            >
              <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
          <div dir="rtl" className="text-right text-slate-600 dark:text-slate-400 font-vazirmatn">
            {block.bilingualExample.fa}
          </div>
        </div>
      )}

      {isActive && (
        <Button
          variant="outline"
          className="mt-2 w-full sm:w-auto self-start bg-background/50 hover:bg-background"
          onClick={() => completeContentBlock(block.blockId)}
        >
          Continue / مطالعه شد و ادامه (+5 XP)
        </Button>
      )}

      {isCompleted && (
        <div className="mt-2 w-full sm:w-auto self-start px-4 py-2 bg-black/5 dark:bg-white/5 text-muted-foreground rounded-md text-sm font-medium text-center">
          Completed
        </div>
      )}
    </motion.div>
  )
}
