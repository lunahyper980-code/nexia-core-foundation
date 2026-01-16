import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { toUiStatus, isActiveStatus, ACTIVE_DB_STATUSES } from '@/lib/contractStatusMap';

// 14 contratos demo para ADMIN - nomes únicos, valores realistas
// Recorrência dos 9 Assinados = R$ 3.223 exatamente
// 289 + 497 + 359 + 89 + 449 + 169 + 547 + 379 + 445 = 3.223
const DEMO_CONTRACTS_V2 = [
  // 9 ASSINADOS (soma recorrência = 3223)
  {
    client_name: 'Pizzaria Bella Massa',
    project_type: 'App',
    value: 1450,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 289,
    status: 'Assinado',
  },
  {
    client_name: 'Clínica Sorriso Perfeito',
    project_type: 'Site',
    value: 890,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 497,
    status: 'Assinado',
  },
  {
    client_name: 'Burger House Express',
    project_type: 'App',
    value: 1680,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 359,
    status: 'Assinado',
  },
  {
    client_name: 'Advocacia Silva & Matos',
    project_type: 'Landing Page',
    value: 350,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 89,
    status: 'Assinado',
  },
  {
    client_name: 'CellTech Store',
    project_type: 'E-commerce',
    value: 1280,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 449,
    status: 'Assinado',
  },
  {
    client_name: 'Studio Forma & Saúde',
    project_type: 'Site',
    value: 780,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 169,
    status: 'Assinado',
  },
  {
    client_name: 'Sabor do Oceano Restaurante',
    project_type: 'App',
    value: 1890,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 547,
    status: 'Assinado',
  },
  {
    client_name: 'Imóveis Prime Corretora',
    project_type: 'Landing Page',
    value: 420,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 379,
    status: 'Assinado',
  },
  {
    client_name: 'Salão Beleza Pura',
    project_type: 'Site',
    value: 650,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 445,
    status: 'Assinado',
  },
  // 3 PENDENTES
  {
    client_name: 'Fit Center Academia',
    project_type: 'App',
    value: 1560,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 297,
    status: 'Pendente',
  },
  {
    client_name: 'Dr. Carlos Mendes',
    project_type: 'Site',
    value: 720,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 129,
    status: 'Pendente',
  },
  {
    client_name: 'PetLove Shop',
    project_type: 'E-commerce',
    value: 980,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 229,
    status: 'Pendente',
  },
  // 2 EM RENOVAÇÃO
  {
    client_name: 'WorldSpeak Idiomas',
    project_type: 'Landing Page',
    value: 380,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 79,
    status: 'Em renovação',
  },
  {
    client_name: 'Construtora Alicerce',
    project_type: 'Site',
    value: 920,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 189,
    status: 'Em renovação',
  },
];

export interface DemoContract {
  id: string;
  owner_user_id: string;
  workspace_id: string;
  client_name: string;
  project_type: string;
  value: number;
  recurrence_type: string;
  recurrence_value_monthly: number;
  status: string;
  start_date: string;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContractMetrics {
  totalRecurrence: number;
  activeContracts: number;
  averageTicket: number;
  totalValue: number;
}

// Status que entram no faturamento/recorrência (UI)
export const ACTIVE_STATUSES = ['Ativo', 'Assinado'];

// Status disponíveis no sistema (UI - português)
export const CONTRACT_STATUSES = [
  'Rascunho',
  'Enviado', 
  'Assinado',
  'Ativo',
  'Pausado',
  'Cancelado',
];

// Re-exportar do contractStatusMap para compatibilidade
export { ACTIVE_DB_STATUSES } from '@/lib/contractStatusMap';

/**
 * Hook para gerenciar contratos e calcular métricas
 * 
 * REGRA DE OURO:
 * - ADMIN/OWNER: Mostra contratos DEMO (apenas para visualização, NÃO afeta faturamento do dashboard)
 * - USUÁRIO COMUM: Mostra APENAS contratos REAIS do banco
 * 
 * STATUS QUE ENTRAM NO FATURAMENTO: "Ativo" e "Assinado"
 */
export function useContractsMetrics() {
  const { workspace } = useWorkspace();
  const { isAdminOrOwner } = useUserRole();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<DemoContract[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch contracts from database
  const fetchContracts = useCallback(async () => {
    if (!workspace?.id || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('demo_contracts')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
        setContracts([]);
      } else {
        setContracts(data || []);
      }
    } catch (error) {
      console.error('Error in fetchContracts:', error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, user?.id]);

  // Initialize - just fetch contracts
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // ============================================
  // LÓGICA SEPARADA: ADMIN vs USUÁRIO COMUM
  // ============================================
  
  // ADMIN: Se não tem contratos no DB, usa mock data para VISUALIZAÇÃO apenas
  // USUÁRIO COMUM: Usa APENAS contratos reais do banco (pode ser vazio)
  const effectiveContracts = useMemo(() => {
    if (isAdminOrOwner) {
      // ADMIN: Se tem contratos no DB, mostra eles. Senão, mostra mock
      if (contracts.length > 0) {
        return contracts;
      }
      // Mock data para admin (apenas visualização)
      return DEMO_CONTRACTS_V2.map((c, i) => ({
        ...c,
        id: `local-${i}`,
        owner_user_id: user?.id || '',
        workspace_id: workspace?.id || '',
        start_date: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
        is_demo: true,
        created_at: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
    
    // USUÁRIO COMUM: Apenas contratos reais do banco
    return contracts;
  }, [contracts, isAdminOrOwner, user?.id, workspace?.id]);

  // Calculate metrics from ACTIVE contracts (Ativo or Assinado)
  // IMPORTANTE: Para usuário comum, esses valores vão para o dashboard
  // Para admin, esses valores são usados apenas na tela de contratos
  // Usa isActiveStatus para suportar tanto valores em português quanto inglês
  const metrics = useMemo((): ContractMetrics => {
    // Usuário comum: usa seus contratos reais
    // Admin: usa apenas os contratos visíveis na lista (não afeta dashboard)
    const contractsToCalculate = contracts;
    const activeContracts = contractsToCalculate.filter(c => isActiveStatus(c.status));
    
    const totalRecurrence = activeContracts.reduce(
      (sum, c) => sum + Number(c.recurrence_value_monthly || 0),
      0
    );
    
    const totalValue = activeContracts.reduce(
      (sum, c) => sum + Number(c.value || 0),
      0
    );
    
    const averageTicket = activeContracts.length > 0
      ? Math.round(totalValue / activeContracts.length)
      : 0;

    return {
      totalRecurrence,
      activeContracts: activeContracts.length,
      averageTicket,
      totalValue,
    };
  }, [contracts]);

  // Métricas para exibição na tela de contratos (usa effectiveContracts para admin ver demo)
  // Usa isActiveStatus para suportar tanto valores em português quanto inglês
  const displayMetrics = useMemo((): ContractMetrics => {
    const activeContracts = effectiveContracts.filter(c => isActiveStatus(c.status));
    
    const totalRecurrence = activeContracts.reduce(
      (sum, c) => sum + Number(c.recurrence_value_monthly || 0),
      0
    );
    
    const totalValue = activeContracts.reduce(
      (sum, c) => sum + Number(c.value || 0),
      0
    );
    
    const averageTicket = activeContracts.length > 0
      ? Math.round(totalValue / activeContracts.length)
      : 0;

    return {
      totalRecurrence,
      activeContracts: activeContracts.length,
      averageTicket,
      totalValue,
    };
  }, [effectiveContracts]);

  return {
    contracts: effectiveContracts as DemoContract[],
    metrics, // Métricas reais (usadas pelo dashboard para usuário comum)
    displayMetrics, // Métricas de exibição (usadas na tela de contratos)
    loading,
    refetch: fetchContracts,
    isAdminOrOwner,
  };
}
