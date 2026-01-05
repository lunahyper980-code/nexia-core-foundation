-- Drop old function with CASCADE (will drop dependent policies)
DROP FUNCTION IF EXISTS public.is_admin_or_owner(uuid) CASCADE;

-- Create SECURITY DEFINER function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin or owner
CREATE OR REPLACE FUNCTION public.is_admin_or_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'owner')
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles

-- Users can read their own role, admin/owner can read all
CREATE POLICY "Users can read own role"
ON public.user_roles
FOR SELECT
USING (
  user_id = auth.uid() 
  OR public.is_admin_or_owner(auth.uid())
);

-- Users can insert their own role (for auto-creation when doesn't exist)
CREATE POLICY "Users can insert own role"
ON public.user_roles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Only admin/owner can update roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.is_admin_or_owner(auth.uid()))
WITH CHECK (public.is_admin_or_owner(auth.uid()));

-- Recreate policies for lovable_credit_requests
CREATE POLICY "Users can view own requests or admin can view all"
ON public.lovable_credit_requests
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_admin_or_owner(auth.uid())
);

CREATE POLICY "Users can update pending requests or admin can update all"
ON public.lovable_credit_requests
FOR UPDATE
USING (
  (auth.uid() = user_id AND status = 'pending')
  OR public.is_admin_or_owner(auth.uid())
)
WITH CHECK (
  (auth.uid() = user_id AND status = 'pending')
  OR public.is_admin_or_owner(auth.uid())
);