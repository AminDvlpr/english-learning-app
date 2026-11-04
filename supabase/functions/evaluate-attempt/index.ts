import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Check if we are running in local mock environment
    if (!supabaseUrl || !supabaseServiceKey) {
       console.warn("Supabase credentials missing, simulating evaluation response for local test.");
       const { selectedOptionId } = await req.json();
       return new Response(JSON.stringify({
          isCorrect: selectedOptionId === 'correct',
          xpAwarded: selectedOptionId === 'correct' ? 25 : 0,
          masteryDelta: selectedOptionId === 'correct' ? 0.2 : 0,
          message: 'Local mock response'
       }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify User Token
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { blockId, selectedOptionId, lessonId, currentDifficulty } = await req.json();

    // Fetch block config from lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('blocks_json')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
        return new Response(JSON.stringify({ error: 'Lesson not found' }), { status: 404, headers: corsHeaders });
    }

    const blocks = lesson.blocks_json as any[];
    const block = blocks.find((b: any) => b.blockId === blockId);

    if (!block || block.type !== 'interactive_checkpoint') {
        return new Response(JSON.stringify({ error: 'Invalid block' }), { status: 400, headers: corsHeaders });
    }

    // Evaluate logic
    const option = block.question?.options?.find((o: any) => o.id === selectedOptionId);
    const isCorrect = option ? option.correct : false;

    // Fetch attempts count
    const { count, error: countError } = await supabase
      .from('checkpoint_attempts')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('block_id', blockId);

    const attemptCount = (count || 0) + 1;

    let xpAwarded = 0;
    let gemsAwarded = 0;
    let masteryDelta = 0;
    let nextDifficulty = currentDifficulty;

    if (isCorrect) {
        if (attemptCount === 1) {
            xpAwarded = block.adaptiveRules?.onFirstTrySuccess?.xp || 25;
            gemsAwarded = block.adaptiveRules?.onFirstTrySuccess?.gems || 0;
            masteryDelta = Number(block.adaptiveRules?.onFirstTrySuccess?.masteryDelta || 0.2);
            nextDifficulty = block.adaptiveRules?.onFirstTrySuccess?.nextDifficulty || 'harder';
        } else {
            xpAwarded = 10;
            masteryDelta = 0.1;
        }
    } else {
        masteryDelta = -0.1;
        nextDifficulty = block.adaptiveRules?.onFailure?.adjustDifficulty || 'easier';
    }

    // Write attempt record
    await supabase.from('checkpoint_attempts').insert({
        user_id: user.id,
        lesson_id: lessonId,
        block_id: blockId,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
        difficulty_at_attempt: currentDifficulty,
        xp_awarded: xpAwarded
    });

    // Update Profile XP
    if (xpAwarded > 0 || gemsAwarded > 0) {
        const { data: profile } = await supabase.from('profiles').select('xp_total, gems').eq('id', user.id).single();
        if (profile) {
            await supabase.from('profiles').update({
                xp_total: Number(profile.xp_total) + xpAwarded,
                gems: Number(profile.gems) + gemsAwarded
            }).eq('id', user.id);
        }
    }

    return new Response(JSON.stringify({
        isCorrect,
        xpAwarded,
        gemsAwarded,
        masteryDelta,
        nextDifficulty
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
