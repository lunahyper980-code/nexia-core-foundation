-- Add usage_mode column to profiles table
-- Values: 'simple' or 'advanced', null means user hasn't chosen yet
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS usage_mode TEXT DEFAULT NULL;

-- Add check constraint to ensure valid values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_usage_mode_check 
CHECK (usage_mode IS NULL OR usage_mode IN ('simple', 'advanced'));