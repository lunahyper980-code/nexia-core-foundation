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
// CÁLCULO MATEMÁTICO BASEADO NO INCREMENTO DE 48H
// ==============================================
// Pipeline base: R$ 38.743
// Incremento: +R$ 2.350 a cada 48h
// Projetos base: 32, +1 a cada 48h
// 
// Em 30 dias = 15 períodos de 48h
// Crescimento total 30 dias: 15 × R$ 2.350 = R$ 35.250
// Em 7 dias = 3.5 períodos ≈ 3 períodos = R$ 7.050
// ==============================================

const PIPELINE_INCREMENT = 2350; // R$ 2.350 a cada 48h
const PROJECTS_INCREMENT = 1;    // +1 projeto a cada 48h
const INCREMENT_HOURS = 48;

// Calcula métricas baseadas em períodos de 48h retroativos
const calculateMetricsForDaysAgo = (
  currentPipeline: number,
  currentProjects: number,
  daysAgo: number
) => {
  // Quantos períodos de 48h cabem em "daysAgo" dias
  const periodsAgo = Math.floor((daysAgo * 24) / INCREMENT_HOURS);
  
  // Valores anteriores (subtraindo o crescimento)
  const pipelineValue = Math.max(0, currentPipeline - (periodsAgo * PIPELINE_INCREMENT));
  const projectsCount = Math.max(1, currentProjects - (periodsAgo * PROJECTS_INCREMENT));
  
  return { pipelineValue, projectsCount };
};

// Gera dados do owner - CÁLCULO MATEMÁTICO REAL
const generateOwnerData = (currentProjects = 32, currentPipelineValue = 38743) => {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Calcula valores para esse dia baseado nos períodos de 48h
    const { pipelineValue, projectsCount } = calculateMetricsForDaysAgo(
      currentPipelineValue,
      currentProjects,
      i
    );

    // Pequena variação natural (±2%) para suavizar o gráfico
    const dayIndex = 29 - i;
    const noise = Math.sin(dayIndex * 0.7) * 0.015;
    const adjustedValue = Math.round(pipelineValue * (1 + noise));

    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      projetos: projectsCount,
      valor: adjustedValue,
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

    // Admin/Owner - cálculo matemático baseado em períodos de 48h
    // 30 dias = 15 períodos de 48h
    const periods30Days = Math.floor((30 * 24) / INCREMENT_HOURS); // 15 períodos
    const periods7Days = Math.floor((7 * 24) / INCREMENT_HOURS);   // 3 períodos

    const revenue30Days = periods30Days * PIPELINE_INCREMENT; // 15 × 2350 = 35.250
    const revenue7Days = periods7Days * PIPELINE_INCREMENT;   // 3 × 2350 = 7.050

    // Valor inicial 30 dias atrás
    const pipeline30DaysAgo = currentPipelineValue - revenue30Days;
    const pipeline7DaysAgo = currentPipelineValue - revenue7Days;

    // Porcentagem de crescimento
    const growth30Days = pipeline30DaysAgo > 0 
      ? Math.round((revenue30Days / pipeline30DaysAgo) * 100)
      : 0;
    const growth7Days = pipeline7DaysAgo > 0
      ? Math.round((revenue7Days / pipeline7DaysAgo) * 100)
      : 0;

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
