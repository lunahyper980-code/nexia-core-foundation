import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { useClients } from '@/hooks/useClients';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useOwnerMetrics } from '@/hooks/useOwnerMetrics';
import { useRealMetrics } from '@/hooks/useRealMetrics';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useUserMode } from '@/contexts/UserModeContext';
import { Layers, Users, ShoppingCart, Package, ArrowRight, Rocket, Globe, Smartphone, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NexiaLoader } from '@/components/ui/nexia-loader';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusOperacao } from '@/components/dashboard/StatusOperacao';
import { AtividadeComunidade } from '@/components/dashboard/AtividadeComunidade';
import { GraficoEvolucao } from '@/components/dashboard/GraficoEvolucao';
import DashboardSimples from './DashboardSimples';

const MOCK_RECENT_SALES = [
  { client: 'Dra. Camila Ferreira', type: 'Site Institucional', value: 1850, date: 'Hoje', icon: <Globe className="h-4 w-4 text-primary" /> },
  { client: 'Barbearia Classic', type: 'Aplicativo Mobile', value: 3200, date: 'Hoje', icon: <Smartphone className="h-4 w-4 text-accent" /> },
  { client: 'Auto Center Silva', type: 'Sistema Web', value: 4500, date: 'Ontem', icon: <Monitor className="h-4 w-4 text-success" /> },
  { client: 'Restaurante Sabor & Arte', type: 'Site + Cardápio Digital', value: 2750, date: 'Ontem', icon: <Globe className="h-4 w-4 text-primary" /> },
  { client: 'Studio Bella Hair', type: 'Aplicativo de Agendamento', value: 3800, date: '27/02', icon: <Smartphone className="h-4 w-4 text-accent" /> },
  { client: 'Construtora Horizonte', type: 'Site Institucional', value: 2100, date: '27/02', icon: <Globe className="h-4 w-4 text-primary" /> },
  { client: 'Pet Shop Amigão', type: 'Sistema de Gestão', value: 4200, date: '26/02', icon: <Monitor className="h-4 w-4 text-success" /> },
  { client: 'Clínica Odonto Plus', type: 'Site + Landing Page', value: 1650, date: '26/02', icon: <Globe className="h-4 w-4 text-primary" /> },
  { client: 'Imobiliária Central', type: 'Aplicativo Mobile', value: 3950, date: '25/02', icon: <Smartphone className="h-4 w-4 text-accent" /> },
  { client: 'Padaria Dona Maria', type: 'Site com Delivery', value: 2380, date: '25/02', icon: <Globe className="h-4 w-4 text-primary" /> },
  { client: 'Academia FitMax', type: 'Sistema de Gestão', value: 4100, date: '24/02', icon: <Monitor className="h-4 w-4 text-success" /> },
  { client: 'Loja Moda & Estilo', type: 'E-commerce', value: 3450, date: '24/02', icon: <Globe className="h-4 w-4 text-primary" /> },
  { client: 'Escola ABC Kids', type: 'Aplicativo Escolar', value: 3700, date: '23/02', icon: <Smartphone className="h-4 w-4 text-accent" /> },
  { client: 'Escritório JL Advocacia', type: 'Site Institucional', value: 1490, date: '23/02', icon: <Globe className="h-4 w-4 text-primary" /> },
  { client: 'Cafeteria Aroma', type: 'Site + Cardápio', value: 980, date: '22/02', icon: <Globe className="h-4 w-4 text-primary" /> },
  { client: 'Mecânica Express', type: 'Sistema de Ordens', value: 2900, date: '22/02', icon: <Monitor className="h-4 w-4 text-success" /> },
  { client: 'Nail Designer Lú', type: 'Landing Page', value: 750, date: '21/02', icon: <Globe className="h-4 w-4 text-primary" /> },
  { client: 'Corretor Paulo Mendes', type: 'Site Imobiliário', value: 2650, date: '21/02', icon: <Globe className="h-4 w-4 text-primary" /> },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'client_created':
      return <Users className="h-4 w-4 text-success" />;
    case 'client_updated':
      return <Users className="h-4 w-4 text-warning" />;
    case 'client_deleted':
      return <Users className="h-4 w-4 text-destructive" />;
    case 'identity_updated':
      return <Package className="h-4 w-4 text-primary" />;
    default:
      return <Layers className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function Dashboard() {
  const { mode } = useUserMode();
  
  // If user is in simple mode, render the simple dashboard
  if (mode === 'simple') {
    return <DashboardSimples />;
  }

  return <DashboardAdvanced />;
}

function DashboardAdvanced() {
  const { clients } = useClients();
  const { logs } = useActivityLogs();
  const { isOwner, metrics: ownerMetrics } = useOwnerMetrics();
  const { metrics: realMetrics, metricsHistory } = useRealMetrics();
  const { isAdminOrOwner, loading: roleLoading } = useUserRole();

  // Loading state
  if (roleLoading) {
    return (
      <AppLayout title="Carregando...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <NexiaLoader size="lg" />
        </div>
      </AppLayout>
    );
  }

  // Para admin/owner, usar métricas fictícias; para usuários normais, usar métricas reais
  const displayMetrics = isAdminOrOwner ? ownerMetrics : realMetrics;
  const isUsingRealMetrics = !isAdminOrOwner;

  const stats = [
    {
      title: 'Propostas Criadas',
      value: displayMetrics.proposals.toString(),
      description: 'Total de propostas',
      icon: ShoppingCart,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Contratos Gerados',
      value: displayMetrics.contracts.toString(),
      description: 'Documentos criados',
      icon: Layers,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Valor em Propostas',
      value: `R$ ${displayMetrics.totalPipelineValue.toLocaleString('pt-BR')}`,
      description: 'Propostas ganhas',
      icon: Package,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Valor Médio',
      value: `R$ ${displayMetrics.averageTicket.toLocaleString('pt-BR')}`,
      description: 'Por projeto',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <AppLayout title="Sua central de soluções digitais">
      <div className="content-premium space-premium">
        
        {/* Stats Grid */}
        <PremiumFrame title="Dashboard — Nexia Suite" className="fade-in">
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
          {isUsingRealMetrics && (
            <p className="text-xs text-muted-foreground/60 mt-4 text-center">
              Seus números sobem conforme você cria propostas e fecha projetos.
            </p>
          )}
        </PremiumFrame>

        {/* Status da Operação + Atividade Comunidade */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <StatusOperacao 
            initialProjectsCount={displayMetrics.projects} 
            initialProposalsCount={displayMetrics.proposals}
            initialPipelineValue={displayMetrics.totalPipelineValue}
            initialAverageTicket={displayMetrics.averageTicket}
            isOwner={isAdminOrOwner}
          />
          <AtividadeComunidade />
        </div>

        <div className="mt-6">
          <GraficoEvolucao
            isOwner={isAdminOrOwner}
            currentProjects={displayMetrics.projects}
            currentPipelineValue={displayMetrics.totalPipelineValue}
            userCreatedAt={realMetrics.userCreatedAt}
            metricsHistory={metricsHistory}
          />
        </div>

        {/* Two Column Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          {/* Recent Activity */}
          <PremiumFrame title="Atividade Recente — Nexia Suite" className="fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-foreground">Histórico</span>
              <Link to="/historico" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver tudo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Nenhuma atividade recente</p>
                <p className="text-xs mt-2 text-muted-foreground/70">Comece adicionando clientes ou atualizando sua identidade</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
                      {getActivityIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{log.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(log.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PremiumFrame>

          {/* Quick Actions */}
          <PremiumFrame title="Ações Rápidas — Nexia Suite" className="fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <Link
                to="/clientes"
                className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 hover:border-primary/20 group"
              >
                <div className="p-2.5 rounded-lg bg-success/10 group-hover:bg-success/15 transition-colors">
                  <Users className="h-5 w-5 text-success icon-glow-subtle" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Novo Cliente</p>
                  <p className="text-xs text-muted-foreground">Cadastrar cliente</p>
                </div>
              </Link>
              <Link
                to="/solucoes"
                className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 hover:border-primary/20 group"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Layers className="h-5 w-5 text-primary icon-glow-subtle" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Nova Solução</p>
                  <p className="text-xs text-muted-foreground">Criar projeto digital</p>
                </div>
              </Link>
              <Link
                to="/vendas"
                className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 hover:border-primary/20 group"
              >
                <div className="p-2.5 rounded-lg bg-warning/10 group-hover:bg-warning/15 transition-colors">
                  <ShoppingCart className="h-5 w-5 text-warning icon-glow-subtle" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Gerar Proposta</p>
                  <p className="text-xs text-muted-foreground">Criar proposta comercial</p>
                </div>
              </Link>
              <Link
                to="/identidade"
                className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10 hover:border-primary/20 group"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <Package className="h-5 w-5 text-primary icon-glow-subtle" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Minha Identidade</p>
                  <p className="text-xs text-muted-foreground">Configurar operação</p>
                </div>
              </Link>
            </div>
          </PremiumFrame>
        </div>

        {/* Últimos Projetos Vendidos — Admin only */}
        {isAdminOrOwner && (
          <div className="mt-6">
            <PremiumFrame title="Projetos Recentes — Pipeline" className="fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Últimos Projetos Fechados</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">Tempo real</Badge>
              </div>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {MOCK_RECENT_SALES.map((sale, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/8 transition-colors">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      {sale.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{sale.client}</p>
                      <p className="text-xs text-muted-foreground">{sale.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-success">R$ {sale.value.toLocaleString('pt-BR')}</p>
                      <p className="text-[10px] text-muted-foreground/60">{sale.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumFrame>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
