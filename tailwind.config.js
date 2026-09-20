/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        strong: 'rgb(var(--strong) / <alpha-value>)',
        action: 'rgb(var(--action) / <alpha-value>)',
        navy: { DEFAULT: '#0F2747', deep: '#0A1B34' },
        gold: { DEFAULT: '#D4AF6B', deep: 'rgb(var(--gold-deep) / <alpha-value>)' },
        danger: { DEFAULT: 'rgb(var(--danger) / <alpha-value>)', tint: 'rgb(var(--danger-tint) / <alpha-value>)' },
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        brand: {
          red: 'rgb(var(--brand-red) / <alpha-value>)',
          'red-dark': 'rgb(var(--action-hover) / <alpha-value>)',
          'red-tint': 'rgb(var(--brand-red-tint) / <alpha-value>)',
          black: 'rgb(var(--brand-black) / <alpha-value>)',
          white: '#FFFFFF',
          grey: 'rgb(var(--brand-grey) / <alpha-value>)',
          'light-grey': 'rgb(var(--brand-light-grey) / <alpha-value>)',
          border: 'rgb(var(--brand-border) / <alpha-value>)',
        },
        ok: { DEFAULT: 'rgb(var(--ok) / <alpha-value>)', tint: 'rgb(var(--ok-tint) / <alpha-value>)' },
        warn: { DEFAULT: 'rgb(var(--warn) / <alpha-value>)', tint: 'rgb(var(--warn-tint) / <alpha-value>)' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Source Sans 3"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 39 71 / 0.10), 0 4px 14px rgb(15 39 71 / 0.08)',
      },
      letterSpacing: {
        brand: '0.32em',
      },
    },
  },
  plugins: [],
};
