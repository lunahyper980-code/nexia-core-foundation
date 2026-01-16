import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/components/encontrar-clientes/LeadCard';
import { IntelligentApproachScreen } from '@/components/encontrar-clientes/IntelligentApproachScreen';
import { ProspectorSearchScreen } from '@/components/encontrar-clientes/ProspectorSearchScreen';
import { ProspectorLoadingScreen } from '@/components/encontrar-clientes/ProspectorLoadingScreen';
import { LeadsResultsScreen } from '@/components/encontrar-clientes/LeadsResultsScreen';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useModuleState } from '@/hooks/useModuleState';

export default function EncontrarClientes() {
  const { workspace } = useWorkspace();
  const { getSavedState, saveFormData, saveExtras, clearState } = useModuleState('prospeccao');
  
  const [nicho, setNicho] = useState('');
  const [cidade, setCidade] = useState('');
  const [possuiSite, setPossuiSite] = useState(false);
  const [possuiInstagram, setPossuiInstagram] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsNaoConfirmados, setLeadsNaoConfirmados] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lastSearchNicho, setLastSearchNicho] = useState('');
  const [lastSearchCidade, setLastSearchCidade] = useState('');

  // Restore state on mount
  useEffect(() => {
    const saved = getSavedState();
    if (saved) {
      if (saved.formData) {
        if (saved.formData.nicho) setNicho(saved.formData.nicho);
        if (saved.formData.cidade) setCidade(saved.formData.cidade);
        if (saved.formData.possuiSite !== undefined) setPossuiSite(saved.formData.possuiSite);
        if (saved.formData.possuiInstagram !== undefined) setPossuiInstagram(saved.formData.possuiInstagram);
      }
      if (saved.extras) {
        if (saved.extras.leads) setLeads(saved.extras.leads);
        if (saved.extras.leadsNaoConfirmados) setLeadsNaoConfirmados(saved.extras.leadsNaoConfirmados);
        if (saved.extras.showResults) setShowResults(saved.extras.showResults);
        if (saved.extras.lastSearchNicho) setLastSearchNicho(saved.extras.lastSearchNicho);
        if (saved.extras.lastSearchCidade) setLastSearchCidade(saved.extras.lastSearchCidade);
      }
    }
  }, [getSavedState]);

  // Save form data when it changes
  useEffect(() => {
    saveFormData({ nicho, cidade, possuiSite, possuiInstagram });
  }, [nicho, cidade, possuiSite, possuiInstagram, saveFormData]);

  const handleSearch = async () => {
    if (!nicho.trim() || !cidade.trim()) {
      toast.error('Preencha o nicho e a cidade');
      return;
    }

    setIsSearching(true);
    setLeads([]);
    setLeadsNaoConfirmados([]);
    setShowResults(false);

    // Save search terms for display
    setLastSearchNicho(nicho);
    setLastSearchCidade(cidade);

    // Minimum display time for premium experience
    const minLoadingTime = 2500;
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('generate-leads', {
        body: { nicho, cidade, possuiSite, possuiInstagram }
      });

      // Ensure minimum loading time
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }

      if (error) throw error;
      
      if (data.leads && data.leads.length > 0) {
        setLeads(data.leads);
        setLeadsNaoConfirmados(data.leadsNaoConfirmados || []);
        setIsSearching(false);
        setShowResults(true);
        // Save results to state
        saveExtras({
          leads: data.leads,
          leadsNaoConfirmados: data.leadsNaoConfirmados || [],
          showResults: true,
          lastSearchNicho: nicho,
          lastSearchCidade: cidade,
        });
        toast.success(`${data.leads.length} leads encontrados!`);
      } else {
        setIsSearching(false);
        toast.info('Não encontramos o suficiente com esses filtros. Tente outra cidade ou nicho.');
      }
    } catch (error: any) {
      console.error('Error searching leads:', error);
      // Ensure minimum loading time even on error
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
      setIsSearching(false);
      toast.info('Não encontramos o suficiente com esses filtros. Tente outra cidade ou nicho.');
    }
  };

  const handleGenerateMessage = (lead: Lead) => {
    setSelectedLead(lead);
    setMessageModalOpen(true);
  };

  const handleSaveLead = async (lead: Lead) => {
    if (!workspace?.id) {
      toast.error('Workspace não encontrado');
      return;
    }

    try {
      const { error } = await supabase.from('clients').insert({
        workspace_id: workspace.id,
        name: lead.nome,
        segment: lead.segmento,
        city: lead.localizacao,
        contact_phone: lead.telefone && lead.telefonePublico ? lead.telefone : null,
        status: 'lead',
        notes: `Lead gerado por IA (Confiança: ${lead.confiancaNome || 'média'}) - ${new Date().toLocaleDateString('pt-BR')}`
      });

      if (error) throw error;
      toast.success('Lead salvo em Clientes!');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Erro ao salvar lead');
    }
  };

  const handleNewSearch = () => {
    setShowResults(false);
    setLeads([]);
    setLeadsNaoConfirmados([]);
    // Clear saved results but keep form data
    saveExtras({ showResults: false, leads: [], leadsNaoConfirmados: [] });
  };

  return (
    <AppLayout title="Encontrar Clientes">
      {showResults ? (
        <LeadsResultsScreen
          leads={leads}
          leadsNaoConfirmados={leadsNaoConfirmados}
          nicho={lastSearchNicho}
          cidade={lastSearchCidade}
          onGenerateMessage={handleGenerateMessage}
          onSaveLead={handleSaveLead}
          onNewSearch={handleNewSearch}
        />
      ) : (
        <ProspectorSearchScreen
          nicho={nicho}
          cidade={cidade}
          possuiSite={possuiSite}
          possuiInstagram={possuiInstagram}
          isSearching={isSearching}
          onNichoChange={setNicho}
          onCidadeChange={setCidade}
          onPossuiSiteChange={setPossuiSite}
          onPossuiInstagramChange={setPossuiInstagram}
          onSearch={handleSearch}
        />
      )}

      {/* Premium Loading Screen */}
      <ProspectorLoadingScreen open={isSearching} />

      {/* Intelligent Approach Screen */}
      <IntelligentApproachScreen
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        lead={selectedLead}
      />
    </AppLayout>
  );
}
