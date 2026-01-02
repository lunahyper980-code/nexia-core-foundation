import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save, Check, Plus, Target, FileText, BarChart3, Lightbulb, CheckCircle2, Sparkles, X, Building2, Users, TrendingUp, Gauge, RefreshCw, Edit3, AlertTriangle, Loader2, ChevronDown, ChevronRight, ListChecks, Zap, ClipboardList } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Client {
  id: string;
  name: string;
  segment: string | null;
}

interface StrategicObjective {
  name: string;
  description: string;
  area: string;
}

interface StrategicTask {
  title: string;
  objective: string;
  description: string;
  steps: string[];
  completion_criteria: string;
  area: string;
  objective_name: string;
}

interface GeneratedStrategy {
  strategy_summary: string;
  objectives: StrategicObjective[];
  tasks: StrategicTask[];
}

interface PlanningData {
  id?: string;
  client_id: string;
  name: string;
  description: string;
  primary_goal: string;
  focus_area: string;
  // Block A - Company Details
  company_name: string;
  sector_niche: string;
  company_size: string;
  average_ticket: string;
  location_region: string;
  main_products_services: string;
  target_audience: string;
  initial_objective: string;
  // Block B - Operation
  sales_method: string;
  acquisition_channels: string[];
  has_team: string;
  results_measurement: string;
  // Block C - Challenges
  competitive_differential: string;
  main_challenges: string;
  growth_bottlenecks: string;
  growth_blockers: string;
  // Block D - Goals
  goal_3_months: string;
  goal_12_months: string;
  urgency_level: number;
  // Block E - Self Assessment
  marketing_structure_rating: number;
  sales_structure_rating: number;
  digital_organization_rating: number;
  positioning_clarity_rating: number;
  // Other fields
  diagnosis_text: string;
  marketing_maturity_level: string;
  marketing_current_state: string;
  marketing_top_goal: string;
  include_sales: boolean;
  sales_maturity_level: string;
  sales_top_goal: string;
  strategy_summary: string;
  objectives_list: string[];
  conclusion_notes: string;
  status: string;
  current_step: number;
  // Simple mode fields
  has_website: boolean;
  has_social_media: boolean;
  main_contact_channel: string;
  biggest_problem: string;
  wants_more_clients: boolean;
  attendance_is_manual: boolean;
  // Recommended solution
  recommended_solution: string;
}

const STEPS_SIMPLE = [
  { number: 1, title: "Informações Básicas", icon: FileText },
  { number: 2, title: "Diagnóstico", icon: Target },
  { number: 3, title: "Conclusão", icon: CheckCircle2 },
];

const STEPS_ADVANCED = [
  { number: 1, title: "Informações Básicas", icon: FileText },
  { number: 2, title: "Diagnóstico", icon: Target },
  { number: 3, title: "Maturidade", icon: BarChart3 },
  { number: 4, title: "Estratégia", icon: Lightbulb },
  { number: 5, title: "Conclusão", icon: CheckCircle2 },
];

const FOCUS_AREAS = [
  { value: "marketing", label: "Marketing" },
  { value: "comercial", label: "Comercial" },
  { value: "operacional", label: "Operacional" },
  { value: "produto", label: "Produto" },
];

const MATURITY_LEVELS = [
  { value: "baixo", label: "Baixo" },
  { value: "medio", label: "Médio" },
  { value: "alto", label: "Alto" },
];

const COMPANY_SIZES = [
  { value: "micro", label: "Micro (até 9 funcionários)" },
  { value: "pequena", label: "Pequena (10-49 funcionários)" },
  { value: "media", label: "Média (50-249 funcionários)" },
  { value: "grande", label: "Grande (250+ funcionários)" },
];

const SALES_METHODS = [
  { value: "presencial", label: "Presencial" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "representantes", label: "Representantes" },
  { value: "misto", label: "Misto / Múltiplos canais" },
  { value: "outros", label: "Outros" },
];

const ACQUISITION_CHANNELS = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "google_ads", label: "Google Ads" },
  { id: "trafego_pago", label: "Tráfego pago (outros)" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "indicacao", label: "Indicação / Boca a boca" },
  { id: "email", label: "E-mail" },
  { id: "nenhum", label: "Nenhum estruturado" },
];

const TEAM_OPTIONS = [
  { value: "nao", label: "Não possui equipe" },
  { value: "interna", label: "Sim - equipe interna" },
  { value: "terceirizada", label: "Sim - terceirizada" },
  { value: "mista", label: "Sim - mista (interna + terceirizada)" },
];

const MEASUREMENT_OPTIONS = [
  { value: "nao_mede", label: "Não mede resultados" },
  { value: "planilha", label: "Planilha" },
  { value: "crm", label: "CRM" },
  { value: "ferramentas", label: "Ferramentas digitais" },
  { value: "intuicao", label: "Intuição / feeling" },
];

const RATING_LABELS: Record<number, string> = {
  1: "Muito baixo",
  2: "Baixo",
  3: "Médio",
  4: "Bom",
  5: "Excelente",
};

export default function NexiaPlanejamentoWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  
  const [preparationConfirmed, setPreparationConfirmed] = useState(false);
  const [planningMode, setPlanningMode] = useState<'simple' | 'advanced' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isSavingTasks, setIsSavingTasks] = useState(false);
  const [tasksSaved, setTasksSaved] = useState(false);
  const [showReplaceTasksDialog, setShowReplaceTasksDialog] = useState(false);
  const [isEditingDiagnosis, setIsEditingDiagnosis] = useState(false);
  const [isEditingStrategy, setIsEditingStrategy] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientSegment, setNewClientSegment] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [expandedBlocks, setExpandedBlocks] = useState<string[]>(["block-a"]);
  const [expandedObjectives, setExpandedObjectives] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<StrategicTask | null>(null);
  const [generatedStrategy, setGeneratedStrategy] = useState<GeneratedStrategy | null>(null);
  
  const [planningData, setPlanningData] = useState<PlanningData>({
    client_id: "",
    name: "",
    description: "",
    primary_goal: "",
    focus_area: "",
    company_name: "",
    sector_niche: "",
    company_size: "",
    average_ticket: "",
    location_region: "",
    main_products_services: "",
    target_audience: "",
    initial_objective: "",
    sales_method: "",
    acquisition_channels: [],
    has_team: "",
    results_measurement: "",
    competitive_differential: "",
    main_challenges: "",
    growth_bottlenecks: "",
    growth_blockers: "",
    goal_3_months: "",
    goal_12_months: "",
    urgency_level: 3,
    marketing_structure_rating: 3,
    sales_structure_rating: 3,
    digital_organization_rating: 3,
    positioning_clarity_rating: 3,
    diagnosis_text: "",
    marketing_maturity_level: "baixo",
    marketing_current_state: "",
    marketing_top_goal: "",
    include_sales: false,
    sales_maturity_level: "baixo",
    sales_top_goal: "",
    strategy_summary: "",
    objectives_list: [],
    conclusion_notes: "",
    status: "draft",
    current_step: 1,
    // Simple mode fields
    has_website: false,
    has_social_media: false,
    main_contact_channel: "",
    biggest_problem: "",
    wants_more_clients: true,
    attendance_is_manual: true,
    recommended_solution: "",
  });

  const isEditMode = !!id;

  const logActivity = async (type: string, message: string, metadata?: Json) => {
    if (!workspace?.id) return;
    try {
      await supabase.from('activity_logs').insert([{
        workspace_id: workspace.id,
        type,
        message,
        metadata: metadata || {},
      }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  useEffect(() => {
    if (workspace?.id) {
      fetchClients();
      if (isEditMode) {
        fetchPlanning();
      }
    }
  }, [workspace?.id, id]);

  const fetchClients = async () => {
    if (!workspace?.id) return;
    const { data } = await supabase.from("clients").select("id, name, segment").eq("workspace_id", workspace.id).eq("status", "active").order("name");
    setClients(data || []);
  };

  const fetchPlanning = async () => {
    if (!id || !workspace?.id) return;
    setIsLoading(true);
    const { data, error } = await supabase.from("nexia_plannings").select("*").eq("id", id).eq("workspace_id", workspace.id).single();
    if (error) {
      toast.error("Erro ao carregar planejamento");
      navigate("/nexia-ai/planejamentos");
      return;
    }
    
    // Redirect simple mode plannings to the correct editor
    if (data && data.mode === 'simple') {
      navigate(`/nexia-ai/modo-simples?planningId=${data.id}`, { replace: true });
      return;
    }
    
    // If from_briefing mode, data is already complete - skip to diagnosis step
    const isFromBriefing = data && (data.mode === 'from_briefing' || data.status === 'ready_for_diagnosis');
    if (data) {
      const objList = Array.isArray(data.objectives_list) ? (data.objectives_list as unknown[]).map(String) : [];
      const acqChannels = Array.isArray(data.acquisition_channels) ? (data.acquisition_channels as unknown[]).map(String) : [];
      setPlanningData({
        id: data.id,
        client_id: data.client_id || "",
        name: data.name,
        description: data.description || "",
        primary_goal: data.primary_goal || "",
        focus_area: data.focus_area || "",
        company_name: data.company_name || "",
        sector_niche: data.sector_niche || "",
        company_size: data.company_size || "",
        average_ticket: data.average_ticket || "",
        location_region: data.location_region || "",
        main_products_services: data.main_products_services || "",
        target_audience: data.target_audience || "",
        initial_objective: data.initial_objective || "",
        sales_method: data.sales_method || "",
        acquisition_channels: acqChannels,
        has_team: data.has_team || "",
        results_measurement: data.results_measurement || "",
        competitive_differential: data.competitive_differential || "",
        main_challenges: data.main_challenges || "",
        growth_bottlenecks: data.growth_bottlenecks || "",
        growth_blockers: data.growth_blockers || "",
        goal_3_months: data.goal_3_months || "",
        goal_12_months: data.goal_12_months || "",
        urgency_level: data.urgency_level || 3,
        marketing_structure_rating: data.marketing_structure_rating || 3,
        sales_structure_rating: data.sales_structure_rating || 3,
        digital_organization_rating: data.digital_organization_rating || 3,
        positioning_clarity_rating: data.positioning_clarity_rating || 3,
        diagnosis_text: data.diagnosis_text || "",
        marketing_maturity_level: data.marketing_maturity_level || "baixo",
        marketing_current_state: data.marketing_current_state || "",
        marketing_top_goal: data.marketing_top_goal || "",
        include_sales: data.include_sales || false,
        sales_maturity_level: data.sales_maturity_level || "baixo",
        sales_top_goal: data.sales_top_goal || "",
        strategy_summary: data.strategy_summary || "",
        objectives_list: objList,
        conclusion_notes: data.conclusion_notes || "",
        status: data.status,
        current_step: data.current_step || 1,
        // Simple mode fields - defaults for loaded data
        has_website: false,
        has_social_media: false,
        main_contact_channel: "",
        biggest_problem: data.main_challenges || "",
        wants_more_clients: true,
        attendance_is_manual: true,
        recommended_solution: "",
      });
      // If coming from a complete briefing, skip to step 2 (diagnosis)
      if (isFromBriefing) {
        setCurrentStep(2);
        setPlanningMode('advanced');
        setPreparationConfirmed(true);
        console.log("[NexiaWizard] Dados carregados do briefing completo - pulando para step 2");
      } else {
        setCurrentStep(data.current_step || 1);
      }
    }
    setIsLoading(false);
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim() || !workspace?.id || !user?.id) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }
    try {
      const { data, error } = await supabase.from("clients").insert({ workspace_id: workspace.id, created_by_user_id: user.id, name: newClientName.trim(), segment: newClientSegment.trim() || null, status: "active" }).select().single();
      if (error) throw error;
      await logActivity("nexia_client_created", `Cliente ${data.name} criado`, { name: data.name } as Json);
      setClients([...clients, data]);
      setPlanningData({ ...planningData, client_id: data.id });
      setShowNewClientDialog(false);
      setNewClientName("");
      setNewClientSegment("");
      toast.success("Cliente criado!");
    } catch (error) {
      toast.error("Erro ao criar cliente");
    }
  };

  const toggleChannel = (channelId: string) => {
    const current = planningData.acquisition_channels;
    if (current.includes(channelId)) {
      setPlanningData({ ...planningData, acquisition_channels: current.filter(c => c !== channelId) });
    } else {
      setPlanningData({ ...planningData, acquisition_channels: [...current, channelId] });
    }
  };

  const savePlanning = async (status?: string) => {
    if (!workspace?.id || !user?.id) return null;
    setIsSaving(true);
    try {
      const dataToSave = {
        workspace_id: workspace.id,
        created_by_user_id: user.id,
        client_id: planningData.client_id || null,
        name: planningData.name,
        description: planningData.description || null,
        primary_goal: planningData.primary_goal || null,
        focus_area: planningData.focus_area || null,
        company_name: planningData.company_name || null,
        sector_niche: planningData.sector_niche || null,
        company_size: planningData.company_size || null,
        average_ticket: planningData.average_ticket || null,
        location_region: planningData.location_region || null,
        main_products_services: planningData.main_products_services || null,
        target_audience: planningData.target_audience || null,
        initial_objective: planningData.initial_objective || null,
        sales_method: planningData.sales_method || null,
        acquisition_channels: planningData.acquisition_channels,
        has_team: planningData.has_team || null,
        results_measurement: planningData.results_measurement || null,
        competitive_differential: planningData.competitive_differential || null,
        main_challenges: planningData.main_challenges || null,
        growth_bottlenecks: planningData.growth_bottlenecks || null,
        growth_blockers: planningData.growth_blockers || null,
        goal_3_months: planningData.goal_3_months || null,
        goal_12_months: planningData.goal_12_months || null,
        urgency_level: planningData.urgency_level,
        marketing_structure_rating: planningData.marketing_structure_rating,
        sales_structure_rating: planningData.sales_structure_rating,
        digital_organization_rating: planningData.digital_organization_rating,
        positioning_clarity_rating: planningData.positioning_clarity_rating,
        diagnosis_text: planningData.diagnosis_text || null,
        marketing_maturity_level: planningData.marketing_maturity_level || null,
        marketing_current_state: planningData.marketing_current_state || null,
        marketing_top_goal: planningData.marketing_top_goal || null,
        include_sales: planningData.include_sales,
        sales_maturity_level: planningData.sales_maturity_level || null,
        sales_top_goal: planningData.sales_top_goal || null,
        strategy_summary: planningData.strategy_summary || null,
        objectives_list: planningData.objectives_list,
        conclusion_notes: planningData.conclusion_notes || null,
        status: status || planningData.status,
        current_step: currentStep,
        mode: planningMode === "simple" ? "simple" : "full",
        updated_at: new Date().toISOString(),
      };

      if (planningData.id) {
        const { data, error } = await supabase.from("nexia_plannings").update(dataToSave).eq("id", planningData.id).select().single();
        if (error) throw error;
        await logActivity("nexia_planning_updated", `Planejamento "${data.name}" atualizado`, { step: currentStep } as Json);
        return data;
      } else {
        const { data, error } = await supabase.from("nexia_plannings").insert(dataToSave).select().single();
        if (error) throw error;
        setPlanningData({ ...planningData, id: data.id });
        await logActivity("nexia_planning_created", `Planejamento "${data.name}" criado`, { client_id: data.client_id } as Json);
        return data;
      }
    } catch (error) {
      toast.error("Erro ao salvar planejamento");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Validação do Nexia SIMPLES - não valida campos do Nexia Completo
  const validateStep1Simple = () => {
    console.log("[NexiaSimples] Validando step 1 - mode: simple");

    // Cliente é OPCIONAL no modo simples
    if (!planningData.name.trim()) { toast.error("Título é obrigatório"); return false; }
    if (!planningData.company_name.trim()) { toast.error("Nome da empresa é obrigatório"); return false; }
    if (!planningData.sector_niche.trim()) { toast.error("Setor/Nicho é obrigatório"); return false; }
    if (!planningData.location_region.trim()) { toast.error("Localização é obrigatória"); return false; }
    if (!planningData.main_products_services.trim()) { toast.error("Produtos/Serviços é obrigatório"); return false; }

    // IMPORTANTE: não exige tamanho da empresa no modo simples
    return true;
  };

  // Validação do Nexia COMPLETO - usa todos os campos estratégicos
  const validateStep1Full = () => {
    console.log("[NexiaCompleto] Validando step 1 - mode: full");

    // Cliente é OPCIONAL também no modo completo
    // if (!planningData.client_id) { toast.error("Selecione um cliente"); return false; }

    if (!planningData.name.trim()) { toast.error("Título é obrigatório"); return false; }
    if (!planningData.company_name.trim()) { toast.error("Nome da empresa é obrigatório"); return false; }
    if (!planningData.sector_niche) { toast.error("Setor/Nicho é obrigatório"); return false; }
    if (!planningData.company_size) { toast.error("Tamanho da empresa é obrigatório"); return false; }
    if (!planningData.average_ticket.trim()) { toast.error("Ticket médio é obrigatório"); return false; }
    if (!planningData.location_region.trim()) { toast.error("Localização é obrigatória"); return false; }
    if (!planningData.main_products_services.trim()) { toast.error("Produtos/Serviços é obrigatório"); return false; }
    if (!planningData.target_audience.trim()) { toast.error("Público-alvo é obrigatório"); return false; }
    if (!planningData.initial_objective.trim()) { toast.error("Objetivo inicial é obrigatório"); return false; }
    if (!planningData.sales_method) { toast.error("Método de venda é obrigatório"); return false; }
    if (!planningData.has_team) { toast.error("Informe sobre a equipe"); return false; }
    if (!planningData.results_measurement) { toast.error("Informe como mede resultados"); return false; }
    return true;
  };

  const handleNext = async () => {
    console.log("[NexiaWizard] handleNext - step:", currentStep, "mode:", planningMode, "route:", window.location.pathname);

    if (currentStep === 1) {
      const ok = planningMode === 'simple' ? validateStep1Simple() : validateStep1Full();
      console.log("[NexiaWizard] validator:", planningMode === 'simple' ? 'validateStep1Simple' : 'validateStep1Full', "ok:", ok);
      if (!ok) return;
    }

    const saved = await savePlanning();
    if (saved) setCurrentStep(Math.min(currentStep + 1, totalSteps));
  };

  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
  const handleSaveDraft = async () => { const saved = await savePlanning("draft"); if (saved) toast.success("Rascunho salvo!"); };
  const handleFinish = async () => { const saved = await savePlanning("active"); if (saved) { toast.success("Planejamento salvo!"); navigate(`/nexia-ai/planejamento/${saved.id}`); } };
  const addObjective = () => { if (newObjective.trim()) { setPlanningData({ ...planningData, objectives_list: [...planningData.objectives_list, newObjective.trim()] }); setNewObjective(""); } };
  const removeObjective = (index: number) => { setPlanningData({ ...planningData, objectives_list: planningData.objectives_list.filter((_, i) => i !== index) }); };

  const generateDiagnosis = async () => {
    if (!planningData.id) {
      toast.error("Salve o planejamento primeiro");
      return;
    }

    setIsGeneratingDiagnosis(true);
    try {
      const { data, error } = await supabase.functions.invoke("nexia-diagnosis", {
        body: { planningData, mode: planningMode }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const diagnosisText = data.diagnosis;
      const recommendedSolution = data.recommendedSolution || "";
      
      setPlanningData({ 
        ...planningData, 
        diagnosis_text: diagnosisText,
        recommended_solution: recommendedSolution 
      });

      // Save to database
      await supabase.from("nexia_plannings").update({
        diagnosis_text: diagnosisText,
        diagnosis_updated_at: new Date().toISOString(),
      }).eq("id", planningData.id);

      // Log activity
      await logActivity("nexia_ai_diagnosis", `Diagnóstico gerado para "${planningData.name}"`, {
        focus_area: planningData.focus_area,
        sector: planningData.sector_niche,
        company_size: planningData.company_size,
        mode: planningMode,
        recommended_solution: recommendedSolution,
      } as Json);

      toast.success("Diagnóstico gerado com sucesso!");
      setIsEditingDiagnosis(false);
    } catch (error) {
      console.error("Error generating diagnosis:", error);
      toast.error("Erro ao gerar diagnóstico. Tente novamente.");
    } finally {
      setIsGeneratingDiagnosis(false);
    }
  };

  const saveDiagnosisManual = async () => {
    if (!planningData.id) return;
    
    try {
      await supabase.from("nexia_plannings").update({
        diagnosis_text: planningData.diagnosis_text,
        diagnosis_updated_at: new Date().toISOString(),
      }).eq("id", planningData.id);
      
      setIsEditingDiagnosis(false);
      toast.success("Diagnóstico salvo!");
    } catch (error) {
      toast.error("Erro ao salvar diagnóstico");
    }
  };

  const generateStrategy = async () => {
    if (!planningData.id) {
      toast.error("Salve o planejamento primeiro");
      return;
    }

    if (!planningData.diagnosis_text) {
      toast.error("Gere o diagnóstico primeiro (Etapa 2)");
      return;
    }

    setIsGeneratingStrategy(true);
    try {
      const { data, error } = await supabase.functions.invoke("nexia-ai", {
        body: { planningData }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const result = data as GeneratedStrategy;
      setGeneratedStrategy(result);
      
      // Update planning data
      const objectiveNames = result.objectives.map(o => o.name);
      setPlanningData({ 
        ...planningData, 
        strategy_summary: result.strategy_summary,
        objectives_list: objectiveNames
      });

      // Save to database
      await supabase.from("nexia_plannings").update({
        strategy_summary: result.strategy_summary,
        objectives_list: objectiveNames,
        tasks_generated: true,
        updated_at: new Date().toISOString(),
      }).eq("id", planningData.id);

      // Log activity
      await logActivity("nexia_ai_tasks", `Estratégia e tarefas geradas para "${planningData.name}"`, {
        focus_area: planningData.focus_area,
        objectives_count: result.objectives.length,
        tasks_count: result.tasks.length,
      } as Json);

      // Expand all objectives by default
      setExpandedObjectives(result.objectives.map(o => o.name));

      toast.success("Estratégia e tarefas geradas com sucesso!");
      setIsEditingStrategy(false);
    } catch (error) {
      console.error("Error generating strategy:", error);
      toast.error("Erro ao gerar estratégia. Tente novamente.");
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const saveStrategyManual = async () => {
    if (!planningData.id) return;
    
    try {
      await supabase.from("nexia_plannings").update({
        strategy_summary: planningData.strategy_summary,
        objectives_list: planningData.objectives_list,
        updated_at: new Date().toISOString(),
      }).eq("id", planningData.id);
      
      setIsEditingStrategy(false);
      toast.success("Estratégia salva!");
    } catch (error) {
      toast.error("Erro ao salvar estratégia");
    }
  };

  const saveTasksToDatabase = async (replace: boolean = false) => {
    if (!planningData.id || !generatedStrategy || !workspace?.id || !user?.id) {
      toast.error("Dados incompletos para salvar tarefas");
      return;
    }

    setIsSavingTasks(true);
    try {
      // If replacing, archive existing tasks
      if (replace) {
        await supabase.from("nexia_tasks")
          .update({ status: "archived", updated_at: new Date().toISOString() })
          .eq("planning_id", planningData.id)
          .neq("status", "archived");
      }

      // Create new tasks
      const tasksToInsert = generatedStrategy.tasks.map(task => ({
        workspace_id: workspace.id,
        created_by_user_id: user.id,
        planning_id: planningData.id,
        client_id: planningData.client_id || null,
        title: task.title,
        objective: task.objective,
        description: task.description,
        steps: task.steps.join("\n"),
        completion_criteria: task.completion_criteria,
        objective_title: task.objective_name,
        focus_area: task.area,
        status: "todo",
        priority: "medium",
      }));

      const { error } = await supabase.from("nexia_tasks").insert(tasksToInsert);
      if (error) throw error;

      // Update planning to mark tasks as generated
      await supabase.from("nexia_plannings").update({
        tasks_generated: true,
        updated_at: new Date().toISOString(),
      }).eq("id", planningData.id);

      // Log activity
      await logActivity("nexia_task_created", `${tasksToInsert.length} tarefas salvas para "${planningData.name}"`, {
        planning_id: planningData.id,
        client_id: planningData.client_id,
        tasks_count: tasksToInsert.length,
        objectives_count: generatedStrategy.objectives.length,
        replaced: replace,
      } as Json);

      setTasksSaved(true);
      setShowReplaceTasksDialog(false);
      toast.success(`${tasksToInsert.length} tarefas salvas com sucesso!`);
    } catch (error) {
      console.error("Error saving tasks:", error);
      toast.error("Erro ao salvar tarefas");
    } finally {
      setIsSavingTasks(false);
    }
  };

  const handleSaveTasksClick = async () => {
    if (!planningData.id || !generatedStrategy) return;

    // Check if tasks already exist for this planning
    const { data: existingTasks } = await supabase
      .from("nexia_tasks")
      .select("id")
      .eq("planning_id", planningData.id)
      .neq("status", "archived")
      .limit(1);

    if (existingTasks && existingTasks.length > 0) {
      setShowReplaceTasksDialog(true);
    } else {
      await saveTasksToDatabase(false);
    }
  };

  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      marketing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      comercial: "bg-green-500/10 text-green-600 border-green-500/20",
      digital: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      web: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      social: "bg-pink-500/10 text-pink-600 border-pink-500/20",
      trafego: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      automacao: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
      operacional: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    };
    return colors[area] || "bg-muted text-muted-foreground";
  };

  const getAreaLabel = (area: string) => {
    const labels: Record<string, string> = {
      marketing: "Marketing",
      comercial: "Comercial",
      digital: "Digital",
      web: "Web",
      social: "Social",
      trafego: "Tráfego",
      automacao: "Automação",
      operacional: "Operacional",
    };
    return labels[area] || area;
  };

  const toggleObjective = (name: string) => {
    setExpandedObjectives(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const renderDiagnosisContent = (text: string) => {
    // Parse markdown-like sections
    const sections = text.split(/^## /gm).filter(Boolean);
    
    return sections.map((section, index) => {
      const [title, ...contentLines] = section.split("\n");
      const content = contentLines.join("\n").trim();
      
      return (
        <div key={index} className="mb-6">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            {title.trim()}
          </h3>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap pl-4 border-l-2 border-muted">
            {content.split("\n").map((line, i) => {
              if (line.trim().startsWith("- ")) {
                return <p key={i} className="my-1">• {line.trim().substring(2)}</p>;
              }
              return line.trim() ? <p key={i} className="my-1">{line}</p> : null;
            })}
          </div>
        </div>
      );
    });
  };

  const selectedClient = clients.find(c => c.id === planningData.client_id);

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  const RatingSlider = ({ label, description, value, onChange }: { label: string; description: string; value: number; onChange: (v: number) => void }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">{label}</Label>
        <Badge variant="outline">{RATING_LABELS[value]}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={1} max={5} step={1} className="py-2" />
    </div>
  );

  const STEPS = planningMode === 'simple' ? STEPS_SIMPLE : STEPS_ADVANCED;
  const totalSteps = STEPS.length;

  // Preparation Screen - Before Mode Selection
  if (!preparationConfirmed && !isEditMode) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/nexia-ai")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Novo Planejamento</h1>
            <p className="text-muted-foreground">Prepare-se para criar</p>
          </div>
        </div>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">
                  Antes de começar o planejamento
                </h2>
                <p className="text-muted-foreground max-w-lg leading-relaxed">
                  O Nexia cria estratégias com base em informações reais do cliente.
                  <br />
                  Se você ainda não coletou esses dados, gere um briefing rápido para evitar respostas imprecisas.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/briefing-rapido')}
                  className="gap-2"
                >
                  <ClipboardList className="h-5 w-5" />
                  Gerar briefing rápido
                </Button>
                <Button 
                  size="lg"
                  onClick={() => setPreparationConfirmed(true)}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Já tenho as informações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mode Selection Screen
  if (!planningMode && !isEditMode) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setPreparationConfirmed(false)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Novo Planejamento</h1>
            <p className="text-muted-foreground">Escolha o tipo de planejamento</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Simple Mode Card */}
          <Card 
            className="cursor-pointer border-2 hover:border-primary/50 transition-all group"
            onClick={() => setPlanningMode('simple')}
          >
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-emerald-500" />
              </div>
              <CardTitle className="text-lg">Planejamento Rápido</CardTitle>
              <CardDescription>Ideal para iniciantes</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Perguntas essenciais
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Diagnóstico direto
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  Recomendações práticas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  3 etapas simples
                </li>
              </ul>
              <Button className="w-full mt-4 gap-2" variant="outline">
                Selecionar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Mode Card */}
          <Card 
            className="cursor-pointer border-2 hover:border-primary/50 transition-all group"
            onClick={() => setPlanningMode('advanced')}
          >
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle className="text-lg">Planejamento Completo</CardTitle>
              <CardDescription>Para consultoria avançada</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-500" />
                  Análise aprofundada
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-500" />
                  Diagnóstico estratégico
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-500" />
                  Maturidade + Estratégia
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-purple-500" />
                  5 etapas completas
                </li>
              </ul>
              <Button className="w-full mt-4 gap-2" variant="outline">
                Selecionar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Set mode for edit mode
  if (isEditMode && !planningMode) {
    setPlanningMode('advanced');
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => planningMode && !isEditMode ? setPlanningMode(null) : navigate("/nexia-ai/planejamentos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{isEditMode ? "Editar Planejamento" : "Novo Planejamento"}</h1>
            <Badge variant="outline" className={planningMode === 'simple' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-purple-500/10 text-purple-600 border-purple-500/20'}>
              {planningMode === 'simple' ? 'Rápido' : 'Completo'}
            </Badge>
          </div>
          <p className="text-muted-foreground">Etapa {currentStep} de {totalSteps}</p>
        </div>
      </div>

      <div className="mb-8">
        <Progress value={(currentStep / totalSteps) * 100} className="h-2 mb-4" />
        <div className="flex justify-between">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            return (
              <div key={step.number} className={`flex flex-col items-center gap-1 ${isActive ? "text-primary" : isCompleted ? "text-green-500" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : isCompleted ? "bg-green-500 text-white" : "bg-muted"}`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="text-xs hidden sm:block">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Basic Info - Different for Simple vs Advanced */}
      {currentStep === 1 && planningMode === 'simple' && (
        <div className="space-y-4">
          <Card className="border rounded-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Building2 className="h-4 w-4 text-primary" /></div>
                <div><CardTitle className="text-base">Informações do Negócio</CardTitle><CardDescription>Perguntas rápidas e diretas</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Cliente (opcional)</Label>
                  <Badge variant="outline" className="text-xs">Você pode vincular depois</Badge>
                </div>
                <div className="flex gap-2 mt-1">
                  <Select value={planningData.client_id || "none"} onValueChange={(v) => setPlanningData({ ...planningData, client_id: v === "none" ? "" : v })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Continuar sem cliente" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="none">Continuar sem cliente</SelectItem>
                      {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setShowNewClientDialog(true)}><Plus className="h-4 w-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Cliente não é obrigatório. Você pode vincular depois.</p>
              </div>
              <div><Label>Título do Planejamento *</Label><Input value={planningData.name} onChange={(e) => setPlanningData({ ...planningData, name: e.target.value })} placeholder="Ex: Diagnóstico - Barbearia do João" className="mt-1" /></div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Nome da Empresa *</Label><Input value={planningData.company_name} onChange={(e) => setPlanningData({ ...planningData, company_name: e.target.value })} placeholder="Nome do negócio" className="mt-1" /></div>
                <div><Label>Setor / Nicho *</Label><Input value={planningData.sector_niche} onChange={(e) => setPlanningData({ ...planningData, sector_niche: e.target.value })} placeholder="Ex: Barbearia, Restaurante" className="mt-1" /></div>
              </div>
              <div><Label>Localização *</Label><Input value={planningData.location_region} onChange={(e) => setPlanningData({ ...planningData, location_region: e.target.value })} placeholder="Ex: São Paulo - Zona Sul" className="mt-1" /></div>
              <div><Label>O que a empresa faz? *</Label><Textarea value={planningData.main_products_services} onChange={(e) => setPlanningData({ ...planningData, main_products_services: e.target.value })} placeholder="Descreva brevemente os produtos ou serviços" className="mt-1" rows={2} /></div>
            </CardContent>
          </Card>

          <Card className="border rounded-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center"><Users className="h-4 w-4 text-blue-500" /></div>
                <div><CardTitle className="text-base">Presença Digital</CardTitle><CardDescription>Como o negócio aparece online</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="font-medium text-sm">Possui site?</p><p className="text-xs text-muted-foreground">Qualquer tipo de site ou landing page</p></div>
                <Switch checked={planningData.has_website} onCheckedChange={(c) => setPlanningData({ ...planningData, has_website: c })} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="font-medium text-sm">Possui redes sociais ativas?</p><p className="text-xs text-muted-foreground">Instagram, Facebook, TikTok, etc.</p></div>
                <Switch checked={planningData.has_social_media} onCheckedChange={(c) => setPlanningData({ ...planningData, has_social_media: c })} />
              </div>
              <div><Label>Principal canal de contato com clientes</Label><Select value={planningData.main_contact_channel} onValueChange={(v) => setPlanningData({ ...planningData, main_contact_channel: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent className="bg-popover z-50"><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="telefone">Telefone</SelectItem><SelectItem value="presencial">Presencial</SelectItem><SelectItem value="email">E-mail</SelectItem><SelectItem value="instagram">Instagram DM</SelectItem></SelectContent></Select></div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="font-medium text-sm">O atendimento é manual?</p><p className="text-xs text-muted-foreground">Responde cliente por cliente, sem automação</p></div>
                <Switch checked={planningData.attendance_is_manual} onCheckedChange={(c) => setPlanningData({ ...planningData, attendance_is_manual: c })} />
              </div>
            </CardContent>
          </Card>

          <Card className="border rounded-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center"><Target className="h-4 w-4 text-orange-500" /></div>
                <div><CardTitle className="text-base">Problema e Objetivo</CardTitle><CardDescription>O que precisa resolver</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Qual o maior problema hoje?</Label><Textarea value={planningData.biggest_problem} onChange={(e) => setPlanningData({ ...planningData, biggest_problem: e.target.value })} placeholder="Ex: Poucos clientes, processo bagunçado, não sou encontrado online..." className="mt-1" rows={2} /></div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="font-medium text-sm">Quer conseguir mais clientes?</p><p className="text-xs text-muted-foreground">Objetivo principal é aumentar vendas</p></div>
                <Switch checked={planningData.wants_more_clients} onCheckedChange={(c) => setPlanningData({ ...planningData, wants_more_clients: c })} />
              </div>
              <div><Label>O que espera resolver com a Nexia?</Label><Textarea value={planningData.initial_objective} onChange={(e) => setPlanningData({ ...planningData, initial_objective: e.target.value })} placeholder="Ex: Entender o que preciso melhorar, ter mais presença online..." className="mt-1" rows={2} /></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 1: Advanced mode - Full questions */}
      {currentStep === 1 && planningMode === 'advanced' && (
        <div className="space-y-4">
          <Accordion type="multiple" value={expandedBlocks} onValueChange={setExpandedBlocks} className="space-y-4">
            {/* Block A - Company Details */}
            <AccordionItem value="block-a" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Building2 className="h-4 w-4 text-primary" /></div>
                  <div className="text-left"><p className="font-semibold">Dados Gerais do Cliente</p><p className="text-xs text-muted-foreground">Informações básicas da empresa</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-4 pt-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label>Cliente (opcional)</Label>
                      <Badge variant="outline" className="text-xs">Você pode vincular depois</Badge>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Select value={planningData.client_id || "none"} onValueChange={(v) => setPlanningData({ ...planningData, client_id: v === "none" ? "" : v })}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Continuar sem cliente" /></SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="none">Continuar sem cliente</SelectItem>
                          {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={() => setShowNewClientDialog(true)}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Cliente não é obrigatório. Você pode vincular depois.</p>
                  </div>
                  <div><Label>Título do Planejamento *</Label><Input value={planningData.name} onChange={(e) => setPlanningData({ ...planningData, name: e.target.value })} placeholder="Ex: Estratégia de Marketing Q1 2025" className="mt-1" /></div>
                  <Separator />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Nome da Empresa *</Label><Input value={planningData.company_name} onChange={(e) => setPlanningData({ ...planningData, company_name: e.target.value })} placeholder="Nome oficial da empresa" className="mt-1" /></div>
                    <div><Label>Setor / Nicho *</Label><Input value={planningData.sector_niche} onChange={(e) => setPlanningData({ ...planningData, sector_niche: e.target.value })} placeholder="Ex: Alimentação, Moda, Tecnologia" className="mt-1" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Tamanho da Empresa *</Label><Select value={planningData.company_size} onValueChange={(v) => setPlanningData({ ...planningData, company_size: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent className="bg-popover z-50">{COMPANY_SIZES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Ticket Médio (R$) *</Label><Input value={planningData.average_ticket} onChange={(e) => setPlanningData({ ...planningData, average_ticket: e.target.value })} placeholder="Ex: R$ 150,00" className="mt-1" /></div>
                  </div>
                  <div><Label>Localização / Região de Atuação *</Label><Input value={planningData.location_region} onChange={(e) => setPlanningData({ ...planningData, location_region: e.target.value })} placeholder="Ex: São Paulo - Capital, Brasil inteiro" className="mt-1" /></div>
                  <div><Label>Produtos ou Serviços Principais *</Label><Textarea value={planningData.main_products_services} onChange={(e) => setPlanningData({ ...planningData, main_products_services: e.target.value })} placeholder="Descreva os principais produtos/serviços oferecidos" className="mt-1" rows={2} /></div>
                  <div><Label>Público-Alvo Principal *</Label><Textarea value={planningData.target_audience} onChange={(e) => setPlanningData({ ...planningData, target_audience: e.target.value })} placeholder="Ex: Mulheres 25-45 anos, classe B, interessadas em moda sustentável" className="mt-1" rows={2} /></div>
                  <div><Label>Objetivo Inicial com o Nexia *</Label><Textarea value={planningData.initial_objective} onChange={(e) => setPlanningData({ ...planningData, initial_objective: e.target.value })} placeholder="Ex: Crescer vendas, organizar marketing, estruturar processo comercial" className="mt-1" rows={2} /></div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Block B - Operation Structure */}
            <AccordionItem value="block-b" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center"><Users className="h-4 w-4 text-blue-500" /></div>
                  <div className="text-left"><p className="font-semibold">Estrutura de Operação Atual</p><p className="text-xs text-muted-foreground">Como a empresa opera hoje</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-4 pt-2">
                  <div><Label>Como o cliente vende hoje? *</Label><Select value={planningData.sales_method} onValueChange={(v) => setPlanningData({ ...planningData, sales_method: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o método principal" /></SelectTrigger><SelectContent className="bg-popover z-50">{SALES_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select></div>
                  <div>
                    <Label className="mb-2 block">Canais de aquisição utilizados atualmente</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACQUISITION_CHANNELS.map((ch) => (
                        <div key={ch.id} className="flex items-center space-x-2">
                          <Checkbox id={ch.id} checked={planningData.acquisition_channels.includes(ch.id)} onCheckedChange={() => toggleChannel(ch.id)} />
                          <label htmlFor={ch.id} className="text-sm cursor-pointer">{ch.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div><Label>Possui equipe de vendas ou marketing? *</Label><Select value={planningData.has_team} onValueChange={(v) => setPlanningData({ ...planningData, has_team: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent className="bg-popover z-50">{TEAM_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Como mede resultados hoje? *</Label><Select value={planningData.results_measurement} onValueChange={(v) => setPlanningData({ ...planningData, results_measurement: v })}><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent className="bg-popover z-50">{MEASUREMENT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Block C - Positioning and Challenges */}
            <AccordionItem value="block-c" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center"><Target className="h-4 w-4 text-orange-500" /></div>
                  <div className="text-left"><p className="font-semibold">Posicionamento e Desafios</p><p className="text-xs text-muted-foreground">Diferenciais e gargalos</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-4 pt-2">
                  <div><Label>Diferencial competitivo percebido</Label><Textarea value={planningData.competitive_differential} onChange={(e) => setPlanningData({ ...planningData, competitive_differential: e.target.value })} placeholder="O que faz a empresa se destacar da concorrência?" className="mt-1" rows={2} /></div>
                  <div><Label>Principais desafios atuais</Label><Textarea value={planningData.main_challenges} onChange={(e) => setPlanningData({ ...planningData, main_challenges: e.target.value })} placeholder="Quais são os maiores desafios enfrentados?" className="mt-1" rows={2} /></div>
                  <div><Label>Principais gargalos de crescimento</Label><Textarea value={planningData.growth_bottlenecks} onChange={(e) => setPlanningData({ ...planningData, growth_bottlenecks: e.target.value })} placeholder="O que está travando o crescimento?" className="mt-1" rows={2} /></div>
                  <div><Label>O que hoje mais impede o negócio de crescer?</Label><Textarea value={planningData.growth_blockers} onChange={(e) => setPlanningData({ ...planningData, growth_blockers: e.target.value })} placeholder="Principal impedimento atual" className="mt-1" rows={2} /></div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Block D - Goals and Expectations */}
            <AccordionItem value="block-d" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-green-500" /></div>
                  <div className="text-left"><p className="font-semibold">Metas e Expectativas</p><p className="text-xs text-muted-foreground">Objetivos de curto e médio prazo</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-4 pt-2">
                  <div><Label>Meta principal para os próximos 3 meses</Label><Textarea value={planningData.goal_3_months} onChange={(e) => setPlanningData({ ...planningData, goal_3_months: e.target.value })} placeholder="O que quer alcançar em 3 meses?" className="mt-1" rows={2} /></div>
                  <div><Label>Meta principal para os próximos 12 meses</Label><Textarea value={planningData.goal_12_months} onChange={(e) => setPlanningData({ ...planningData, goal_12_months: e.target.value })} placeholder="Onde quer estar em 1 ano?" className="mt-1" rows={2} /></div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><Label>Grau de urgência percebido</Label><Badge variant="outline">{planningData.urgency_level}/5</Badge></div>
                    <Slider value={[planningData.urgency_level]} onValueChange={([v]) => setPlanningData({ ...planningData, urgency_level: v })} min={1} max={5} step={1} className="py-2" />
                    <p className="text-xs text-muted-foreground">1 = Sem pressa, 5 = Muito urgente</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Block E - Self Assessment */}
            <AccordionItem value="block-e" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center"><Gauge className="h-4 w-4 text-purple-500" /></div>
                  <div className="text-left"><p className="font-semibold">Avaliação Inicial (Autoavaliação)</p><p className="text-xs text-muted-foreground">Como a empresa se enxerga hoje</p></div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid gap-6 pt-2">
                  <RatingSlider label="Estruturação do Marketing" description="Quão organizado está o marketing da empresa?" value={planningData.marketing_structure_rating} onChange={(v) => setPlanningData({ ...planningData, marketing_structure_rating: v })} />
                  <RatingSlider label="Estruturação do Processo Comercial" description="Quão estruturado está o processo de vendas?" value={planningData.sales_structure_rating} onChange={(v) => setPlanningData({ ...planningData, sales_structure_rating: v })} />
                  <RatingSlider label="Organização Digital Geral" description="Presença online, redes sociais, site, etc." value={planningData.digital_organization_rating} onChange={(v) => setPlanningData({ ...planningData, digital_organization_rating: v })} />
                  <RatingSlider label="Clareza de Posicionamento" description="A marca sabe como se posicionar no mercado?" value={planningData.positioning_clarity_rating} onChange={(v) => setPlanningData({ ...planningData, positioning_clarity_rating: v })} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Step 2: Diagnosis */}
      {currentStep === 2 && (
        <div className="space-y-6 mb-6">
          {/* AI Generation Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Diagnóstico Estratégico (IA)
              </CardTitle>
              <CardDescription>
                Gere uma análise estratégica completa baseada nos dados coletados na Etapa 1.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={generateDiagnosis} 
                  disabled={isGeneratingDiagnosis || !planningData.id}
                  className="gap-2"
                >
                  {isGeneratingDiagnosis ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando diagnóstico...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {planningData.diagnosis_text ? "Regenerar Diagnóstico" : "Gerar Diagnóstico com IA"}
                    </>
                  )}
                </Button>
                {planningData.diagnosis_text && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditingDiagnosis(!isEditingDiagnosis)}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    {isEditingDiagnosis ? "Cancelar Edição" : "Editar Manualmente"}
                  </Button>
                )}
              </div>
              
              {!planningData.id && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Salve o planejamento primeiro (avance e volte) para habilitar a geração por IA.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Diagnosis Content */}
          {planningData.diagnosis_text ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Diagnóstico Gerado</CardTitle>
                  {isEditingDiagnosis && (
                    <Button size="sm" onClick={saveDiagnosisManual} className="gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Edições
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditingDiagnosis ? (
                  <Textarea 
                    value={planningData.diagnosis_text} 
                    onChange={(e) => setPlanningData({ ...planningData, diagnosis_text: e.target.value })} 
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Edite o diagnóstico..."
                  />
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    {renderDiagnosisContent(planningData.diagnosis_text)}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Nenhum diagnóstico gerado</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Clique em "Gerar Diagnóstico com IA" para criar uma análise estratégica completa 
                  baseada nos dados da empresa coletados na Etapa 1.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              Este diagnóstico é uma análise estratégica. Não executa ações automaticamente.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Step 3: Maturity (Advanced mode only) */}
      {planningMode === 'advanced' && currentStep === 3 && (
        <Card className="mb-6"><CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-4"><h3 className="font-semibold">Marketing</h3><div><Label>Nível de Maturidade</Label><Select value={planningData.marketing_maturity_level} onValueChange={(v) => setPlanningData({ ...planningData, marketing_maturity_level: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-popover z-50">{MATURITY_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent></Select></div><div><Label>Situação Atual</Label><Textarea value={planningData.marketing_current_state} onChange={(e) => setPlanningData({ ...planningData, marketing_current_state: e.target.value })} className="mt-1" rows={3} /></div><div><Label>Meta Mais Importante</Label><Input value={planningData.marketing_top_goal} onChange={(e) => setPlanningData({ ...planningData, marketing_top_goal: e.target.value })} className="mt-1" /></div></div>
            <div className="flex items-center gap-2 pt-4 border-t"><Switch checked={planningData.include_sales} onCheckedChange={(c) => setPlanningData({ ...planningData, include_sales: c })} /><Label>Incluir Comercial</Label></div>
            {planningData.include_sales && (<div className="space-y-4"><h3 className="font-semibold">Comercial</h3><div><Label>Nível de Maturidade</Label><Select value={planningData.sales_maturity_level} onValueChange={(v) => setPlanningData({ ...planningData, sales_maturity_level: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent className="bg-popover z-50">{MATURITY_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent></Select></div><div><Label>Meta Comercial</Label><Input value={planningData.sales_top_goal} onChange={(e) => setPlanningData({ ...planningData, sales_top_goal: e.target.value })} className="mt-1" /></div></div>)}
          </div>
        </CardContent></Card>
      )}

      {/* Step 4: Strategy (Advanced mode only) */}
      {planningMode === 'advanced' && currentStep === 4 && (
        <div className="space-y-6 mb-6">
          {/* AI Generation Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary" />
                Estratégia e Tarefas (IA)
              </CardTitle>
              <CardDescription>
                Gere um plano de ação estratégico com tarefas acionáveis baseado no diagnóstico.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={generateStrategy} disabled={isGeneratingStrategy || !planningData.id || !planningData.diagnosis_text} className="gap-2">
                  {isGeneratingStrategy ? (<><Loader2 className="h-4 w-4 animate-spin" />Gerando estratégia...</>) : (<><Sparkles className="h-4 w-4" />{generatedStrategy ? "Regenerar Estratégia" : "Gerar Estratégia e Tarefas com IA"}</>)}
                </Button>
                {planningData.strategy_summary && (
                  <Button variant="outline" onClick={() => setIsEditingStrategy(!isEditingStrategy)} className="gap-2">
                    <Edit3 className="h-4 w-4" />{isEditingStrategy ? "Cancelar Edição" : "Editar Manualmente"}
                  </Button>
                )}
              </div>
              {!planningData.id && <Alert><AlertTriangle className="h-4 w-4" /><AlertDescription>Salve o planejamento primeiro.</AlertDescription></Alert>}
              {planningData.id && !planningData.diagnosis_text && <Alert><AlertTriangle className="h-4 w-4" /><AlertDescription>Gere o diagnóstico na Etapa 2 antes de gerar a estratégia.</AlertDescription></Alert>}
            </CardContent>
          </Card>

          {/* Strategy Content */}
          {generatedStrategy || planningData.strategy_summary ? (
            <div className="space-y-6">
              {/* Strategy Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5" />Direcionamento Estratégico</CardTitle>
                    {isEditingStrategy && <Button size="sm" onClick={saveStrategyManual} className="gap-2"><Save className="h-4 w-4" />Salvar</Button>}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingStrategy ? (
                    <Textarea value={planningData.strategy_summary} onChange={(e) => setPlanningData({ ...planningData, strategy_summary: e.target.value })} className="min-h-[200px]" />
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{planningData.strategy_summary}</p>
                  )}
                </CardContent>
              </Card>

              {/* Objectives and Tasks */}
              {generatedStrategy && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5" />Objetivos e Tarefas ({generatedStrategy.objectives.length} objetivos, {generatedStrategy.tasks.length} tarefas)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {generatedStrategy.objectives.map((objective) => {
                        const objectiveTasks = generatedStrategy.tasks.filter(t => t.objective_name === objective.name);
                        const isExpanded = expandedObjectives.includes(objective.name);
                        return (
                          <Collapsible key={objective.name} open={isExpanded} onOpenChange={() => toggleObjective(objective.name)}>
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3 text-left">
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                  <div>
                                    <p className="font-medium">{objective.name}</p>
                                    <p className="text-xs text-muted-foreground">{objective.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={getAreaColor(objective.area)}>{getAreaLabel(objective.area)}</Badge>
                                  <Badge variant="secondary">{objectiveTasks.length} tarefas</Badge>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="ml-7 mt-2 space-y-2">
                                {objectiveTasks.map((task, idx) => (
                                  <div key={idx} onClick={() => setSelectedTask(task)} className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium text-sm">{task.title}</span>
                                      </div>
                                      <Badge variant="outline" className={`text-xs ${getAreaColor(task.area)}`}>{getAreaLabel(task.area)}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 ml-6">{task.objective}</p>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                    
                    {/* Save Tasks Button */}
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={handleSaveTasksClick} 
                        disabled={isSavingTasks || tasksSaved} 
                        className="w-full gap-2"
                        variant={tasksSaved ? "secondary" : "default"}
                      >
                        {isSavingTasks ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />Salvando tarefas...</>
                        ) : tasksSaved ? (
                          <><CheckCircle2 className="h-4 w-4" />Tarefas salvas no Nexia</>
                        ) : (
                          <><Save className="h-4 w-4" />Salvar tarefas no Nexia</>
                        )}
                      </Button>
                      {tasksSaved && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          As tarefas foram salvas e podem ser gerenciadas em Tarefas
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center"><Lightbulb className="h-8 w-8 text-muted-foreground" /></div>
                <h3 className="font-semibold mb-2">Nenhuma estratégia gerada</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">Clique em "Gerar Estratégia e Tarefas com IA" para criar um plano de ação completo.</p>
              </CardContent>
            </Card>
          )}

          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">Este plano é estratégico. A execução depende do responsável.</AlertDescription>
          </Alert>

          {/* Task Detail Sheet */}
          <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
            <SheetContent className="sm:max-w-lg">
              {selectedTask && (
                <>
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5" />{selectedTask.title}</SheetTitle>
                    <SheetDescription><Badge variant="outline" className={getAreaColor(selectedTask.area)}>{getAreaLabel(selectedTask.area)}</Badge></SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div><h4 className="font-semibold text-sm mb-2">Objetivo</h4><p className="text-sm text-muted-foreground">{selectedTask.objective}</p></div>
                    <div><h4 className="font-semibold text-sm mb-2">Descrição</h4><p className="text-sm text-muted-foreground">{selectedTask.description}</p></div>
                    <div><h4 className="font-semibold text-sm mb-2">Passo a Passo</h4><ol className="list-decimal list-inside space-y-2">{selectedTask.steps.map((step, i) => <li key={i} className="text-sm text-muted-foreground">{step}</li>)}</ol></div>
                    <div><h4 className="font-semibold text-sm mb-2">Critério de Conclusão</h4><p className="text-sm text-muted-foreground bg-green-500/10 p-3 rounded-lg border border-green-500/20">{selectedTask.completion_criteria}</p></div>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Conclusion Step - Step 5 for advanced, Step 3 for simple */}
      {((planningMode === 'advanced' && currentStep === 5) || (planningMode === 'simple' && currentStep === 3)) && (
        <div className="space-y-6 mb-6">
          {/* Recommended Solution Card */}
          {planningData.recommended_solution && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Solução Prioritária Identificada
                </CardTitle>
                <CardDescription>
                  Com base no diagnóstico, esta é a recomendação da Nexia para este negócio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    {planningData.recommended_solution === 'site' && <FileText className="h-6 w-6 text-primary" />}
                    {planningData.recommended_solution === 'app' && <Zap className="h-6 w-6 text-primary" />}
                    {planningData.recommended_solution === 'processos' && <Target className="h-6 w-6 text-primary" />}
                    {planningData.recommended_solution === 'posicionamento' && <Lightbulb className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {planningData.recommended_solution === 'site' && 'Site Profissional'}
                      {planningData.recommended_solution === 'app' && 'Aplicativo / Sistema'}
                      {planningData.recommended_solution === 'processos' && 'Organização de Processos'}
                      {planningData.recommended_solution === 'posicionamento' && 'Posicionamento Digital'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {planningData.recommended_solution === 'site' && 'Criar presença online profissional para ser encontrado e gerar credibilidade'}
                      {planningData.recommended_solution === 'app' && 'Automatizar processos e escalar o atendimento com tecnologia'}
                      {planningData.recommended_solution === 'processos' && 'Estruturar rotinas e padrões operacionais para organizar o negócio'}
                      {planningData.recommended_solution === 'posicionamento' && 'Definir comunicação clara de valor e diferencial competitivo'}
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={() => {
                    const routes: Record<string, string> = {
                      site: '/solucoes/criar/site',
                      app: '/solucoes/criar/app',
                      processos: '/solucoes/organizacao',
                      posicionamento: '/solucoes/posicionamento',
                    };
                    navigate(routes[planningData.recommended_solution] || '/solucoes');
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                  Aplicar Solução Recomendada
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Resumo do Planejamento</h3>
                <div className="grid gap-4">
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Cliente</span><span className="font-medium">{selectedClient?.name || "-"}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Empresa</span><span className="font-medium">{planningData.company_name || "-"}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Setor</span><span className="font-medium">{planningData.sector_niche || "-"}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Tamanho</span><Badge variant="outline">{COMPANY_SIZES.find(s => s.value === planningData.company_size)?.label || "-"}</Badge></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Objetivo Inicial</span><span className="font-medium text-right max-w-[60%]">{planningData.initial_objective || "-"}</span></div>
                </div>
                <div><Label>Notas de Conclusão</Label><Textarea value={planningData.conclusion_notes} onChange={(e) => setPlanningData({ ...planningData, conclusion_notes: e.target.value })} className="mt-1" rows={4} /></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || isSaving}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSaveDraft} disabled={isSaving}><Save className="h-4 w-4 mr-2" />Salvar Rascunho</Button>
          {currentStep < totalSteps ? <Button onClick={handleNext} disabled={isSaving}>Continuar<ArrowRight className="h-4 w-4 ml-2" /></Button> : <Button onClick={handleFinish} disabled={isSaving}><Check className="h-4 w-4 mr-2" />Salvar Planejamento</Button>}
        </div>
      </div>

      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent><DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader><div className="space-y-4"><div><Label>Nome *</Label><Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Nome do cliente" className="mt-1" /></div><div><Label>Segmento</Label><Input value={newClientSegment} onChange={(e) => setNewClientSegment(e.target.value)} placeholder="Ex: Restaurante" className="mt-1" /></div></div><DialogFooter><Button variant="outline" onClick={() => setShowNewClientDialog(false)}>Cancelar</Button><Button onClick={handleCreateClient}>Criar Cliente</Button></DialogFooter></DialogContent>
      </Dialog>

      {/* Replace Tasks Dialog */}
      <Dialog open={showReplaceTasksDialog} onOpenChange={setShowReplaceTasksDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tarefas já existem</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Já existem tarefas salvas para este planejamento. Deseja substituí-las pelas novas tarefas geradas?
          </p>
          <p className="text-xs text-muted-foreground">
            As tarefas anteriores serão arquivadas e novas serão criadas.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplaceTasksDialog(false)}>Cancelar</Button>
            <Button onClick={() => saveTasksToDatabase(true)} disabled={isSavingTasks}>
              {isSavingTasks ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Substituir Tarefas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
