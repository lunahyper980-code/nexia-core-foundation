import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  BarChart3, 
  Target, 
  ListChecks, 
  History, 
  LayoutDashboard,
  Check
} from 'lucide-react';

interface NexiaUpsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivateFull: () => void;
  onContinueSimple?: () => void;
}

const features = [
  { 
    icon: Brain, 
    label: 'Diagnóstico inteligente do negócio',
    description: 'Análise completa da situação atual'
  },
  { 
    icon: BarChart3, 
    label: 'Análise de maturidade',
    description: 'Entenda o estágio do cliente'
  },
  { 
    icon: Target, 
    label: 'Objetivos claros por área',
    description: 'Marketing e vendas organizados'
  },
  { 
    icon: ListChecks, 
    label: 'Lista de tarefas prontas',
    description: 'Ações organizadas automaticamente'
  },
  { 
    icon: History, 
    label: 'Histórico completo',
    description: 'Tudo o que foi feito fica salvo'
  },
  { 
    icon: LayoutDashboard, 
    label: 'Visão geral no dashboard',
    description: 'Acompanhe tudo em tempo real'
  },
];

export function NexiaUpsellModal({ 
  open, 
  onOpenChange, 
  onActivateFull,
  onContinueSimple 
}: NexiaUpsellModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">O que muda no Nexia completo?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Todas as ferramentas para organizar e planejar negócios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.label} className="flex items-start gap-3">
                <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground text-center pb-2">
          É o mesmo Nexia, só que em modo avançado.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          {onContinueSimple && (
            <Button 
              variant="outline" 
              onClick={() => {
                onContinueSimple();
                onOpenChange(false);
              }}
              className="flex-1"
            >
              Continuar no modo simples
            </Button>
          )}
          <Button 
            onClick={() => {
              onActivateFull();
              onOpenChange(false);
            }}
            className="flex-1 gap-2"
          >
            <Check className="h-4 w-4" />
            Ativar Nexia completo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
