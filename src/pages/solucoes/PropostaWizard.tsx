import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save,
  Loader2,
  Sparkles,
  Building2,
  ClipboardList,
  DollarSign
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useModuleState } from '@/hooks/useModuleState';
import { ResumeSessionBanner } from '@/components/ResumeSessionBanner';

interface ProposalFormData {
  companyName: string;
  contactName: string;
  serviceOffered: string;
  serviceValue: string;
  deadline: string;
  paymentMethod: string;
  scopeItems: string[];
  observations: string;
}

const SCOPE_OPTIONS = [
  'Criação de site/landing page',
  'Gestão de redes sociais',
  'Criação de identidade visual',
  'Produção de conteúdo',
  'Campanhas de anúncios',
  'Consultoria de marketing',
  'SEO e otimização',
  'E-mail marketing',
  'Fotografia/vídeo',
  'Suporte e manutenção'
];

const PAYMENT_OPTIONS = [
  'À vista',
  '50% entrada + 50% na entrega',
  'Parcelado em 2x',
  'Parcelado em 3x',
  'Mensal (recorrente)'
];

export default function PropostaWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const { getSavedState, saveStep, saveFormData, clearState } = useModuleState('proposta-wizard');
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  
  const [formData, setFormData] = useState<ProposalFormData>({
    companyName: '',
    contactName: '',
    serviceOffered: '',
    serviceValue: '',
    deadline: '',
    paymentMethod: '',
    scopeItems: [],
    observations: ''
  });

  // Check for saved state on mount (only for new proposals)
  useEffect(() => {
    if (id) return;
    const saved = getSavedState();
    if (saved && (saved.currentStep && saved.currentStep > 1 || saved.formData?.companyName)) {
      setShowResumeBanner(true);
    }
  }, [id, getSavedState]);

  const handleResumeSession = () => {
    const saved = getSavedState();
    if (saved) {
      if (saved.currentStep) setStep(saved.currentStep);
      if (saved.formData) setFormData(prev => ({ ...prev, ...saved.formData }));
    }
    setShowResumeBanner(false);
  };

  const handleStartFresh = () => {
    clearState();
    setShowResumeBanner(false);
  };

  const handleStepChange = (newStep: number) => {
    setStep(newStep);
    if (!id) saveStep(newStep);
  };

  useQuery({
    queryKey: ['solution-proposal', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('solution_proposals')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          companyName: data.company_name || '',
          contactName: data.contact_name || '',
          serviceOffered: data.service_offered || '',
          serviceValue: data.service_value?.toString() || '',
          deadline: data.deadline || '',
          paymentMethod: data.payment_method || '',
          scopeItems: data.scope_items || [],
          observations: data.observations || ''
        });
        if (data.proposal_text) {
          navigate(`/solucoes/proposta/${id}`, { replace: true });
        }
      }
      return data;
    },
    enabled: !!id,
  });

  const updateFormData = (field: keyof ProposalFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (!id) saveFormData(updated);
      return updated;
    });
  };

  const toggleScopeItem = (item: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        scopeItems: prev.scopeItems.includes(item)
          ? prev.scopeItems.filter(i => i !== item)
          : [...prev.scopeItems, item]
      };
      if (!id) saveFormData(updated);
      return updated;
    });
  };

  const saveDraft = async () => {
    if (!workspace?.id) return;
    setIsLoading(true);

    try {
      const payload = {
        workspace_id: workspace.id,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        service_offered: formData.serviceOffered,
        service_value: parseFloat(formData.serviceValue) || 0,
        deadline: formData.deadline,
        payment_method: formData.paymentMethod,
        scope_items: formData.scopeItems,
        observations: formData.observations,
        status: 'draft'
      };

      if (id) {
        await supabase.from('solution_proposals').update(payload).eq('id', id);
      } else {
        const { data } = await supabase.from('solution_proposals').insert(payload).select().single();
        if (data) {
          navigate(`/solucoes/proposta/${data.id}/editar`, { replace: true });
        }
      }

      toast({
        title: 'Rascunho salvo',
        description: 'Você pode continuar depois de onde parou.'
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateProposal = async () => {
    if (!workspace?.id) return;
    setIsGenerating(true);

    try {
      const payload = {
        workspace_id: workspace.id,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        service_offered: formData.serviceOffered,
        service_value: parseFloat(formData.serviceValue) || 0,
        deadline: formData.deadline,
        payment_method: formData.paymentMethod,
        scope_items: formData.scopeItems,
        observations: formData.observations,
        status: 'draft'
      };

      let proposalId = id;
      if (!id) {
        const { data } = await supabase.from('solution_proposals').insert(payload).select().single();
        if (data) proposalId = data.id;
      } else {
        await supabase.from('solution_proposals').update(payload).eq('id', id);
      }

      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-proposal', {
        body: { proposalData: { ...formData, serviceValue: parseFloat(formData.serviceValue) || 0 } }
      });

      if (functionError) throw functionError;

      const proposalText = functionData.proposalText;

      await supabase.from('solution_proposals').update({
        proposal_text: proposalText,
        proposal_generated_at: new Date().toISOString(),
        status: 'completed'
      }).eq('id', proposalId);

      clearState();

      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        type: 'PROPOSAL_GENERATED',
        message: `Proposta comercial gerada para ${formData.companyName}`,
        entity_type: 'solution_proposal',
        entity_id: proposalId
      });

      navigate(`/solucoes/proposta/${proposalId}`, { replace: true });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar proposta',
        description: error.message || 'Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout title="Nova Proposta">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/solucoes/proposta')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {showResumeBanner && (
          <ResumeSessionBanner
            title="Continuar proposta?"
            description={`Você estava na etapa ${getSavedState()?.currentStep || 1} de 2`}
            onResume={handleResumeSession}
            onStartFresh={handleStartFresh}
          />
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Etapa {step} de 2</span>
            <span className="text-muted-foreground">{Math.round((step / 2) * 100)}%</span>
          </div>
          <Progress value={(step / 2) * 100} className="h-2" />
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Dados da Proposta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da empresa *</Label>
                  <Input
                    id="companyName"
                    placeholder="Ex: Padaria do João"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nome do responsável</Label>
                  <Input
                    id="contactName"
                    placeholder="Ex: João Silva"
                    value={formData.contactName}
                    onChange={(e) => updateFormData('contactName', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceOffered">Serviço oferecido *</Label>
                <Input
                  id="serviceOffered"
                  placeholder="Ex: Criação de site institucional"
                  value={formData.serviceOffered}
                  onChange={(e) => updateFormData('serviceOffered', e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serviceValue">Valor do serviço (R$) *</Label>
                  <Input
                    id="serviceValue"
                    type="number"
                    placeholder="Ex: 2500"
                    value={formData.serviceValue}
                    onChange={(e) => updateFormData('serviceValue', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo de entrega</Label>
                  <Input
                    id="deadline"
                    placeholder="Ex: 15 dias úteis"
                    value={formData.deadline}
                    onChange={(e) => updateFormData('deadline', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Forma de pagamento</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={formData.paymentMethod === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFormData('paymentMethod', option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={saveDraft}
                  disabled={isLoading || !formData.companyName}
                  className="gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar rascunho
                </Button>
                <Button
                  onClick={() => handleStepChange(2)}
                  disabled={!formData.companyName || !formData.serviceOffered || !formData.serviceValue}
                  className="flex-1 gap-2"
                >
                  Avançar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Escopo do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>O que está incluído?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {SCOPE_OPTIONS.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={formData.scopeItems.includes(item)}
                        onCheckedChange={() => toggleScopeItem(item)}
                      />
                      <Label htmlFor={item} className="text-sm font-normal cursor-pointer">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações adicionais</Label>
                <Textarea
                  id="observations"
                  placeholder="Detalhes específicos sobre o projeto..."
                  value={formData.observations}
                  onChange={(e) => updateFormData('observations', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleStepChange(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  onClick={generateProposal}
                  disabled={isGenerating || formData.scopeItems.length === 0}
                  className="flex-1 gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando proposta...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar proposta
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
