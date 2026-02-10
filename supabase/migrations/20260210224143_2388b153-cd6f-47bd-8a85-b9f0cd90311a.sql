
-- Add team-related editable fields to owner_metrics
ALTER TABLE public.owner_metrics
  ADD COLUMN IF NOT EXISTS team_commission numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team_volume numeric NOT NULL DEFAULT 23080,
  ADD COLUMN IF NOT EXISTS team_active_members integer NOT NULL DEFAULT 8;
