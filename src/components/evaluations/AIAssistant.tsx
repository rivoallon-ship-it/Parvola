import React from 'react';
import { Target, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AISuggestedObjective, Employee, Semester } from '@/types';
import { Card, Button, TextArea } from '@/components/common';
import { colors } from '@/constants/colors';
import { useAIObjectives } from '@/hooks';

// ============================================
// Composant AIAssistant pour générer des objectifs
// ============================================

interface AIAssistantProps {
  employee: Employee;
  semester: Semester | null;
  onAcceptObjective: (objective: AISuggestedObjective) => void;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  employee,
  semester,
  onAcceptObjective,
  onClose,
}) => {
  const { t } = useTranslation();
  const { prompt, setPrompt, suggestions, isLoading, error, generate, reset } = useAIObjectives();

  const handleGenerate = () => {
    generate(employee, semester);
  };

  const handleAccept = (objective: AISuggestedObjective) => {
    onAcceptObjective(objective);
    reset();
  };

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, #F3E8FF 0%, #E0E7FF 100%)',
        border: '2px solid #A78BFA',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            AI
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: colors.btn.primary }}>
              {t('ai.title')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('ai.describeObjectives', { name: employee.name })}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
          ×
        </button>
      </div>

      {/* Input */}
      <TextArea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t('ai.placeholder')}
        disabled={isLoading}
        className="mb-4"
      />

      {/* Generate Button */}
      <Button
        variant="primary"
        onClick={handleGenerate}
        loading={isLoading}
        disabled={!prompt.trim()}
        icon={<Target size={18} />}
        style={{ backgroundColor: colors.purple }}
      >
        {isLoading ? t('common.generating') : t('ai.generate')}
      </Button>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="font-semibold" style={{ color: colors.btn.primary }}>
            {t('ai.suggestedObjectives')}
          </h4>
          {suggestions.map((sug, i) => (
            <Card
              key={i}
              style={{
                backgroundColor: colors.card.bg,
                border: '1px solid #A78BFA',
              }}
              padding="sm"
            >
              <h5 className="font-semibold" style={{ color: colors.btn.primary }}>
                {sug.title}
              </h5>
              <p className="text-sm text-gray-600 mt-1">{sug.description}</p>
              {sug.deadline && (
                <p className="text-xs text-gray-500 mt-2">{t('ai.deadlineLabel')} {sug.deadline}</p>
              )}
              <Button
                variant="accent"
                size="sm"
                onClick={() => handleAccept(sug)}
                icon={<Plus size={16} />}
                className="mt-2"
              >
                {t('ai.addObjective')}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-lg p-4 text-sm mt-4"
          style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            color: '#991B1B',
          }}
        >
          {error}
        </div>
      )}
    </Card>
  );
};

export default AIAssistant;
