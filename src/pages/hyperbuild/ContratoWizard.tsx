import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  FileText, 
  User, 
  Building2, 
  Briefcase,
  CreditCard,
  Shield,
  Sparkles,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Contratado', icon: User, description: 'Seus dados' },
  { id: 2, title: 'Contratante', icon: Building2, description: 'Dados do cliente' },
  { id: 3, title: 'Projeto', icon: Briefcase, description: 'Detalhes do projeto' },
  { id: 4, title: 'Valores', icon: CreditCard, description: 'Pagamento e prazos' },
  { id: 5, title: 'Cláusulas', icon: Shield, description: 'Termos e condições' },
  { id: 6, title: 'Gerar', icon: Sparkles, description: 'Finalizar contrato' },
];

const PLATFORMS = [
  { id: 'webapp', label: 'Web App' },
  { id: 'pwa', label: 'PWA' },
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iOS' },
  { id: 'landing', label: 'Landing Page' },
];

interface ContractFormData {
  // Contratado (prestador)
  contractorType: 'fisica' | 'juridica';
  contractorName: string;
  contractorDocument: string;
  contractorCity: string;
  // Contratante (cliente)
  clientType: 'fisica' | 'juridica';
  clientName: string;
  clientDocument: string;
  // Projeto
  projectName: string;
  platforms: string[];
  functionalities: string;
  exclusions: string;
  // Valores
  serviceValue: number;
  deadline: string;
  deliveryStart: string;
  paymentTerms: string;
  includeMaintenance: boolean;
  maintenanceValue: number;
  // Cláusulas
  portfolioRights: boolean;
  transferAfterPayment: boolean;
  terminationPenalty: boolean;
  additionalClauses: string;
}

export default function ContratoWizard() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState<ContractFormData>({
    contractorType: 'juridica',
    contractorName: '',
    contractorDocument: '',
    contractorCity: '',
    clientType: 'juridica',
    clientName: '',
    clientDocument: '',
    projectName: '',
    platforms: [],
    functionalities: '',
    exclusions: '',
    serviceValue: 0,
    deadline: '',
    deliveryStart: 'Após assinatura do contrato',
    paymentTerms: '',
    includeMaintenance: false,
    maintenanceValue: 0,
    portfolioRights: true,
    transferAfterPayment: true,
    terminationPenalty: false,
    additionalClauses: '',
  });

  // Fetch project data
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Fetch workspace data for contractor defaults
  const { data: workspaceData } = useQuery({
    queryKey: ['workspace-full', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return null;
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspace.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Pre-fill form with project data
  useEffect(() => {
    if (project) {
      setFormData(prev => ({
        ...prev,
        projectName: project.app_name || '',
        platforms: project.target_platform ? [project.target_platform] : [],
        functionalities: project.main_task || '',
      }));
    }
  }, [project]);

  // Pre-fill contractor data from workspace
  useEffect(() => {
    if (workspaceData?.operation_name) {
      setFormData(prev => ({
        ...prev,
        contractorName: prev.contractorName || workspaceData.operation_name || '',
      }));
    }
  }, [workspaceData]);

  const updateFormData = (field: keyof ContractFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateContract = async () => {
    if (!workspace?.id || !projectId) {
      toast.error('Dados do workspace ou projeto não encontrados');
      return;
    }

    setIsGenerating(true);

    try {
      // First, create the contract record
      const { data: contract, error: insertError } = await supabase
        .from('solution_contracts')
        .insert({
          workspace_id: workspace.id,
          created_by_user_id: user?.id,
          project_id: projectId,
          contractor_name: formData.contractorName,
          contractor_document: formData.contractorDocument,
          contractor_address: formData.contractorCity,
          contractor_type: formData.contractorType,
          contractor_city: formData.contractorCity,
          contracted_name: formData.clientName,
          contracted_document: formData.clientDocument,
          client_name: formData.clientName,
          client_document: formData.clientDocument,
          client_type: formData.clientType,
          service_description: formData.functionalities,
          service_value: formData.serviceValue,
          payment_terms: formData.paymentTerms,
          deadline: formData.deadline,
          platforms: formData.platforms,
          functionalities: formData.functionalities,
          exclusions: formData.exclusions,
          delivery_start: formData.deliveryStart,
          include_maintenance: formData.includeMaintenance,
          maintenance_value: formData.maintenanceValue,
          portfolio_rights: formData.portfolioRights,
          transfer_after_payment: formData.transferAfterPayment,
          termination_penalty: formData.terminationPenalty,
          additional_clauses: formData.additionalClauses,
          status: 'generating',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Call edge function to generate contract text
      const { data: result, error: fnError } = await supabase.functions.invoke('generate-contract', {
        body: {
          contractData: {
            contractorName: formData.contractorName,
            contractorDocument: formData.contractorDocument,
            contractorAddress: formData.contractorCity,
            contractorType: formData.contractorType,
            contractedName: formData.clientName,
            contractedDocument: formData.clientDocument,
            clientType: formData.clientType,
            projectName: formData.projectName,
            platforms: formData.platforms,
            serviceDescription: formData.functionalities,
            exclusions: formData.exclusions,
            serviceValue: formData.serviceValue,
            paymentTerms: formData.paymentTerms,
            deadline: formData.deadline,
            deliveryStart: formData.deliveryStart,
            includeMaintenance: formData.includeMaintenance,
            maintenanceValue: formData.maintenanceValue,
            portfolioRights: formData.portfolioRights,
            transferAfterPayment: formData.transferAfterPayment,
            terminationPenalty: formData.terminationPenalty,
            additionalClauses: formData.additionalClauses,
          },
        },
      });

      if (fnError) throw fnError;

      // Update contract with generated text
      const { error: updateError } = await supabase
        .from('solution_contracts')
        .update({
          contract_text: result.contractText,
          contract_generated_at: new Date().toISOString(),
          status: 'generated',
        })
        .eq('id', contract.id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        user_id: user?.id,
        type: 'contract_generated',
        message: `Contrato gerado para o projeto "${formData.projectName}"`,
        entity_type: 'contract',
        entity_id: contract.id,
      });

      toast.success('Contrato gerado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      navigate(`/hyperbuild/projeto/${projectId}/contrato/${contract.id}`);
    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Erro ao gerar contrato. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  if (isLoadingProject) {
    return (
      <AppLayout title="Gerar Contrato">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Gerar Contrato">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/hyperbuild/projeto/${projectId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerar Contrato</h1>
            <p className="text-muted-foreground">
              Projeto: {project?.app_name || 'Carregando...'}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Etapa {currentStep} de {STEPS.length}
            </span>
            <span className="font-medium text-primary">
              {STEPS[currentStep - 1].title}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    isCompleted ? 'text-primary' : 
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted ? 'bg-primary border-primary text-primary-foreground' :
                    isCurrent ? 'border-primary bg-primary/10' : 'border-muted'
                  }`}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const Icon = STEPS[currentStep - 1].icon;
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Contratado */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Pessoa</Label>
                  <RadioGroup
                    value={formData.contractorType}
                    onValueChange={(v) => updateFormData('contractorType', v as 'fisica' | 'juridica')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fisica" id="contractor-fisica" />
                      <Label htmlFor="contractor-fisica" className="cursor-pointer">Pessoa Física</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="juridica" id="contractor-juridica" />
                      <Label htmlFor="contractor-juridica" className="cursor-pointer">Pessoa Jurídica</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractorName">
                    {formData.contractorType === 'fisica' ? 'Nome Completo' : 'Razão Social'}
                  </Label>
                  <Input
                    id="contractorName"
                    value={formData.contractorName}
                    onChange={(e) => updateFormData('contractorName', e.target.value)}
                    placeholder={formData.contractorType === 'fisica' ? 'Seu nome completo' : 'Nome da empresa'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractorDocument">
                    {formData.contractorType === 'fisica' ? 'CPF' : 'CNPJ'}
                  </Label>
                  <Input
                    id="contractorDocument"
                    value={formData.contractorDocument}
                    onChange={(e) => updateFormData('contractorDocument', e.target.value)}
                    placeholder={formData.contractorType === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractorCity">Cidade (Foro do Contrato)</Label>
                  <Input
                    id="contractorCity"
                    value={formData.contractorCity}
                    onChange={(e) => updateFormData('contractorCity', e.target.value)}
                    placeholder="Ex: São Paulo - SP"
                  />
                </div>

                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  💡 Esses dados podem ser salvos como padrão para próximos contratos nas configurações.
                </p>
              </div>
            )}

            {/* Step 2: Contratante */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Pessoa</Label>
                  <RadioGroup
                    value={formData.clientType}
                    onValueChange={(v) => updateFormData('clientType', v as 'fisica' | 'juridica')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fisica" id="client-fisica" />
                      <Label htmlFor="client-fisica" className="cursor-pointer">Pessoa Física</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="juridica" id="client-juridica" />
                      <Label htmlFor="client-juridica" className="cursor-pointer">Pessoa Jurídica</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">
                    {formData.clientType === 'fisica' ? 'Nome Completo do Cliente' : 'Razão Social do Cliente'}
                  </Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => updateFormData('clientName', e.target.value)}
                    placeholder={formData.clientType === 'fisica' ? 'Nome completo do cliente' : 'Nome da empresa do cliente'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientDocument">
                    {formData.clientType === 'fisica' ? 'CPF do Cliente' : 'CNPJ do Cliente'}
                  </Label>
                  <Input
                    id="clientDocument"
                    value={formData.clientDocument}
                    onChange={(e) => updateFormData('clientDocument', e.target.value)}
                    placeholder={formData.clientType === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Projeto */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Nome do Projeto</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => updateFormData('projectName', e.target.value)}
                    placeholder="Nome do projeto"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Plataformas Entregues</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PLATFORMS.map((platform) => (
                      <div
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.platforms.includes(platform.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.platforms.includes(platform.id)}
                            onCheckedChange={() => togglePlatform(platform.id)}
                          />
                          <span className="text-sm font-medium">{platform.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="functionalities">Funcionalidades Principais (Escopo)</Label>
                  <Textarea
                    id="functionalities"
                    value={formData.functionalities}
                    onChange={(e) => updateFormData('functionalities', e.target.value)}
                    placeholder="Descreva as principais funcionalidades que serão entregues..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exclusions">O que NÃO está incluso (opcional)</Label>
                  <Textarea
                    id="exclusions"
                    value={formData.exclusions}
                    onChange={(e) => updateFormData('exclusions', e.target.value)}
                    placeholder="Liste itens que não fazem parte do escopo..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Valores */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceValue">Valor Total (R$)</Label>
                  <Input
                    id="serviceValue"
                    type="number"
                    value={formData.serviceValue || ''}
                    onChange={(e) => updateFormData('serviceValue', parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo de Entrega</Label>
                  <Input
                    id="deadline"
                    value={formData.deadline}
                    onChange={(e) => updateFormData('deadline', e.target.value)}
                    placeholder="Ex: 30 dias úteis"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryStart">Início da Contagem</Label>
                  <Input
                    id="deliveryStart"
                    value={formData.deliveryStart}
                    onChange={(e) => updateFormData('deliveryStart', e.target.value)}
                    placeholder="Ex: Após assinatura do contrato"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                  <Textarea
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                    placeholder="Ex: 50% na assinatura + 50% na entrega, via PIX ou transferência bancária"
                    rows={3}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeMaintenance"
                      checked={formData.includeMaintenance}
                      onCheckedChange={(checked) => updateFormData('includeMaintenance', !!checked)}
                    />
                    <Label htmlFor="includeMaintenance" className="cursor-pointer">
                      Incluir manutenção mensal
                    </Label>
                  </div>

                  {formData.includeMaintenance && (
                    <div className="space-y-2 pl-6">
                      <Label htmlFor="maintenanceValue">Valor da Manutenção Mensal (R$)</Label>
                      <Input
                        id="maintenanceValue"
                        type="number"
                        value={formData.maintenanceValue || ''}
                        onChange={(e) => updateFormData('maintenanceValue', parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Cláusulas */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 rounded-lg border">
                    <Checkbox
                      id="portfolioRights"
                      checked={formData.portfolioRights}
                      onCheckedChange={(checked) => updateFormData('portfolioRights', !!checked)}
                    />
                    <div>
                      <Label htmlFor="portfolioRights" className="cursor-pointer font-medium">
                        Direito de uso em portfólio
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permite que você utilize o projeto em seu portfólio e materiais de divulgação.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg border">
                    <Checkbox
                      id="transferAfterPayment"
                      checked={formData.transferAfterPayment}
                      onCheckedChange={(checked) => updateFormData('transferAfterPayment', !!checked)}
                    />
                    <div>
                      <Label htmlFor="transferAfterPayment" className="cursor-pointer font-medium">
                        Transferência de propriedade somente após pagamento
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Os direitos do projeto só serão transferidos após quitação total.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg border">
                    <Checkbox
                      id="terminationPenalty"
                      checked={formData.terminationPenalty}
                      onCheckedChange={(checked) => updateFormData('terminationPenalty', !!checked)}
                    />
                    <div>
                      <Label htmlFor="terminationPenalty" className="cursor-pointer font-medium">
                        Multa de rescisão contratual
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Inclui cláusula de multa em caso de rescisão antecipada.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Label htmlFor="additionalClauses">Cláusulas Adicionais (opcional)</Label>
                  <Textarea
                    id="additionalClauses"
                    value={formData.additionalClauses}
                    onChange={(e) => updateFormData('additionalClauses', e.target.value)}
                    placeholder="Adicione cláusulas personalizadas aqui..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Gerar */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Pronto para gerar o contrato!
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Revise as informações abaixo e clique em "Gerar Contrato" para criar o documento.
                  </p>
                </div>

                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2">Contratado</h4>
                      <p className="text-sm text-muted-foreground">{formData.contractorName || 'Não informado'}</p>
                      <p className="text-sm text-muted-foreground">{formData.contractorDocument || 'Documento não informado'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2">Contratante</h4>
                      <p className="text-sm text-muted-foreground">{formData.clientName || 'Não informado'}</p>
                      <p className="text-sm text-muted-foreground">{formData.clientDocument || 'Documento não informado'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2">Projeto</h4>
                      <p className="text-sm text-muted-foreground">{formData.projectName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.platforms.length > 0 
                          ? formData.platforms.map(p => PLATFORMS.find(pl => pl.id === p)?.label).join(', ')
                          : 'Nenhuma plataforma selecionada'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2">Valores</h4>
                      <p className="text-sm text-muted-foreground">
                        {formData.serviceValue > 0 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.serviceValue)
                          : 'Valor não informado'}
                      </p>
                      <p className="text-sm text-muted-foreground">{formData.deadline || 'Prazo não informado'}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={nextStep} className="gap-2">
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={generateContract} 
              disabled={isGenerating}
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
      </div>
    </AppLayout>
  );
}
