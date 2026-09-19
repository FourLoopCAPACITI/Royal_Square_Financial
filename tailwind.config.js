/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        strong: '#0A0A0A',
        action: '#9A1C20',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        brand: {
          red: 'rgb(var(--brand-red) / <alpha-value>)',
          'red-dark': '#7C1519',
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
        display: ['Jost', 'Futura', '"Century Gothic"', 'system-ui', 'sans-serif'],
        sans: ['"Source Sans 3"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        brand: '0.32em',
      },
    },
  },
  plugins: [],
};
