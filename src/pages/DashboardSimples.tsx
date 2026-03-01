import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useTeamMetrics } from '@/hooks/useTeamMetrics';
import { useRevenueMetrics } from '@/hooks/useRevenueMetrics';
import { useContractsMetrics } from '@/hooks/useContractsMetrics';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Search,
  Smartphone,
  Users,
  RefreshCcw,
  Percent,
  FileText,
  Award,
  AlertCircle,
} from 'lucide-react';
import { NexiaLoader } from '@/components/ui/nexia-loader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardSimples() {
  const { isAdminOrOwner, loading: roleLoading } = useUserRole();
  const { teamData } = useTeamMetrics();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  
  // Chart period selector: 7 or 30 days
  const [chartPeriod, setChartPeriod] = useState<7 | 30>(30);
  
  // Use the revenue metrics hook with period filter
  // Este hook já separa admin (owner_metrics) vs usuário comum (contratos)
  const {
    periodMetrics,
    chartData,
    totalRevenue,
    totalRecurrence,
    loading: metricsLoading,
  } = useRevenueMetrics(chartPeriod);

  // Fetch project types distribution (apenas projetos do usuário)
  const { data: projectTypes, isLoading: projectsLoading } = useQuery({
    queryKey: ['project-types-dashboard', workspace?.id, user?.id, isAdminOrOwner],
    queryFn: async () => {
      if (!workspace?.id) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('target_platform, app_name')
        .eq('workspace_id', workspace.id);

      if (error) throw error;

      // Se não há projetos reais e NÃO é admin, retorna vazio
      if (!data?.length && !isAdminOrOwner) {
        return [];
      }

      const counts: Record<string, number> = {
        'Site institucional': 0,
        'App de Delivery': 0,
        'Landing Page': 0,
      };

      data?.forEach(project => {
        const platform = project.target_platform?.toLowerCase() || '';
        const name = project.app_name?.toLowerCase() || '';
        
        if (platform.includes('delivery') || name.includes('delivery')) {
          counts['App de Delivery']++;
        } else if (platform.includes('landing') || name.includes('landing')) {
          counts['Landing Page']++;
        } else {
          counts['Site institucional']++;
        }
      });

      // Se admin sem dados reais, usar dados demo
      if (!data?.length && isAdminOrOwner) {
        return [
          { name: 'Site institucional', count: 12, position: 1 },
          { name: 'App de Delivery', count: 8, position: 2 },
          { name: 'Landing Page', count: 5, position: 3 },
        ];
      }

      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    },
    enabled: !!workspace?.id,
  });

  if (roleLoading || metricsLoading) {
    return (
      <AppLayout title="Carregando...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <NexiaLoader size="lg" />
        </div>
      </AppLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Recorrência mensal (todos os contratos assinados)
  const monthlyRecurrence = totalRecurrence;
  
  // Comissão = 10% do volume da equipe (apenas para admin)
  const commission = Math.round((teamData?.stats.totalVolume || monthlyRecurrence) * 0.1);
  
  // Growth indicator
  const hasGrowth = periodMetrics.hasComparison && periodMetrics.growthPercentage !== null;
  const isPositiveGrowth = hasGrowth && periodMetrics.growthPercentage! >= 0;

  // Check if user has data (for regular users)
  const hasNoData = !isAdminOrOwner && totalRevenue === 0;

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

  // Top 3 project types - only show if has projects
  const topProjects = projectTypes || [];
  const hasProjects = topProjects.length > 0;

  return (
    <AppLayout title="Dashboard">
      <div className="content-premium space-premium">
        
        {/* Main Chart - Evolução do Faturamento */}
        <PremiumFrame className="fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Evolução do Faturamento
              </h3>
              {/* Growth indicator */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  Período: {formatCurrency(periodMetrics.periodRevenue)}
                </span>
                {hasGrowth ? (
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    isPositiveGrowth ? 'text-emerald-500' : 'text-destructive'
                  }`}>
                    {isPositiveGrowth ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {isPositiveGrowth ? '+' : ''}{periodMetrics.growthPercentage}%
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/60">
                    {hasNoData ? 'Sem contratos ainda' : 'Sem dados para comparação'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={chartPeriod === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setChartPeriod(7)}
                className="text-xs h-8"
              >
                Últimos 7 dias
              </Button>
              <Button
                variant={chartPeriod === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setChartPeriod(30)}
                className="text-xs h-8"
              >
                Últimos 30 dias
              </Button>
            </div>
          </div>
          <div className="h-[200px] sm:h-[280px] w-full">
            {hasNoData ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">
                  Nenhum contrato assinado ainda.
                </p>
                <p className="text-muted-foreground/60 text-xs mt-1">
                  Crie seu primeiro contrato para ver o gráfico.
                </p>
                <Link to="/contratos">
                  <Button variant="outline" size="sm" className="mt-4">
                    Criar Contrato
                  </Button>
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(268, 65%, 58%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(268, 65%, 58%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 12%, 18%)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(220, 8%, 55%)" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval={chartPeriod === 7 ? 0 : "preserveStartEnd"}
                  />
                  <YAxis 
                    stroke="hsl(220, 8%, 55%)" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(230, 16%, 9%)',
                      border: '1px solid hsl(230, 12%, 18%)',
                      borderRadius: '8px',
                      color: 'hsl(220, 15%, 92%)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(268, 65%, 58%)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </PremiumFrame>

        {/* KPI Cards - Grid dinâmico baseado no role */}
        <div className={`grid grid-cols-1 gap-4 mt-6 ${isAdminOrOwner ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {/* Faturamento Total */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Faturamento Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-500 mt-1">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {isAdminOrOwner ? 'valor acumulado' : 'contratos assinados'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recorrência Mensal */}
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Recorrência Mensal</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary mt-1">
                    {formatCurrency(monthlyRecurrence)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    contratos assinados
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <RefreshCcw className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sua Comissão - APENAS para Admin/Owner */}
          {isAdminOrOwner && (
            <Card className="bg-gradient-to-br from-warning/10 to-transparent border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Sua Comissão</p>
                    <p className="text-2xl sm:text-3xl font-bold text-warning mt-1">
                      {formatCurrency(commission)}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      10% do volume da equipe
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-warning/10">
                    <Percent className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

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

        {/* Top 3 Projects - ONLY show if user has projects */}
        {hasProjects && (
          <PremiumFrame title="Top 3 Projetos" className="fade-in mt-6" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-3">
              {topProjects.map((project, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                        index === 1 ? 'bg-zinc-400/20 text-zinc-400' : 
                        'bg-amber-700/20 text-amber-700'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">Tipo de projeto</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className={`h-5 w-5 ${
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-zinc-400' : 
                      'text-amber-700'
                    }`} />
                    <span className="text-lg font-bold text-foreground">{project.count}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <Link 
              to="/hyperbuild/projetos-lista" 
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline mt-4"
            >
              Ver todos os projetos <ArrowRight className="h-4 w-4" />
            </Link>
          </PremiumFrame>
        )}
      </div>
    </AppLayout>
  );
}
