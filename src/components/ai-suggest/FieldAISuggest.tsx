import { useState, useEffect } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  text: string;
}

interface FieldAISuggestProps {
  fieldId: string;
  fieldLabel: string;
  projectType: 'app' | 'site';
  context: Record<string, any>;
  onApply: (value: string) => void;
  currentValue?: string;
  className?: string;
}

export function FieldAISuggest({
  fieldId,
  fieldLabel,
  projectType,
  context,
  onApply,
  currentValue,
  className
}: FieldAISuggestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Hide suggestions when value changes (user typed or applied a suggestion)
  useEffect(() => {
    if (currentValue && suggestions.length > 0) {
      // Only hide if the value matches one of the suggestions
      const appliedSuggestion = suggestions.find(s => s.text === currentValue);
      if (appliedSuggestion) {
        setSuggestions([]);
        setIsVisible(false);
      }
    }
  }, [currentValue]);

  const generateSuggestions = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setIsVisible(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-wizard-suggestions', {
        body: {
          projectType,
          fieldId,
          fieldLabel,
          context,
          mode: 'single-field'
        }
      });

      if (error) throw error;

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions.map((s: any, idx: number) => ({
          id: s.id || `suggestion-${idx}`,
          text: s.value || s.text || s.title
        })));
      }
    } catch (error) {
      console.error('Error generating field suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (suggestion: Suggestion) => {
    onApply(suggestion.text);
    setSuggestions([]);
    setIsVisible(false);
  };

  const closeSuggestions = () => {
    setSuggestions([]);
    setIsVisible(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button - Aligned with Label */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={generateSuggestions}
        disabled={isLoading}
        className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 transition-all duration-200"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3 mr-1" />
        )}
        <span className="hidden sm:inline">Sugerir com IA</span>
        <span className="sm:hidden">IA</span>
      </Button>

      {/* Suggestions Chips */}
      {isVisible && suggestions.length > 0 && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleApply(suggestion)}
                className="
                  inline-flex items-center px-3 py-1.5 
                  text-xs font-medium text-foreground
                  bg-background/80 backdrop-blur-sm
                  border border-primary/30 
                  rounded-full
                  shadow-[0_0_12px_rgba(139,92,246,0.15)]
                  hover:border-primary/60 hover:bg-primary/10
                  hover:shadow-[0_0_16px_rgba(139,92,246,0.25)]
                  transition-all duration-200
                  cursor-pointer
                  max-w-full truncate
                "
              >
                <span className="truncate">{suggestion.text}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={closeSuggestions}
              className="
                inline-flex items-center justify-center
                w-6 h-6 
                text-muted-foreground hover:text-foreground
                bg-muted/50 hover:bg-muted
                rounded-full
                transition-all duration-200
              "
              aria-label="Fechar sugestões"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isVisible && isLoading && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in duration-200">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <span>Gerando sugestões...</span>
        </div>
      )}
    </div>
  );
}

// Export wrapper for use with Label
interface FieldLabelWithAIProps {
  htmlFor: string;
  children: React.ReactNode;
  fieldId: string;
  projectType: 'app' | 'site';
  context: Record<string, any>;
  onApply: (value: string) => void;
  currentValue?: string;
}

export function FieldLabelWithAI({
  htmlFor,
  children,
  fieldId,
  projectType,
  context,
  onApply,
  currentValue
}: FieldLabelWithAIProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {children}
      </label>
      <FieldAISuggest
        fieldId={fieldId}
        fieldLabel={String(children)}
        projectType={projectType}
        context={context}
        onApply={onApply}
        currentValue={currentValue}
      />
    </div>
  );
}
