import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Users, 
  FileText, 
  CheckSquare, 
  Clock, 
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  RefreshCw,
  Building2,
  Target,
  Zap,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useOwnerMetrics } from '@/hooks/useOwnerMetrics';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NexiaActivityLog } from '@/hooks/useNexiaActivity';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NexiaDashboardUpsellCard, NexiaUpsellModal } from '@/components/nexia';
import { NextStepCard } from '@/components/academy/NextStepCard';


interface DashboardStats {
  clients: number;
  activePlannings: number;
  pendingTasks: number;
  completedTasks: number;
}

const eventTypeIcons: Record<string, typeof Clock> = {
  CLIENT_CREATED: Users,
  CLIENT_UPDATED: Users,
  CLIENT_DELETED: Users,
  PLAN_CREATED: FileText,
  PLAN_UPDATED: FileText,
  PLAN_DELETED: FileText,
  IA_DIAGNOSIS_GENERATED: Brain,
  IA_STRATEGY_GENERATED: Zap,
  IA_TASKS_GENERATED: Target,
  TASKS_SAVED_FROM_PLAN: CheckSquare,
  TASK_STATUS_CHANGED: CheckSquare,
  TASK_COMPLETED: CheckCircle2,
  TASK_REOPENED: Circle,
  TASK_ARCHIVED: CheckSquare,
  nexia_client_created: Users,
  nexia_client_updated: Users,
  nexia_planning_created: FileText,
  nexia_task_completed: CheckCircle2,
  nexia_task_created: CheckSquare,
  nexia_ai_diagnosis: Brain,
  nexia_ai_tasks: Target,
};

const eventTypeColors: Record<string, string> = {
  CLIENT_CREATED: 'text-emerald-500',
  CLIENT_UPDATED: 'text-blue-500',
  CLIENT_DELETED: 'text-destructive',
  PLAN_CREATED: 'text-emerald-500',
  PLAN_UPDATED: 'text-blue-500',
  IA_DIAGNOSIS_GENERATED: 'text-purple-500',
  IA_STRATEGY_GENERATED: 'text-purple-500',
  IA_TASKS_GENERATED: 'text-purple-500',
  TASK_COMPLETED: 'text-emerald-500',
  TASK_REOPENED: 'text-amber-500',
  TASKS_SAVED_FROM_PLAN: 'text-emerald-500',
  nexia_client_created: 'text-emerald-500',
  nexia_planning_created: 'text-emerald-500',
  nexia_task_completed: 'text-emerald-500',
  nexia_ai_diagnosis: 'text-purple-500',
};

export default function NexiaHome() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { isOwner, metrics, getMetricValue } = useOwnerMetrics();
  const [stats, setStats] = useState<DashboardStats>({ 
    clients: 0, 
    activePlannings: 0, 
    pendingTasks: 0,
    completedTasks: 0 
  });
  const [recentActivity, setRecentActivity] = useState<NexiaActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);


  const fetchStats = useCallback(async () => {
    if (!workspace) return;

    try {
      const [clientsRes, planningsRes, pendingTasksRes, completedTasksRes] = await Promise.all([
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('status', 'active'),
        supabase
          .from('nexia_plannings')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .in('status', ['draft', 'active']),
        supabase
          .from('nexia_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .in('status', ['todo', 'doing']),
        supabase
          .from('nexia_tasks')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('status', 'done'),
      ]);

      setStats({
        clients: clientsRes.count || 0,
        activePlannings: planningsRes.count || 0,
        pendingTasks: pendingTasksRes.count || 0,
        completedTasks: completedTasksRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [workspace]);

  const fetchRecentActivity = useCallback(async () => {
    if (!workspace) return;

    try {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity((data || []) as NexiaActivityLog[]);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  }, [workspace]);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchStats(), fetchRecentActivity()]);
    setLoading(false);
  }, [fetchStats, fetchRecentActivity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  useEffect(() => {
    if (workspace) {
      fetchAll();
    }
  }, [workspace, fetchAll]);

  useEffect(() => {
    if (!workspace) return;

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients', filter: `workspace_id=eq.${workspace.id}` },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nexia_plannings', filter: `workspace_id=eq.${workspace.id}` },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nexia_tasks', filter: `workspace_id=eq.${workspace.id}` },
        () => fetchStats()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs', filter: `workspace_id=eq.${workspace.id}` },
        () => fetchRecentActivity()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace, fetchStats, fetchRecentActivity]);

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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    return eventTypeIcons[type] || Clock;
  };

  const getActivityColor = (type: string) => {
    return eventTypeColors[type] || 'text-muted-foreground';
  };

  const metricCards = [
    { 
      title: 'Clientes', 
      value: getMetricValue(metrics.clients, stats.clients), 
      subtitle: 'clientes cadastrados',
      icon: Users, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      path: '/nexia-ai/clientes'
    },
    { 
      title: 'Planejamentos', 
      value: getMetricValue(metrics.plannings, stats.activePlannings), 
      subtitle: 'em andamento',
      icon: FileText, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      path: '/nexia-ai/planejamentos'
    },
    { 
      title: 'Tarefas Pendentes', 
      value: getMetricValue(metrics.pendingTasks, stats.pendingTasks), 
      subtitle: 'aguardando execução',
      icon: Circle, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      path: '/nexia-ai/tarefas'
    },
    { 
      title: 'Tarefas Concluídas', 
      value: getMetricValue(metrics.completedTasks, stats.completedTasks), 
      subtitle: 'já finalizadas',
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      path: '/nexia-ai/tarefas'
    },
  ];

  const quickActions = [
    { label: 'Novo Briefing', icon: FileText, path: '/nexia-ai/briefings' },
    { label: 'Novo Planejamento', icon: Brain, path: '/nexia-ai/planejamento/novo' },
    { label: 'Ver Tarefas', icon: CheckSquare, path: '/nexia-ai/tarefas' },
  ];

  return (
    <AppLayout title="NEXIA">
      <NexiaUpsellModal
        open={showUpsellModal}
        onOpenChange={setShowUpsellModal}
        onActivateFull={() => navigate('/nexia-ai/planejamento/novo')}
      />

      <div className="content-premium space-premium">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Brain className="h-6 w-6 text-primary icon-glow-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">NEXIA</h1>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-1 rounded-full bg-primary/10 cursor-help">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-xs">Dashboard em tempo real. Dados atualizados automaticamente.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Diagnóstico, planejamento e tarefas acionáveis para empresas
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="shrink-0 h-9 w-9"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" className="gap-2" onClick={() => navigate('/nexia-ai/planejamento/novo')}>
              <Plus className="h-4 w-4" />
              Criar Planejamento
            </Button>
          </div>
        </div>

        {/* Next Step Card */}
        <NextStepCard 
          message="Aplicar a solução recomendada pelo diagnóstico."
          buttonText="Ir para Soluções Digitais"
          path="/solucoes"
        />

        {/* Metric Cards */}
        <PremiumFrame title="Métricas — Nexia Suite" className="fade-in mb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((card) => {
              const Icon = card.icon;
              
              return (
                <div 
                  key={card.title}
                  className="metric-card-premium p-5 cursor-pointer hover:border-primary/30 transition-all group"
                  onClick={() => navigate(card.path)}
                >
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-8 w-14" />
                      <Skeleton className="h-2 w-24" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                        <p className="text-3xl font-bold text-foreground mt-0.5">{card.value}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{card.subtitle}</p>
                      </div>
                      <div className={`p-2.5 rounded-lg ${card.bg} group-hover:scale-105 transition-transform border border-primary/10`}>
                        <Icon className={`h-5 w-5 ${card.color} icon-glow-subtle`} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </PremiumFrame>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <PremiumFrame title="Ações — Nexia Suite" className="fade-in lg:col-span-1" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-primary icon-glow-subtle" />
              <h3 className="text-sm font-medium text-foreground">Ações Rápidas</h3>
            </div>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button 
                    key={action.label}
                    variant="outline" 
                    size="sm"
                    className="w-full justify-between group text-xs border-primary/15 hover:border-primary/30 hover:bg-primary/5"
                    onClick={() => navigate(action.path)}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                );
              })}

              <NexiaDashboardUpsellCard onExplore={() => setShowUpsellModal(true)} />
            </div>
          </PremiumFrame>

          {/* Recent Activity */}
          <PremiumFrame title="Atividade — Nexia Suite" className="fade-in lg:col-span-2" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary icon-glow-subtle" />
                <h3 className="text-lg font-semibold text-foreground">Atividade Recente</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/nexia-ai/historico')}
                className="text-muted-foreground hover:text-foreground"
              >
                Ver histórico
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary icon-glow-subtle" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma atividade ainda</h3>
                <p className="text-muted-foreground text-sm">
                  Comece criando um cliente ou planejamento
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/nexia-ai/planejamento/novo')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Planejamento
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[320px] pr-4">
                <div className="space-y-2">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const color = getActivityColor(activity.type);
                    
                    return (
                      <div 
                        key={activity.id} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {activity.title || activity.message}
                          </p>
                          {activity.description && activity.description !== activity.title && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {activity.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatDate(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </PremiumFrame>
        </div>
      </div>
    </AppLayout>
  );
}
