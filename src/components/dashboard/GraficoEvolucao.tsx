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
// VALORES REALISTAS E COERENTES
// ==============================================
// Pipeline atual: R$ 38.743
// Valor inicial 30 dias atrás: R$ 29.057 (75% do atual)
// Crescimento 30 dias: +33% (~R$ 9.686)
// Últimos 7 dias: ~R$ 2.900
// Crescimento 7 dias: +8%
// ==============================================

const OWNER_GROWTH_30_DAYS = 33;
const OWNER_GROWTH_7_DAYS = 8;
const OWNER_REVENUE_30_DAYS = 9686;
const OWNER_REVENUE_7_DAYS = 2900;

// Gera dados do owner - COMEÇA DE BAIXO E CRESCE PROGRESSIVAMENTE
const generateOwnerData = (currentProjects = 32, currentPipelineValue = 38743) => {
  const data = [];
  const today = new Date();

  // IMPORTANTE: Valor inicial BAIXO - começa em ~56.000 (75% do atual)
  // Isso garante que o gráfico visualmente começa de baixo
  const startValue = currentPipelineValue * 0.75; // 75% do valor final = começa baixo
  const endValue = currentPipelineValue;
  const totalGrowth = endValue - startValue;
  
  // Projetos: começa com menos da metade e cresce
  const startProjects = Math.max(8, Math.floor(currentProjects * 0.5)); // 50% = começa bem baixo
  const projectGrowth = currentProjects - startProjects;
  
  // Seed para variação natural
  const seed = 42;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Dia 0 = primeiro dia (29 dias atrás), Dia 29 = hoje
    const dayIndex = 29 - i;
    const progress = dayIndex / 29; // 0 a 1
    
    // Curva que COMEÇA DEVAGAR e ACELERA - garantindo início baixo
    // Usando função quadrática para crescimento suave
    const baseProgress = Math.pow(progress, 1.3);
    
    // Variações diárias naturais (pequenas oscilações)
    const noise = Math.sin(dayIndex * 0.9 + seed) * 0.025;
    const weekendEffect = (dayIndex % 7 === 0 || dayIndex % 7 === 6) ? -0.015 : 0.01;
    
    // Progresso final com variações (nunca ultrapassa 1)
    const finalProgress = Math.min(1, Math.max(0, baseProgress + noise + weekendEffect));
    
    // Valores do dia
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

  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  
  // Calcula métricas dos últimos 7 dias
  const last7DaysData = data.slice(-7);
  const first7DaysValue = last7DaysData[0]?.valor || 0;
  const last7DaysValue = last7DaysData[last7DaysData.length - 1]?.valor || 0;
  
  // Crescimento 30 dias
  const calculate30DaysGrowth = () => {
    if (isOwner) return OWNER_GROWTH_30_DAYS.toString();
    
    if (firstValue.valor === 0 || firstValue === lastValue) {
      return '0';
    }
    
    const growth = ((lastValue.valor - firstValue.valor) / firstValue.valor * 100);
    return growth.toFixed(0);
  };
  
  // Crescimento 7 dias
  const calculate7DaysGrowth = () => {
    if (isOwner) return OWNER_GROWTH_7_DAYS.toString();
    
    if (first7DaysValue === 0 || first7DaysValue === last7DaysValue) {
      return '0';
    }
    
    const growth = ((last7DaysValue - first7DaysValue) / first7DaysValue * 100);
    return growth.toFixed(0);
  };
  
  const growth30Days = calculate30DaysGrowth();
  const growth7Days = calculate7DaysGrowth();
  
  // Faturamento dos períodos
  const revenue30Days = isOwner ? OWNER_REVENUE_30_DAYS : Math.max(0, lastValue.valor - firstValue.valor);
  const revenue7Days = isOwner ? OWNER_REVENUE_7_DAYS : Math.max(0, last7DaysValue - first7DaysValue);

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
            R$ {revenue30Days.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-success/80">+{growth30Days}% crescimento</p>
        </div>
        
        {/* Faturamento 7 dias */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Últimos 7 dias</span>
          </div>
          <p className="text-lg font-bold text-primary">
            R$ {revenue7Days.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-primary/80">+{growth7Days}% crescimento</p>
        </div>
        
        {/* Crescimento período */}
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Crescimento total</span>
          </div>
          <p className="text-lg font-bold text-emerald-500">+{growth30Days}%</p>
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
