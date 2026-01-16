import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useAuth } from '@/contexts/AuthContext';

// 14 contratos demo para ADMIN - nomes únicos, valores únicos
// Recorrência dos 9 Assinados = R$ 7.574 exatamente
// 847 + 1.123 + 1.297 + 389 + 956 + 712 + 1.089 + 573 + 588 = 7.574
const DEMO_CONTRACTS_V2 = [
  // 9 ASSINADOS (soma recorrência = 7574)
  {
    client_name: 'Pizzaria Forno & Brasa',
    project_type: 'App Delivery',
    value: 4250,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 847,
    status: 'Assinado',
  },
  {
    client_name: 'Clínica Odonto Premium',
    project_type: 'Site Institucional',
    value: 5680,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 1123,
    status: 'Assinado',
  },
  {
    client_name: 'Hamburgueria The Burger Co',
    project_type: 'App Delivery',
    value: 6480,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 1297,
    status: 'Assinado',
  },
  {
    client_name: 'Escritório Advocacia Nunes',
    project_type: 'Landing Page',
    value: 1950,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 389,
    status: 'Assinado',
  },
  {
    client_name: 'Loja TechCell Celulares',
    project_type: 'E-commerce',
    value: 4780,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 956,
    status: 'Assinado',
  },
  {
    client_name: 'Studio Pilates Corpo & Mente',
    project_type: 'Site Institucional',
    value: 3560,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 712,
    status: 'Assinado',
  },
  {
    client_name: 'Restaurante Sabores do Mar',
    project_type: 'App Delivery',
    value: 5450,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 1089,
    status: 'Assinado',
  },
  {
    client_name: 'Imobiliária Casa & Lar',
    project_type: 'Landing Page',
    value: 2860,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 573,
    status: 'Assinado',
  },
  {
    client_name: 'Salão Beauty Hair Studio',
    project_type: 'Site Institucional',
    value: 2940,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 588,
    status: 'Assinado',
  },
  // 3 PENDENTES
  {
    client_name: 'Academia FitPro Center',
    project_type: 'App Delivery',
    value: 5200,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 897,
    status: 'Pendente',
  },
  {
    client_name: 'Consultório Dr. Marcos Lima',
    project_type: 'Site Institucional',
    value: 3080,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 617,
    status: 'Pendente',
  },
  {
    client_name: 'PetShop Amigo Peludo',
    project_type: 'E-commerce',
    value: 3650,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 729,
    status: 'Pendente',
  },
  // 2 EM RENOVAÇÃO
  {
    client_name: 'Escola Idiomas WorldSpeak',
    project_type: 'Landing Page',
    value: 2150,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 429,
    status: 'Em renovação',
  },
  {
    client_name: 'Construtora Alicerce Forte',
    project_type: 'Site Institucional',
    value: 4320,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 863,
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

export function useContractsMetrics() {
  const { workspace } = useWorkspace();
  const { isAdminOrOwner } = useUserRole();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<DemoContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Seed demo contracts for admin - delete old and insert new 14 contracts
  const seedDemoContracts = useCallback(async () => {
    if (!workspace?.id || !user?.id || !isAdminOrOwner || seeding) return;

    setSeeding(true);
    try {
      // Delete existing demo contracts first (to refresh with new data)
      const { error: deleteError } = await supabase
        .from('demo_contracts')
        .delete()
        .eq('workspace_id', workspace.id)
        .eq('is_demo', true);

      if (deleteError) {
        console.error('Error deleting old demo contracts:', deleteError);
      }

      // Insert the new 14 demo contracts
      const contractsToInsert = DEMO_CONTRACTS_V2.map((contract, index) => ({
        owner_user_id: user.id,
        workspace_id: workspace.id,
        client_name: contract.client_name,
        project_type: contract.project_type,
        value: contract.value,
        recurrence_type: contract.recurrence_type,
        recurrence_value_monthly: contract.recurrence_value_monthly,
        status: contract.status,
        is_demo: true,
        start_date: new Date(Date.now() - index * 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));

      const { error: insertError } = await supabase
        .from('demo_contracts')
        .insert(contractsToInsert);

      if (insertError) {
        console.error('Error seeding demo contracts:', insertError);
      }
    } catch (error) {
      console.error('Error in seedDemoContracts:', error);
    } finally {
      setSeeding(false);
    }
  }, [workspace?.id, user?.id, isAdminOrOwner, seeding]);

  // Fetch contracts
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
        return;
      }

      setContracts(data || []);
    } catch (error) {
      console.error('Error in fetchContracts:', error);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, user?.id]);

  // Initialize: seed for admin, then fetch
  useEffect(() => {
    const init = async () => {
      if (isAdminOrOwner) {
        await seedDemoContracts();
      }
      await fetchContracts();
    };
    init();
  }, [isAdminOrOwner, seedDemoContracts, fetchContracts]);

  // Calculate metrics from signed contracts
  const metrics = useMemo((): ContractMetrics => {
    const signedContracts = contracts.filter(c => c.status === 'Assinado');
    
    const totalRecurrence = signedContracts.reduce(
      (sum, c) => sum + Number(c.recurrence_value_monthly || 0),
      0
    );
    
    const totalValue = signedContracts.reduce(
      (sum, c) => sum + Number(c.value || 0),
      0
    );
    
    const averageTicket = signedContracts.length > 0
      ? Math.round(totalValue / signedContracts.length)
      : 0;

    return {
      totalRecurrence,
      activeContracts: signedContracts.length,
      averageTicket,
      totalValue,
    };
  }, [contracts]);

  return {
    contracts,
    metrics,
    loading,
    refetch: fetchContracts,
  };
}
