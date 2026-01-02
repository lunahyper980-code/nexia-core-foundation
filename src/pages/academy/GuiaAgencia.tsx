import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Brain,
  FileText,
  Layers,
  Package,
  History,
  Building2,
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Briefing Estruturado',
    description: 'Colete informações completas do cliente antes de qualquer entrega. Preencha as 4 etapas: Negócio, Digital, Situação e Objetivos.',
    buttonText: 'Ir para Briefing',
    path: '/nexia-ai/briefing-rapido',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Planejamento Estratégico',
    description: 'Crie um planejamento completo com tarefas, prioridades e execução estruturada usando o Nexia Completo.',
    buttonText: 'Ir para Nexia Completo',
    path: '/nexia-ai/planejamento/novo?mode=advanced',
    icon: Brain,
  },
  {
    id: 3,
    title: 'Execução',
    description: 'Execute exatamente o que foi recomendado no planejamento: sites, apps, autoridade digital, kit de lançamento e mais.',
    buttonText: 'Ir para Soluções Digitais',
    path: '/solucoes',
    icon: Layers,
  },
  {
    id: 4,
    title: 'Gestão',
    description: 'Acompanhe o que já foi feito e o que está em andamento. Gerencie tarefas e visualize o progresso dos planejamentos.',
    buttonText: 'Ver Planejamentos',
    path: '/nexia-ai/planejamentos',
    icon: History,
  },
];

export default function GuiaAgencia() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Guia Agência">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/academy')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Guia Agência</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Processo Profissional
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Padronize diagnóstico, proposta e entrega para escalar sua operação.
            </p>
          </div>
        </div>

        {/* Intro Card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Para quem é este guia?</h3>
                <p className="text-sm text-muted-foreground">
                  Para profissionais que já vendem serviços digitais e querem um processo padronizado 
                  para entregar com qualidade, justificar valor e escalar operação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step) => {
            const Icon = step.icon;

            return (
              <Card 
                key={step.id}
                className="border-primary/20 hover:border-primary/30 transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Number + Icon */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {step.id}
                      </div>
                      <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Action */}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-2 shrink-0"
                      onClick={() => navigate(step.path)}
                    >
                      {step.buttonText}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Final Message */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Processo replicável = Escala previsível
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cada cliente passa pelo mesmo fluxo. Você ganha velocidade, qualidade e margem.
            </p>
            <Button onClick={() => navigate('/encontrar-clientes')} className="gap-2">
              Começar prospecção
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
