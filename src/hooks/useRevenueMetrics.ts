import { useMemo } from 'react';
import { useContractsMetrics } from './useContractsMetrics';
import { useOwnerMetrics } from './useOwnerMetrics';
import { useUserRole } from '@/contexts/UserRoleContext';

export interface PeriodMetrics {
  periodRevenue: number;
  previousPeriodRevenue: number;
  growthPercentage: number | null;
  hasComparison: boolean;
  signedContractsInPeriod: number;
  recurrenceInPeriod: number;
}

export interface ChartDataPoint {
  date: string;
  fullDate: string;
  value: number;
  dateObj: Date;
}

/**
 * Hook para calcular métricas de faturamento
 * 
 * REGRA DE OURO:
 * - ADMIN/OWNER: Usa dados do owner_metrics (simulados, crescem a cada 48h) - NUNCA altera com contratos
 * - USUÁRIO COMUM: Usa APENAS contratos ASSINADOS reais - começa zerado
 */
export function useRevenueMetrics(period: 7 | 30) {
  const { contracts, metrics: contractMetrics, loading: contractsLoading } = useContractsMetrics();
  const { isOwner, metrics: ownerMetrics, loading: ownerLoading } = useOwnerMetrics();
  const { isAdminOrOwner } = useUserRole();

  // ============================================
  // LÓGICA SEPARADA: ADMIN vs USUÁRIO COMUM
  // ============================================

  // ADMIN: Usa owner_metrics (valor histórico próprio, NÃO depende de contratos)
  // USUÁRIO: Usa soma dos contratos ASSINADOS reais
  const totalRevenue = useMemo(() => {
    if (isAdminOrOwner) {
      // ADMIN: Faturamento vem do owner_metrics (cresce a cada 48h)
      return ownerMetrics.totalPipelineValue;
    }
    // USUÁRIO COMUM: Soma dos contratos ASSINADOS
    return contractMetrics.totalValue;
  }, [isAdminOrOwner, ownerMetrics.totalPipelineValue, contractMetrics.totalValue]);

  // ADMIN: Recorrência fixa de 3.223 (demo)
  // USUÁRIO: Soma das recorrências dos contratos ASSINADOS
  const totalRecurrence = useMemo(() => {
    if (isAdminOrOwner) {
      // ADMIN: Valor fixo de demo
      return 3223;
    }
    // USUÁRIO COMUM: Soma real dos contratos assinados
    return contractMetrics.totalRecurrence;
  }, [isAdminOrOwner, contractMetrics.totalRecurrence]);

  // Calcular métricas do período selecionado e período anterior
  const periodMetrics = useMemo((): PeriodMetrics => {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - period);
    periodStart.setHours(0, 0, 0, 0);

    const previousPeriodStart = new Date(periodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - period);

    // ============================================
    // ADMIN: Lógica de período baseada no totalRevenue (owner_metrics)
    // ============================================
    if (isAdminOrOwner) {
      // Para admin, o gráfico é apenas VISUAL - NÃO redefine o faturamento total
      // Calculamos uma fração proporcional do faturamento total para o período
      const periodFraction = period / 30; // 7 dias = 23.3%, 30 dias = 100%
      const periodRevenue = Math.round(totalRevenue * periodFraction * 0.4); // ~40% do proporcional
      const previousPeriodRevenue = Math.round(periodRevenue * 0.85); // Crescimento de ~15%

      const growthPercentage = previousPeriodRevenue > 0
        ? Math.round(((periodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
        : null;

      return {
        periodRevenue,
        previousPeriodRevenue,
        growthPercentage,
        hasComparison: previousPeriodRevenue > 0,
        signedContractsInPeriod: 0,
        recurrenceInPeriod: 0,
      };
    }

    // ============================================
    // USUÁRIO COMUM: Lógica baseada em contratos ATIVOS reais
    // ============================================
    
    // Filtrar apenas contratos ATIVOS (status: Ativo ou Assinado)
    const activeStatuses = ['Ativo', 'Assinado'];
    const activeContracts = contracts.filter(c => activeStatuses.includes(c.status));

    // Contratos ativos no período atual (baseado em start_date ou created_at)
    const contractsInCurrentPeriod = activeContracts.filter(c => {
      const contractDate = new Date(c.start_date || c.created_at);
      return contractDate >= periodStart && contractDate <= now;
    });

    // Contratos ativos no período anterior
    const contractsInPreviousPeriod = activeContracts.filter(c => {
      const contractDate = new Date(c.start_date || c.created_at);
      return contractDate >= previousPeriodStart && contractDate < periodStart;
    });

    // Faturamento do período atual = valor total dos contratos + recorrência proporcional
    const currentContractValue = contractsInCurrentPeriod.reduce(
      (sum, c) => sum + Number(c.value || 0),
      0
    );

    // Recorrência proporcional ao período
    // Para 7 dias: recorrência mensal * (7/30)
    // Para 30 dias: recorrência mensal completa
    const recurrenceMultiplier = period === 7 ? 7 / 30 : 1;
    const currentRecurrence = contractsInCurrentPeriod.reduce(
      (sum, c) => sum + Number(c.recurrence_value_monthly || 0) * recurrenceMultiplier,
      0
    );

    const periodRevenue = Math.round(currentContractValue + currentRecurrence);

    // Faturamento do período anterior
    const previousContractValue = contractsInPreviousPeriod.reduce(
      (sum, c) => sum + Number(c.value || 0),
      0
    );
    const previousRecurrence = contractsInPreviousPeriod.reduce(
      (sum, c) => sum + Number(c.recurrence_value_monthly || 0) * recurrenceMultiplier,
      0
    );
    const previousPeriodRevenue = Math.round(previousContractValue + previousRecurrence);

    // Calcular crescimento percentual
    let growthPercentage: number | null = null;
    const hasComparison = previousPeriodRevenue > 0;
    
    if (hasComparison) {
      growthPercentage = Math.round(
        ((periodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      );
    }

    return {
      periodRevenue,
      previousPeriodRevenue,
      growthPercentage,
      hasComparison,
      signedContractsInPeriod: contractsInCurrentPeriod.length,
      recurrenceInPeriod: Math.round(currentRecurrence),
    };
  }, [contracts, period, isAdminOrOwner, totalRevenue]);

  // Gerar dados do gráfico com datas reais
  const chartData = useMemo((): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    // Se não há faturamento E é usuário comum, mostrar linha zero
    if (totalRevenue <= 0 && !isAdminOrOwner) {
      for (let i = 0; i < period; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (period - 1 - i));
        date.setHours(0, 0, 0, 0);
        
        data.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          fullDate: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          value: 0,
          dateObj: date,
        });
      }
      return data;
    }

    // Construir histórico para trás a partir do valor total atual
    // O último ponto DEVE ser exatamente igual ao totalRevenue
    const startValue = totalRevenue * 0.65;
    const growthRange = totalRevenue - startValue;
    
    // Seeded random para consistência entre refreshes
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 9999) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < period; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (period - 1 - i));
      date.setHours(0, 0, 0, 0);
      
      const progress = i / (period - 1);
      
      let value: number;
      if (i === period - 1) {
        // Hoje = valor final exato (bate com o card)
        value = totalRevenue;
      } else {
        // Adicionar pequenas variações (±3%) para realismo
        const baseValue = startValue + growthRange * progress;
        const variation = 0.97 + seededRandom(i * 7 + period) * 0.06;
        value = Math.round(baseValue * variation);
      }
      
      data.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        fullDate: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value,
        dateObj: date,
      });
    }
    
    return data;
  }, [totalRevenue, period, isAdminOrOwner]);

  return {
    // Métricas do período selecionado
    periodMetrics,
    
    // Dados do gráfico
    chartData,
    
    // Métricas totais
    totalRevenue,
    totalRecurrence,
    activeContracts: contractMetrics.activeContracts,
    averageTicket: contractMetrics.averageTicket,
    
    // Loading state
    loading: contractsLoading || ownerLoading,
    
    // Flag para indicar se é admin (para exibição condicional)
    isAdminOrOwner,
  };
}
