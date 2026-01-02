import { ArrowRight, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface NextStepCardProps {
  message: string;
  buttonText: string;
  path: string;
  variant?: 'default' | 'compact';
}

export function NextStepCard({ message, buttonText, path, variant = 'default' }: NextStepCardProps) {
  const navigate = useNavigate();

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Lightbulb className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground flex-1">{message}</p>
        <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => navigate(path)}>
          {buttonText}
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary mb-0.5">Próximo passo</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <Button size="sm" className="gap-2 shrink-0" onClick={() => navigate(path)}>
            {buttonText}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
