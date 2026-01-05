import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Rocket,
  Building2,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function Academy() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Academy">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Comece por aqui</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Siga o passo a passo e faça sua primeira venda com a Nexia Suite — sem depender de experiência técnica.
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Card 1 - Iniciante */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Rocket className="h-7 w-7 text-emerald-500" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Recomendado
                </Badge>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Modo Iniciante
                </h2>
                <p className="text-sm text-muted-foreground font-medium text-emerald-600/80 mb-2">
                  Primeira Venda
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para quem está começando do zero. Você segue o passo a passo e a Nexia te guia do primeiro contato até a entrega.
                </p>
              </div>
              <Button 
                className="w-full gap-2 group-hover:bg-emerald-600" 
                onClick={() => navigate('/academy/guia-iniciante')}
              >
                Começar
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Card 2 - Agência */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Avançado
                </Badge>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Modo Agência
                </h2>
                <p className="text-sm text-muted-foreground font-medium text-primary/80 mb-2">
                  Processo Profissional
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Para quem quer padronizar atendimento, briefing, diagnóstico, proposta e execução com fluxo de agência.
                </p>
              </div>
              <Button 
                variant="outline"
                className="w-full gap-2" 
                onClick={() => navigate('/academy/guia-agencia')}
              >
                Ver guia
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Card 3 - FAQ */}
          <Card className="border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <HelpCircle className="h-7 w-7 text-amber-500" />
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                  Suporte
                </Badge>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  FAQ + Suporte
                </h2>
                <p className="text-sm text-muted-foreground font-medium text-amber-600/80 mb-2">
                  Dúvidas frequentes
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Respostas rápidas sobre fluxo, entregas, soluções, propostas e uso da plataforma.
                </p>
              </div>
              <Button 
                variant="outline"
                className="w-full gap-2" 
                onClick={() => navigate('/academy/faq')}
              >
                Abrir
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Dica: comece pelo Modo Iniciante
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mesmo que você já tenha experiência, o Modo Iniciante mostra o fluxo ideal: prospectar → briefing → diagnóstico → proposta → entrega.
                </p>
              </div>
              <Button onClick={() => navigate('/academy/guia-iniciante')} className="shrink-0 gap-2">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
