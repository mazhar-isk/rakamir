/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { 500: '#6C63FF', 600: '#5a52e0' },
        sidebar: '#1A1A2E',
      },
      fontFamily: {
        sans: ['Playfair Display', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
  important: '#__next',
};
