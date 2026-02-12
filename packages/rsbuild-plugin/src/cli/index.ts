import { parseOptions } from '@module-federation/enhanced';
import {
  ModuleFederationPlugin,
  TreeShakingSharedPlugin,
  PLUGIN_NAME,
} from '@module-federation/enhanced/rspack';
import { isRequiredVersion, getManifestFileName } from '@module-federation/sdk';
import pkgJson from '../../package.json';
import logger from '../logger';
import {
  isRegExp,
  autoDeleteSplitChunkCacheGroups,
  addDataFetchExposes,
  createSSRMFConfig,
  createSSRREnvConfig,
  setSSREnv,
  SSR_ENV_NAME,
  SSR_DIR,
  updateStatsAndManifest,
  StatsAssetResource,
  patchSSRRspackConfig,
} from '../utils';

import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { RsbuildConfig, RsbuildPlugin, Rspack } from '@rsbuild/core';
import {
  CALL_NAME_MAP,
  RSPRESS_BUNDLER_CONFIG_NAME,
  RSPRESS_SSR_DIR,
  RSPRESS_SSG_MD_ENV_NAME,
} from '../constant';
import {
  patchNodeConfig,
  patchNodeMFConfig,
  patchToolsTspack,
} from '../utils/ssr';

type ModuleFederationOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions;

type RSBUILD_PLUGIN_OPTIONS = {
  target?: 'web' | 'node' | 'dual';
  /**
   * @deprecated Please use `target: 'dual'` instead.
   */
  ssr?: boolean;
  // ssr dir, default is ssr
  ssrDir?: string;
  // target copy environment name, default is mf
  environment?: string;
};

type ExposedAPIType = {
  options: {
    nodePlugin?: ModuleFederationPlugin;
    browserPlugin?: ModuleFederationPlugin;
    rspressSSGPlugin?: ModuleFederationPlugin;
    distOutputDir?: string;
    browserEnvironmentName?: string;
    nodeEnvironmentName?: string;
  };
  assetResources: Record<string, StatsAssetResource>;
  isSSRConfig: typeof isSSRConfig;
  isRspressSSGConfig: typeof isRspressSSGConfig;
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
  return false;
}

export function isMFFormat(
  bundlerConfig: Rspack.Configuration,
  mfEnvironmentNames: string[] = [],
) {
  const library = bundlerConfig.output?.library;
  if (
    bundlerConfig.name === SSR_ENV_NAME ||
    (bundlerConfig.name && mfEnvironmentNames.includes(bundlerConfig.name))
  ) {
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

const isRspressSSGConfig = (bundlerConfigName?: string) => {
  return [RSPRESS_BUNDLER_CONFIG_NAME, RSPRESS_SSG_MD_ENV_NAME].includes(
    bundlerConfigName || '',
  );
};

export const pluginModuleFederation = (
  moduleFederationOptions: ModuleFederationOptions,
  rsbuildOptions?: RSBUILD_PLUGIN_OPTIONS,
): RsbuildPlugin => ({
  name: RSBUILD_PLUGIN_MODULE_FEDERATION_NAME,
  setup: (api) => {
    const {
      target = 'web',
      ssr = undefined,
      ssrDir = SSR_DIR,
      environment = DEFAULT_MF_ENVIRONMENT_NAME,
    } = rsbuildOptions || {};
    if (ssr) {
      throw new Error(
        "The `ssr` option is deprecated. If you want to enable SSR, please use `target: 'dual'` instead.",
      );
    }

    const { callerName } = api.context;
    const originalRsbuildConfig = api.getRsbuildConfig();
    if (!callerName) {
      throw new Error(
        '`callerName` is undefined. Please ensure the @rsbuild/core version is higher than 1.3.21 .',
      );
    }
    const isRslib = callerName === CALL_NAME_MAP.RSLIB;
    const isRspress = callerName === CALL_NAME_MAP.RSPRESS;
    const isSSR = target === 'dual';
    const mfEnvironmentNamesForFormatCheck =
      target === 'node' ? [environment] : [];

    if (isSSR && !isStoryBook(originalRsbuildConfig)) {
      if (!isRslib && !isRspress) {
        throw new Error(`'target' option is only supported in Rslib.`);
      }
      const rsbuildConfig = api.getRsbuildConfig();

      if (
        !isRspress &&
        (!rsbuildConfig.environments?.[environment] ||
          Object.keys(rsbuildConfig.environments).some(
            (key) => key.startsWith(environment) && key !== environment,
          ))
      ) {
        throw new Error(
          `Please set ${RSBUILD_PLUGIN_NAME} as global plugin in rslib.config.ts if you set 'target: "dual"'.`,
        );
      }

      setSSREnv();
    }

    const sharedOptions: [string, moduleFederationPlugin.SharedConfig][] =
      parseOptions(
        moduleFederationOptions.shared || [],
        (item: string | string[], key: string) => {
          if (typeof item !== 'string')
            throw new Error('Unexpected array in shared');
          const config: moduleFederationPlugin.SharedConfig =
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
        (item: any) => item,
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

          !isRslib && !isRspress && logger.warn(corsWarnMsgs.join('\n'));
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
            `'${SSR_ENV_NAME}' environment is already defined.Please use another name.`,
          );
        }
        config.environments![SSR_ENV_NAME] = createSSRREnvConfig(
          config.environments?.[environment]!,
          moduleFederationOptions,
          ssrDir,
          config,
          callerName,
        );
        const ssgMDEnv = config.environments![RSPRESS_SSG_MD_ENV_NAME];
        if (isRspress && ssgMDEnv) {
          patchToolsTspack(ssgMDEnv, (config, { environment }) => {
            config.target = 'async-node';
          });
        }
      } else if (target === 'node') {
        const mfEnv = config.environments?.[environment];
        if (!mfEnv) {
          throw new Error(
            `Environment "${environment}" is required when target is "node". Please define it in rsbuild/rslib environments config.`,
          );
        }
        patchToolsTspack(mfEnv, (config, { environment }) => {
          config.target = 'async-node';
        });
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
        rspressSSGPlugin: undefined,
        distOutputDir: undefined,
        browserEnvironmentName: undefined,
        nodeEnvironmentName: undefined,
      },
      assetResources: {},
      isSSRConfig,
      isRspressSSGConfig,
    };
    api.expose(
      RSBUILD_PLUGIN_MODULE_FEDERATION_NAME,
      generateMergedStatsAndManifestOptions,
    );

    const defaultBrowserEnvironmentName = environment;
    const assetFileNames = getManifestFileName(
      moduleFederationOptions.manifest,
    );

    if (moduleFederationOptions.manifest !== false) {
      api.processAssets(
        {
          stage: 'report',
        },
        ({ assets, environment: envContext }) => {
          const defaultNodeEnvironmentName =
            target === 'node' ? environment : SSR_ENV_NAME;
          const expectedBrowserEnv =
            generateMergedStatsAndManifestOptions.options
              .browserEnvironmentName ?? defaultBrowserEnvironmentName;
          const expectedNodeEnv =
            generateMergedStatsAndManifestOptions.options.nodeEnvironmentName ??
            defaultNodeEnvironmentName;
          const envName = envContext.name;

          if (envName !== expectedBrowserEnv && envName !== expectedNodeEnv) {
            return;
          }

          const assetResources =
            generateMergedStatsAndManifestOptions.assetResources;
          const targetResources =
            assetResources[envName] || (assetResources[envName] = {});

          const statsAsset = assets[assetFileNames.statsFileName];
          if (statsAsset) {
            try {
              const raw = statsAsset.source();
              const content = typeof raw === 'string' ? raw : raw.toString();
              targetResources.stats = {
                data: JSON.parse(content),
                filename: assetFileNames.statsFileName,
              };
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              logger.error(
                `Failed to parse stats asset "${assetFileNames.statsFileName}" for environment "${envName}": ${message} `,
              );
            }
          }

          const manifestAsset = assets[assetFileNames.manifestFileName];
          if (manifestAsset) {
            try {
              const raw = manifestAsset.source();
              const content = typeof raw === 'string' ? raw : raw.toString();
              targetResources.manifest = {
                data: JSON.parse(content),
                filename: assetFileNames.manifestFileName,
              };
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              logger.error(
                `Failed to parse manifest asset "${assetFileNames.manifestFileName}" for environment "${envName}": ${message} `,
              );
            }
          }
        },
      );
    }
    api.onBeforeCreateCompiler(({ bundlerConfigs }) => {
      if (!bundlerConfigs) {
        throw new Error('Can not get bundlerConfigs!');
      }
      bundlerConfigs.forEach((bundlerConfig) => {
        const isNodeTargetEnvironment =
          target === 'node' && bundlerConfig.name === environment;
        const shouldApplyMF =
          isNodeTargetEnvironment ||
          isMFFormat(bundlerConfig, mfEnvironmentNamesForFormatCheck) ||
          isRspress;
        if (!shouldApplyMF) {
          return;
        } else if (isStoryBook(originalRsbuildConfig)) {
          bundlerConfig.output!.uniqueName = `${moduleFederationOptions.name} -storybook - host`;
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
            !isSSRConfig(bundlerConfig.name) &&
            !isRspressSSGConfig(bundlerConfig.name) &&
            target !== 'node'
          ) {
            bundlerConfig.output!.chunkLoading = 'jsonp';
            bundlerConfig.output!.chunkLoadingGlobal = `chunk_${moduleFederationOptions.name} `;
          }

          if (
            target === 'node' &&
            (isNodeTargetEnvironment ||
              isMFFormat(bundlerConfig, mfEnvironmentNamesForFormatCheck))
          ) {
            patchNodeConfig(bundlerConfig, moduleFederationOptions);
            patchNodeMFConfig(moduleFederationOptions);
          }

          // `uniqueName` is required for react refresh to work
          if (!bundlerConfig.output?.uniqueName) {
            bundlerConfig.output!.uniqueName = moduleFederationOptions.name;
          }

          // Set default publicPath to 'auto' if not explicitly configured
          // This allows remote chunks to load from the same origin as the remote application's manifest
          if (
            bundlerConfig.output?.publicPath === undefined &&
            !isSSRConfig(bundlerConfig.name) &&
            !isRspressSSGConfig(bundlerConfig.name)
          ) {
            bundlerConfig.output!.publicPath = 'auto';
          }

          if (
            !bundlerConfig.plugins!.find((p) => p && p.name === PLUGIN_NAME)
          ) {
            if (isSSRConfig(bundlerConfig.name) || isNodeTargetEnvironment) {
              generateMergedStatsAndManifestOptions.options.nodePlugin =
                new ModuleFederationPlugin(
                  createSSRMFConfig(moduleFederationOptions),
                );
              generateMergedStatsAndManifestOptions.options.nodeEnvironmentName =
                bundlerConfig.name ||
                (isNodeTargetEnvironment ? environment : SSR_ENV_NAME);
              bundlerConfig.plugins!.push(
                generateMergedStatsAndManifestOptions.options.nodePlugin,
              );
              return;
            } else if (isRspressSSGConfig(bundlerConfig.name)) {
              const mfConfig = {
                ...createSSRMFConfig(moduleFederationOptions),
                // expose in mf-ssg env
                exposes: {},
                manifest: false,
                library: undefined,
              };
              patchSSRRspackConfig(
                bundlerConfig,
                mfConfig,
                RSPRESS_SSR_DIR,
                callerName,
                false,
                false,
              );
              bundlerConfig.output ||= {};
              bundlerConfig.output.publicPath = '/';
              // MF depend on asyncChunks
              bundlerConfig.output.asyncChunks = undefined;
              const p = new ModuleFederationPlugin(mfConfig);
              if (bundlerConfig.name === RSPRESS_BUNDLER_CONFIG_NAME) {
                generateMergedStatsAndManifestOptions.options.rspressSSGPlugin =
                  p;
              }
              bundlerConfig.plugins!.push(p);
              return;
            }

            generateMergedStatsAndManifestOptions.options.browserPlugin =
              new ModuleFederationPlugin(moduleFederationOptions);
            generateMergedStatsAndManifestOptions.options.distOutputDir =
              bundlerConfig.output?.path || '';
            generateMergedStatsAndManifestOptions.options.browserEnvironmentName =
              bundlerConfig.name || defaultBrowserEnvironmentName;
            bundlerConfig.plugins!.push(
              generateMergedStatsAndManifestOptions.options.browserPlugin,
            );
          }
        }
      });
    });

    const generateMergedStatsAndManifest = () => {
      const { distOutputDir, browserEnvironmentName, nodeEnvironmentName } =
        generateMergedStatsAndManifestOptions.options;

      if (!distOutputDir || !browserEnvironmentName || !nodeEnvironmentName) {
        return;
      }

      const assetResources =
        generateMergedStatsAndManifestOptions.assetResources;
      const browserAssets = assetResources[browserEnvironmentName];
      const nodeAssets = assetResources[nodeEnvironmentName];

      if (!browserAssets || !nodeAssets) {
        return;
      }

      try {
        updateStatsAndManifest(nodeAssets, browserAssets, distOutputDir);
      } catch (err) {
        logger.error(err);
      }
    };

    api.onDevCompileDone(() => {
      generateMergedStatsAndManifest();
    });

    api.onAfterBuild(() => {
      generateMergedStatsAndManifest();
    });
  },
});

export { createModuleFederationConfig } from '@module-federation/sdk';

export { TreeShakingSharedPlugin };
