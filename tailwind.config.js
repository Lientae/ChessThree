const plugin = require('tailwindcss/plugin')
const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      ...defaultTheme,
      colors: {
        unselect: 'rgba(255, 255, 255, 0.35)',
        menu: '#414141',
        background: '#131313',
        'ybadges-purple': '#7436B3',
        'ybadges-black': '#0E0E0E',
        text: '#ffffff',
        transparent: 'rgba(255,255,255,0)',
        search: 'rgba(65, 65, 65, 1)',
      },
      fontFamily: {
        'chillax': ['Chillax', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      }
    },
    typography: {
      fontFamily: [
        'Poppins',
        'Chillax',
        'Roboto',
        '"Helvetica Neue"',
      ].join(','),
  },
  },
  plugins: [plugin],
}
