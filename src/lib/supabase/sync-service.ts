import { createClient, isSupabaseConfigured } from './client';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useLearnerStore } from '@/store/useLearnerStore';

let syncInterval: NodeJS.Timeout | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let realtimeChannel: any = null;

export const startSyncService = () => {
    if (!isSupabaseConfigured()) {
        console.log("Running in Local/Guest Mode. Supabase sync disabled.");
        return;
    }

    const supabase = createClient();

    // Setup periodic sync (every 60 seconds)
    if (syncInterval) clearInterval(syncInterval);

    syncInterval = setInterval(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const gStore = useGamificationStore.getState();

        // Sync profile stats
        await supabase.from('profiles').update({
            xp_total: gStore.xp,
            gems: gStore.gems,
            hearts: gStore.hearts,
            streak_days: gStore.streakDays,
            streak_freeze_active: gStore.hasStreakFreeze,
        }).eq('id', user.id);

        // Sync Learner State
        const lStore = useLearnerStore.getState();
        if (lStore.currentLessonId) {
            // Batch update all block states for the current lesson
            const blockProgressUpserts = Object.values(lStore.blockStates).map((blockState) => ({
                user_id: user.id,
                lesson_id: lStore.currentLessonId,
                block_id: blockState.blockId,
                state: blockState.state,
                mastery_score: lStore.masteryScore,
                attempts_count: blockState.attempts.length,
                updated_at: new Date().toISOString()
            }));

            if (blockProgressUpserts.length > 0) {
                 await supabase.from('learner_block_progress').upsert(blockProgressUpserts, {
                     onConflict: 'user_id,lesson_id,block_id'
                 });
            }
        }

    }, 60000);

    // Setup Realtime for League Standings
    setupRealtimeLeaderboard();
};

export const stopSyncService = () => {
    if (syncInterval) clearInterval(syncInterval);
    if (realtimeChannel && isSupabaseConfigured()) {
        const supabase = createClient();
        supabase.removeChannel(realtimeChannel);
    }
}

export const setupRealtimeLeaderboard = () => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    realtimeChannel = supabase.channel('public:profiles')
    .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
            // In a full app, this would dispatch to a Zustand store for the leaderboard
            // For now, we can log or trigger a callback.
            console.log('Leaderboard Update:', payload);
            // useLeaderboardStore.getState().updatePlayer(payload.new)
        }
    )
    .subscribe();
}