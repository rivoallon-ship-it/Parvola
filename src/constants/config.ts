// ============================================
// Configuration de l'application
// ============================================

// API Anthropic — modèle par défaut (Sonnet)
export const AI_CONFIG = {
  model: 'claude-sonnet-4-6',
  maxTokens: 1000,
} as const;

// API Anthropic — Guide d'entretien (Haiku, plus économique)
export const AI_INTERVIEW_GUIDE_CONFIG = {
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 2000,
} as const;

// API Anthropic — Nettoyage dictée vocale (Haiku, rapide)
export const AI_DICTATION_CONFIG = {
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 500,
} as const;

// API Anthropic — Revue IA pre-soumission (Sonnet, raisonnement juridique)
export const AI_REVIEW_CONFIG = {
  model: 'claude-sonnet-4-6',
  maxTokens: 4000,
} as const;

// Emojis pour les photos de profil
export const PROFILE_EMOJIS = [
  '👱🏻‍♀️',
  '👩🏻',
  '👨🏻',
  '🧑🏻‍🦱',
  '👨🏻‍🦱',
  '👨🏻‍🦰',
  '👨🏽',
  '👩🏾‍🦱',
  '👱🏾‍♀️',
  '👩🏻‍🦰',
] as const;

// Configuration des campagnes
export const CAMPAIGN_CONFIG = {
  defaultStatus: 'draft' as const,
} as const;

// ============================================
// Entretien professionnel (EPP) — cadre légal
// ============================================
// Source de vérité unique de la périodicité de l'entretien professionnel.
// Cadre applicable depuis le 31 décembre 2025 (remplace l'ancien rythme
// biennal / bilan à 6 ans) :
//   - premier entretien dans la première année suivant l'embauche,
//   - entretien professionnel tous les 4 ans,
//   - état des lieux récapitulatif du parcours tous les 8 ans.
// La périodicité est également réinitialisée au retour de certaines
// absences longues (congé maternité, parental, proche aidant, sabbatique,
// arrêt maladie prolongé, mandat, etc.) : un entretien doit être proposé
// au retour du salarié.
export const PROFESSIONAL_INTERVIEW_CONFIG = {
  // Délai maximal (en années) entre l'embauche et le premier entretien.
  firstInterviewWithinYears: 1,
  // Périodicité de l'entretien professionnel, en années.
  periodicityYears: 4,
  // Périodicité de l'état des lieux récapitulatif, en années.
  stateOfPlayYears: 8,
  // Traçabilité de la remise du compte-rendu au salarié. Nécessite les
  // colonnes delivered_at/delivered_by de la migration 012 : laisser à false
  // tant qu'elle n'est pas appliquée sur Supabase (sinon l'action échouerait
  // systématiquement), passer à true juste après l'avoir poussée.
  deliveryTrackingEnabled: false,
} as const;

// Configuration des objectifs
export const OBJECTIVE_CONFIG = {
  defaultDeadlineDays: 90,
  defaultStatus: 'not_started' as const,
  defaultProgress: 0,
} as const;

// Navigation
export const NAV_ITEMS = [
  { key: 'semesters', labelKey: 'nav.campaign', icon: 'Calendar' },
  { key: 'team', labelKey: 'nav.team', icon: 'Users' },
  { key: 'templates', labelKey: 'nav.position', icon: 'FileText' },
  { key: 'nine-box', labelKey: 'nav.matrix', icon: 'LayoutGrid' },
] as const;

// Configuration de la matrice 9-Box
export const NINE_BOX_CONFIG = {
  performanceLabelKeys: ['nineBox.low', 'nineBox.medium', 'nineBox.high'] as const,
  potentialLabelKeys: ['nineBox.low', 'nineBox.medium', 'nineBox.high'] as const,
  cells: {
    '1-1': { bg: '#FEE2E2', border: '#FECACA', labelKey: 'nineBox.risk', textColor: '#991B1B' },
    '1-2': { bg: '#FEF3C7', border: '#FDE68A', labelKey: 'nineBox.inconsistent', textColor: '#92400E' },
    '1-3': { bg: '#FEF3C7', border: '#FDE68A', labelKey: 'nineBox.enigma', textColor: '#92400E' },
    '2-1': { bg: '#FEE2E2', border: '#FECACA', labelKey: 'nineBox.underperformer', textColor: '#991B1B' },
    '2-2': { bg: '#DBEAFE', border: '#BFDBFE', labelKey: 'nineBox.pillar', textColor: '#1E40AF' },
    '2-3': { bg: '#D1FAE5', border: '#A7F3D0', labelKey: 'nineBox.futureLeader', textColor: '#065F46' },
    '3-1': { bg: '#FEF3C7', border: '#FDE68A', labelKey: 'nineBox.professional', textColor: '#92400E' },
    '3-2': { bg: '#D1FAE5', border: '#A7F3D0', labelKey: 'nineBox.keyPerformer', textColor: '#065F46' },
    '3-3': { bg: '#D1FAE5', border: '#A7F3D0', labelKey: 'nineBox.star', textColor: '#065F46' },
  },
} as const;
