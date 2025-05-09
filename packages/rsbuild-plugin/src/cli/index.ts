import { parseOptions } from '@module-federation/enhanced';
import {
  ModuleFederationPlugin,
  PLUGIN_NAME,
} from '@module-federation/enhanced/rspack';
import { isRequiredVersion } from '@module-federation/sdk';

import { isRegExp, autoDeleteSplitChunkCacheGroups } from '../utils/index';
import pkgJson from '../../package.json';

import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';
import type { RsbuildConfig, RsbuildPlugin, Rspack } from '@rsbuild/core';
import logger from '../logger';

type ModuleFederationOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions;

export type { ModuleFederationOptions };

const RSBUILD_PLUGIN_MODULE_FEDERATION_NAME =
  'rsbuild:module-federation-enhanced';
const RSPACK_PLUGIN_MODULE_FEDERATION_NAME = 'module-federation';

export {
  RSBUILD_PLUGIN_MODULE_FEDERATION_NAME,
  RSPACK_PLUGIN_MODULE_FEDERATION_NAME,
  PLUGIN_NAME,
};

const LIB_FORMAT = ['umd', 'modern-module'];

function isStoryBook(rsbuildConfig: RsbuildConfig) {
  if (
    rsbuildConfig.plugins?.find(
      (p) =>
        p && 'name' in p && p.name === 'module-federation-storybook-plugin',
    )
  ) {
    return true;
  }
}

export function isMFFormat(bundlerConfig: Rspack.Configuration) {
  const library = bundlerConfig.output?.library;

  return !(
    typeof library === 'object' &&
    !Array.isArray(library) &&
    'type' in library &&
    //  if the type is umd/modern-module or commonjs*, means this is a normal library , not mf
    (LIB_FORMAT.includes(library.type) || /commonjs/.test(library.type))
  );
}

export const pluginModuleFederation = (
  moduleFederationOptions: ModuleFederationOptions,
): RsbuildPlugin => ({
  name: RSBUILD_PLUGIN_MODULE_FEDERATION_NAME,
  setup: (api) => {
    const sharedOptions: [string, sharePlugin.SharedConfig][] = parseOptions(
      moduleFederationOptions.shared || [],
      (item, key) => {
        if (typeof item !== 'string')
          throw new Error('Unexpected array in shared');
        const config: sharePlugin.SharedConfig =
          item === key || !isRequiredVersion(item)
            ? {
                import: item,
              }
            : {
                import: key,
                requiredVersion: item,
              };
        return config;
      },
      (item) => item,
    );
    // shared[0] is the shared name
    const shared = sharedOptions.map((shared) =>
      shared[0].endsWith('/') ? shared[0].slice(0, -1) : shared[0],
    );

    api.onBeforeCreateCompiler(({ bundlerConfigs }) => {
      if (!bundlerConfigs) {
        throw new Error('Can not get bundlerConfigs!');
      }
      bundlerConfigs.forEach((bundlerConfig) => {
        if (!isMFFormat(bundlerConfig)) {
          return;
        } else if (isStoryBook(api.getRsbuildConfig())) {
          bundlerConfig.output!.uniqueName = `${moduleFederationOptions.name}-storybook-host`;
        } else {
          // mf
          autoDeleteSplitChunkCacheGroups(
            moduleFederationOptions,
            bundlerConfig?.optimization?.splitChunks,
          );

          const externals = bundlerConfig.externals;
          if (Array.isArray(externals)) {
            const sharedModules = new Set<string>();
            bundlerConfig.externals = externals.filter((ext) => {
              let sharedModule;
              if (isRegExp(ext)) {
                const match = shared.some((dep) => {
                  if (
                    (ext as RegExp).test(dep) ||
                    (ext as RegExp).test(pkgJson.name)
                  ) {
                    sharedModule = dep;
                    return true;
                  }
                  return false;
                });

                match && sharedModule && sharedModules.add(sharedModule);
                return !match;
              }

              if (typeof ext === 'string') {
                if (ext === pkgJson.name) {
                  return false;
                }

                const match = shared.some((dep) => {
                  if (dep === ext) {
                    sharedModule = dep;
                  }
                  return dep === ext;
                });
                if (match) {
                  sharedModule && sharedModules.add(sharedModule);
                  return false;
                }
                return true;
              }
              return true;
            });
            if (sharedModules.size > 0) {
              for (const sharedModule of sharedModules) {
                logger.log(
                  `${sharedModule} is removed from externals because it is a shared module.`,
                );
              }
            }
          }

          if (!bundlerConfig.output?.chunkLoadingGlobal) {
            bundlerConfig.output!.chunkLoading = 'jsonp';
          }

          // `uniqueName` is required for react refresh to work
          if (!bundlerConfig.output?.uniqueName) {
            bundlerConfig.output!.uniqueName = moduleFederationOptions.name;
          }

          if (
            !bundlerConfig.plugins!.find((p) => p && p.name === PLUGIN_NAME)
          ) {
            bundlerConfig.plugins!.push(
              new ModuleFederationPlugin(moduleFederationOptions),
            );
          }
        }
      });
    });

    // dev config only works on format: 'mf'
    api.modifyRsbuildConfig((config) => {
      // skip storybook
      if (isStoryBook(config)) {
        return;
      }
      // Change some default configs for remote modules
      if (moduleFederationOptions.exposes) {
        config.dev ||= {};
        config.server ||= {};
        const userConfig = api.getRsbuildConfig('original');

        // Allow remote modules to be loaded by setting CORS headers
        // This is required for MF to work properly across different origins
        config.server.headers ||= {};
        if (
          !config.server.headers['Access-Control-Allow-Origin'] &&
          !(
            typeof userConfig.server?.cors === 'object' &&
            userConfig.server.cors.origin
          )
        ) {
          const corsWarnMsgs = [
            'Detect that CORS options are not set, mf Rsbuild plugin will add default cors header: server.headers["Access-Control-Allow-Headers"] = "*". It is recommended to specify an allowlist of trusted origins in "server.cors" instead.',
            'View https://module-federation.io/guide/troubleshooting/other.html#cors-warn for more details.',
          ];

          logger.warn(corsWarnMsgs.join('\n'));
          config.server.headers['Access-Control-Allow-Origin'] = '*';
        }

        // For remote modules, Rsbuild should send the ws request to the provider's dev server.
        // This allows the provider to do HMR when the provider module is loaded in the consumer's page.
        if (config.server?.port && !config.dev.client?.port) {
          config.dev.client ||= {};
          config.dev.client.port = config.server.port;
        }

        // Change the default assetPrefix to `true` for remote modules.
        // This ensures that the remote module's assets can be requested by consumer apps with the correct URL.
        const originalConfig = api.getRsbuildConfig('original');
        if (
          originalConfig.dev?.assetPrefix === undefined &&
          config.dev.assetPrefix === config.server?.base
        ) {
          config.dev.assetPrefix = true;
        }
      }
    });

    api.modifyEnvironmentConfig((config) => {
      // Module Federation runtime uses ES6+ syntax,
      // adding to include and let SWC transform it
      config.source.include = [
        ...(config.source.include || []),
        /@module-federation[\\/]/,
      ];

      return config;
    });
  },
});

export { createModuleFederationConfig } from '@module-federation/enhanced';
