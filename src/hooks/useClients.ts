import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface Client {
  id: string;
  workspace_id: string;
  name: string;
  niche: string | null;
  segment: string | null;
  city: string | null;
  whatsapp: string | null;
  instagram: string | null;
  notes: string | null;
  observations: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string | null;
  last_contact: string | null;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
}

export interface ClientInput {
  name: string;
  niche?: string;
  segment?: string;
  city?: string;
  whatsapp?: string;
  instagram?: string;
  notes?: string;
  observations?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export function useClients() {
  const { workspace } = useWorkspace();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    if (!workspace) {
      setClients([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      setClients(data as Client[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [workspace]);

  const createClient = async (input: ClientInput) => {
    if (!workspace) throw new Error('Workspace not found');

    const { data, error } = await supabase
      .from('clients')
      .insert({
        workspace_id: workspace.id,
        ...input,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      workspace_id: workspace.id,
      type: 'client_created',
      message: `Cliente "${input.name}" foi criado`,
      metadata: { client_name: input.name },
    });

    await fetchClients();
    return data;
  };

  const updateClient = async (id: string, input: Partial<ClientInput>) => {
    if (!workspace) throw new Error('Workspace not found');

    const { error } = await supabase
      .from('clients')
      .update(input)
      .eq('id', id);

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      workspace_id: workspace.id,
      type: 'client_updated',
      message: `Cliente "${input.name || 'Desconhecido'}" foi atualizado`,
      metadata: { client_id: id },
    });

    await fetchClients();
  };

  const deleteClient = async (id: string) => {
    if (!workspace) throw new Error('Workspace not found');

    const client = clients.find(c => c.id === id);

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      workspace_id: workspace.id,
      type: 'client_deleted',
      message: `Cliente "${client?.name || 'Desconhecido'}" foi removido`,
      metadata: { client_name: client?.name },
    });

    await fetchClients();
  };

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
}
