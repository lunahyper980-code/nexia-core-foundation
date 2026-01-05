import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowLeft, ArrowRight, Loader2, Building2, MapPin, Users, Package, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useDemoModeForForms } from '@/hooks/useDemoModeForForms';
import { useModuleState } from '@/hooks/useModuleState';

interface FormData {
  companyName: string;
  segment: string;
  cityState: string;
  targetAudience: string;
  mainProductService: string;
  businessDifferential: string;
  objectives: string[];
  observations: string;
}

const OBJECTIVES = [
  { id: 'attract', label: 'Atrair clientes', description: 'Aumentar a visibilidade e atrair novos clientes' },
  { id: 'trust', label: 'Passar confiança', description: 'Transmitir credibilidade e segurança' },
  { id: 'professionalize', label: 'Profissionalizar marca', description: 'Elevar o nível de apresentação da marca' },
  { id: 'organize', label: 'Organizar presença digital', description: 'Estruturar a comunicação online' },
];

export default function PosicionamentoWizard() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const { isDemoMode, getDemoModeFlag } = useDemoModeForForms();
  const { getSavedState, saveStep, saveFormData, clearState } = useModuleState('posicionamento');
  
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    segment: '',
    cityState: '',
    targetAudience: '',
    mainProductService: '',
    businessDifferential: '',
    objectives: [],
    observations: '',
  });

  // Restore state on mount
  useEffect(() => {
    const saved = getSavedState();
    if (saved) {
      if (saved.currentStep) setStep(saved.currentStep);
      if (saved.formData) setFormData(prev => ({ ...prev, ...saved.formData }));
    }
  }, [getSavedState]);

  const handleStepChange = (newStep: number) => {
    setStep(newStep);
    saveStep(newStep);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      saveFormData(updated);
      return updated;
    });
  };

  const toggleObjective = (objectiveId: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        objectives: prev.objectives.includes(objectiveId)
          ? prev.objectives.filter(id => id !== objectiveId)
          : [...prev.objectives, objectiveId]
      };
      saveFormData(updated);
      return updated;
    });
  };

  const canAdvanceStep1 = isDemoMode || formData.companyName.trim().length > 0;
  const canAdvanceStep2 = isDemoMode || formData.objectives.length > 0;

  const handleGenerate = async () => {
    if (!workspace?.id || !user?.id) {
      toast.error('Erro ao identificar workspace');
      return;
    }

    setIsGenerating(true);

    try {
      // Save positioning record first
      const { data: positioning, error: insertError } = await supabase
        .from('digital_positionings')
        .insert({
          workspace_id: workspace.id,
          created_by_user_id: user.id,
          company_name: formData.companyName,
          segment: formData.segment,
          city_state: formData.cityState,
          target_audience: formData.targetAudience,
          main_product_service: formData.mainProductService,
          business_differential: formData.businessDifferential,
          positioning_objectives: formData.objectives,
          observations: formData.observations,
          status: 'generating',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate positioning with AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-positioning', {
        body: { 
          positioningData: formData,
          demoMode: getDemoModeFlag()
        }
      });

      if (aiError) throw aiError;

      // Update with generated content
      const { error: updateError } = await supabase
        .from('digital_positionings')
        .update({
          generated_positioning: aiData.positioning,
          generated_at: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', positioning.id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        user_id: user.id,
        type: 'positioning_created',
        message: `Posicionamento digital criado para ${formData.companyName}`,
        entity_type: 'positioning',
        entity_id: positioning.id,
      });

      toast.success('Posicionamento gerado com sucesso!');
      navigate(`/solucoes/posicionamento/${positioning.id}`);

    } catch (error: any) {
      console.error('Error generating positioning:', error);
      toast.error(error.message || 'Erro ao gerar posicionamento');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout title="Criar Posicionamento">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/solucoes/posicionamento')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Criar Posicionamento</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Etapa {step} de 2
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Company Data */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Preencha as informações básicas da empresa para criar o posicionamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da empresa *</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Studio Maria Beleza"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="segment">Segmento / Nicho</Label>
                  <Input
                    id="segment"
                    placeholder="Ex: Beleza e Estética"
                    value={formData.segment}
                    onChange={(e) => updateField('segment', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityState" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Cidade / Estado
                  </Label>
                  <Input
                    id="cityState"
                    placeholder="Ex: São Paulo, SP"
                    value={formData.cityState}
                    onChange={(e) => updateField('cityState', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Público-alvo
                </Label>
                <Input
                  id="targetAudience"
                  placeholder="Ex: Mulheres de 25 a 45 anos que buscam cuidados com a pele"
                  value={formData.targetAudience}
                  onChange={(e) => updateField('targetAudience', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainProductService" className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Principal serviço ou produto
                </Label>
                <Input
                  id="mainProductService"
                  placeholder="Ex: Tratamentos faciais personalizados"
                  value={formData.mainProductService}
                  onChange={(e) => updateField('mainProductService', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDifferential" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Diferencial do negócio
                </Label>
                <Textarea
                  id="businessDifferential"
                  placeholder="Ex: Atendimento personalizado com produtos veganos e técnicas europeias"
                  value={formData.businessDifferential}
                  onChange={(e) => updateField('businessDifferential', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => handleStepChange(2)} 
                  disabled={!canAdvanceStep1}
                  className="gap-2"
                >
                  Avançar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Objectives */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Objetivo do Posicionamento
              </CardTitle>
              <CardDescription>
                Selecione os principais objetivos que a marca deseja alcançar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {OBJECTIVES.map((objective) => (
                  <div
                    key={objective.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      formData.objectives.includes(objective.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleObjective(objective.id)}
                  >
                    <Checkbox
                      checked={formData.objectives.includes(objective.id)}
                      onCheckedChange={() => toggleObjective(objective.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{objective.label}</p>
                      <p className="text-sm text-muted-foreground">{objective.description}</p>
                    </div>
                    {formData.objectives.includes(objective.id) && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações (opcional)</Label>
                <Textarea
                  id="observations"
                  placeholder="Informações adicionais que possam ajudar a criar um posicionamento mais preciso..."
                  value={formData.observations}
                  onChange={(e) => updateField('observations', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => handleStepChange(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  disabled={!canAdvanceStep2 || isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar posicionamento
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-full max-w-sm mx-4">
              <CardContent className="flex flex-col items-center py-8">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <Loader2 className="h-6 w-6 text-primary animate-spin absolute -bottom-1 -right-1" />
                </div>
                <h3 className="text-lg font-semibold mt-4">Gerando posicionamento...</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  A IA está criando um posicionamento profissional para {formData.companyName}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
