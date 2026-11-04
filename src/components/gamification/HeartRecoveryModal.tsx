import * as React from "react"
import { motion } from "framer-motion"
import { Heart, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGamificationStore } from "@/store/useGamificationStore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function HeartRecoveryModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { hearts, lastHeartLossTime, restoreHeart } = useGamificationStore()
  const [timeLeft, setTimeLeft] = React.useState<number>(0)
  const [isPracticing, setIsPracticing] = React.useState(false)
  const [practiceStep, setPracticeStep] = React.useState(0)

  React.useEffect(() => {
    let interval: NodeJS.Timeout

    if (open && hearts < 5 && lastHeartLossTime) {
      const updateTimer = () => {
        const now = Date.now()
        const elapsed = now - lastHeartLossTime
        const remaining = (30 * 60 * 1000) - (elapsed % (30 * 60 * 1000))
        setTimeLeft(Math.max(0, remaining))
      }

      updateTimer()
      interval = setInterval(updateTimer, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [open, hearts, lastHeartLossTime])

  const handleStartPractice = () => {
      setIsPracticing(true)
      setPracticeStep(0)
  }

  const handleAnswer = () => {
      if (practiceStep === 0) {
          setPracticeStep(1)
      } else {
          restoreHeart()
          setIsPracticing(false)
          onOpenChange(false)
      }
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <Heart className="h-5 w-5 text-destructive fill-destructive" />
             {hearts === 5 ? 'Hearts Full' : 'Heart Recovery'}
          </DialogTitle>
          <DialogDescription>
            {hearts === 5 ? 'You have maximum hearts!' : 'Practice to recover a heart instantly.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
            {!isPracticing ? (
                <>
                    <div className="flex gap-2 mb-6">
                        {[...Array(5)].map((_, i) => (
                            <Heart
                                key={i}
                                className={`h-8 w-8 ${i < hearts ? 'text-destructive fill-destructive' : 'text-muted stroke-muted-foreground'}`}
                            />
                        ))}
                    </div>

                    {hearts < 5 && (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <div className="flex items-center gap-2 text-muted-foreground font-mono bg-muted px-4 py-2 rounded-md">
                                <Clock className="h-4 w-4" />
                                Next heart in {formatTime(timeLeft)}
                            </div>

                            <div className="relative w-full text-center my-2 text-sm text-muted-foreground">
                                <span className="bg-background px-2 relative z-10">OR</span>
                                <div className="absolute top-1/2 w-full h-px bg-border left-0" />
                            </div>

                            <Button onClick={handleStartPractice} className="w-full h-12" size="lg">
                                Practice to Refill (+1 Heart)
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex flex-col items-center gap-6"
                >
                    <div className="text-center font-medium text-lg">
                        {practiceStep === 0 ? "Translate: 'Hello'" : "Translate: 'Goodbye'"}
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        {practiceStep === 0 ? (
                            <>
                                <Button variant="outline" onClick={handleAnswer}>Hola</Button>
                                <Button variant="outline" onClick={handleAnswer}>Bonjour</Button>
                                <Button variant="outline" onClick={handleAnswer}>Hallo</Button>
                                <Button variant="outline" onClick={handleAnswer}>Ciao</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleAnswer}>Adios</Button>
                                <Button variant="outline" onClick={handleAnswer}>Au revoir</Button>
                                <Button variant="outline" onClick={handleAnswer}>Tschüss</Button>
                                <Button variant="outline" onClick={handleAnswer}>Arrivederci</Button>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
