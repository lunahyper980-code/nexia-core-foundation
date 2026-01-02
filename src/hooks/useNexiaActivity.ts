import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface NexiaActivityLog {
  id: string;
  workspace_id: string;
  user_id: string | null;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  title: string | null;
  description: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface UseNexiaActivityOptions {
  limit?: number;
  entityType?: string;
  clientId?: string;
  planId?: string;
}

export function useNexiaActivity(options: UseNexiaActivityOptions = {}) {
  const { workspace } = useWorkspace();
  const [activities, setActivities] = useState<NexiaActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const { limit = 50, entityType, clientId, planId } = options;

  const fetchActivities = useCallback(async () => {
    if (!workspace) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filter by entity type
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      // Filter by client (from metadata)
      if (clientId) {
        query = query.contains('metadata', { client_id: clientId });
      }

      // Filter by plan (from metadata or entity_id)
      if (planId) {
        query = query.or(`entity_id.eq.${planId},metadata->plan_id.eq.${planId}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities((data || []) as NexiaActivityLog[]);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [workspace, limit, entityType, clientId, planId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    refetch: fetchActivities,
  };
}

// Standalone functions for fetching activities
export async function getRecentActivity(workspaceId: string, limit = 10): Promise<NexiaActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return (data || []) as NexiaActivityLog[];
}

export async function getActivityByClient(workspaceId: string, clientId: string, limit = 20): Promise<NexiaActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .contains('metadata', { client_id: clientId })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity by client:', error);
    return [];
  }

  return (data || []) as NexiaActivityLog[];
}

export async function getActivityByPlan(workspaceId: string, planId: string, limit = 20): Promise<NexiaActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .or(`entity_id.eq.${planId},metadata->plan_id.eq.${planId}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity by plan:', error);
    return [];
  }

  return (data || []) as NexiaActivityLog[];
}
