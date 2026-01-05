import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useUserRole } from '@/contexts/UserRoleContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Search, 
  Check, 
  X, 
  Clock, 
  Shield, 
  RefreshCw,
  Smartphone,
  UserCog
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  access_status: string;
  access_reason: string | null;
  access_updated_at: string | null;
  device_id: string | null;
  created_at: string;
}

interface UserWithRole extends UserProfile {
  role: string | null;
}

type AccessStatus = 'pending' | 'active' | 'blocked';

const statusConfig: Record<AccessStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  active: { label: 'Ativo', color: 'bg-success/10 text-success border-success/20', icon: Check },
  blocked: { label: 'Bloqueado', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: X },
};

export default function GerenciarUsuarios() {
  const { isAdminOrOwner, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Block dialog
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [blockReason, setBlockReason] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile: any) => {
        const userRole = roles?.find((r: any) => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'user',
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!roleLoading && !isAdminOrOwner) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    if (isAdminOrOwner) {
      fetchUsers();
    }
  }, [isAdminOrOwner, roleLoading, navigate, fetchUsers]);

  // Realtime subscription for new users and status changes
  useEffect(() => {
    if (!isAdminOrOwner) return;

    const channel = supabase
      .channel('admin-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('Profile change detected:', payload.eventType);
          // Refetch the full list to ensure consistency
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdminOrOwner, fetchUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const updateAccessStatus = async (userId: string, newStatus: AccessStatus, reason?: string) => {
    try {
      const updateData: any = { access_status: newStatus };
      if (reason !== undefined) {
        updateData.access_reason = reason;
      }
      if (newStatus !== 'blocked') {
        updateData.access_reason = null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast.success(`Status atualizado para ${statusConfig[newStatus].label}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating access status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleBlockUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setBlockReason('');
    setBlockDialogOpen(true);
  };

  const confirmBlock = async () => {
    if (!selectedUser) return;
    await updateAccessStatus(selectedUser.id, 'blocked', blockReason);
    setBlockDialogOpen(false);
    setSelectedUser(null);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole as 'admin' | 'owner' | 'user' })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole as 'admin' | 'owner' | 'user' });

        if (error) throw error;
      }

      toast.success(`Role atualizado para ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar role');
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.access_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.access_status === 'active').length,
    pending: users.filter(u => u.access_status === 'pending').length,
    blocked: users.filter(u => u.access_status === 'blocked').length,
  };

  if (roleLoading || loading) {
    return (
      <AppLayout title="Gerenciar Usuários">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdminOrOwner) {
    return null;
  }

  return (
    <AppLayout title="Gerenciar Usuários">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Gerenciar Usuários
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Controle de acesso e permissões
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total de usuários</p>
            </CardContent>
          </Card>
          <Card className="border-success/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-success">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card className="border-warning/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-destructive">{stats.blocked}</div>
              <p className="text-xs text-muted-foreground">Bloqueados</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="blocked">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lista de Usuários</CardTitle>
            <CardDescription>
              {filteredUsers.length} usuário(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado
                </p>
              ) : (
                filteredUsers.map((user) => {
                  const config = statusConfig[user.access_status as AccessStatus] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <div
                      key={user.id}
                      className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">
                              {user.full_name || 'Sem nome'}
                            </p>
                            {user.role === 'admin' && (
                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>
                              Criado {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: ptBR })}
                            </span>
                            {user.device_id && (
                              <span className="flex items-center gap-1">
                                <Smartphone className="h-3 w-3" />
                                {user.device_id.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <Badge className={`${config.color} border shrink-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          {user.access_status !== 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-success border-success/30 hover:bg-success/10"
                              onClick={() => updateAccessStatus(user.id, 'active')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Liberar
                            </Button>
                          )}
                          {user.access_status !== 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateAccessStatus(user.id, 'pending')}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Pendente
                            </Button>
                          )}
                          {user.access_status !== 'blocked' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => handleBlockUser(user)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Bloquear
                            </Button>
                          )}
                          <Select
                            value={user.role || 'user'}
                            onValueChange={(value) => updateUserRole(user.id, value)}
                          >
                            <SelectTrigger className="w-[100px] h-8">
                              <UserCog className="h-3 w-3 mr-1" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Block Reason */}
                      {user.access_status === 'blocked' && user.access_reason && (
                        <p className="mt-2 text-xs text-destructive/80 italic">
                          Motivo: {user.access_reason}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Block Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja bloquear {selectedUser?.full_name || selectedUser?.email}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motivo do bloqueio (opcional)"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmBlock}>
              Confirmar Bloqueio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
