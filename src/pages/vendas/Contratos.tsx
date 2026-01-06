import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FileSignature, Copy, Send, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Contract {
  id: string;
  title: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  clientName: string | null;
  source: 'contracts' | 'solution_contracts';
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Rascunho', variant: 'secondary' },
  sent: { label: 'Enviado', variant: 'default' },
  signed: { label: 'Assinado', variant: 'default' },
  completed: { label: 'Concluído', variant: 'default' },
  pending: { label: 'Pendente', variant: 'secondary' },
};

export default function Contratos() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSource, setDeleteSource] = useState<'contracts' | 'solution_contracts'>('contracts');

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['all-contracts', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      
      // Fetch from contracts table
      const { data: legacyContracts, error: legacyError } = await supabase
        .from('contracts')
        .select('id, title, status, sent_at, created_at, clients(name)')
        .eq('workspace_id', workspace.id);

      if (legacyError) throw legacyError;

      // Fetch from solution_contracts table
      const { data: solutionContracts, error: solutionError } = await supabase
        .from('solution_contracts')
        .select('id, contractor_name, contracted_name, status, created_at, contract_generated_at')
        .eq('workspace_id', workspace.id);

      if (solutionError) throw solutionError;

      // Merge and normalize
      const merged: Contract[] = [
        ...(legacyContracts || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          sent_at: c.sent_at,
          created_at: c.created_at,
          clientName: c.clients?.name || null,
          source: 'contracts' as const,
        })),
        ...(solutionContracts || []).map((c: any) => ({
          id: c.id,
          title: `Contrato - ${c.contractor_name || 'Cliente'}`,
          status: c.status,
          sent_at: c.contract_generated_at,
          created_at: c.created_at,
          clientName: c.contractor_name || null,
          source: 'solution_contracts' as const,
        })),
      ];

      // Sort by created_at descending
      return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!workspace?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, source }: { id: string; source: 'contracts' | 'solution_contracts' }) => {
      const { error } = await supabase.from(source).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-contracts'] });
      toast.success('Contrato excluído');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Erro ao excluir contrato');
    },
  });

  const markAsSentMutation = useMutation({
    mutationFn: async ({ id, source }: { id: string; source: 'contracts' | 'solution_contracts' }) => {
      if (source === 'contracts') {
        const { error } = await supabase
          .from('contracts')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('solution_contracts')
          .update({ status: 'sent', contract_generated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-contracts'] });
      toast.success('Contrato marcado como enviado');
    },
    onError: () => {
      toast.error('Erro ao atualizar contrato');
    },
  });

  const filteredContracts = contracts?.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <AppLayout title="Contratos">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/vendas')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Contratos</h2>
              <p className="text-muted-foreground">
                Gere contratos simples de prestação de serviço.
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/vendas/contratos/nexia')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Contrato
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-secondary mb-4">
                  <FileSignature className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  {searchQuery ? 'Nenhum contrato encontrado' : 'Nenhum contrato criado'}
                </h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  {searchQuery
                    ? 'Tente buscar com outros termos.'
                    : 'Comece criando seu primeiro contrato.'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/vendas/contratos/nexia')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Contrato
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Criado</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.title}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {contract.clientName || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusLabels[contract.status]?.variant || 'secondary'}>
                            {statusLabels[contract.status]?.label || contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(contract.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(
                                contract.source === 'solution_contracts' 
                                  ? `/solucoes/contrato/${contract.id}` 
                                  : `/vendas/contratos/${contract.id}`
                              )}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              {contract.status === 'draft' && (
                                <DropdownMenuItem onClick={() => markAsSentMutation.mutate({ id: contract.id, source: contract.source })}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Marcar como enviado
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => { setDeleteId(contract.id); setDeleteSource(contract.source); }}
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
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteId && deleteMutation.mutate({ id: deleteId, source: deleteSource })}
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
