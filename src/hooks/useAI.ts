import { useState, useCallback } from 'react';
import type { AISuggestedObjective, AISuggestedTemplate, Employee, Semester, Position } from '@/types';
import { generateObjectives, generateTemplates } from '@/services/ai';

// ============================================
// Hook pour l'Assistant IA
// ============================================

interface UseAIObjectivesReturn {
  prompt: string;
  setPrompt: (value: string) => void;
  suggestions: AISuggestedObjective[];
  isLoading: boolean;
  error: string | null;
  generate: (employee: Employee, semester: Semester | null, companyContext?: string) => Promise<void>;
  reset: () => void;
}

export const useAIObjectives = (): UseAIObjectivesReturn => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestedObjective[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (employee: Employee, semester: Semester | null, companyContext?: string) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const results = await generateObjectives(employee, semester, prompt, companyContext);
      if (results.length > 0) {
        setSuggestions(results);
      } else {
        setError('Aucun objectif généré. Veuillez reformuler votre demande.');
      }
    } catch (err) {
      setError('Erreur lors de la génération. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const reset = useCallback(() => {
    setPrompt('');
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    prompt,
    setPrompt,
    suggestions,
    isLoading,
    error,
    generate,
    reset,
  };
};

interface UseAITemplatesReturn {
  prompt: string;
  setPrompt: (value: string) => void;
  suggestions: AISuggestedTemplate[];
  isLoading: boolean;
  error: string | null;
  generate: (position: Position, companyContext?: string) => Promise<void>;
  reset: () => void;
}

export const useAITemplates = (): UseAITemplatesReturn => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestedTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (position: Position, companyContext?: string) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const results = await generateTemplates(position, prompt, companyContext);
      if (results.length > 0) {
        setSuggestions(results);
      } else {
        setError('Aucun template généré. Veuillez reformuler votre demande.');
      }
    } catch (err) {
      setError('Erreur lors de la génération. Veuillez réessayer.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const reset = useCallback(() => {
    setPrompt('');
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    prompt,
    setPrompt,
    suggestions,
    isLoading,
    error,
    generate,
    reset,
  };
};
