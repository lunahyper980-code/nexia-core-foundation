import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Sparkles, FileSignature } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useModuleState } from '@/hooks/useModuleState';
import { ResumeSessionBanner } from '@/components/ResumeSessionBanner';

export default function ContratoWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get('proposta');
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const { getSavedState, saveFormData, clearState } = useModuleState('contrato-wizard');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  
  const [formData, setFormData] = useState({
    contractorName: '', contractorDocument: '', contractorAddress: '',
    contractedName: '', contractedDocument: '',
    serviceDescription: '', serviceValue: '', paymentTerms: '', deadline: ''
  });

  // Check for saved state on mount
  useEffect(() => {
    const saved = getSavedState();
    if (saved?.formData?.contractorName) {
      setShowResumeBanner(true);
    }
  }, [getSavedState]);

  const handleResumeSession = () => {
    const saved = getSavedState();
    if (saved?.formData) {
      setFormData(prev => ({ ...prev, ...saved.formData }));
    }
    setShowResumeBanner(false);
  };

  const handleStartFresh = () => {
    clearState();
    setShowResumeBanner(false);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      saveFormData(updated);
      return updated;
    });
  };

  const generateContract = async () => {
    if (!workspace?.id) return;
    setIsGenerating(true);
    try {
      const { data: inserted } = await supabase.from('solution_contracts').insert({
        workspace_id: workspace.id, proposal_id: proposalId,
        contractor_name: formData.contractorName, contractor_document: formData.contractorDocument,
        contractor_address: formData.contractorAddress, contracted_name: formData.contractedName,
        contracted_document: formData.contractedDocument, service_description: formData.serviceDescription,
        service_value: parseFloat(formData.serviceValue) || 0, payment_terms: formData.paymentTerms,
        deadline: formData.deadline, status: 'draft'
      }).select().single();

      const { data: fnData, error: fnError } = await supabase.functions.invoke('generate-contract', {
        body: { contractData: { ...formData, serviceValue: parseFloat(formData.serviceValue) || 0 } }
      });
      if (fnError) throw fnError;

      await supabase.from('solution_contracts').update({
        contract_text: fnData.contractText, contract_generated_at: new Date().toISOString(), status: 'completed'
      }).eq('id', inserted?.id);

      clearState();

      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id, type: 'CONTRACT_GENERATED',
        message: `Contrato gerado para ${formData.contractorName}`, entity_type: 'solution_contract', entity_id: inserted?.id
      });

      navigate(`/solucoes/contrato/${inserted?.id}`, { replace: true });
    } catch (error: any) {
      toast({ title: 'Erro ao gerar contrato', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout title="Novo Contrato">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/solucoes/contrato')} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        {showResumeBanner && (
          <ResumeSessionBanner
            title="Continuar contrato?"
            description="Você tem dados preenchidos anteriormente"
            onResume={handleResumeSession}
            onStartFresh={handleStartFresh}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-amber-500" /> Dados do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">CONTRATANTE (seu cliente)</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Nome/Razão Social *</Label><Input placeholder="Nome do cliente" value={formData.contractorName} onChange={e => updateFormData('contractorName', e.target.value)} /></div>
                <div className="space-y-2"><Label>CPF/CNPJ</Label><Input placeholder="000.000.000-00" value={formData.contractorDocument} onChange={e => updateFormData('contractorDocument', e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Endereço</Label><Input placeholder="Endereço completo" value={formData.contractorAddress} onChange={e => updateFormData('contractorAddress', e.target.value)} /></div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">CONTRATADO (você)</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Nome/Razão Social *</Label><Input placeholder="Seu nome ou empresa" value={formData.contractedName} onChange={e => updateFormData('contractedName', e.target.value)} /></div>
                <div className="space-y-2"><Label>CPF/CNPJ</Label><Input placeholder="000.000.000-00" value={formData.contractedDocument} onChange={e => updateFormData('contractedDocument', e.target.value)} /></div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">DETALHES DO SERVIÇO</h3>
              <div className="space-y-2"><Label>Descrição do serviço</Label><Textarea placeholder="Descreva o serviço..." value={formData.serviceDescription} onChange={e => updateFormData('serviceDescription', e.target.value)} rows={3} /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" placeholder="2500" value={formData.serviceValue} onChange={e => updateFormData('serviceValue', e.target.value)} /></div>
                <div className="space-y-2"><Label>Pagamento</Label><Input placeholder="50% entrada" value={formData.paymentTerms} onChange={e => updateFormData('paymentTerms', e.target.value)} /></div>
                <div className="space-y-2"><Label>Prazo</Label><Input placeholder="15 dias" value={formData.deadline} onChange={e => updateFormData('deadline', e.target.value)} /></div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 rounded-lg text-sm text-amber-700 dark:text-amber-300">
              ⚠️ Este é um modelo de contrato simplificado. Recomendamos validação com um advogado.
            </div>

            <Button onClick={generateContract} disabled={isGenerating || !formData.contractorName || !formData.contractedName} className="w-full gap-2 bg-amber-500 hover:bg-amber-600">
              {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando contrato...</> : <><Sparkles className="h-4 w-4" /> Gerar contrato</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
