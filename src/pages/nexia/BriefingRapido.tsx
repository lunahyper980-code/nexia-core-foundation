import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Globe,
  AlertTriangle,
  Target,
  Loader2,
  ClipboardList
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { sanitizeInput } from "@/lib/inputValidation";
import { useModuleState } from '@/hooks/useModuleState';
import { ResumeSessionBanner } from '@/components/ResumeSessionBanner';

interface FormData {
  // Bloco 1 - Negócio
  companyName: string;
  location: string;
  segment: string;
  timeInBusiness: string;
  companySize: string;
  // Bloco 2 - Digital
  hasWebsite: boolean;
  socialNetworks: string[];
  mainContactChannel: string;
  serviceType: string;
  // Bloco 3 - Situação
  mainDifficulty: string;
  whereLosesClients: string;
  mainBottleneck: string;
  // Bloco 4 - Objetivos
  whatToImprove: string;
  mainPriority: string;
  interests: string[];
}

const TOTAL_STEPS = 4;

const socialNetworkOptions = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'whatsapp', label: 'WhatsApp Business' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
];

const interestOptions = [
  { id: 'site', label: 'Site profissional' },
  { id: 'app', label: 'Aplicativo' },
  { id: 'autoridade', label: 'Autoridade digital' },
  { id: 'processos', label: 'Organização de processos' },
  { id: 'posicionamento', label: 'Posicionamento de marca' },
  { id: 'lancamento', label: 'Kit de lançamento' },
];

export default function BriefingRapido() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  
  const leadName = searchParams.get("leadName") || "";
  const leadSegment = searchParams.get("leadSegment") || "";
  const leadLocation = searchParams.get("leadLocation") || "";
  
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  
  const { getSavedState, saveStep, saveFormData, clearState } = useModuleState('briefing-rapido');
  
  const [formData, setFormData] = useState<FormData>({
    companyName: leadName,
    location: leadLocation,
    segment: leadSegment,
    timeInBusiness: "",
    companySize: "",
    hasWebsite: false,
    socialNetworks: [],
    mainContactChannel: "",
    serviceType: "",
    mainDifficulty: "",
    whereLosesClients: "",
    mainBottleneck: "",
    whatToImprove: "",
    mainPriority: "",
    interests: [],
  });

  // Check for saved state on mount (only if no lead params)
  useEffect(() => {
    if (leadName) return; // Don't show resume if coming from lead
    const saved = getSavedState();
    if (saved && (saved.currentStep && saved.currentStep > 1 || (saved.formData && Object.keys(saved.formData).length > 0))) {
      setShowResumeBanner(true);
    }
  }, [leadName]);

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

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      saveFormData(updated);
      return updated;
    });
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleArrayField = (field: 'socialNetworks' | 'interests', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      const newFormData = { ...prev, [field]: updated };
      saveFormData(newFormData);
      return newFormData;
    });
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Nome da empresa é obrigatório.';
    if (!formData.companySize) newErrors.companySize = 'Selecione o tamanho da empresa.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.mainDifficulty.trim()) newErrors.mainDifficulty = 'Informe a principal dificuldade.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdvanceStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 3 && !validateStep3()) return;
    const newStep = step + 1;
    setStep(newStep);
    saveStep(newStep);
  };

  const handleFinish = async () => {
    if (!workspace?.id || !user?.id) {
      toast.error('Erro ao identificar workspace');
      return;
    }

    setIsGenerating(true);

    try {
      const briefingData = {
        workspace_id: workspace.id,
        created_by_user_id: user.id,
        company_name: sanitizeInput(formData.companyName),
        location: sanitizeInput(formData.location),
        segment: sanitizeInput(formData.segment),
        time_in_business: formData.timeInBusiness,
        company_size: formData.companySize,
        has_website: formData.hasWebsite,
        social_networks: formData.socialNetworks,
        main_contact_channel: formData.mainContactChannel,
        service_type: formData.serviceType,
        main_difficulty: sanitizeInput(formData.mainDifficulty),
        where_loses_clients: sanitizeInput(formData.whereLosesClients),
        main_bottleneck: sanitizeInput(formData.mainBottleneck),
        what_to_improve: sanitizeInput(formData.whatToImprove),
        main_priority: formData.mainPriority,
        interests: formData.interests,
        status: 'completed',
        origin: 'briefing_rapido',
      };

      // Save briefing
      const { data: briefing, error: insertError } = await supabase
        .from('briefings')
        .insert(briefingData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Generate analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('generate-briefing-analysis', {
        body: briefingData
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
      } else if (analysisData?.success) {
        await supabase
          .from('briefings')
          .update({
            maturity_level: analysisData.data.maturity_level,
            main_pains: analysisData.data.main_pains,
            opportunities: analysisData.data.opportunities,
            intelligent_summary: analysisData.data.intelligent_summary,
            status: 'analyzed',
          })
          .eq('id', briefing.id);
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        user_id: user.id,
        type: 'briefing_created',
        message: `Briefing rápido criado para ${briefingData.company_name}`,
        entity_type: 'briefing',
        entity_id: briefing.id,
      });

      toast.success('Briefing criado com sucesso!');
      clearState();
      navigate(`/nexia-ai/briefing/${briefing.id}`);

    } catch (error: any) {
      console.error('Error creating briefing:', error);
      toast.error(error.message || 'Erro ao criar briefing');
    } finally {
      setIsGenerating(false);
    }
  };

  const stepTitles = [
    { icon: Building2, title: 'Negócio', desc: 'Dados da empresa' },
    { icon: Globe, title: 'Digital', desc: 'Presença online' },
    { icon: AlertTriangle, title: 'Situação', desc: 'Problemas atuais' },
    { icon: Target, title: 'Objetivos', desc: 'Metas e interesses' },
  ];

  return (
    <AppLayout title="Briefing Rápido">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-500" />
              <h1 className="text-xl font-bold">Briefing Rápido</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Etapa {step} de {TOTAL_STEPS}
            </p>
          </div>
        </div>

        {/* Resume Session Banner */}
        {showResumeBanner && (
          <ResumeSessionBanner
            title="Continuar de onde parou?"
            description={`Você estava na etapa ${getSavedState()?.currentStep || 1} de ${TOTAL_STEPS}`}
            onResume={handleResumeSession}
            onStartFresh={handleStartFresh}
          />
        )}

        {/* Progress */}
        <div className="flex gap-2">
          {stepTitles.map((s, i) => (
            <div key={i} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-emerald-500' : 'bg-muted'
                }`}
              />
              <div className="mt-2 hidden sm:flex items-center gap-1.5">
                <s.icon className={`h-3.5 w-3.5 ${i + 1 <= step ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                <span className={`text-xs ${i + 1 <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Negócio */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-500" />
                Dados do Negócio
              </CardTitle>
              <CardDescription>
                Informações básicas sobre a empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da empresa *</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Loja da Maria"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className={errors.companyName ? 'border-destructive' : ''}
                />
                {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Cidade / País</Label>
                  <Input
                    id="location"
                    placeholder="Ex: São Paulo - SP"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segment">Segmento</Label>
                  <Input
                    id="segment"
                    placeholder="Ex: Moda feminina"
                    value={formData.segment}
                    onChange={(e) => updateField('segment', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tempo de atuação</Label>
                  <Select value={formData.timeInBusiness} onValueChange={(v) => updateField('timeInBusiness', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menos_1_ano">Menos de 1 ano</SelectItem>
                      <SelectItem value="1_3_anos">1 a 3 anos</SelectItem>
                      <SelectItem value="3_5_anos">3 a 5 anos</SelectItem>
                      <SelectItem value="5_10_anos">5 a 10 anos</SelectItem>
                      <SelectItem value="mais_10_anos">Mais de 10 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tamanho da empresa *</Label>
                  <Select value={formData.companySize} onValueChange={(v) => updateField('companySize', v)}>
                    <SelectTrigger className={errors.companySize ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mei">MEI / Autônomo</SelectItem>
                      <SelectItem value="micro">Microempresa</SelectItem>
                      <SelectItem value="pequena">Pequena empresa</SelectItem>
                      <SelectItem value="media">Média empresa</SelectItem>
                      <SelectItem value="grande">Grande empresa</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.companySize && <p className="text-sm text-destructive">{errors.companySize}</p>}
                </div>
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

        {/* Step 2: Digital */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-500" />
                Presença Digital
              </CardTitle>
              <CardDescription>
                Como o negócio está presente online
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasWebsite"
                  checked={formData.hasWebsite}
                  onCheckedChange={(checked) => updateField('hasWebsite', checked)}
                />
                <Label htmlFor="hasWebsite">Possui site</Label>
              </div>

              <div className="space-y-2">
                <Label>Redes sociais utilizadas</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {socialNetworkOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={formData.socialNetworks.includes(option.id)}
                        onCheckedChange={() => toggleArrayField('socialNetworks', option.id)}
                      />
                      <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Principal canal de contato com clientes</Label>
                <Select value={formData.mainContactChannel} onValueChange={(v) => updateField('mainContactChannel', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram DM</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de atendimento</Label>
                <Select value={formData.serviceType} onValueChange={(v) => updateField('serviceType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual (responde um por um)</SelectItem>
                    <SelectItem value="semi_automatizado">Semi-automatizado</SelectItem>
                    <SelectItem value="automatizado">Automatizado (bots, sistemas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleAdvanceStep} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  Avançar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Situação */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-emerald-500" />
                Situação Atual
              </CardTitle>
              <CardDescription>
                Principais desafios e dificuldades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mainDifficulty">Principal dificuldade hoje *</Label>
                <Textarea
                  id="mainDifficulty"
                  placeholder="Ex: Dificuldade em atrair novos clientes pela internet"
                  value={formData.mainDifficulty}
                  onChange={(e) => updateField('mainDifficulty', e.target.value)}
                  className={errors.mainDifficulty ? 'border-destructive' : ''}
                />
                {errors.mainDifficulty && <p className="text-sm text-destructive">{errors.mainDifficulty}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whereLosesClients">Onde sente que perde clientes</Label>
                <Textarea
                  id="whereLosesClients"
                  placeholder="Ex: No primeiro contato, por falta de resposta rápida"
                  value={formData.whereLosesClients}
                  onChange={(e) => updateField('whereLosesClients', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainBottleneck">Maior gargalo para crescer</Label>
                <Textarea
                  id="mainBottleneck"
                  placeholder="Ex: Falta de tempo para gerenciar redes sociais"
                  value={formData.mainBottleneck}
                  onChange={(e) => updateField('mainBottleneck', e.target.value)}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleAdvanceStep} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  Avançar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Objetivos */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                Objetivos
              </CardTitle>
              <CardDescription>
                O que o negócio deseja alcançar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatToImprove">O que deseja melhorar</Label>
                <Textarea
                  id="whatToImprove"
                  placeholder="Ex: Quero ter mais presença online e atrair clientes"
                  value={formData.whatToImprove}
                  onChange={(e) => updateField('whatToImprove', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Prioridade principal</Label>
                <Select value={formData.mainPriority} onValueChange={(v) => updateField('mainPriority', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mais_clientes">Mais clientes</SelectItem>
                    <SelectItem value="mais_vendas">Mais vendas</SelectItem>
                    <SelectItem value="organizacao">Organização</SelectItem>
                    <SelectItem value="profissionalizacao">Profissionalização</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Interessa em (selecione o que faz sentido)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${option.id}`}
                        checked={formData.interests.includes(option.id)}
                        onCheckedChange={() => toggleArrayField('interests', option.id)}
                      />
                      <Label htmlFor={`interest-${option.id}`} className="text-sm">{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleFinish} 
                  disabled={isGenerating}
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      Concluir Briefing
                      <ArrowRight className="h-4 w-4" />
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
