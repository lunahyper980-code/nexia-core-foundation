-- Create lovable_credit_requests table
CREATE TABLE public.lovable_credit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  invite_link TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'fulfilled', 'rejected')),
  user_note TEXT,
  admin_note TEXT,
  admin_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.lovable_credit_requests ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin or owner
CREATE OR REPLACE FUNCTION public.is_admin_or_owner(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid 
    AND (email LIKE '%@nexia%' OR email = 'admin@nexia.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS Policies
-- Users can insert their own requests
CREATE POLICY "Users can insert their own credit requests"
ON public.lovable_credit_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests, admins can view all
CREATE POLICY "Users can view own requests or admin can view all"
ON public.lovable_credit_requests
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_admin_or_owner(auth.uid())
);

-- Users can update only pending requests, admins can update all
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

-- Trigger for updated_at
CREATE TRIGGER update_lovable_credit_requests_updated_at
BEFORE UPDATE ON public.lovable_credit_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_lovable_credit_requests_user_id ON public.lovable_credit_requests(user_id);
CREATE INDEX idx_lovable_credit_requests_status ON public.lovable_credit_requests(status);
CREATE INDEX idx_lovable_credit_requests_workspace_id ON public.lovable_credit_requests(workspace_id);