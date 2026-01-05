import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, ArrowRight, Loader2, Building2, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateBusinessInput, validateShortInput, sanitizeInput } from '@/lib/inputValidation';
import { useDemoModeForForms } from '@/hooks/useDemoModeForForms';

interface FormData {
  businessName: string;
  segment: string;
  mainChannel: string;
  frequency: string;
  objective: string;
  targetAudience: string;
}

export default function AutoridadeWizard() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const { isDemoMode, validateRequired, getDemoModeFlag } = useDemoModeForForms();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    segment: '',
    mainChannel: '',
    frequency: '',
    objective: '',
    targetAudience: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = (): boolean => {
    // In demo mode, skip all validations
    if (isDemoMode) return true;

    const newErrors: Record<string, string> = {};

    const nameValidation = validateShortInput(formData.businessName, 'Nome do negócio', 3);
    if (!nameValidation.valid) newErrors.businessName = nameValidation.error!;

    const segmentValidation = validateBusinessInput(formData.segment, 'Segmento', 5);
    if (!segmentValidation.valid) newErrors.segment = segmentValidation.error!;

    if (!formData.mainChannel) newErrors.mainChannel = 'Selecione o canal principal.';
    if (!formData.frequency) newErrors.frequency = 'Selecione a frequência.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    // In demo mode, skip all validations
    if (isDemoMode) return true;

    const newErrors: Record<string, string> = {};

    if (!formData.objective) newErrors.objective = 'Selecione o objetivo.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdvanceStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleGenerate = async () => {
    if (!validateStep2()) return;
    if (!workspace?.id || !user?.id) {
      toast.error('Erro ao identificar workspace');
      return;
    }

    setIsGenerating(true);

    try {
      const sanitizedData = {
        businessName: sanitizeInput(formData.businessName),
        segment: sanitizeInput(formData.segment),
        mainChannel: formData.mainChannel,
        frequency: formData.frequency,
        objective: formData.objective,
        targetAudience: sanitizeInput(formData.targetAudience),
      };

      // Save record first
      const { data: strategy, error: insertError } = await supabase
        .from('authority_strategies')
        .insert({
          workspace_id: workspace.id,
          created_by_user_id: user.id,
          business_name: sanitizedData.businessName,
          segment: sanitizedData.segment,
          main_channel: sanitizedData.mainChannel,
          frequency: sanitizedData.frequency,
          objective: sanitizedData.objective,
          target_audience: sanitizedData.targetAudience,
          status: 'generating',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate with AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-authority-strategy', {
        body: {
          ...sanitizedData,
          demoMode: getDemoModeFlag()
        }
      });

      if (aiError) throw aiError;

      if (!aiData.success) {
        throw new Error(aiData.error || 'Erro ao gerar estratégia');
      }

      // Update with generated content
      const { error: updateError } = await supabase
        .from('authority_strategies')
        .update({
          generated_content: JSON.stringify(aiData.data),
          generated_at: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', strategy.id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        user_id: user.id,
        type: 'authority_strategy_created',
        message: `Estratégia de autoridade criada para ${sanitizedData.businessName}`,
        entity_type: 'authority_strategy',
        entity_id: strategy.id,
      });

      toast.success('Estratégia de autoridade gerada com sucesso!');
      navigate(`/solucoes/autoridade/${strategy.id}`);

    } catch (error: any) {
      console.error('Error generating authority strategy:', error);
      toast.error(error.message || 'Erro ao gerar estratégia de autoridade');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout title="Criar Estratégia de Autoridade">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/solucoes/autoridade')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" />
              <h1 className="text-xl font-bold">Criar Estratégia de Autoridade</h1>
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
                s <= step ? 'bg-emerald-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-500" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Preencha as informações do negócio para criar a estratégia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nome do negócio *</Label>
                <Input
                  id="businessName"
                  placeholder="Ex: Studio Ana Melo"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  className={errors.businessName ? 'border-destructive' : ''}
                />
                {errors.businessName && <p className="text-sm text-destructive">{errors.businessName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment">Segmento *</Label>
                <Input
                  id="segment"
                  placeholder="Ex: Beleza e estética para mulheres executivas"
                  value={formData.segment}
                  onChange={(e) => updateField('segment', e.target.value)}
                  className={errors.segment ? 'border-destructive' : ''}
                />
                {errors.segment && <p className="text-sm text-destructive">{errors.segment}</p>}
              </div>

              <div className="space-y-2">
                <Label>Canal principal *</Label>
                <Select value={formData.mainChannel} onValueChange={(v) => updateField('mainChannel', v)}>
                  <SelectTrigger className={errors.mainChannel ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione o canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
                {errors.mainChannel && <p className="text-sm text-destructive">{errors.mainChannel}</p>}
              </div>

              <div className="space-y-2">
                <Label>Frequência desejada de presença *</Label>
                <Select value={formData.frequency} onValueChange={(v) => updateField('frequency', v)}>
                  <SelectTrigger className={errors.frequency ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa (1-2x por semana)</SelectItem>
                    <SelectItem value="media">Média (3-4x por semana)</SelectItem>
                    <SelectItem value="alta">Alta (diariamente)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.frequency && <p className="text-sm text-destructive">{errors.frequency}</p>}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleAdvanceStep} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  Avançar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Objective */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-500" />
                Objetivo de Autoridade
              </CardTitle>
              <CardDescription>
                Defina o objetivo principal da estratégia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Objetivo principal *</Label>
                <Select value={formData.objective} onValueChange={(v) => updateField('objective', v)}>
                  <SelectTrigger className={errors.objective ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reconhecimento">Ser reconhecido</SelectItem>
                    <SelectItem value="confianca">Gerar confiança</SelectItem>
                    <SelectItem value="engajamento">Aumentar engajamento</SelectItem>
                  </SelectContent>
                </Select>
                {errors.objective && <p className="text-sm text-destructive">{errors.objective}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Público-alvo principal (opcional)
                </Label>
                <Input
                  id="targetAudience"
                  placeholder="Ex: Mulheres 25-45 anos, empreendedoras"
                  value={formData.targetAudience}
                  onChange={(e) => updateField('targetAudience', e.target.value)}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar estratégia
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
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Award className="h-8 w-8 text-emerald-500 animate-pulse" />
                  </div>
                  <Loader2 className="h-6 w-6 text-emerald-500 animate-spin absolute -bottom-1 -right-1" />
                </div>
                <h3 className="text-lg font-semibold mt-4">Gerando estratégia...</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  A IA está criando uma estratégia de autoridade para {formData.businessName}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
