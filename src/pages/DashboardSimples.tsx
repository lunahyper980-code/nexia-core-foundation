import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { useRealMetrics } from '@/hooks/useRealMetrics';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useOwnerMetrics } from '@/hooks/useOwnerMetrics';
import { 
  Layers, 
  FileText, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Search,
  Smartphone,
  Users,
  Sparkles
} from 'lucide-react';
import { NexiaLoader } from '@/components/ui/nexia-loader';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export default function DashboardSimples() {
  const { metrics: realMetrics, metricsHistory } = useRealMetrics();
  const { isAdminOrOwner, loading: roleLoading } = useUserRole();
  const { metrics: ownerMetrics } = useOwnerMetrics();
  const { workspace } = useWorkspace();

  // Fetch project types distribution
  const { data: projectTypes } = useQuery({
    queryKey: ['project-types', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('target_platform')
        .eq('workspace_id', workspace.id);

      if (error) throw error;

      const counts: Record<string, number> = {
        'app': 0,
        'site': 0,
        'landing': 0,
      };

      data?.forEach(project => {
        const platform = project.target_platform?.toLowerCase() || 'site';
        if (platform.includes('app') || platform.includes('mobile')) {
          counts['app']++;
        } else if (platform.includes('landing')) {
          counts['landing']++;
        } else {
          counts['site']++;
        }
      });

      return [
        { name: 'Aplicativos', count: counts['app'], color: 'text-primary' },
        { name: 'Sites', count: counts['site'], color: 'text-emerald-500' },
        { name: 'Landing Pages', count: counts['landing'], color: 'text-violet-500' },
      ].filter(t => t.count > 0);
    },
    enabled: !!workspace?.id,
  });

  if (roleLoading) {
    return (
      <AppLayout title="Carregando...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <NexiaLoader size="lg" />
        </div>
      </AppLayout>
    );
  }

  const displayMetrics = isAdminOrOwner ? ownerMetrics : realMetrics;

  const stats = [
    {
      title: 'Projetos Criados',
      value: displayMetrics.projects.toString(),
      description: 'Apps + Sites',
      icon: Layers,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Propostas Enviadas',
      value: displayMetrics.proposals.toString(),
      description: 'Total de propostas',
      icon: FileText,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Valor em Propostas',
      value: `R$ ${displayMetrics.totalPipelineValue.toLocaleString('pt-BR')}`,
      description: 'Propostas ganhas',
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${displayMetrics.averageTicket.toLocaleString('pt-BR')}`,
      description: 'Por projeto',
      icon: TrendingUp,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
  ];

  const quickActions = [
    {
      title: 'Encontrar Clientes',
      description: 'Buscar novos leads',
      icon: Search,
      path: '/encontrar-clientes',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Criar App / Site',
      description: 'Novo projeto',
      icon: Smartphone,
      path: '/solucoes',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Criar Proposta',
      description: 'Proposta comercial',
      icon: FileText,
      path: '/vendas/propostas/nova',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Novo Cliente',
      description: 'Cadastrar cliente',
      icon: Users,
      path: '/clientes',
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
  ];

  return (
    <AppLayout title="Sua central de apps e sites">
      <div className="content-premium space-premium">
        
        {/* Stats Grid */}
        <PremiumFrame title="Dashboard — Modo Simples" className="fade-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="metric-card-premium p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-2xl font-semibold text-foreground mt-1.5 tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color} icon-glow-subtle`} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PremiumFrame>

        {/* Quick Actions */}
        <PremiumFrame title="Ações Rápidas" className="fade-in mt-6" style={{ animationDelay: '0.1s' }}>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.path}
                  className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 hover:border-primary/20 group"
                >
                  <div className={`p-2.5 rounded-lg ${action.bgColor} group-hover:scale-105 transition-transform`}>
                    <Icon className={`h-5 w-5 ${action.color} icon-glow-subtle`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </PremiumFrame>

        {/* Two Column Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Top Project Types */}
          <PremiumFrame title="Top Tipos de Projetos Criados" className="fade-in" style={{ animationDelay: '0.2s' }}>
            {projectTypes && projectTypes.length > 0 ? (
              <div className="space-y-3">
                {projectTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className={`h-4 w-4 ${type.color}`} />
                      </div>
                      <span className="font-medium text-foreground">{type.name}</span>
                    </div>
                    <span className={`text-lg font-semibold ${type.color}`}>{type.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Layers className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">Nenhum projeto criado ainda</p>
                <p className="text-xs mt-1 text-muted-foreground/70">Comece criando seu primeiro app ou site</p>
              </div>
            )}
          </PremiumFrame>

          {/* Progress Chart Placeholder */}
          <PremiumFrame title="Progresso dos Últimos 30 Dias" className="fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <FileText className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Propostas Criadas</p>
                    <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-success">
                  {displayMetrics.proposals}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Propostas Ganhas</p>
                    <p className="text-xs text-muted-foreground">Conversões</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-primary">
                  {displayMetrics.contracts}
                </span>
              </div>

              <Link 
                to="/historico" 
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline mt-4"
              >
                Ver histórico completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </PremiumFrame>
        </div>
      </div>
    </AppLayout>
  );
}
