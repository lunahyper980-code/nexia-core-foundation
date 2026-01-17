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
import { 
  siteTypeOptions, 
  sectionsByType, 
  fieldsByType, 
  fontOptions, 
  styleOptions 
} from '@/data/siteTypeFields';
import { useModuleState } from '@/hooks/useModuleState';
import { ResumeSessionBanner } from '@/components/ResumeSessionBanner';
import { AISuggestButton, AISuggestionsPanel, type Suggestion } from '@/components/ai-suggest';
import { useAISuggestions } from '@/hooks/useAISuggestions';

const TOTAL_STEPS = 5;

interface WizardData {
  // Step 1 - Site Info
  siteName: string;
  siteType: string;
  customSiteType: string;
  businessDescription: string;
  targetAudience: string;
  // Step 2 - Dynamic fields based on type
  dynamicFields: Record<string, string>;
  // Step 3 - Sections
  selectedSections: string[];
  customSections: string;
  // Step 4 - Visual Identity
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
  customSiteType: '',
  businessDescription: '',
  targetAudience: '',
  dynamicFields: {},
  selectedSections: [],
  customSections: '',
  primaryColor: '#8000FF',
  secondaryColor: '#1F1F1F',
  backgroundColor: '#171717',
  textColor: '#FFFFFF',
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
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  
  const { getSavedState, saveStep, saveFormData, clearState } = useModuleState('criar-site');
  
  // AI Suggestions hook
  const {
    isLoading: isLoadingSuggestions,
    suggestions,
    isVisible: isSuggestionsVisible,
    appliedSuggestions,
    generateSuggestions,
    applySuggestion,
    closeSuggestions,
    clearSuggestions
  } = useAISuggestions({ projectType: 'site' });
  
  // Parse Nexia data from URL
  const nexiaData = parseNexiaParams(searchParams);

  // Check for saved state on mount (only if not coming from Nexia)
  useEffect(() => {
    if (nexiaData) return;
    const saved = getSavedState();
    if (saved && (saved.currentStep && saved.currentStep > 1 || (saved.formData && Object.keys(saved.formData).length > 0))) {
      setShowResumeBanner(true);
    }
  }, []);

  const handleResumeSession = () => {
    const saved = getSavedState();
    if (saved) {
      if (saved.currentStep) setCurrentStep(saved.currentStep);
      if (saved.formData) setData(prev => ({ ...prev, ...saved.formData }));
    }
    setShowResumeBanner(false);
  };

  const handleStartFresh = () => {
    clearState();
    setShowResumeBanner(false);
  };

  // Pre-fill form with Nexia data
  useEffect(() => {
    if (nexiaData) {
      setData(prev => ({
        ...prev,
        siteName: nexiaData.projectName || nexiaData.companyName || prev.siteName,
        businessDescription: nexiaData.sectorNiche ? `Negócio do setor de ${nexiaData.sectorNiche}` : prev.businessDescription,
        targetAudience: nexiaData.targetAudience || prev.targetAudience,
      }));
    }
  }, []);

  // Reset sections when site type changes
  useEffect(() => {
    if (data.siteType) {
      const suggestedSections = sectionsByType[data.siteType] || sectionsByType['outro'];
      // Pre-select first 3 sections
      setData(prev => ({
        ...prev,
        selectedSections: suggestedSections.slice(0, 3).map(s => s.id),
      }));
    }
  }, [data.siteType]);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const updateData = (field: keyof WizardData, value: string | string[] | Record<string, string>) => {
    setData(prev => {
      const updated = { ...prev, [field]: value };
      saveFormData(updated);
      return updated;
    });
  };

  const updateDynamicField = (fieldId: string, value: string) => {
    setData(prev => {
      const updated = {
        ...prev,
        dynamicFields: { ...prev.dynamicFields, [fieldId]: value }
      };
      saveFormData(updated);
      return updated;
    });
  };

  const toggleSection = (sectionId: string) => {
    setData(prev => {
      const updated = {
        ...prev,
        selectedSections: prev.selectedSections.includes(sectionId)
          ? prev.selectedSections.filter(id => id !== sectionId)
          : [...prev.selectedSections, sectionId]
      };
      saveFormData(updated);
      return updated;
    });
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      saveStep(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      saveStep(newStep);
    } else {
      navigate('/solucoes/criar/site');
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setCurrentStep(step);
      saveStep(step);
    }
  };

  const getSiteTypeLabel = () => {
    if (data.siteType === 'outro') {
      return data.customSiteType || 'Site Personalizado';
    }
    return siteTypeOptions.find(t => t.id === data.siteType)?.label || data.siteType;
  };

  const getCurrentSections = () => {
    return sectionsByType[data.siteType] || sectionsByType['outro'];
  };

  const getCurrentFields = () => {
    return fieldsByType[data.siteType] || fieldsByType['outro'];
  };

  // Get fields for current step for AI suggestions
  const getStepFields = () => {
    switch (currentStep) {
      case 1:
        return [
          { id: 'siteName', label: 'Nome do site', currentValue: data.siteName },
          { id: 'businessDescription', label: 'Descrição do negócio', currentValue: data.businessDescription },
          { id: 'targetAudience', label: 'Público-alvo', currentValue: data.targetAudience },
        ];
      case 2:
        const currentFields = getCurrentFields();
        return currentFields.map(f => ({
          id: f.id,
          label: f.label,
          currentValue: data.dynamicFields[f.id] || ''
        }));
      default:
        return [];
    }
  };

  const handleGenerateSuggestions = () => {
    clearSuggestions();
    generateSuggestions({
      step: currentStep,
      fields: getStepFields(),
      context: {
        siteName: data.siteName,
        siteType: getSiteTypeLabel(),
        businessDescription: data.businessDescription,
        targetAudience: data.targetAudience,
        dynamicFields: data.dynamicFields,
      }
    });
  };

  const handleApplySuggestion = (suggestion: Suggestion) => {
    const value = applySuggestion(suggestion);
    if (currentStep === 1) {
      updateData(suggestion.fieldId as keyof WizardData, value);
    } else if (currentStep === 2) {
      updateDynamicField(suggestion.fieldId, value);
    }
    toast.success('Sugestão aplicada!');
  };

  const generatePrompt = async () => {
    setIsGenerating(true);
    
    const sections = getCurrentSections();
    const selectedSectionLabels = data.selectedSections
      .map(id => sections.find(s => s.id === id)?.label)
      .filter(Boolean);
    
    if (data.customSections) {
      selectedSectionLabels.push(...data.customSections.split(',').map(s => s.trim()));
    }

    // Build dynamic fields section
    const currentFields = getCurrentFields();
    const dynamicFieldsText = currentFields
      .filter(f => data.dynamicFields[f.id])
      .map(f => `**${f.label}:** ${data.dynamicFields[f.id]}`)
      .join('\n');

    const prompt = `
=== PROMPT PARA CRIAÇÃO DE SITE NO LOVABLE ===

🌐 TIPO DE SOLUÇÃO: Site / Página Web
📋 TIPO ESPECÍFICO: ${getSiteTypeLabel()}

---

## 1. CONTEXTO DO PROJETO

Você vai criar um site/página chamado "${data.siteName || 'Meu Site'}".

${data.customSiteType ? `**Tipo personalizado:** ${data.customSiteType}` : ''}

**Sobre o negócio:**
${data.businessDescription || 'A definir'}

**Público-alvo:**
${data.targetAudience || 'A definir'}

---

## 2. INFORMAÇÕES ESPECÍFICAS DO ${getSiteTypeLabel().toUpperCase()}

${dynamicFieldsText || 'Informações a serem definidas durante o desenvolvimento.'}

---

## 3. ESTRUTURA DE SEÇÕES

O site deve conter as seguintes seções:

${selectedSectionLabels.length > 0 ? selectedSectionLabels.map((section, i) => `${i + 1}. ${section}`).join('\n') : 'Seções a serem definidas conforme o tipo de site.'}

---

## 4. IDENTIDADE VISUAL

- **Cor primária:** ${data.primaryColor}
- **Cor secundária:** ${data.secondaryColor}
- **Cor de fundo:** ${data.backgroundColor}
- **Cor do texto:** ${data.textColor}
- **Tipografia:** ${data.fontFamily}
- **Estilo visual:** ${styleOptions.find(s => s.id === data.style)?.label || 'Moderno'}
- **Idioma:** ${data.language === 'pt-BR' ? 'Português (Brasil)' : data.language}

---

## 5. INSTRUÇÃO FINAL PARA O LOVABLE

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

NÃO INCLUIR (a menos que solicitado):
- Sistema de autenticação
- Área de login/cadastro
- Painel administrativo

O site deve estar PRONTO PARA PUBLICAÇÃO.
Foco total em CONVERSÃO e EXPERIÊNCIA DO USUÁRIO.

=== FIM DO PROMPT ===
`.trim();

    setGeneratedPrompt(prompt);
    setCurrentStep(TOTAL_STEPS);
    clearState();
    
    // Save to database
    if (workspace) {
      try {
        const { data: projectData } = await supabase.from('projects').insert({
          workspace_id: workspace.id,
          app_name: data.siteName,
          target_audience: data.targetAudience,
          main_task: data.dynamicFields.mainObjective || data.dynamicFields.mainPurpose || '',
          main_benefit: data.dynamicFields.valueProposition || data.dynamicFields.transformation || '',
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

  const stepIcons = [Lightbulb, Target, Layout, Palette, Sparkles];
  const stepTitles = [
    'Tipo do Site',
    'Contexto',
    'Seções',
    'Visual',
    'Prompt'
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* AI Suggest Button */}
            <div className="flex justify-end">
              <AISuggestButton
                onClick={handleGenerateSuggestions}
                isLoading={isLoadingSuggestions}
              />
            </div>

            {/* AI Suggestions Panel */}
            <AISuggestionsPanel
              suggestions={suggestions}
              appliedSuggestions={appliedSuggestions}
              onApply={handleApplySuggestion}
              onClose={closeSuggestions}
              isVisible={isSuggestionsVisible}
            />

            {/* Resume Session Banner */}
            {showResumeBanner && (
              <ResumeSessionBanner
                title="Continuar de onde parou?"
                description={`Você estava na etapa ${getSavedState()?.currentStep || 1} de ${TOTAL_STEPS}`}
                onResume={handleResumeSession}
                onStartFresh={handleStartFresh}
              />
            )}

            {/* Nexia Origin Banner */}
            {nexiaData && (
              <NexiaOriginBanner nexiaData={nexiaData} />
            )}

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Tipo do Site</h2>
              <p className="text-muted-foreground mt-2">
                {nexiaData ? 'Confirme ou edite as informações abaixo' : 'Que tipo de site você quer criar?'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nome do site ou projeto</Label>
                <Input
                  id="siteName"
                  placeholder="Ex: Curso de Marketing, Consultoria Silva, Loja Virtual..."
                  value={data.siteName}
                  onChange={(e) => updateData('siteName', e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Que tipo de site você quer criar?</Label>
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

              {/* Custom type field */}
              {data.siteType === 'outro' && (
                <div className="space-y-2">
                  <Label htmlFor="customSiteType">Descreva o tipo de site</Label>
                  <Input
                    id="customSiteType"
                    placeholder="Ex: Blog, Site de eventos, Plataforma de cursos..."
                    value={data.customSiteType}
                    onChange={(e) => updateData('customSiteType', e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="businessDescription">Descreva seu negócio ou oferta</Label>
                <Textarea
                  id="businessDescription"
                  placeholder="Ex: Sou nutricionista e ofereço consultoria online para emagrecimento saudável..."
                  value={data.businessDescription}
                  onChange={(e) => updateData('businessDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Quem é seu público-alvo?</Label>
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
        const currentFields = getCurrentFields();
        return (
          <div className="space-y-6">
            {/* AI Suggest Button */}
            <div className="flex justify-end">
              <AISuggestButton
                onClick={handleGenerateSuggestions}
                isLoading={isLoadingSuggestions}
              />
            </div>

            {/* AI Suggestions Panel */}
            <AISuggestionsPanel
              suggestions={suggestions}
              appliedSuggestions={appliedSuggestions}
              onApply={handleApplySuggestion}
              onClose={closeSuggestions}
              isVisible={isSuggestionsVisible}
            />

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Contexto do {getSiteTypeLabel()}</h2>
              <p className="text-muted-foreground mt-2">
                Informações específicas para seu tipo de site
              </p>
            </div>

            <div className="space-y-4">
              {currentFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      value={data.dynamicFields[field.id] || ''}
                      onChange={(e) => updateDynamicField(field.id, e.target.value)}
                      rows={field.rows || 2}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      placeholder={field.placeholder}
                      value={data.dynamicFields[field.id] || ''}
                      onChange={(e) => updateDynamicField(field.id, e.target.value)}
                    />
                  )}
                </div>
              ))}

              {currentFields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Selecione um tipo de site na etapa anterior para ver os campos específicos.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        const sections = getCurrentSections();
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Layout className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Seções do Site</h2>
              <p className="text-muted-foreground mt-2">
                Quais seções seu {getSiteTypeLabel()} precisa ter?
              </p>
            </div>

            <div className="space-y-4">
              <Label>Selecione as seções (clique para adicionar/remover)</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {sections.map((section) => {
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
            </div>
          </div>
        );

      case 4:
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
                  <Label htmlFor="primaryColor">1. Cor Primária</Label>
                  <p className="text-xs text-muted-foreground">A cor de destaque da marca, usada em CTAs e ícones.</p>
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
                      placeholder="#8000FF"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">2. Cor Secundária</Label>
                  <p className="text-xs text-muted-foreground">Uma cor de apoio para seções ou cards.</p>
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
                      placeholder="#1F1F1F"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">3. Cor de Fundo</Label>
                  <p className="text-xs text-muted-foreground">A cor de base para o fundo de toda a aplicação.</p>
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
                      placeholder="#171717"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor">4. Cor do Texto</Label>
                  <p className="text-xs text-muted-foreground">Cor para todos os textos e ícones.</p>
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
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipografia</Label>
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
                  {styleOptions.map((style) => (
                    <div 
                      key={style.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer ${data.style === style.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-border hover:bg-muted/50'}`}
                    >
                      <RadioGroupItem value={style.id} id={style.id} />
                      <Label htmlFor={style.id} className="cursor-pointer">{style.label}</Label>
                    </div>
                  ))}
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
                <Label className="text-sm text-muted-foreground mb-3 block">Pré-visualização da Interface</Label>
                <div 
                  className="rounded-lg p-6 transition-all"
                  style={{ backgroundColor: data.backgroundColor }}
                >
                  <div 
                    className="rounded-lg p-4 mb-3"
                    style={{ backgroundColor: data.secondaryColor }}
                  >
                    <span 
                      className="text-xs font-medium px-2 py-1 rounded"
                      style={{ backgroundColor: data.primaryColor, color: data.backgroundColor }}
                    >
                      NOVO
                    </span>
                    <p 
                      className="text-sm mt-2"
                      style={{ color: data.textColor, fontFamily: data.fontFamily }}
                    >
                      Este texto demonstra a legibilidade.
                    </p>
                  </div>
                  <button 
                    className="w-full py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: data.primaryColor, color: data.backgroundColor, fontFamily: data.fontFamily }}
                  >
                    Ação Principal
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
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
          
          {/* Step Indicators - Clickable */}
          <div className="flex justify-between">
            {stepIcons.map((Icon, index) => {
              const stepNum = index + 1;
              const isCompleted = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;
              
              return (
                <button 
                  key={index}
                  onClick={() => goToStep(stepNum)}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110
                    ${isCompleted 
                      ? 'bg-success text-success-foreground' 
                      : isCurrent 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                  title={stepTitles[index]}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </button>
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
            
            {currentStep === 4 ? (
              <Button 
                onClick={generatePrompt} 
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={isGenerating}
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
