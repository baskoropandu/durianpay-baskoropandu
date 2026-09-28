/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      colors: {
        brand: { 50: '#f0f7ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
        success: { 500: '#94b6a2', 600: '#557461', 700: '#405e4c' },
        warning: { 500: '#c5ad80', 600: '#8a7147', 700: '#725b37' },
        danger: { 500: '#cf9b98', 600: '#a46965', 700: '#87534f' },
      },
    },
  },
  plugins: [],
};
