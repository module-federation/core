const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}')],
  theme: {
    extend: {
      backgroundImage: {
        pattern: `url('/pattern_5.png')`,
      },
      maxWidth: {
        1225: '1225px',
      },
      opacity: {
        ['2.5']: 0.025,
      },
    },
    colors: {
      transparent: 'transparent',
      white: '#FFFFFF',
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
      'deep-purple': {
        300: '#9589EA',
        700: '#6559A2',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // ...
  ],
};
