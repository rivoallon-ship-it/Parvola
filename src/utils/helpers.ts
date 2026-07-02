import type {
  ObjectiveStatus,
  CampaignStatus,
  EvaluationStatus,
  ProfessionalInterview,
  ProfessionalInterviewSnapshot,
} from '@/types';
import { PROFILE_EMOJIS, PROFESSIONAL_INTERVIEW_CONFIG } from '@/constants/config';
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

// ---------- Entretien professionnel (EPP) — échéances ----------

/**
 * Ajoute un nombre d'années à une date ISO et renvoie la date résultante
 * au format ISO (YYYY-MM-DD).
 */
const addYears = (dateString: string, years: number): string => {
  const date = new Date(dateString);
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().split('T')[0];
};

/**
 * Échéance théorique du prochain entretien professionnel.
 * Cadre depuis le 31/12/2025 : périodicité de 4 ans (voir
 * PROFESSIONAL_INTERVIEW_CONFIG). Prend la date du dernier entretien mené
 * (`conductedAt`) ; à défaut, calcule à partir de la date d'entrée du
 * salarié en appliquant le délai de premier entretien (1 an).
 */
export const getNextProfessionalInterviewDueDate = (
  lastConductedAt?: string,
  hireDate?: string
): string | null => {
  if (lastConductedAt) {
    return addYears(lastConductedAt, PROFESSIONAL_INTERVIEW_CONFIG.periodicityYears);
  }
  if (hireDate) {
    return addYears(hireDate, PROFESSIONAL_INTERVIEW_CONFIG.firstInterviewWithinYears);
  }
  return null;
};

/**
 * Échéance théorique du prochain état des lieux récapitulatif (8 ans).
 * Calculée à partir de la date d'entrée du salarié.
 */
export const getNextProfessionalStateOfPlayDueDate = (
  hireDate?: string
): string | null => {
  if (!hireDate) return null;
  return addYears(hireDate, PROFESSIONAL_INTERVIEW_CONFIG.stateOfPlayYears);
};

// ---------- Entretien professionnel (EPP) — preuve & verrouillage ----------

/**
 * Un entretien est signé dès que le salarié ET le manager/RH ont signé.
 */
export const isProfessionalInterviewSigned = (interview: ProfessionalInterview): boolean =>
  !!interview.employeeSignedAt && !!interview.managerSignedAt;

/**
 * Verrouillage post-signature : une fois doublement signé, l'entretien devient
 * non modifiable — indépendamment du statut (encore actif) de la campagne.
 * C'est la règle de preuve : le contenu signé ne doit plus changer.
 * (Le backend l'impose aussi via un trigger — voir migration 012.)
 */
export const isProfessionalInterviewLocked = (interview: ProfessionalInterview): boolean =>
  isProfessionalInterviewSigned(interview);

/**
 * Contenu de référence pour le compte-rendu : le snapshot figé au moment de la
 * double signature s'il existe, sinon les champs vivants (entretien non encore
 * signé, ou snapshot pas encore disponible côté base). Garantit qu'un
 * compte-rendu émis après signature reflète exactement ce qui a été signé.
 */
export const getProfessionalInterviewFinalContent = (
  interview: ProfessionalInterview
): ProfessionalInterviewSnapshot => {
  if (interview.signedSnapshot) return interview.signedSnapshot;
  return {
    version: 0,
    frozenAt: '',
    employeeId: interview.employeeId,
    conductedAt: interview.conductedAt,
    careerReview: interview.careerReview,
    skillsAcquired: interview.skillsAcquired,
    evolutionMobility: interview.evolutionMobility,
    evolutionNotes: interview.evolutionNotes,
    trainingWishes: interview.trainingWishes,
    conclusions: interview.conclusions,
    employeeComment: interview.employeeComment,
    managerComment: interview.managerComment,
    employeeSignedAt: interview.employeeSignedAt,
    managerSignedAt: interview.managerSignedAt,
    employeeSignatureName: interview.employeeSignatureName,
    managerSignatureName: interview.managerSignatureName,
  };
};
