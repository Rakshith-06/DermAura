/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Light Botanical & Clinical Palette
        botanical: {
          50: '#F2F9F5',
          100: '#E1F2E8',
          200: '#C2E5D2',
          300: '#94CEB1',
          400: '#5FB28B',
          500: '#38966C',
          600: '#2A7A56', // Primary Action Sage/Emerald
          700: '#236246',
          800: '#1F4E3A',
          900: '#1B4131',
          950: '#0C231A',
        },
        terracotta: {
          50: '#FFF5F2',
          100: '#FFE8E2',
          200: '#FFD4C8',
          300: '#FEB5A2',
          400: '#FA876B',
          500: '#F06240',
          600: '#DC4422',
          700: '#B83316',
          800: '#982C15',
          900: '#7E2A18',
        },
        cream: {
          50: '#FDFCF7',
          100: '#FAF9F0',
          200: '#F4F1DE',
          300: '#EAE5C7',
          400: '#DDD5A8',
          500: '#CBBF85',
        },
        warmStone: {
          50: '#FAF9F6',
          100: '#F5F3EF',
          200: '#E8E5DF',
          300: '#D6D2CA',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px 0 rgba(41, 37, 36, 0.04), 0 1px 2px -1px rgba(41, 37, 36, 0.04)',
        'soft-md': '0 4px 12px -2px rgba(41, 37, 36, 0.06), 0 2px 6px -2px rgba(41, 37, 36, 0.04)',
        'soft-xl': '0 20px 30px -6px rgba(41, 37, 36, 0.07), 0 8px 14px -4px rgba(41, 37, 36, 0.04)',
        'soft-2xl': '0 25px 50px -12px rgba(41, 37, 36, 0.12)',
      },
    },
  },
  plugins: [],
}
