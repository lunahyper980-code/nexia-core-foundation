import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export type CreditRequestStatus = 'pending' | 'reviewing' | 'approved' | 'fulfilled' | 'rejected';

export interface LovableCreditRequest {
  id: string;
  user_id: string;
  user_email: string;
  invite_link: string;
  status: CreditRequestStatus;
  user_note: string | null;
  admin_note: string | null;
  admin_message: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  workspace_id: string;
}

export const statusLabels: Record<CreditRequestStatus, string> = {
  pending: 'Em fila',
  reviewing: 'Em análise',
  approved: 'Aprovado',
  fulfilled: 'Créditos enviados',
  rejected: 'Recusado',
};

export const statusColors: Record<CreditRequestStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  reviewing: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-primary/10 text-primary border-primary/20',
  fulfilled: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function useLovableCreditRequests() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const [requests, setRequests] = useState<LovableCreditRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user || !workspace) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('lovable_credit_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setRequests(data as LovableCreditRequest[]);
    }
    setLoading(false);
  };

  const createRequest = async (inviteLink: string, userNote?: string) => {
    if (!user || !workspace) return { error: 'Usuário não autenticado' };

    const { error } = await supabase
      .from('lovable_credit_requests')
      .insert({
        user_id: user.id,
        user_email: user.email || '',
        invite_link: inviteLink,
        user_note: userNote || null,
        workspace_id: workspace.id,
      });

    if (error) return { error: error.message };
    
    await fetchRequests();
    return { error: null };
  };

  const updateRequest = async (id: string, inviteLink: string) => {
    if (!user) return { error: 'Usuário não autenticado' };

    const { error } = await supabase
      .from('lovable_credit_requests')
      .update({ invite_link: inviteLink })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { error: error.message };
    
    await fetchRequests();
    return { error: null };
  };

  useEffect(() => {
    fetchRequests();
  }, [user, workspace]);

  return {
    requests,
    loading,
    createRequest,
    updateRequest,
    refetch: fetchRequests,
  };
}

// Admin hook
export function useAdminCreditRequests() {
  const [requests, setRequests] = useState<LovableCreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    reviewing: 0,
    fulfilled: 0,
    rejected: 0,
  });

  const fetchRequests = async (statusFilter?: string, emailSearch?: string) => {
    setLoading(true);
    
    let query = supabase
      .from('lovable_credit_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (emailSearch) {
      query = query.ilike('user_email', `%${emailSearch}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      setRequests(data as LovableCreditRequest[]);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data } = await supabase
      .from('lovable_credit_requests')
      .select('status');

    if (data) {
      const counts = {
        pending: 0,
        reviewing: 0,
        fulfilled: 0,
        rejected: 0,
      };
      data.forEach((r: { status: string }) => {
        if (r.status in counts) {
          counts[r.status as keyof typeof counts]++;
        }
      });
      setStats(counts);
    }
  };

  const updateRequestStatus = async (
    id: string,
    status: CreditRequestStatus,
    adminNote?: string,
    adminMessage?: string
  ) => {
    const updates: Partial<LovableCreditRequest> = { status };
    
    if (adminNote !== undefined) updates.admin_note = adminNote;
    if (adminMessage !== undefined) updates.admin_message = adminMessage;
    if (status === 'fulfilled' || status === 'rejected') {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('lovable_credit_requests')
      .update(updates)
      .eq('id', id);

    if (error) return { error: error.message };
    
    await Promise.all([fetchRequests(), fetchStats()]);
    return { error: null };
  };

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  return {
    requests,
    loading,
    stats,
    fetchRequests,
    fetchStats,
    updateRequestStatus,
  };
}
