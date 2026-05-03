/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Telegram темы
        tg: {
          'bg': 'var(--tg-theme-bg-color, #ffffff)',
          'text': 'var(--tg-theme-text-color, #000000)',
          'hint': 'var(--tg-theme-hint-color, #999999)',
          'link': 'var(--tg-theme-link-color, #2481cc)',
          'button': 'var(--tg-theme-button-color, #2481cc)',
          'button-text': 'var(--tg-theme-button-text-color, #ffffff)',
          'secondary-bg': 'var(--tg-theme-secondary-bg-color, #f7f7f7)',
          'header-bg': 'var(--tg-theme-header-bg-color, #ffffff)',
        },
        // Дополнительные цвета для приложения
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        profit: '#10b981',
        loss: '#ef4444',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
