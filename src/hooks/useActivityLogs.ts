import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface ActivityLog {
  id: string;
  workspace_id: string;
  type: string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useActivityLogs() {
  const { workspace } = useWorkspace();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!workspace) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching activity logs:', error);
    } else {
      setLogs(data as ActivityLog[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [workspace]);

  return {
    logs,
    loading,
    refetch: fetchLogs,
  };
}
