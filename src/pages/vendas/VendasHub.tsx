import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileSignature, MessageCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NextStepCard } from '@/components/academy/NextStepCard';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useOwnerMetrics } from '@/hooks/useOwnerMetrics';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const vendaTools = [
  {
    id: 'propostas',
    title: 'Propostas',
    description: 'Gerar propostas comerciais profissionais',
    icon: FileText,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    path: '/vendas/propostas',
    buttonText: 'Ver propostas',
  },
  {
    id: 'contratos',
    title: 'Contratos',
    description: 'Gerar contratos simples de prestação de serviço',
    icon: FileSignature,
    color: 'text-success',
    bgColor: 'bg-success/10',
    path: '/vendas/contratos',
    buttonText: 'Ver contratos',
  },
  {
    id: 'whatsapp',
    title: 'Mensagens WhatsApp',
    description: 'Mensagens prontas para abordagem comercial',
    icon: MessageCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    path: '/vendas/whatsapp',
    buttonText: 'Criar mensagem',
  },
];

export default function VendasHub() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { isOwner, metrics, getMetricValue } = useOwnerMetrics();

  const { data: stats } = useQuery({
    queryKey: ['vendas-stats', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return { proposals: 0, contracts: 0, totalValue: 0 };

      const [proposalsRes, contractsRes] = await Promise.all([
        supabase
          .from('proposals')
          .select('id, total_value')
          .eq('workspace_id', workspace.id),
        supabase
          .from('contracts')
          .select('id')
          .eq('workspace_id', workspace.id),
      ]);

      const proposals = proposalsRes.data || [];
      const contracts = contractsRes.data || [];
      const totalValue = proposals.reduce((sum, p) => sum + (Number(p.total_value) || 0), 0);

      return {
        proposals: proposals.length,
        contracts: contracts.length,
        totalValue,
      };
    },
    enabled: !!workspace?.id,
  });

  return (
    <AppLayout title="Vendas">
      <div className="content-premium space-premium">
        {/* Next Step Card */}
        <NextStepCard 
          message="Salvar cliente e organizar projetos após a venda."
          buttonText="Ir para Dashboard"
          path="/dashboard"
        />

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Ferramentas de Venda</h2>
          <p className="text-muted-foreground">
            Propostas, contratos e mensagens para fechar negócios com profissionalismo.
          </p>
        </div>

        {/* Tools Grid */}
        <PremiumFrame title="Ferramentas — Nexia Suite" className="fade-in mb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendaTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div 
                  key={tool.id} 
                  className="group p-5 rounded-xl border border-primary/15 hover:border-primary/30 bg-gradient-to-br from-primary/[0.03] to-transparent transition-all cursor-pointer"
                  onClick={() => navigate(tool.path)}
                >
                  <div className={`w-14 h-14 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-primary/10`}>
                    <Icon className={`h-7 w-7 ${tool.color} icon-glow-subtle`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                  <Button variant="outline" className="w-full group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                    {tool.buttonText}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              );
            })}
          </div>
        </PremiumFrame>

        {/* Stats */}
        <PremiumFrame title="Resumo — Nexia Suite" className="fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary icon-glow-subtle" />
            <h3 className="text-lg font-semibold text-foreground">Resumo de Vendas</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="metric-card-premium p-5">
              <p className="text-2xl font-bold text-foreground">{getMetricValue(metrics.proposals, stats?.proposals || 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">Propostas criadas</p>
            </div>
            <div className="metric-card-premium p-5">
              <p className="text-2xl font-bold text-foreground">{getMetricValue(metrics.contracts, stats?.contracts || 0)}</p>
              <p className="text-sm text-muted-foreground mt-1">Contratos gerados</p>
            </div>
            <div className="metric-card-premium p-5">
              <p className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(getMetricValue(metrics.totalProposalValue, stats?.totalValue || 0))}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Valor total em propostas</p>
            </div>
          </div>
        </PremiumFrame>
      </div>
    </AppLayout>
  );
}
