import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface AISuggestButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AISuggestButton({ 
  onClick, 
  isLoading = false, 
  disabled = false,
  className = ''
}: AISuggestButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50
        transition-all duration-200
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando sugestões...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Sugerir com IA
        </>
      )}
    </Button>
  );
}
