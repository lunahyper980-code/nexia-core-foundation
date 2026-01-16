import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useAuth } from '@/contexts/AuthContext';

// Demo contracts data - seeded for admins only
const DEMO_CONTRACTS = [
  {
    client_name: 'Oliveira do Chef',
    project_type: 'Site',
    value: 745,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 129,
    status: 'Assinado',
  },
  {
    client_name: 'Barbearia Rei do Corte',
    project_type: 'Site',
    value: 868,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 153,
    status: 'Assinado',
  },
  {
    client_name: 'Studio de Estética Bella',
    project_type: 'Site',
    value: 808,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 121,
    status: 'Assinado',
  },
  {
    client_name: 'App Delivery Centro',
    project_type: 'App Delivery',
    value: 1940,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 299,
    status: 'Assinado',
  },
  {
    client_name: 'Landing Pro Imobiliária',
    project_type: 'Landing Page',
    value: 255,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 79,
    status: 'Assinado',
  },
  {
    client_name: 'Loja Roupas Urban',
    project_type: 'E-commerce',
    value: 185,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 59,
    status: 'Pendente',
  },
  {
    client_name: 'Clínica Sorriso',
    project_type: 'Site',
    value: 1134,
    recurrence_type: 'Mensal',
    recurrence_value_monthly: 185,
    status: 'Assinado',
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

  // Seed demo contracts for admin if none exist
  const seedDemoContracts = useCallback(async () => {
    if (!workspace?.id || !user?.id || !isAdminOrOwner || seeding) return;

    setSeeding(true);
    try {
      // Check if demo contracts already exist
      const { data: existing, error: checkError } = await supabase
        .from('demo_contracts')
        .select('id')
        .eq('workspace_id', workspace.id)
        .eq('is_demo', true)
        .limit(1);

      if (checkError) {
        console.error('Error checking demo contracts:', checkError);
        return;
      }

      // If no demo contracts exist, seed them
      if (!existing || existing.length === 0) {
        const contractsToInsert = DEMO_CONTRACTS.map((contract, index) => ({
          owner_user_id: user.id,
          workspace_id: workspace.id,
          client_name: contract.client_name,
          project_type: contract.project_type,
          value: contract.value,
          recurrence_type: contract.recurrence_type,
          recurrence_value_monthly: contract.recurrence_value_monthly,
          status: contract.status,
          is_demo: true,
          start_date: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }));

        const { error: insertError } = await supabase
          .from('demo_contracts')
          .insert(contractsToInsert);

        if (insertError) {
          console.error('Error seeding demo contracts:', insertError);
        }
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
