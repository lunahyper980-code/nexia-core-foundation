import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Workspace {
  id: string;
  user_id: string;
  operation_name: string | null;
  niche: string | null;
  one_liner: string | null;
  tone: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  loading: boolean;
  updateWorkspace: (data: Partial<Workspace>) => Promise<void>;
  refetch: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspace = async () => {
    if (!user) {
      setWorkspace(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching workspace:', error);
    } else {
      setWorkspace(data as Workspace);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkspace();
  }, [user]);

  const updateWorkspace = async (data: Partial<Workspace>) => {
    if (!workspace) return;

    const { error } = await supabase
      .from('workspaces')
      .update(data)
      .eq('id', workspace.id);

    if (error) {
      throw error;
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      workspace_id: workspace.id,
      type: 'identity_updated',
      message: 'Identidade da operação atualizada',
    });

    await fetchWorkspace();
  };

  return (
    <WorkspaceContext.Provider value={{ workspace, loading, updateWorkspace, refetch: fetchWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
