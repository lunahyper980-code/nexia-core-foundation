import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Check } from 'lucide-react';

interface AISuggestionCardProps {
  title: string;
  description: string;
  onApply: () => void;
  isApplied?: boolean;
}

export function AISuggestionCard({ 
  title, 
  description, 
  onApply,
  isApplied = false 
}: AISuggestionCardProps) {
  return (
    <div 
      className={`
        p-4 rounded-xl border transition-all duration-200
        ${isApplied 
          ? 'border-primary/50 bg-primary/5' 
          : 'border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
            Sugestão IA
          </Badge>
        </div>
        {isApplied && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>
      
      <h4 className="font-medium text-foreground text-sm mb-1.5 line-clamp-2">
        {title}
      </h4>
      
      <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
        {description}
      </p>
      
      <Button
        variant={isApplied ? "secondary" : "default"}
        size="sm"
        onClick={onApply}
        className={`
          w-full text-xs
          ${isApplied 
            ? 'bg-primary/10 text-primary hover:bg-primary/20' 
            : 'bg-primary hover:bg-primary/90'
          }
        `}
      >
        {isApplied ? 'Sugestão aplicada' : 'Usar esta sugestão'}
      </Button>
    </div>
  );
}
