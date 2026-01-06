import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { SelectableCard, ColorCard } from '@/components/ui/selectable-card';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Rocket, 
  Sparkles, 
  Palette, 
  Loader2, 
  Copy, 
  ExternalLink, 
  FileText, 
  Globe, 
  Type,
  Users,
  Layout
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { NexiaOriginBanner, parseNexiaParams } from '@/components/nexia';

// Platform logos
import platformLovable from '@/assets/platform-lovable.png';
import platformFirebase from '@/assets/platform-firebase.png';
import platformBolt from '@/assets/platform-bolt.png';
import platformGoogleAI from '@/assets/platform-google-ai.svg';
import platformBase44 from '@/assets/platform-base44.png';

interface FormData {
  appName: string;
  targetAudience: string;
  mainTask: string;
  mainBenefit: string;
  dailyUsers: string;
  pages: string;
  otherFeatures: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  customFont: string;
  language: string;
  customLanguage: string;
  targetPlatform: string;
}

const initialFormData: FormData = {
  appName: '',
  targetAudience: '',
  mainTask: '',
  mainBenefit: '',
  dailyUsers: '',
  pages: '',
  otherFeatures: '',
  primaryColor: '#8B5CF6',
  secondaryColor: '#6366F1',
  backgroundColor: '#0F0A1A',
  textColor: '#F8FAFC',
  fontFamily: 'Inter',
  customFont: '',
  language: 'pt-BR',
  customLanguage: '',
  targetPlatform: 'lovable',
};

const fonts = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'custom', label: 'Outra' },
];

const languages = [
  { value: 'pt-BR', label: 'Português', flag: '🇧🇷', subtitle: 'Brasil' },
  { value: 'en', label: 'Inglês', flag: '🇺🇸', subtitle: 'English' },
  { value: 'es', label: 'Espanhol', flag: '🇪🇸', subtitle: 'Español' },
  { value: 'other', label: 'Outro', flag: '🌐', subtitle: 'Idioma' },
];

const platforms = [
  { value: 'lovable', label: 'Lovable', image: platformLovable, subtitle: 'Recomendado' },
  { value: 'firebase-studio', label: 'Firebase Studio', image: platformFirebase, subtitle: 'Google' },
  { value: 'bolt', label: 'Bolt', image: platformBolt, subtitle: 'StackBlitz' },
  { value: 'replit', label: 'Replit', letter: 'R', subtitle: 'Colaborativo', bgColor: '#F26207' },
  { value: 'v0', label: 'v0.dev', letter: 'v0', subtitle: 'Vercel', bgColor: '#000000' },
  { value: 'base44', label: 'Base44', image: platformBase44, subtitle: 'No-code' },
  { value: 'google-ai-studio', label: 'Google AI', image: platformGoogleAI, subtitle: 'Gemini' },
  { value: 'other', label: 'Outros', letter: '...', subtitle: 'Qualquer', bgColor: '#374151' },
];

const platformUrls: Record<string, string> = {
  lovable: 'https://lovable.dev/projects/create',
  'firebase-studio': 'https://console.firebase.google.com/',
  bolt: 'https://bolt.new/',
  replit: 'https://replit.com/',
  v0: 'https://v0.dev/',
  base44: 'https://base44.com/',
  'google-ai-studio': 'https://aistudio.google.com/',
  other: 'https://lovable.dev/projects/create',
};

export default function HyperBuildApp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [saving, setSaving] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);

  // Parse Nexia data from URL
  const nexiaData = parseNexiaParams(searchParams);

  // Pre-fill form with Nexia data
  useEffect(() => {
    if (nexiaData) {
      setFormData(prev => ({
        ...prev,
        appName: nexiaData.projectName || nexiaData.companyName || prev.appName,
        targetAudience: nexiaData.targetAudience || prev.targetAudience,
        mainBenefit: nexiaData.mainProblem || nexiaData.primaryGoal || prev.mainBenefit,
      }));
    }
  }, []);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const getFontStyle = () => {
    const font = formData.fontFamily === 'custom' && formData.customFont 
      ? formData.customFont 
      : formData.fontFamily;
    return { fontFamily: `"${font}", sans-serif` };
  };

  const generatePrompt = (): string => {
    const font = formData.fontFamily === 'custom' ? formData.customFont : formData.fontFamily;
    const languageLabel = formData.language === 'other' ? formData.customLanguage : (languages.find(l => l.value === formData.language)?.label || formData.language);
    const platformLabel = platforms.find(p => p.value === formData.targetPlatform)?.label || formData.targetPlatform;

    const prompt = `# PROJETO: ${formData.appName}

## 1. CONTEXTO DO PROJETO
- **Tipo de solução:** Aplicativo / SaaS
- **Descrição:** Aplicativo completo desenvolvido para resolver problemas operacionais reais e facilitar a gestão do negócio.

## 2. PÚBLICO-ALVO
${formData.targetAudience}

## 3. FUNÇÃO PRINCIPAL
${formData.mainTask}

## 4. PROBLEMA RESOLVIDO / BENEFÍCIO PRINCIPAL
${formData.mainBenefit}

## 5. USUÁRIOS DO SISTEMA
${formData.dailyUsers}

## 6. TELAS/PÁGINAS ESSENCIAIS
${formData.pages}

## 7. FUNCIONALIDADES ADICIONAIS
${formData.otherFeatures || 'Nenhuma funcionalidade adicional especificada.'}

## 8. IDENTIDADE VISUAL
- **Cor primária:** ${formData.primaryColor}
- **Cor secundária:** ${formData.secondaryColor}
- **Cor de fundo:** ${formData.backgroundColor}
- **Cor do texto:** ${formData.textColor}
- **Tipografia:** ${font}

## 9. CONFIGURAÇÕES
- **Idioma:** ${languageLabel}
- **Plataforma:** ${platformLabel}

## 10. INSTRUÇÃO FINAL

## REQUISITOS OBRIGATÓRIOS PARA APLICATIVO/SAAS:

1. **Frontend Interativo Completo**
   - TODAS as telas devem ser funcionais e clicáveis
   - Navegação fluida entre TODAS as páginas do fluxo
   - Menus responsivos (sidebar, navbar, bottom navigation para mobile)
   - Estados visuais: loading, sucesso, erro, vazio

2. **Sistema de Autenticação**
   - Tela de Login com validação visual
   - Tela de Cadastro com validação visual
   - Recuperação de senha (fluxo simulado)
   - Proteção de rotas autenticadas
   - Perfis diferentes: cliente, funcionário, admin

3. **Painéis e Dashboards com Métricas Reais**
   - Painel principal com métricas do negócio
   - Gráficos e cards com dados simulados realistas
   - Área administrativa completa
   - Relatórios visuais

4. **Fluxos Clicáveis Completos**
   - Formulários com validação e feedback visual
   - Ações com confirmação (modais, toasts)
   - Estados de loading, sucesso e erro em CADA ação
   - Simulação de operações CRUD completas
   - Notificações e alertas contextuais

5. **UX/UI Profissional**
   - Design responsivo mobile-first
   - Animações e transições suaves
   - Feedback visual para TODAS as ações
   - Hierarquia visual clara - o mais importante chama mais atenção
   - Microinterações que guiam o usuário

CRÍTICO: Gerar código COMPLETO e FUNCIONAL. NENHUMA página pode estar vazia, com placeholder ou "em construção". Cada tela deve parecer de um produto real em produção.`;

    return prompt;
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast.success('Prompt copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar prompt');
    }
  };

  const handleOpenPlatform = () => {
    const url = platformUrls[formData.targetPlatform] || platformUrls.lovable;
    window.open(url, '_blank');
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps - 1) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    } else {
      navigate('/solucoes/criar/app');
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step < totalSteps) {
      setCurrentStep(step);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!workspace) {
      toast.error('Workspace não encontrado');
      return;
    }

    setSaving(true);

    try {
      const prompt = generatePrompt();
      
      const { data, error } = await supabase.from('projects').insert({
        workspace_id: workspace.id,
        app_name: formData.appName || 'Novo Aplicativo',
        target_audience: formData.targetAudience,
        main_task: formData.mainTask,
        main_benefit: formData.mainBenefit,
        daily_users: formData.dailyUsers,
        pages: formData.pages,
        other_features: formData.otherFeatures || null,
        primary_color: formData.primaryColor,
        secondary_color: formData.secondaryColor,
        background_color: formData.backgroundColor,
        text_color: formData.textColor,
        font_family: formData.fontFamily === 'custom' ? formData.customFont : formData.fontFamily,
        custom_font: formData.fontFamily === 'custom' ? formData.customFont : null,
        language: formData.language,
        target_platform: formData.targetPlatform,
        status: 'prompt_generated',
        generated_prompt: prompt,
      }).select('id').single();

      if (error) throw error;

      // Log activity if came from Nexia
      if (nexiaData?.planningId && user) {
        await supabase.from('activity_logs').insert({
          workspace_id: workspace.id,
          user_id: user.id,
          type: 'SOLUTION_CREATED_FROM_NEXIA',
          entity_type: 'project',
          entity_id: data?.id || null,
          title: 'Solução digital criada',
          description: `Aplicativo "${formData.appName}" criado a partir do planejamento Nexia`,
          message: `Aplicativo "${formData.appName}" criado a partir do planejamento Nexia`,
          metadata: { 
            planning_id: nexiaData.planningId,
            client_id: nexiaData.clientId,
            solution_type: 'app',
            mode: nexiaData.mode
          }
        });
      }

      setProjectId(data.id);
      setGeneratedPrompt(prompt);
      setCurrentStep(totalSteps);
      toast.success('Projeto criado com sucesso!');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erro ao criar projeto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Criar Aplicativo do Zero">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/solucoes/criar/app')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Criar Aplicativo do Zero</h1>
            <p className="text-muted-foreground">
              Configure as informações do seu aplicativo
            </p>
          </div>
        </div>

        {/* Nexia Origin Banner */}
        {nexiaData && (
          <NexiaOriginBanner nexiaData={nexiaData} />
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Etapa {currentStep} de {totalSteps}</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                {currentStep === 1 && <Sparkles className="h-5 w-5 text-primary" />}
                {currentStep === 2 && <Users className="h-5 w-5 text-primary" />}
                {currentStep === 3 && <Layout className="h-5 w-5 text-primary" />}
                {currentStep === 4 && <Palette className="h-5 w-5 text-primary" />}
                {currentStep === 5 && <FileText className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <CardTitle>
                  {currentStep === 1 && 'Identidade do App'}
                  {currentStep === 2 && 'Propósito e Usuários'}
                  {currentStep === 3 && 'Estrutura e Recursos'}
                  {currentStep === 4 && 'Identidade Visual e Configurações'}
                  {currentStep === 5 && 'Prompt Gerado'}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && 'Defina o nome e público do seu aplicativo'}
                  {currentStep === 2 && 'Descreva a função principal e benefícios'}
                  {currentStep === 3 && 'Configure as páginas e recursos extras'}
                  {currentStep === 4 && 'Personalize cores, fontes, idioma e plataforma'}
                  {currentStep === 5 && 'Copie o prompt e crie seu app na plataforma'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Identity */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="appName">
                    Qual o nome do seu aplicativo?
                  </Label>
                  <Input
                    id="appName"
                    value={formData.appName}
                    onChange={(e) => updateField('appName', e.target.value)}
                    placeholder="Ex: AgendaFácil, MeuTreino, GestãoPro..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">
                    Para quem é este aplicativo?
                  </Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => updateField('targetAudience', e.target.value)}
                    placeholder="Ex: Donos de barbearia, donos de pizzaria, lojistas locais..."
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Purpose */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="mainTask">
                    Qual é a principal tarefa que este app vai fazer?
                  </Label>
                  <Textarea
                    id="mainTask"
                    value={formData.mainTask}
                    onChange={(e) => updateField('mainTask', e.target.value)}
                    placeholder="Ex: Anotar pedidos, agendar horários, gerenciar cardápio..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainBenefit">
                    Qual é a maior ajuda que este app vai dar para o usuário?
                  </Label>
                  <Textarea
                    id="mainBenefit"
                    value={formData.mainBenefit}
                    onChange={(e) => updateField('mainBenefit', e.target.value)}
                    placeholder="Ex: Vender mais, organizar pedidos, eliminar WhatsApp..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyUsers">
                    Quem vai usar o aplicativo no dia a dia?
                  </Label>
                  <Textarea
                    id="dailyUsers"
                    value={formData.dailyUsers}
                    onChange={(e) => updateField('dailyUsers', e.target.value)}
                    placeholder="Ex: Clientes finais, funcionários, gerente..."
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Structure */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="pages">
                    Quais páginas/telas o aplicativo deve ter?
                  </Label>
                  <Input
                    id="pages"
                    value={formData.pages}
                    onChange={(e) => updateField('pages', e.target.value)}
                    placeholder="Ex: Login, Home, Cardápio, Carrinho, Perfil, Admin..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe as páginas por vírgula
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherFeatures">
                    Outros recursos importantes <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Textarea
                    id="otherFeatures"
                    value={formData.otherFeatures}
                    onChange={(e) => updateField('otherFeatures', e.target.value)}
                    placeholder="Ex: Cupons, fidelidade, notificações, integração com WhatsApp..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Visual Identity */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-fade-in">
                {/* Platform Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Plataforma de destino
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {platforms.map((platform) => (
                      <SelectableCard
                        key={platform.value}
                        selected={formData.targetPlatform === platform.value}
                        title={platform.label}
                        subtitle={platform.subtitle}
                        size="sm"
                        onClick={() => updateField('targetPlatform', platform.value)}
                        preview={
                          platform.image ? (
                            <img 
                              src={platform.image} 
                              alt={platform.label} 
                              className="w-10 h-10 object-contain"
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: platform.bgColor }}
                            >
                              {platform.letter}
                            </div>
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Idioma do aplicativo
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {languages.map((lang) => (
                      <SelectableCard
                        key={lang.value}
                        selected={formData.language === lang.value}
                        title={lang.label}
                        subtitle={lang.subtitle}
                        size="sm"
                        preview={<span className="text-3xl">{lang.flag}</span>}
                        onClick={() => updateField('language', lang.value)}
                      />
                    ))}
                  </div>
                  {formData.language === 'other' && (
                    <Input
                      value={formData.customLanguage}
                      onChange={(e) => updateField('customLanguage', e.target.value)}
                      placeholder="Digite o idioma desejado (ex: Francês, Alemão, Japonês)"
                      className="mt-3"
                    />
                  )}
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Identidade Visual
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ColorCard
                      color={formData.primaryColor}
                      label="Primária"
                      onColorChange={(color) => updateField('primaryColor', color)}
                    />
                    <ColorCard
                      color={formData.secondaryColor}
                      label="Secundária"
                      onColorChange={(color) => updateField('secondaryColor', color)}
                    />
                    <ColorCard
                      color={formData.backgroundColor}
                      label="Fundo"
                      onColorChange={(color) => updateField('backgroundColor', color)}
                    />
                    <ColorCard
                      color={formData.textColor}
                      label="Texto"
                      onColorChange={(color) => updateField('textColor', color)}
                    />
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    Tipografia
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {fonts.map((font) => (
                      <SelectableCard
                        key={font.value}
                        selected={formData.fontFamily === font.value}
                        title={font.label}
                        size="sm"
                        showCheckmark={false}
                        onClick={() => updateField('fontFamily', font.value)}
                        className="py-3"
                        style={{ fontFamily: font.value !== 'custom' ? font.value : undefined }}
                      />
                    ))}
                  </div>
                  {formData.fontFamily === 'custom' && (
                    <Input
                      value={formData.customFont}
                      onChange={(e) => updateField('customFont', e.target.value)}
                      placeholder="Nome da fonte (Google Fonts)"
                      className="mt-3"
                    />
                  )}
                </div>

                {/* Preview */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Pré-visualização</Label>
                  <div 
                    className="rounded-xl p-6 border border-border/50 overflow-hidden"
                    style={{ 
                      backgroundColor: formData.backgroundColor,
                      ...getFontStyle()
                    }}
                  >
                    <div 
                      className="rounded-lg p-4 mb-4"
                      style={{ backgroundColor: formData.secondaryColor }}
                    >
                      <h3 
                        className="text-lg font-bold mb-2"
                        style={{ color: formData.textColor }}
                      >
                        {formData.appName || 'Nome do App'}
                      </h3>
                      <p 
                        className="text-sm opacity-80"
                        style={{ color: formData.textColor }}
                      >
                        Este é um exemplo de como seu aplicativo vai parecer com as cores e fonte selecionadas.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
                        style={{ 
                          backgroundColor: formData.primaryColor,
                          color: '#FFFFFF'
                        }}
                      >
                        Botão Primário
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg font-medium text-sm border-2 transition-opacity hover:opacity-90"
                        style={{ 
                          borderColor: formData.primaryColor,
                          color: formData.primaryColor,
                          backgroundColor: 'transparent'
                        }}
                      >
                        Botão Secundário
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Generated Prompt */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-500 mb-2">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Projeto criado com sucesso!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Seu prompt foi gerado e salvo. Copie-o e cole na plataforma para criar seu aplicativo.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Prompt Gerado</Label>
                  <Textarea
                    value={generatedPrompt}
                    readOnly
                    rows={16}
                    className="font-mono text-sm bg-muted/30 resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleCopyPrompt} className="flex-1 gap-2">
                    <Copy className="h-4 w-4" />
                    Copiar Prompt
                  </Button>
                  <Button onClick={handleOpenPlatform} variant="outline" className="flex-1 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Abrir {platforms.find(p => p.value === formData.targetPlatform)?.label || 'Plataforma'}
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/solucoes/criar/app')}
                    className="w-full gap-2"
                  >
                    Voltar para Criação de Apps
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 5 && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={saving}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>

                <Button onClick={handleNext} disabled={saving} className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : currentStep === 4 ? (
                    <>
                      Gerar Prompt
                      <Rocket className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step Indicators - Clickable */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <button
              key={step}
              onClick={() => goToStep(step)}
              disabled={saving || step === 5}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${step === currentStep 
                  ? 'bg-primary w-8' 
                  : step < currentStep 
                    ? 'bg-primary/50 cursor-pointer hover:bg-primary/70' 
                    : step < 5 
                      ? 'bg-muted cursor-pointer hover:bg-muted-foreground/30'
                      : 'bg-muted'
                }
              `}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
