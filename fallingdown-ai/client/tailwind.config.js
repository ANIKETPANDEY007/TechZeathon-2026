/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        deep: '#050507',
        surface: '#0c0c0f',
        elevated: '#141417',
        'accent-blue': '#4f8ef7',
        'accent-violet': '#818cf8',
        'accent-emerald': '#34d399',
        'accent-rose': '#fb7185',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
        tight: '-0.02em',
        snug: '-0.01em',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glow-blue': '0 0 60px rgba(79,142,247,0.15)',
        'glow-violet': '0 0 60px rgba(129,140,248,0.12)',
        'glow-white': '0 0 40px rgba(255,255,255,0.08)',
        'deep': '0 32px 80px rgba(0,0,0,0.5)',
      },
      animation: {
        'float': 'float-slow 8s ease-in-out infinite',
        'scan': 'scan-line 2.5s ease-in-out infinite',
        'fade-up': 'fade-up 0.8s cubic-bezier(0.4,0,0.2,1) forwards',
        'border-glow': 'border-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
