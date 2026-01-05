import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  Sparkles,
  Building2,
  Network
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDemoModeForForms } from '@/hooks/useDemoModeForForms';
import { useModuleState } from '@/hooks/useModuleState';

interface FormData {
  businessType: string;
  teamSize: string;
  contactChannels: string;
  timeWasteAreas: string;
  mainInternalProblem: string;
  organizationGoal: string;
}

const TEAM_SIZES = [
  'Só eu',
  '2-3 pessoas',
  '4-10 pessoas',
  '11-30 pessoas',
  '30+ pessoas'
];

const CONTACT_CHANNELS = [
  'WhatsApp',
  'Instagram',
  'Presencial',
  'Telefone',
  'E-mail',
  'Site'
];

export default function OrganizacaoWizard() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const { isDemoMode, getDemoModeFlag } = useDemoModeForForms();
  const { getSavedState, saveStep, saveFormData, clearState } = useModuleState('organizacao');
  
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    businessType: '',
    teamSize: '',
    contactChannels: '',
    timeWasteAreas: '',
    mainInternalProblem: '',
    organizationGoal: ''
  });

  // Restore state on mount
  useEffect(() => {
    const saved = getSavedState();
    if (saved) {
      if (saved.currentStep) setStep(saved.currentStep);
      if (saved.formData) {
        setFormData(prev => ({ ...prev, ...saved.formData }));
        if (saved.formData.contactChannels) {
          setSelectedChannels(saved.formData.contactChannels.split(', ').filter(Boolean));
        }
      }
    }
  }, [getSavedState]);

  const handleStepChange = (newStep: number) => {
    setStep(newStep);
    saveStep(newStep);
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      saveFormData(updated);
      return updated;
    });
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev => {
      const updated = prev.includes(channel) 
        ? prev.filter(c => c !== channel) 
        : [...prev, channel];
      const channelsStr = updated.join(', ');
      setFormData(current => {
        const newFormData = { ...current, contactChannels: channelsStr };
        saveFormData(newFormData);
        return newFormData;
      });
      return updated;
    });
  };

  const generateOrganization = async () => {
    if (!workspace?.id) return;
    setIsGenerating(true);

    try {
      // Save to database first
      const { data: orgData, error: insertError } = await supabase
        .from('process_organizations')
        .insert({
          workspace_id: workspace.id,
          business_type: formData.businessType,
          team_size: formData.teamSize,
          contact_channels: formData.contactChannels,
          time_waste_areas: formData.timeWasteAreas,
          main_internal_problem: formData.mainInternalProblem,
          organization_goal: formData.organizationGoal,
          status: 'draft'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate with AI
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-process-organization', {
        body: { 
          organizationData: formData,
          demoMode: getDemoModeFlag()
        }
      });

      if (functionError) throw functionError;

      // Update with generated content
      const { error: updateError } = await supabase
        .from('process_organizations')
        .update({
          operation_overview: functionData.operationOverview,
          process_problems: functionData.processProblems,
          ideal_flow: functionData.idealFlow,
          internal_organization: functionData.internalOrganization,
          recommended_routine: functionData.recommendedRoutine,
          attention_points: functionData.attentionPoints,
          generated_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', orgData.id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        type: 'PROCESS_ORG_GENERATED',
        message: `Organização de processos gerada para ${formData.businessType}`,
        entity_type: 'process_organization',
        entity_id: orgData.id
      });

      toast({
        title: 'Organização gerada!',
        description: 'A estrutura de processos foi criada com sucesso.'
      });

      navigate(`/solucoes/organizacao/${orgData.id}`);
    } catch (error: any) {
      console.error('Error generating organization:', error);
      toast({
        title: 'Erro ao gerar',
        description: error.message || 'Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const canAdvance = step === 1 
    ? formData.businessType && formData.teamSize && selectedChannels.length > 0
    : formData.timeWasteAreas && formData.mainInternalProblem && formData.organizationGoal;

  return (
    <AppLayout title="Nova Organização de Processos">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/solucoes/organizacao')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Etapa {step} de 2</span>
            <span className="text-muted-foreground">{Math.round((step / 2) * 100)}%</span>
          </div>
          <Progress value={(step / 2) * 100} className="h-2" />
        </div>

        {/* Step 1: Business Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                Informações do Negócio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessType">Tipo de negócio *</Label>
                <Input
                  id="businessType"
                  placeholder="Ex: Barbearia, Restaurante, Loja de roupas..."
                  value={formData.businessType}
                  onChange={(e) => updateFormData('businessType', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Quantas pessoas trabalham hoje? *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TEAM_SIZES.map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant={formData.teamSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFormData('teamSize', size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Como os atendimentos chegam? *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONTACT_CHANNELS.map((channel) => (
                    <Button
                      key={channel}
                      type="button"
                      variant={selectedChannels.includes(channel) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleChannel(channel)}
                    >
                      {channel}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleStepChange(2)}
                  disabled={!canAdvance}
                  className="flex-1 gap-2"
                >
                  Avançar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Problems & Goals */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-amber-500" />
                Problemas e Objetivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="timeWaste">Onde mais se perde tempo hoje? *</Label>
                <Textarea
                  id="timeWaste"
                  placeholder="Ex: Respondendo mensagens repetitivas, organizando pedidos manualmente, procurando informações..."
                  value={formData.timeWasteAreas}
                  onChange={(e) => updateFormData('timeWasteAreas', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainProblem">Principal problema interno percebido *</Label>
                <Textarea
                  id="mainProblem"
                  placeholder="Ex: Falta de padrão no atendimento, confusão sobre quem faz o quê, atrasos nas entregas..."
                  value={formData.mainInternalProblem}
                  onChange={(e) => updateFormData('mainInternalProblem', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Objetivo com a organização *</Label>
                <Textarea
                  id="goal"
                  placeholder="Ex: Ter uma rotina clara, definir responsabilidades, atender melhor os clientes..."
                  value={formData.organizationGoal}
                  onChange={(e) => updateFormData('organizationGoal', e.target.value)}
                  rows={3}
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
                  onClick={generateOrganization}
                  disabled={isGenerating || !canAdvance}
                  className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando organização...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar Organização de Processos
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