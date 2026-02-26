import React from 'react';
import { Target, Plus } from 'lucide-react';
import type { AISuggestedTemplate, Position } from '@/types';
import { Card, Button, TextArea } from '@/components/common';
import { colors } from '@/constants/colors';
import { useAITemplates } from '@/hooks';

// ============================================
// Composant TemplateAIAssistant pour générer des templates
// ============================================

interface TemplateAIAssistantProps {
  position: Position;
  onAcceptTemplate: (template: AISuggestedTemplate) => void;
  onClose: () => void;
}

export const TemplateAIAssistant: React.FC<TemplateAIAssistantProps> = ({
  position,
  onAcceptTemplate,
  onClose,
}) => {
  const { prompt, setPrompt, suggestions, isLoading, error, generate } = useAITemplates();

  const handleGenerate = () => {
    generate(position);
  };

  const handleAccept = (template: AISuggestedTemplate) => {
    onAcceptTemplate(template);
  };

  return (
    <Card
      className="mb-4"
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
              Assistant IA pour les templates
            </h3>
            <p className="text-sm text-gray-600">
              Décrivez le type de templates souhaité pour "{position.name}"
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
        placeholder="Ex: templates pour améliorer les compétences en service client, gestion du temps, etc..."
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
        {isLoading ? 'Génération...' : 'Générer'}
      </Button>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="font-semibold" style={{ color: colors.btn.primary }}>
            Templates suggérés :
          </h4>
          {suggestions.map((tmpl, i) => (
            <Card
              key={i}
              style={{
                backgroundColor: colors.card.bg,
                border: '1px solid #A78BFA',
              }}
              padding="sm"
            >
              <h5 className="font-semibold" style={{ color: colors.btn.primary }}>
                {tmpl.title}
              </h5>
              <p className="text-sm text-gray-600 mt-1">{tmpl.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                📅 Échéance suggérée: {tmpl.suggestedDeadlineDays || 90} jours
              </p>
              <Button
                variant="accent"
                size="sm"
                onClick={() => handleAccept(tmpl)}
                icon={<Plus size={16} />}
                className="mt-2"
              >
                Ajouter ce template
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

export default TemplateAIAssistant;
