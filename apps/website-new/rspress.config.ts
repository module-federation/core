import * as path from 'path';
import { defineConfig } from 'rspress/config';
console.log(
  'xxxx',
  require('path').resolve(__dirname) + '/src/components/ShowcaseList/index.tsx',
);
export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Module federation',
  description: 'Module federation',
  icon: '/svg.svg',
  logo: {
    light: '/module-federation-logo.svg',
    dark: '/module-federation-logo.svg',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/module-federation/universe',
      },
    ],
  },
  builderConfig: {
    tools: {
      postcss: (config, { addPlugins }) => {
        addPlugins([require('tailwindcss/nesting'), require('tailwindcss')]);
      },
    },
    source: {
      alias: {
        '@site': path.resolve(__dirname),
        '@components': path.join(__dirname, 'src/components'),
      },
    },
  },
});
