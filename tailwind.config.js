/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./admin/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Airbnb-inspired color palette
        coral: {
          50: '#fff5f3',
          100: '#ffe8e5',
          200: '#ffd5d0',
          300: '#ffb3ab',
          400: '#ff8a7d',
          500: '#FF5A5F', // Airbnb's signature coral
          600: '#e64a4f',
          700: '#cc3d42',
          800: '#b33236',
          900: '#992a2e',
        },
        airbnb: {
          pink: '#FF5A5F',
          dark: '#222222',
          light: '#F7F7F7',
          gray: '#717171',
        },
        beige: {
          50: '#faf8f6',
          100: '#f5f1eb',
          200: '#ebe3d8',
          300: '#d4c5b0',
          400: '#b8a58c',
          500: '#9c8568',
          600: '#7d6a52',
          700: '#5f5241',
          800: '#403830',
          900: '#211e1a',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9f1239',
          900: '#831843',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-2': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-3': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        'airbnb': '12px',
        'airbnb-lg': '16px',
        'airbnb-xl': '24px',
      },
      boxShadow: {
        'airbnb': '0 2px 16px rgba(0, 0, 0, 0.12)',
        'airbnb-lg': '0 8px 28px rgba(0, 0, 0, 0.12)',
        'airbnb-xl': '0 16px 48px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}