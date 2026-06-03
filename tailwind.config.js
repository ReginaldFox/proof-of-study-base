/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0052ff',
        ink: '#172033',
        study: '#f97316'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 32, 51, 0.08)'
      }
    }
  },
  plugins: []
};
