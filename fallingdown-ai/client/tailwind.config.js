/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          '950': '#020617',
          '900': '#0f172a',
        },
        'panel': 'rgba(15,23,42,0.6)',
        'teal': {
          '400': '#2dd4bf',
          '500': '#14b8a6',
        },
        'cyan': {
          '500': '#0ea5e9',
        },
        'purple': {
          '500': '#a855f7',
        },
        'red': {
          '500': '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
