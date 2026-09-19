/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#9A1C20',
          'red-dark': '#7C1519',
          'red-tint': '#F7ECEC',
          black: '#0A0A0A',
          white: '#FFFFFF',
          grey: '#747474',
          'light-grey': '#F5F5F5',
          border: '#E5E5E5',
        },
        ok: { DEFAULT: '#2F6B45', tint: '#EAF3ED' },
        warn: { DEFAULT: '#9A6412', tint: '#FBF3E4' },
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
