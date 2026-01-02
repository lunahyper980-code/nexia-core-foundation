import { Brain, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NexiaDashboardUpsellCardProps {
  onExplore: () => void;
}

export function NexiaDashboardUpsellCard({ onExplore }: NexiaDashboardUpsellCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground">
              Conheça o Nexia completo
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Diagnóstico, estratégia e tarefas automáticas para cada cliente.
            </p>
            <Button 
              variant="link" 
              size="sm" 
              onClick={onExplore}
              className="px-0 h-auto mt-2 text-primary text-xs gap-1"
            >
              Ver como funciona
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
