// ============================================
// Configuration de l'application
// ============================================

// API Anthropic
export const AI_CONFIG = {
  apiUrl: 'https://api.anthropic.com/v1/messages',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 1000,
  // La clé API doit être configurée via les variables d'environnement
  get apiKey(): string {
    return import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  },
} as const;

// API Anthropic — Guide d'entretien (Haiku, plus économique)
export const AI_INTERVIEW_GUIDE_CONFIG = {
  model: 'claude-haiku-4-5-20251001',
  maxTokens: 2000,
  get apiKey(): string {
    return import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  },
} as const;

// Configuration du storage
export const STORAGE_CONFIG = {
  mode: (import.meta.env.VITE_STORAGE_MODE || 'local') as 'local' | 'api',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  keys: {
    employees: 'employees',
    semesters: 'semesters',
    evaluations: 'evaluations',
    positions: 'positions',
    templates: 'templates',
    establishments: 'establishments',
    teams: 'teams',
  },
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
