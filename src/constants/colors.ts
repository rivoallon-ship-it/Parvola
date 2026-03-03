// ============================================
// Palette de couleurs de l'application
// ============================================

export const colors = {
  // Navigation
  nav: {
    bg: '#2C2C2C',
    text: '#FFFFFF',
    selected: '#4B4B4B',
    accent: '#4AFFC3', // Couleur accent spécifique au header
  },

  // Accent
  accent: '#008D7E',
  accentLight: '#008D7E20',

  // Background
  body: {
    bg: '#FAF7F2',
  },

  // Cards
  card: {
    bg: '#FFFFFF',
    border: '#D7D6D3',
  },

  // Buttons
  btn: {
    primary: '#2C2C2C',
    secondary: '#FFFFFF',
  },

  // Status colors (objectives)
  status: {
    notStarted: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
    },
    inProgress: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
    },
    completed: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
    },
    blocked: {
      bg: 'bg-red-100',
      text: 'text-red-700',
    },
  },

  // Campaign status colors
  campaign: {
    draft: { bg: 'bg-amber-100', text: 'text-amber-700' },
    active: { bg: 'bg-blue-100', text: 'text-blue-700' },
    closed: { bg: 'bg-gray-200', text: 'text-gray-600' },
  },

  // Evaluation workflow status colors
  evaluationStatus: {
    not_started: { bg: 'bg-gray-100', text: 'text-gray-600' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
    submitted: { bg: 'bg-amber-100', text: 'text-amber-700' },
    validated: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  },

  // Semantic colors
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
  purple: '#7C3AED',
} as const;

// Styles prédéfinis pour les boutons
export const buttonStyles = {
  primary: {
    backgroundColor: colors.btn.primary,
    color: colors.nav.text,
    border: '1px solid transparent',
    borderRadius: '9999px',
  },
  secondary: {
    backgroundColor: colors.btn.secondary,
    color: colors.btn.primary,
    border: `1px solid ${colors.btn.primary}`,
    borderRadius: '9999px',
  },
  warning: {
    backgroundColor: colors.warning,
    color: '#FFFFFF',
    borderRadius: '9999px',
  },
  accent: {
    backgroundColor: colors.accentLight,
    color: colors.btn.primary,
  },
} as const;

// Style de carte prédéfini
export const cardStyle = {
  backgroundColor: colors.card.bg,
  border: `1px solid ${colors.card.border}`,
  borderRadius: '16px',
} as const;
