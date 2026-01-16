import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { useRealMetrics } from '@/hooks/useRealMetrics';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useOwnerMetrics } from '@/hooks/useOwnerMetrics';
import { GraficoEvolucao } from '@/components/dashboard/GraficoEvolucao';
import { 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Search,
  Smartphone,
  Users,
  FileText,
  Repeat,
  Percent,
  Trophy,
} from 'lucide-react';
import { NexiaLoader } from '@/components/ui/nexia-loader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

// Admin demo data for contracts
const ADMIN_DEMO_CONTRACTS = [
  { id: 'demo-1', type: 'recorrente', value: 2500, monthlyRecurrence: 2500, status: 'active' },
  { id: 'demo-2', type: 'recorrente', value: 1800, monthlyRecurrence: 1800, status: 'active' },
  { id: 'demo-3', type: 'unico', value: 4500, monthlyRecurrence: 0, status: 'completed' },
  { id: 'demo-4', type: 'recorrente', value: 3200, monthlyRecurrence: 3200, status: 'active' },
  { id: 'demo-5', type: 'unico', value: 8000, monthlyRecurrence: 0, status: 'completed' },
  { id: 'demo-6', type: 'recorrente', value: 1500, monthlyRecurrence: 1500, status: 'active' },
  { id: 'demo-7', type: 'unico', value: 12000, monthlyRecurrence: 0, status: 'completed' },
  { id: 'demo-8', type: 'recorrente', value: 2200, monthlyRecurrence: 2200, status: 'active' },
];

// Admin demo products/projects
const ADMIN_DEMO_TOP_PRODUCTS = [
  { name: 'Aplicativo Mobile', count: 12, color: 'text-primary' },
  { name: 'Site Institucional', count: 9, color: 'text-emerald-500' },
  { name: 'Landing Page', count: 7, color: 'text-violet-500' },
  { name: 'E-commerce', count: 5, color: 'text-warning' },
  { name: 'Sistema Web', count: 4, color: 'text-pink-500' },
];

// Commission rate for admin (percentage of team revenue)
const ADMIN_COMMISSION_RATE = 0.15; // 15%

export default function DashboardSimples() {
  const { metrics: realMetrics, metricsHistory } = useRealMetrics();
  const { isAdminOrOwner, loading: roleLoading } = useUserRole();
  const { metrics: ownerMetrics } = useOwnerMetrics();
  const { workspace } = useWorkspace();

  // Fetch project types distribution (for normal users)
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
        'ecommerce': 0,
        'sistema': 0,
      };

      data?.forEach(project => {
        const platform = project.target_platform?.toLowerCase() || 'site';
        if (platform.includes('app') || platform.includes('mobile')) {
          counts['app']++;
        } else if (platform.includes('landing')) {
          counts['landing']++;
        } else if (platform.includes('ecommerce') || platform.includes('loja')) {
          counts['ecommerce']++;
        } else if (platform.includes('sistema') || platform.includes('web')) {
          counts['sistema']++;
        } else {
          counts['site']++;
        }
      });

      return [
        { name: 'Aplicativos', count: counts['app'], color: 'text-primary' },
        { name: 'Sites', count: counts['site'], color: 'text-emerald-500' },
        { name: 'Landing Pages', count: counts['landing'], color: 'text-violet-500' },
        { name: 'E-commerce', count: counts['ecommerce'], color: 'text-warning' },
        { name: 'Sistemas Web', count: counts['sistema'], color: 'text-pink-500' },
      ].filter(t => t.count > 0).slice(0, 5);
    },
    enabled: !!workspace?.id && !isAdminOrOwner,
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

  // Calculate metrics based on role
  const displayMetrics = isAdminOrOwner ? ownerMetrics : realMetrics;

  // Admin demo calculations
  const adminTotalRevenue = ADMIN_DEMO_CONTRACTS.reduce((sum, c) => sum + c.value, 0);
  const adminMonthlyRecurrence = ADMIN_DEMO_CONTRACTS.reduce((sum, c) => sum + c.monthlyRecurrence, 0);
  const adminCommission = Math.round(adminTotalRevenue * ADMIN_COMMISSION_RATE);
  const adminTicketMedio = Math.round(adminTotalRevenue / ADMIN_DEMO_CONTRACTS.length);

  // Stats for admin
  const adminStats = [
    {
      title: 'Faturamento Total',
      value: `R$ ${adminTotalRevenue.toLocaleString('pt-BR')}`,
      description: 'Valor total de contratos',
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Recorrência Mensal',
      value: `R$ ${adminMonthlyRecurrence.toLocaleString('pt-BR')}`,
      description: 'Contratos recorrentes',
      icon: Repeat,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Minha Comissão',
      value: `R$ ${adminCommission.toLocaleString('pt-BR')}`,
      description: `${(ADMIN_COMMISSION_RATE * 100).toFixed(0)}% do faturamento`,
      icon: Percent,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${adminTicketMedio.toLocaleString('pt-BR')}`,
      description: 'Por contrato',
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  // Stats for normal users (starts at zero)
  const userStats = [
    {
      title: 'Faturamento Total',
      value: `R$ ${displayMetrics.totalPipelineValue.toLocaleString('pt-BR')}`,
      description: 'Valor total de contratos',
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Recorrência Mensal',
      value: `R$ 0`,
      description: 'Contratos recorrentes',
      icon: Repeat,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Propostas Enviadas',
      value: displayMetrics.proposals.toString(),
      description: 'Total de propostas',
      icon: FileText,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${displayMetrics.averageTicket.toLocaleString('pt-BR')}`,
      description: 'Por projeto',
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  const stats = isAdminOrOwner ? adminStats : userStats;
  const topProducts = isAdminOrOwner ? ADMIN_DEMO_TOP_PRODUCTS : (projectTypes || []);

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
        
        {/* 1. Gráfico de Evolução - PRIMEIRO ELEMENTO */}
        <GraficoEvolucao
          isOwner={isAdminOrOwner}
          currentProjects={displayMetrics.projects}
          currentPipelineValue={isAdminOrOwner ? adminTotalRevenue : displayMetrics.totalPipelineValue}
          userCreatedAt={realMetrics.userCreatedAt}
          metricsHistory={metricsHistory}
        />

        {/* 2. Cards Financeiros Principais */}
        <PremiumFrame title="Dashboard — Modo Simples" className="fade-in mt-6" style={{ animationDelay: '0.1s' }}>
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
          {!isAdminOrOwner && (
            <p className="text-xs text-muted-foreground/60 mt-4 text-center">
              Seus números crescem conforme você cria propostas e fecha projetos.
            </p>
          )}
        </PremiumFrame>

        {/* 3. Top 5 Produtos/Projetos mais vendidos */}
        <PremiumFrame title="Top 5 Produtos / Projetos" className="fade-in mt-6" style={{ animationDelay: '0.2s' }}>
          {topProducts && topProducts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {topProducts.map((product, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <Trophy className={`h-4 w-4 ${product.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className={`text-lg font-bold ${product.color}`}>{product.count}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm">Nenhum projeto criado ainda</p>
              <p className="text-xs mt-1 text-muted-foreground/70">Comece criando seu primeiro app ou site</p>
            </div>
          )}
        </PremiumFrame>

        {/* 4. Ações Rápidas */}
        <PremiumFrame title="Ações Rápidas" className="fade-in mt-6" style={{ animationDelay: '0.3s' }}>
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

        {/* 5. Link para histórico */}
        <div className="flex justify-center mt-4">
          <Link 
            to="/historico" 
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Ver histórico completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
