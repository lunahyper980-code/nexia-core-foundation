import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/UserRoleContext';

// ==============================================
// VALORES BASE REALISTAS E COERENTES
// ==============================================
// Referência de preços:
// - Autoridade Digital (mensal): R$ 2.500
// - Kit de Lançamento (projeto): R$ 3.000
// - Posicionamento Digital (projeto): R$ 2.000
// - Organização de Processos (projeto): R$ 2.500
// Ticket médio esperado: ~R$ 2.200
// ==============================================

const BASE_METRICS = {
  projects: 32,           // Soluções criadas
  proposals: 38,          // Propostas em aberto
  clients: 29,            // Clientes cadastrados
  plannings: 27,          // Planejamentos
  pendingTasks: 12,       // Tarefas pendentes
  completedTasks: 41,     // Tarefas concluídas
  deliveries: 26,         // Entregas em andamento
  contracts: 24,          // Contratos
  averageTicket: 0,       // Será calculado: pipeline ÷ projetos
  totalPipelineValue: 38743, // Pipeline: R$ 38.743,00
  totalProposalValue: 38743,
};

// Incremento a cada 48 horas
const INCREMENT_INTERVAL_MS = 48 * 60 * 60 * 1000;

// Guarda uma data de referência fixa no navegador
const OWNER_METRICS_REFERENCE_STORAGE_KEY = 'nexia_owner_metrics_reference_date_v4';

const getReferenceDateMs = (): number => {
  if (typeof window === 'undefined') return Date.now();

  const stored = window.localStorage.getItem(OWNER_METRICS_REFERENCE_STORAGE_KEY);
  const parsed = stored ? Number(stored) : NaN;

  if (Number.isFinite(parsed) && parsed > 0) return parsed;

  const now = Date.now();
  window.localStorage.setItem(OWNER_METRICS_REFERENCE_STORAGE_KEY, String(now));
  return now;
};

export interface OwnerMetrics {
  projects: number;
  proposals: number;
  clients: number;
  plannings: number;
  pendingTasks: number;
  completedTasks: number;
  deliveries: number;
  contracts: number;
  averageTicket: number;
  totalPipelineValue: number;
  totalProposalValue: number;
}

// Calcula quantos períodos de 48h passaram desde a data de referência
const calculateIncrements = (atMs: number = Date.now()): number => {
  const reference = getReferenceDateMs();
  const elapsed = atMs - reference;
  return Math.max(0, Math.floor(elapsed / INCREMENT_INTERVAL_MS));
};

// Gera as métricas do admin com base no tempo decorrido
const generateOwnerMetrics = (): OwnerMetrics => {
  const increments = calculateIncrements();

  // Crescimento pequeno a cada 48h (entre 1-2 unidades)
  const projects = BASE_METRICS.projects + increments * 1;
  const proposals = BASE_METRICS.proposals + increments * 1;
  const clients = BASE_METRICS.clients + increments * 1;
  const plannings = BASE_METRICS.plannings + increments * 1;
  const pendingTasks = BASE_METRICS.pendingTasks + increments * 1;
  const completedTasks = BASE_METRICS.completedTasks + increments * 2;
  const deliveries = BASE_METRICS.deliveries + increments * 1;
  const contracts = BASE_METRICS.contracts + increments * 1;

  // Pipeline: +R$ 2.350 a cada 48h
  const totalPipelineValue = BASE_METRICS.totalPipelineValue + increments * 2350;

  // Mantém vendas alinhado ao pipeline
  const totalProposalValue = totalPipelineValue;

  // Ticket médio: pipeline ÷ projetos
  const averageTicket = Math.round(totalPipelineValue / Math.max(1, projects));

  return {
    projects,
    proposals,
    clients,
    plannings,
    pendingTasks,
    completedTasks,
    deliveries,
    contracts,
    averageTicket,
    totalPipelineValue,
    totalProposalValue,
  };
};

export function useOwnerMetrics() {
  const { isAdmin, isOwner: isOwnerRole } = useUserRole();
  const [metrics, setMetrics] = useState<OwnerMetrics>(generateOwnerMetrics);

  // Verifica se o usuário atual é admin ou owner (para métricas fictícias)
  const isOwner = useMemo(() => {
    return isAdmin || isOwnerRole;
  }, [isAdmin, isOwnerRole]);

  // Atualiza métricas periodicamente (a cada minuto para detectar mudanças de período)
  useEffect(() => {
    if (!isOwner) return;

    const updateMetrics = () => {
      setMetrics(generateOwnerMetrics());
    };

    // Atualiza imediatamente
    updateMetrics();

    // Atualiza a cada minuto para detectar mudanças de período
    const interval = setInterval(updateMetrics, 60000);

    return () => clearInterval(interval);
  }, [isOwner]);

  // Função para obter valor real ou fictício baseado no admin
  const getMetricValue = useCallback(<T extends number>(ownerValue: T, realValue: T): T => {
    return isOwner ? ownerValue : realValue;
  }, [isOwner]);

  // Função para obter métricas de stats completas
  const getOwnerStats = useCallback((realStats: Partial<OwnerMetrics>): OwnerMetrics => {
    if (!isOwner) {
      return {
        projects: realStats.projects || 0,
        proposals: realStats.proposals || 0,
        clients: realStats.clients || 0,
        plannings: realStats.plannings || 0,
        pendingTasks: realStats.pendingTasks || 0,
        completedTasks: realStats.completedTasks || 0,
        deliveries: realStats.deliveries || 0,
        contracts: realStats.contracts || 0,
        averageTicket: realStats.averageTicket || 0,
        totalPipelineValue: realStats.totalPipelineValue || 0,
        totalProposalValue: realStats.totalProposalValue || 0,
      };
    }
    return metrics;
  }, [isOwner, metrics]);

  return {
    isOwner,
    metrics,
    getMetricValue,
    getOwnerStats,
  };
}

// Hook simplificado para apenas verificar se é admin
export function useIsOwner(): boolean {
  const { isAdmin, isOwner } = useUserRole();
  return isAdmin || isOwner;
}
