import type { ObjectiveStatus, CampaignStatus, EvaluationStatus } from '@/types';
import { PROFILE_EMOJIS } from '@/constants/config';
import i18n from '@/i18n';

// ============================================
// Fonctions utilitaires
// ============================================

/**
 * Retourne un emoji aléatoire pour les photos de profil
 */
export const getRandomEmoji = (): string => {
  return PROFILE_EMOJIS[Math.floor(Math.random() * PROFILE_EMOJIS.length)];
};

/**
 * Retourne le libellé français d'un statut
 */
export const getStatusLabel = (status: ObjectiveStatus): string => {
  const keys: Record<ObjectiveStatus, string> = {
    not_started: 'status.notStarted',
    in_progress: 'status.inProgress',
    completed: 'status.completed',
    blocked: 'status.blocked',
  };
  return i18n.t(keys[status] || status);
};

/**
 * Retourne les classes Tailwind pour un statut
 */
export const getStatusColor = (status: ObjectiveStatus): string => {
  const colors: Record<ObjectiveStatus, string> = {
    not_started: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    blocked: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

/**
 * Formate une date ISO en format français
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const locale = i18n.language || 'fr';
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Calcule une date d'échéance à partir d'un nombre de jours
 */
export const calculateDeadline = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

/**
 * Retourne la période d'un semestre
 */
export const getSemesterPeriod = (semester: 'S1' | 'S2'): string => {
  return semester === 'S1' ? i18n.t('semester.januaryJune') : i18n.t('semester.julyDecember');
};

/**
 * Parse une réponse JSON de l'IA en gérant les erreurs
 */
export const parseAIResponse = <T>(text: string): T[] => {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as T[];
  } catch {
    return [];
  }
};

/**
 * Tronque un texte à une longueur maximale
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Classe conditionnelle helper (similaire à clsx)
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// ---------- Workflow Campagne / Évaluation ----------

export const getCampaignStatusLabel = (status: CampaignStatus): string => {
  const keys: Record<CampaignStatus, string> = {
    draft: 'campaign.statusDraft',
    active: 'campaign.statusActive',
    closed: 'campaign.statusClosed',
  };
  return i18n.t(keys[status]);
};

export const getEvaluationStatusLabel = (status: EvaluationStatus): string => {
  const keys: Record<EvaluationStatus, string> = {
    not_started: 'evaluationStatus.notStarted',
    in_progress: 'evaluationStatus.inProgress',
    submitted: 'evaluationStatus.submitted',
    validated: 'evaluationStatus.validated',
  };
  return i18n.t(keys[status]);
};

export const isEvaluationReadOnly = (
  campaignStatus: CampaignStatus,
  evaluationStatus?: EvaluationStatus
): boolean => {
  if (campaignStatus === 'draft') return true;
  if (campaignStatus === 'closed') return true;
  if (evaluationStatus === 'submitted') return true;
  if (evaluationStatus === 'validated') return true;
  return false;
};

export const canSubmitEvaluation = (
  campaignStatus: CampaignStatus,
  evaluationStatus?: EvaluationStatus
): boolean => {
  return campaignStatus === 'active' && evaluationStatus === 'in_progress';
};

export const canValidateEvaluation = (
  campaignStatus: CampaignStatus,
  evaluationStatus?: EvaluationStatus
): boolean => {
  return campaignStatus === 'active' && evaluationStatus === 'submitted';
};
