import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Flame, Shield, ShieldAlert } from "lucide-react"
import { useGamificationStore } from "@/store/useGamificationStore"
import { Progress } from "@/components/ui/progress"

export function StreakPopover({ children }: { children: React.ReactNode }) {
  const { streakDays, hasStreakFreeze, activeTimeTodaySec, buyStreakFreeze, gems } = useGamificationStore()

  const progressPercent = Math.min((activeTimeTodaySec / 600) * 100, 100)

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none flex items-center gap-2">
              <Flame className="h-5 w-5 text-warning fill-warning" />
              {streakDays} Day Streak
            </h4>
            <p className="text-sm text-muted-foreground">
              Complete a lesson or practice for 10 minutes to extend your streak!
            </p>
          </div>
          <div className="space-y-2">
             <div className="flex justify-between text-sm">
                 <span>Daily Goal (10 mins)</span>
                 <span>{Math.floor(activeTimeTodaySec / 60)}/10</span>
             </div>
             <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="border-t pt-4 mt-2">
             <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 text-sm">
                    {hasStreakFreeze ? (
                        <Shield className="h-4 w-4 text-primary" />
                    ) : (
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>Streak Freeze</span>
                 </div>
                 {!hasStreakFreeze && (
                     <Button variant="outline" size="sm" onClick={buyStreakFreeze} disabled={gems < 50}>
                         Buy (50 Gems)
                     </Button>
                 )}
                 {hasStreakFreeze && (
                     <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">Equipped</span>
                 )}
             </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
