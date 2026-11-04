-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  current_difficulty TEXT CHECK (current_difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  xp_total NUMERIC DEFAULT 0,
  gems NUMERIC DEFAULT 0,
  hearts NUMERIC DEFAULT 5,
  hearts_updated_at TIMESTAMPTZ DEFAULT NOW(),
  streak_days NUMERIC DEFAULT 0,
  streak_freeze_active BOOLEAN DEFAULT false,
  last_active_date DATE,
  current_league TEXT CHECK (current_league IN ('bronze', 'silver', 'gold', 'diamond')) DEFAULT 'bronze',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view basic profile info for leaderboards." ON public.profiles FOR SELECT USING (true); -- Read-only for everyone

-- Create profile on signup (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_minutes NUMERIC,
  blocks_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published lessons." ON public.lessons FOR SELECT USING (is_published = true);


-- 3. Learner Block Progress Table
CREATE TABLE IF NOT EXISTS public.learner_block_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  state TEXT CHECK (state IN ('locked', 'active', 'verification-required', 'adaptive-remediation', 'completed')),
  mastery_score NUMERIC DEFAULT 0,
  attempts_count NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, block_id)
);

-- RLS: Learner Block Progress
ALTER TABLE public.learner_block_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own block progress." ON public.learner_block_progress
  FOR ALL USING (auth.uid() = user_id);


-- 4. Checkpoint Attempts Table
CREATE TABLE IF NOT EXISTS public.checkpoint_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  selected_option_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  difficulty_at_attempt TEXT,
  xp_awarded NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Checkpoint Attempts
ALTER TABLE public.checkpoint_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own checkpoint attempts." ON public.checkpoint_attempts
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own checkpoint attempts." ON public.checkpoint_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 5. League Standings (Weekly View/Table)
-- We will implement this as a view for simplicity, relying on xp_total in profiles.
-- A true weekly reset would require a separate table and a cron job, but we'll use a view based on profiles for this phase.
CREATE OR REPLACE VIEW public.league_standings AS
SELECT
  id as user_id,
  display_name,
  avatar_url,
  current_league,
  xp_total as weekly_xp -- Assuming xp_total is the standing metric for now.
FROM public.profiles
ORDER BY xp_total DESC;

-- Note: Views don't directly have RLS, they run as the invoker. The underlying table has RLS (public read).
-- To enable Realtime on this for the leaderboard, we need a table, not just a view if we want simple realtime.
-- But Supabase Realtime works on tables. Let's create a dedicated table for realtime sync if needed,
-- or just use realtime on `profiles` and filter by league.
-- We will enable Realtime on `profiles` table to track XP changes.
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
