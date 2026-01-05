import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Email do usuário owner que terá métricas exageradas
const OWNER_EMAIL = 'emilysantos170706@gmail.com';

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
  projects: 32,           // Soluções criadas (entre 25-43)
  proposals: 38,          // Propostas em aberto (entre 25-43)
  clients: 29,            // Clientes cadastrados (entre 25-43)
  plannings: 27,          // Planejamentos
  pendingTasks: 12,       // Tarefas pendentes
  completedTasks: 41,     // Tarefas concluídas
  deliveries: 26,         // Entregas em andamento (entre 25-43)
  contracts: 24,          // Contratos
  averageTicket: 0,       // Será calculado: pipeline ÷ projetos
  totalPipelineValue: 74500, // Pipeline coerente com mais projetos
  totalProposalValue: 74500,
};

// Incremento a cada 48 horas
const INCREMENT_INTERVAL_MS = 48 * 60 * 60 * 1000;

// Guarda uma data de referência fixa no navegador
const OWNER_METRICS_REFERENCE_STORAGE_KEY = 'nexia_owner_metrics_reference_date_v3';

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

// Gera as métricas do owner com base no tempo decorrido
const generateOwnerMetrics = (): OwnerMetrics => {
  const increments = calculateIncrements();

  // Crescimento moderado a cada 48h
  const projects = BASE_METRICS.projects + increments * 2;
  const proposals = BASE_METRICS.proposals + increments * 2;
  const clients = BASE_METRICS.clients + increments * 1;
  const plannings = BASE_METRICS.plannings + increments * 2;
  const pendingTasks = BASE_METRICS.pendingTasks + increments * 1;
  const completedTasks = BASE_METRICS.completedTasks + increments * 3;
  const deliveries = BASE_METRICS.deliveries + increments * 2;
  const contracts = BASE_METRICS.contracts + increments * 1;

  // Pipeline: +R$ 1.800 a cada 48h (crescimento realista)
  const totalPipelineValue = BASE_METRICS.totalPipelineValue + increments * 1800;

  // Mantém vendas alinhado ao pipeline
  const totalProposalValue = totalPipelineValue;

  // Ticket médio: pipeline ÷ projetos (esperado entre R$ 1.800 e R$ 2.800)
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
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<OwnerMetrics>(generateOwnerMetrics);

  // Verifica se o usuário atual é o owner
  const isOwner = useMemo(() => {
    return user?.email === OWNER_EMAIL;
  }, [user?.email]);

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

  // Função para obter valor real ou fictício baseado no owner
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

// Hook simplificado para apenas verificar se é owner
export function useIsOwner(): boolean {
  const { user } = useAuth();
  return user?.email === OWNER_EMAIL;
}
