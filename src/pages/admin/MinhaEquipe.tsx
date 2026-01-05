import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useTeamMetrics } from '@/hooks/useTeamMetrics';
import { Users, TrendingUp, DollarSign, Activity, Copy, ArrowRight, Sparkles, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';

const promoLinks = {
  mensal: 'https://go.perfectpay.com.br/PPU38CQ5GFF',
  vitalicio: 'https://go.perfectpay.com.br/PPU38CQ5JOM',
};

export default function MinhaEquipe() {
  const { isAdminOrOwner, loading: roleLoading } = useUserRole();
  const { teamData, loading: metricsLoading } = useTeamMetrics();
  const navigate = useNavigate();
  const [showPromoArea, setShowPromoArea] = useState(false);
  
  const loading = roleLoading || metricsLoading;

  useEffect(() => {
    if (!loading && !isAdminOrOwner) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAdminOrOwner, loading, navigate]);

  const copyLink = (type: 'mensal' | 'vitalicio') => {
    navigator.clipboard.writeText(promoLinks[type]);
    toast.success(`Link do plano ${type === 'mensal' ? 'mensal' : 'vitalício'} copiado!`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading || !teamData) {
    return (
      <AppLayout title="Minha Equipe">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdminOrOwner) {
    return null;
  }

  if (showPromoArea) {
    return (
      <AppLayout title="Acesso Promocional">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setShowPromoArea(false)}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            ← Voltar para Minha Equipe
          </Button>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Benefício Exclusivo
            </div>
            <h1 className="text-3xl font-bold text-foreground">Acesso Promocional da Equipe</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Benefício exclusivo para membros vinculados à equipe. Incentivo estratégico para acelerar resultados.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Monthly Plan */}
            <Card className="relative overflow-hidden border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Plano Mensal</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold text-foreground">R$ 197</span>
                  <span className="text-muted-foreground text-sm">/ mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {[
                    'Acesso completo ao Nexia Suite',
                    'Todas as soluções digitais',
                    'Diagnóstico e planejamento com IA',
                    'Ideal para operação contínua',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => copyLink('mensal')} 
                  variant="outline" 
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar link do plano mensal
                </Button>
              </CardContent>
            </Card>

            {/* Lifetime Plan - Highlighted */}
            <Card className="relative overflow-hidden border-primary/40 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground text-xs">
                  Melhor custo-benefício
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Plano Vitalício</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold text-foreground">R$ 297</span>
                  <span className="text-muted-foreground text-sm">único</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {[
                    'Tudo do plano mensal',
                    'Acesso vitalício garantido',
                    'Melhor custo-benefício',
                    'Ideal para quem quer escalar',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => copyLink('vitalicio')} 
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar link do plano vitalício
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer Notice */}
          <p className="text-center text-xs text-muted-foreground pt-4">
            Esta área é administrativa e representa uma visão interna de performance da equipe.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Minha Equipe">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Minha Equipe</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dados atualizados automaticamente • Performance acumulada da equipe • Crescimento orgânico baseado em atividade
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowPromoArea(true)}
            className="shrink-0"
          >
            Acesso Promocional da Equipe
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Membros ativos</p>
                  <p className="text-2xl font-bold text-foreground">{teamData.stats.activeMembers}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Colaboradores na equipe</p>
                </div>
                <Users className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          {/* Volume Total - Highlighted */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Volume total gerado</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(teamData.stats.totalVolume)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Ticket médio</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(teamData.stats.averageTicket)}</p>
                </div>
                <TrendingUp className="h-7 w-7 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Status da equipe</p>
                  <p className="text-xl font-bold text-emerald-500">{teamData.stats.status}</p>
                </div>
                <div className="relative">
                  <Activity className="h-8 w-8 text-emerald-500/60" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Performance da Equipe
            </CardTitle>
            <CardDescription>
              Valores em evolução contínua • Membros vinculados e volume individual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamData.members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                        <span className="text-sm font-semibold text-primary">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-emerald-600">
                          {member.isGrowing ? 'Evoluindo esta semana' : 'Estável'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(member.volume)}</p>
                        <p className="text-[10px] text-muted-foreground">volume gerado</p>
                      </div>
                      <div className="text-right min-w-[45px]">
                        <p className="text-sm font-semibold text-emerald-600">{member.progress}%</p>
                      </div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${member.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Growth Block */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Expanda sua equipe e aumente o volume gerado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Membros com acesso promocional tendem a operar mais, vender mais e gerar maior volume dentro do Nexia Suite.
                </p>
              </div>
              <Button 
                onClick={() => setShowPromoArea(true)}
                className="shrink-0"
              >
                Gerar link promocional da equipe
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Context Notice */}
        <p className="text-center text-xs text-muted-foreground py-2">
          Esta área é administrativa e representa uma visão interna de performance da equipe • Dados atualizados automaticamente
        </p>
      </div>
    </AppLayout>
  );
}
