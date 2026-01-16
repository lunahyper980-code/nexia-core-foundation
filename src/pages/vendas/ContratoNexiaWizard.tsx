import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Building2,
  Layers,
  FileText,
  DollarSign,
  Shield,
  Sparkles,
  Check,
  Copy,
  Download,
  Loader2,
  AlertTriangle,
  CreditCard,
  Circle,
  Settings,
  Landmark,
} from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useModuleState } from '@/hooks/useModuleState';
import { ResumeSessionBanner } from '@/components/ResumeSessionBanner';

// ==============================================
// TIPOS DE SOLUÇÃO E ENTREGÁVEIS
// ==============================================

type SolutionType = 
  | 'app'
  | 'site'
  | 'posicionamento'
  | 'kit-lancamento'
  | 'autoridade'
  | 'organizacao';

interface SolutionConfig {
  id: SolutionType;
  label: string;
  description: string;
  defaultDeliverables: string[];
  platforms?: string[];
  contractLanguage: string;
}

const SOLUTIONS: SolutionConfig[] = [
  {
    id: 'app',
    label: 'Criação de Aplicativo',
    description: 'Desenvolvimento de aplicativo personalizado',
    platforms: ['Web App', 'PWA', 'Android', 'iOS'],
    defaultDeliverables: [
      'Desenvolvimento do aplicativo conforme escopo',
      'Layout responsivo e personalizado',
      'Funcionalidades acordadas',
      'Testes e ajustes finais',
      'Publicação e entrega',
    ],
    contractLanguage: 'O presente contrato tem por objeto o desenvolvimento de aplicativo digital conforme especificações técnicas e funcionais acordadas entre as partes.',
  },
  {
    id: 'site',
    label: 'Criação de Site / Landing Page',
    description: 'Desenvolvimento de site ou página de vendas',
    platforms: ['Institucional', 'Landing Page', 'Site com formulário', 'E-commerce simples'],
    defaultDeliverables: [
      'Desenvolvimento do site conforme escopo',
      'Layout responsivo',
      'SEO básico',
      'Integração com WhatsApp/formulário',
      'Publicação e entrega',
    ],
    contractLanguage: 'O presente contrato tem por objeto o desenvolvimento de site/landing page profissional conforme especificações acordadas entre as partes.',
  },
  {
    id: 'posicionamento',
    label: 'Posicionamento Digital',
    description: 'Estratégia de posicionamento de marca',
    defaultDeliverables: [
      'Posicionamento central da marca',
      'Tom de comunicação definido',
      'Bio profissional otimizada',
      'Diretrizes de conteúdo',
      'Documento estratégico completo',
    ],
    contractLanguage: 'O presente contrato tem por objeto a elaboração de estratégia de posicionamento digital, contemplando definição de mensagem central, tom de comunicação e diretrizes estratégicas.',
  },
  {
    id: 'kit-lancamento',
    label: 'Kit de Lançamento Digital',
    description: 'Estrutura completa para lançamento',
    defaultDeliverables: [
      'Estrutura de lançamento',
      'Ideia de oferta estruturada',
      'Sequência de ações',
      'Mensagens de divulgação',
      'Checklist de execução',
      'Logo conceitual (quando aplicável)',
    ],
    contractLanguage: 'O presente contrato tem por objeto a elaboração de kit de lançamento digital, contemplando estrutura estratégica, cronograma de ações e materiais de apoio.',
  },
  {
    id: 'autoridade',
    label: 'Autoridade & Reconhecimento Digital',
    description: 'Estratégia de autoridade orgânica',
    defaultDeliverables: [
      'Estratégia de autoridade',
      'Ideias de conteúdo',
      'Checklist orgânico',
      'Diretrizes de posicionamento',
      'Documento estratégico completo',
    ],
    contractLanguage: 'O presente contrato tem por objeto a elaboração de estratégia de autoridade e reconhecimento digital, visando construção de presença orgânica e posicionamento de marca.',
  },
  {
    id: 'organizacao',
    label: 'Organização de Processos',
    description: 'Estruturação de processos internos',
    defaultDeliverables: [
      'Fluxo de atendimento otimizado',
      'Organização interna',
      'Rotinas diárias e semanais',
      'Checklists operacionais',
      'Documento de processos',
    ],
    contractLanguage: 'O presente contrato tem por objeto a estruturação e organização de processos internos, contemplando fluxos de trabalho, rotinas e checklists operacionais.',
  },
];

// ==============================================
// STEPS CONFIG
// ==============================================

const STEPS = [
  { id: 1, label: 'Contratado', icon: User },
  { id: 2, label: 'Contratante', icon: Building2 },
  { id: 3, label: 'Projeto', icon: Landmark },
  { id: 4, label: 'Valores', icon: CreditCard },
  { id: 5, label: 'Cláusulas', icon: Circle },
  { id: 6, label: 'Gerar', icon: Settings },
];

// ==============================================
// MAIN COMPONENT
// ==============================================

export default function ContratoNexiaWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  
  const solutionParam = searchParams.get('solucao') as SolutionType | null;
  const projectName = searchParams.get('projeto') || '';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContract, setGeneratedContract] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  
  const { getSavedState, saveStep, saveFormData, clearState } = useModuleState('contrato-nexia');

  // Form state
  const [formData, setFormData] = useState({
    // Step 1 - Contratado
    contractedType: 'pj' as 'pf' | 'pj',
    contractedName: '',
    contractedDocument: '',
    contractedResponsible: '',
    contractedCity: '',
    
    // Step 2 - Contratante
    contractorType: 'pf' as 'pf' | 'pj',
    contractorName: '',
    contractorDocument: '',
    contractorCity: '',
    
    // Step 3 - Projeto
    solutionType: solutionParam || '' as SolutionType | '',
    projectName: projectName,
    platforms: [] as string[],
    deliverables: '',
    exclusions: '',
    
    // Step 4 - Valores
    serviceValue: '',
    deadline: '',
    deadlineStart: 'signature' as 'signature' | 'payment',
    paymentTerms: '',
    paymentMethods: [] as string[],
    hasMaintenance: false,
    maintenanceValue: '',
    
    // Step 5 - Cláusulas
    portfolioRights: true,
    transferAfterPayment: true,
    terminationPenalty: true,
    scopeLimitation: true,
    additionalClauses: '',
  });

  // Check for saved state on mount (only if not pre-filled from URL)
  useEffect(() => {
    if (solutionParam || projectName) return;
    const saved = getSavedState();
    if (saved && (saved.currentStep && saved.currentStep > 1 || (saved.formData && Object.keys(saved.formData).length > 0))) {
      setShowResumeBanner(true);
    }
  }, [solutionParam, projectName]);

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

  // Auto-fill deliverables when solution changes
  useEffect(() => {
    if (formData.solutionType) {
      const solution = SOLUTIONS.find(s => s.id === formData.solutionType);
      if (solution && !formData.deliverables) {
        setFormData(prev => ({
          ...prev,
          deliverables: solution.defaultDeliverables.join('\n'),
        }));
      }
    }
  }, [formData.solutionType]);

  const updateForm = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      saveFormData(updated);
      return updated;
    });
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData(prev => {
      const arr = prev[field as keyof typeof prev] as string[];
      const updated = {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item],
      };
      saveFormData(updated);
      return updated;
    });
  };

  // Permitir pular etapas livremente
  const canProceed = () => true;

  const generateContractText = () => {
    const solution = SOLUTIONS.find(s => s.id === formData.solutionType);
    
    const contractedInfo = formData.contractedType === 'pj'
      ? `${formData.contractedName}, inscrita no CNPJ sob o nº ${formData.contractedDocument}, representada por ${formData.contractedResponsible || '[Responsável]'}`
      : `${formData.contractedName}, inscrito(a) no CPF sob o nº ${formData.contractedDocument}`;
    
    const contractorInfo = formData.contractorType === 'pj'
      ? `${formData.contractorName}, inscrita no CNPJ sob o nº ${formData.contractorDocument}`
      : `${formData.contractorName}, inscrito(a) no CPF sob o nº ${formData.contractorDocument}`;

    const clauses: string[] = [];
    if (formData.portfolioRights) {
      clauses.push('DIREITO DE PORTFÓLIO: A CONTRATADA fica autorizada a utilizar o projeto desenvolvido em seu portfólio e materiais de divulgação, resguardando informações confidenciais.');
    }
    if (formData.transferAfterPayment) {
      clauses.push('TRANSFERÊNCIA DE PROPRIEDADE: Os entregáveis, códigos-fonte e materiais desenvolvidos serão de propriedade do CONTRATANTE somente após a quitação total dos valores acordados.');
    }
    if (formData.terminationPenalty) {
      clauses.push('RESCISÃO: Em caso de rescisão unilateral sem justa causa, a parte que der causa pagará à outra multa equivalente a 20% (vinte por cento) do valor total do contrato, sem prejuízo do pagamento pelos serviços já executados.');
    }
    if (formData.scopeLimitation) {
      clauses.push('LIMITAÇÃO DE ESCOPO: Alterações, adições ou modificações não previstas neste contrato serão objeto de orçamento à parte, a ser aprovado previamente pelo CONTRATANTE.');
    }

    const text = `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS

${formData.projectName.toUpperCase()}

1. DAS PARTES

CONTRATADA: ${contractedInfo}, com sede/domicílio em ${formData.contractedCity}.

CONTRATANTE: ${contractorInfo}, com sede/domicílio em ${formData.contractorCity}.

2. DO OBJETO

${solution?.contractLanguage || 'O presente contrato tem por objeto a prestação de serviços digitais conforme especificações acordadas entre as partes.'}

3. DO ESCOPO E ENTREGÁVEIS

Nome do Projeto: ${formData.projectName}
${formData.platforms.length > 0 ? `\nPlataformas: ${formData.platforms.join(', ')}` : ''}

Os serviços compreendem:
${formData.deliverables.split('\n').map(d => `• ${d}`).join('\n')}

${formData.exclusions ? `\nNão estão inclusos:\n${formData.exclusions.split('\n').map(e => `• ${e}`).join('\n')}` : ''}

4. DO VALOR E PAGAMENTO

Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.serviceValue) || 0)}

Condições: ${formData.paymentTerms}

${formData.paymentMethods.length > 0 ? `Formas de pagamento aceitas: ${formData.paymentMethods.join(', ')}` : ''}

${formData.hasMaintenance ? `\nManutenção mensal: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.maintenanceValue) || 0)}` : ''}

5. DO PRAZO

O prazo de entrega é de ${formData.deadline}, contados a partir ${formData.deadlineStart === 'signature' ? 'da assinatura deste contrato' : 'do pagamento da entrada'}.

6. DAS RESPONSABILIDADES

DA CONTRATADA:
• Executar os serviços conforme especificações acordadas
• Cumprir os prazos estabelecidos
• Manter comunicação clara sobre o andamento do projeto
• Entregar os materiais conforme escopo definido

DO CONTRATANTE:
• Fornecer informações e materiais necessários tempestivamente
• Realizar pagamentos conforme acordado
• Aprovar etapas dentro dos prazos estipulados
• Manter canal de comunicação ativo

7. DAS CLÁUSULAS ESPECIAIS

${clauses.join('\n\n')}

${formData.additionalClauses ? `\nCláusulas adicionais:\n${formData.additionalClauses}` : ''}

8. DO FORO

Fica eleito o Foro da Comarca de ${formData.contractedCity} para dirimir quaisquer questões oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.

E, por estarem assim justas e contratadas, as partes firmam o presente instrumento em duas vias de igual teor e forma.

${formData.contractedCity}, _____ de _____________ de ______.



_______________________________
CONTRATADA
${formData.contractedName}
${formData.contractedDocument}



_______________________________
CONTRATANTE
${formData.contractorName}
${formData.contractorDocument}
    `.trim();

    return text;
  };

  const handleGenerate = async () => {
    if (!workspace?.id || !user?.id) return;
    
    setIsGenerating(true);
    
    try {
      const contractText = generateContractText();
      
      // Mapear tipo de solução para project_type compatível com demo_contracts
      const projectTypeMap: Record<string, string> = {
        'app': 'App',
        'site': 'Site',
        'posicionamento': 'Landing Page',
        'kit-lancamento': 'Landing Page',
        'autoridade': 'Landing Page',
        'organizacao': 'Sistema',
      };
      const projectType = projectTypeMap[formData.solutionType] || 'Site';
      
      // MODO SIMPLES: Salvar em demo_contracts (tabela unificada do modo simples)
      // Isso garante que o contrato apareça na sidebar /contratos e no dashboard
      const { data: inserted, error } = await supabase.from('demo_contracts').insert({
        workspace_id: workspace.id,
        owner_user_id: user.id,
        client_name: formData.contractorName || 'Cliente',
        project_type: projectType,
        value: parseFloat(formData.serviceValue) || 0,
        recurrence_type: formData.hasMaintenance ? 'Mensal' : 'Único',
        recurrence_value_monthly: formData.hasMaintenance ? parseFloat(formData.maintenanceValue) || 0 : 0,
        status: 'Rascunho', // Começa como rascunho
        start_date: new Date().toISOString().split('T')[0],
        is_demo: false, // Contrato real, não demo
      }).select().single();

      if (error) throw error;

      // Log activity
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        type: 'CONTRACT_GENERATED',
        message: `Contrato "${formData.projectName}" gerado para ${formData.contractorName}`,
        entity_type: 'demo_contract',
        entity_id: inserted?.id,
      });

      setGeneratedContract(contractText);
      setContractId(inserted?.id);
      setCurrentStep(6);
      clearState();
      
      toast.success('Contrato gerado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao gerar contrato: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedContract) {
      navigator.clipboard.writeText(generatedContract);
      toast.success('Contrato copiado!');
    }
  };

  const handleExportDoc = () => {
    if (!generatedContract) return;
    
    const blob = new Blob([generatedContract], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Contrato - ${formData.projectName || 'Nexia'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Arquivo DOC baixado!');
  };

  const handleExportPdf = () => {
    // Using browser print for PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Contrato - ${formData.projectName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <pre>${generatedContract}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('Janela de impressão/PDF aberta!');
  };

  // ==============================================
  // RENDER STEPS
  // ==============================================

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Seus Dados — Contratado</h3>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Pessoa</Label>
        <RadioGroup
          value={formData.contractedType}
          onValueChange={(v) => updateForm('contractedType', v)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pf" id="contracted-pf" />
            <Label htmlFor="contracted-pf" className="cursor-pointer">Pessoa Física</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pj" id="contracted-pj" />
            <Label htmlFor="contracted-pj" className="cursor-pointer">Pessoa Jurídica</Label>
          </div>
        </RadioGroup>
      </div>

      {formData.contractedType === 'pj' ? (
        <>
          <div className="space-y-2">
            <Label>Razão Social *</Label>
            <Input
              placeholder="Nome da empresa"
              value={formData.contractedName}
              onChange={(e) => updateForm('contractedName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>CNPJ *</Label>
            <Input
              placeholder="00.000.000/0000-00"
              value={formData.contractedDocument}
              onChange={(e) => updateForm('contractedDocument', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Nome do Responsável Legal</Label>
            <Input
              placeholder="Nome completo"
              value={formData.contractedResponsible}
              onChange={(e) => updateForm('contractedResponsible', e.target.value)}
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Nome Completo *</Label>
            <Input
              placeholder="Seu nome completo"
              value={formData.contractedName}
              onChange={(e) => updateForm('contractedName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>CPF *</Label>
            <Input
              placeholder="000.000.000-00"
              value={formData.contractedDocument}
              onChange={(e) => updateForm('contractedDocument', e.target.value)}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>Cidade (Foro do Contrato) *</Label>
        <Input
          placeholder="Ex: São Paulo - SP"
          value={formData.contractedCity}
          onChange={(e) => updateForm('contractedCity', e.target.value)}
        />
      </div>

      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        Esses dados podem ser salvos como padrão para próximos contratos nas configurações.
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Dados do Cliente — Contratante</h3>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Pessoa</Label>
        <RadioGroup
          value={formData.contractorType}
          onValueChange={(v) => updateForm('contractorType', v)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pf" id="contractor-pf" />
            <Label htmlFor="contractor-pf" className="cursor-pointer">Pessoa Física</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pj" id="contractor-pj" />
            <Label htmlFor="contractor-pj" className="cursor-pointer">Pessoa Jurídica</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>{formData.contractorType === 'pj' ? 'Razão Social' : 'Nome Completo'} *</Label>
        <Input
          placeholder={formData.contractorType === 'pj' ? 'Nome da empresa' : 'Nome completo do cliente'}
          value={formData.contractorName}
          onChange={(e) => updateForm('contractorName', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>{formData.contractorType === 'pj' ? 'CNPJ' : 'CPF'} *</Label>
        <Input
          placeholder={formData.contractorType === 'pj' ? '00.000.000/0000-00' : '000.000.000-00'}
          value={formData.contractorDocument}
          onChange={(e) => updateForm('contractorDocument', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Cidade / Estado *</Label>
        <Input
          placeholder="Ex: Rio de Janeiro - RJ"
          value={formData.contractorCity}
          onChange={(e) => updateForm('contractorCity', e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep3 = () => {
    const selectedSolution = SOLUTIONS.find(s => s.id === formData.solutionType);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Tipo de Solução e Escopo</h3>
        </div>

        <div className="space-y-2">
          <Label>Tipo de Solução Nexia *</Label>
          <Select
            value={formData.solutionType}
            onValueChange={(v) => {
              const sol = SOLUTIONS.find(s => s.id === v);
              updateForm('solutionType', v);
              if (sol) {
                updateForm('deliverables', sol.defaultDeliverables.join('\n'));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a solução" />
            </SelectTrigger>
            <SelectContent>
              {SOLUTIONS.map((sol) => (
                <SelectItem key={sol.id} value={sol.id}>
                  {sol.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Nome do Projeto *</Label>
          <Input
            placeholder="Ex: Kit de Lançamento – Boutique Maria Bonita"
            value={formData.projectName}
            onChange={(e) => updateForm('projectName', e.target.value)}
          />
        </div>

        {selectedSolution?.platforms && (
          <div className="space-y-2">
            <Label>Plataformas</Label>
            <div className="flex flex-wrap gap-2">
              {selectedSolution.platforms.map((platform) => (
                <Badge
                  key={platform}
                  variant={formData.platforms.includes(platform) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem('platforms', platform)}
                >
                  {formData.platforms.includes(platform) && <Check className="h-3 w-3 mr-1" />}
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Entregáveis *</Label>
          <Textarea
            placeholder="Liste os entregáveis (um por linha)"
            value={formData.deliverables}
            onChange={(e) => updateForm('deliverables', e.target.value)}
            rows={6}
          />
        </div>

        <div className="space-y-2">
          <Label>O que NÃO está incluso (opcional)</Label>
          <Textarea
            placeholder="Liste exclusões (um por linha)"
            value={formData.exclusions}
            onChange={(e) => updateForm('exclusions', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Valores, Prazos e Pagamento</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Valor Total (R$) *</Label>
          <Input
            type="number"
            placeholder="2500"
            value={formData.serviceValue}
            onChange={(e) => updateForm('serviceValue', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Prazo de Entrega *</Label>
          <Input
            placeholder="Ex: 15 dias úteis"
            value={formData.deadline}
            onChange={(e) => updateForm('deadline', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Início da Contagem</Label>
        <RadioGroup
          value={formData.deadlineStart}
          onValueChange={(v) => updateForm('deadlineStart', v)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="signature" id="start-signature" />
            <Label htmlFor="start-signature" className="cursor-pointer">Após assinatura</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="payment" id="start-payment" />
            <Label htmlFor="start-payment" className="cursor-pointer">Após pagamento inicial</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Condições de Pagamento *</Label>
        <Input
          placeholder="Ex: 50% na entrada + 50% na entrega"
          value={formData.paymentTerms}
          onChange={(e) => updateForm('paymentTerms', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Formas de Pagamento</Label>
        <div className="flex flex-wrap gap-2">
          {['PIX', 'Transferência', 'Cartão', 'Boleto'].map((method) => (
            <Badge
              key={method}
              variant={formData.paymentMethods.includes(method) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleArrayItem('paymentMethods', method)}
            >
              {formData.paymentMethods.includes(method) && <Check className="h-3 w-3 mr-1" />}
              {method}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4 rounded-lg border border-border">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="maintenance"
            checked={formData.hasMaintenance}
            onCheckedChange={(v) => updateForm('hasMaintenance', v)}
          />
          <Label htmlFor="maintenance" className="cursor-pointer">Incluir taxa de manutenção mensal</Label>
        </div>
        {formData.hasMaintenance && (
          <div className="space-y-2">
            <Label>Valor da Manutenção (R$/mês)</Label>
            <Input
              type="number"
              placeholder="197"
              value={formData.maintenanceValue}
              onChange={(e) => updateForm('maintenanceValue', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Termos e Cláusulas</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
          <Checkbox
            id="portfolio"
            checked={formData.portfolioRights}
            onCheckedChange={(v) => updateForm('portfolioRights', v)}
          />
          <div>
            <Label htmlFor="portfolio" className="cursor-pointer font-medium">Direito de Portfólio</Label>
            <p className="text-sm text-muted-foreground">Permite divulgação do projeto pelo contratado.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
          <Checkbox
            id="transfer"
            checked={formData.transferAfterPayment}
            onCheckedChange={(v) => updateForm('transferAfterPayment', v)}
          />
          <div>
            <Label htmlFor="transfer" className="cursor-pointer font-medium">Transferência de Propriedade após Pagamento</Label>
            <p className="text-sm text-muted-foreground">Código, materiais e entregáveis só são do cliente após quitação total.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
          <Checkbox
            id="penalty"
            checked={formData.terminationPenalty}
            onCheckedChange={(v) => updateForm('terminationPenalty', v)}
          />
          <div>
            <Label htmlFor="penalty" className="cursor-pointer font-medium">Multa por Rescisão</Label>
            <p className="text-sm text-muted-foreground">Define multa em caso de cancelamento unilateral (20%).</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
          <Checkbox
            id="scope"
            checked={formData.scopeLimitation}
            onCheckedChange={(v) => updateForm('scopeLimitation', v)}
          />
          <div>
            <Label htmlFor="scope" className="cursor-pointer font-medium">Limitação de Escopo</Label>
            <p className="text-sm text-muted-foreground">Alterações fora do escopo original serão orçadas à parte.</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cláusulas Adicionais (opcional)</Label>
        <Textarea
          placeholder="Observações ou cláusulas específicas..."
          value={formData.additionalClauses}
          onChange={(e) => updateForm('additionalClauses', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Contrato Gerado</h3>
      </div>

      {generatedContract ? (
        <>
          <div className="p-4 rounded-lg bg-muted/50 border border-border max-h-[400px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
              {generatedContract}
            </pre>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopy} variant="outline" className="gap-2">
              <Copy className="h-4 w-4" />
              Copiar texto
            </Button>
            <Button onClick={handleExportDoc} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar DOC
            </Button>
            <Button onClick={handleExportPdf} variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate('/vendas/contratos')} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Ir para Vendas
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Editar contrato
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Revise os dados e clique em gerar contrato.</p>
          
          {/* Summary */}
          <div className="text-left p-4 rounded-lg bg-muted/50 border border-border space-y-2 mb-6">
            <p><strong>Solução:</strong> {SOLUTIONS.find(s => s.id === formData.solutionType)?.label}</p>
            <p><strong>Projeto:</strong> {formData.projectName}</p>
            <p><strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.serviceValue) || 0)}</p>
            <p><strong>Prazo:</strong> {formData.deadline}</p>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar Contrato
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  // Determinar se veio de soluções digitais
  const fromSolucoes = !!solutionParam;
  const backPath = fromSolucoes ? '/solucoes' : '/vendas/contratos';

  return (
    <AppLayout title="Gerar Contrato">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {fromSolucoes ? 'Soluções Digitais › Projeto › Contrato' : 'Vendas › Contratos › Novo Contrato'}
            </div>
            <h1 className="text-xl font-bold text-foreground">Gerar Contrato</h1>
            {formData.projectName && (
              <p className="text-sm text-muted-foreground">Projeto: {formData.projectName}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Etapa {currentStep} de {STEPS.length}
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps Navigation - clickable to jump to any step */}
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[70px] cursor-pointer hover:bg-muted ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : isCompleted
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="text-xs font-medium">{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Step label on right side */}
        <div className="flex justify-end">
          <span className="text-sm font-medium text-primary">{STEPS.find(s => s.id === currentStep)?.label}</span>
        </div>

        {/* Current Step Content */}
        <Card>
          <CardContent className="p-6">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep < 6 && (
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="gap-2"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !canProceed()}
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
                    Gerar Contrato
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
