import path from 'path';
import fs from 'fs-extra';
import {
  createSSRMFConfig,
  patchSSRRspackConfig,
  updateStatsAndManifest,
} from '@module-federation/rsbuild-plugin/utils';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import {
  getShortErrorMsg,
  BUILD_002,
  buildDescMap,
} from '@module-federation/error-codes';

import logger from './logger';

import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { RspressPlugin } from '@rspress/shared';

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
  ModuleFederationPluginImplementation = ModuleFederationPlugin,
): RspressPlugin {
  let browserPlugin: ModuleFederationPlugin;
  let serverPlugin: ModuleFederationPlugin;
  let outputDir = '';
  const mfConfigForSSR = createSSRMFConfig(mfConfig);
  const mfConfigForBrowser = mfConfig;

  let enableSSG = false;

  return {
    // 插件名称
    name: 'plugin-module-federation',
    async beforeBuild(config, isProd) {
      if (!isDev() && config.ssg !== false) {
        // FIXME: rspress will automatically delete ssr dir, but it's necessary for ssg build, set debug mode can avoid this dir delete.
        // If rspress can provide stuff like deleteSSRDir, can remove this action, cause this action will log more unnecessary info, and have some error log like miss i8n.
        process.env.DEBUG = process.env.DEBUG ?? 'rsbuild';
        enableSSG = true;
      }

      if (!config.builderConfig?.dev?.assetPrefix) {
        config.builderConfig ||= {};
        config.builderConfig.dev ||= {};
        config.builderConfig.dev.assetPrefix = true;
      }
    },
    async afterBuild(config, isProd) {
      if (enableSSG) {
        updateStatsAndManifest(serverPlugin, browserPlugin, outputDir);
      }
    },
    builderConfig: {
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
            patchSSRRspackConfig(config, mfConfigForSSR);
            serverPlugin = new ModuleFederationPluginImplementation(
              mfConfigForSSR,
            );
            config.plugins.push(serverPlugin);
          } else {
            browserPlugin = new ModuleFederationPluginImplementation(
              mfConfigForBrowser,
            );
            config.plugins.push(browserPlugin);
            outputDir = config.output?.path || '';
          }
        },
      },
    },
  };
}
