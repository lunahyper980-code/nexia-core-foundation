import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';

// ==============================================
// VALORES BASE REALISTAS E COERENTES
// ==============================================
const BASE_METRICS = {
  projects: 32,
  proposals: 38,
  clients: 29,
  plannings: 27,
  pendingTasks: 12,
  completedTasks: 41,
  deliveries: 26,
  contracts: 24,
  averageTicket: 0,
  totalPipelineValue: 38743,
  totalProposalValue: 38743,
};

// Incremento a cada 48 horas
const INCREMENT_INTERVAL_MS = 48 * 60 * 60 * 1000;

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

// Calcula métricas baseado na data de referência armazenada no backend
const calculateMetricsFromReference = (referenceDate: Date, basePipeline: number): OwnerMetrics => {
  const now = Date.now();
  const elapsed = now - referenceDate.getTime();
  const increments = Math.max(0, Math.floor(elapsed / INCREMENT_INTERVAL_MS));

  const projects = BASE_METRICS.projects + increments * 1;
  const proposals = BASE_METRICS.proposals + increments * 1;
  const clients = BASE_METRICS.clients + increments * 1;
  const plannings = BASE_METRICS.plannings + increments * 1;
  const pendingTasks = BASE_METRICS.pendingTasks + increments * 1;
  const completedTasks = BASE_METRICS.completedTasks + increments * 2;
  const deliveries = BASE_METRICS.deliveries + increments * 1;
  const contracts = BASE_METRICS.contracts + increments * 1;

  const totalPipelineValue = basePipeline + increments * 2350;
  const totalProposalValue = totalPipelineValue;
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
  const { workspace } = useWorkspace();
  const [metrics, setMetrics] = useState<OwnerMetrics>(BASE_METRICS as OwnerMetrics);
  const [loading, setLoading] = useState(true);

  const isOwner = useMemo(() => {
    return isAdmin || isOwnerRole;
  }, [isAdmin, isOwnerRole]);

  // Busca ou cria métricas no backend
  useEffect(() => {
    if (!isOwner || !workspace) {
      setLoading(false);
      return;
    }

    const fetchOrCreateMetrics = async () => {
      try {
        // Buscar métricas existentes do backend
        const { data: existingMetrics, error: fetchError } = await supabase
          .from('owner_metrics')
          .select('*')
          .eq('workspace_id', workspace.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching owner metrics:', fetchError);
          setLoading(false);
          return;
        }

        let referenceDate: Date;
        let basePipeline = BASE_METRICS.totalPipelineValue;

        if (existingMetrics) {
          // Usar data de referência do backend
          referenceDate = new Date(existingMetrics.reference_date);
          basePipeline = Number(existingMetrics.total_pipeline_value) || BASE_METRICS.totalPipelineValue;
        } else {
          // Criar novo registro no backend com data atual
          referenceDate = new Date();
          
          const { error: insertError } = await supabase
            .from('owner_metrics')
            .insert({
              workspace_id: workspace.id,
              reference_date: referenceDate.toISOString(),
              completed_cycles: 0,
              projects: BASE_METRICS.projects,
              proposals: BASE_METRICS.proposals,
              clients: BASE_METRICS.clients,
              plannings: BASE_METRICS.plannings,
              pending_tasks: BASE_METRICS.pendingTasks,
              completed_tasks: BASE_METRICS.completedTasks,
              deliveries: BASE_METRICS.deliveries,
              contracts: BASE_METRICS.contracts,
              total_pipeline_value: BASE_METRICS.totalPipelineValue,
            });

          if (insertError) {
            console.error('Error creating owner metrics:', insertError);
          }
        }

        // Calcular métricas com base na data de referência do backend
        const calculatedMetrics = calculateMetricsFromReference(referenceDate, basePipeline);
        setMetrics(calculatedMetrics);

      } catch (error) {
        console.error('Error in owner metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateMetrics();

    // Atualiza a cada minuto para detectar mudanças de período
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('owner_metrics')
        .select('reference_date, total_pipeline_value')
        .eq('workspace_id', workspace.id)
        .maybeSingle();

      if (data) {
        const calculatedMetrics = calculateMetricsFromReference(
          new Date(data.reference_date),
          Number(data.total_pipeline_value) || BASE_METRICS.totalPipelineValue
        );
        setMetrics(calculatedMetrics);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isOwner, workspace]);

  const getMetricValue = useCallback(<T extends number>(ownerValue: T, realValue: T): T => {
    return isOwner ? ownerValue : realValue;
  }, [isOwner]);

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
    loading,
    getMetricValue,
    getOwnerStats,
  };
}

export function useIsOwner(): boolean {
  const { isAdmin, isOwner } = useUserRole();
  return isAdmin || isOwner;
}
