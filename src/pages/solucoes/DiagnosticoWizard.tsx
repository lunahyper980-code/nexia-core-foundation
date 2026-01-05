import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save,
  Loader2,
  Sparkles,
  Building2,
  ClipboardCheck,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useDemoModeForForms } from '@/hooks/useDemoModeForForms';

interface DiagnosisFormData {
  companyName: string;
  segment: string;
  cityState: string;
  hasWebsite: boolean | null;
  socialNetworks: string[];
  mainObjective: string;
  onlinePresenceRating: number;
  digitalCommunicationRating: number;
  contactEaseRating: number;
  professionalismRating: number;
  mainProblemPerceived: string;
}

const OBJECTIVES = [
  'Aumentar vendas',
  'Conseguir mais clientes',
  'Fortalecer a marca',
  'Melhorar presença online',
  'Lançar produto/serviço',
  'Outro'
];

const SEGMENTS = [
  'Alimentação',
  'Beleza e Estética',
  'Saúde',
  'Educação',
  'Comércio',
  'Serviços',
  'Tecnologia',
  'Construção',
  'Outro'
];

export default function DiagnosticoWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const { isDemoMode, validateRequired, getDemoModeFlag } = useDemoModeForForms();
  
  const [briefingConfirmed, setBriefingConfirmed] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDiagnosis, setGeneratedDiagnosis] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<DiagnosisFormData>({
    companyName: '',
    segment: '',
    cityState: '',
    hasWebsite: null,
    socialNetworks: [],
    mainObjective: '',
    onlinePresenceRating: 3,
    digitalCommunicationRating: 3,
    contactEaseRating: 3,
    professionalismRating: 3,
    mainProblemPerceived: ''
  });

  // Load existing diagnosis if editing
  useQuery({
    queryKey: ['diagnosis', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('digital_diagnoses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          companyName: data.company_name || '',
          segment: data.segment || '',
          cityState: data.city_state || '',
          hasWebsite: data.has_website,
          socialNetworks: data.social_networks || [],
          mainObjective: data.main_objective || '',
          onlinePresenceRating: data.online_presence_rating || 3,
          digitalCommunicationRating: data.digital_communication_rating || 3,
          contactEaseRating: data.contact_ease_rating || 3,
          professionalismRating: data.professionalism_rating || 3,
          mainProblemPerceived: data.main_problem_perceived || ''
        });
        if (data.diagnosis_text) {
          setGeneratedDiagnosis(data.diagnosis_text);
          setStep(3);
        }
      }
      return data;
    },
    enabled: !!id,
  });

  const updateFormData = (field: keyof DiagnosisFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSocialNetwork = (network: string) => {
    setFormData(prev => ({
      ...prev,
      socialNetworks: prev.socialNetworks.includes(network)
        ? prev.socialNetworks.filter(n => n !== network)
        : [...prev.socialNetworks, network]
    }));
  };

  const saveDraft = async () => {
    if (!workspace?.id) return;
    setIsLoading(true);

    try {
      const payload = {
        workspace_id: workspace.id,
        company_name: formData.companyName,
        segment: formData.segment,
        city_state: formData.cityState,
        has_website: formData.hasWebsite,
        social_networks: formData.socialNetworks,
        main_objective: formData.mainObjective,
        online_presence_rating: formData.onlinePresenceRating,
        digital_communication_rating: formData.digitalCommunicationRating,
        contact_ease_rating: formData.contactEaseRating,
        professionalism_rating: formData.professionalismRating,
        main_problem_perceived: formData.mainProblemPerceived,
        status: 'draft'
      };

      if (id) {
        await supabase.from('digital_diagnoses').update(payload).eq('id', id);
      } else {
        const { data } = await supabase.from('digital_diagnoses').insert(payload).select().single();
        if (data) {
          navigate(`/solucoes/diagnostico/${data.id}/editar`, { replace: true });
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

  const generateDiagnosis = async () => {
    if (!workspace?.id) return;
    setIsGenerating(true);

    try {
      // First save the data
      const payload = {
        workspace_id: workspace.id,
        company_name: formData.companyName,
        segment: formData.segment,
        city_state: formData.cityState,
        has_website: formData.hasWebsite,
        social_networks: formData.socialNetworks,
        main_objective: formData.mainObjective,
        online_presence_rating: formData.onlinePresenceRating,
        digital_communication_rating: formData.digitalCommunicationRating,
        contact_ease_rating: formData.contactEaseRating,
        professionalism_rating: formData.professionalismRating,
        main_problem_perceived: formData.mainProblemPerceived,
        status: 'draft'
      };

      let diagnosisId = id;
      if (!id) {
        const { data } = await supabase.from('digital_diagnoses').insert(payload).select().single();
        if (data) diagnosisId = data.id;
      } else {
        await supabase.from('digital_diagnoses').update(payload).eq('id', id);
      }

      // Generate with AI
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-diagnosis', {
        body: { 
          diagnosisData: formData,
          demoMode: getDemoModeFlag()
        }
      });

      if (functionError) throw functionError;

      const diagnosisText = functionData.diagnosisText;
      setGeneratedDiagnosis(diagnosisText);

      // Update with generated text
      await supabase.from('digital_diagnoses').update({
        diagnosis_text: diagnosisText,
        diagnosis_generated_at: new Date().toISOString(),
        status: 'completed'
      }).eq('id', diagnosisId);

      // Log activity
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        type: 'DIAGNOSIS_GENERATED',
        message: `Diagnóstico gerado para ${formData.companyName}`,
        entity_type: 'diagnosis',
        entity_id: diagnosisId
      });

      setStep(3);
      navigate(`/solucoes/diagnostico/${diagnosisId}`, { replace: true });
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar diagnóstico',
        description: error.message || 'Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const RatingSlider = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <span className="text-sm font-medium text-primary">{value}/5</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`flex-1 h-10 rounded-lg border-2 transition-all ${
              rating <= value 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-background border-border hover:border-primary/50'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Muito fraco</span>
        <span>Excelente</span>
      </div>
    </div>
  );

  return (
    <AppLayout title="Novo Diagnóstico">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/solucoes/diagnostico')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {/* Briefing Preparation Card - Appears before the wizard */}
        {!briefingConfirmed && !id && (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    📋 Briefing do Cliente
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Para gerar um diagnóstico e planejamento corretos, é importante ter as informações básicas do cliente.
                    <br />
                    Se você ainda não coletou esses dados, gere um briefing rápido e profissional.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
                  <Button 
                    onClick={() => navigate('/briefing-rapido')}
                    className="gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Gerar briefing rápido
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setBriefingConfirmed(true)}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Já tenho as informações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress - Only show when briefing is confirmed */}
        {(briefingConfirmed || id) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Etapa {step} de 2</span>
              <span className="text-muted-foreground">{Math.round((step / 2) * 100)}%</span>
            </div>
            <Progress value={(step / 2) * 100} className="h-2" />
          </div>
        )}

        {/* Step 1: Client Data */}
        {step === 1 && (briefingConfirmed || id) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Label>Segmento/Nicho *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {SEGMENTS.map((seg) => (
                    <Button
                      key={seg}
                      type="button"
                      variant={formData.segment === seg ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFormData('segment', seg)}
                    >
                      {seg}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cityState">Cidade/Estado *</Label>
                <Input
                  id="cityState"
                  placeholder="Ex: São Paulo, SP"
                  value={formData.cityState}
                  onChange={(e) => updateFormData('cityState', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Possui site?</Label>
                <RadioGroup
                  value={formData.hasWebsite === null ? '' : formData.hasWebsite ? 'yes' : 'no'}
                  onValueChange={(v) => updateFormData('hasWebsite', v === 'yes')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="website-yes" />
                    <Label htmlFor="website-yes">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="website-no" />
                    <Label htmlFor="website-no">Não</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Redes sociais</Label>
                <div className="flex gap-4">
                  {['Instagram', 'Facebook', 'TikTok', 'LinkedIn'].map((network) => (
                    <div key={network} className="flex items-center space-x-2">
                      <Checkbox
                        id={network}
                        checked={formData.socialNetworks.includes(network)}
                        onCheckedChange={() => toggleSocialNetwork(network)}
                      />
                      <Label htmlFor={network} className="text-sm">{network}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Objetivo principal do cliente</Label>
                <div className="grid grid-cols-2 gap-2">
                  {OBJECTIVES.map((obj) => (
                    <Button
                      key={obj}
                      type="button"
                      variant={formData.mainObjective === obj ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFormData('mainObjective', obj)}
                    >
                      {obj}
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
                  onClick={() => setStep(2)}
                  disabled={!formData.companyName || !formData.segment || !formData.cityState}
                  className="flex-1 gap-2"
                >
                  Avançar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Evaluation */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Avaliação Rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RatingSlider
                label="Presença online"
                value={formData.onlinePresenceRating}
                onChange={(v) => updateFormData('onlinePresenceRating', v)}
              />

              <RatingSlider
                label="Comunicação digital"
                value={formData.digitalCommunicationRating}
                onChange={(v) => updateFormData('digitalCommunicationRating', v)}
              />

              <RatingSlider
                label="Facilidade de contato"
                value={formData.contactEaseRating}
                onChange={(v) => updateFormData('contactEaseRating', v)}
              />

              <RatingSlider
                label="Profissionalismo percebido"
                value={formData.professionalismRating}
                onChange={(v) => updateFormData('professionalismRating', v)}
              />

              <div className="space-y-2">
                <Label htmlFor="mainProblem">Principal problema percebido</Label>
                <Textarea
                  id="mainProblem"
                  placeholder="Descreva o principal problema ou desafio que você identificou..."
                  value={formData.mainProblemPerceived}
                  onChange={(e) => updateFormData('mainProblemPerceived', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <Button
                  onClick={generateDiagnosis}
                  disabled={isGenerating || !formData.mainProblemPerceived}
                  className="flex-1 gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando diagnóstico...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar diagnóstico
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
