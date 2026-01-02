import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckSquare, 
  Search, 
  ArrowLeft,
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  Play,
  Archive,
  Filter,
  X,
  Target,
  Building2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  ListChecks
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

interface NexiaTask {
  id: string;
  title: string;
  objective: string | null;
  description: string | null;
  steps: string | null;
  completion_criteria: string | null;
  status: string;
  priority: string | null;
  focus_area: string | null;
  objective_title: string | null;
  completed_at: string | null;
  completed_by_user_id: string | null;
  created_at: string;
  planning_id: string | null;
  client_id: string | null;
  nexia_plannings?: { id: string; name: string } | null;
  clients?: { id: string; name: string } | null;
}

interface Client {
  id: string;
  name: string;
}

interface Planning {
  id: string;
  name: string;
  client_id: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Circle }> = {
  todo: { label: "A Fazer", color: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: Circle },
  doing: { label: "Em Andamento", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Play },
  done: { label: "Concluída", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  archived: { label: "Arquivada", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Archive },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "bg-slate-500/10 text-slate-600" },
  medium: { label: "Média", color: "bg-amber-500/10 text-amber-600" },
  high: { label: "Alta", color: "bg-red-500/10 text-red-600" },
};

const AREA_CONFIG: Record<string, { label: string; color: string }> = {
  marketing: { label: "Marketing", color: "bg-purple-500/10 text-purple-600" },
  comercial: { label: "Comercial", color: "bg-green-500/10 text-green-600" },
  digital: { label: "Digital", color: "bg-blue-500/10 text-blue-600" },
  web: { label: "Web", color: "bg-cyan-500/10 text-cyan-600" },
  social: { label: "Social", color: "bg-pink-500/10 text-pink-600" },
  trafego: { label: "Tráfego", color: "bg-orange-500/10 text-orange-600" },
  automacao: { label: "Automação", color: "bg-indigo-500/10 text-indigo-600" },
  operacional: { label: "Operacional", color: "bg-amber-500/10 text-amber-600" },
};

export default function NexiaTarefas() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<NexiaTask[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [planningFilter, setPlanningFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<NexiaTask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (workspace) {
      fetchData();
    }
  }, [workspace]);

  const fetchData = async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      const [tasksRes, clientsRes, planningsRes] = await Promise.all([
        supabase.from('nexia_tasks').select(`*, nexia_plannings(id, name), clients(id, name)`).eq('workspace_id', workspace.id).order('created_at', { ascending: false }),
        supabase.from('clients').select('id, name').eq('workspace_id', workspace.id).eq('status', 'active').order('name'),
        supabase.from('nexia_plannings').select('id, name, client_id').eq('workspace_id', workspace.id).neq('status', 'archived').order('name'),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      setTasks(tasksRes.data || []);
      setClients(clientsRes.data || []);
      setPlannings(planningsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (type: string, message: string, metadata?: Json) => {
    if (!workspace?.id) return;
    try {
      await supabase.from('activity_logs').insert([{
        workspace_id: workspace.id,
        type,
        message,
        metadata: metadata || {},
      }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const updateTaskStatus = async (task: NexiaTask, newStatus: string) => {
    if (!workspace || !user) return;
    setIsUpdating(true);
    
    const completedAt = newStatus === 'done' ? new Date().toISOString() : null;
    const completedBy = newStatus === 'done' ? user.id : null;

    try {
      const { error } = await supabase.from('nexia_tasks').update({ 
        status: newStatus, 
        completed_at: completedAt,
        completed_by_user_id: completedBy,
        updated_at: new Date().toISOString(),
      }).eq('id', task.id);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: newStatus, completed_at: completedAt, completed_by_user_id: completedBy } : t
      ));

      if (selectedTask?.id === task.id) {
        setSelectedTask({ ...selectedTask, status: newStatus, completed_at: completedAt, completed_by_user_id: completedBy });
      }

      // Log activity
      const eventType = newStatus === 'done' ? 'nexia_task_completed' : newStatus === 'archived' ? 'nexia_task_archived' : task.status === 'done' ? 'nexia_task_reopened' : 'nexia_task_status_changed';
      const message = newStatus === 'done' ? `Tarefa "${task.title}" concluída` : 
                      newStatus === 'archived' ? `Tarefa "${task.title}" arquivada` :
                      task.status === 'done' ? `Tarefa "${task.title}" reaberta` :
                      `Status da tarefa "${task.title}" alterado para ${STATUS_CONFIG[newStatus]?.label || newStatus}`;
      
      await logActivity(eventType, message, {
        entity_type: 'task',
        entity_id: task.id,
        planning_id: task.planning_id,
        client_id: task.client_id,
        old_status: task.status,
        new_status: newStatus,
      } as Json);

      toast.success(STATUS_CONFIG[newStatus]?.label ? `Tarefa: ${STATUS_CONFIG[newStatus].label}` : 'Status atualizado');
      setIsArchiveDialogOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewTask = (task: NexiaTask) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setClientFilter('all');
    setPlanningFilter('all');
    setAreaFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = statusFilter !== 'all' || clientFilter !== 'all' || planningFilter !== 'all' || areaFilter !== 'all' || priorityFilter !== 'all' || searchTerm !== '';

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.objective?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.objective_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesClient = clientFilter === 'all' || task.client_id === clientFilter;
    const matchesPlanning = planningFilter === 'all' || task.planning_id === planningFilter;
    const matchesArea = areaFilter === 'all' || task.focus_area === areaFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesClient && matchesPlanning && matchesArea && matchesPriority;
  });

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const doingCount = tasks.filter(t => t.status === 'doing').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredPlannings = clientFilter !== 'all' 
    ? plannings.filter(p => p.client_id === clientFilter) 
    : plannings;

  return (
    <AppLayout title="Tarefas - NEXIA">
      <div className="w-full space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nexia-ai')} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Tarefas</h1>
            <p className="text-sm text-muted-foreground">Tarefas geradas a partir de planejamentos</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-4">
          <Card className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-1 ring-primary border-primary/30' : ''}`} onClick={() => setStatusFilter('all')}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-foreground/[0.04]"><CheckSquare className="h-4 w-4 text-primary" /></div>
              <div><p className="text-xl font-bold">{tasks.filter(t => t.status !== 'archived').length}</p><p className="text-xs text-muted-foreground">Total</p></div>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all ${statusFilter === 'todo' ? 'ring-1 ring-slate-500 border-slate-500/30' : ''}`} onClick={() => setStatusFilter('todo')}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-500/10 border border-foreground/[0.04]"><Circle className="h-4 w-4 text-slate-500" /></div>
              <div><p className="text-xl font-bold">{todoCount}</p><p className="text-xs text-muted-foreground">A Fazer</p></div>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all ${statusFilter === 'doing' ? 'ring-1 ring-blue-500 border-blue-500/30' : ''}`} onClick={() => setStatusFilter('doing')}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-foreground/[0.04]"><Play className="h-4 w-4 text-blue-500" /></div>
              <div><p className="text-xl font-bold">{doingCount}</p><p className="text-xs text-muted-foreground">Em Andamento</p></div>
            </CardContent>
          </Card>
          <Card className={`cursor-pointer transition-all ${statusFilter === 'done' ? 'ring-1 ring-emerald-500 border-emerald-500/30' : ''}`} onClick={() => setStatusFilter('done')}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-foreground/[0.04]"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
              <div><p className="text-xl font-bold">{doneCount}</p><p className="text-xs text-muted-foreground">Concluídas</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Filtros</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto gap-1 h-7 text-xs">
                    <X className="h-3 w-3" />Limpar
                  </Button>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-9 text-sm" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="todo">A Fazer</SelectItem>
                    <SelectItem value="doing">Em Andamento</SelectItem>
                    <SelectItem value="done">Concluída</SelectItem>
                    <SelectItem value="archived">Arquivada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={clientFilter} onValueChange={(v) => { setClientFilter(v); setPlanningFilter('all'); }}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Cliente" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Todos Clientes</SelectItem>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={planningFilter} onValueChange={setPlanningFilter}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Planejamento" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Todos Planejamentos</SelectItem>
                    {filteredPlannings.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Área" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Todas Áreas</SelectItem>
                    {Object.entries(AREA_CONFIG).map(([key, val]) => <SelectItem key={key} value={key}>{val.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              Lista de Tarefas ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />Carregando...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <CheckSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-medium text-foreground mb-1">Nenhuma tarefa encontrada</h3>
                <p className="text-sm text-muted-foreground mb-4">As tarefas são geradas ao criar um planejamento com IA</p>
                <Button size="sm" onClick={() => navigate('/nexia-ai/planejamento/novo')}>Criar Planejamento</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => {
                  const StatusIcon = STATUS_CONFIG[task.status]?.icon || Circle;
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-foreground/[0.06] hover:border-primary/20 hover:bg-muted/20 transition-colors">
                      <button onClick={() => updateTaskStatus(task, task.status === 'done' ? 'todo' : task.status === 'todo' ? 'doing' : 'done')} className="flex-shrink-0" disabled={isUpdating}>
                        <StatusIcon className={`h-5 w-5 ${task.status === 'done' ? 'text-emerald-500' : task.status === 'doing' ? 'text-blue-500' : 'text-muted-foreground hover:text-primary'} transition-colors`} />
                      </button>
                      
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewTask(task)}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-medium ${task.status === 'done' || task.status === 'archived' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</h4>
                          {task.focus_area && AREA_CONFIG[task.focus_area] && (
                            <Badge variant="outline" className={`text-xs ${AREA_CONFIG[task.focus_area].color}`}>{AREA_CONFIG[task.focus_area].label}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {task.clients?.name && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{task.clients.name}</span>}
                          {task.objective_title && <span className="flex items-center gap-1"><Target className="h-3 w-3" />{task.objective_title}</span>}
                        </div>
                      </div>

                      <Badge variant="outline" className={STATUS_CONFIG[task.status]?.color || ''}>{STATUS_CONFIG[task.status]?.label || task.status}</Badge>

                      <Button variant="ghost" size="icon" onClick={() => handleViewTask(task)}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-lg">
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />{selectedTask.title}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={STATUS_CONFIG[selectedTask.status]?.color}>{STATUS_CONFIG[selectedTask.status]?.label}</Badge>
                  {selectedTask.focus_area && AREA_CONFIG[selectedTask.focus_area] && (
                    <Badge variant="outline" className={AREA_CONFIG[selectedTask.focus_area].color}>{AREA_CONFIG[selectedTask.focus_area].label}</Badge>
                  )}
                  {selectedTask.priority && PRIORITY_CONFIG[selectedTask.priority] && (
                    <Badge variant="outline" className={PRIORITY_CONFIG[selectedTask.priority].color}>Prioridade: {PRIORITY_CONFIG[selectedTask.priority].label}</Badge>
                  )}
                </SheetDescription>
              </SheetHeader>
              
              <ScrollArea className="h-[calc(100vh-280px)] mt-6">
                <div className="space-y-6 pr-4">
                  {/* Links */}
                  <div className="flex flex-wrap gap-2 text-sm">
                    {selectedTask.clients && (
                      <button onClick={() => navigate(`/nexia-ai/cliente/${selectedTask.client_id}`)} className="flex items-center gap-1 text-primary hover:underline">
                        <Building2 className="h-3 w-3" />{selectedTask.clients.name}
                      </button>
                    )}
                    {selectedTask.nexia_plannings && (
                      <button onClick={() => navigate(`/nexia-ai/planejamento/${selectedTask.planning_id}`)} className="flex items-center gap-1 text-primary hover:underline">
                        <Target className="h-3 w-3" />{selectedTask.nexia_plannings.name}
                      </button>
                    )}
                  </div>

                  {selectedTask.objective_title && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Objetivo Relacionado</h4>
                      <p className="text-sm">{selectedTask.objective_title}</p>
                    </div>
                  )}

                  {selectedTask.objective && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Objetivo da Tarefa</h4>
                      <p className="text-sm">{selectedTask.objective}</p>
                    </div>
                  )}

                  {selectedTask.description && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h4>
                      <p className="text-sm whitespace-pre-wrap">{selectedTask.description}</p>
                    </div>
                  )}

                  {selectedTask.steps && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Passo a Passo</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        {selectedTask.steps.split('\n').filter(Boolean).map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {selectedTask.completion_criteria && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Critério de Conclusão</h4>
                      <p className="text-sm bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">{selectedTask.completion_criteria}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Criada em: {formatDate(selectedTask.created_at)}</p>
                    {selectedTask.completed_at && <p>Concluída em: {formatDate(selectedTask.completed_at)}</p>}
                  </div>
                </div>
              </ScrollArea>

              <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
                {selectedTask.status === 'todo' && (
                  <Button onClick={() => updateTaskStatus(selectedTask, 'doing')} disabled={isUpdating} className="gap-2">
                    <Play className="h-4 w-4" />Iniciar
                  </Button>
                )}
                {selectedTask.status === 'doing' && (
                  <Button onClick={() => updateTaskStatus(selectedTask, 'done')} disabled={isUpdating} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />Concluir
                  </Button>
                )}
                {selectedTask.status === 'done' && (
                  <Button variant="outline" onClick={() => updateTaskStatus(selectedTask, 'doing')} disabled={isUpdating} className="gap-2">
                    <RotateCcw className="h-4 w-4" />Reabrir
                  </Button>
                )}
                {selectedTask.status !== 'archived' && (
                  <Button variant="outline" onClick={() => setIsArchiveDialogOpen(true)} disabled={isUpdating} className="gap-2">
                    <Archive className="h-4 w-4" />Arquivar
                  </Button>
                )}
                {selectedTask.status === 'archived' && (
                  <Button variant="outline" onClick={() => updateTaskStatus(selectedTask, 'todo')} disabled={isUpdating} className="gap-2">
                    <RotateCcw className="h-4 w-4" />Restaurar
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Archive Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />Arquivar Tarefa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja arquivar a tarefa "{selectedTask?.title}"? Você pode restaurá-la depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedTask && updateTaskStatus(selectedTask, 'archived')} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
