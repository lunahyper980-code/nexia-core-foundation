import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { SelectableCard, ColorCard } from '@/components/ui/selectable-card';
import { ArrowLeft, ArrowRight, Check, Rocket, Sparkles, Palette, Loader2, Copy, ExternalLink, FileText, Info, Globe, Type } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { getTemplateById, TemplateData } from '@/data/templates';
import { useModuleState } from '@/hooks/useModuleState';
import { ResumeSessionBanner } from '@/components/ResumeSessionBanner';

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
  primaryColor: '#2563EB',
  secondaryColor: '#1F2937',
  backgroundColor: '#0B0F19',
  textColor: '#E5E7EB',
  fontFamily: 'Roboto',
  customFont: '',
  language: 'pt-BR',
  customLanguage: '',
  targetPlatform: 'lovable',
};

const fonts = [
  { value: 'Roboto', label: 'Roboto', icon: Type },
  { value: 'Poppins', label: 'Poppins', icon: Type },
  { value: 'Lato', label: 'Lato', icon: Type },
  { value: 'Montserrat', label: 'Montserrat', icon: Type },
  { value: 'Inter', label: 'Inter', icon: Type },
  { value: 'custom', label: 'Outra fonte', icon: Type },
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

export default function Materializar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspace } = useWorkspace();
  const templateId = (location.state as { templateId?: string; solutionType?: string })?.templateId;
  const solutionType = (location.state as { templateId?: string; solutionType?: string })?.solutionType || 'app';
  const isApp = solutionType === 'app';
  
  const template: TemplateData | undefined = templateId ? getTemplateById(templateId) : undefined;
  const isTemplateMode = !!template;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [saving, setSaving] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  
  const { getSavedState, saveStep, saveFormData, clearState } = useModuleState('materializar');

  // Check for saved state on mount (only if not using template)
  useEffect(() => {
    if (isTemplateMode) return;
    const saved = getSavedState();
    if (saved && (saved.currentStep && saved.currentStep > 1 || (saved.formData && Object.keys(saved.formData).length > 0))) {
      setShowResumeBanner(true);
    }
  }, []);

  const handleResumeSession = () => {
    const saved = getSavedState();
    if (saved) {
      if (saved.currentStep) setCurrentStep(saved.currentStep);
      if (saved.formData) setFormData(prev => ({ ...prev, ...saved.formData }));
    }
    setShowResumeBanner(false);
  };

  const handleStartFresh = () => {
    clearState();
    setShowResumeBanner(false);
  };

  useEffect(() => {
    if (template) {
      setFormData({
        appName: template.appName,
        targetAudience: template.targetAudience,
        mainTask: template.mainTask,
        mainBenefit: template.mainBenefit,
        dailyUsers: template.dailyUsers,
        pages: template.pages,
        otherFeatures: template.otherFeatures,
        primaryColor: template.primaryColor,
        secondaryColor: template.secondaryColor,
        backgroundColor: template.backgroundColor,
        textColor: template.textColor,
        fontFamily: template.fontFamily,
        customFont: '',
        language: template.language,
        customLanguage: '',
        targetPlatform: template.targetPlatform,
      });
    }
  }, [template]);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const templateNames: Record<string, string> = {
    pizzaria: 'Pizzaria',
    hamburgueria: 'Hamburgueria',
    cafeteria: 'Cafeteria',
    barbearia: 'Barbearia',
    'nail-designer': 'Nail Designer',
    'loja-roupas': 'Loja de Roupas',
    academia: 'Academia',
    mecanica: 'Mecânica',
    'pet-shop': 'Pet Shop',
    delivery: 'Delivery',
    agendamento: 'Agendamento',
    'landing-page': 'Landing Page',
    'pagina-vendas': 'Página de Vendas',
    'site-institucional': 'Site Institucional',
    'pagina-mentoria': 'Página de Mentoria',
    'pagina-lancamento': 'Página de Lançamento',
    'pagina-captura': 'Página de Captura',
    'ecommerce-simples': 'E-commerce Simples',
    'negocio-local': 'Site para Negócio Local',
    portfolio: 'Portfólio / Apresentação',
  };

  const texts = {
    title: isApp ? 'Materializar SaaS' : 'Materializar Site',
    subtitle: isApp ? 'Configure as informações do seu aplicativo' : 'Configure as informações do seu site',
    nameLabel: isApp ? 'Qual o nome do seu aplicativo?' : 'Qual o nome do seu site/projeto?',
    namePlaceholder: isApp ? 'AgendaFácil, MeuTreino, Pizzaria do Zé' : 'MeuSite, LojaDaJu, Mentoria Pro',
    audienceLabel: isApp ? 'Para quem é este aplicativo?' : 'Para quem é este site?',
    audiencePlaceholder: isApp ? 'Donos de barbearia, donos de pizzaria, lojistas locais' : 'Empreendedores digitais, pequenos negócios, profissionais liberais',
    taskLabel: isApp ? 'Qual é a principal tarefa que este app vai fazer?' : 'Qual é o principal objetivo deste site?',
    taskPlaceholder: isApp ? 'Anotar pedidos, agendar horários, gerenciar cardápio' : 'Vender um produto digital, apresentar a empresa, converter leads',
    benefitLabel: isApp ? 'Qual é a maior ajuda que este app vai dar para o usuário?' : 'Qual é o maior benefício que este site vai proporcionar?',
    benefitPlaceholder: isApp ? 'Vender mais, organizar pedidos, eliminar WhatsApp' : 'Aumentar conversões, gerar credibilidade, capturar leads qualificados',
    usersLabel: isApp ? 'Quem vai usar o aplicativo no dia a dia?' : 'Quem vai visitar e interagir com o site?',
    usersPlaceholder: isApp ? 'Clientes finais, funcionários, gerente' : 'Visitantes do site, leads, clientes potenciais',
    pagesLabel: isApp ? 'Quais páginas/telas o aplicativo deve ter?' : 'Quais seções/páginas o site deve ter?',
    pagesPlaceholder: isApp ? 'Login, Cardápio, Carrinho, Perfil, Admin' : 'Hero, Benefícios, Depoimentos, Preços, FAQ, Contato',
    featuresLabel: 'Outros recursos importantes',
    featuresPlaceholder: isApp ? 'Cupons, fidelidade, notificações, integração com WhatsApp' : 'Pop-up de captura, chat ao vivo, integração com redes sociais',
  };

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

  const generatePrompt = (): string => {
    const templateName = templateId ? templateNames[templateId] || templateId : 'Projeto personalizado';
    const font = formData.fontFamily === 'custom' ? formData.customFont : formData.fontFamily;
    const languageLabel = formData.language === 'other' ? formData.customLanguage : (languages.find(l => l.value === formData.language)?.label || formData.language);
    const platformLabel = platforms.find(p => p.value === formData.targetPlatform)?.label || formData.targetPlatform;
    const solutionLabel = isApp ? 'Aplicativo / SaaS' : 'Site / Página Web';

    const painPointsSection = template?.painPoints?.length 
      ? `## DORES DO NICHO QUE O PROJETO RESOLVE:\n${template.painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nO projeto deve demonstrar claramente como cada uma dessas dores é resolvida através das funcionalidades implementadas.`
      : '';

    const operationalFlowSection = template?.operationalFlow
      ? `## FLUXO OPERACIONAL REAL:\n${template.operationalFlow}\n\nIMPORTANTE: Todas as etapas deste fluxo devem estar implementadas e clicáveis no frontend. O usuário deve conseguir navegar por todo o processo.`
      : '';

    const metricsSection = template?.businessMetrics?.length
      ? `## MÉTRICAS DE NEGÓCIO PARA DASHBOARDS:\nIncluir no painel administrativo ou dashboards:\n${template.businessMetrics.map(m => `- ${m}`).join('\n')}`
      : '';

    const automationsSection = template?.automations?.length
      ? `## AUTOMAÇÕES E SUGESTÕES INTELIGENTES:\n${template.automations.map(a => `- ${a}`).join('\n')}\n\nSimular estas automações visualmente no frontend com estados, notificações e feedback.`
      : '';

    const appInstructions = `## REQUISITOS OBRIGATÓRIOS PARA APLICATIVO/SAAS:

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

    const siteInstructions = `## REQUISITOS OBRIGATÓRIOS PARA SITE/PÁGINA WEB:

1. **Estrutura Focada em Conversão**
   - Hero Section impactante com headline clara e CTA principal visível
   - Seção de Problema/Dor que gera identificação
   - Seção de Solução/Benefícios com clareza
   - Prova Social forte (depoimentos, logos, números)
   - FAQ para responder objeções
   - CTAs estrategicamente posicionados (mínimo 3 ao longo da página)
   - Urgência ou escassez quando aplicável

2. **Design Responsivo e Moderno**
   - Layout mobile-first perfeito
   - Tipografia legível com hierarquia clara
   - Espaçamentos generosos
   - Imagens e ícones de alta qualidade
   - Cores aplicadas estrategicamente

3. **Navegação e UX**
   - Menu fixo ou sticky
   - Links âncora para seções com scroll suave
   - Botões claros com estados hover
   - Footer completo com informações de contato

4. **SEO e Performance**
   - Tags de título e meta description
   - Estrutura semântica (h1, h2, h3 corretos)
   - Alt text em imagens
   - Lazy loading de imagens

5. **Elementos de Conversão**
   - Formulários de captura com validação visual
   - Botões de WhatsApp/contato flutuantes
   - Feedback visual ao preencher formulários
   - Animações que guiam o olhar para CTAs

6. **SEM Autenticação Obrigatória**
   - Não incluir login/cadastro a menos que explicitamente solicitado
   - Foco total na experiência do visitante e conversão

CRÍTICO: Gerar código COMPLETO com conteúdo REAL e PERSUASIVO. Textos devem ser copy de vendas real, não placeholder. Cada seção deve ter propósito claro de conversão.`;

    const prompt = `# PROJETO: ${formData.appName}

## 1. CONTEXTO DO PROJETO
- **Tipo de solução:** ${solutionLabel}
- **Modelo base:** ${templateName}
- **Descrição:** ${isApp 
  ? `Aplicativo completo para o segmento de ${templateName.toLowerCase()}, desenvolvido para resolver problemas operacionais reais e facilitar a gestão do negócio.`
  : `Site/página web do tipo ${templateName.toLowerCase()}, desenvolvido para converter visitantes em clientes com foco em resultados.`
}

## 2. PÚBLICO-ALVO
${formData.targetAudience}

## 3. ${isApp ? 'FUNÇÃO PRINCIPAL' : 'OBJETIVO PRINCIPAL'}
${formData.mainTask}

## 4. PROBLEMA RESOLVIDO / BENEFÍCIO PRINCIPAL
${formData.mainBenefit}

## 5. ${isApp ? 'USUÁRIOS DO SISTEMA' : 'VISITANTES DO SITE'}
${formData.dailyUsers}

${painPointsSection}

${operationalFlowSection}

## 6. ${isApp ? 'TELAS/PÁGINAS ESSENCIAIS' : 'SEÇÕES/PÁGINAS ESSENCIAIS'}
${formData.pages}

## 7. FUNCIONALIDADES ADICIONAIS
${formData.otherFeatures || 'Nenhuma funcionalidade adicional especificada.'}

${metricsSection}

${automationsSection}

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
${isApp ? appInstructions : siteInstructions}`;

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

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      if (!formData.appName.trim()) {
        newErrors.appName = 'Nome do aplicativo é obrigatório';
      }
      if (!formData.targetAudience.trim()) {
        newErrors.targetAudience = 'Público-alvo é obrigatório';
      }
    }

    if (step === 2) {
      if (!formData.mainTask.trim()) {
        newErrors.mainTask = 'Tarefa principal é obrigatória';
      }
      if (!formData.mainBenefit.trim()) {
        newErrors.mainBenefit = 'Benefício principal é obrigatório';
      }
      if (!formData.dailyUsers.trim()) {
        newErrors.dailyUsers = 'Usuários do dia a dia é obrigatório';
      }
    }

    if (step === 3) {
      if (!formData.pages.trim()) {
        newErrors.pages = 'Páginas/telas são obrigatórias';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
        saveStep(newStep);
      } else if (currentStep === totalSteps - 1) {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      saveStep(newStep);
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
        template_id: templateId || null,
        app_name: formData.appName,
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
        status: 'draft',
        generated_prompt: prompt,
      }).select('id').single();

      if (error) throw error;

      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        type: 'project_created',
        message: `Projeto "${formData.appName}" foi criado`,
        metadata: { project_name: formData.appName },
      });

      setProjectId(data.id);
      setGeneratedPrompt(prompt);
      setCurrentStep(totalSteps);
      clearState(); // Clear saved state after successful submission
      toast.success('Projeto materializado com sucesso!');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erro ao criar projeto');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (!isTemplateMode) {
        saveFormData(updated);
      }
      return updated;
    });
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

  return (
    <AppLayout title={texts.title}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{texts.title}</h1>
            <p className="text-muted-foreground">
              {texts.subtitle}
            </p>
          </div>
        </div>

        {/* Resume Session Banner */}
        {showResumeBanner && !isTemplateMode && (
          <ResumeSessionBanner
            title="Continuar de onde parou?"
            description={`Você estava na etapa ${getSavedState()?.currentStep || 1} de ${totalSteps}`}
            onResume={handleResumeSession}
            onStartFresh={handleStartFresh}
          />
        )}

        {/* Template Mode Banner */}
        {isTemplateMode && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Modelo pronto: {template?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Este modelo já vem pronto. Ajuste se quiser ou vá direto para Materializar.
              </p>
            </div>
          </div>
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
                {currentStep === 2 && <Rocket className="h-5 w-5 text-primary" />}
                {currentStep === 3 && <Check className="h-5 w-5 text-primary" />}
                {currentStep === 4 && <Palette className="h-5 w-5 text-primary" />}
                {currentStep === 5 && <FileText className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <CardTitle>
                  {currentStep === 1 && (isApp ? 'Identidade do App' : 'Identidade do Site')}
                  {currentStep === 2 && (isApp ? 'Propósito e Usuários' : 'Objetivo e Visitantes')}
                  {currentStep === 3 && (isApp ? 'Estrutura e Recursos' : 'Seções e Recursos')}
                  {currentStep === 4 && 'Identidade Visual e Configurações'}
                  {currentStep === 5 && 'Conceito Materializado'}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && (isApp ? 'Defina o nome e público do seu aplicativo' : 'Defina o nome e público do seu site')}
                  {currentStep === 2 && (isApp ? 'Descreva a função principal e benefícios' : 'Descreva o objetivo principal e benefícios')}
                  {currentStep === 3 && (isApp ? 'Configure as páginas e recursos extras' : 'Configure as seções e recursos extras')}
                  {currentStep === 4 && 'Personalize cores, fontes, idioma e plataforma'}
                  {currentStep === 5 && (isApp ? 'Copie o prompt e crie seu app na plataforma' : 'Copie o prompt e crie seu site na plataforma')}
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
                    {texts.nameLabel} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="appName"
                    value={formData.appName}
                    onChange={(e) => updateField('appName', e.target.value)}
                    placeholder={texts.namePlaceholder}
                    className={errors.appName ? 'border-destructive' : ''}
                  />
                  {errors.appName && (
                    <p className="text-sm text-destructive">{errors.appName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">
                    {texts.audienceLabel} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => updateField('targetAudience', e.target.value)}
                    placeholder={texts.audiencePlaceholder}
                    rows={2}
                    className={errors.targetAudience ? 'border-destructive' : ''}
                  />
                  {errors.targetAudience && (
                    <p className="text-sm text-destructive">{errors.targetAudience}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Purpose */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="mainTask">
                    {texts.taskLabel} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="mainTask"
                    value={formData.mainTask}
                    onChange={(e) => updateField('mainTask', e.target.value)}
                    placeholder={texts.taskPlaceholder}
                    rows={2}
                    className={errors.mainTask ? 'border-destructive' : ''}
                  />
                  {errors.mainTask && (
                    <p className="text-sm text-destructive">{errors.mainTask}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mainBenefit">
                    {texts.benefitLabel} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="mainBenefit"
                    value={formData.mainBenefit}
                    onChange={(e) => updateField('mainBenefit', e.target.value)}
                    placeholder={texts.benefitPlaceholder}
                    rows={3}
                    className={errors.mainBenefit ? 'border-destructive' : ''}
                  />
                  {errors.mainBenefit && (
                    <p className="text-sm text-destructive">{errors.mainBenefit}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyUsers">
                    {texts.usersLabel} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="dailyUsers"
                    value={formData.dailyUsers}
                    onChange={(e) => updateField('dailyUsers', e.target.value)}
                    placeholder={texts.usersPlaceholder}
                    rows={2}
                    className={errors.dailyUsers ? 'border-destructive' : ''}
                  />
                  {errors.dailyUsers && (
                    <p className="text-sm text-destructive">{errors.dailyUsers}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Structure */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="pages">
                    {texts.pagesLabel} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pages"
                    value={formData.pages}
                    onChange={(e) => updateField('pages', e.target.value)}
                    placeholder={texts.pagesPlaceholder}
                    className={errors.pages ? 'border-destructive' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isApp ? 'Separe as páginas por vírgula' : 'Separe as seções por vírgula'}
                  </p>
                  {errors.pages && (
                    <p className="text-sm text-destructive">{errors.pages}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherFeatures">
                    {texts.featuresLabel} <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Textarea
                    id="otherFeatures"
                    value={formData.otherFeatures}
                    onChange={(e) => updateField('otherFeatures', e.target.value)}
                    placeholder={texts.featuresPlaceholder}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Visual Identity with Cards */}
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
                    <span className="font-medium">Projeto materializado com sucesso!</span>
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
                    onClick={() => navigate('/solucoes')}
                    className="w-full gap-2"
                  >
                    Voltar para Soluções
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
                  disabled={currentStep === 1 || saving}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>

                <Button onClick={handleNext} disabled={saving} className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Materializando...
                    </>
                  ) : currentStep === 4 ? (
                    <>
                      Materializar Conceito
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

        {/* Step Indicators */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <button
              key={step}
              onClick={() => {
                if (step < currentStep && step < 5) {
                  setCurrentStep(step);
                  setErrors({});
                }
              }}
              disabled={saving || step === 5}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${step === currentStep 
                  ? 'bg-primary w-8' 
                  : step < currentStep 
                    ? 'bg-primary/50 cursor-pointer hover:bg-primary/70' 
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
