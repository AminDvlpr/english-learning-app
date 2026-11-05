"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useGamificationStore } from "@/store/useGamificationStore"
import { Trophy, ArrowUp, ArrowDown, Minus, Clock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type LeagueTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond'

interface LeaderboardEntry {
  id: string
  name: string
  xp: number
  isCurrentUser?: boolean
  trend: 'up' | 'down' | 'flat'
}

// Generate deterministic mock peers
const generateMockPeers = (userXP: number): LeaderboardEntry[] => {
  const peers: LeaderboardEntry[] = [
    { id: '1', name: 'Sara A.', xp: 450, trend: 'up' as const },
    { id: '2', name: 'Reza B.', xp: 410, trend: 'flat' },
    { id: '3', name: 'Nima K.', xp: 380, trend: 'down' },
    { id: '4', name: 'Maryam S.', xp: 320, trend: 'up' as const },
    { id: '5', name: 'Ali D.', xp: 290, trend: 'flat' },
    { id: '6', name: 'Mina T.', xp: 210, trend: 'down' },
    { id: '7', name: 'Farhad M.', xp: 150, trend: 'up' as const },
    { id: '8', name: 'Leyla P.', xp: 90, trend: 'flat' },
    { id: '9', name: 'Hamed R.', xp: 40, trend: 'down' },
  ];

  // Adjust a couple peers based on user XP to ensure they are competitive
  peers[3].xp = userXP + 25;
  peers[4].xp = Math.max(0, userXP - 15);

  return peers;
}

export function TieredLeaguesBoard() {
  const { xp } = useGamificationStore()
  const [mounted, setMounted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [userName, setUserName] = React.useState("شما")

  useEffect(() => {
    setMounted(true)

    const savedName = localStorage.getItem('english-app-user-name')
    if (savedName) setUserName(savedName)

    // Calculate mock time remaining for weekly sprint (e.g., reset on Sunday night)
    const calculateTimeRemaining = () => {
        const now = new Date()
        const endOfWeek = new Date(now)
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()) % 7) // Next Sunday
        endOfWeek.setHours(23, 59, 59, 999)
        if (now.getDay() === 0) endOfWeek.setDate(now.getDate() + 7) // If today is Sunday, end is next Sunday

        const diff = endOfWeek.getTime() - now.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        setTimeRemaining(`${days}d ${hours}h`)
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000 * 60 * 60) // Update every hour
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  // Determine current tier based on absolute XP for this mock
  let currentTier: LeagueTier = 'Bronze'
  if (xp >= 1000) currentTier = 'Diamond'
  else if (xp >= 500) currentTier = 'Gold'
  else if (xp >= 200) currentTier = 'Silver'

  const tierColors = {
    Bronze: 'text-amber-700 bg-amber-700/10 border-amber-700/20',
    Silver: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    Gold: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    Diamond: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
  }

  const tierNames = {
    Bronze: 'لیگ برنز',
    Silver: 'لیگ نقره‌ای',
    Gold: 'لیگ طلایی',
    Diamond: 'لیگ الماس'
  }

  const allEntries: LeaderboardEntry[] = [
    ...generateMockPeers(xp),
    { id: 'me', name: userName, xp: xp, isCurrentUser: true, trend: 'up' as const }
  ].sort((a, b) => b.xp - a.xp)

  const userRank = allEntries.findIndex(e => e.id === 'me') + 1
  const isInPromotionZone = userRank <= 3

  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex flex-col" dir="rtl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
           <div>
             <CardTitle className="text-lg flex items-center gap-2">
               <Trophy className="w-5 h-5 text-warning" /> رنکینگ
             </CardTitle>
             <CardDescription>۳ نفر اول به لیگ بعدی صعود می‌کنند</CardDescription>
           </div>
           <div className={cn("px-3 py-1.5 rounded-md border text-sm font-bold shadow-sm", tierColors[currentTier])}>
              {tierNames[currentTier]}
           </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col p-0 px-6 pb-6">

        <div className="flex justify-between text-xs font-semibold text-muted-foreground pb-2 mb-2 border-b border-border/50">
           <span>رتبه</span>
           <span className="text-left flex items-center gap-1" dir="ltr">
             <Clock className="w-3 h-3" /> {timeRemaining.replace('d', ' روز').replace('h', ' ساعت')}
           </span>
        </div>

        <div className="overflow-y-auto overflow-x-hidden pr-2 space-y-1.5 flex-1 custom-scrollbar">
           {allEntries.map((entry, index) => {
              const rank = index + 1
              const isPromo = rank <= 3

              return (
                 <div
                    key={entry.id}
                    className={cn(
                       "flex items-center justify-between p-2 rounded-lg transition-colors",
                       entry.isCurrentUser
                          ? "bg-primary/10 border border-primary/20 shadow-sm"
                          : "hover:bg-secondary/50",
                       isPromo && !entry.isCurrentUser && "bg-success/5 border border-success/10"
                    )}
                 >
                    <div className="flex items-center gap-3">
                       <div className={cn(
                          "w-6 text-center font-bold text-sm",
                          rank === 1 ? "text-yellow-500" : rank === 2 ? "text-slate-400" : rank === 3 ? "text-amber-700" : "text-muted-foreground"
                       )}>
                          {rank}
                       </div>
                       <Avatar className="h-8 w-8 border border-border/50 shadow-sm">
                          <AvatarFallback className={entry.isCurrentUser ? "bg-primary text-primary-foreground font-bold" : "bg-secondary text-secondary-foreground text-xs"}>
                             {entry.name.substring(0,2).toUpperCase()}
                          </AvatarFallback>
                       </Avatar>
                       <span className={cn("font-medium text-sm", entry.isCurrentUser && "font-bold text-primary")}>
                          {entry.name}
                       </span>
                    </div>

                    <div className="flex items-center gap-3">
                       <span className={cn("text-sm font-bold", entry.isCurrentUser ? "text-primary" : "text-foreground")}>
                          {entry.xp} امتیاز
                       </span>
                       <div className="w-4 flex justify-center">
                          {entry.trend === 'up' && <ArrowUp className="w-3 h-3 text-success" />}
                          {entry.trend === 'down' && <ArrowDown className="w-3 h-3 text-destructive" />}
                          {entry.trend === 'flat' && <Minus className="w-3 h-3 text-muted-foreground" />}
                       </div>
                    </div>
                 </div>
              )
           })}
        </div>

        {/* Status Footer */}
        <div className="pt-4 mt-2 border-t border-border/50 text-center">
            {isInPromotionZone ? (
               <span className="text-sm font-semibold text-success flex items-center justify-center gap-2">
                  <ArrowUp className="w-4 h-4" /> شما در منطقه صعود هستید!
               </span>
            ) : (
               <span className="text-sm font-medium text-muted-foreground">
                  برای صعود به {allEntries[2].xp - xp + 1} امتیاز دیگر نیاز دارید.
               </span>
            )}
        </div>

      </CardContent>
    </Card>
  )
}
