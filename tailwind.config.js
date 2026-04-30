/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08060a',
          900: '#100a10',
          800: '#1a121a',
          700: '#241822',
          600: '#322230',
        },
        ember: {
          400: '#f5c878',
          500: '#e0a857',
          600: '#c98538',
          700: '#a55f24',
        },
        bone: '#ece2cc',
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ember: '0 0 24px -8px rgba(224, 168, 87, 0.55)',
      },
    },
  },
  plugins: [],
};
