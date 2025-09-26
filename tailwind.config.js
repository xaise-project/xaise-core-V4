/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a1b23',
        'dark-card': '#252730',
        'dark-border': '#3a3b47',
        'accent-blue': '#4f8ff7',
        'accent-green': '#22c55e',
        'accent-orange': '#f59e0b',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}