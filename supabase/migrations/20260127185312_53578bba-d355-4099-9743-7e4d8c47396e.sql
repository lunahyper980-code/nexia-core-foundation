-- Add recurrence_monthly column to owner_metrics table
-- This allows admins to customize the recurrence value shown in the dashboard
ALTER TABLE public.owner_metrics 
ADD COLUMN IF NOT EXISTS recurrence_monthly numeric NOT NULL DEFAULT 3223;