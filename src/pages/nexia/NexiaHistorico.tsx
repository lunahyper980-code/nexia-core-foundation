import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  History, 
  ArrowLeft,
  Clock,
  Users,
  FileText,
  CheckSquare,
  Brain,
  Download,
  Filter,
  Search,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NexiaActivityLog } from '@/hooks/useNexiaActivity';

interface NexiaClient {
  id: string;
  name: string;
}

interface NexiaPlanning {
  id: string;
  name: string;
  client_id: string | null;
}

const eventTypeConfig: Record<string, { icon: typeof Clock; color: string; label: string; category: string }> = {
  // Clients
  CLIENT_CREATED: { icon: Users, color: 'text-emerald-500', label: 'Cliente criado', category: 'client' },
  CLIENT_UPDATED: { icon: Users, color: 'text-blue-500', label: 'Cliente atualizado', category: 'client' },
  CLIENT_DELETED: { icon: Users, color: 'text-destructive', label: 'Cliente excluído', category: 'client' },
  // Plannings
  PLAN_CREATED: { icon: FileText, color: 'text-emerald-500', label: 'Planejamento criado', category: 'plan' },
  PLAN_UPDATED: { icon: FileText, color: 'text-blue-500', label: 'Planejamento atualizado', category: 'plan' },
  PLAN_DELETED: { icon: FileText, color: 'text-destructive', label: 'Planejamento excluído', category: 'plan' },
  // AI
  IA_DIAGNOSIS_GENERATED: { icon: Brain, color: 'text-purple-500', label: 'Diagnóstico IA', category: 'ai' },
  IA_STRATEGY_GENERATED: { icon: Brain, color: 'text-purple-500', label: 'Estratégia IA', category: 'ai' },
  IA_TASKS_GENERATED: { icon: Brain, color: 'text-purple-500', label: 'Tarefas IA', category: 'ai' },
  // Tasks
  TASKS_SAVED_FROM_PLAN: { icon: CheckSquare, color: 'text-emerald-500', label: 'Tarefas salvas', category: 'task' },
  TASK_STATUS_CHANGED: { icon: CheckSquare, color: 'text-blue-500', label: 'Status alterado', category: 'task' },
  TASK_COMPLETED: { icon: CheckSquare, color: 'text-emerald-500', label: 'Tarefa concluída', category: 'task' },
  TASK_REOPENED: { icon: CheckSquare, color: 'text-amber-500', label: 'Tarefa reaberta', category: 'task' },
  TASK_ARCHIVED: { icon: CheckSquare, color: 'text-muted-foreground', label: 'Tarefa arquivada', category: 'task' },
  // Export
  PLAN_EXPORTED_PDF: { icon: Download, color: 'text-primary', label: 'Exportação PDF', category: 'export' },
  // Legacy types (backward compatibility)
  nexia_client_created: { icon: Users, color: 'text-emerald-500', label: 'Cliente criado', category: 'client' },
  nexia_client_updated: { icon: Users, color: 'text-blue-500', label: 'Cliente atualizado', category: 'client' },
  nexia_client_deleted: { icon: Users, color: 'text-destructive', label: 'Cliente excluído', category: 'client' },
  nexia_planning_created: { icon: FileText, color: 'text-emerald-500', label: 'Planejamento criado', category: 'plan' },
  nexia_planning_updated: { icon: FileText, color: 'text-blue-500', label: 'Planejamento atualizado', category: 'plan' },
  nexia_planning_completed: { icon: FileText, color: 'text-emerald-500', label: 'Planejamento concluído', category: 'plan' },
  nexia_task_completed: { icon: CheckSquare, color: 'text-emerald-500', label: 'Tarefa concluída', category: 'task' },
  nexia_task_reopened: { icon: CheckSquare, color: 'text-amber-500', label: 'Tarefa reaberta', category: 'task' },
  nexia_task_created: { icon: CheckSquare, color: 'text-emerald-500', label: 'Tarefa criada', category: 'task' },
  nexia_task_archived: { icon: CheckSquare, color: 'text-muted-foreground', label: 'Tarefa arquivada', category: 'task' },
  nexia_task_status_changed: { icon: CheckSquare, color: 'text-blue-500', label: 'Status alterado', category: 'task' },
  nexia_ai_diagnosis: { icon: Brain, color: 'text-purple-500', label: 'Diagnóstico IA', category: 'ai' },
  nexia_ai_tasks: { icon: Brain, color: 'text-purple-500', label: 'Tarefas IA', category: 'ai' },
  nexia_export: { icon: Download, color: 'text-primary', label: 'Exportação', category: 'export' },
  default: { icon: Clock, color: 'text-muted-foreground', label: 'Atividade', category: 'other' },
};

const categoryOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'client', label: 'Clientes' },
  { value: 'plan', label: 'Planejamentos' },
  { value: 'ai', label: 'IA' },
  { value: 'task', label: 'Tarefas' },
  { value: 'export', label: 'Exportações' },
];

export default function NexiaHistorico() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const [activities, setActivities] = useState<NexiaActivityLog[]>([]);
  const [clients, setClients] = useState<NexiaClient[]>([]);
  const [plannings, setPlannings] = useState<NexiaPlanning[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;

  const fetchClients = useCallback(async () => {
    if (!workspace) return;
    
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .eq('workspace_id', workspace.id)
      .order('name');
    
    setClients(data || []);
  }, [workspace]);

  const fetchPlannings = useCallback(async () => {
    if (!workspace) return;
    
    const { data } = await supabase
      .from('nexia_plannings')
      .select('id, name, client_id')
      .eq('workspace_id', workspace.id)
      .order('name');
    
    setPlannings(data || []);
  }, [workspace]);

  const fetchActivities = useCallback(async (reset = false) => {
    if (!workspace) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      // Filter by client
      if (clientFilter !== 'all') {
        query = query.contains('metadata', { client_id: clientFilter });
      }

      // Filter by plan
      if (planFilter !== 'all') {
        query = query.or(`entity_id.eq.${planFilter},metadata->plan_id.eq.${planFilter}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const newActivities = (data || []) as NexiaActivityLog[];
      
      if (reset) {
        setActivities(newActivities);
        setPage(0);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
      }
      
      setHasMore(newActivities.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [workspace, page, clientFilter, planFilter]);

  useEffect(() => {
    if (workspace) {
      fetchClients();
      fetchPlannings();
    }
  }, [workspace, fetchClients, fetchPlannings]);

  useEffect(() => {
    fetchActivities(true);
  }, [workspace, categoryFilter, clientFilter, planFilter]);

  const getEventConfig = (type: string) => {
    return eventTypeConfig[type] || eventTypeConfig.default;
  };

  const filteredActivities = activities.filter(activity => {
    // Category filter
    if (categoryFilter !== 'all') {
      const config = getEventConfig(activity.type);
      if (config.category !== categoryFilter) return false;
    }
    
    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const title = activity.title?.toLowerCase() || '';
      const description = activity.description?.toLowerCase() || activity.message?.toLowerCase() || '';
      if (!title.includes(search) && !description.includes(search)) return false;
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays} dias atrás`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchActivities();
  };

  const refresh = () => {
    fetchActivities(true);
  };

  // Get filtered plannings based on client selection
  const filteredPlannings = clientFilter !== 'all' 
    ? plannings.filter(p => p.client_id === clientFilter)
    : plannings;

  return (
    <AppLayout title="Histórico - NEXIA">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nexia-ai')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
            <p className="text-muted-foreground">Tudo o que aconteceu no seu workspace</p>
          </div>
          <Button variant="outline" size="icon" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar no histórico..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros:</span>
          </div>
          
          {/* Category filter buttons */}
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((option) => (
              <Button
                key={option.value}
                variant={categoryFilter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por planejamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os planejamentos</SelectItem>
              {filteredPlannings.map(plan => (
                <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Atividades ({filteredActivities.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && activities.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Carregando histórico...
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <History className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma atividade encontrada
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || categoryFilter !== 'all' || clientFilter !== 'all' || planFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'As atividades serão registradas aqui automaticamente'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="divide-y divide-border">
                  {filteredActivities.map((activity) => {
                    const config = getEventConfig(activity.type);
                    const Icon = config.icon;
                    
                    return (
                      <div 
                        key={activity.id} 
                        className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                      >
                        {/* Timeline indicator */}
                        <div className="relative flex flex-col items-center">
                          <div className={`p-2 rounded-lg bg-muted/50`}>
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-foreground">
                                {activity.title || config.label}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {activity.description || activity.message}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                            {activity.metadata && (activity.metadata as Record<string, unknown>).client_name && (
                              <Badge variant="secondary" className="text-xs">
                                {(activity.metadata as Record<string, unknown>).client_name as string}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Load more */}
                {hasMore && (
                  <div className="p-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={loadMore} 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Carregando...
                        </>
                      ) : (
                        'Carregar mais'
                      )}
                    </Button>
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
