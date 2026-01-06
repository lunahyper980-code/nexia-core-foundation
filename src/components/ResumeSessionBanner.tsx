import { RefreshCw, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ResumeSessionBannerProps {
  title?: string;
  description?: string;
  onResume: () => void;
  onStartFresh: () => void;
}

export function ResumeSessionBanner({
  title = "Continuar de onde parou?",
  description = "Você tem um rascunho salvo",
  onResume,
  onStartFresh,
}: ResumeSessionBannerProps) {
  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                onClick={onResume}
                className="gap-1.5 bg-emerald-500 hover:bg-emerald-600"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Continuar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onStartFresh}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Começar do zero
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
