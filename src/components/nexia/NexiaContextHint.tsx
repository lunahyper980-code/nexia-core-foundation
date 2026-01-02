import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NexiaContextHintProps {
  text: string;
  className?: string;
}

/**
 * Micro-copy contextual hint for upsell (non-commercial, informative)
 * Example: "Este plano poderia gerar tarefas automaticamente"
 */
export function NexiaContextHint({ text, className = '' }: NexiaContextHintProps) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div className={`inline-flex items-center gap-1 text-xs text-muted-foreground cursor-help ${className}`}>
          <Info className="h-3 w-3" />
          <span className="hover:text-foreground transition-colors">{text}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-center">
        <p className="text-xs">Disponível no modo completo do Nexia</p>
      </TooltipContent>
    </Tooltip>
  );
}
