import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface RealMetrics {
  projects: number;
  proposals: number;
  clients: number;
  deliveries: number;
  contracts: number;
  totalPipelineValue: number;
  averageTicket: number;
  userCreatedAt: string | null;
}

export interface MetricsHistoryEntry {
  date: string;
  projects_count: number;
  pipeline_value: number;
}

export function useRealMetrics() {
  const { workspace } = useWorkspace();
  const [metrics, setMetrics] = useState<RealMetrics>({
    projects: 0,
    proposals: 0,
    clients: 0,
    deliveries: 0,
    contracts: 0,
    totalPipelineValue: 0,
    averageTicket: 0,
    userCreatedAt: null,
  });
  const [metricsHistory, setMetricsHistory] = useState<MetricsHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Salva ou atualiza as métricas do dia atual
  const saveCurrentMetrics = useCallback(async (
    workspaceId: string,
    projectsCount: number,
    proposalsCount: number,
    clientsCount: number,
    deliveriesCount: number,
    contractsCount: number,
    pipelineValue: number
  ) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Usa upsert para inserir ou atualizar o registro do dia
      await supabase
        .from('metrics_history')
        .upsert({
          workspace_id: workspaceId,
          date: today,
          projects_count: projectsCount,
          proposals_count: proposalsCount,
          clients_count: clientsCount,
          deliveries_count: deliveriesCount,
          contracts_count: contractsCount,
          pipeline_value: pipelineValue,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'workspace_id,date'
        });
    } catch (error) {
      console.error('Error saving metrics history:', error);
    }
  }, []);

  // Busca histórico de métricas dos últimos 30 dias
  const fetchMetricsHistory = useCallback(async (workspaceId: string) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('metrics_history')
        .select('date, projects_count, pipeline_value')
        .eq('workspace_id', workspaceId)
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching metrics history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching metrics history:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    if (!workspace) {
      setLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        // Buscar contagens reais do banco
        const [
          projectsRes,
          proposalsRes,
          clientsRes,
          deliveriesRes,
          contractsRes,
        ] = await Promise.all([
          supabase
            .from('projects')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspace.id),
          supabase
            .from('proposals')
            .select('id, total_value, status', { count: 'exact' })
            .eq('workspace_id', workspace.id),
          supabase
            .from('clients')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspace.id),
          supabase
            .from('deliveries')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspace.id),
          supabase
            .from('contracts')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspace.id),
        ]);

        const projectsCount = projectsRes.count || 0;
        const proposalsCount = proposalsRes.count || 0;
        const clientsCount = clientsRes.count || 0;
        const deliveriesCount = deliveriesRes.count || 0;
        const contractsCount = contractsRes.count || 0;

        // Calcular valor total do pipeline (soma dos valores das propostas ACEITAS)
        const totalPipelineValue = proposalsRes.data?.reduce(
          (sum, p) => sum + ((p as any).status === 'accepted' ? ((p as any).total_value || 0) : 0),
          0
        ) || 0;

        // Calcular ticket médio
        const averageTicket = projectsCount > 0 
          ? totalPipelineValue / projectsCount 
          : 0;

        // Pegar data de criação do workspace (data de cadastro do usuário)
        const userCreatedAt = workspace.created_at;

        setMetrics({
          projects: projectsCount,
          proposals: proposalsCount,
          clients: clientsCount,
          deliveries: deliveriesCount,
          contracts: contractsCount,
          totalPipelineValue,
          averageTicket,
          userCreatedAt,
        });

        // Salva métricas atuais no histórico
        await saveCurrentMetrics(
          workspace.id,
          projectsCount,
          proposalsCount,
          clientsCount,
          deliveriesCount,
          contractsCount,
          totalPipelineValue
        );

        // Busca histórico de métricas
        const history = await fetchMetricsHistory(workspace.id);
        setMetricsHistory(history);

      } catch (error) {
        console.error('Error fetching real metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [workspace, saveCurrentMetrics, fetchMetricsHistory]);

  return { metrics, metricsHistory, loading };
}