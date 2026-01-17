import { AISuggestionCard } from './AISuggestionCard';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Suggestion {
  id: string;
  fieldId: string;
  title: string;
  description: string;
  value: string;
}

interface AISuggestionsPanelProps {
  suggestions: Suggestion[];
  appliedSuggestions: Set<string>;
  onApply: (suggestion: Suggestion) => void;
  onClose: () => void;
  isVisible: boolean;
}

export function AISuggestionsPanel({ 
  suggestions, 
  appliedSuggestions,
  onApply, 
  onClose,
  isVisible 
}: AISuggestionsPanelProps) {
  if (!isVisible || suggestions.length === 0) return null;

  // Group suggestions by field
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.fieldId]) {
      acc[suggestion.fieldId] = [];
    }
    acc[suggestion.fieldId].push(suggestion);
    return acc;
  }, {} as Record<string, Suggestion[]>);

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300 border border-primary/20 rounded-xl bg-card/50 backdrop-blur-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Sugestões da IA
          </span>
          <span className="text-xs text-muted-foreground">
            ({suggestions.length} sugestões)
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedSuggestions).map(([fieldId, fieldSuggestions]) => (
          <div key={fieldId}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fieldSuggestions.map((suggestion) => (
                <AISuggestionCard
                  key={suggestion.id}
                  title={suggestion.title}
                  description={suggestion.description}
                  onApply={() => onApply(suggestion)}
                  isApplied={appliedSuggestions.has(suggestion.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
