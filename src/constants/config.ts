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

// Configuration des objectifs
export const OBJECTIVE_CONFIG = {
  defaultDeadlineDays: 90,
  defaultStatus: 'not_started' as const,
  defaultProgress: 0,
} as const;

// Navigation
export const NAV_ITEMS = [
  { key: 'semesters', label: 'Talent Review', icon: 'Calendar' },
  { key: 'team', label: 'Équipe', icon: 'Users' },
  { key: 'templates', label: 'Poste', icon: 'FileText' },
  { key: 'nine-box', label: 'Matrice', icon: 'LayoutGrid' },
] as const;

// Configuration de la matrice 9-Box
export const NINE_BOX_CONFIG = {
  performanceLabels: ['Faible', 'Moyen', 'Élevé'] as const,
  potentialLabels: ['Faible', 'Moyen', 'Élevé'] as const,
  cells: {
    '1-1': { bg: '#FEE2E2', border: '#FECACA', label: 'Risque', textColor: '#991B1B' },
    '1-2': { bg: '#FEF3C7', border: '#FDE68A', label: 'Incohérent', textColor: '#92400E' },
    '1-3': { bg: '#FEF3C7', border: '#FDE68A', label: 'Énigme', textColor: '#92400E' },
    '2-1': { bg: '#FEE2E2', border: '#FECACA', label: 'Sous-performant', textColor: '#991B1B' },
    '2-2': { bg: '#DBEAFE', border: '#BFDBFE', label: 'Pilier', textColor: '#1E40AF' },
    '2-3': { bg: '#D1FAE5', border: '#A7F3D0', label: 'Futur leader', textColor: '#065F46' },
    '3-1': { bg: '#FEF3C7', border: '#FDE68A', label: 'Professionnel', textColor: '#92400E' },
    '3-2': { bg: '#D1FAE5', border: '#A7F3D0', label: 'Performant clé', textColor: '#065F46' },
    '3-3': { bg: '#D1FAE5', border: '#A7F3D0', label: 'Star', textColor: '#065F46' },
  },
} as const;
