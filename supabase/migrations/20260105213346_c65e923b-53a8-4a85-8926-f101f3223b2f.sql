-- Add access control fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS access_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS access_reason text,
ADD COLUMN IF NOT EXISTS access_updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS device_id text;

-- Create index for device_id lookups (for blocking)
CREATE INDEX IF NOT EXISTS idx_profiles_device_id ON public.profiles(device_id);
CREATE INDEX IF NOT EXISTS idx_profiles_access_status ON public.profiles(access_status);

-- Create function to check if device is blocked
CREATE OR REPLACE FUNCTION public.is_device_blocked(_device_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE device_id = _device_id
      AND access_status = 'blocked'
      AND _device_id IS NOT NULL
      AND _device_id != ''
  )
$$;

-- Create function to get user access status
CREATE OR REPLACE FUNCTION public.get_user_access_status(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(access_status, 'pending')
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- Update trigger to set access_updated_at when access_status changes
CREATE OR REPLACE FUNCTION public.update_access_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.access_status IS DISTINCT FROM NEW.access_status THEN
    NEW.access_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_access_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_access_updated_at();

-- Allow admins to view all profiles for user management
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin_or_owner(auth.uid()));

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_admin_or_owner(auth.uid()))
WITH CHECK (is_admin_or_owner(auth.uid()));

-- Set existing users to active (optional - remove if you want all existing users to be pending)
UPDATE public.profiles SET access_status = 'active' WHERE access_status = 'pending';