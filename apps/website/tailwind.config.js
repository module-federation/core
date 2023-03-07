const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}')],
  theme: {
    extend: {},
    colors: {
      'deep-purple': {
        300: '#9589EA',
        700: '#9589EA',
      },
      cyan: {
        500: '#71BEDB',
      },
      teal: {
        100: '#B4E6D9',
      },
      'blue-gray': {
        300: '#CAD1EA',
        400: '#949FC5',
        500: '#7B84A3',
        600: '#465380',
        700: '#2F3858',
        800: '#262D47',
        900: '#1C2135',
      },
    },
  },
  plugins: [],
};
