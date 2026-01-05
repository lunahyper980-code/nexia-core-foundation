import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, ArrowRight, Loader2, Building2, Sparkles, Palette, ListChecks, CheckCircle2, FileText, ExternalLink, Download, Copy, Check, MessageSquare, Lightbulb, Image } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { validateShortInput, validateBusinessInput, sanitizeInput } from '@/lib/inputValidation';
import { useDemoModeForForms } from '@/hooks/useDemoModeForForms';

interface FormData {
  projectName: string;
  projectType: string;
  targetAudience: string;
  mainObjective: string;
  brandStyle: string;
  brandFeeling: string;
  preferredColors: string[];
  visualNotes: string;
  secondaryText: string;
}

interface IdentityContent {
  descricao_identidade: string;
  prompt_logo: string;
  tipografia_sugerida: string;
  paleta_cores: string | Array<{ cor: string; significado: string }> | any;
  logo_url?: string;
}

// Helper to safely render paleta_cores regardless of format
const renderPaletaCores = (paleta: any): string => {
  if (typeof paleta === 'string') return paleta;
  if (Array.isArray(paleta)) {
    return paleta.map((item: any) => {
      if (typeof item === 'string') return item;
      if (item.cor && item.significado) return `${item.cor} - ${item.significado}`;
      if (item.cor) return item.cor;
      return JSON.stringify(item);
    }).join('\n');
  }
  if (typeof paleta === 'object' && paleta !== null) {
    return Object.entries(paleta).map(([key, value]) => `${key}: ${value}`).join('\n');
  }
  return String(paleta || '');
};

const TOTAL_STEPS = 4;

const COLOR_PALETTE = [
  { name: 'Azul Navy', color: '#1E3A5F', textColor: 'white' },
  { name: 'Verde Esmeralda', color: '#047857', textColor: 'white' },
  { name: 'Roxo Violeta', color: '#7C3AED', textColor: 'white' },
  { name: 'Rosa Pink', color: '#EC4899', textColor: 'white' },
  { name: 'Laranja Vibrante', color: '#EA580C', textColor: 'white' },
  { name: 'Amarelo Ouro', color: '#CA8A04', textColor: 'black' },
  { name: 'Vermelho Intenso', color: '#DC2626', textColor: 'white' },
  { name: 'Cinza Grafite', color: '#374151', textColor: 'white' },
  { name: 'Bege Neutro', color: '#D4C4A8', textColor: 'black' },
  { name: 'Verde Menta', color: '#10B981', textColor: 'white' },
  { name: 'Azul Céu', color: '#0EA5E9', textColor: 'white' },
  { name: 'Coral', color: '#F97316', textColor: 'white' },
];

export default function KitLancamentoWizard() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const { isDemoMode, getDemoModeFlag } = useDemoModeForForms();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingIdentity, setIsGeneratingIdentity] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [identityContent, setIdentityContent] = useState<IdentityContent | null>(null);
  const [launchKitId, setLaunchKitId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    projectType: '',
    targetAudience: '',
    mainObjective: '',
    brandStyle: '',
    brandFeeling: '',
    preferredColors: [],
    visualNotes: '',
    secondaryText: '',
  });

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleColor = (colorName: string) => {
    setFormData(prev => {
      const colors = prev.preferredColors;
      if (colors.includes(colorName)) {
        return { ...prev, preferredColors: colors.filter(c => c !== colorName) };
      }
      if (colors.length >= 3) {
        toast.error('Selecione no máximo 3 cores');
        return prev;
      }
      return { ...prev, preferredColors: [...colors, colorName] };
    });
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadLogo = async (logoUrl: string) => {
    try {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logo-${formData.projectName.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Logo baixado com sucesso!');
    } catch (error) {
      console.error('Error downloading logo:', error);
      toast.error('Erro ao baixar logo');
    }
  };

  const CopyButton = ({ text, field, label }: { text: string; field: string; label?: string }) => (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => handleCopy(text, field)} 
      className="gap-2 h-8"
    >
      {copiedField === field ? (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-600 text-xs">Copiado!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span className="text-xs">{label || 'Copiar'}</span>
        </>
      )}
    </Button>
  );

  const validateStep1 = (): boolean => {
    // In demo mode, skip all validations
    if (isDemoMode) return true;

    const newErrors: Record<string, string> = {};

    const nameValidation = validateShortInput(formData.projectName, 'Nome do projeto', 3);
    if (!nameValidation.valid) newErrors.projectName = nameValidation.error!;

    if (!formData.projectType) newErrors.projectType = 'Selecione o tipo de projeto.';

    const audienceValidation = validateBusinessInput(formData.targetAudience, 'Público-alvo', 5);
    if (!audienceValidation.valid) newErrors.targetAudience = audienceValidation.error!;

    const objectiveValidation = validateBusinessInput(formData.mainObjective, 'Objetivo', 10);
    if (!objectiveValidation.valid) newErrors.mainObjective = objectiveValidation.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    // In demo mode, skip all validations
    if (isDemoMode) return true;

    const newErrors: Record<string, string> = {};

    if (!formData.brandStyle) newErrors.brandStyle = 'Selecione o estilo desejado.';
    if (!formData.brandFeeling) newErrors.brandFeeling = 'Selecione a sensação da marca.';
    if (formData.preferredColors.length === 0) newErrors.preferredColors = 'Selecione pelo menos uma cor.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateLaunchStructure = async () => {
    if (!validateStep1()) return;
    if (!workspace?.id || !user?.id) {
      toast.error('Erro ao identificar workspace');
      return;
    }

    setIsGenerating(true);

    try {
      const sanitizedData = {
        businessName: sanitizeInput(formData.projectName),
        businessType: formData.projectType,
        segment: sanitizeInput(formData.targetAudience),
        objective: sanitizeInput(formData.mainObjective),
        mainChannel: 'instagram',
        deadline: '14_dias',
        urgency: 'medio',
      };

      const { data: launchKit, error: insertError } = await supabase
        .from('launch_kits')
        .insert({
          workspace_id: workspace.id,
          created_by_user_id: user.id,
          business_name: sanitizedData.businessName,
          business_type: sanitizedData.businessType,
          segment: sanitizedData.segment,
          objective: sanitizedData.objective,
          project_type: formData.projectType,
          target_audience: formData.targetAudience,
          status: 'generating',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setLaunchKitId(launchKit.id);

      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-launch-kit', {
        body: {
          ...sanitizedData,
          demoMode: getDemoModeFlag()
        }
      });

      if (aiError) throw aiError;

      if (!aiData.success) {
        throw new Error(aiData.error || 'Erro ao gerar estrutura');
      }

      setGeneratedContent(aiData.data);

      await supabase
        .from('launch_kits')
        .update({
          generated_content: JSON.stringify(aiData.data),
          generated_at: new Date().toISOString(),
          status: 'draft',
        })
        .eq('id', launchKit.id);

      toast.success('Estrutura de lançamento gerada!');
      setStep(2);

    } catch (error: any) {
      console.error('Error generating launch structure:', error);
      toast.error(error.message || 'Erro ao gerar estrutura');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateIdentityAndLogo = async () => {
    if (!validateStep3()) return;
    if (!launchKitId) {
      toast.error('Kit não encontrado');
      return;
    }

    setIsGeneratingIdentity(true);

    try {
      const colorsText = formData.preferredColors.join(', ');
      
      const { data: identityResult, error: identityError } = await supabase.functions.invoke('generate-launch-logo', {
        body: {
          brandName: formData.projectName,
          brandStyle: formData.brandStyle,
          brandFeeling: formData.brandFeeling,
          preferredColors: colorsText,
          visualNotes: formData.visualNotes,
          secondaryText: formData.secondaryText,
          generateImage: true,
        }
      });

      if (identityError) throw identityError;

      if (!identityResult.success) {
        throw new Error(identityResult.error || 'Erro ao gerar identidade');
      }

      setIdentityContent(identityResult.data);

      // Update kit with identity and logo data
      await supabase
        .from('launch_kits')
        .update({
          brand_style: formData.brandStyle,
          brand_feeling: formData.brandFeeling,
          preferred_colors: colorsText,
          visual_notes: formData.visualNotes,
          logo_concept: identityResult.data.descricao_identidade,
          logo_usage_guidelines: identityResult.data.prompt_logo,
          logo_url: identityResult.data.logo_url || null,
        })
        .eq('id', launchKitId);

      toast.success(identityResult.data.logo_url 
        ? 'Identidade e logo gerados com sucesso!' 
        : 'Identidade gerada! Logo não disponível no momento.');
      setStep(4);

    } catch (error: any) {
      console.error('Error generating identity:', error);
      toast.error(error.message || 'Erro ao gerar identidade');
    } finally {
      setIsGeneratingIdentity(false);
    }
  };

  const handleSkipIdentity = () => {
    setStep(4);
  };

  const handleFinish = async () => {
    if (!launchKitId) return;

    try {
      await supabase
        .from('launch_kits')
        .update({ status: 'completed' })
        .eq('id', launchKitId);

      await supabase.from('activity_logs').insert({
        workspace_id: workspace!.id,
        user_id: user!.id,
        type: 'launch_kit_created',
        message: `Kit de lançamento criado para ${formData.projectName}`,
        entity_type: 'launch_kit',
        entity_id: launchKitId,
      });

      toast.success('Kit de lançamento concluído!');
      navigate(`/solucoes/kit-lancamento/${launchKitId}`);
    } catch (error) {
      console.error('Error finishing kit:', error);
      toast.error('Erro ao finalizar kit');
    }
  };

  const stepTitles = [
    { icon: Building2, title: 'Contexto', desc: 'Informações do projeto' },
    { icon: Sparkles, title: 'Estrutura', desc: 'Plano de lançamento' },
    { icon: Palette, title: 'Identidade', desc: 'Visual e logo' },
    { icon: ListChecks, title: 'Conclusão', desc: 'Resumo final' },
  ];

  const getSelectedColors = () => {
    return COLOR_PALETTE.filter(c => formData.preferredColors.includes(c.name));
  };

  return (
    <AppLayout title="Criar Kit de Lançamento">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/solucoes/kit-lancamento')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-violet-500" />
              <h1 className="text-xl font-bold">Criar Kit de Lançamento</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Etapa {step} de {TOTAL_STEPS}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2">
          {stepTitles.map((s, i) => (
            <div key={i} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-violet-500' : 'bg-muted'
                }`}
              />
              <div className="mt-2 hidden sm:flex items-center gap-1.5">
                <s.icon className={`h-3.5 w-3.5 ${i + 1 <= step ? 'text-violet-500' : 'text-muted-foreground'}`} />
                <span className={`text-xs ${i + 1 <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Context */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-violet-500" />
                Contexto do Projeto
              </CardTitle>
              <CardDescription>
                Preencha as informações para criar um plano de lançamento personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Nome do projeto *</Label>
                <Input
                  id="projectName"
                  placeholder="Ex: Boutique Maria Bonita"
                  value={formData.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                  className={errors.projectName ? 'border-destructive' : ''}
                />
                {errors.projectName && <p className="text-sm text-destructive">{errors.projectName}</p>}
              </div>

              <div className="space-y-2">
                <Label>Tipo de projeto *</Label>
                <Select value={formData.projectType} onValueChange={(v) => updateField('projectType', v)}>
                  <SelectTrigger className={errors.projectType ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negocio_local">Negócio local</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                    <SelectItem value="produto_digital">Produto digital</SelectItem>
                    <SelectItem value="marca_pessoal">Marca pessoal</SelectItem>
                  </SelectContent>
                </Select>
                {errors.projectType && <p className="text-sm text-destructive">{errors.projectType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Público-alvo *</Label>
                <Textarea
                  id="targetAudience"
                  placeholder="Ex: Mulheres de 25 a 45 anos interessadas em moda casual e elegante"
                  value={formData.targetAudience}
                  onChange={(e) => updateField('targetAudience', e.target.value)}
                  className={errors.targetAudience ? 'border-destructive' : ''}
                  rows={2}
                />
                {errors.targetAudience && <p className="text-sm text-destructive">{errors.targetAudience}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainObjective">Objetivo principal do lançamento *</Label>
                <Textarea
                  id="mainObjective"
                  placeholder="Ex: Lançar a loja no Instagram, criar reconhecimento local e fazer as primeiras 50 vendas"
                  value={formData.mainObjective}
                  onChange={(e) => updateField('mainObjective', e.target.value)}
                  className={errors.mainObjective ? 'border-destructive' : ''}
                  rows={3}
                />
                {errors.mainObjective && <p className="text-sm text-destructive">{errors.mainObjective}</p>}
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleGenerateLaunchStructure} 
                  disabled={isGenerating}
                  className="gap-2 bg-violet-500 hover:bg-violet-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando estrutura...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar Estrutura de Lançamento
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Structure Review */}
        {step === 2 && generatedContent && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  Estrutura do Kit de Lançamento
                </CardTitle>
                <CardDescription>
                  Revise a estrutura de lançamento gerada pela IA antes de continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-violet-500/5 rounded-lg border border-violet-500/20">
                    <h3 className="font-medium text-violet-600 mb-2 flex items-center gap-2">
                      <Rocket className="h-4 w-4" />
                      Tipo de Lançamento
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {formData.projectType?.replace('_', ' ')} - {formData.targetAudience?.slice(0, 60)}...
                    </p>
                  </div>
                  <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <h3 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Objetivo Principal
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formData.mainObjective}
                    </p>
                  </div>
                </div>

                {generatedContent.estrutura_lancamento && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <h3 className="font-medium mb-2">Visão Geral do Lançamento</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{generatedContent.estrutura_lancamento}</p>
                  </div>
                )}

                {generatedContent.sequencia_acoes && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Fases do Lançamento</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      {generatedContent.sequencia_acoes.pre_lancamento && (
                        <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                          <h4 className="font-medium text-amber-600 mb-3 text-sm">🎯 Pré-Lançamento</h4>
                          <ul className="space-y-2">
                            {generatedContent.sequencia_acoes.pre_lancamento.map((a: string, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {generatedContent.sequencia_acoes.durante && (
                        <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                          <h4 className="font-medium text-green-600 mb-3 text-sm">🚀 Durante o Lançamento</h4>
                          <ul className="space-y-2">
                            {generatedContent.sequencia_acoes.durante.map((a: string, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {generatedContent.sequencia_acoes.pos_lancamento && (
                        <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                          <h4 className="font-medium text-blue-600 mb-3 text-sm">💡 Pós-Lançamento</h4>
                          <ul className="space-y-2">
                            {generatedContent.sequencia_acoes.pos_lancamento.map((a: string, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {generatedContent.ideia_oferta && (
                  <div className="p-4 bg-pink-500/5 rounded-lg border border-pink-500/20">
                    <h3 className="font-medium text-pink-600 mb-2">💎 Oferta Principal Sugerida</h3>
                    <p className="text-sm text-muted-foreground">{generatedContent.ideia_oferta}</p>
                  </div>
                )}

                {generatedContent.mensagens_divulgacao && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Gatilhos e Mensagens</h3>
                    <div className="grid gap-3 md:grid-cols-3">
                      {generatedContent.mensagens_divulgacao.teaser && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-xs font-medium text-muted-foreground">Teaser</span>
                          <p className="text-xs mt-1">{generatedContent.mensagens_divulgacao.teaser}</p>
                        </div>
                      )}
                      {generatedContent.mensagens_divulgacao.lancamento && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-xs font-medium text-muted-foreground">Lançamento</span>
                          <p className="text-xs mt-1">{generatedContent.mensagens_divulgacao.lancamento}</p>
                        </div>
                      )}
                      {generatedContent.mensagens_divulgacao.urgencia && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-xs font-medium text-muted-foreground">Urgência</span>
                          <p className="text-xs mt-1">{generatedContent.mensagens_divulgacao.urgencia}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {generatedContent.checklist_execucao && (
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-violet-500" />
                      Checklist de Execução
                    </h3>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {generatedContent.checklist_execucao.map((item: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full border-2 border-violet-500/50 flex items-center justify-center shrink-0">
                            <span className="text-xs text-violet-500">{i + 1}</span>
                          </div>
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Contexto
              </Button>
              <Button onClick={() => setStep(3)} className="gap-2 bg-violet-500 hover:bg-violet-600">
                Avançar para Identidade
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Visual Identity */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-violet-500" />
                  Identidade do Lançamento
                </CardTitle>
                <CardDescription>
                  Configure o estilo visual para gerar a identidade e o logo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                  <p className="text-sm text-violet-700">
                    ✨ A IA vai gerar automaticamente um logotipo profissional baseado nas suas escolhas!
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandName">Nome principal da marca</Label>
                  <Input
                    id="brandName"
                    value={formData.projectName}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryText">Texto secundário / Slogan (opcional)</Label>
                  <Input
                    id="secondaryText"
                    placeholder="Ex: Moda que transforma, Sua parceira digital"
                    value={formData.secondaryText}
                    onChange={(e) => updateField('secondaryText', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estilo da logo *</Label>
                  <Select value={formData.brandStyle} onValueChange={(v) => updateField('brandStyle', v)}>
                    <SelectTrigger className={errors.brandStyle ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione o estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moderno">Moderno</SelectItem>
                      <SelectItem value="minimalista">Minimalista</SelectItem>
                      <SelectItem value="premium">Premium / Luxo</SelectItem>
                      <SelectItem value="criativo">Criativo / Artístico</SelectItem>
                      <SelectItem value="tecnologico">Tecnológico</SelectItem>
                      <SelectItem value="organico">Orgânico / Natural</SelectItem>
                      <SelectItem value="vintage">Vintage / Retrô</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.brandStyle && <p className="text-sm text-destructive">{errors.brandStyle}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Sensação da marca *</Label>
                  <Select value={formData.brandFeeling} onValueChange={(v) => updateField('brandFeeling', v)}>
                    <SelectTrigger className={errors.brandFeeling ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione a sensação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confianca">Confiança e Segurança</SelectItem>
                      <SelectItem value="autoridade">Autoridade e Expertise</SelectItem>
                      <SelectItem value="proximidade">Proximidade e Acolhimento</SelectItem>
                      <SelectItem value="inovacao">Inovação e Modernidade</SelectItem>
                      <SelectItem value="elegancia">Elegância e Sofisticação</SelectItem>
                      <SelectItem value="energia">Energia e Dinamismo</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.brandFeeling && <p className="text-sm text-destructive">{errors.brandFeeling}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Cores principais * (selecione até 3)</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggleColor(c.name)}
                        className={`relative p-2 rounded-lg border-2 transition-all ${
                          formData.preferredColors.includes(c.name)
                            ? 'border-violet-500 ring-2 ring-violet-500/30'
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                      >
                        <div
                          className="w-full aspect-square rounded-md mb-1"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-[10px] text-muted-foreground line-clamp-1">{c.name}</span>
                        {formData.preferredColors.includes(c.name) && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.preferredColors && <p className="text-sm text-destructive">{errors.preferredColors}</p>}
                  {formData.preferredColors.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">Selecionadas:</span>
                      {getSelectedColors().map(c => (
                        <Badge key={c.name} variant="outline" className="text-xs gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visualNotes">Observações adicionais (opcional)</Label>
                  <Textarea
                    id="visualNotes"
                    placeholder="Ex: Gostaria de algo mais feminino, com formas orgânicas, evitar cores escuras"
                    value={formData.visualNotes}
                    onChange={(e) => updateField('visualNotes', e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Generated Identity with Logo */}
                {identityContent && (
                  <div className="mt-6 space-y-4 pt-4 border-t">
                    <h3 className="font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      Identidade Gerada
                    </h3>

                    {/* Logo Generated */}
                    {identityContent.logo_url && (
                      <div className="p-4 bg-gradient-to-br from-violet-500/10 to-pink-500/10 rounded-lg border border-violet-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-violet-600 flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Logo Gerado
                          </h4>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownloadLogo(identityContent.logo_url!)}
                            className="gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Baixar PNG
                          </Button>
                        </div>
                        <div className="flex justify-center bg-white rounded-lg p-6 border">
                          <img 
                            src={identityContent.logo_url} 
                            alt="Logo gerado" 
                            className="max-w-[200px] max-h-[200px] object-contain"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 bg-violet-500/5 rounded-lg border border-violet-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-violet-600">Descrição da Identidade Visual</h4>
                        <CopyButton text={identityContent.descricao_identidade} field="identity_desc" />
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{identityContent.descricao_identidade}</p>
                    </div>

                    {identityContent.paleta_cores && (
                      <div className="p-4 bg-pink-500/5 rounded-lg border border-pink-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-pink-600">Paleta de Cores Sugerida</h4>
                          <CopyButton text={renderPaletaCores(identityContent.paleta_cores)} field="identity_colors" />
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{renderPaletaCores(identityContent.paleta_cores)}</p>
                      </div>
                    )}

                    {identityContent.tipografia_sugerida && (
                      <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-600">Tipografia Sugerida</h4>
                          <CopyButton text={identityContent.tipografia_sugerida} field="identity_font" />
                        </div>
                        <p className="text-sm text-muted-foreground">{identityContent.tipografia_sugerida}</p>
                      </div>
                    )}

                    <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-amber-600">🎨 Prompt para Gerar Logo (alternativo)</h4>
                        <CopyButton text={identityContent.prompt_logo} field="identity_prompt" label="Copiar Prompt" />
                      </div>
                      <p className="text-sm text-muted-foreground font-mono bg-muted/50 p-3 rounded">{identityContent.prompt_logo}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSkipIdentity}>
                      Pular esta etapa
                    </Button>
                    <Button 
                      onClick={identityContent ? () => setStep(4) : handleGenerateIdentityAndLogo} 
                      disabled={isGeneratingIdentity}
                      className="gap-2 bg-violet-500 hover:bg-violet-600"
                    >
                      {isGeneratingIdentity ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Gerando identidade e logo...
                        </>
                      ) : identityContent ? (
                        <>
                          Continuar para Conclusão
                          <ArrowRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Avançar e Gerar Logo
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Conclusion */}
        {step === 4 && (
          <div className="space-y-4">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Resumo do Kit de Lançamento
                </CardTitle>
                <CardDescription>
                  Revise todas as informações antes de finalizar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resumo do Projeto */}
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-violet-500" />
                    Resumo do Projeto
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Nome do Projeto</span>
                      <p className="font-medium">{formData.projectName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Tipo</span>
                      <p className="font-medium capitalize">{formData.projectType?.replace('_', ' ')}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs text-muted-foreground">Objetivo</span>
                      <p className="text-sm text-muted-foreground">{formData.mainObjective}</p>
                    </div>
                  </div>
                </div>

                {/* Estrutura de Lançamento COMPLETA */}
                {generatedContent && (
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      Estrutura de Lançamento Gerada
                    </h3>

                    {generatedContent.sequencia_acoes && (
                      <div className="grid gap-4 md:grid-cols-3">
                        {generatedContent.sequencia_acoes.pre_lancamento && (
                          <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                            <h4 className="font-medium text-amber-600 mb-3 text-sm flex items-center gap-2">
                              🎯 Pré-Lançamento
                              <Badge variant="outline" className="text-[10px]">
                                {generatedContent.sequencia_acoes.pre_lancamento.length} ações
                              </Badge>
                            </h4>
                            <ul className="space-y-2">
                              {generatedContent.sequencia_acoes.pre_lancamento.map((a: string, i: number) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {generatedContent.sequencia_acoes.durante && (
                          <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                            <h4 className="font-medium text-green-600 mb-3 text-sm flex items-center gap-2">
                              🚀 Durante
                              <Badge variant="outline" className="text-[10px] border-green-500/30">
                                {generatedContent.sequencia_acoes.durante.length} ações
                              </Badge>
                            </h4>
                            <ul className="space-y-2">
                              {generatedContent.sequencia_acoes.durante.map((a: string, i: number) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {generatedContent.sequencia_acoes.pos_lancamento && (
                          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                            <h4 className="font-medium text-blue-600 mb-3 text-sm flex items-center gap-2">
                              💡 Pós-Lançamento
                              <Badge variant="outline" className="text-[10px] border-blue-500/30">
                                {generatedContent.sequencia_acoes.pos_lancamento.length} ações
                              </Badge>
                            </h4>
                            <ul className="space-y-2">
                              {generatedContent.sequencia_acoes.pos_lancamento.map((a: string, i: number) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {generatedContent.mensagens_divulgacao && (
                      <div className="p-4 bg-pink-500/5 rounded-lg border border-pink-500/20">
                        <h4 className="font-medium text-pink-600 mb-4 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Gatilhos e Mensagens de Divulgação
                        </h4>
                        <div className="grid gap-3 md:grid-cols-3">
                          {generatedContent.mensagens_divulgacao.teaser && (
                            <div className="p-3 bg-background rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs">Teaser</Badge>
                                <CopyButton text={generatedContent.mensagens_divulgacao.teaser} field="msg_teaser" />
                              </div>
                              <p className="text-sm text-muted-foreground">{generatedContent.mensagens_divulgacao.teaser}</p>
                            </div>
                          )}
                          {generatedContent.mensagens_divulgacao.lancamento && (
                            <div className="p-3 bg-background rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs border-green-500/30 text-green-600">Lançamento</Badge>
                                <CopyButton text={generatedContent.mensagens_divulgacao.lancamento} field="msg_lancamento" />
                              </div>
                              <p className="text-sm text-muted-foreground">{generatedContent.mensagens_divulgacao.lancamento}</p>
                            </div>
                          )}
                          {generatedContent.mensagens_divulgacao.urgencia && (
                            <div className="p-3 bg-background rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600">Urgência</Badge>
                                <CopyButton text={generatedContent.mensagens_divulgacao.urgencia} field="msg_urgencia" />
                              </div>
                              <p className="text-sm text-muted-foreground">{generatedContent.mensagens_divulgacao.urgencia}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {generatedContent.ideia_oferta && (
                      <div className="p-4 bg-violet-500/5 rounded-lg border border-violet-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-violet-600 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Oferta Principal Sugerida
                          </h4>
                          <CopyButton text={generatedContent.ideia_oferta} field="oferta" />
                        </div>
                        <p className="text-sm text-muted-foreground">{generatedContent.ideia_oferta}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Identidade Visual na Conclusão com Logo */}
                {identityContent ? (
                  <div className="p-4 bg-gradient-to-br from-violet-500/5 to-pink-500/5 rounded-lg border border-violet-500/20">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-violet-500" />
                      Identidade Visual
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Logo Preview */}
                      {identityContent.logo_url && (
                        <div className="flex flex-col items-center">
                          <div className="bg-white rounded-lg p-4 border shadow-sm mb-2">
                            <img 
                              src={identityContent.logo_url} 
                              alt="Logo gerado" 
                              className="w-32 h-32 object-contain"
                            />
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownloadLogo(identityContent.logo_url!)}
                            className="gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Baixar PNG
                          </Button>
                        </div>
                      )}

                      {/* Identity Info */}
                      <div className="flex-1 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <span className="text-xs text-muted-foreground">Nome da Marca</span>
                            <p className="font-medium">{formData.projectName}</p>
                            {formData.secondaryText && (
                              <p className="text-sm text-muted-foreground">{formData.secondaryText}</p>
                            )}
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Estilo Visual</span>
                            <p className="font-medium capitalize">{formData.brandStyle}</p>
                            <p className="text-sm text-muted-foreground capitalize">{formData.brandFeeling}</p>
                          </div>
                        </div>

                        {formData.preferredColors.length > 0 && (
                          <div>
                            <span className="text-xs text-muted-foreground mb-2 block">Cores Principais</span>
                            <div className="flex gap-2 flex-wrap">
                              {getSelectedColors().map(c => (
                                <div key={c.name} className="flex items-center gap-2 p-2 bg-background rounded-lg border">
                                  <div 
                                    className="w-6 h-6 rounded-md border"
                                    style={{ backgroundColor: c.color }}
                                  />
                                  <span className="text-xs">{c.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-muted-foreground">Status da Logo</span>
                              <p className="text-sm font-medium">
                                {identityContent.logo_url ? 'Logo gerado ✓' : 'Prompt disponível'}
                              </p>
                            </div>
                            <CopyButton 
                              text={identityContent.prompt_logo} 
                              field="conclusion_prompt" 
                              label="Copiar Prompt"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Identidade Visual</p>
                          <p className="text-sm text-muted-foreground">Não configurada</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                        Configurar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Próximos Passos */}
                <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                  <h3 className="font-medium text-blue-600 mb-3">📌 Próximos Passos Recomendados</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button 
                      onClick={() => navigate('/solucoes/criar-site')}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded hover:bg-muted transition-colors text-left"
                    >
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Criar site ou landing page</span>
                    </button>
                    <button 
                      onClick={() => navigate('/solucoes/criar-app')}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded hover:bg-muted transition-colors text-left"
                    >
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Desenvolver aplicativo</span>
                    </button>
                    <button 
                      onClick={() => navigate('/solucoes/posicionamento')}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded hover:bg-muted transition-colors text-left"
                    >
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Criar posicionamento digital</span>
                    </button>
                    <button 
                      onClick={() => navigate('/nexia-ai/planejamento/novo?mode=advanced')}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded hover:bg-muted transition-colors text-left"
                    >
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Avançar para planejamento completo</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTAs Finais */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Identidade
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/solucoes')} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Aplicar Soluções Digitais
                </Button>
                <Button onClick={handleFinish} className="gap-2 bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Finalizar Kit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlays */}
        {(isGenerating || isGeneratingIdentity) && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-full max-w-sm mx-4">
              <CardContent className="flex flex-col items-center py-8">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-violet-500/10 flex items-center justify-center">
                    {isGeneratingIdentity ? (
                      <Palette className="h-8 w-8 text-violet-500 animate-pulse" />
                    ) : (
                      <Rocket className="h-8 w-8 text-violet-500 animate-pulse" />
                    )}
                  </div>
                  <Loader2 className="h-6 w-6 text-violet-500 animate-spin absolute -bottom-1 -right-1" />
                </div>
                <h3 className="text-lg font-semibold mt-4">
                  {isGeneratingIdentity ? 'Gerando identidade e logo...' : 'Gerando estrutura de lançamento...'}
                </h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {isGeneratingIdentity 
                    ? `Criando identidade visual e logo para ${formData.projectName}`
                    : `A IA está criando um plano de lançamento para ${formData.projectName}`
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
