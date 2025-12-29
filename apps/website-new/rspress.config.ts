import * as path from 'path';
import { defineConfig } from '@rspress/core';
import { moduleFederationPluginOverview } from './src/moduleFederationPluginOverview';
import { pluginAnnotationWords } from 'rspress-plugin-annotation-words';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginLlms } from '@rspress/plugin-llms';
import { pluginModuleFederation } from '@module-federation/rspress-plugin';
import mfConfig from './module-federation.config';

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
  themeConfig: {
    locales: [
      {
        lang: 'zh',
        title: 'Module federation',
        description: '将你的 Web 应用微前端架构化',
        label: '简体中文',
      },
      {
        lang: 'en',
        title: 'Module federation',
        description: "Architecture your web application's micro-front end",
        label: 'English',
      },
    ],
    editLink: {
      docRepoBaseUrl:
        'https://github.com/module-federation/core/tree/main/apps/website-new/docs',
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
    ],
  },
  plugins: [
    pluginAnnotationWords({
      wordsMapPath: 'words-map.json',
    }),
    pluginLlms(),
    // pluginModuleFederation(mfConfig),
  ],
  builderConfig: {
    plugins: [moduleFederationPluginOverview, pluginSass()],
    output: {
      assetPrefix:
        process.env.CONTEXT === 'deploy-preview'
          ? process.env.DEPLOY_PRIME_URL
          : 'https://module-federation.io/',
    },
    dev: {
      assetPrefix: true,
      writeToDisk: true,
    },
    performance: {
      buildCache: process.env.CONTEXT ? false : true,
    },
    tools: {
      postcss: (config, { addPlugins }) => {
        addPlugins([require('tailwindcss/nesting'), require('tailwindcss')]);
      },
    },
    resolve: {
      alias: {
        '@site': path.resolve(__dirname),
        '@components': path.join(__dirname, 'src/components'),
        '@public': path.join(__dirname, 'docs/public'),
      },
    },
  },
});
