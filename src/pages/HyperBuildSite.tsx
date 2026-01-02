import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Lightbulb, 
  Target, 
  Layout, 
  FileText, 
  Palette, 
  Sparkles,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { NexiaOriginBanner, parseNexiaParams } from '@/components/nexia';


const TOTAL_STEPS = 6;

const fontOptions = [
  'Inter',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Nunito',
  'Raleway',
  'Space Grotesk',
  'DM Sans',
  'Playfair Display',
  'Merriweather',
];

const siteTypeOptions = [
  { id: 'landing-page', label: 'Landing Page', description: 'Página única de conversão' },
  { id: 'pagina-vendas', label: 'Página de Vendas', description: 'Vender produto ou serviço' },
  { id: 'captura-leads', label: 'Captura de Leads', description: 'Coletar emails e contatos' },
  { id: 'institucional', label: 'Site Institucional', description: 'Apresentar empresa' },
  { id: 'portfolio', label: 'Portfólio', description: 'Mostrar trabalhos' },
  { id: 'lancamento', label: 'Página de Lançamento', description: 'Lançar produto novo' },
];

const suggestedSections = [
  { id: 'hero', label: 'Hero / Cabeçalho', description: 'Título principal e CTA' },
  { id: 'problema', label: 'Problema / Dor', description: 'O que o cliente sofre hoje' },
  { id: 'solucao', label: 'Solução', description: 'Como você resolve' },
  { id: 'beneficios', label: 'Benefícios', description: 'Vantagens do produto/serviço' },
  { id: 'como-funciona', label: 'Como Funciona', description: 'Passo a passo' },
  { id: 'depoimentos', label: 'Depoimentos', description: 'Prova social' },
  { id: 'precos', label: 'Preços / Planos', description: 'Tabela de valores' },
  { id: 'faq', label: 'Perguntas Frequentes', description: 'FAQ' },
  { id: 'sobre', label: 'Sobre / Quem Somos', description: 'História e equipe' },
  { id: 'contato', label: 'Contato', description: 'Formulário ou dados' },
  { id: 'cta-final', label: 'CTA Final', description: 'Chamada para ação final' },
  { id: 'garantia', label: 'Garantia', description: 'Política de devolução' },
];

interface WizardData {
  // Step 1 - Site Idea
  siteName: string;
  siteType: string;
  businessDescription: string;
  targetAudience: string;
  // Step 2 - Main Objective
  mainObjective: string;
  desiredAction: string;
  uniqueValue: string;
  // Step 3 - Sections
  selectedSections: string[];
  customSections: string;
  // Step 4 - Content
  mainHeadline: string;
  subHeadline: string;
  mainOffer: string;
  ctaText: string;
  // Step 5 - Visual Identity
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  style: string;
  language: string;
  targetPlatform: string;
}

const initialData: WizardData = {
  siteName: '',
  siteType: '',
  businessDescription: '',
  targetAudience: '',
  mainObjective: '',
  desiredAction: '',
  uniqueValue: '',
  selectedSections: ['hero', 'beneficios', 'cta-final'],
  customSections: '',
  mainHeadline: '',
  subHeadline: '',
  mainOffer: '',
  ctaText: '',
  primaryColor: '#10B981',
  secondaryColor: '#059669',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  fontFamily: 'Inter',
  style: 'moderno',
  language: 'pt-BR',
  targetPlatform: 'lovable',
};

export default function HyperBuildSite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Parse Nexia data from URL
  const nexiaData = parseNexiaParams(searchParams);

  // Pre-fill form with Nexia data
  useEffect(() => {
    if (nexiaData) {
      setData(prev => ({
        ...prev,
        siteName: nexiaData.projectName || nexiaData.companyName || prev.siteName,
        businessDescription: nexiaData.sectorNiche ? `Negócio do setor de ${nexiaData.sectorNiche}` : prev.businessDescription,
        targetAudience: nexiaData.targetAudience || prev.targetAudience,
        mainObjective: nexiaData.primaryGoal === 'vender_mais' ? 'vender' : 
                       nexiaData.primaryGoal === 'captar_clientes' ? 'capturar-leads' : 
                       nexiaData.primaryGoal === 'presenca_profissional' ? 'apresentar' : prev.mainObjective,
        uniqueValue: nexiaData.mainProblem || prev.uniqueValue,
      }));
    }
  }, []);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const updateData = (field: keyof WizardData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (sectionId: string) => {
    setData(prev => ({
      ...prev,
      selectedSections: prev.selectedSections.includes(sectionId)
        ? prev.selectedSections.filter(id => id !== sectionId)
        : [...prev.selectedSections, sectionId]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.siteName && data.siteType && data.businessDescription && data.targetAudience;
      case 2:
        return data.mainObjective && data.desiredAction;
      case 3:
        return data.selectedSections.length > 0;
      case 4:
        return data.mainHeadline;
      case 5:
        return data.primaryColor && data.fontFamily;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/solucoes/criar/site');
    }
  };

  const getSiteTypeLabel = () => {
    return siteTypeOptions.find(t => t.id === data.siteType)?.label || data.siteType;
  };

  const generatePrompt = async () => {
    setIsGenerating(true);
    
    const selectedSectionLabels = data.selectedSections
      .map(id => suggestedSections.find(s => s.id === id)?.label)
      .filter(Boolean);
    
    if (data.customSections) {
      selectedSectionLabels.push(...data.customSections.split(',').map(s => s.trim()));
    }

    const prompt = `
=== PROMPT PARA CRIAÇÃO DE SITE NO LOVABLE ===

🌐 TIPO DE SOLUÇÃO: Site / Página Web
📋 TIPO ESPECÍFICO: ${getSiteTypeLabel()}

---

## 1. CONTEXTO DO PROJETO

Você vai criar um site/página chamado "${data.siteName}".

**Sobre o negócio:**
${data.businessDescription}

**Público-alvo:**
${data.targetAudience}

---

## 2. OBJETIVO PRINCIPAL

**O que este site precisa fazer:**
${data.mainObjective}

**Ação desejada do visitante:**
${data.desiredAction}

**Diferencial / Proposta de valor única:**
${data.uniqueValue || 'Destacar os principais benefícios e resultados'}

---

## 3. ESTRUTURA DE SEÇÕES

O site deve conter as seguintes seções (nesta ordem):

${selectedSectionLabels.map((section, i) => `${i + 1}. ${section}`).join('\n')}

---

## 4. CONTEÚDO E COPY

**Headline principal (H1):**
"${data.mainHeadline}"

${data.subHeadline ? `**Subheadline:**
"${data.subHeadline}"` : ''}

${data.mainOffer ? `**Oferta principal:**
${data.mainOffer}` : ''}

**Texto do botão CTA:**
"${data.ctaText || 'Começar Agora'}"

---

## 5. IDENTIDADE VISUAL

- **Cor primária:** ${data.primaryColor}
- **Cor secundária:** ${data.secondaryColor}
- **Cor de fundo:** ${data.backgroundColor}
- **Cor do texto:** ${data.textColor}
- **Tipografia:** ${data.fontFamily}
- **Estilo visual:** ${data.style === 'moderno' ? 'Moderno e clean' : data.style === 'ousado' ? 'Ousado e impactante' : data.style === 'elegante' ? 'Elegante e sofisticado' : 'Minimalista'}
- **Idioma:** ${data.language === 'pt-BR' ? 'Português (Brasil)' : data.language}

---

## 6. INSTRUÇÃO FINAL PARA O LOVABLE

Crie este site completo e profissional com as seguintes características OBRIGATÓRIAS:

### ESTRUTURA E CONVERSÃO
- Página única (one-page) com navegação suave por âncoras
- Hierarquia visual clara: headline > subheadline > corpo > CTA
- Múltiplos pontos de conversão (CTAs) distribuídos estrategicamente
- Formulário de contato ou captura funcional
- Seções bem definidas com espaçamento generoso

### DESIGN E UX
- Design moderno, profissional e de alta conversão
- 100% responsivo (mobile-first obrigatório)
- Animações sutis de scroll (fade-in, slide-up)
- Imagens de placeholder de alta qualidade
- Contraste adequado para leitura
- Botões destacados com hover states

### SEO E PERFORMANCE
- Meta tags otimizadas (title, description)
- Estrutura semântica (header, main, section, footer)
- Alt text em todas as imagens
- Loading rápido (lazy loading em imagens)
- Tag H1 única e relevante

### ELEMENTOS OBRIGATÓRIOS
- Header fixo com navegação
- Hero section impactante com CTA principal
- Footer com links e informações de contato
- Ícones para benefícios e features
- Espaço para depoimentos com fotos

### QUALIDADE
- Código TypeScript limpo
- Componentes reutilizáveis
- Tailwind CSS para estilização
- Design system consistente

NÃO INCLUIR:
- Sistema de autenticação (a menos que solicitado)
- Área de login/cadastro
- Painel administrativo

O site deve estar PRONTO PARA PUBLICAÇÃO.
Foco total em CONVERSÃO e EXPERIÊNCIA DO USUÁRIO.

=== FIM DO PROMPT ===
`.trim();

    setGeneratedPrompt(prompt);
    setCurrentStep(TOTAL_STEPS);
    
    // Save to database
    if (workspace) {
      try {
        const { data: projectData } = await supabase.from('projects').insert({
          workspace_id: workspace.id,
          app_name: data.siteName,
          target_audience: data.targetAudience,
          main_task: data.mainObjective,
          main_benefit: data.uniqueValue,
          daily_users: data.targetAudience,
          pages: selectedSectionLabels.join(', '),
          other_features: data.customSections,
          primary_color: data.primaryColor,
          secondary_color: data.secondaryColor,
          background_color: data.backgroundColor,
          text_color: data.textColor,
          font_family: data.fontFamily,
          language: data.language,
          target_platform: data.targetPlatform,
          generated_prompt: prompt,
          status: 'prompt_generated'
        }).select().single();

        // Log activity if came from Nexia
        if (nexiaData?.planningId && user) {
          await supabase.from('activity_logs').insert({
            workspace_id: workspace.id,
            user_id: user.id,
            type: 'SOLUTION_CREATED_FROM_NEXIA',
            entity_type: 'project',
            entity_id: projectData?.id || null,
            title: 'Solução digital criada',
            description: `Site "${data.siteName}" criado a partir do planejamento Nexia`,
            message: `Site "${data.siteName}" criado a partir do planejamento Nexia`,
            metadata: { 
              planning_id: nexiaData.planningId,
              client_id: nexiaData.clientId,
              solution_type: 'site',
              mode: nexiaData.mode
            }
          });
        }

        toast.success('Projeto salvo com sucesso!');
      } catch (error) {
        console.error('Error saving project:', error);
      }
    }

    setIsGenerating(false);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success('Prompt copiado para a área de transferência!');
  };

  const openLovable = () => {
    window.open('https://lovable.dev', '_blank');
  };

  const stepIcons = [Lightbulb, Target, Layout, FileText, Palette, Sparkles];
  const stepTitles = [
    'Ideia do Site',
    'Objetivo Principal',
    'Estrutura de Seções',
    'Conteúdo e Copy',
    'Identidade Visual',
    'Gerar Prompt'
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Nexia Origin Banner */}
            {nexiaData && (
              <NexiaOriginBanner nexiaData={nexiaData} />
            )}

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Ideia do Site</h2>
              <p className="text-muted-foreground mt-2">
                {nexiaData ? 'Confirme ou edite as informações abaixo' : 'Vamos entender o que você quer criar. Seja direto!'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nome do site ou projeto *</Label>
                <Input
                  id="siteName"
                  placeholder="Ex: Curso de Marketing, Consultoria Silva, Loja Virtual..."
                  value={data.siteName}
                  onChange={(e) => updateData('siteName', e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Que tipo de site você quer criar? *</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {siteTypeOptions.map((type) => (
                    <div
                      key={type.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${data.siteType === type.id 
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500' 
                          : 'border-border hover:border-emerald-500/50 hover:bg-muted/50'
                        }
                      `}
                      onClick={() => updateData('siteType', type.id)}
                    >
                      <p className="font-medium text-foreground">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription">Descreva seu negócio ou oferta *</Label>
                <Textarea
                  id="businessDescription"
                  placeholder="Ex: Sou nutricionista e ofereço consultoria online para emagrecimento saudável..."
                  value={data.businessDescription}
                  onChange={(e) => updateData('businessDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Quem é seu público-alvo? *</Label>
                <Input
                  id="targetAudience"
                  placeholder="Ex: Mulheres de 25-45 anos que querem emagrecer sem dietas restritivas"
                  value={data.targetAudience}
                  onChange={(e) => updateData('targetAudience', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Objetivo Principal</h2>
              <p className="text-muted-foreground mt-2">
                O que você quer que o visitante faça no seu site?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Qual é o objetivo principal? *</Label>
                <RadioGroup value={data.mainObjective} onValueChange={(value) => updateData('mainObjective', value)}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="vender" id="vender" />
                    <Label htmlFor="vender" className="cursor-pointer flex-1">
                      <span className="font-medium">Vender produto ou serviço</span>
                      <p className="text-sm text-muted-foreground">Converter visitantes em clientes pagantes</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="capturar-leads" id="capturar-leads" />
                    <Label htmlFor="capturar-leads" className="cursor-pointer flex-1">
                      <span className="font-medium">Capturar leads (emails/contatos)</span>
                      <p className="text-sm text-muted-foreground">Construir lista para relacionamento</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="agendar" id="agendar" />
                    <Label htmlFor="agendar" className="cursor-pointer flex-1">
                      <span className="font-medium">Agendar reunião ou consulta</span>
                      <p className="text-sm text-muted-foreground">Gerar agendamentos qualificados</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="apresentar" id="apresentar" />
                    <Label htmlFor="apresentar" className="cursor-pointer flex-1">
                      <span className="font-medium">Apresentar a empresa</span>
                      <p className="text-sm text-muted-foreground">Mostrar credibilidade e serviços</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <Label htmlFor="whatsapp" className="cursor-pointer flex-1">
                      <span className="font-medium">Levar para o WhatsApp</span>
                      <p className="text-sm text-muted-foreground">Iniciar conversa direta</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desiredAction">Descreva a ação principal que o visitante deve fazer *</Label>
                <Textarea
                  id="desiredAction"
                  placeholder="Ex: Clicar no botão e comprar o curso, preencher o formulário para receber o ebook..."
                  value={data.desiredAction}
                  onChange={(e) => updateData('desiredAction', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniqueValue">O que te diferencia da concorrência? (opcional)</Label>
                <Textarea
                  id="uniqueValue"
                  placeholder="Ex: Método exclusivo, garantia de 30 dias, resultados comprovados..."
                  value={data.uniqueValue}
                  onChange={(e) => updateData('uniqueValue', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Layout className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Estrutura de Seções</h2>
              <p className="text-muted-foreground mt-2">
                Quais seções seu site precisa ter?
              </p>
            </div>

            <div className="space-y-4">
              <Label>Selecione as seções (clique para adicionar/remover)</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestedSections.map((section) => {
                  const isSelected = data.selectedSections.includes(section.id);
                  return (
                    <div
                      key={section.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500' 
                          : 'border-border hover:border-emerald-500/50 hover:bg-muted/50'
                        }
                      `}
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} className="mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{section.label}</p>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="customSections">Outras seções que você precisa (opcional)</Label>
                <Input
                  id="customSections"
                  placeholder="Ex: Parceiros, Cases, Certificações... (separar por vírgula)"
                  value={data.customSections}
                  onChange={(e) => updateData('customSections', e.target.value)}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Dica:</strong> Para landing pages de conversão, 
                  recomendamos: Hero → Problema → Solução → Benefícios → Depoimentos → CTA Final
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Conteúdo e Copy</h2>
              <p className="text-muted-foreground mt-2">
                O que vai aparecer no seu site?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mainHeadline">Headline principal (título do hero) *</Label>
                <Textarea
                  id="mainHeadline"
                  placeholder="Ex: Emagreça 10kg em 90 dias sem passar fome"
                  value={data.mainHeadline}
                  onChange={(e) => updateData('mainHeadline', e.target.value)}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Dica: Use um benefício claro ou promessa específica
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subHeadline">Subheadline (apoio ao título)</Label>
                <Textarea
                  id="subHeadline"
                  placeholder="Ex: Método natural aprovado por nutricionistas, já ajudou mais de 5.000 pessoas"
                  value={data.subHeadline}
                  onChange={(e) => updateData('subHeadline', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainOffer">Qual é sua oferta principal?</Label>
                <Textarea
                  id="mainOffer"
                  placeholder="Ex: Curso completo + bônus + suporte por 1 ano por apenas 12x de R$97"
                  value={data.mainOffer}
                  onChange={(e) => updateData('mainOffer', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaText">Texto do botão principal (CTA)</Label>
                <Input
                  id="ctaText"
                  placeholder="Ex: Quero Começar Agora, Agendar Consulta, Baixar Ebook..."
                  value={data.ctaText}
                  onChange={(e) => updateData('ctaText', e.target.value)}
                />
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 rounded-lg border border-border bg-gradient-to-br from-muted/30 to-muted/10">
                <Label className="text-sm text-muted-foreground mb-3 block">Prévia do Hero</Label>
                <div className="text-center py-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    {data.mainHeadline || 'Sua headline aparecerá aqui'}
                  </h1>
                  {data.subHeadline && (
                    <p className="text-muted-foreground mb-4">{data.subHeadline}</p>
                  )}
                  <Button style={{ backgroundColor: data.primaryColor }}>
                    {data.ctaText || 'Começar Agora'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Identidade Visual</h2>
              <p className="text-muted-foreground mt-2">
                Defina as cores e estilo do seu site
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor primária (botões/destaques) *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={data.primaryColor}
                      onChange={(e) => updateData('primaryColor', e.target.value)}
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={data.primaryColor}
                      onChange={(e) => updateData('primaryColor', e.target.value)}
                      placeholder="#10B981"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={data.secondaryColor}
                      onChange={(e) => updateData('secondaryColor', e.target.value)}
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={data.secondaryColor}
                      onChange={(e) => updateData('secondaryColor', e.target.value)}
                      placeholder="#059669"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Cor de fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={data.backgroundColor}
                      onChange={(e) => updateData('backgroundColor', e.target.value)}
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={data.backgroundColor}
                      onChange={(e) => updateData('backgroundColor', e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor">Cor do texto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={data.textColor}
                      onChange={(e) => updateData('textColor', e.target.value)}
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={data.textColor}
                      onChange={(e) => updateData('textColor', e.target.value)}
                      placeholder="#1F2937"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipografia *</Label>
                <Select value={data.fontFamily} onValueChange={(value) => updateData('fontFamily', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Estilo visual</Label>
                <RadioGroup value={data.style} onValueChange={(value) => updateData('style', value)} className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${data.style === 'moderno' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border hover:bg-muted/50'}`}>
                    <RadioGroupItem value="moderno" id="moderno" />
                    <Label htmlFor="moderno" className="cursor-pointer">Moderno</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${data.style === 'ousado' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border hover:bg-muted/50'}`}>
                    <RadioGroupItem value="ousado" id="ousado" />
                    <Label htmlFor="ousado" className="cursor-pointer">Ousado</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${data.style === 'elegante' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border hover:bg-muted/50'}`}>
                    <RadioGroupItem value="elegante" id="elegante" />
                    <Label htmlFor="elegante" className="cursor-pointer">Elegante</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${data.style === 'minimalista' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border hover:bg-muted/50'}`}>
                    <RadioGroupItem value="minimalista" id="minimalista" />
                    <Label htmlFor="minimalista" className="cursor-pointer">Minimalista</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={data.language} onValueChange={(value) => updateData('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 rounded-lg border border-border">
                <Label className="text-sm text-muted-foreground mb-3 block">Prévia das cores</Label>
                <div 
                  className="rounded-lg p-6 transition-all"
                  style={{ backgroundColor: data.backgroundColor }}
                >
                  <p 
                    className="font-bold text-xl mb-2"
                    style={{ color: data.primaryColor, fontFamily: data.fontFamily }}
                  >
                    {data.siteName || 'Seu Site'}
                  </p>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: data.textColor, fontFamily: data.fontFamily }}
                  >
                    Texto de exemplo com a cor e fonte selecionadas
                  </p>
                  <button 
                    className="px-6 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: data.primaryColor, color: data.backgroundColor }}
                  >
                    {data.ctaText || 'Botão CTA'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Prompt Gerado!</h2>
              <p className="text-muted-foreground mt-2">
                Seu prompt está pronto. Copie e cole no Lovable para criar seu site.
              </p>
            </div>

            <Card className="border-success/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Prompt completo</span>
                  <Button variant="outline" size="sm" onClick={copyPrompt} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copiar
                  </Button>
                </div>
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  className="min-h-[300px] font-mono text-sm bg-muted/30"
                />
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={copyPrompt} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Copy className="h-4 w-4" />
                Copiar Prompt
              </Button>
              <Button onClick={openLovable} variant="outline" className="flex-1 gap-2">
                <ExternalLink className="h-4 w-4" />
                Abrir Lovable
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Próximos passos:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Clique em "Copiar Prompt"</li>
                <li>Abra o Lovable (ou clique no botão acima)</li>
                <li>Cole o prompt no chat do Lovable</li>
                <li>Aguarde a IA criar seu site!</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout title="Criar Site">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Etapa {currentStep} de {TOTAL_STEPS}
            </span>
            <span className="font-medium text-foreground">
              {stepTitles[currentStep - 1]}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between">
            {stepIcons.map((Icon, index) => {
              const stepNum = index + 1;
              const isCompleted = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              
              return (
                <div 
                  key={index}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all
                    ${isCompleted 
                      ? 'bg-success text-success-foreground' 
                      : isCurrent 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < TOTAL_STEPS && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 1 ? 'Cancelar' : 'Voltar'}
            </Button>
            
            {currentStep === 5 ? (
              <Button 
                onClick={generatePrompt} 
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={!canProceed() || isGenerating}
              >
                {isGenerating ? (
                  <>Gerando...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Gerar Prompt
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                className="flex-1 gap-2"
                disabled={!canProceed()}
              >
                Avançar
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Final step - back to start */}
        {currentStep === TOTAL_STEPS && (
          <Button 
            variant="outline" 
            onClick={() => navigate('/solucoes')} 
            className="w-full"
          >
            Voltar para Soluções Digitais
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
