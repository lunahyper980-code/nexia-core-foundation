import { useMemo } from 'react';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

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

const OWNER_BASE_PIPELINE_VALUE = 28643.57;
const OWNER_GROWTH_PERCENT = 23;

// Gera dados do owner com curva de crescimento fictícia (apenas para demonstração)
const generateOwnerData = (currentProjects = 0, currentPipelineValue = OWNER_BASE_PIPELINE_VALUE) => {
  const data = [];
  const today = new Date();

  const startValue = currentPipelineValue / (1 + OWNER_GROWTH_PERCENT / 100);
  const totalGrowth = currentPipelineValue - startValue;
  const startProjects = Math.max(1, Math.floor(currentProjects * 0.6));
  const projectGrowth = currentProjects - startProjects;
  const seed = Math.floor(currentPipelineValue) % 1000;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const progress = (29 - i) / 29;
    const smoothProgress = Math.pow(progress, 1.3);
    const dayVariation = Math.sin((i + seed) * 0.5) * 0.08;
    const adjustedProgress = Math.max(0, Math.min(1, smoothProgress + dayVariation));
    const dayValue = startValue + (totalGrowth * adjustedProgress);
    const dayProjects = Math.round(startProjects + (projectGrowth * smoothProgress));

    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      projetos: Math.max(1, dayProjects),
      valor: Math.round(dayValue * 100) / 100,
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
  
  // Calcula quantos dias se passaram desde o cadastro
  const daysSinceSignup = Math.floor(
    (today.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Mostra apenas os dias desde o cadastro (máximo 30 dias)
  const daysToShow = Math.min(30, Math.max(1, daysSinceSignup + 1));
  
  // Cria um mapa de datas para valores históricos
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
    
    // Busca valor histórico ou usa o atual para hoje
    const historyEntry = historyMap.get(dateKey);
    
    let projetos = 0;
    let valor = 0;
    
    if (isToday) {
      // Hoje sempre usa valores atuais
      projetos = currentProjects;
      valor = currentPipelineValue;
    } else if (historyEntry) {
      // Usa dados históricos se disponíveis
      projetos = historyEntry.projects_count;
      valor = Number(historyEntry.pipeline_value) || 0;
    }
    // Se não tem histórico e não é hoje, mantém 0
    
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
          R$ {(payload[1]?.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
    // Owner vê dados fictícios para demonstração
    // Usuários normais veem dados reais baseados no histórico
    return isOwner
      ? generateOwnerData(currentProjects, currentPipelineValue)
      : generateRealUserData(currentProjects, currentPipelineValue, userCreatedAt, metricsHistory);
  }, [isOwner, currentProjects, currentPipelineValue, userCreatedAt, metricsHistory]);

  const lastValue = data[data.length - 1];
  const firstValue = data[0];
  
  // Calcula crescimento real baseado no primeiro valor não-zero
  const calculateGrowth = () => {
    if (isOwner) return OWNER_GROWTH_PERCENT.toString();
    
    // Encontra o primeiro valor diferente de zero para calcular crescimento real
    const firstNonZero = data.find(d => d.valor > 0);
    
    if (!firstNonZero || firstNonZero.valor === 0 || firstNonZero === lastValue) {
      return '0';
    }
    
    const growth = ((lastValue.valor - firstNonZero.valor) / firstNonZero.valor * 100);
    return growth.toFixed(0);
  };
  
  const growthPercent = calculateGrowth();

  return (
    <PremiumFrame title="📈 Evolução dos Projetos — Últimos 30 dias" className="fade-in" style={{ animationDelay: '0.25s' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-success/10">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Crescimento no período</span>
            <p className="text-lg font-bold text-success">+{growthPercent}%</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Valor atual</span>
          <p className="text-lg font-bold text-foreground">
            R$ {lastValue.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

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
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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