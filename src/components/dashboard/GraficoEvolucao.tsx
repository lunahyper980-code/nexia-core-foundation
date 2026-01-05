import { useMemo } from 'react';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Zap } from 'lucide-react';

interface MetricsHistoryEntry {
  date: string;
  projects_count: number;
  pipeline_value: number;
}

interface GraficoEvolucaoProps {
  isOwner?: boolean;
  currentProjects?: number;
  currentPipelineValue?: number;
  userCreatedAt?: string | null;
  metricsHistory?: MetricsHistoryEntry[];
}

// ==============================================
// OWNER (ADMIN): cresce somente quando o pipeline cresce
// ==============================================
// A ideia aqui é:
// - manter o visual/linha do gráfico como estava (progressivo e crível)
// - manter os números de 30d/7d nos mesmos patamares “de antes”
// - e, quando o pipeline subir (a cada 48h), esses números sobem junto, proporcionalmente
//
// Base histórica (no momento em que calibramos os valores "de antes"):
// - Pipeline: 38.743
// - Últimos 30 dias: R$ 9.686 (+33%)
// - Últimos 7 dias: R$ 2.900 (+8%)
// ==============================================

const OWNER_BASE_PIPELINE = 38743;
const OWNER_START_RATIO_30_DAYS = 0.75; // 30d atrás ~75% do atual (como era antes)
const OWNER_REVENUE_30_RATIO = 9686 / OWNER_BASE_PIPELINE;
const OWNER_REVENUE_7_RATIO = 2900 / OWNER_BASE_PIPELINE;

// Gera dados do owner - COMEÇA DE BAIXO E CRESCE PROGRESSIVAMENTE (como era antes)
const generateOwnerData = (currentProjects = 32, currentPipelineValue = 38743) => {
  const data = [];
  const today = new Date();

  // Começa mais baixo e cresce até o valor atual
  const startValue = currentPipelineValue * OWNER_START_RATIO_30_DAYS;
  const endValue = currentPipelineValue;
  const totalGrowth = endValue - startValue;

  // Projetos: começa com menos da metade e cresce
  const startProjects = Math.max(8, Math.floor(currentProjects * 0.5));
  const projectGrowth = currentProjects - startProjects;

  // Seed para variação natural
  const seed = 42;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Dia 0 = primeiro dia (29 dias atrás), Dia 29 = hoje
    const dayIndex = 29 - i;
    const progress = dayIndex / 29;

    // Curva que começa mais devagar e acelera
    const baseProgress = Math.pow(progress, 1.3);

    // Variações diárias naturais (pequenas oscilações)
    const noise = Math.sin(dayIndex * 0.9 + seed) * 0.025;
    const weekendEffect = (dayIndex % 7 === 0 || dayIndex % 7 === 6) ? -0.015 : 0.01;

    const finalProgress = Math.min(1, Math.max(0, baseProgress + noise + weekendEffect));

    const dayValue = startValue + (totalGrowth * finalProgress);
    const dayProjects = Math.round(startProjects + (projectGrowth * baseProgress));

    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      projetos: Math.max(startProjects, dayProjects),
      valor: Math.round(dayValue),
    });
  }

  return data;
};

// Gera dados REAIS baseados no histórico de métricas
const generateRealUserData = (
  currentProjects = 0, 
  currentPipelineValue = 0, 
  userCreatedAt?: string | null,
  metricsHistory?: MetricsHistoryEntry[]
) => {
  const data = [];
  const today = new Date();
  const signupDate = userCreatedAt ? new Date(userCreatedAt) : today;
  
  const daysSinceSignup = Math.floor(
    (today.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const daysToShow = Math.min(30, Math.max(1, daysSinceSignup + 1));
  
  const historyMap = new Map<string, MetricsHistoryEntry>();
  if (metricsHistory) {
    metricsHistory.forEach(entry => {
      historyMap.set(entry.date, entry);
    });
  }
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const isToday = i === 0;
    
    const historyEntry = historyMap.get(dateKey);
    
    let projetos = 0;
    let valor = 0;
    
    if (isToday) {
      projetos = currentProjects;
      valor = currentPipelineValue;
    } else if (historyEntry) {
      projetos = historyEntry.projects_count;
      valor = Number(historyEntry.pipeline_value) || 0;
    }
    
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      projetos,
      valor,
    });
  }
  
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-primary">
          {payload[0].value} projetos
        </p>
        <p className="text-sm font-semibold text-success">
          R$ {(payload[1]?.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
      </div>
    );
  }
  return null;
};

export function GraficoEvolucao({
  isOwner = false,
  currentProjects = 0,
  currentPipelineValue = 0,
  userCreatedAt,
  metricsHistory,
}: GraficoEvolucaoProps) {
  const data = useMemo(() => {
    return isOwner
      ? generateOwnerData(currentProjects, currentPipelineValue)
      : generateRealUserData(currentProjects, currentPipelineValue, userCreatedAt, metricsHistory);
  }, [isOwner, currentProjects, currentPipelineValue, userCreatedAt, metricsHistory]);

  // Cálculos matemáticos para métricas de crescimento
  const growthMetrics = useMemo(() => {
    if (!isOwner) {
      // Usuário real - calcula baseado nos dados
      const firstValue = data[0];
      const lastValue = data[data.length - 1];
      const last7DaysData = data.slice(-7);
      const first7DaysValue = last7DaysData[0]?.valor || 0;
      const last7DaysValue = last7DaysData[last7DaysData.length - 1]?.valor || 0;

      const growth30 = firstValue?.valor > 0 
        ? ((lastValue.valor - firstValue.valor) / firstValue.valor * 100).toFixed(0)
        : '0';
      const growth7 = first7DaysValue > 0
        ? ((last7DaysValue - first7DaysValue) / first7DaysValue * 100).toFixed(0)
        : '0';
      
      return {
        revenue30Days: Math.max(0, lastValue.valor - firstValue.valor),
        revenue7Days: Math.max(0, last7DaysValue - first7DaysValue),
        growth30Days: growth30,
        growth7Days: growth7,
      };
    }

    // Admin/Owner - mantém os mesmos patamares de antes, ajustando proporcionalmente
    // quando o pipeline (que só muda a cada 48h) muda.
    const revenue30Days = Math.round(currentPipelineValue * OWNER_REVENUE_30_RATIO);
    const revenue7Days = Math.round(currentPipelineValue * OWNER_REVENUE_7_RATIO);

    const pipeline30DaysAgo = Math.max(1, currentPipelineValue - revenue30Days);
    const pipeline7DaysAgo = Math.max(1, currentPipelineValue - revenue7Days);

    const growth30Days = Math.round((revenue30Days / pipeline30DaysAgo) * 100);
    const growth7Days = Math.round((revenue7Days / pipeline7DaysAgo) * 100);

    return {
      revenue30Days,
      revenue7Days,
      growth30Days: growth30Days.toString(),
      growth7Days: growth7Days.toString(),
    };
  }, [isOwner, data, currentPipelineValue]);

  return (
    <PremiumFrame title="📈 Evolução dos Projetos — Últimos 30 dias" className="fade-in" style={{ animationDelay: '0.25s' }}>
      {/* Métricas - SEM Pipeline Atual */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Faturamento 30 dias */}
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-3.5 w-3.5 text-success" />
            <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
          </div>
          <p className="text-lg font-bold text-success">
            R$ {growthMetrics.revenue30Days.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-success/80">+{growthMetrics.growth30Days}% crescimento</p>
        </div>
        
        {/* Faturamento 7 dias */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Últimos 7 dias</span>
          </div>
          <p className="text-lg font-bold text-primary">
            R$ {growthMetrics.revenue7Days.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-primary/80">+{growthMetrics.growth7Days}% crescimento</p>
        </div>
        
        {/* Crescimento período */}
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Crescimento total</span>
          </div>
          <p className="text-lg font-bold text-emerald-500">+{growthMetrics.growth30Days}%</p>
          <p className="text-xs text-emerald-500/80">no período</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorProjetos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              domain={['dataMin * 0.9', 'dataMax * 1.05']}
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="projetos"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorProjetos)"
              yAxisId="left"
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fill="url(#colorValor)"
              yAxisId="right"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Projetos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Valor (R$)</span>
        </div>
      </div>
    </PremiumFrame>
  );
}
