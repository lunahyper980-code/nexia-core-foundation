import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Check, 
  Building2, 
  Target, 
  Sparkles, 
  FileText, 
  Smartphone, 
  Globe, 
  Layout,
  Loader2,
  RefreshCw,
  Edit3,
  Rocket,
  Info,
  AlertTriangle
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { NexiaUpsellBanner, NexiaUpsellModal, NexiaPostBriefingCTA } from "@/components/nexia";

interface Client {
  id: string;
  name: string;
  segment: string | null;
}

interface DiagnosisData {
  diagnosticoFinal: string;
  problemaCentral: string;
  solucaoPrioritaria: string;
  solucoesComplementares: string[];
  proximoPasso: string;
}

interface SimplePlanningData {
  clientId: string;
  clientName: string;
  companyName: string;
  sectorNiche: string;
  location: string;
  mainProducts: string;
  targetAudience: string;
  averageTicket: string;
  primaryGoal: string;
  solutionType: string;
  mainProblem: string;
  simpleSummary: string;
  diagnosis: DiagnosisData | null;
}

const STEPS = [
  { number: 1, title: "Dados do Cliente", icon: Building2 },
  { number: 2, title: "Objetivo", icon: Target },
  { number: 3, title: "Resumo IA", icon: Sparkles },
  { number: 4, title: "Conclusão", icon: Check },
];

const SOLUTION_TYPES = [
  { value: "app", label: "Aplicativo", icon: Smartphone, description: "App mobile ou PWA" },
  { value: "site", label: "Site", icon: Globe, description: "Site institucional completo" },
  { value: "landing_page", label: "Landing Page", icon: Layout, description: "Página de captura ou vendas" },
];

const GOAL_OPTIONS = [
  { value: "vender_mais", label: "Vender mais" },
  { value: "organizar_processos", label: "Organizar processos e pedidos" },
  { value: "presenca_profissional", label: "Ter presença profissional na internet" },
  { value: "captar_clientes", label: "Captar novos clientes" },
  { value: "automatizar", label: "Automatizar atendimento" },
  { value: "outro", label: "Outro objetivo" },
];

export default function NexiaModoSimples() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  
  const existingPlanningId = searchParams.get("planningId");
  const briefingIdParam = searchParams.get("briefingId");
  const fromBriefing = searchParams.get("fromBriefing") === "true";
  
  const [currentStep, setCurrentStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [isNewClient, setIsNewClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [planningId, setPlanningId] = useState<string | null>(existingPlanningId || briefingIdParam);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [dataLoadedFromBriefing, setDataLoadedFromBriefing] = useState(false);
  
  const [formData, setFormData] = useState<SimplePlanningData>({
    clientId: "",
    clientName: "",
    companyName: "",
    sectorNiche: "",
    location: "",
    mainProducts: "",
    targetAudience: "",
    averageTicket: "",
    primaryGoal: "",
    solutionType: "",
    mainProblem: "",
    simpleSummary: "",
    diagnosis: null,
  });

  // Load existing planning if planningId is present
  useEffect(() => {
    if (workspace && (existingPlanningId || briefingIdParam)) {
      loadExistingPlanning(existingPlanningId || briefingIdParam!);
    }
  }, [workspace, existingPlanningId, briefingIdParam]);

  const loadExistingPlanning = async (id: string) => {
    if (!workspace) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("nexia_plannings")
        .select(`
          *,
          clients (id, name, segment)
        `)
        .eq("id", id)
        .eq("workspace_id", workspace.id)
        .single();

      if (error) throw error;
      
      if (data) {
        // Check if this planning came from a complete briefing
        const isFromCompleteBriefing = data.mode === 'from_briefing' || 
          (data.status === 'ready_for_diagnosis') ||
          fromBriefing;
        
        // Populate form with existing data
        setFormData({
          clientId: data.client_id || "",
          clientName: data.clients?.name || "",
          companyName: data.company_name || "",
          sectorNiche: data.sector_niche || "",
          location: data.location_region || "",
          mainProducts: data.main_products_services || "",
          targetAudience: data.target_audience || "",
          averageTicket: data.average_ticket || "",
          primaryGoal: data.primary_goal || "",
          solutionType: data.solution_type || "",
          mainProblem: data.main_problem || "",
          simpleSummary: data.simple_summary || "",
          diagnosis: null,
        });
        
        setPlanningId(data.id);
        
        // If coming from a complete briefing, skip to step 3 (Resumo IA)
        // Data is already complete - no need to collect again
        if (isFromCompleteBriefing) {
          setDataLoadedFromBriefing(true);
          setCurrentStep(3); // Skip directly to AI summary step
          console.log("[NexiaSimples] Dados carregados do briefing completo - pulando para step 3");
        } else {
          setCurrentStep(data.current_step || 1);
        }
        
        // Set isNewClient based on whether a client is linked
        if (data.client_id) {
          setIsNewClient(false);
        }
      }
    } catch (error) {
      console.error("Error loading planning:", error);
      toast.error("Erro ao carregar planejamento");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workspace) {
      fetchClients();
    }
  }, [workspace]);

  const fetchClients = async () => {
    if (!workspace) return;
    
    const { data } = await supabase
      .from("clients")
      .select("id, name, segment")
      .eq("workspace_id", workspace.id)
      .eq("status", "active")
      .order("name");
    
    setClients(data || []);
  };

  const handleClientChange = (clientId: string) => {
    if (clientId === "new") {
      setIsNewClient(true);
      setFormData(prev => ({ ...prev, clientId: "", clientName: "" }));
    } else {
      setIsNewClient(false);
      const client = clients.find(c => c.id === clientId);
      setFormData(prev => ({ 
        ...prev, 
        clientId, 
        clientName: client?.name || "",
        sectorNiche: client?.segment || prev.sectorNiche 
      }));
    }
  };

  const handleInputChange = (field: keyof SimplePlanningData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validação EXCLUSIVA do modo Simples - NÃO usa campos do modo Completo
  // Cliente é OPCIONAL - usuário pode avançar sem vincular cliente
  const validateSimpleStep = (step: number): boolean => {
    console.log("[NexiaSimples] Validando step:", step, "mode: simple");
    
    switch (step) {
      case 1:
        // Cliente é OPCIONAL - só valida se o usuário escolheu criar novo cliente
        if (isNewClient && formData.clientName.trim() === "") {
          // Se escolheu "novo cliente" mas não preencheu, permite continuar sem cliente
          // Apenas avisa
          console.log("[NexiaSimples] Novo cliente selecionado mas sem nome - continuando sem cliente");
        }
        
        // Nome da empresa é obrigatório
        if (!formData.companyName.trim()) {
          toast.error("Informe o nome da empresa");
          return false;
        }
        
        // Nicho é obrigatório
        if (!formData.sectorNiche.trim()) {
          toast.error("Informe o nicho ou setor");
          return false;
        }
        
        // NÃO valida tamanho da empresa - campo do modo Completo
        // NÃO valida cliente - é opcional
        return true;
        
      case 2:
        if (!formData.primaryGoal) {
          toast.error("Selecione o objetivo principal");
          return false;
        }
        if (!formData.solutionType) {
          toast.error("Selecione o tipo de solução");
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const savePlanning = async () => {
    if (!workspace || !user) return null;

    setIsSaving(true);
    try {
      let clientId = formData.clientId;

      // Create new client if needed
      if (isNewClient && formData.clientName.trim()) {
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert([{
            workspace_id: workspace.id,
            created_by_user_id: user.id,
            name: formData.clientName.trim(),
            segment: formData.sectorNiche || null,
            status: "active",
          }])
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;

        // Log activity
        await supabase.from("activity_logs").insert([{
          workspace_id: workspace.id,
          user_id: user.id,
          type: "CLIENT_CREATED",
          entity_type: "client",
          entity_id: clientId,
          title: "Cliente criado",
          description: `Cliente "${formData.clientName}" criado via modo simples`,
          message: `Cliente "${formData.clientName}" criado via modo simples`,
        }]);
      }

      const planningData = {
        workspace_id: workspace.id,
        created_by_user_id: user.id,
        client_id: clientId || null,
        name: `Briefing - ${formData.companyName}`,
        mode: "simple",
        status: "draft",
        company_name: formData.companyName,
        sector_niche: formData.sectorNiche,
        location_region: formData.location,
        main_products_services: formData.mainProducts,
        target_audience: formData.targetAudience,
        average_ticket: formData.averageTicket,
        primary_goal: formData.primaryGoal,
        solution_type: formData.solutionType,
        main_problem: formData.mainProblem,
        simple_summary: formData.simpleSummary,
        current_step: currentStep,
      };

      if (planningId) {
        const { error } = await supabase
          .from("nexia_plannings")
          .update(planningData)
          .eq("id", planningId);

        if (error) throw error;
        return planningId;
      } else {
        const { data: newPlanning, error } = await supabase
          .from("nexia_plannings")
          .insert([planningData])
          .select()
          .single();

        if (error) throw error;
        setPlanningId(newPlanning.id);

        // Log activity
        await supabase.from("activity_logs").insert([{
          workspace_id: workspace.id,
          user_id: user.id,
          type: "PLAN_CREATED",
          entity_type: "plan",
          entity_id: newPlanning.id,
          title: "Briefing simples criado",
          description: `Briefing simples criado para "${formData.companyName}"`,
          message: `Briefing simples criado para "${formData.companyName}"`,
          metadata: { mode: "simple", solution_type: formData.solutionType },
        }]);

        return newPlanning.id;
      }
    } catch (error) {
      console.error("Error saving planning:", error);
      toast.error("Erro ao salvar briefing");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    // Usa validação EXCLUSIVA do modo Simples
    if (!validateSimpleStep(currentStep)) return;

    console.log("[NexiaSimples] Avançando do step", currentStep, "para", currentStep + 1);

    // Save on step transitions
    if (currentStep === 1 || currentStep === 2) {
      await savePlanning();
    }

    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generateSummary = async () => {
    if (!workspace) return;

    setIsGeneratingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke("nexia-simple-summary", {
        body: { planningData: formData },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Muitas requisições")) {
          toast.error("Aguarde um momento e tente novamente");
        } else if (data.error.includes("Créditos")) {
          toast.error("Créditos insuficientes para gerar resumo");
        } else {
          toast.error(data.error);
        }
        return;
      }

      // Atualizar com resumo e diagnóstico completo
      setFormData(prev => ({ 
        ...prev, 
        simpleSummary: data.summary,
        diagnosis: data.diagnosis || null,
      }));
      await savePlanning();
      toast.success("Diagnóstico gerado com sucesso!");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Erro ao gerar diagnóstico");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleFinish = async () => {
    const savedId = await savePlanning();
    if (!savedId) return;

    // Update status to active
    await supabase
      .from("nexia_plannings")
      .update({ status: "active" })
      .eq("id", savedId);

    toast.success("Briefing concluído!");
  };

  const handleCreateProject = () => {
    // Navigate to Soluções with pre-filled data
    const params = new URLSearchParams({
      fromNexia: "true",
      projectName: formData.companyName,
      companyName: formData.companyName,
      sectorNiche: formData.sectorNiche,
      targetAudience: formData.targetAudience || formData.sectorNiche,
      primaryGoal: formData.primaryGoal,
      mainTask: formData.primaryGoal,
      mainProblem: formData.mainProblem,
      mainBenefit: formData.mainProblem,
      solutionType: formData.solutionType,
      planningId: planningId || "",
      clientId: formData.clientId || "",
      mode: "simple",
    });

    if (formData.solutionType === "app") {
      navigate(`/solucoes/criar/app?${params.toString()}`);
    } else {
      navigate(`/solucoes/criar/site?${params.toString()}`);
    }
  };

  const handleConvertToFull = async () => {
    if (!planningId) {
      await savePlanning();
    }
    
    if (planningId) {
      await supabase
        .from("nexia_plannings")
        .update({ mode: "full", current_step: 1 })
        .eq("id", planningId);

      navigate(`/nexia-ai/planejamento/${planningId}/editar`);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <AppLayout title="Modo Simples - NEXIA">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Upsell Modal */}
        <NexiaUpsellModal
          open={showUpsellModal}
          onOpenChange={setShowUpsellModal}
          onActivateFull={handleConvertToFull}
          onContinueSimple={() => setShowUpsellModal(false)}
        />

        {/* Upsell Banner */}
        <NexiaUpsellBanner onLearnMore={() => setShowUpsellModal(true)} />

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/nexia-ai")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Briefing Simples</h1>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Modo Simples
              </Badge>
            </div>
            <p className="text-muted-foreground">Organize as informações do cliente para criar um app ou site</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Etapa {currentStep} de {STEPS.length}</span>
            <span className="font-medium text-foreground">{STEPS[currentStep - 1].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              return (
                <div 
                  key={step.number}
                  className={`flex flex-col items-center gap-1 ${
                    isActive ? "text-primary" : isCompleted ? "text-emerald-500" : "text-muted-foreground"
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isActive ? "bg-primary/10" : isCompleted ? "bg-emerald-500/10" : "bg-muted/50"
                  }`}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {/* STEP 1: Client Data */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Dados do Cliente</h2>
                  <p className="text-sm text-muted-foreground">Informações básicas sobre o cliente e o negócio</p>
                </div>

                <div className="space-y-4">
                  {/* Client Selection - OPCIONAL */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Cliente (opcional)</Label>
                      <Badge variant="outline" className="text-xs">
                        Você pode vincular depois
                      </Badge>
                    </div>
                    <Select 
                      value={isNewClient ? "new" : (formData.clientId || "none")} 
                      onValueChange={(value) => {
                        if (value === "none") {
                          setIsNewClient(false);
                          setFormData(prev => ({ ...prev, clientId: "", clientName: "" }));
                        } else {
                          handleClientChange(value);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Criar sem vincular cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Continuar sem cliente</SelectItem>
                        <SelectItem value="new">+ Cadastrar novo cliente</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.segment && `(${client.segment})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Cliente não é obrigatório. Você pode criar o planejamento e vincular um cliente depois.
                    </p>
                  </div>

                  {isNewClient && (
                    <div className="space-y-2">
                      <Label>Nome do cliente *</Label>
                      <Input
                        value={formData.clientName}
                        onChange={(e) => handleInputChange("clientName", e.target.value)}
                        placeholder="Ex: João Silva"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Nome da empresa *</Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      placeholder="Ex: Padaria do João"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nicho / Setor *</Label>
                      <Input
                        value={formData.sectorNiche}
                        onChange={(e) => handleInputChange("sectorNiche", e.target.value)}
                        placeholder="Ex: Alimentação, Moda, Serviços"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Localização</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Ex: São Paulo - SP"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Produto ou serviço principal</Label>
                    <Input
                      value={formData.mainProducts}
                      onChange={(e) => handleInputChange("mainProducts", e.target.value)}
                      placeholder="Ex: Pães artesanais, bolos sob encomenda"
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Público-alvo (opcional)</Label>
                      <Input
                        value={formData.targetAudience}
                        onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                        placeholder="Ex: Moradores do bairro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ticket médio (opcional)</Label>
                      <Input
                        value={formData.averageTicket}
                        onChange={(e) => handleInputChange("averageTicket", e.target.value)}
                        placeholder="Ex: R$ 50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Objective */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Objetivo do Projeto</h2>
                  <p className="text-sm text-muted-foreground">O que o cliente quer alcançar com essa solução?</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>O que esse cliente quer melhorar? *</Label>
                    <RadioGroup
                      value={formData.primaryGoal}
                      onValueChange={(value) => handleInputChange("primaryGoal", value)}
                      className="grid gap-2"
                    >
                      {GOAL_OPTIONS.map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="font-normal cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Qual solução você vai criar? *</Label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {SOLUTION_TYPES.map(type => {
                        const Icon = type.icon;
                        const isSelected = formData.solutionType === type.value;
                        return (
                          <Card
                            key={type.value}
                            className={`cursor-pointer transition-all hover:border-primary/50 ${
                              isSelected ? "border-primary bg-primary/5" : ""
                            }`}
                            onClick={() => handleInputChange("solutionType", type.value)}
                          >
                            <CardContent className="p-4 text-center">
                              <div className={`p-3 rounded-xl mx-auto w-fit mb-2 ${
                                isSelected ? "bg-primary/10" : "bg-muted/50"
                              }`}>
                                <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              </div>
                              <p className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {type.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Qual o principal problema atual?</Label>
                    <Textarea
                      value={formData.mainProblem}
                      onChange={(e) => handleInputChange("mainProblem", e.target.value)}
                      placeholder="Ex: Recebe muitos pedidos por WhatsApp e perde o controle, não tem site profissional..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: AI Summary */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Resumo do Cliente</h2>
                  <p className="text-sm text-muted-foreground">Gere um resumo organizado das informações (opcional)</p>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Esta etapa é opcional. O resumo ajuda a organizar as informações, mas não é obrigatório.
                  </AlertDescription>
                </Alert>

                {!formData.simpleSummary ? (
                  <div className="text-center py-8">
                    <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Gerar resumo automático</h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                      A IA vai organizar as informações em um texto claro e objetivo, sem termos técnicos.
                    </p>
                    <Button 
                      onClick={generateSummary} 
                      disabled={isGeneratingSummary}
                      className="gap-2"
                    >
                      {isGeneratingSummary ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Gerando resumo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Gerar resumo do cliente
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {formData.simpleSummary}
                        </p>
                      </CardContent>
                    </Card>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={generateSummary} 
                        disabled={isGeneratingSummary}
                        className="gap-2"
                      >
                        {isGeneratingSummary ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Regenerar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Conclusion - Diagnóstico Final Orientado à Decisão */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Diagnóstico Final</h2>
                  <p className="text-sm text-muted-foreground">Análise completa e próximos passos recomendados</p>
                </div>

                {/* Bloco 1: Diagnóstico Final */}
                {formData.diagnosis?.diagnosticoFinal && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Diagnóstico Final
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed">{formData.diagnosis.diagnosticoFinal}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Fallback se não tiver diagnóstico mas tiver resumo */}
                {!formData.diagnosis?.diagnosticoFinal && formData.simpleSummary && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Análise do Negócio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed">{formData.simpleSummary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Bloco 2: Problema Central */}
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      Problema Central
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground font-medium">
                      {formData.diagnosis?.problemaCentral || formData.mainProblem || "Necessário aprofundar análise do gargalo principal."}
                    </p>
                  </CardContent>
                </Card>

                {/* Bloco 3: Solução Prioritária Recomendada */}
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-emerald-600">
                      <Rocket className="h-4 w-4" />
                      Solução Prioritária Recomendada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const type = SOLUTION_TYPES.find(t => t.value === formData.solutionType);
                        const Icon = type?.icon || Globe;
                        return (
                          <>
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                              <Icon className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {formData.diagnosis?.solucaoPrioritaria || type?.label || "Site Profissional"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Foco em conversão e apresentação profissional do negócio
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Bloco 4: Soluções Complementares */}
                {formData.diagnosis?.solucoesComplementares && formData.diagnosis.solucoesComplementares.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Soluções Complementares Indicadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {formData.diagnosis.solucoesComplementares.map((solucao, index) => (
                          <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                            {solucao}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Bloco 5: Próximo Passo */}
                <Card className="border-blue-500/30 bg-blue-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                      <ArrowRight className="h-4 w-4" />
                      Próximo Passo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">
                      {formData.diagnosis?.proximoPasso || "O próximo passo é materializar a solução recomendada para apresentar ao cliente e iniciar a entrega."}
                    </p>
                  </CardContent>
                </Card>

                {/* Dados do Cliente (resumo compacto) */}
                <div className="grid gap-3 sm:grid-cols-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs mb-1">Cliente</p>
                    <p className="font-medium text-foreground">{formData.clientName || formData.companyName}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs mb-1">Segmento</p>
                    <p className="font-medium text-foreground">{formData.sectorNiche}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs mb-1">Objetivo</p>
                    <p className="font-medium text-foreground">
                      {GOAL_OPTIONS.find(g => g.value === formData.primaryGoal)?.label || formData.primaryGoal}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Bloco 6: CTAs Simplificados */}
                <div className="space-y-3">
                  {/* CTA Principal */}
                  <Button 
                    onClick={async () => {
                      await handleFinish();
                      handleCreateProject();
                    }}
                    className="w-full gap-2 h-12"
                    size="lg"
                  >
                    <Rocket className="h-5 w-5" />
                    Criar Solução Recomendada
                  </Button>

                  {/* CTAs Secundários */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUpsellModal(true)}
                      className="flex-1 gap-2"
                    >
                      <Target className="h-4 w-4" />
                      Explorar Nexia Completo
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Editar briefing
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrev} 
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
