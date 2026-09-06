/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        seminario: {
          darkest: '#050b14',
          navy: '#0a192f',
          deep: '#0f2744',
          lightNavy: '#1b3b6f',
          gold: '#f59e0b',
          goldLight: '#fbbf24',
          goldMuted: '#d97706',
          liturgicalRed: '#b91c1c',
          liturgicalGreen: '#047857'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8', filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))' },
          '50%': { transform: 'scale(1.05)', opacity: '1', filter: 'drop-shadow(0 0 35px rgba(245, 158, 11, 0.8))' }
        },
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.12)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.12)' },
          '70%': { transform: 'scale(1)' }
        },
        spotlight: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        pulseGlow: 'pulseGlow 2.5s infinite ease-in-out',
        heartbeat: 'heartbeat 1.2s infinite ease-in-out',
        spotlight: 'spotlight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }
    },
  },
  plugins: [],
}
