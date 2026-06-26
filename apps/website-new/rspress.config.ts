import * as path from 'path';
import { defineConfig } from '@rspress/core';
import { moduleFederationPluginOverview } from './src/moduleFederationPluginOverview';
// import { pluginAnnotationWords } from 'rspress-plugin-annotation-words';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginModuleFederation } from '@module-federation/rspress-plugin';
import mfConfig from './module-federation.config';

const siteOrigin = 'https://module-federation.io';
const siteIcon = '/svg.svg';
const siteIconUrl = `${siteOrigin}${siteIcon}`;
const siteIconAlt = 'Module Federation icon';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  llms: true,
  title: 'Module federation',
  description:
    'Module Federation is a concept that allows developers to share code and resources across multiple JavaScript applications',
  icon: siteIcon,
  lang: 'en',
  logo: {
    light: '/module-federation.svg',
    dark: '/module-federation-logo-white.svg',
  },
  head: [
    ['meta', { property: 'og:site_name', content: 'module-federation.io' }],
    ['meta', { property: 'og:image', content: siteIconUrl }],
    ['meta', { property: 'og:image:type', content: 'image/svg+xml' }],
    ['meta', { property: 'og:image:width', content: '43' }],
    ['meta', { property: 'og:image:height', content: '40' }],
    ['meta', { property: 'og:image:alt', content: siteIconAlt }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:image', content: siteIconUrl }],
    ['meta', { name: 'twitter:image:alt', content: siteIconAlt }],
  ],
  markdown: {
    image: {
      checkDeadImages: false,
    },
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
    // pluginAnnotationWords({
    //   wordsMapPath: 'words-map.json',
    // }),
    pluginModuleFederation(mfConfig),
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
      lazyCompilation: false,
    },
    performance: {
      buildCache: false,
    },
    tools: {
      postcss: (config, { addPlugins }) => {
        addPlugins([require('tailwindcss/nesting'), require('tailwindcss')]);
      },
      // rspack: {
      //   optimization: {
      //     minimize: false,
      //     chunkIds: 'named',
      //     moduleIds: 'named',
      //   }
      // }
    },
    resolve: {
      alias: {
        '@site': path.resolve(__dirname),
        '@components': path.join(__dirname, 'src/components'),
        '@docs': path.join(__dirname, 'docs'),
        '@public': path.join(__dirname, 'docs/public'),
      },
    },
  },
});
