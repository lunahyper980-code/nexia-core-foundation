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
  Users, 
  Layout, 
  GitBranch, 
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


const TOTAL_STEPS = 7;

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
];

const suggestedScreens = [
  { id: 'login', label: 'Login / Cadastro', description: 'Autenticação de usuários' },
  { id: 'home', label: 'Tela Principal (Home)', description: 'Dashboard ou visão geral' },
  { id: 'main-action', label: 'Tela da Ação Principal', description: 'Onde a função principal acontece' },
  { id: 'history', label: 'Histórico', description: 'Registro de ações anteriores' },
  { id: 'profile', label: 'Perfil do Usuário', description: 'Dados e configurações pessoais' },
  { id: 'admin', label: 'Painel Administrativo', description: 'Gestão e relatórios' },
  { id: 'notifications', label: 'Notificações', description: 'Alertas e avisos' },
  { id: 'settings', label: 'Configurações', description: 'Preferências do app' },
];

interface WizardData {
  // Step 1 - Idea
  appName: string;
  businessType: string;
  targetAudience: string;
  mainProblem: string;
  // Step 2 - Main Function
  mainAction: string;
  actionFrequency: string;
  primaryUser: string;
  // Step 3 - System Users
  endUser: string;
  adminUser: string;
  needsAdminPanel: string;
  // Step 4 - Essential Screens
  selectedScreens: string[];
  customScreens: string;
  // Step 5 - Operational Flow
  onEnterAction: string;
  afterMainAction: string;
  hasStatusTracking: string;
  hasHistory: string;
  // Step 6 - Visual Identity
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  language: string;
  targetPlatform: string;
}

const initialData: WizardData = {
  appName: '',
  businessType: '',
  targetAudience: '',
  mainProblem: '',
  mainAction: '',
  actionFrequency: '',
  primaryUser: 'clientes',
  endUser: '',
  adminUser: '',
  needsAdminPanel: 'sim',
  selectedScreens: ['login', 'home', 'main-action'],
  customScreens: '',
  onEnterAction: '',
  afterMainAction: '',
  hasStatusTracking: 'sim',
  hasHistory: 'sim',
  primaryColor: '#8B5CF6',
  secondaryColor: '#6366F1',
  backgroundColor: '#0F0A1A',
  textColor: '#F8FAFC',
  fontFamily: 'Inter',
  language: 'pt-BR',
  targetPlatform: 'lovable',
};

export default function HyperBuildApp() {
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
        appName: nexiaData.projectName || nexiaData.companyName || prev.appName,
        businessType: nexiaData.sectorNiche || prev.businessType,
        targetAudience: nexiaData.targetAudience || prev.targetAudience,
        mainProblem: nexiaData.mainProblem || nexiaData.primaryGoal || prev.mainProblem,
      }));
    }
  }, []);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const updateData = (field: keyof WizardData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleScreen = (screenId: string) => {
    setData(prev => ({
      ...prev,
      selectedScreens: prev.selectedScreens.includes(screenId)
        ? prev.selectedScreens.filter(id => id !== screenId)
        : [...prev.selectedScreens, screenId]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.appName && data.businessType && data.targetAudience && data.mainProblem;
      case 2:
        return data.mainAction && data.actionFrequency;
      case 3:
        return data.endUser;
      case 4:
        return data.selectedScreens.length > 0;
      case 5:
        return data.onEnterAction && data.afterMainAction;
      case 6:
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
      navigate('/solucoes/criar/app');
    }
  };

  const generatePrompt = async () => {
    setIsGenerating(true);
    
    const selectedScreenLabels = data.selectedScreens
      .map(id => suggestedScreens.find(s => s.id === id)?.label)
      .filter(Boolean);
    
    if (data.customScreens) {
      selectedScreenLabels.push(...data.customScreens.split(',').map(s => s.trim()));
    }

    const prompt = `
=== PROMPT PARA CRIAÇÃO DE APLICATIVO NO LOVABLE ===

📱 TIPO DE SOLUÇÃO: Aplicativo / SaaS

---

## 1. CONTEXTO DO PROJETO

Você vai criar um aplicativo completo chamado "${data.appName}".

Este é um app para ${data.businessType}, voltado para ${data.targetAudience}.

O principal problema que resolve: ${data.mainProblem}

---

## 2. FUNÇÃO PRINCIPAL DO APP

A ação principal do aplicativo é: ${data.mainAction}

Frequência de uso dessa ação: ${data.actionFrequency}

O app é usado principalmente por: ${data.primaryUser === 'clientes' ? 'Clientes/Usuários finais' : data.primaryUser === 'gestores' ? 'Gestores/Administradores' : 'Ambos (clientes e gestores)'}

---

## 3. USUÁRIOS DO SISTEMA

**Usuário final (quem usa no dia a dia):**
${data.endUser}

**Administrador (quem gerencia):**
${data.adminUser || 'O próprio dono do negócio'}

**Painel administrativo:** ${data.needsAdminPanel === 'sim' ? 'Sim, incluir painel de gestão completo' : 'Não necessário'}

---

## 4. TELAS ESSENCIAIS DO APLICATIVO

O app deve conter as seguintes telas:
${selectedScreenLabels.map(screen => `- ${screen}`).join('\n')}

---

## 5. FLUXO OPERACIONAL REAL

**Ao entrar no app, o usuário:**
${data.onEnterAction}

**Após realizar a ação principal:**
${data.afterMainAction}

**Acompanhamento de status:** ${data.hasStatusTracking === 'sim' ? 'Sim - O usuário pode acompanhar o status em tempo real' : 'Não necessário'}

**Histórico de ações:** ${data.hasHistory === 'sim' ? 'Sim - Manter registro completo de todas as ações' : 'Não necessário'}

---

## 6. IDENTIDADE VISUAL

- **Cor primária:** ${data.primaryColor}
- **Cor secundária:** ${data.secondaryColor}
- **Cor de fundo:** ${data.backgroundColor}
- **Cor do texto:** ${data.textColor}
- **Tipografia:** ${data.fontFamily}
- **Idioma:** ${data.language === 'pt-BR' ? 'Português (Brasil)' : data.language}

---

## 7. INSTRUÇÃO FINAL PARA O LOVABLE

Crie este aplicativo completo e funcional com as seguintes características OBRIGATÓRIAS:

### AUTENTICAÇÃO E SEGURANÇA
- Sistema de login e cadastro completo
- Proteção de rotas para usuários autenticados
- Perfis de usuário com dados editáveis

### INTERFACE E EXPERIÊNCIA
- Design moderno, limpo e profissional
- Totalmente responsivo (mobile-first)
- Animações suaves e micro-interações
- Feedback visual claro para todas as ações
- Loading states e tratamento de erros

### FUNCIONALIDADES CORE
- Todas as telas listadas acima devem ser funcionais
- Navegação intuitiva entre as telas
- Fluxo operacional conforme descrito
- Estados de vazio, carregamento e erro

${data.needsAdminPanel === 'sim' ? `### PAINEL ADMINISTRATIVO
- Dashboard com métricas principais
- Gestão de usuários
- Relatórios e estatísticas
- Configurações do sistema` : ''}

### QUALIDADE DE CÓDIGO
- Componentes reutilizáveis
- TypeScript tipado corretamente
- Integração com Supabase para persistência
- Código limpo e organizado

NÃO criar mockups ou protótipos. Criar o aplicativo COMPLETO e FUNCIONAL.
Todas as interações devem funcionar de verdade.
O app deve estar pronto para uso real.

=== FIM DO PROMPT ===
`.trim();

    setGeneratedPrompt(prompt);
    setCurrentStep(TOTAL_STEPS);
    
    // Save to database
    if (workspace) {
      try {
        const { data: projectData } = await supabase.from('projects').insert({
          workspace_id: workspace.id,
          app_name: data.appName,
          target_audience: data.targetAudience,
          main_task: data.mainAction,
          main_benefit: data.mainProblem,
          daily_users: data.endUser,
          pages: selectedScreenLabels.join(', '),
          other_features: data.customScreens,
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
            description: `Aplicativo "${data.appName}" criado a partir do planejamento Nexia`,
            message: `Aplicativo "${data.appName}" criado a partir do planejamento Nexia`,
            metadata: { 
              planning_id: nexiaData.planningId,
              client_id: nexiaData.clientId,
              solution_type: 'app',
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

  const stepIcons = [Lightbulb, Target, Users, Layout, GitBranch, Palette, Sparkles];
  const stepTitles = [
    'Ideia do Aplicativo',
    'Função Principal',
    'Usuários do Sistema',
    'Telas Essenciais',
    'Fluxo Operacional',
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
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Ideia do Aplicativo</h2>
              <p className="text-muted-foreground mt-2">
                {nexiaData ? 'Confirme ou edite as informações abaixo' : 'Vamos começar entendendo sua ideia. Não precisa ser técnico!'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Nome do aplicativo *</Label>
                <Input
                  id="appName"
                  placeholder="Ex: MeuDelivery, AgendaFácil, GestãoPro..."
                  value={data.appName}
                  onChange={(e) => updateData('appName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Tipo de negócio ou ideia *</Label>
                <Input
                  id="businessType"
                  placeholder="Ex: delivery de comida, agendamento de serviços, gestão de clientes..."
                  value={data.businessType}
                  onChange={(e) => updateData('businessType', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Para quem é o aplicativo? *</Label>
                <Input
                  id="targetAudience"
                  placeholder="Ex: donos de pizzarias, salões de beleza, academias..."
                  value={data.targetAudience}
                  onChange={(e) => updateData('targetAudience', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainProblem">Qual problema principal ele resolve? *</Label>
                <Textarea
                  id="mainProblem"
                  placeholder="Ex: acabar com anotações em papel, organizar agendamentos, controlar entregas..."
                  value={data.mainProblem}
                  onChange={(e) => updateData('mainProblem', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Função Principal</h2>
              <p className="text-muted-foreground mt-2">
                Qual é a ação mais importante que o app realiza?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mainAction">Qual é a ação principal do app? *</Label>
                <Textarea
                  id="mainAction"
                  placeholder="Ex: fazer pedidos de comida, agendar horários, cadastrar clientes..."
                  value={data.mainAction}
                  onChange={(e) => updateData('mainAction', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionFrequency">Com que frequência essa ação acontece? *</Label>
                <Select value={data.actionFrequency} onValueChange={(value) => updateData('actionFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muitas-vezes-dia">Muitas vezes ao dia</SelectItem>
                    <SelectItem value="algumas-vezes-dia">Algumas vezes ao dia</SelectItem>
                    <SelectItem value="diariamente">Uma vez por dia</SelectItem>
                    <SelectItem value="semanalmente">Semanalmente</SelectItem>
                    <SelectItem value="ocasionalmente">Ocasionalmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>O app é usado mais por quem?</Label>
                <RadioGroup value={data.primaryUser} onValueChange={(value) => updateData('primaryUser', value)}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="clientes" id="clientes" />
                    <Label htmlFor="clientes" className="cursor-pointer flex-1">
                      <span className="font-medium">Clientes / Usuários finais</span>
                      <p className="text-sm text-muted-foreground">Pessoas que usam o serviço</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="gestores" id="gestores" />
                    <Label htmlFor="gestores" className="cursor-pointer flex-1">
                      <span className="font-medium">Gestores / Administradores</span>
                      <p className="text-sm text-muted-foreground">Donos ou funcionários do negócio</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="ambos" id="ambos" />
                    <Label htmlFor="ambos" className="cursor-pointer flex-1">
                      <span className="font-medium">Ambos igualmente</span>
                      <p className="text-sm text-muted-foreground">Clientes e gestores usam bastante</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Usuários do Sistema</h2>
              <p className="text-muted-foreground mt-2">
                Quem vai usar o aplicativo no dia a dia?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endUser">Quem usa como usuário final? *</Label>
                <Textarea
                  id="endUser"
                  placeholder="Ex: clientes que fazem pedidos, pacientes que agendam consultas..."
                  value={data.endUser}
                  onChange={(e) => updateData('endUser', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminUser">Quem usa como administrador?</Label>
                <Textarea
                  id="adminUser"
                  placeholder="Ex: dono da loja, recepcionista, gerente... (opcional)"
                  value={data.adminUser}
                  onChange={(e) => updateData('adminUser', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>O app precisa de painel administrativo?</Label>
                <RadioGroup value={data.needsAdminPanel} onValueChange={(value) => updateData('needsAdminPanel', value)}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="sim" id="admin-sim" />
                    <Label htmlFor="admin-sim" className="cursor-pointer flex-1">
                      <span className="font-medium">Sim</span>
                      <p className="text-sm text-muted-foreground">Incluir dashboard, relatórios e gestão</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="nao" id="admin-nao" />
                    <Label htmlFor="admin-nao" className="cursor-pointer flex-1">
                      <span className="font-medium">Não</span>
                      <p className="text-sm text-muted-foreground">Apenas o app para usuários finais</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Layout className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Telas Essenciais</h2>
              <p className="text-muted-foreground mt-2">
                Selecione as telas que seu app precisa ter
              </p>
            </div>

            <div className="space-y-4">
              <Label>Telas sugeridas (clique para selecionar)</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {suggestedScreens.map((screen) => {
                  const isSelected = data.selectedScreens.includes(screen.id);
                  return (
                    <div
                      key={screen.id}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }
                      `}
                      onClick={() => toggleScreen(screen.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} className="mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{screen.label}</p>
                          <p className="text-sm text-muted-foreground">{screen.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="customScreens">Outras telas que você precisa (opcional)</Label>
                <Input
                  id="customScreens"
                  placeholder="Ex: Carrinho, Pagamento, Cupons... (separar por vírgula)"
                  value={data.customScreens}
                  onChange={(e) => updateData('customScreens', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GitBranch className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Fluxo Operacional</h2>
              <p className="text-muted-foreground mt-2">
                Como o usuário navega e usa o app?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="onEnterAction">O que o usuário faz ao entrar no app? *</Label>
                <Textarea
                  id="onEnterAction"
                  placeholder="Ex: vê os produtos disponíveis, visualiza seus agendamentos, acessa o dashboard..."
                  value={data.onEnterAction}
                  onChange={(e) => updateData('onEnterAction', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="afterMainAction">O que acontece após a ação principal? *</Label>
                <Textarea
                  id="afterMainAction"
                  placeholder="Ex: pedido vai para a cozinha, horário fica reservado, cliente recebe confirmação..."
                  value={data.afterMainAction}
                  onChange={(e) => updateData('afterMainAction', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>Existe acompanhamento de status?</Label>
                <RadioGroup value={data.hasStatusTracking} onValueChange={(value) => updateData('hasStatusTracking', value)}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="sim" id="status-sim" />
                    <Label htmlFor="status-sim" className="cursor-pointer flex-1">
                      <span className="font-medium">Sim</span>
                      <p className="text-sm text-muted-foreground">Usuário acompanha em tempo real (preparo, entrega...)</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="nao" id="status-nao" />
                    <Label htmlFor="status-nao" className="cursor-pointer flex-1">
                      <span className="font-medium">Não</span>
                      <p className="text-sm text-muted-foreground">Não precisa de acompanhamento</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Existe histórico de ações?</Label>
                <RadioGroup value={data.hasHistory} onValueChange={(value) => updateData('hasHistory', value)}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="sim" id="history-sim" />
                    <Label htmlFor="history-sim" className="cursor-pointer flex-1">
                      <span className="font-medium">Sim</span>
                      <p className="text-sm text-muted-foreground">Manter registro de pedidos, agendamentos, etc.</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="nao" id="history-nao" />
                    <Label htmlFor="history-nao" className="cursor-pointer flex-1">
                      <span className="font-medium">Não</span>
                      <p className="text-sm text-muted-foreground">Não precisa de histórico</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Identidade Visual</h2>
              <p className="text-muted-foreground mt-2">
                Defina as cores e estilo do seu app
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor primária *</Label>
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
                      placeholder="#8B5CF6"
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
                      placeholder="#6366F1"
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
                      placeholder="#0F0A1A"
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
                      placeholder="#F8FAFC"
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
                  className="rounded-lg p-4 transition-all"
                  style={{ backgroundColor: data.backgroundColor }}
                >
                  <p 
                    className="font-bold text-lg mb-2"
                    style={{ color: data.primaryColor, fontFamily: data.fontFamily }}
                  >
                    {data.appName || 'Seu App'}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: data.textColor, fontFamily: data.fontFamily }}
                  >
                    Texto de exemplo com a cor e fonte selecionadas
                  </p>
                  <button 
                    className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: data.primaryColor, color: data.backgroundColor }}
                  >
                    Botão Exemplo
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Prompt Gerado!</h2>
              <p className="text-muted-foreground mt-2">
                Seu prompt está pronto. Copie e cole no Lovable para criar seu app.
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
              <Button onClick={copyPrompt} className="flex-1 gap-2">
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
                <li>Aguarde a IA criar seu aplicativo!</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout title="Criar do Zero">
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
                        ? 'bg-primary text-primary-foreground' 
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
            
            {currentStep === 6 ? (
              <Button 
                onClick={generatePrompt} 
                className="flex-1 gap-2"
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
