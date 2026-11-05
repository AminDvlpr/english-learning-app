"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLearnerStore } from "@/store/useLearnerStore"
import { useGamificationStore } from "@/store/useGamificationStore"
import { motion } from "framer-motion"
import { Target, TrendingUp, Zap, Clock, Brain, ListChecks, MessageSquare, FastForward, Swords, Flame, Gem } from "lucide-react"

export function MasteryAnalyticsCard({ viewMode = "profile" }: { viewMode?: "profile" | "challenge" }) {
  const { masteryScore, currentDifficulty, blockStates } = useLearnerStore()
  const { activeTimeTodaySec } = useGamificationStore()
  const [mounted, setMounted] = useState(false)

  // Game state
  const [gameState, setGameState] = useState<'start'|'playing'|'gameover'>('start')
  const [timeLeft, setTimeLeft] = useState(60)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [playerHealth, setPlayerHealth] = useState(100)
  const [enemyHealth, setEnemyHealth] = useState(100)
  const [questionIndex, setQuestionIndex] = useState(0)

  const questions = [
    { en: 'Happy birthday to you', type: 'dialogue', correct: 'تولدت مبارک', options: ['تولدت مبارک', 'مهمانی خوب بود', 'سال نو مبارک', 'چه هدیه ای'] },
    { en: 'I am so angry', type: 'vocab', correct: 'من خیلی عصبانی هستم', options: ['من خیلی خسته هستم', 'من خیلی عصبانی هستم', 'او خیلی عصبانی است', 'من گرسنه هستم'] },
    { en: 'Make a wish', type: 'vocab', correct: 'آرزو کن', options: ['آرزو کن', 'شمع را فوت کن', 'کیک ببر', 'هدیه بده'] },
    { en: 'Blow out the candles', type: 'dialogue', correct: 'شمع ها را فوت کن', options: ['کیک ببر', 'شمع ها را فوت کن', 'آرزو کن', 'تولد مبارک'] },
    { en: 'Wait!', type: 'vocab', correct: 'صبر کن', options: ['بیا اینجا', 'صبر کن', 'نگاه کن', 'گوش کن'] },
    { en: 'Let me talk', type: 'dialogue', correct: 'بذار من حرف بزنم', options: ['بذار من حرف بزنم', 'من میروم', 'شما حرف بزنید', 'گوش کن'] },
    { en: 'Are you okay?', type: 'vocab', correct: 'حالت خوبه؟', options: ['کجا هستی؟', 'حالت خوبه؟', 'چه کار میکنی؟', 'کی میای؟'] },
    { en: 'Gift', type: 'vocab', correct: 'هدیه', options: ['کیک', 'هدیه', 'شمع', 'آرزو'] }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('gameover')
    }
    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  if (!mounted) return null

  const activeMinutes = Math.floor(activeTimeTodaySec / 60)
  const streakGoalMinutes = 10

  let firstTryCount = 0
  let totalCheckpointsAttempted = 0
  Object.values(blockStates).forEach(state => {
      if (state.attempts && state.attempts.length > 0) {
          totalCheckpointsAttempted++
          if (state.attempts[0].isCorrect) {
              firstTryCount++
          }
      }
  })
  const accuracy = totalCheckpointsAttempted > 0 ? Math.round((firstTryCount / totalCheckpointsAttempted) * 100) : 0

  const handleAnswer = (opt: string) => {
    const q = questions[questionIndex % questions.length]
    if (opt === q.correct) {
      const multiplier = streak >= 5 ? 3 : streak >= 2 ? 2 : 1
      setScore(prev => prev + 10 * multiplier)
      setStreak(prev => prev + 1)
      setEnemyHealth(prev => Math.max(0, prev - 15))
      if (enemyHealth - 15 <= 0) {
        setGameState('gameover')
      }
    } else {
      setStreak(0)
      setPlayerHealth(prev => Math.max(0, prev - 20))
      if (playerHealth - 20 <= 0) {
        setGameState('gameover')
      }
    }
    setQuestionIndex(prev => prev + 1)
  }

  const resetGame = () => {
    setGameState('start')
    setTimeLeft(60)
    setScore(0)
    setStreak(0)
    setPlayerHealth(100)
    setEnemyHealth(100)
    setQuestionIndex(0)
  }

  if (viewMode === 'challenge') {
    return (
      <Card className="h-full border-2 border-primary/20 bg-background overflow-hidden relative" dir="rtl">
        {gameState === 'start' && (
          <div className="absolute inset-0 z-10 bg-card/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Swords className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">میدان نبرد: دوئل سرعتی</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                ۶۰ ثانیه فرصت داری تا حریف (سارا) را شکست دهی!<br/>
                پاسخ‌های سریع و متوالی ضربات قوی‌تری وارد می‌کنند.
              </p>
            </div>
            <button onClick={() => setGameState('playing')} className="bg-primary text-primary-foreground font-bold text-lg px-8 py-3 rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all">
              شروع نبرد ⚔️
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-10 bg-card/95 backdrop-blur flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="text-5xl mb-2">
              {playerHealth <= 0 ? '💀' : enemyHealth <= 0 ? '🏆' : '⏱️'}
            </div>
            <div>
              <h2 className="text-2xl font-black mb-2">
                {playerHealth <= 0 ? 'شکست خوردی!' : enemyHealth <= 0 ? 'پیروزی قاطع!' : 'پایان زمان!'}
              </h2>
              <p className="text-muted-foreground">امتیاز نهایی: {score}</p>
            </div>

            <div className="flex gap-4 justify-center">
              <div className="bg-secondary p-3 rounded-xl flex flex-col items-center">
                <span className="text-xs text-muted-foreground">XP کسب شده</span>
                <span className="font-bold text-lg text-primary">+{Math.floor(score/2)}</span>
              </div>
              <div className="bg-secondary p-3 rounded-xl flex flex-col items-center">
                <span className="text-xs text-muted-foreground">الماس</span>
                <span className="font-bold text-lg text-sky-500 flex items-center gap-1"><Gem className="w-4 h-4"/> +{enemyHealth <= 0 ? 5 : 1}</span>
              </div>
            </div>

            <button onClick={resetGame} className="bg-secondary text-secondary-foreground font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all">
              دوباره بازی کن
            </button>
          </div>
        )}

        <div className="p-4 flex flex-col h-full space-y-4">
          {/* Header bars */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 space-y-1">
               <div className="flex justify-between text-xs font-bold">
                 <span>شما</span>
                 <span className="text-muted-foreground">{playerHealth} HP</span>
               </div>
               <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border">
                 <motion.div className="h-full bg-emerald-500" animate={{ width: `${playerHealth}%` }} />
               </div>
            </div>

            <div className="w-12 h-12 shrink-0 rounded-full border-4 border-primary/20 flex items-center justify-center bg-card font-black text-lg">
              {timeLeft}
            </div>

            <div className="flex-1 space-y-1">
               <div className="flex justify-between text-xs font-bold">
                 <span>سارا (حریف)</span>
                 <span className="text-muted-foreground">{enemyHealth} HP</span>
               </div>
               <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border" dir="ltr">
                 <motion.div className="h-full bg-destructive" animate={{ width: `${enemyHealth}%` }} />
               </div>
            </div>
          </div>

          {/* HUD Info */}
          <div className="flex justify-between items-center bg-secondary/50 p-2 rounded-xl">
             <div className="flex items-center gap-1 font-bold text-sm">
               امتیاز: <span className="text-primary">{score}</span>
             </div>
             {streak > 1 && (
               <div className="flex items-center gap-1 text-warning font-bold text-sm animate-pulse">
                 <Flame className="w-4 h-4" /> {streak}x زنجیره!
               </div>
             )}
          </div>

          {/* Question Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <span className="text-xs font-medium text-muted-foreground mb-2">
              {questions[questionIndex % questions.length].type === 'dialogue' ? 'معنی جمله چیست؟' : 'ترجمه کلمه:'}
            </span>
            <h3 className="text-2xl font-black text-center leading-tight mb-8" dir="ltr">
              &quot;{questions[questionIndex % questions.length].en}&quot;
            </h3>

            <div className="grid grid-cols-2 gap-3 w-full">
              {questions[questionIndex % questions.length].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="bg-card border-2 border-border p-3 rounded-xl text-sm font-bold shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-colors active:scale-95 text-center"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Original Profile View
  return (
    <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm shadow-sm" dir="rtl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          پروفایل من
        </CardTitle>
        <CardDescription>آمار عملکرد زنده شما بر اساس درس‌های اخیر</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Mastery Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="flex items-center gap-2 font-medium text-muted-foreground">
               <Target className="w-4 h-4" /> تسلط کلی
            </span>
            <span className="font-bold text-lg" dir="ltr">{Math.round(masteryScore * 100)}%</span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${masteryScore * 100}%` }}
              transition={{ duration: 1, type: "tween" }}
            />
          </div>
        </div>

        {/* First-Try Accuracy */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="flex items-center gap-2 font-medium text-muted-foreground">
               <Zap className="w-4 h-4 text-warning" /> دقت در اولین تلاش
            </span>
            <span className="font-bold text-lg" dir="ltr">{accuracy}%</span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
             <motion.div
              className="h-full bg-warning"
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 1, type: "tween" }}
            />
          </div>
        </div>

        {/* Daily Active Time */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="flex items-center gap-2 font-medium text-muted-foreground">
               <Clock className="w-4 h-4 text-sky-500" /> زمان مطالعه روزانه
            </span>
            <span className="font-bold text-sm" dir="ltr">
                <span className={activeMinutes >= streakGoalMinutes ? "text-success" : ""}>{activeMinutes}</span> / {streakGoalMinutes} min
            </span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
             <motion.div
              className={`h-full ${activeMinutes >= streakGoalMinutes ? "bg-success" : "bg-sky-500"}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((activeMinutes / streakGoalMinutes) * 100, 100)}%` }}
              transition={{ duration: 1, type: "tween" }}
            />
          </div>
        </div>

        {/* Current Adaptive Tier */}
        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
           <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
             <Brain className="w-4 h-4 text-primary" /> سطح دشواری
           </span>
           <span className="px-3 py-1 bg-secondary rounded-full text-xs font-semibold capitalize tracking-wide">
             {currentDifficulty === 'beginner' ? 'مبتدی' : currentDifficulty === 'intermediate' ? 'متوسط' : 'پیشرفته'}
           </span>
        </div>

        {/* Skill Breakdown */}
        <div className="pt-2">
          <h4 className="text-sm font-semibold mb-3">تحلیل مهارت‌ها</h4>
          <div className="space-y-3">
             <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                   <MessageSquare className="w-4 h-4 text-muted-foreground" /> مکالمات
                </span>
                <span className="font-medium text-success">عالی</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                   <ListChecks className="w-4 h-4 text-muted-foreground" /> یادآوری لغات
                </span>
                <span className="font-medium">متوسط</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                   <FastForward className="w-4 h-4 text-muted-foreground" /> سرعت واکنش
                </span>
                <span className="font-medium text-warning">نیاز به تمرین</span>
             </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
