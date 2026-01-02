import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Brain, 
  Zap, 
  FileText, 
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function NexiaEscolhaPlaneamento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const briefingId = searchParams.get("briefingId");
  const briefingName = searchParams.get("briefingName") || "";
  const fromBriefing = searchParams.get("fromBriefing") === "true";

  const handleSelectSimple = () => {
    if (briefingId) {
      // If coming from a complete briefing, go directly to diagnosis generation
      // The briefingId already has all data needed - skip data collection
      navigate(`/nexia-ai/modo-simples?briefingId=${briefingId}&fromBriefing=${fromBriefing}`);
    } else {
      navigate("/nexia-ai/modo-simples");
    }
  };

  const handleSelectAdvanced = () => {
    if (briefingId) {
      // If coming from briefing, data is already complete - go to planning detail
      if (fromBriefing) {
        navigate(`/nexia-ai/planejamento/${briefingId}`);
      } else {
        navigate(`/nexia-ai/planejamento/${briefingId}/editar`);
      }
    } else {
      navigate("/nexia-ai/planejamento/novo");
    }
  };

  return (
    <AppLayout title="Escolher Planejamento">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Escolha o tipo de Planejamento</h1>
            <p className="text-muted-foreground">
              {briefingName 
                ? `Continuar planejamento para "${briefingName}"`
                : "Selecione como deseja criar seu planejamento com o Nexia"
              }
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Simple Mode */}
          <Card 
            className="relative overflow-hidden cursor-pointer border-2 transition-all hover:border-primary/50 hover:shadow-lg group"
            onClick={handleSelectSimple}
          >
            <div className="absolute top-3 right-3">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Recomendado
              </Badge>
            </div>
            <CardContent className="p-6 pt-12 space-y-4">
              <div className="p-3 w-fit rounded-xl bg-primary/10 border border-primary/20">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Planejamento Simples
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ideal para quem quer agilidade. Coleta as informações essenciais e gera um resumo rápido com IA.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span>~5 minutos para completar</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>3 etapas simples</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span>Resumo gerado por IA</span>
                </div>
              </div>

              <Button className="w-full gap-2 mt-4 group-hover:bg-primary">
                Iniciar Modo Simples
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Mode */}
          <Card 
            className="relative overflow-hidden cursor-pointer border-2 transition-all hover:border-primary/50 hover:shadow-lg group"
            onClick={handleSelectAdvanced}
          >
            <CardContent className="p-6 pt-12 space-y-4">
              <div className="p-3 w-fit rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Brain className="h-8 w-8 text-violet-500" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Planejamento Avançado
                </h3>
                <p className="text-muted-foreground text-sm">
                  Análise completa do negócio. Diagnóstico profundo, maturidade digital, estratégia e tarefas.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-violet-500" />
                  <span>~15-20 minutos para completar</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 text-violet-500" />
                  <span>5 etapas detalhadas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4 text-violet-500" />
                  <span>Diagnóstico + Estratégia + Tarefas</span>
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2 mt-4 group-hover:border-violet-500 group-hover:text-violet-500">
                Iniciar Modo Avançado
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="bg-muted/30 border-muted">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Você pode iniciar com o modo Simples e converter para Avançado depois, se precisar de mais detalhes.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
