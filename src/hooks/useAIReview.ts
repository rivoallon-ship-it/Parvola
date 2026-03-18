import { useState, useCallback, useMemo } from 'react';
import type { AIReviewResult, Employee, Semester, Evaluation } from '@/types';
import { reviewEvaluation } from '@/services/ai';

// ============================================
// Hook pour la revue IA pre-soumission
// ============================================

export interface UseAIReviewReturn {
  review: AIReviewResult | null;
  isLoading: boolean;
  error: string | null;
  generate: (employee: Employee, semester: Semester | null, evaluation: Evaluation) => Promise<void>;
  reset: () => void;
  dismissedAlerts: Set<string>;
  dismissAlert: (fieldId: string, index: number) => void;
  unresolvedCriticalCount: number;
  reviewCompleted: boolean;
}

export const useAIReview = (): UseAIReviewReturn => {
  const [review, setReview] = useState<AIReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [reviewCompleted, setReviewCompleted] = useState(false);

  const generate = useCallback(async (
    employee: Employee,
    semester: Semester | null,
    evaluation: Evaluation
  ) => {
    setIsLoading(true);
    setError(null);
    setReview(null);
    setDismissedAlerts(new Set());
    setReviewCompleted(false);

    try {
      const result = await reviewEvaluation(employee, semester, evaluation);
      setReview(result);
      setReviewCompleted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setReview(null);
    setError(null);
    setDismissedAlerts(new Set());
    setReviewCompleted(false);
  }, []);

  const dismissAlert = useCallback((fieldId: string, index: number) => {
    setDismissedAlerts(prev => {
      const next = new Set(prev);
      next.add(`${fieldId}:${index}`);
      return next;
    });
  }, []);

  const unresolvedCriticalCount = useMemo(() => {
    if (!review) return 0;
    let count = 0;
    for (const field of review.fields) {
      field.legalAlerts.forEach((alert, index) => {
        if (alert.severity === 'critical' && !dismissedAlerts.has(`${field.fieldId}:${index}`)) {
          count++;
        }
      });
    }
    return count;
  }, [review, dismissedAlerts]);

  return {
    review,
    isLoading,
    error,
    generate,
    reset,
    dismissedAlerts,
    dismissAlert,
    unresolvedCriticalCount,
    reviewCompleted,
  };
};
