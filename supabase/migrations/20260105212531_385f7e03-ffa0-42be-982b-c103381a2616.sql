-- Create table to store owner/admin metrics (persistent across domains)
CREATE TABLE public.owner_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  reference_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_cycles INTEGER NOT NULL DEFAULT 0,
  projects INTEGER NOT NULL DEFAULT 32,
  proposals INTEGER NOT NULL DEFAULT 38,
  clients INTEGER NOT NULL DEFAULT 29,
  plannings INTEGER NOT NULL DEFAULT 27,
  pending_tasks INTEGER NOT NULL DEFAULT 12,
  completed_tasks INTEGER NOT NULL DEFAULT 41,
  deliveries INTEGER NOT NULL DEFAULT 26,
  contracts INTEGER NOT NULL DEFAULT 24,
  total_pipeline_value NUMERIC NOT NULL DEFAULT 38743,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Create table to store team metrics for admin (persistent across domains)
CREATE TABLE public.team_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  reference_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_cycles INTEGER NOT NULL DEFAULT 0,
  team_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Enable RLS
ALTER TABLE public.owner_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for owner_metrics - only workspace owner can access
CREATE POLICY "Users can view their own owner metrics"
ON public.owner_metrics
FOR SELECT
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own owner metrics"
ON public.owner_metrics
FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own owner metrics"
ON public.owner_metrics
FOR UPDATE
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE user_id = auth.uid()
  )
);

-- Policies for team_metrics - only workspace owner can access
CREATE POLICY "Users can view their own team metrics"
ON public.team_metrics
FOR SELECT
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own team metrics"
ON public.team_metrics
FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own team metrics"
ON public.team_metrics
FOR UPDATE
USING (
  workspace_id IN (
    SELECT id FROM public.workspaces WHERE user_id = auth.uid()
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_owner_metrics_updated_at
BEFORE UPDATE ON public.owner_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_metrics_updated_at
BEFORE UPDATE ON public.team_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();