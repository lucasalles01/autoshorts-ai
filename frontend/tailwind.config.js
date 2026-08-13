/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0B0F19',
          card: '#131927',
          border: '#1F293D',
          hover: '#1E2638',
          accent: '#8B5CF6', // Violet
          cyan: '#06B6D4',   // Neon Cyan
          emerald: '#10B981',// Neon Emerald
          yellow: '#FACC15'  // Neon Yellow
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}
