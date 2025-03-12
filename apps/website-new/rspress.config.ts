import * as path from 'path';
import { defineConfig } from 'rspress/config';
import { moduleFederationPluginOverview } from './src/moduleFederationPluginOverview';
import { pluginAnnotationWords } from 'rspress-plugin-annotation-words';

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
  description:
    'Module Federation is a concept that allows developers to share code and resources across multiple JavaScript applications',
  icon: '/svg.svg',
  lang: 'en',
  logo: {
    light: '/module-federation.svg',
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
        'https://github.com/module-federation/core/tree/main/apps/website-new/docs',
      text: 'Edit this page on GitHub',
    },
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/module-federation/core',
      },
      {
        icon: 'discord',
        mode: 'link',
        content: 'https://discord.gg/T8c6yAxkbv',
      },
      {
        icon: 'lark',
        mode: 'link',
        content:
          'https://applink.larkoffice.com/client/chat/chatter/add_by_link?link_token=a41s8f79-741f-41ba-8349-395d9a0e9662',
      },
    ],
  },
  plugins: [
    pluginAnnotationWords({
      wordsMapPath: 'words-map.json',
    }),
  ],
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
