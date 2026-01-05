-- Create a security definer function to safely check workspace ownership
-- This prevents any potential bypass of workspace isolation
CREATE OR REPLACE FUNCTION public.user_owns_workspace(_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspaces
    WHERE id = _workspace_id
      AND user_id = auth.uid()
  )
$$;

-- Drop existing policies on clients table
DROP POLICY IF EXISTS "Users can create clients in their workspace" ON public.clients;
DROP POLICY IF EXISTS "Users can delete clients in their workspace" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients in their workspace" ON public.clients;
DROP POLICY IF EXISTS "Users can view clients in their workspace" ON public.clients;

-- Create stronger RLS policies using the security definer function
CREATE POLICY "Users can view their own workspace clients"
ON public.clients
FOR SELECT
TO authenticated
USING (public.user_owns_workspace(workspace_id));

CREATE POLICY "Users can create clients in their own workspace"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (
  public.user_owns_workspace(workspace_id)
  AND workspace_id IS NOT NULL
);

CREATE POLICY "Users can update their own workspace clients"
ON public.clients
FOR UPDATE
TO authenticated
USING (public.user_owns_workspace(workspace_id))
WITH CHECK (public.user_owns_workspace(workspace_id));

CREATE POLICY "Users can delete their own workspace clients"
ON public.clients
FOR DELETE
TO authenticated
USING (public.user_owns_workspace(workspace_id));

-- Add NOT NULL constraint to workspace_id if not already set
ALTER TABLE public.clients 
ALTER COLUMN workspace_id SET NOT NULL;