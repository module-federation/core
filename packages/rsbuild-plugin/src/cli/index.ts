import { parseOptions } from '@module-federation/enhanced';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { isRequiredVersion } from '@module-federation/sdk';

import { isRegExp } from '../utils/index';
import pkgJson from '../../package.json';

import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';
import type { RsbuildPlugin, EnvironmentConfig } from '@rsbuild/core';
import logger from '../logger';

type ModuleFederationOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions;

const RSBUILD_PLUGIN_MODULE_FEDERATION_NAME =
  'rsbuild:module-federation-enhanced';
const RSPACK_PLUGIN_MODULE_FEDERATION_NAME = 'module-federation';

export {
  RSBUILD_PLUGIN_MODULE_FEDERATION_NAME,
  RSPACK_PLUGIN_MODULE_FEDERATION_NAME,
};

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

    api.modifyRsbuildConfig((config) => {
      // Change some default configs for remote modules
      if (moduleFederationOptions.exposes) {
        config.dev ||= {};

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

    api.modifyEnvironmentConfig((config, { mergeEnvironmentConfig }) => {
      /**
       * Currently, splitChunks will take precedence over module federation shared modules.
       * So we need to disable the default split chunks rules to make shared modules to work properly.
       * @see https://github.com/module-federation/module-federation-examples/issues/3161
       */
      if (config.performance?.chunkSplit?.strategy === 'split-by-experience') {
        config.performance.chunkSplit = {
          ...config.performance.chunkSplit,
          strategy: 'custom',
        };
      }

      // Module Federation runtime uses ES6+ syntax,
      // adding to include and let SWC transform it
      config.source.include = [
        ...(config.source.include || []),
        /@module-federation[\\/]sdk/,
        /@module-federation[\\/]runtime/,
      ];

      // filter external with shared config,
      const externals = config.output.externals;
      if (Array.isArray(externals)) {
        const sharedModules = new Set<string>();
        config.output.externals = externals.filter((ext) => {
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

      const mfConfig: EnvironmentConfig = {
        tools: {
          rspack: {
            output: {
              chunkLoading: 'jsonp',
            },
          },
        },
      };
      return mergeEnvironmentConfig(config, mfConfig);
    });

    api.modifyBundlerChain(async (chain) => {
      chain
        .plugin(RSPACK_PLUGIN_MODULE_FEDERATION_NAME)
        .use(ModuleFederationPlugin, [moduleFederationOptions]);

      // `uniqueName` is required for react refresh to work
      if (!chain.output.get('uniqueName')) {
        chain.output.set('uniqueName', moduleFederationOptions.name);
      }
    });
  },
});
