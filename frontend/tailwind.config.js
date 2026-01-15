/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef5f3',
          100: '#fde8e4',
          200: '#fbd5ce',
          300: '#f7b5a8',
          400: '#f28a77',
          500: '#E35336', // Main brand color - Burnt Sienna
          600: '#d13d20',
          700: '#ae3019',
          800: '#902a18',
          900: '#782919',
        },
        accent: {
          50: '#fef9f4',
          100: '#fdf2e6',
          200: '#fae3c8',
          300: '#f6cea0',
          400: '#F4A460', // Secondary accent - Sandy Brown
          500: '#e8914a',
          600: '#d9771a',
          700: '#b45f15',
          800: '#924c18',
          900: '#783f17',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-dark': '0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}

