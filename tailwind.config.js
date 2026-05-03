/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cool, slightly green-tinted darks. Sit nicely on top of the
        // misty-forest body backdrop while still reading as "near black".
        ink: {
          950: '#080a0a',
          900: '#0e1313',
          800: '#161e1c',
          700: '#1f2826',
          600: '#2a3633',
        },
        // Iron / silver / sage accent palette — replaces the original
        // warm ember orange. Reads as "tarnished steel and lichen"
        // against the cursed-forest backdrop.
        ember: {
          400: '#c2d1cb', // pale silver-sage (titles, headlines)
          500: '#85a09a', // steel-sage (hover / mid accents)
          600: '#4d5e58', // dark iron-moss (borders, dividers)
          700: '#2c3833', // deep iron (subtle borders, frames)
        },
        // Cool pale steel-grey for body text.
        bone: '#d8dde0',
        // Single warm-amber accent: character names, section headers,
        // ability titles, search-match highlight, etc.
        accent: '#fbbf24',
        // Tab active gradient stops: amber gold → strong orange.
        'tab-active': {
          400: '#fbbf24',
          500: '#ea580c',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ember: '0 0 24px -8px rgba(180, 200, 195, 0.45)',
      },
    },
  },
  plugins: [],
};
