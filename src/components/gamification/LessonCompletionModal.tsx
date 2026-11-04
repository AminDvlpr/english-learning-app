import * as React from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useGamificationStore } from "@/store/useGamificationStore"
import { useLearnerStore } from "@/store/useLearnerStore"
import { Flame, Star, Gem } from "lucide-react"
import { audioFeedback } from "@/lib/audio-feedback"

export function LessonCompletionModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { xp, gems, streakDays, completeLesson } = useGamificationStore()
  const { masteryScore } = useLearnerStore()
  const [hasCompleted, setHasCompleted] = React.useState(false)

  React.useEffect(() => {
    if (open && !hasCompleted) {
      setHasCompleted(true)

      // Fire confetti
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

      const interval: ReturnType<typeof setInterval> = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults, particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        })
      }, 250)

      // Play success chime
      try {
        audioFeedback.playSuccessChime()
      } catch (e) {
        console.error("Audio playback failed", e)
      }

      completeLesson()
    }
  }, [open, hasCompleted, completeLesson])

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-primary/10 to-background border-primary/20">
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex flex-col items-center py-8"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Star className="h-10 w-10 text-primary fill-primary" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Lesson Complete!</h2>
          <p className="text-muted-foreground text-center mb-8">
              Great job! You&apos;ve mastered this topic.
          </p>

          <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-card border shadow-sm rounded-xl p-4 flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1">XP Earned</span>
                  <span className="text-2xl font-bold text-primary">+{xp}</span>
              </div>
              <div className="bg-card border shadow-sm rounded-xl p-4 flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1">Mastery</span>
                  <span className="text-2xl font-bold text-success">{Math.round(masteryScore * 100)}%</span>
              </div>
              <div className="bg-card border shadow-sm rounded-xl p-4 flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Gem className="h-4 w-4 text-info fill-info" /> Gems
                  </span>
                  <span className="text-xl font-bold">+{gems}</span>
              </div>
              <div className="bg-card border shadow-sm rounded-xl p-4 flex flex-col items-center">
                  <span className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Flame className="h-4 w-4 text-warning fill-warning" /> Streak
                  </span>
                  <span className="text-xl font-bold">{streakDays}</span>
              </div>
          </div>

          <Button className="w-full h-12 text-lg" onClick={() => onOpenChange(false)}>
              Continue
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
