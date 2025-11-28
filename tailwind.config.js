/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#0A7D32',
        milk: '#FAFAF0',
        sky: '#1EA4FF',
        softGrey: '#EDEDED'
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
