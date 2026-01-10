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
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CBFF',
          300: '#66B1FF',
          400: '#3397FF',
          500: '#0066B3', // Bleu principal Maghreb Office
          600: '#0052A3',
          700: '#003D7A',
          800: '#003366', // Bleu foncé
          900: '#002952',
        },
        secondary: {
          50: '#E6F7FF',
          100: '#BAE7FF',
          200: '#91D5FF',
          300: '#69C0FF',
          400: '#40A9FF',
          500: '#87CEEB', // Bleu clair
          600: '#1890FF',
          700: '#096DD9',
          800: '#0050B3',
          900: '#003A8C',
        },
        dark: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#003D7A',
          800: '#003366', // Bleu foncé Maghreb Office
          900: '#002952',
        }
      },
    },
  },
  plugins: [],
}
