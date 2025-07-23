import path from 'path';
import fs from 'fs-extra';
import { pluginModuleFederation as rsbuildPluginModuleFederation } from '@module-federation/rsbuild-plugin';
import {
  getShortErrorMsg,
  BUILD_002,
  buildDescMap,
} from '@module-federation/error-codes';
import logger from './logger';
import {
  getRouteHtmlMap,
  getRouteId,
  rebuildLLMsMDFilesByHtml,
  rebuildSearchIndexByHtml,
} from './rebuild';

import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { RspressPlugin, Route, RouteMeta } from '@rspress/shared';
import type { RebuildOptions } from './rebuild';

type RspressPluginOptions = {
  autoShared?: boolean;
  rebuildSearchIndex?: boolean;
  rebuildLLMsMDFiles?: boolean;
};

type ExtractObjectType<T> = T extends (...args: any[]) => any ? never : T;
type OmitArrayConfiguration<T> =
  T extends Array<any> ? (T extends (infer U)[] ? U : T) : ExtractObjectType<T>;

type ToolsRspack = NonNullable<
  NonNullable<NonNullable<RspressPlugin['builderConfig']>['tools']>['rspack']
>;
type RspackConfig = ExtractObjectType<OmitArrayConfiguration<ToolsRspack>>;

const isDev = () => process.env.NODE_ENV === 'development';

function replaceEntryWithBootstrapEntry(bundlerConfig: RspackConfig) {
  const { entry } = bundlerConfig;
  if (!entry) {
    logger.error('No entry found!');
    process.exit(1);
  }
  if (typeof entry === 'function') {
    logger.error('Not support entry function!');
    process.exit(1);
  }

  const replaceWithAsyncEntry = (
    entries: string[] | string,
    entryName: string,
  ) => {
    const entryPath = path.resolve(
      process.cwd(),
      `node_modules/.federation/${entryName}-bootstrap.js`,
    );
    fs.ensureDirSync(path.dirname(entryPath));

    if (typeof entries === 'string') {
      fs.writeFileSync(
        entryPath,
        `const entry = import ('${entries}');
      const render = entry.then(({render})=>(render));
      const routes = entry.then(({routes})=>(routes));
      export {
          render,
          routes
        };`,
      );
      return entryPath;
    } else {
      fs.writeFileSync(
        entryPath,
        `const entry = import ('${entries.slice(-1)[0]}');
         const render = entry.then(({render})=>(render));
      const routes = entry.then(({routes})=>(routes));
      export {
          render,
          routes
        };`,
      );
      return entries.slice(0, -1).concat(entryPath);
    }
  };

  if (typeof entry === 'object' && !Array.isArray(entry)) {
    Object.keys(entry).forEach((entryName) => {
      const entryValue = entry[entryName];
      if (!Array.isArray(entryValue)) {
        logger.error(`Not support entry ${typeof entryValue}!`);
        process.exit(1);
      }
      entry[entryName] = replaceWithAsyncEntry(
        entryValue,
        `${entryName}${bundlerConfig.name ? `-${bundlerConfig.name}` : ''}`,
      );
    });
    return;
  }
  bundlerConfig.entry = replaceWithAsyncEntry(
    entry,
    bundlerConfig.name || 'index',
  );
  return;
}

export function pluginModuleFederation(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  rspressOptions?: RspressPluginOptions,
): RspressPlugin {
  const {
    autoShared = true,
    rebuildSearchIndex = true,
    rebuildLLMsMDFiles = true,
  } = rspressOptions || {};

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
      '@rspress/runtime': {
        singleton: true,
        requiredVersion: false,
      },
      ...mfConfig.shared,
    };
  }

  let enableSSG = false;
  let outputDir = '';
  let routesMap: Record<string, RouteMeta> = {};

  return {
    name: 'plugin-module-federation',
    async config(config) {
      if (!isDev() && config.ssg !== false) {
        enableSSG = true;
      }

      config.builderConfig ||= {};
      config.builderConfig.dev ||= {};
      if (
        isDev() &&
        typeof config.builderConfig.dev.lazyCompilation === 'undefined'
      ) {
        logger.warn(
          'lazyCompilation is not fully supported for module federation, set lazyCompilation to false',
        );
        config.builderConfig.dev.lazyCompilation = false;
      }
      config.builderConfig.plugins ||= [];
      config.builderConfig.plugins.push(
        rsbuildPluginModuleFederation(mfConfig, {
          ssr: enableSSG,
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
          replaceEntryWithBootstrapEntry(config);
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
      routesMap = routeMetaArr.reduce(
        (prev, cur) => {
          prev[getRouteId(cur)] = cur;
          return prev;
        },
        {} as Record<string, RouteMeta>,
      );
    },
    async afterBuild(config) {
      if (
        !mfConfig.remotes ||
        isDev() ||
        !rebuildSearchIndex ||
        !rebuildLLMsMDFiles
      ) {
        return;
      }
      if (!enableSSG) {
        logger.error(
          'rebuildSearchIndex and rebuildLLMsMDFiles are only supported for ssg',
        );
        process.exit(1);
      }
      const searchConfig = config?.search || {};
      const replaceRules = config?.replaceRules || [];
      const domain =
        searchConfig?.mode === 'remote' ? (searchConfig.domain ?? '') : '';

      const versioned =
        searchConfig &&
        searchConfig.mode !== 'remote' &&
        searchConfig.versioned;

      const searchCodeBlocks =
        'codeBlocks' in searchConfig ? Boolean(searchConfig.codeBlocks) : true;

      const routeHtmlMap = await getRouteHtmlMap(routesMap, {
        outputDir,
        versioned,
        replaceRules,
        domain,
        searchCodeBlocks,
        defaultLang: config.lang || 'en',
      });
      const rebuildOptions: RebuildOptions = {
        outputDir,
        versioned,
        replaceRules,
        domain,
        searchCodeBlocks,
        defaultLang: config.lang || 'en',
      };

      if (rebuildSearchIndex) {
        await rebuildSearchIndexByHtml(routesMap, routeHtmlMap, rebuildOptions);
        logger.info('rebuildSearchIndex success!');
      }

      if (
        rebuildLLMsMDFiles &&
        config.plugins?.find((p) => p.name === '@rspress/plugin-llms')
      ) {
        await rebuildLLMsMDFilesByHtml(routesMap, routeHtmlMap, rebuildOptions);
        logger.info('rebuildLLMsMDFiles success!');
      }
    },
  };
}

export { createModuleFederationConfig } from '@module-federation/sdk';
