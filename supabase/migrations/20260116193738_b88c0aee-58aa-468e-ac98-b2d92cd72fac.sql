-- Create demo_contracts table for managing contracts with recurrence
CREATE TABLE public.demo_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id UUID NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('Site', 'App', 'Landing Page', 'E-commerce', 'App Delivery', 'Sistema')),
  value NUMERIC NOT NULL DEFAULT 0,
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('Mensal', 'Anual', 'Único')),
  recurrence_value_monthly NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Assinado', 'Pendente', 'Cancelado')),
  start_date DATE DEFAULT CURRENT_DATE,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_contracts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own contracts OR admins can view demo contracts
CREATE POLICY "Users can view own contracts"
ON public.demo_contracts
FOR SELECT
USING (
  owner_user_id = auth.uid() OR
  (is_demo = true AND public.is_admin_or_owner(auth.uid()))
);

-- Policy: Users can insert their own contracts (not demo)
CREATE POLICY "Users can create own contracts"
ON public.demo_contracts
FOR INSERT
WITH CHECK (
  owner_user_id = auth.uid() AND is_demo = false
);

-- Policy: Users can update their own contracts, admins can update demo
CREATE POLICY "Users can update own contracts"
ON public.demo_contracts
FOR UPDATE
USING (
  owner_user_id = auth.uid() OR
  (is_demo = true AND public.is_admin_or_owner(auth.uid()))
);

-- Policy: Users can delete their own contracts, admins can delete demo
CREATE POLICY "Users can delete own contracts"
ON public.demo_contracts
FOR DELETE
USING (
  owner_user_id = auth.uid() OR
  (is_demo = true AND public.is_admin_or_owner(auth.uid()))
);

-- Create index for faster queries
CREATE INDEX idx_demo_contracts_owner ON public.demo_contracts(owner_user_id);
CREATE INDEX idx_demo_contracts_workspace ON public.demo_contracts(workspace_id);
CREATE INDEX idx_demo_contracts_status ON public.demo_contracts(status);
CREATE INDEX idx_demo_contracts_is_demo ON public.demo_contracts(is_demo);

-- Trigger for updated_at
CREATE TRIGGER update_demo_contracts_updated_at
BEFORE UPDATE ON public.demo_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();