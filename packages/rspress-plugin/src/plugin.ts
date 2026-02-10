import { pluginModuleFederation as rsbuildPluginModuleFederation } from '@module-federation/rsbuild-plugin';
import {
  getShortErrorMsg,
  BUILD_002,
  buildDescMap,
} from '@module-federation/error-codes';

import logger from './logger';

import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { RspressPlugin, RouteMeta } from '@rspress/core';
import { rebuildSearchIndexByHtml } from './rebuildSearchIndexByHtml';

type RspressPluginOptions = {
  autoShared?: boolean;
  rebuildSearchIndex?: boolean;
};

const isDev = () => process.env.NODE_ENV === 'development';

export function pluginModuleFederation(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  rspressOptions?: RspressPluginOptions,
): RspressPlugin {
  const { autoShared = true, rebuildSearchIndex = true } = rspressOptions || {};

  if (autoShared) {
    mfConfig.shared = {
      react: {
        singleton: true,
        requiredVersion: false,
      },
      'react-dom': {
        singleton: true,
        requiredVersion: false,
      },
      'react/': {
        singleton: true,
        requiredVersion: false,
      },
      'react-dom/': {
        singleton: true,
        requiredVersion: false,
      },
      '@mdx-js/react': { singleton: true, requiredVersion: false },
      '@rspress/core/runtime': {
        singleton: true,
        requiredVersion: false,
      },
      'react-router-dom': {
        singleton: true,
        requiredVersion: false,
      },
      // '@rspress/core/shiki-transformers': {
      //   singleton: true,
      //   requiredVersion: false,
      // },
      // '@rspress/core/theme': {
      //   singleton: true,
      //   requiredVersion: false,
      // },
      // '@rspress/core/theme-original': {
      //   singleton: true,
      //   requiredVersion: false,
      // },
      ...mfConfig.shared,
    };
  }
  mfConfig.experiments ||= {};
  mfConfig.experiments.asyncStartup = true;

  let enableSSG = false;
  let outputDir = '';
  let routes: RouteMeta[] = [];

  return {
    name: 'plugin-module-federation',
    async config(config) {
      if (!isDev() && config.ssg !== false) {
        enableSSG = true;
      }

      // config.builderConfig ||= {};
      // config.builderConfig.dev ||= {};
      // if (
      //   isDev() &&
      //   typeof config.builderConfig.dev.lazyCompilation === 'undefined'
      // ) {
      //   logger.warn(
      //     'lazyCompilation is not fully supported for module federation, set lazyCompilation to false',
      //   );
      //   config.builderConfig.dev.lazyCompilation = false;
      // }
      config.builderConfig ||= {};
      config.builderConfig.plugins ||= [];
      config.builderConfig.plugins.push(
        rsbuildPluginModuleFederation(mfConfig, {
          target: enableSSG ? 'dual' : 'web',
          environment: 'node',
          ssrDir: 'mf-ssg',
        }),
      );
      return config;
    },
    builderConfig: {
      plugins: [],
      tools: {
        rspack(config) {
          // replaceEntryWithBootstrapEntry(config);
          if (config.name === 'node') {
            if (
              (config.output.publicPath === '/' ||
                config.output.publicPath === 'auto') &&
              mfConfig.exposes
            ) {
              logger.error(
                getShortErrorMsg(BUILD_002, buildDescMap, {
                  publicPath: config.output.publicPath,
                }),
              );
              process.exit(1);
            }

            outputDir = config.output.path!;
          }
        },
      },
    },
    routeGenerated(routeMetaArr) {
      routes = routeMetaArr;
    },
    async afterBuild(config) {
      if (!mfConfig.remotes || isDev() || !rebuildSearchIndex) {
        return;
      }
      if (!enableSSG) {
        logger.error('rebuildSearchIndex is only supported for ssg');
        process.exit(1);
      }
      const searchConfig = config?.search || {};
      const replaceRules = config?.replaceRules || [];
      const domain = '';
      const versioned = searchConfig && searchConfig.versioned;
      const searchCodeBlocks =
        'codeBlocks' in searchConfig ? Boolean(searchConfig.codeBlocks) : true;
      await rebuildSearchIndexByHtml(routes, {
        outputDir,
        versioned,
        replaceRules,
        domain,
        searchCodeBlocks,
        defaultLang: config.lang || 'en',
      });
      logger.info('rebuildSearchIndex success!');
    },
  };
}

export { createModuleFederationConfig } from '@module-federation/sdk';
