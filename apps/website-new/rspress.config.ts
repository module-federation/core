import * as path from 'path';
import { defineConfig } from 'rspress/config';

const getNavbar = (lang: string) => {
  const cn = lang === 'zh';
  const prefix = cn ? '' : '/en';
  const getLink = (str: string) => `${prefix}${str}`;
  const getText = (cnText: string, enText: string) => (cn ? cnText : enText);
  return [
    // {
    //   text: getText('指南', 'Guide'),
    //   link: getLink('/guides/get-started/introduction'),
    //   activeMatch: '/guides/',
    // },
    {
      text: getText('社区', 'Community'),
      link: getLink('/community/showcase'),
      activeMatch: '/community/',
    },
  ];
};

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Module federation',
  description: 'Module federation',
  icon: '/svg.svg',
  lang: 'en',
  logo: {
    light: '/module-federation-logo.svg',
    dark: '/module-federation-logo.svg',
  },
  themeConfig: {
    locales: [
      // {
      //   lang: 'zh',
      //   title: 'Modern.js',
      //   description:
      //     'A Progressive React Framework for modern web development.',
      //   nav: getNavbar('zh'),
      //   label: '简体中文',
      // },
      {
        lang: 'en',
        title: 'Module federation',
        description:
          'A Progressive React Framework for modern web development.',
        nav: getNavbar('en'),
        label: 'English',
      },
    ],
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
