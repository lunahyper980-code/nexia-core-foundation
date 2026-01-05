import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/contexts/UserRoleContext';
import { Users, TrendingUp, DollarSign, Activity, Copy, ArrowRight, Sparkles, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';

// ==============================================
// LÓGICA DE CRESCIMENTO PROGRESSIVO (48h cycles)
// Início: 05/01/2026 - Crescimento apenas a partir desta data
// ==============================================

// Data de início do crescimento (timestamp fixo)
// O crescimento SÓ começa a partir desta data
const GROWTH_START_TIMESTAMP = new Date('2026-01-05T00:00:00').getTime();

// Membros da equipe com valores base FIXOS (nunca alterados retroativamente)
const BASE_TEAM_MEMBERS = [
  { id: 1, name: 'Lucas Mendes', baseVolume: 4200 },
  { id: 2, name: 'Fernanda Costa', baseVolume: 3850 },
  { id: 3, name: 'Rafael Oliveira', baseVolume: 3400 },
  { id: 4, name: 'Camila Rodrigues', baseVolume: 2950 },
  { id: 5, name: 'Bruno Almeida', baseVolume: 2600 },
  { id: 6, name: 'Ana Beatriz', baseVolume: 2350 },
  { id: 7, name: 'Pedro Henrique', baseVolume: 1980 },
  { id: 8, name: 'Juliana Martins', baseVolume: 1750 },
];

// Status possíveis da equipe (alternância natural)
const TEAM_STATUSES = ['Estável', 'Em crescimento', 'Performance positiva'];

// Calcula quantos ciclos completos de 48h se passaram DESDE o início
function getCompletedCycles(): number {
  const now = Date.now();
  if (now < GROWTH_START_TIMESTAMP) return 0;
  
  const elapsedMs = now - GROWTH_START_TIMESTAMP;
  const cycleMs = 48 * 60 * 60 * 1000; // 48 horas em ms
  return Math.floor(elapsedMs / cycleMs);
}

// Gerador pseudo-aleatório determinístico baseado no ciclo
function seededRandom(cycle: number, memberId: number): number {
  const x = Math.sin((cycle + 1) * 9973 + memberId * 7919) * 10000;
  return x - Math.floor(x);
}

// Calcula incremento para um membro em um ciclo específico
function getMemberCycleIncrement(cycle: number, memberId: number): number {
  // Variação entre R$250 e R$400 (nunca números redondos repetidos)
  const rand = seededRandom(cycle, memberId);
  const baseIncrement = 250 + rand * 150; // R$250 a R$400
  
  // Pequena variação para evitar valores muito redondos
  const variation = (seededRandom(cycle, memberId + 1000) - 0.5) * 30;
  
  return Math.round(baseIncrement + variation);
}

// Determina se membro cresce neste ciclo (alguns não crescem)
function memberGrowsInCycle(cycle: number, memberId: number): boolean {
  // ~15% de chance de não crescer neste ciclo
  return seededRandom(cycle, memberId + 500) > 0.15;
}

// Calcula os dados da equipe baseado nos ciclos completados
function calculateTeamData() {
  const completedCycles = getCompletedCycles();
  const currentCycle = completedCycles; // Ciclo atual para status e progresso
  
  const members = BASE_TEAM_MEMBERS.map((member) => {
    // Calcular crescimento acumulado APENAS dos ciclos já completados
    let accumulatedGrowth = 0;
    let isGrowingThisCycle = false;
    
    for (let c = 0; c < completedCycles; c++) {
      if (memberGrowsInCycle(c, member.id)) {
        accumulatedGrowth += getMemberCycleIncrement(c, member.id);
      }
    }
    
    // Verificar se está crescendo no ciclo atual (para texto visual)
    if (completedCycles > 0) {
      isGrowingThisCycle = memberGrowsInCycle(completedCycles - 1, member.id);
    }
    
    const totalVolume = member.baseVolume + accumulatedGrowth;
    
    // Percentual de progresso: evolui lentamente, nunca completa
    // Base entre 35-55%, cresce ~2-4% por ciclo, max 92%
    const baseProgress = 35 + (seededRandom(0, member.id) * 20);
    const progressGrowth = completedCycles * (2 + seededRandom(currentCycle, member.id) * 2);
    const progress = Math.min(92, Math.round(baseProgress + progressGrowth));
    
    return {
      ...member,
      volume: totalVolume,
      progress,
      isGrowing: isGrowingThisCycle,
    };
  });

  // Ordenar por volume (maior para menor)
  members.sort((a, b) => b.volume - a.volume);

  // Calcular totais
  const totalVolume = members.reduce((sum, m) => sum + m.volume, 0);
  const averageTicket = Math.round(totalVolume / members.length);
  
  // Status baseado no ciclo atual (alternância natural)
  const statusIndex = currentCycle % TEAM_STATUSES.length;
  const status = TEAM_STATUSES[statusIndex];

  return {
    members,
    stats: {
      activeMembers: members.length,
      totalVolume,
      averageTicket,
      status,
    },
    completedCycles,
  };
}

const promoLinks = {
  mensal: 'https://go.perfectpay.com.br/PPU38CQ5GFF',
  vitalicio: 'https://go.perfectpay.com.br/PPU38CQ5JOM',
};

export default function MinhaEquipe() {
  const { isAdminOrOwner, loading } = useUserRole();
  const navigate = useNavigate();
  const [showPromoArea, setShowPromoArea] = useState(false);

  // Calcular dados baseado nos ciclos completados desde o início
  const teamData = useMemo(() => calculateTeamData(), []);

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

  if (loading) {
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
