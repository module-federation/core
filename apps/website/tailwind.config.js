const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}')],
  theme: {
    extend: {
      backgroundImage: {
        pattern: `url('/pattern_9.png')`,
      },
      maxWidth: {
        1225: '1225px',
      },
      opacity: {
        ['2.5']: 0.025,
      },
      boxShadow: {
        outline: '0 0 0 2px #00B9FF',
        card: '0px 0px 32px 0px #201E3726',
      },
      colors: {
        'ui-blue': '#00B9FF',
        transparent: 'transparent',
        white: '#FFFFFF',
        ['mf-gray']: '#F6F6FA',
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
  },
  plugins: [
    require('@tailwindcss/forms'),
    // ...
  ],
};
