import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, Info, Check, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Modal, Card, Button } from '@/components/common';
import { useAIReview } from '@/hooks';
import type { Employee, Semester, Evaluation, AIReviewFieldResult, AIReviewSeverity } from '@/types';

// ============================================
// Modale de Revue IA pre-soumission
// ============================================

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  semester: Semester | null;
  evaluation: Evaluation;
  onApplyCorrection: (fieldId: string, original: string, suggested: string) => void;
  onReviewComplete: (unresolvedCriticalCount: number) => void;
}

const severityConfig: Record<AIReviewSeverity, { bg: string; border: string; text: string; label: string }> = {
  critical: { bg: '#FEE2E2', border: '#FECACA', text: '#991B1B', label: 'Critique' },
  warning: { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E', label: 'Attention' },
  info: { bg: '#DBEAFE', border: '#BFDBFE', text: '#1E40AF', label: 'Info' },
};

const FieldSection = ({
  field,
  onApplyCorrection,
  appliedCorrections,
  onApply,
  dismissedAlerts,
  onDismissAlert,
}: {
  field: AIReviewFieldResult;
  onApplyCorrection: (fieldId: string, original: string, suggested: string) => void;
  appliedCorrections: Set<string>;
  onApply: (key: string) => void;
  dismissedAlerts: Set<string>;
  onDismissAlert: (fieldId: string, index: number) => void;
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const hasIssues = field.corrections.length > 0 || field.suggestions.length > 0 || field.legalAlerts.length > 0;
  if (!hasIssues) return null;

  const hasCritical = field.legalAlerts.some(a => a.severity === 'critical');

  return (
    <Card padding="none">
      <div
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: hasCritical ? '#EF4444' : field.legalAlerts.length > 0 ? '#F59E0B' : '#3B82F6',
          borderRadius: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-800">{field.fieldLabel}</h4>
            <div className="flex gap-1.5">
              {field.corrections.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {field.corrections.length} {t('aiReview.correctionsTitle').toLowerCase()}
                </span>
              )}
              {field.legalAlerts.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${hasCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {field.legalAlerts.length} {t('aiReview.legalAlertsTitle').toLowerCase()}
                </span>
              )}
            </div>
          </div>
          {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3">
            {/* Corrections */}
            {field.corrections.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{t('aiReview.correctionsTitle')}</p>
                {field.corrections.map((corr, i) => {
                  const key = `${field.fieldId}:corr:${i}`;
                  const isApplied = appliedCorrections.has(key);
                  return (
                    <div key={i} className="rounded-lg border border-gray-200 p-3 text-sm">
                      <div className="flex flex-col gap-1 mb-2">
                        <span className="text-gray-500 line-through">{corr.original}</span>
                        <span className="text-green-700 font-medium">{corr.suggested}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{corr.reason}</p>
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                          <Check size={12} /> {t('aiReview.accepted')}
                        </span>
                      ) : (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            onApplyCorrection(field.fieldId, corr.original, corr.suggested);
                            onApply(key);
                          }}
                        >
                          {t('aiReview.accept')}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Suggestions */}
            {field.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">{t('aiReview.suggestionsTitle')}</p>
                {field.suggestions.map((sugg, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
                    {sugg}
                  </div>
                ))}
              </div>
            )}

            {/* Legal Alerts */}
            {field.legalAlerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">{t('aiReview.legalAlertsTitle')}</p>
                {field.legalAlerts.map((alert, i) => {
                  const config = severityConfig[alert.severity];
                  const alertKey = `${field.fieldId}:${i}`;
                  const isDismissed = dismissedAlerts.has(alertKey);
                  return (
                    <div
                      key={i}
                      className="rounded-lg p-3 text-sm space-y-2"
                      style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
                    >
                      <div className="flex items-center gap-2">
                        {alert.severity === 'critical' ? (
                          <AlertTriangle size={16} style={{ color: config.text }} />
                        ) : (
                          <Info size={16} style={{ color: config.text }} />
                        )}
                        <span className="font-semibold text-xs uppercase" style={{ color: config.text }}>
                          {config.label}
                        </span>
                      </div>
                      <p className="font-medium" style={{ color: config.text }}>
                        &laquo; {alert.excerpt} &raquo;
                      </p>
                      <p style={{ color: config.text }}>{alert.issue}</p>
                      <div className="rounded-md bg-white/60 p-2">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">{t('aiReview.suggested')} :</span> {alert.suggestion}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">{t('aiReview.legalBasis')} :</span> {alert.legalBasis}
                        </p>
                      </div>
                      {alert.severity === 'critical' && (
                        isDismissed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: config.text }}>
                            <Check size={12} /> {t('aiReview.acknowledged')}
                          </span>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDismissAlert(field.fieldId, i)}
                          >
                            {t('aiReview.acknowledge')}
                          </Button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export const AIReviewModal = ({
  isOpen,
  onClose,
  employee,
  semester,
  evaluation,
  onApplyCorrection,
  onReviewComplete,
}: AIReviewModalProps) => {
  const { t } = useTranslation();
  const {
    review,
    isLoading,
    error,
    generate,
    reset,
    dismissedAlerts,
    dismissAlert,
    unresolvedCriticalCount,
    reviewCompleted,
  } = useAIReview();

  const [appliedCorrections, setAppliedCorrections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && !review && !isLoading && !error) {
      generate(employee, semester, evaluation);
    }
  }, [isOpen, review, isLoading, error, generate, employee, semester, evaluation]);

  // Notify parent of review status changes
  useEffect(() => {
    if (reviewCompleted) {
      onReviewComplete(unresolvedCriticalCount);
    }
  }, [reviewCompleted, unresolvedCriticalCount, onReviewComplete]);

  const handleClose = () => {
    reset();
    setAppliedCorrections(new Set());
    onClose();
  };

  const handleRegenerate = () => {
    setAppliedCorrections(new Set());
    generate(employee, semester, evaluation);
  };

  const handleApply = (key: string) => {
    setAppliedCorrections(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const totalIssues = review
    ? review.fields.reduce((sum, f) => sum + f.corrections.length + f.suggestions.length + f.legalAlerts.length, 0)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-md">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('aiReview.title')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('aiReview.subtitle', { name: employee.name, semester: semester?.name || '' })}
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping" />
              <div className="relative rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-4 shadow-lg">
                <Sparkles size={28} className="text-white animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800">{t('aiReview.generating')}</p>
              <p className="text-sm text-gray-400 mt-1.5 max-w-xs">{t('aiReview.generatingHint')}</p>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div
              className="rounded-lg p-4 text-sm w-full"
              style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B' }}
            >
              <p className="font-medium text-center">{t('aiReview.error')}</p>
              <p className="mt-2 text-xs opacity-75 text-center break-all">{error}</p>
            </div>
            <Button variant="primary" onClick={handleRegenerate} icon={<RefreshCw size={16} />}>
              {t('aiReview.retry')}
            </Button>
          </div>
        )}

        {/* Results */}
        {review && !isLoading && (
          <>
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2">
              {review.summary.totalCorrections > 0 && (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {review.summary.totalCorrections} {t('aiReview.summaryCorrections')}
                </span>
              )}
              {review.summary.totalSuggestions > 0 && (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                  {review.summary.totalSuggestions} {t('aiReview.summarySuggestions')}
                </span>
              )}
              {review.summary.criticalAlerts > 0 && (
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  {review.summary.criticalAlerts} {t('aiReview.summaryAlerts')}
                </span>
              )}
            </div>

            {/* Critical alert banner */}
            {unresolvedCriticalCount > 0 && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}
              >
                <AlertTriangle size={18} className="text-red-700 flex-shrink-0" />
                <span className="text-sm font-medium text-red-700">{t('aiReview.criticalBanner')}</span>
              </div>
            )}

            {/* No issues */}
            {totalIssues === 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200">
                <Check size={18} className="text-green-700" />
                <span className="text-sm font-medium text-green-700">{t('aiReview.noIssues')}</span>
              </div>
            )}

            {/* Field results */}
            <div className="space-y-3">
              {review.fields.map((field) => (
                <FieldSection
                  key={field.fieldId}
                  field={field}
                  onApplyCorrection={onApplyCorrection}
                  appliedCorrections={appliedCorrections}
                  onApply={handleApply}
                  dismissedAlerts={dismissedAlerts}
                  onDismissAlert={dismissAlert}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-2">
              <Button
                variant="secondary"
                onClick={handleRegenerate}
                loading={isLoading}
                icon={<RefreshCw size={16} />}
              >
                {t('aiReview.regenerate')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
