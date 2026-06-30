import * as path from 'path';
import { withZephyr } from 'zephyr-rspress-plugin';
import { defineConfig } from '@rspress/core';
import { moduleFederationPluginOverview } from './src/moduleFederationPluginOverview';
// import { pluginAnnotationWords } from 'rspress-plugin-annotation-words';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginModuleFederation } from '@module-federation/rspress-plugin';
import mfConfig from './module-federation.config';

const siteOrigin = (
  process.env.CONTEXT === 'deploy-preview' && process.env.DEPLOY_PRIME_URL
    ? process.env.DEPLOY_PRIME_URL
    : 'https://module-federation.io'
).replace(/\/$/, '');
const siteIcon = '/svg.svg';
const socialImageUrl = `${siteOrigin}/module-federation-social.svg`;
const socialImageAlt = 'Module Federation icon';

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
    ['meta', { property: 'og:image', content: socialImageUrl }],
    ['meta', { property: 'og:image:type', content: 'image/svg+xml' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: socialImageAlt }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: socialImageUrl }],
    ['meta', { name: 'twitter:image:alt', content: socialImageAlt }],
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
    withZephyr(),
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
