import { parseOptions } from '@module-federation/enhanced';
import {
  ModuleFederationPlugin,
  PLUGIN_NAME,
} from '@module-federation/enhanced/rspack';
import { isRequiredVersion } from '@module-federation/sdk';
import {
  isRegExp,
  autoDeleteSplitChunkCacheGroups,
  addDataFetchExposes,
} from '../utils/index';
import pkgJson from '../../package.json';
import logger from '../logger';
import {
  createSSRMFConfig,
  createSSRREnvConfig,
  setSSREnv,
  SSR_ENV_NAME,
  SSR_DIR,
} from './ssr';
import { updateStatsAndManifest } from './manifest';

import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';
import type { RsbuildConfig, RsbuildPlugin, Rspack } from '@rsbuild/core';

type ModuleFederationOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions;

type RSBUILD_PLUGIN_OPTIONS = {
  ssr?: boolean;
};

type ExposedAPIType = {
  options: {
    nodePlugin?: ModuleFederationPlugin;
    browserPlugin?: ModuleFederationPlugin;
    distOutputDir?: string;
  };
  isSSRConfig: typeof isSSRConfig;
};
export type { ModuleFederationOptions, ExposedAPIType };

const RSBUILD_PLUGIN_MODULE_FEDERATION_NAME =
  'rsbuild:module-federation-enhanced';
const RSBUILD_PLUGIN_NAME = '@module-federation/rsbuild-plugin';

export { RSBUILD_PLUGIN_MODULE_FEDERATION_NAME, PLUGIN_NAME, SSR_DIR };

const LIB_FORMAT = ['umd', 'modern-module'];

const DEFAULT_MF_ENVIRONMENT_NAME = 'mf';

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
  if (bundlerConfig.name === SSR_ENV_NAME) {
    return true;
  }

  return !(
    typeof library === 'object' &&
    !Array.isArray(library) &&
    'type' in library &&
    //  if the type is umd/modern-module or commonjs*, means this is a normal library , not mf
    (LIB_FORMAT.includes(library.type) || /commonjs/.test(library.type))
  );
}

const isSSRConfig = (bundlerConfigName?: string) =>
  Boolean(bundlerConfigName === SSR_ENV_NAME);

export const pluginModuleFederation = (
  moduleFederationOptions: ModuleFederationOptions,
  rsbuildOptions?: RSBUILD_PLUGIN_OPTIONS,
): RsbuildPlugin => ({
  name: RSBUILD_PLUGIN_MODULE_FEDERATION_NAME,
  setup: (api) => {
    const { callerName } = api.context;
    const originalRsbuildConfig = api.getRsbuildConfig();
    if (!callerName) {
      throw new Error(
        '`callerName` is undefined. Please ensure the @rsbuild/core version is higher than 1.3.21 .',
      );
    }
    const isRslib = callerName === 'rslib';
    const isSSR = Boolean(rsbuildOptions?.ssr);

    if (isSSR && !isStoryBook(originalRsbuildConfig)) {
      if (!isRslib) {
        throw new Error(`'ssr' option is only supported in rslib.`);
      }
      const rsbuildConfig = api.getRsbuildConfig();

      if (
        !rsbuildConfig.environments?.[DEFAULT_MF_ENVIRONMENT_NAME] ||
        Object.keys(rsbuildConfig.environments).some(
          (key) =>
            key.startsWith(DEFAULT_MF_ENVIRONMENT_NAME) &&
            key !== DEFAULT_MF_ENVIRONMENT_NAME,
        )
      ) {
        throw new Error(
          `Please set ${RSBUILD_PLUGIN_NAME} as global plugin in rslib.config.ts if you set 'ssr:true' .`,
        );
      }

      setSSREnv();
    }

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

          !isRslib && logger.warn(corsWarnMsgs.join('\n'));
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

      if (isSSR) {
        if (config.environments?.[SSR_ENV_NAME]) {
          throw new Error(
            `'${SSR_ENV_NAME}' environment is already defined. Please use another name.`,
          );
        }
        config.environments![SSR_ENV_NAME] = createSSRREnvConfig(
          config.environments?.[DEFAULT_MF_ENVIRONMENT_NAME]!,
          moduleFederationOptions,
        );
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

    const generateMergedStatsAndManifestOptions: ExposedAPIType = {
      options: {
        nodePlugin: undefined,
        browserPlugin: undefined,
        distOutputDir: undefined,
      },
      isSSRConfig,
    };
    api.expose(
      RSBUILD_PLUGIN_MODULE_FEDERATION_NAME,
      generateMergedStatsAndManifestOptions,
    );
    api.onBeforeCreateCompiler(({ bundlerConfigs }) => {
      if (!bundlerConfigs) {
        throw new Error('Can not get bundlerConfigs!');
      }
      bundlerConfigs.forEach((bundlerConfig) => {
        if (!isMFFormat(bundlerConfig)) {
          return;
        } else if (isStoryBook(originalRsbuildConfig)) {
          bundlerConfig.output!.uniqueName = `${moduleFederationOptions.name}-storybook-host`;
        } else {
          // mf
          autoDeleteSplitChunkCacheGroups(
            moduleFederationOptions,
            bundlerConfig?.optimization?.splitChunks,
          );
          addDataFetchExposes(
            moduleFederationOptions.exposes,
            isSSRConfig(bundlerConfig.name),
          );

          delete bundlerConfig.optimization?.runtimeChunk;
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

          if (
            !bundlerConfig.output?.chunkLoadingGlobal &&
            !isSSRConfig(bundlerConfig.name)
          ) {
            bundlerConfig.output!.chunkLoading = 'jsonp';
            bundlerConfig.output!.chunkLoadingGlobal = `chunk_${moduleFederationOptions.name}`;
          }

          // `uniqueName` is required for react refresh to work
          if (!bundlerConfig.output?.uniqueName) {
            bundlerConfig.output!.uniqueName = moduleFederationOptions.name;
          }

          if (
            !bundlerConfig.plugins!.find((p) => p && p.name === PLUGIN_NAME)
          ) {
            if (isSSRConfig(bundlerConfig.name)) {
              generateMergedStatsAndManifestOptions.options.nodePlugin =
                new ModuleFederationPlugin(
                  createSSRMFConfig(moduleFederationOptions),
                );
              bundlerConfig.plugins!.push(
                generateMergedStatsAndManifestOptions.options.nodePlugin,
              );
              return;
            }
            generateMergedStatsAndManifestOptions.options.browserPlugin =
              new ModuleFederationPlugin(moduleFederationOptions);
            generateMergedStatsAndManifestOptions.options.distOutputDir =
              bundlerConfig.output?.path || '';
            bundlerConfig.plugins!.push(
              generateMergedStatsAndManifestOptions.options.browserPlugin,
            );
          }
        }
      });
    });

    const generateMergedStatsAndManifest = () => {
      const { nodePlugin, browserPlugin, distOutputDir } =
        generateMergedStatsAndManifestOptions.options;
      if (!nodePlugin || !browserPlugin || !distOutputDir) {
        return;
      }
      updateStatsAndManifest(nodePlugin, browserPlugin, distOutputDir);
    };

    api.onDevCompileDone(() => {
      generateMergedStatsAndManifest();
    });

    api.onAfterBuild(() => {
      generateMergedStatsAndManifest();
    });
  },
});

export { createModuleFederationConfig } from '@module-federation/enhanced';
