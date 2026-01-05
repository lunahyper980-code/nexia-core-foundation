import { Link, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { useClients } from '@/hooks/useClients';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useOwnerMetrics } from '@/hooks/useOwnerMetrics';
import { useRealMetrics } from '@/hooks/useRealMetrics';
import { useUserRole } from '@/contexts/UserRoleContext';
import { Layers, Users, ShoppingCart, Package, ArrowRight } from 'lucide-react';
import { NexiaLoader } from '@/components/ui/nexia-loader';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusOperacao } from '@/components/dashboard/StatusOperacao';
import { AtividadeComunidade } from '@/components/dashboard/AtividadeComunidade';
import { GraficoEvolucao } from '@/components/dashboard/GraficoEvolucao';

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
  const { clients } = useClients();
  const { logs } = useActivityLogs();
  const { isOwner, metrics: ownerMetrics, getMetricValue } = useOwnerMetrics();
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

  // Redireciona se não for admin/owner
  if (!isAdminOrOwner) {
    return <Navigate to="/solucoes" replace />;
  }

  // Para usuários normais, usar métricas reais; para owner, usar fictícias
  const displayMetrics = isOwner ? ownerMetrics : realMetrics;

  const stats = [
    {
      title: 'Propostas Criadas',
      value: (isOwner ? ownerMetrics.proposals : realMetrics.proposals).toString(),
      description: 'Total de propostas',
      icon: ShoppingCart,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Contratos Gerados',
      value: (isOwner ? ownerMetrics.contracts : realMetrics.contracts).toString(),
      description: 'Documentos criados',
      icon: Layers,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Valor em Propostas',
      value: `R$ ${(isOwner ? ownerMetrics.totalPipelineValue : realMetrics.totalPipelineValue).toLocaleString('pt-BR')}`,
      description: 'Propostas ganhas',
      icon: Package,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Valor Médio',
      value: `R$ ${(isOwner ? ownerMetrics.averageTicket : realMetrics.averageTicket).toLocaleString('pt-BR')}`,
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
        </PremiumFrame>

        {/* Status da Operação + Atividade Comunidade */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <StatusOperacao 
            initialProjectsCount={displayMetrics.projects} 
            initialProposalsCount={displayMetrics.proposals}
            initialPipelineValue={displayMetrics.totalPipelineValue}
            initialAverageTicket={displayMetrics.averageTicket}
            isOwner={isOwner}
          />
          <AtividadeComunidade />
        </div>

        <div className="mt-6">
          <GraficoEvolucao
            isOwner={isOwner}
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
      </div>
    </AppLayout>
  );
}
