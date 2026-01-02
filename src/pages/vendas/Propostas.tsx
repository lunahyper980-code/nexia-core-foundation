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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FileText, Copy, Download, MessageCircle, Loader2, ArrowLeft } from 'lucide-react';
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

interface Proposal {
  id: string;
  title: string;
  service_type: string;
  total_value: number | null;
  status: string;
  created_at: string;
  prospect_name: string | null;
  clients: { name: string } | null;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Rascunho', variant: 'secondary' },
  sent: { label: 'Enviada', variant: 'default' },
  accepted: { label: 'Aceita', variant: 'default' },
  rejected: { label: 'Recusada', variant: 'destructive' },
};

export default function Propostas() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('proposals')
        .select('id, title, service_type, total_value, status, created_at, prospect_name, clients(name)')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Proposal[];
    },
    enabled: !!workspace?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('proposals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposta excluída');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Erro ao excluir proposta');
    },
  });

  const filteredProposals = proposals?.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.prospect_name || p.clients?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCopyProposal = (proposal: Proposal) => {
    const clientName = proposal.prospect_name || proposal.clients?.name || '-';
    const text = `Proposta: ${proposal.title}\nCliente: ${clientName}\nServiço: ${proposal.service_type}\nValor: ${proposal.total_value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.total_value) : '-'}`;
    navigator.clipboard.writeText(text);
    toast.success('Proposta copiada');
  };

  return (
    <AppLayout title="Propostas">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/vendas')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Propostas Comerciais</h2>
              <p className="text-muted-foreground">
                Crie e gerencie propostas para seus clientes.
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/vendas/propostas/nova')} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Proposta
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
            ) : filteredProposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-secondary mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  {searchQuery ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta criada'}
                </h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  {searchQuery
                    ? 'Tente buscar com outros termos.'
                    : 'Comece criando sua primeira proposta comercial.'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/vendas/propostas/nova')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Proposta
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
                      <TableHead className="hidden md:table-cell">Serviço</TableHead>
                      <TableHead className="hidden lg:table-cell">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Criada</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProposals.map((proposal) => (
                      <TableRow key={proposal.id}>
                        <TableCell className="font-medium">{proposal.title}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {proposal.prospect_name || proposal.clients?.name || '-'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">{proposal.service_type}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {proposal.total_value
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(proposal.total_value)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusLabels[proposal.status]?.variant || 'secondary'}>
                            {statusLabels[proposal.status]?.label || proposal.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(proposal.created_at), {
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
                              <DropdownMenuItem onClick={() => navigate(`/vendas/propostas/${proposal.id}`)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyProposal(proposal)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar texto
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/vendas/whatsapp?proposalId=${proposal.id}`)}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Gerar mensagem
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(proposal.id)}
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
                Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.
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
