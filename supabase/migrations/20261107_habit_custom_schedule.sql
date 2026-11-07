-- ==============================================================================
-- Intizomly — Custom Schedule for Habits Migration
-- Adds 'schedule' JSONB column to public.habits
-- Format: JSON array of weekday IDs, e.g. ["mon", "wed", "fri"]
-- Default: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] (har kuni)
-- ==============================================================================

ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '["mon","tue","wed","thu","fri","sat","sun"]'::jsonb NOT NULL;

-- Backfill any existing habits with null schedule to default all 7 days
UPDATE public.habits
SET schedule = '["mon","tue","wed","thu","fri","sat","sun"]'::jsonb
WHERE schedule IS NULL;

-- Create index on habit schedule for fast JSONB querying
CREATE INDEX IF NOT EXISTS idx_habits_schedule ON public.habits USING gin (schedule);

