import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, HelpCircle, Trophy, RefreshCw, Sparkles } from 'lucide-react';
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
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="xl">
      <div className="space-y-5">
        {/* AI-branded header */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-3 shadow-md">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('interviewGuide.title')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t('interviewGuide.subtitle', {
                name: employee.name,
                semester: semester?.name || '',
              })}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-5">
            {/* Animated AI pulse */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 animate-ping" />
              <div className="relative rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-4 shadow-lg">
                <Sparkles size={28} className="text-white animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800">{t('interviewGuide.generating')}</p>
              <p className="text-sm text-gray-400 mt-1.5 max-w-xs">{t('interviewGuide.generatingHint')}</p>
            </div>
            {/* Animated dots */}
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
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

            {/* Footer: regenerate */}
            <div className="flex items-center justify-end pt-2">
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
