/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Color Hunt Palette (https://colorhunt.co/palette/e3f2fd90caf92196f30d47a1)
        palette: {
          50: '#E3F2FD',
          100: '#D0E7F9',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
          950: '#06204D',
        },
        // Override theme color namespaces so all UI components adopt the new palette
        teal: {
          50: '#E3F2FD',
          100: '#D0E7F9',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
          950: '#06204D',
        },
        indigo: {
          50: '#E3F2FD',
          100: '#D0E7F9',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
          950: '#06204D',
        },
        sky: {
          50: '#E3F2FD',
          100: '#D0E7F9',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
          950: '#06204D',
        },
        cyan: {
          50: '#E3F2FD',
          100: '#D0E7F9',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
          950: '#06204D',
        }
      },
    },
  },
  plugins: [],
}

