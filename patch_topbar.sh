sed -i 's|import { Button } from "@/components/ui/button"|import { Button } from "@/components/ui/button"\nimport { StreakPopover } from "../gamification/StreakPopover"\nimport { HeartRecoveryModal } from "../gamification/HeartRecoveryModal"\nimport { useGamificationStore } from "@/store/useGamificationStore"|' src/components/layout/LessonTopBar.tsx

sed -i 's/hearts = 5,/hearts: propHearts = 5,/' src/components/layout/LessonTopBar.tsx

sed -i 's/const \[isMuted, setIsMuted\] = React.useState(false)/const [isMuted, setIsMuted] = React.useState(false)\n  const { streakDays, hearts } = useGamificationStore()\n  const [heartModalOpen, setHeartModalOpen] = React.useState(false)/' src/components/layout/LessonTopBar.tsx

sed -i 's/<div className="flex items-center gap-1.5 text-warning font-bold">/<StreakPopover>\n            <div className="flex items-center gap-1.5 text-warning font-bold cursor-pointer hover:opacity-80">/' src/components/layout/LessonTopBar.tsx
sed -i 's/<span>{streak}<\/span>\n          <\/div>/<span>{streakDays}<\/span>\n            <\/div>\n          <\/StreakPopover>/' src/components/layout/LessonTopBar.tsx

sed -i 's/<div className="flex items-center gap-1.5 text-destructive font-bold">/<div className="flex items-center gap-1.5 text-destructive font-bold cursor-pointer hover:opacity-80" onClick={() => setHeartModalOpen(true)}>/' src/components/layout/LessonTopBar.tsx

sed -i 's/<\/Button>\n        <\/div>\n\n      <\/div>\n    <\/motion.header>/<\/Button>\n        <\/div>\n\n      <\/div>\n      <HeartRecoveryModal open={heartModalOpen} onOpenChange={setHeartModalOpen} \/>\n    <\/motion.header>/' src/components/layout/LessonTopBar.tsx
