/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#121212',
          lighter: '#1E1E1E', 
          light: '#2D2D2D'
        },
        accent: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          light: '#4ADE80'
        }
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: []
}