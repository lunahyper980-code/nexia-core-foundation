import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Loader2,
  Eye,
  Download,
  Pencil,
  FileText,
  DollarSign,
  TrendingUp,
  RefreshCcw,
} from 'lucide-react';
import { useContractsMetrics, DemoContract } from '@/hooks/useContractsMetrics';
import { NexiaLoader } from '@/components/ui/nexia-loader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

// 14 contratos fictícios para ADMIN com recorrência total ASSINADOS = R$ 3.223
// 9 Assinados, 3 Pendentes, 2 Em renovação
// Recorrências assinados: 289 + 497 + 359 + 89 + 449 + 169 + 547 + 379 + 445 = 3.223
const MOCK_CONTRACTS: DemoContract[] = [
  // 9 ASSINADOS (soma recorrência = 3223)
  {
    id: 'mock-1',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Pizzaria Bella Massa',
    project_type: 'App',
    value: 1450,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 289,
    status: 'Assinado',
    start_date: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Clínica Sorriso Perfeito',
    project_type: 'Site',
    value: 890,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 497,
    status: 'Assinado',
    start_date: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Burger House Express',
    project_type: 'App',
    value: 1680,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 359,
    status: 'Assinado',
    start_date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Advocacia Silva & Matos',
    project_type: 'Landing Page',
    value: 350,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 89,
    status: 'Assinado',
    start_date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-5',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'CellTech Store',
    project_type: 'E-commerce',
    value: 1280,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 449,
    status: 'Assinado',
    start_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-6',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Studio Forma & Saúde',
    project_type: 'Site',
    value: 780,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 169,
    status: 'Assinado',
    start_date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-7',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Sabor do Oceano Restaurante',
    project_type: 'App',
    value: 1890,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 547,
    status: 'Assinado',
    start_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-8',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Imóveis Prime Corretora',
    project_type: 'Landing Page',
    value: 420,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 379,
    status: 'Assinado',
    start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-9',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Salão Beleza Pura',
    project_type: 'Site',
    value: 650,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 445,
    status: 'Assinado',
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  // 3 PENDENTES
  {
    id: 'mock-10',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Fit Center Academia',
    project_type: 'App',
    value: 1560,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 297,
    status: 'Pendente',
    start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-11',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Dr. Carlos Mendes',
    project_type: 'Site',
    value: 720,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 129,
    status: 'Pendente',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-12',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'PetLove Shop',
    project_type: 'E-commerce',
    value: 980,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 229,
    status: 'Pendente',
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  // 2 EM RENOVAÇÃO
  {
    id: 'mock-13',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'WorldSpeak Idiomas',
    project_type: 'Landing Page',
    value: 380,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 79,
    status: 'Em renovação',
    start_date: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 380 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-14',
    owner_user_id: '',
    workspace_id: '',
    client_name: 'Construtora Alicerce',
    project_type: 'Site',
    value: 920,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 189,
    status: 'Em renovação',
    start_date: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    is_demo: true,
    created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Valor de recorrência fixo para admin = R$ 3.223
const ADMIN_FIXED_RECURRENCE = 3223;

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'Assinado': { label: 'Assinado', variant: 'default' },
  'Ativo': { label: 'Ativo', variant: 'default' },
  'Pendente': { label: 'Pendente', variant: 'secondary' },
  'Em renovação': { label: 'Em renovação', variant: 'outline' },
  'Cancelado': { label: 'Cancelado', variant: 'destructive' },
};

const projectTypes = ['Site', 'Landing Page', 'E-commerce', 'App', 'Sistema'];

export default function ContratosNovo() {
  const { contracts, metrics, loading, refetch } = useContractsMetrics();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewContract, setViewContract] = useState<DemoContract | null>(null);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('demo_contracts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Contrato excluído');
      setDeleteId(null);
      refetch();
    },
    onError: () => {
      toast.error('Erro ao excluir contrato');
    },
  });

  // Filter contracts
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.project_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.project_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <AppLayout title="Contratos">
        <div className="flex items-center justify-center min-h-[60vh]">
          <NexiaLoader size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Contratos">
      <div className="content-premium space-premium">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Contratos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie seus contratos e sua recorrência.
            </p>
          </div>
          <Button 
            className="gap-2" 
            onClick={() => navigate('/solucoes/contrato')}
          >
            <Plus className="h-4 w-4" />
            Novo Contrato
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Recorrência Mensal</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatCurrency(metrics.totalRecurrence)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    de contratos assinados
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <RefreshCcw className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Contratos Ativos</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {metrics.activeContracts}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    status: Assinado
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-success/10">
                  <FileText className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Ticket Médio</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {formatCurrency(metrics.averageTicket)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    valor médio por contrato
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-warning/10">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <PremiumFrame className="mt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente ou tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Assinado">Assinado</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em renovação">Em renovação</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {projectTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PremiumFrame>

        {/* Contracts Table */}
        <Card className="mt-6">
          <CardContent className="p-0">
            {filteredContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-secondary mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Nenhum contrato encontrado'
                    : 'Nenhum contrato criado'}
                </h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Tente ajustar os filtros.'
                    : 'Comece criando seu primeiro contrato.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="hidden md:table-cell">Recorrência</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{contract.client_name}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">{contract.project_type}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">{contract.project_type}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-foreground">{formatCurrency(contract.value)}</p>
                            <p className="text-xs text-primary font-medium md:hidden">
                              +{formatCurrency(contract.recurrence_value_monthly)}/mês
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-primary font-medium">
                            +{formatCurrency(contract.recurrence_value_monthly)}/mês
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[contract.status]?.variant || 'secondary'}>
                            {statusConfig[contract.status]?.label || contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewContract(contract)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Download className="h-4 w-4 mr-2" />
                                Baixar PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteId(contract.id)}
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

        {/* View Contract Dialog */}
        <Dialog open={!!viewContract} onOpenChange={(open) => !open && setViewContract(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Contrato</DialogTitle>
              <DialogDescription>
                Informações completas do contrato
              </DialogDescription>
            </DialogHeader>
            {viewContract && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-medium text-foreground">{viewContract.client_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo de Projeto</p>
                    <p className="font-medium text-foreground">{viewContract.project_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor do Contrato</p>
                    <p className="font-semibold text-foreground">{formatCurrency(viewContract.value)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Recorrência Mensal</p>
                    <p className="font-semibold text-primary">{formatCurrency(viewContract.recurrence_value_monthly)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo de Recorrência</p>
                    <p className="font-medium text-foreground">{viewContract.recurrence_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={statusConfig[viewContract.status]?.variant || 'secondary'}>
                      {viewContract.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Início</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(viewContract.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Criado em</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(viewContract.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewContract(null)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
