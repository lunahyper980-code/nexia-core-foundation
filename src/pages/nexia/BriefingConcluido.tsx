import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Check, 
  Building2, 
  Globe2,
  Smartphone,
  Zap,
  LayoutDashboard,
  Target,
  Clock,
  UserPlus,
  FileText,
  ArrowRight,
  Users,
  Brain,
  Loader2
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

interface BriefingData {
  id: string;
  name: string;
  company_name: string | null;
  sector_niche: string | null;
  location_region: string | null;
  main_problem: string | null;
  primary_goal: string | null;
  urgency_level: number | null;
  maturity_level: string | null;
  description: string | null;
  simple_summary: string | null;
  status: string;
  mode: string | null;
}

interface ParsedDescription {
  serviceMode?: string;
  hasSite?: string;
  hasInstagram?: string;
  hasWhatsapp?: string;
  suggestedSolutions?: string[];
  maturityLevel?: string;
  entityType?: string;
}

const maturityConfig: Record<string, { label: string; color: string }> = {
  baixo: { label: "Baixo", color: "text-red-500 bg-red-500/10" },
  medio: { label: "Médio", color: "text-amber-500 bg-amber-500/10" },
  alto: { label: "Alto", color: "text-emerald-500 bg-emerald-500/10" },
};

const solutionIcons: Record<string, typeof Globe2> = {
  "Site": Globe2,
  "Aplicativo": Smartphone,
  "Organização de processos": LayoutDashboard,
  "Estratégia digital": Zap,
};

export default function BriefingConcluido() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  
  const briefingId = searchParams.get("briefingId");
  
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [parsedDescription, setParsedDescription] = useState<ParsedDescription>({});
  const [loading, setLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (workspace && briefingId) {
      fetchBriefing();
    }
  }, [workspace, briefingId]);

  const fetchBriefing = async () => {
    if (!workspace || !briefingId) return;

    try {
      const { data, error } = await supabase
        .from("nexia_plannings")
        .select("*")
        .eq("id", briefingId)
        .eq("workspace_id", workspace.id)
        .single();

      if (error) throw error;
      
      setBriefing(data);
      
      // Parse description JSON if exists
      if (data.description) {
        try {
          const parsed = JSON.parse(data.description);
          setParsedDescription(parsed);
        } catch {
          // Not JSON, ignore
        }
      }
    } catch (error) {
      console.error("Error fetching briefing:", error);
      toast.error("Erro ao carregar briefing");
      navigate("/nexia-ai/planejamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleKeepAsLead = () => {
    toast.success("Lead mantido! Você pode acessá-lo nos planejamentos.");
    navigate("/nexia-ai/planejamentos");
  };

  const handleConvertToClient = async () => {
    if (!workspace || !user || !briefing) return;

    setIsConverting(true);
    try {
      // 1. Create the client
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert([{
          workspace_id: workspace.id,
          created_by_user_id: user.id,
          name: briefing.company_name || briefing.name.replace("Briefing Rápido - ", ""),
          segment: briefing.sector_niche || null,
          city: briefing.location_region || null,
          status: "active",
          notes: briefing.main_problem || null,
        }])
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Update the briefing/planning with the client_id
      const { error: updateError } = await supabase
        .from("nexia_plannings")
        .update({ 
          client_id: newClient.id,
          status: "draft" // Change from 'briefing' to 'draft' (now it's a planning)
        })
        .eq("id", briefing.id);

      if (updateError) throw updateError;

      // 3. Log activity
      await supabase.from("activity_logs").insert([{
        workspace_id: workspace.id,
        user_id: user.id,
        type: "LEAD_CONVERTED",
        entity_type: "client",
        entity_id: newClient.id,
        title: "Lead convertido em cliente",
        description: `"${briefing.company_name}" foi convertido de lead para cliente`,
        message: `Lead "${briefing.company_name}" convertido em cliente`,
        metadata: { 
          planningId: briefing.id,
          previousStatus: "briefing",
          newStatus: "draft"
        },
      }]);

      toast.success("Lead convertido em cliente!");

      // 4. Navigate to planning choice screen
      navigate(`/nexia-ai/escolher-planejamento?briefingId=${briefing.id}&briefingName=${encodeURIComponent(briefing.company_name || "")}`);
    } catch (error) {
      console.error("Error converting to client:", error);
      toast.error("Erro ao converter lead");
    } finally {
      setIsConverting(false);
    }
  };

  const maturity = briefing?.maturity_level 
    ? maturityConfig[briefing.maturity_level] || maturityConfig.baixo
    : maturityConfig.baixo;

  const suggestions = parsedDescription.suggestedSolutions || [];

  if (loading) {
    return (
      <AppLayout title="Briefing Concluído">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!briefing) {
    return (
      <AppLayout title="Briefing Concluído">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Briefing não encontrado</p>
          <Button onClick={() => navigate("/nexia-ai/planejamentos")} className="mt-4">
            Ir para Planejamentos
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Briefing Concluído">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Briefing concluído. Próximo passo</h1>
          <p className="text-muted-foreground">
            Analise as informações e decida como prosseguir com este lead.
          </p>
        </div>

        {/* Resumo do Briefing */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Resumo do Briefing
              </CardTitle>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Users className="h-3 w-3 mr-1" />
                Lead (não é cliente)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic info grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Negócio</p>
                <p className="font-medium">{briefing.company_name || "Não informado"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Segmento</p>
                <p className="font-medium">{briefing.sector_niche || "Não informado"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Localização</p>
                <p className="font-medium">{briefing.location_region || "Não informado"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Objetivo</p>
                <p className="font-medium">{briefing.primary_goal || "Não informado"}</p>
              </div>
            </div>

            {/* Main problem */}
            {briefing.main_problem && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Principal desafio</p>
                <p className="font-medium">{briefing.main_problem}</p>
              </div>
            )}

            <Separator />

            {/* Diagnóstico automático */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Diagnóstico Automático
              </h3>
              
              {/* Maturidade Digital */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <p className="text-sm font-medium text-foreground">Nível de Maturidade Digital</p>
                  <p className="text-xs text-muted-foreground">Baseado na presença digital atual</p>
                </div>
                <Badge className={maturity.color}>
                  {maturity.label}
                </Badge>
              </div>

              {/* Urgência */}
              {briefing.urgency_level && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Urgência: {briefing.urgency_level >= 4 ? "Alta" : briefing.urgency_level >= 2 ? "Média" : "Baixa"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sugestões de solução */}
            {suggestions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">O negócio possivelmente precisa de:</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, i) => {
                      const Icon = solutionIcons[suggestion] || Zap;
                      return (
                        <Badge key={i} variant="secondary" className="gap-1 py-1.5 px-3">
                          <Icon className="h-3.5 w-3.5" />
                          {suggestion}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* AI Summary if exists */}
            {briefing.simple_summary && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Resumo
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {briefing.simple_summary}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Keep as lead */}
          <Card 
            className="cursor-pointer border-2 transition-all hover:border-muted-foreground/30"
            onClick={handleKeepAsLead}
          >
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Manter como Lead</h3>
              <p className="text-sm text-muted-foreground">
                Salva o briefing sem criar cliente. Você pode converter depois.
              </p>
            </CardContent>
          </Card>

          {/* Convert to client */}
          <Card 
            className="cursor-pointer border-2 border-primary/20 bg-primary/5 transition-all hover:border-primary/40"
            onClick={!isConverting ? handleConvertToClient : undefined}
          >
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                {isConverting ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <UserPlus className="h-6 w-6 text-primary" />
                )}
              </div>
              <h3 className="font-semibold text-foreground mb-1">Converter em Cliente</h3>
              <p className="text-sm text-muted-foreground">
                Cria um cliente e inicia o planejamento estratégico.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Convert button alternative */}
        <Button 
          onClick={handleConvertToClient} 
          disabled={isConverting}
          className="w-full gap-2"
          size="lg"
        >
          {isConverting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Convertendo...
            </>
          ) : (
            <>
              Converter em cliente e criar planejamento
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </AppLayout>
  );
}
