sed -i 's/const xp = useLearnerStore(state => state.xp)/const xp = useGamificationStore(state => state.xp)/' src/app/page.tsx
sed -i 's|import { useLearnerStore } from "@/store/useLearnerStore"|import { useLearnerStore } from "@/store/useLearnerStore"\nimport { useGamificationStore } from "@/store/useGamificationStore"|' src/app/page.tsx
