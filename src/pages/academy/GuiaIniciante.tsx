import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Brain,
  FileText,
  Rocket,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Info,
  Heart,
  ShoppingCart,
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  objective: string;
  howTo: string;
  alertMessage: string;
  buttonText: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  tips?: string[];
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Encontrar um Cliente',
    objective: 'Encontrar um cliente potencial qualificado para iniciar uma conversa.',
    howTo: "Entre em 'Encontrar Clientes', selecione nicho e cidade, e gere uma mensagem com a Abordagem Inteligente.",
    alertMessage: 'Não fale de preço agora. Primeiro faça contato e entenda o negócio.',
    buttonText: 'Ir para Encontrar Clientes →',
    path: '/encontrar-clientes',
    icon: Search,
    tips: [
      'O objetivo aqui NÃO é vender',
      'Apenas iniciar conversa e entender o contexto',
      'Use a mensagem pronta e personalize 1 linha',
    ],
  },
  {
    id: 2,
    title: 'Gerar Briefing Rápido',
    objective: 'Coletar informações essenciais do cliente de forma estruturada.',
    howTo: 'Após o cliente responder com interesse, gere um Briefing Rápido. Preencha com dados reais do negócio (segmento, público, objetivo, situação).',
    alertMessage: 'Isso alimenta o diagnóstico e o planejamento. Demora menos de 3 minutos.',
    buttonText: 'Ir para Briefing →',
    path: '/nexia-ai/briefing-rapido',
    icon: FileText,
    tips: [
      'Isso alimenta o diagnóstico e o planejamento',
      'Demora menos de 3 minutos',
      'Evita retrabalho na entrega',
    ],
  },
  {
    id: 3,
    title: 'Gerar Diagnóstico + Planejamento',
    objective: 'Transformar as informações em um plano com tarefas acionáveis.',
    howTo: "Use o Nexia (Diagnóstico/Planejamento) para gerar o plano estratégico e tarefas. Esse é o 'cérebro' da entrega: ele organiza o que fazer.",
    alertMessage: 'Você pode editar antes de enviar. O plano vira tarefas automaticamente.',
    buttonText: 'Ir para Diagnóstico/Planejamento →',
    path: '/nexia-ai/escolha-planejamento',
    icon: Brain,
    tips: [
      'Você pode editar antes de enviar',
      'O plano vira tarefas automaticamente',
      'Isso dá clareza e aumenta percepção de valor',
    ],
  },
  {
    id: 4,
    title: 'Gerar Proposta e Entregar',
    objective: 'Converter o plano em uma entrega profissional (e vender com segurança).',
    howTo: 'Gere uma proposta comercial e entregue o plano/entregável como PDF quando disponível. Se preferir, ofereça execução como serviço adicional.',
    alertMessage: 'Proposta pronta aumenta fechamento. Execução é opcional e cobra mais.',
    buttonText: 'Ir para Propostas/Vendas →',
    path: '/vendas',
    icon: ShoppingCart,
    tips: [
      'Proposta pronta aumenta fechamento',
      'Entrega instrucional pode ser enviada em PDF',
      'Execução é opcional e cobra mais',
    ],
  },
];

export default function GuiaIniciante() {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const allCompleted = completedSteps.length === STEPS.length;
  const progress = (completedSteps.length / STEPS.length) * 100;

  return (
    <AppLayout title="Guia Iniciante">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/academy')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">Guia Iniciante</h1>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Do zero ao primeiro cliente
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Siga o passo a passo e faça sua primeira venda com a Nexia — sem precisar ser expert em marketing, tecnologia ou estratégia.
            </p>
          </div>
        </div>

        {/* Mensagem de boas-vindas */}
        <Alert className="border-primary/30 bg-primary/5">
          <Heart className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Você não precisa saber tudo.</strong> O Nexia organiza o processo: você só aplica o fluxo e entrega com aparência profissional.
          </AlertDescription>
        </Alert>

        {/* Progress */}
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Seu progresso</span>
              <span className="text-sm font-medium text-foreground">{completedSteps.length} de {STEPS.length}</span>
            </div>
            <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isNext = !isCompleted && completedSteps.length === index;

            return (
              <Card 
                key={step.id}
                className={`border transition-all ${
                  isCompleted 
                    ? 'border-emerald-500/30 bg-emerald-500/5' 
                    : isNext
                      ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border/50 hover:border-primary/30'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Checkbox + Number */}
                    <div className="flex items-center gap-3 shrink-0">
                      <Checkbox 
                        checked={isCompleted}
                        onCheckedChange={() => toggleStep(step.id)}
                        className="h-5 w-5"
                      />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                        isCompleted 
                          ? 'bg-emerald-500/20 text-emerald-600' 
                          : isNext
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            Passo {step.id}
                          </Badge>
                          {isNext && (
                            <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                              <Sparkles className="h-3 w-3" />
                              Próximo passo
                            </Badge>
                          )}
                        </div>
                        <h3 className={`text-lg font-semibold ${isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-primary/80 font-medium">
                          Objetivo: {step.objective}
                        </p>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.howTo}
                      </p>

                      {/* Tips */}
                      {step.tips && (
                        <div className="flex flex-wrap gap-2">
                          {step.tips.map((tip, i) => (
                            <span 
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground"
                            >
                              <CheckCircle2 className="h-3 w-3 text-primary/60" />
                              {tip}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Alert Message */}
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                          {step.alertMessage}
                        </p>
                      </div>

                      {/* Action Button */}
                      <Button 
                        size="sm" 
                        variant={isCompleted ? 'outline' : isNext ? 'default' : 'secondary'}
                        className="gap-2 w-full sm:w-auto"
                        onClick={() => navigate(step.path)}
                      >
                        {step.buttonText}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Critério de conclusão */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong className="text-foreground">Você conclui quando:</strong> iniciou conversa, coletou briefing, gerou plano e enviou uma proposta/entrega ao cliente.
            </p>
          </CardContent>
        </Card>

        {/* Final CTA */}
        {allCompleted ? (
          <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                Parabéns! Você completou o guia!
              </h3>
              <p className="text-muted-foreground mb-4">
                Agora é só repetir esse fluxo com novos clientes. O Nexia cresce com você.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/encontrar-clientes')} className="gap-2">
                  Encontrar próximo cliente
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/nexia-ai')}>
                  Ir para Nexia AI
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Comece simples. O Nexia cresce com você.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Você não precisa fazer tudo de uma vez. Vá no seu ritmo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
