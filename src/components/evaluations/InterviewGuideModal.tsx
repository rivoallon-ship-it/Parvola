import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, HelpCircle, Trophy, RefreshCw } from 'lucide-react';
import { Modal, Card, Button } from '@/components/common';
import { useAIInterviewGuide } from '@/hooks';
import { colors } from '@/constants/colors';
import type { Employee, Semester, Evaluation } from '@/types';

interface InterviewGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  semester: Semester | null;
  evaluation: Evaluation | null;
}

const sectionConfig = [
  {
    key: 'discussionPoints' as const,
    titleKey: 'interviewGuide.discussionPointsTitle',
    icon: MessageSquare,
    color: colors.accent,
    bgColor: '#008D7E10',
  },
  {
    key: 'questions' as const,
    titleKey: 'interviewGuide.questionsTitle',
    icon: HelpCircle,
    color: colors.purple,
    bgColor: '#7C3AED10',
  },
  {
    key: 'semesterReview' as const,
    titleKey: 'interviewGuide.semesterReviewTitle',
    icon: Trophy,
    color: colors.success,
    bgColor: '#10B98110',
  },
];

export const InterviewGuideModal = ({
  isOpen,
  onClose,
  employee,
  semester,
  evaluation,
}: InterviewGuideModalProps) => {
  const { t } = useTranslation();
  const { guide, isLoading, error, generate, reset } = useAIInterviewGuide();

  useEffect(() => {
    if (isOpen && !guide && !isLoading && !error) {
      generate(employee, semester, evaluation);
    }
  }, [isOpen, guide, isLoading, error, generate, employee, semester, evaluation]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleRegenerate = () => {
    generate(employee, semester, evaluation);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('interviewGuide.title')} size="xl">
      <div className="space-y-4">
        {/* Subtitle */}
        <p className="text-sm text-gray-500">
          {t('interviewGuide.subtitle', {
            name: employee.name,
            semester: semester?.name || '',
          })}
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div
              className="animate-spin rounded-full h-10 w-10 border-3"
              style={{ borderColor: `${colors.accent}30`, borderTopColor: colors.accent }}
            />
            <div className="text-center">
              <p className="font-medium text-gray-700">{t('interviewGuide.generating')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('interviewGuide.generatingHint')}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div
              className="rounded-lg p-4 text-sm w-full"
              style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B' }}
            >
              <p className="font-medium text-center">{t('interviewGuide.error')}</p>
              <p className="mt-2 text-xs opacity-75 text-center break-all">{error}</p>
            </div>
            <Button variant="primary" onClick={handleRegenerate} icon={<RefreshCw size={16} />}>
              {t('interviewGuide.retry')}
            </Button>
          </div>
        )}

        {/* Guide Content */}
        {guide && !isLoading && (
          <>
            <div className="space-y-4">
              {sectionConfig.map((section) => {
                const Icon = section.icon;
                return (
                  <Card key={section.key} padding="none">
                    <div
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: section.color,
                        backgroundColor: section.bgColor,
                        borderRadius: '12px',
                      }}
                    >
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon size={20} style={{ color: section.color }} />
                          <h3 className="font-semibold text-gray-800">{t(section.titleKey)}</h3>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {guide[section.key]}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Regenerate Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                onClick={handleRegenerate}
                loading={isLoading}
                icon={<RefreshCw size={16} />}
              >
                {t('interviewGuide.regenerate')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
