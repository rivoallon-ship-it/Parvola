/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Navigation
        nav: {
          bg: '#2C2C2C',
          text: '#FFFFFF',
          selected: '#4B4B4B',
          accent: '#4AFFC3',
        },
        // Main accent color
        accent: {
          DEFAULT: '#008D7E',
          light: '#008D7E20',
          bright: '#4AFFC3',
        },
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
        // Semantic colors
        warning: '#F59E0B',
        danger: '#EF4444',
        success: '#10B981',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      animation: {
        'toast-in': 'toast-in 0.3s ease-out forwards',
        'toast-out': 'toast-out 0.2s ease-in forwards',
      },
      keyframes: {
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-out': {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
