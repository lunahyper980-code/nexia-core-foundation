import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Plus, 
  Search, 
  ArrowLeft,
  MoreVertical,
  Eye,
  Copy,
  Archive,
  Calendar,
  Target,
  Building2,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NexiaPlanning {
  id: string;
  name: string;
  description: string | null;
  primary_goal: string | null;
  focus_area: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  client_id: string | null;
  mode: string | null;
  clients?: {
    name: string;
  } | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'Rascunho', variant: 'outline' },
  briefing: { label: 'Briefing', variant: 'secondary' },
  active: { label: 'Ativo', variant: 'default' },
  completed: { label: 'Concluído', variant: 'secondary' },
  archived: { label: 'Arquivado', variant: 'secondary' },
};

const focusAreaConfig: Record<string, string> = {
  marketing: 'Marketing',
  comercial: 'Comercial',
  operacional: 'Operacional',
  produto: 'Produto',
};

export default function NexiaPlanejamentos() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const [plannings, setPlannings] = useState<NexiaPlanning[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'az'>('recent');
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [archivingPlanningId, setArchivingPlanningId] = useState<string | null>(null);

  useEffect(() => {
    if (workspace) {
      fetchPlannings();
    }
  }, [workspace]);

  const fetchPlannings = async () => {
    if (!workspace) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nexia_plannings')
        .select(`
          id, name, description, primary_goal, focus_area, status, created_at, updated_at, client_id, mode,
          clients (name)
        `)
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlannings((data as NexiaPlanning[]) || []);
    } catch (error) {
      console.error('Error fetching plannings:', error);
      toast.error('Erro ao carregar planejamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!archivingPlanningId || !workspace) return;

    try {
      const planning = plannings.find(p => p.id === archivingPlanningId);
      const newStatus = planning?.status === 'archived' ? 'active' : 'archived';
      
      const { error } = await supabase
        .from('nexia_plannings')
        .update({ status: newStatus })
        .eq('id', archivingPlanningId);

      if (error) throw error;

      await supabase.from('activity_logs').insert([{
        workspace_id: workspace.id,
        type: newStatus === 'archived' ? 'nexia_plan_archived' : 'nexia_plan_restored',
        message: `Planejamento "${planning?.name}" ${newStatus === 'archived' ? 'arquivado' : 'restaurado'}`,
        metadata: { entity_type: 'plan', entity_id: archivingPlanningId },
      }]);
      
      toast.success(newStatus === 'archived' ? 'Planejamento arquivado!' : 'Planejamento restaurado!');
      setIsArchiveDialogOpen(false);
      setArchivingPlanningId(null);
      fetchPlannings();
    } catch (error) {
      console.error('Error updating planning status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDuplicate = async (planning: NexiaPlanning) => {
    if (!workspace) return;

    try {
      const { data: original } = await supabase
        .from('nexia_plannings')
        .select('*')
        .eq('id', planning.id)
        .single();

      if (!original) throw new Error('Planning not found');

      const { id, created_at, updated_at, ...rest } = original;
      
      const { data: newPlanning, error } = await supabase
        .from('nexia_plannings')
        .insert([{
          ...rest,
          name: `${planning.name} (cópia)`,
          status: 'draft',
        }])
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activity_logs').insert([{
        workspace_id: workspace.id,
        type: 'nexia_plan_duplicated',
        message: `Planejamento "${planning.name}" duplicado`,
        metadata: { entity_type: 'plan', entity_id: newPlanning.id, original_id: planning.id },
      }]);

      toast.success('Planejamento duplicado!');
      fetchPlannings();
    } catch (error) {
      console.error('Error duplicating planning:', error);
      toast.error('Erro ao duplicar planejamento');
    }
  };

  const filteredPlannings = plannings
    .filter(planning => {
      const matchesSearch = 
        planning.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planning.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || planning.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'az') return a.name.localeCompare(b.name);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusCounts = {
    all: plannings.length,
    draft: plannings.filter(p => p.status === 'draft').length,
    briefing: plannings.filter(p => p.status === 'briefing').length,
    active: plannings.filter(p => p.status === 'active').length,
    completed: plannings.filter(p => p.status === 'completed').length,
    archived: plannings.filter(p => p.status === 'archived').length,
  };

  return (
    <AppLayout title="Planejamentos - NEXIA">
      <div className="w-full space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nexia-ai')} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Planejamentos</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus planejamentos estratégicos</p>
          </div>
          <Button size="sm" onClick={() => navigate('/nexia-ai/planejamento/novo')} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Planejamento
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] h-9 text-xs">
                    <Filter className="h-3 w-3 mr-1.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos ({statusCounts.all})</SelectItem>
                    <SelectItem value="draft">Rascunhos ({statusCounts.draft})</SelectItem>
                    <SelectItem value="briefing">Briefings ({statusCounts.briefing})</SelectItem>
                    <SelectItem value="active">Ativos ({statusCounts.active})</SelectItem>
                    <SelectItem value="completed">Concluídos ({statusCounts.completed})</SelectItem>
                    <SelectItem value="archived">Arquivados ({statusCounts.archived})</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
                  <SelectTrigger className="w-[130px] h-9 text-xs">
                    <ArrowUpDown className="h-3 w-3 mr-1.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="az">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plannings List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Lista de Planejamentos ({filteredPlannings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                Carregando planejamentos...
              </div>
            ) : filteredPlannings.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-medium text-foreground mb-1">
                  {plannings.length === 0 ? 'Nenhum planejamento criado' : 'Nenhum planejamento encontrado'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plannings.length === 0 
                    ? 'Crie seu primeiro planejamento estratégico' 
                    : 'Tente ajustar os filtros de busca'}
                </p>
                {plannings.length === 0 && (
                  <Button size="sm" onClick={() => navigate('/nexia-ai/planejamento/novo')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeiro planejamento
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPlannings.map((planning) => {
                  const planningRoute = planning.mode === 'simple' 
                    ? `/nexia-ai/modo-simples?planningId=${planning.id}`
                    : `/nexia-ai/planejamento/${planning.id}`;
                  
                  return (
                    <div 
                      key={planning.id} 
                      className="flex items-center gap-3 p-3 rounded-lg border border-foreground/[0.06] hover:border-primary/20 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => navigate(planningRoute)}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0 border border-foreground/[0.04]">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h4 className="text-sm font-medium text-foreground truncate">{planning.name}</h4>
                          <Badge variant={statusConfig[planning.status]?.variant || 'outline'} className="text-xs">
                            {statusConfig[planning.status]?.label || planning.status}
                          </Badge>
                          {planning.mode === 'simple' && (
                            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              Simples
                            </Badge>
                          )}
                          {planning.focus_area && (
                            <Badge variant="outline" className="text-xs">
                              <Target className="h-2.5 w-2.5 mr-1" />
                              {focusAreaConfig[planning.focus_area] || planning.focus_area}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {planning.clients ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {planning.clients.name}
                            </span>
                          ) : planning.status === 'briefing' ? (
                            <span className="flex items-center gap-1 text-amber-600">
                              Briefing (não é cliente)
                            </span>
                          ) : null}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(planning.updated_at)}
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(planningRoute);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Abrir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(planning);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setArchivingPlanningId(planning.id);
                            setIsArchiveDialogOpen(true);
                          }}>
                            <Archive className="h-4 w-4 mr-2" />
                            {planning.status === 'archived' ? 'Restaurar' : 'Arquivar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Archive Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {plannings.find(p => p.id === archivingPlanningId)?.status === 'archived' 
                ? 'Restaurar Planejamento' 
                : 'Arquivar Planejamento'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {plannings.find(p => p.id === archivingPlanningId)?.status === 'archived'
                ? 'O planejamento será restaurado e voltará a aparecer na lista principal.'
                : 'O planejamento será movido para a lista de arquivados.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              {plannings.find(p => p.id === archivingPlanningId)?.status === 'archived' ? 'Restaurar' : 'Arquivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
