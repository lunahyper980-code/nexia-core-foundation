import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Brain,
  FileText,
  Layers,
  CheckSquare,
  Building2,
  Clock,
  ShoppingCart,
} from 'lucide-react';

interface Module {
  id: number;
  title: string;
  description: string;
  learnings: string[];
  estimatedTime: string;
  buttonText: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODULES: Module[] = [
  {
    id: 1,
    title: 'Operação de Prospecção',
    description: 'Estruture sua captação de clientes de forma previsível e escalável.',
    learnings: [
      'Como usar Encontrar Clientes',
      'Como salvar leads / histórico',
      'Como organizar follow-up',
    ],
    estimatedTime: '5–10 min',
    buttonText: 'Abrir módulo →',
    path: '/encontrar-clientes',
    icon: Search,
  },
  {
    id: 2,
    title: 'Diagnóstico Profissional',
    description: 'Colete informações e analise o negócio do cliente com profundidade.',
    learnings: [
      'Briefing completo (quando usar rápido vs completo)',
      'Diagnóstico e leitura do negócio',
      'Como transformar em plano',
    ],
    estimatedTime: '10–15 min',
    buttonText: 'Abrir módulo →',
    path: '/nexia-ai/briefing-rapido',
    icon: FileText,
  },
  {
    id: 3,
    title: 'Execução com Tarefas',
    description: 'Organize a execução com tarefas claras e acompanhamento visual.',
    learnings: [
      'Como usar a tela de Tarefas (A fazer / Em andamento / Concluídas)',
      'Como transformar tarefas em checklist semanal',
      'Como acompanhar entregas por cliente',
    ],
    estimatedTime: '5–10 min',
    buttonText: 'Abrir módulo →',
    path: '/nexia-ai/tarefas',
    icon: CheckSquare,
  },
  {
    id: 4,
    title: 'Soluções Digitais (Entregáveis)',
    description: 'Gere entregáveis prontos para impressionar e agregar valor.',
    learnings: [
      'Quando usar Soluções Digitais',
      'Como gerar kit, posicionamento, autoridade, organização etc.',
      'Como exportar PDF quando disponível',
    ],
    estimatedTime: '10–15 min',
    buttonText: 'Abrir módulo →',
    path: '/solucoes',
    icon: Layers,
  },
  {
    id: 5,
    title: 'Proposta + Fechamento',
    description: 'Converta diagnósticos em vendas com propostas profissionais.',
    learnings: [
      'Gerar proposta automática',
      'Como apresentar valor do plano',
      'Como oferecer execução como upgrade (cobrar mais)',
    ],
    estimatedTime: '5–10 min',
    buttonText: 'Abrir módulo →',
    path: '/vendas',
    icon: ShoppingCart,
  },
];

export default function GuiaAgencia() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Modo Agência">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/academy')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Modo Agência</h1>
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
                  Para profissionais que querem padronizar atendimento, briefing, diagnóstico, proposta 
                  e execução com fluxo de agência — entregando com qualidade e escalando operação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <div className="space-y-4">
          {MODULES.map((module) => {
            const Icon = module.icon;

            return (
              <Card 
                key={module.id}
                className="border-primary/20 hover:border-primary/30 transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      {/* Number + Icon */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {module.id}
                        </div>
                        <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>

                      {/* Title + Description */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">{module.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                    </div>

                    {/* Learnings */}
                    <div className="pl-0 sm:pl-[76px]">
                      <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">
                        O que você vai aprender:
                      </p>
                      <ul className="space-y-1">
                        {module.learnings.map((learning, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {learning}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pl-0 sm:pl-[76px] pt-2 border-t border-primary/10">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Tempo estimado: {module.estimatedTime}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate(module.path)}
                      >
                        {module.buttonText}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
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
