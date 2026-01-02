import { Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NexiaUpsellBannerProps {
  onLearnMore: () => void;
}

export function NexiaUpsellBanner({ onLearnMore }: NexiaUpsellBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Info className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm text-foreground">
            Você está usando o Nexia no <strong>modo simples</strong>.
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ele organiza o cliente. O Nexia completo cria o plano.
          </p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onLearnMore}
        className="text-xs text-muted-foreground hover:text-foreground gap-1 shrink-0"
      >
        Ver como funciona
        <ArrowRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
