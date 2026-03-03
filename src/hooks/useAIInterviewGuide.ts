import { useState, useCallback } from 'react';
import type { InterviewGuide, Employee, Semester, Evaluation } from '@/types';
import { generateInterviewGuide } from '@/services/ai';

// ============================================
// Hook pour le Guide d'entretien IA
// ============================================

interface UseAIInterviewGuideReturn {
  guide: InterviewGuide | null;
  isLoading: boolean;
  error: string | null;
  generate: (employee: Employee, semester: Semester | null, evaluation: Evaluation | null) => Promise<void>;
  reset: () => void;
}

export const useAIInterviewGuide = (): UseAIInterviewGuideReturn => {
  const [guide, setGuide] = useState<InterviewGuide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (
    employee: Employee,
    semester: Semester | null,
    evaluation: Evaluation | null
  ) => {
    setIsLoading(true);
    setError(null);
    setGuide(null);

    try {
      const result = await generateInterviewGuide(employee, semester, evaluation);
      setGuide(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Interview guide generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGuide(null);
    setError(null);
  }, []);

  return { guide, isLoading, error, generate, reset };
};
