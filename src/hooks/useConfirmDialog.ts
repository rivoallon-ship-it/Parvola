import { useState, useCallback } from 'react';
import type { ConfirmDialog } from '@/types';

// ============================================
// Hook pour les dialogues de confirmation
// ============================================

interface UseConfirmDialogReturn {
  dialog: ConfirmDialog;
  confirm: (message: string, onConfirm: () => void) => void;
  close: () => void;
}

export const useConfirmDialog = (): UseConfirmDialogReturn => {
  const [dialog, setDialog] = useState<ConfirmDialog>({
    show: false,
    message: '',
    onConfirm: null,
  });

  const confirm = useCallback((message: string, onConfirm: () => void) => {
    setDialog({
      show: true,
      message,
      onConfirm,
    });
  }, []);

  const close = useCallback(() => {
    setDialog({
      show: false,
      message: '',
      onConfirm: null,
    });
  }, []);

  return {
    dialog,
    confirm,
    close,
  };
};

export default useConfirmDialog;
