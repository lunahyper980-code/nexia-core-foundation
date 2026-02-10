import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';

// ==============================================
// VALORES BASE PADRÃO (usados quando não há dados no banco)
// ==============================================
const DEFAULT_METRICS = {
  projects: 32,
  proposals: 38,
  clients: 29,
  plannings: 27,
  pendingTasks: 12,
  completedTasks: 41,
  deliveries: 26,
  contracts: 24,
  averageTicket: 0,
  totalPipelineValue: 62000,
  totalProposalValue: 62000,
  recurrenceMonthly: 3223,
  teamCommission: 0,
  teamVolume: 23080,
  teamActiveMembers: 8,
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
  recurrenceMonthly: number;
  teamCommission: number;
  teamVolume: number;
  teamActiveMembers: number;
}

export function useOwnerMetrics() {
  const { isAdmin, isOwner: isOwnerRole } = useUserRole();
  const { workspace } = useWorkspace();
  const [metrics, setMetrics] = useState<OwnerMetrics>(DEFAULT_METRICS);
  const [loading, setLoading] = useState(true);

  const isOwner = useMemo(() => {
    return isAdmin || isOwnerRole;
  }, [isAdmin, isOwnerRole]);

  // Busca métricas do banco (valores editáveis pelo admin)
  useEffect(() => {
    if (!isOwner || !workspace) {
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
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

        if (existingMetrics) {
          const pipelineValue = Number(existingMetrics.total_pipeline_value) || DEFAULT_METRICS.totalPipelineValue;
          const projects = existingMetrics.projects || DEFAULT_METRICS.projects;
          const recurrence = Number(existingMetrics.recurrence_monthly) || DEFAULT_METRICS.recurrenceMonthly;
          
          setMetrics({
            projects,
            proposals: existingMetrics.proposals || DEFAULT_METRICS.proposals,
            clients: existingMetrics.clients || DEFAULT_METRICS.clients,
            plannings: existingMetrics.plannings || DEFAULT_METRICS.plannings,
            pendingTasks: existingMetrics.pending_tasks || DEFAULT_METRICS.pendingTasks,
            completedTasks: existingMetrics.completed_tasks || DEFAULT_METRICS.completedTasks,
            deliveries: existingMetrics.deliveries || DEFAULT_METRICS.deliveries,
            contracts: existingMetrics.contracts || DEFAULT_METRICS.contracts,
            totalPipelineValue: pipelineValue,
            totalProposalValue: pipelineValue,
            averageTicket: projects > 0 ? Math.round(pipelineValue / projects) : 0,
            recurrenceMonthly: recurrence,
            teamCommission: Number((existingMetrics as any).team_commission) || DEFAULT_METRICS.teamCommission,
            teamVolume: Number((existingMetrics as any).team_volume) || DEFAULT_METRICS.teamVolume,
            teamActiveMembers: Number((existingMetrics as any).team_active_members) || DEFAULT_METRICS.teamActiveMembers,
          });
        } else {
          // Criar novo registro com valores padrão
          const { error: insertError } = await supabase
            .from('owner_metrics')
            .insert({
              workspace_id: workspace.id,
              reference_date: new Date().toISOString(),
              completed_cycles: 0,
              projects: DEFAULT_METRICS.projects,
              proposals: DEFAULT_METRICS.proposals,
              clients: DEFAULT_METRICS.clients,
              plannings: DEFAULT_METRICS.plannings,
              pending_tasks: DEFAULT_METRICS.pendingTasks,
              completed_tasks: DEFAULT_METRICS.completedTasks,
              deliveries: DEFAULT_METRICS.deliveries,
              contracts: DEFAULT_METRICS.contracts,
              total_pipeline_value: DEFAULT_METRICS.totalPipelineValue,
            });

          if (insertError) {
            console.error('Error creating owner metrics:', insertError);
          }
          
          // Usar valores padrão
          setMetrics({
            ...DEFAULT_METRICS,
            averageTicket: Math.round(DEFAULT_METRICS.totalPipelineValue / DEFAULT_METRICS.projects),
          });
        }
      } catch (error) {
        console.error('Error in owner metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Atualiza a cada 30 segundos para detectar mudanças do admin
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('owner_metrics')
        .select('*')
        .eq('workspace_id', workspace.id)
        .maybeSingle();

      if (data) {
        const pipelineValue = Number(data.total_pipeline_value) || DEFAULT_METRICS.totalPipelineValue;
        const projects = data.projects || DEFAULT_METRICS.projects;
        const recurrence = Number(data.recurrence_monthly) || DEFAULT_METRICS.recurrenceMonthly;
        
        setMetrics({
          projects,
          proposals: data.proposals || DEFAULT_METRICS.proposals,
          clients: data.clients || DEFAULT_METRICS.clients,
          plannings: data.plannings || DEFAULT_METRICS.plannings,
          pendingTasks: data.pending_tasks || DEFAULT_METRICS.pendingTasks,
          completedTasks: data.completed_tasks || DEFAULT_METRICS.completedTasks,
          deliveries: data.deliveries || DEFAULT_METRICS.deliveries,
          contracts: data.contracts || DEFAULT_METRICS.contracts,
          totalPipelineValue: pipelineValue,
          totalProposalValue: pipelineValue,
          averageTicket: projects > 0 ? Math.round(pipelineValue / projects) : 0,
          recurrenceMonthly: recurrence,
          teamCommission: Number((data as any).team_commission) || DEFAULT_METRICS.teamCommission,
          teamVolume: Number((data as any).team_volume) || DEFAULT_METRICS.teamVolume,
          teamActiveMembers: Number((data as any).team_active_members) || DEFAULT_METRICS.teamActiveMembers,
        });
      }
    }, 30000);

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
        recurrenceMonthly: realStats.recurrenceMonthly || 0,
        teamCommission: realStats.teamCommission || 0,
        teamVolume: realStats.teamVolume || 0,
        teamActiveMembers: realStats.teamActiveMembers || 0,
      };
    }
    return metrics;
  }, [isOwner, metrics]);

  // Função para forçar atualização
  const refetch = useCallback(async () => {
    if (!workspace) return;
    
    const { data } = await supabase
      .from('owner_metrics')
      .select('*')
      .eq('workspace_id', workspace.id)
      .maybeSingle();

    if (data) {
      const pipelineValue = Number(data.total_pipeline_value) || DEFAULT_METRICS.totalPipelineValue;
      const projects = data.projects || DEFAULT_METRICS.projects;
      const recurrence = Number(data.recurrence_monthly) || DEFAULT_METRICS.recurrenceMonthly;
      
      setMetrics({
        projects,
        proposals: data.proposals || DEFAULT_METRICS.proposals,
        clients: data.clients || DEFAULT_METRICS.clients,
        plannings: data.plannings || DEFAULT_METRICS.plannings,
        pendingTasks: data.pending_tasks || DEFAULT_METRICS.pendingTasks,
        completedTasks: data.completed_tasks || DEFAULT_METRICS.completedTasks,
        deliveries: data.deliveries || DEFAULT_METRICS.deliveries,
        contracts: data.contracts || DEFAULT_METRICS.contracts,
        totalPipelineValue: pipelineValue,
        totalProposalValue: pipelineValue,
        averageTicket: projects > 0 ? Math.round(pipelineValue / projects) : 0,
        recurrenceMonthly: recurrence,
        teamCommission: Number((data as any).team_commission) || DEFAULT_METRICS.teamCommission,
        teamVolume: Number((data as any).team_volume) || DEFAULT_METRICS.teamVolume,
        teamActiveMembers: Number((data as any).team_active_members) || DEFAULT_METRICS.teamActiveMembers,
      });
    }
  }, [workspace]);

  return {
    isOwner,
    metrics,
    loading,
    getMetricValue,
    getOwnerStats,
    refetch,
  };
}

export function useIsOwner(): boolean {
  const { isAdmin, isOwner } = useUserRole();
  return isAdmin || isOwner;
}
