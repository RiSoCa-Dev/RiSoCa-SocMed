/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          soft: '#60a5fa',
        },
        dark: {
          bg: '#020617',
          panel: '#0f172a',
          card: '#111827',
        }
      },
      boxShadow: {
        glow: '0 20px 80px rgba(37, 99, 235, 0.2)',
      }
    },
  },
  plugins: [],
}
