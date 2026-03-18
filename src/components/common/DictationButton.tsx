import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpeechToText } from '@/hooks';
import { cleanupDictation } from '@/services/ai';

// ============================================
// Bouton de dictée vocale avec cleanup IA
// ============================================

interface DictationButtonProps {
  onResult: (text: string) => void;
  disabled?: boolean;
  existingText?: string;
}

export const DictationButton: React.FC<DictationButtonProps> = ({
  onResult,
  disabled = false,
  existingText = '',
}) => {
  const { t } = useTranslation();
  const { isListening, isSupported, transcript, start, stop } = useSpeechToText();
  const [isCleaning, setIsCleaning] = useState(false);
  const wasListeningRef = useRef(false);

  // Process transcript when listening stops
  useEffect(() => {
    if (wasListeningRef.current && !isListening && transcript?.trim()) {
      const rawText = transcript;
      setIsCleaning(true);
      cleanupDictation(rawText)
        .then((cleaned) => {
          const result = existingText
            ? `${existingText}\n${cleaned}`
            : cleaned;
          onResult(result);
        })
        .catch(() => {
          // Fallback: use raw transcript if cleanup fails
          const result = existingText
            ? `${existingText}\n${rawText}`
            : rawText;
          onResult(result);
        })
        .finally(() => {
          setIsCleaning(false);
        });
    }
    wasListeningRef.current = isListening;
  }, [isListening, transcript, existingText, onResult]);

  const handleToggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  if (!isSupported) {
    return null;
  }

  const title = isCleaning
    ? t('dictation.cleaning')
    : isListening
      ? t('dictation.stop')
      : t('dictation.start');

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled || isCleaning}
      title={title}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-all disabled:opacity-40 ${
        isListening
          ? 'bg-red-100 text-red-600 animate-pulse hover:bg-red-200'
          : isCleaning
            ? 'bg-gray-100 text-gray-400'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
      }`}
    >
      {isCleaning ? (
        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-400 border-t-transparent" />
      ) : isListening ? (
        <MicOff size={14} />
      ) : (
        <Mic size={14} />
      )}
    </button>
  );
};

export default DictationButton;
