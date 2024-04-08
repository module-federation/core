import * as path from 'path';
import { defineConfig } from 'rspress/config';
import { moduleFederationPluginOverview } from './src/moduleFederationPluginOverview';

const getNavbar = (lang: string) => {
  const cn = lang === 'zh';
  const prefix = cn ? '' : '/en';
  const getLink = (str: string) => `${prefix}${str}`;
  const getText = (cnText: string, enText: string) => (cn ? cnText : enText);
  return [
    {
      text: getText('指南', 'Guide'),
      link: getLink('/guide/start/index'),
      activeMatch: '/guide/',
    },
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
    dark: '/module-federation-logo-white.svg',
  },
  markdown: {
    checkDeadLinks: true,
  },
  themeConfig: {
    locales: [
      {
        lang: 'zh',
        title: 'Module federation',
        description: '将你的 Web 应用微前端架构化',
        // nav: getNavbar('zh'),
        label: '简体中文',
      },
      {
        lang: 'en',
        title: 'Module federation',
        description: "Architecture your web application's micro-front end",
        // nav: getNavbar('en'),
        label: 'English',
      },
    ],
    editLink: {
      docRepoBaseUrl:
        'https://github.com/module-federation/universe/tree/main/apps/website-new/docs',
      text: 'Edit this page on GitHub',
    },
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/module-federation/universe',
      },
    ],
  },
  builderConfig: {
    plugins: [moduleFederationPluginOverview],
    tools: {
      postcss: (config, { addPlugins }) => {
        addPlugins([require('tailwindcss/nesting'), require('tailwindcss')]);
      },
    },
    source: {
      alias: {
        '@site': path.resolve(__dirname),
        '@components': path.join(__dirname, 'src/components'),
        '@public': path.join(__dirname, 'docs/public'),
      },
    },
  },
});
