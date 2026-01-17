import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Suggestion } from '@/components/ai-suggest';

interface UseAISuggestionsOptions {
  projectType: 'app' | 'site';
}

interface GenerateSuggestionsParams {
  step: number;
  fields: Array<{ id: string; label: string; currentValue?: string }>;
  context: Record<string, any>;
}

export function useAISuggestions({ projectType }: UseAISuggestionsOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const generateSuggestions = useCallback(async ({ 
    step, 
    fields, 
    context 
  }: GenerateSuggestionsParams) => {
    setIsLoading(true);
    setIsVisible(true);
    setSuggestions([]);
    setAppliedSuggestions(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('generate-wizard-suggestions', {
        body: {
          projectType,
          step,
          fields,
          context
        }
      });

      if (error) throw error;

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        toast.error('Não foi possível gerar sugestões');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Erro ao gerar sugestões. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [projectType]);

  const applySuggestion = useCallback((suggestion: Suggestion) => {
    setAppliedSuggestions(prev => {
      const newSet = new Set(prev);
      newSet.add(suggestion.id);
      return newSet;
    });
    return suggestion.value;
  }, []);

  const closeSuggestions = useCallback(() => {
    setIsVisible(false);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsVisible(false);
    setAppliedSuggestions(new Set());
  }, []);

  return {
    isLoading,
    suggestions,
    isVisible,
    appliedSuggestions,
    generateSuggestions,
    applySuggestion,
    closeSuggestions,
    clearSuggestions
  };
}
