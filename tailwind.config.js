/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skeuo: {
          bg: '#F0F3F7',
          surface: '#F8FAFC',
          card: '#E8EEF5',
          border: '#CBD5E1',
          text: '#1E293B',
          muted: '#64748B',
          inset: '#E2E8F0',
        },
        brand: {
          blue: '#2563EB',
          emerald: '#059669',
          cyan: '#0891B2',
          amber: '#D97706',
          rose: '#E11D48',
          purple: '#7C3AED'
        }
      },
      backgroundImage: {
        'skeuo-card-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #E8EEF5 100%)',
        'skeuo-panel-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #E6ECF2 100%)',
        'skeuo-btn-gradient': 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)',
        'skeuo-btn-secondary': 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 100%)',
      },
      boxShadow: {
        'skeuo-panel': '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 #FFFFFF',
        'skeuo-card': '0 4px 12px rgba(0, 0, 0, 0.07), inset 0 1px 0 #FFFFFF',
        'skeuo-card-hover': '0 8px 20px rgba(0, 0, 0, 0.12), inset 0 1px 0 #FFFFFF',
        'skeuo-btn': '0 4px 6px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        'skeuo-btn-pressed': 'inset 0 3px 6px rgba(0, 0, 0, 0.4)',
        'skeuo-inset': 'inset 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 -1px 0 #FFFFFF',
      }
    },
  },
  plugins: [],
}
