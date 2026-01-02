import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Package, Check, Loader2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useClients } from '@/hooks/useClients';
import { useOwnerMetrics } from '@/hooks/useOwnerMetrics';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Delivery {
  id: string;
  title: string;
  delivery_type: string;
  status: string;
  delivery_date: string;
  created_at: string;
  clients: { name: string } | null;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  delivered: { label: 'Entregue', variant: 'default' },
  pending_adjustments: { label: 'Ajustes pendentes', variant: 'secondary' },
  finalized: { label: 'Finalizado', variant: 'default' },
};

const deliveryTypes: Record<string, string> = {
  site: 'Site',
  app: 'Aplicativo',
  landing: 'Landing Page',
  page: 'Página simples',
  material: 'Material digital',
  other: 'Outro',
};

export default function EntregaHub() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { clients } = useClients();
  const { isOwner, metrics, getMetricValue } = useOwnerMetrics();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['deliveries', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('deliveries')
        .select('id, title, delivery_type, status, delivery_date, created_at, clients(name)')
        .eq('workspace_id', workspace.id)
        .order('delivery_date', { ascending: false });

      if (error) throw error;
      return data as Delivery[];
    },
    enabled: !!workspace?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['deliveries-stats', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return { total: 0, finalized: 0, pending: 0 };
      const { data, error } = await supabase
        .from('deliveries')
        .select('status')
        .eq('workspace_id', workspace.id);

      if (error) throw error;
      const total = data.length;
      const finalized = data.filter((d) => d.status === 'finalized').length;
      const pending = data.filter((d) => d.status === 'pending_adjustments').length;
      return { total, finalized, pending };
    },
    enabled: !!workspace?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('deliveries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries-stats'] });
      toast.success('Entrega excluída');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Erro ao excluir entrega');
    },
  });

  const markAsFinalizedMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: 'finalized' })
        .eq('id', id);
      if (error) throw error;

      if (workspace?.id) {
        await supabase.from('activity_logs').insert({
          workspace_id: workspace.id,
          type: 'DELIVERY_FINALIZED',
          message: 'Entrega marcada como finalizada',
          entity_id: id,
          entity_type: 'delivery',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries-stats'] });
      toast.success('Entrega finalizada');
    },
    onError: () => {
      toast.error('Erro ao finalizar entrega');
    },
  });

  const filteredDeliveries = deliveries?.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clients?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = filterClient === 'all' || d.clients?.name === clients.find(c => c.id === filterClient)?.name;
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchesType = filterType === 'all' || d.delivery_type === filterType;
    return matchesSearch && matchesClient && matchesStatus && matchesType;
  }) || [];

  return (
    <AppLayout title="Entrega">
      <div className="content-premium space-premium">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Entregas</h2>
            <p className="text-muted-foreground">
              Registre e organize tudo que foi entregue aos clientes.
            </p>
          </div>
          <Button onClick={() => navigate('/entrega/nova')} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Entrega
          </Button>
        </div>

        {/* Stats */}
        <PremiumFrame title="Resumo — Nexia Suite" className="fade-in mb-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="metric-card-premium p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/15">
                  <Package className="h-5 w-5 text-primary icon-glow-subtle" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{getMetricValue(metrics.deliveries, stats?.total || 0)}</p>
                  <p className="text-sm text-muted-foreground">Total de entregas</p>
                </div>
              </div>
            </div>
            <div className="metric-card-premium p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-success/10 border border-success/15">
                  <Check className="h-5 w-5 text-success icon-glow-subtle" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{getMetricValue(Math.floor(metrics.deliveries * 0.7), stats?.finalized || 0)}</p>
                  <p className="text-sm text-muted-foreground">Finalizadas</p>
                </div>
              </div>
            </div>
            <div className="metric-card-premium p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-warning/10 border border-warning/15">
                  <TrendingUp className="h-5 w-5 text-warning icon-glow-subtle" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{getMetricValue(Math.floor(metrics.deliveries * 0.3), stats?.pending || 0)}</p>
                  <p className="text-sm text-muted-foreground">Ajustes pendentes</p>
                </div>
              </div>
            </div>
          </div>
        </PremiumFrame>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="pending_adjustments">Ajustes pendentes</SelectItem>
              <SelectItem value="finalized">Finalizado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(deliveryTypes).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <PremiumFrame title="Entregas — Nexia Suite" className="fade-in" style={{ animationDelay: '0.1s' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Package className="h-8 w-8 text-primary icon-glow-subtle" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                {searchQuery || filterClient !== 'all' || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Nenhuma entrega encontrada'
                  : 'Nenhuma entrega registrada'}
              </h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {searchQuery || filterClient !== 'all' || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Tente ajustar os filtros.'
                  : 'Comece registrando sua primeira entrega.'}
              </p>
              {!searchQuery && filterClient === 'all' && filterStatus === 'all' && filterType === 'all' && (
                <Button onClick={() => navigate('/entrega/nova')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Entrega
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-primary/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/10 hover:bg-primary/5">
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Data</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id} className="border-primary/10 hover:bg-primary/5">
                      <TableCell className="font-medium">{delivery.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {delivery.clients?.name || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {deliveryTypes[delivery.delivery_type] || delivery.delivery_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusLabels[delivery.status]?.variant || 'secondary'}>
                          {statusLabels[delivery.status]?.label || delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {format(new Date(delivery.delivery_date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/entrega/${delivery.id}`)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {delivery.status !== 'finalized' && (
                              <DropdownMenuItem onClick={() => markAsFinalizedMutation.mutate(delivery.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Marcar como finalizada
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setDeleteId(delivery.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </PremiumFrame>

        {/* Delete Dialog */}
        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta entrega? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
