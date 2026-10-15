/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#151D2A',
          850: '#1A2434',
          800: '#202D42',
          700: '#2B3A55',
          600: '#364768',
          500: '#465A80',
        },
        slatebg: {
          light: '#A0B4C8',
          subtle: '#B5C5D5',
          deep: '#8EA4BA',
        },
        brand: {
          teal: '#5FB3B3',
          'teal-dark': '#489898',
          blue: '#6A9AC4',
          'blue-dark': '#5280A8',
          purple: '#7B7FBF',
          'purple-dark': '#6367A6',
          coral: '#E57373',
          mint: '#4EBA88',
          amber: '#F6B26B',
        }
      },
      boxShadow: {
        'neu-card': '12px 16px 32px rgba(28, 45, 72, 0.16), -8px -8px 24px rgba(255, 255, 255, 0.65), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
        'neu-card-dark': '12px 16px 32px rgba(0, 0, 0, 0.45), -6px -6px 20px rgba(255, 255, 255, 0.04), inset 1px 1px 1px rgba(255, 255, 255, 0.12)',
        'neu-pressed': 'inset 4px 4px 8px rgba(30, 48, 75, 0.22), inset -3px -3px 6px rgba(255, 255, 255, 0.8)',
        'neu-pressed-dark': 'inset 4px 4px 8px rgba(0, 0, 0, 0.6), inset -2px -2px 6px rgba(255, 255, 255, 0.05)',
        'neu-btn': '6px 8px 18px rgba(32, 50, 78, 0.18), -4px -4px 12px rgba(255, 255, 255, 0.75), inset 1px 1px 1px rgba(255, 255, 255, 0.9)',
        'neu-btn-active': 'inset 3px 3px 6px rgba(25, 40, 65, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
        'neu-pill': '4px 6px 14px rgba(30, 48, 75, 0.15), -3px -3px 10px rgba(255, 255, 255, 0.8), inset 1px 1px 1px rgba(255, 255, 255, 0.9)',
        'sidebar-nav': 'inset 2px 2px 4px rgba(255, 255, 255, 0.15), inset -2px -2px 5px rgba(0, 0, 0, 0.4), 0 8px 18px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        '3xl': '28px',
        '4xl': '36px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
