import { ArrowRight, Rocket, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface NexiaPostBriefingCTAProps {
  onContinueProject: () => void;
  onExploreComplete: () => void;
}

export function NexiaPostBriefingCTA({ 
  onContinueProject, 
  onExploreComplete 
}: NexiaPostBriefingCTAProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-5 space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-foreground">
            Esse briefing já é suficiente para criar um app ou site.
          </p>
          <p className="text-xs text-muted-foreground">
            Se quiser ir além, o Nexia completo analisa o negócio e cria um plano de ação.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={onContinueProject}
            className="flex-1 gap-2"
          >
            <Rocket className="h-4 w-4" />
            Continuar criando app/site
          </Button>
          <Button 
            variant="outline"
            onClick={onExploreComplete}
            className="flex-1 gap-2"
          >
            <Target className="h-4 w-4" />
            Explorar Nexia completo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
