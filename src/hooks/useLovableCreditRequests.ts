import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export type CreditRequestStatus = 'pending' | 'reviewing' | 'approved' | 'fulfilled' | 'rejected' | 'sent';

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
  sent: 'Enviado',
};

export const statusColors: Record<CreditRequestStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  reviewing: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-primary/10 text-primary border-primary/20',
  fulfilled: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  sent: 'bg-success/10 text-success border-success/20',
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
    if (status === 'fulfilled' || status === 'rejected' || status === 'sent') {
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

// Admin users management hook
export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin' | 'owner';
  created_at: string;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsersLast7Days, setNewUsersLast7Days] = useState(0);

  const fetchUsers = async (searchEmail?: string) => {
    setLoading(true);
    
    // Fetch profiles with roles
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (searchEmail) {
      query = query.ilike('email', `%${searchEmail}%`);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
      return;
    }

    // Fetch roles for these users
    const userIds = profiles?.map(p => p.id) || [];
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

    const usersWithRoles: UserWithRole[] = (profiles || []).map(p => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      role: (roleMap.get(p.id) as 'user' | 'admin' | 'owner') || 'user',
      created_at: p.created_at,
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const fetchStats = async () => {
    // Total users
    const { count: total } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    setTotalUsers(total || 0);

    // New users last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: newUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());
    
    setNewUsersLast7Days(newUsers || 0);
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'owner') => {
    // Check if role exists
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);
      
      if (error) return { error: error.message };
    } else {
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });
      
      if (error) return { error: error.message };
    }

    await fetchUsers();
    return { error: null };
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  return {
    users,
    loading,
    totalUsers,
    newUsersLast7Days,
    fetchUsers,
    updateUserRole,
  };
}
