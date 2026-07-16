import {
  LynxCacheEventsPlugin,
  type LynxCacheEventsPluginOptions,
} from '@lynx-js/cache-events-webpack-plugin';
import type { Configuration } from '@rspack/core';
import type { RsbuildPlugin } from '@rsbuild/core';

import {
  createLynxChunkLoadingMatcherPlugin,
  type LynxTemplatePluginApi,
} from './chunkLoadingMatcher';
import { createCompilerModuleFederationPlugin } from './compilerFederation';
import {
  createFederationOptions,
  getLynxShareScopes,
  getRemoteBundleOptions,
  normalizeLynxExposes,
  normalizeLynxShared,
  normalizeSharedForBothLayers,
  shouldApplyToEnvironment,
  validateLayers,
  type ExposedLayers,
  type LynxModuleFederationAdapterOptions,
  type LynxModuleFederationOptions,
} from './pluginOptions';
import { configureRemoteBundle } from './remoteBundle';
import type { LynxRuntimePluginOptions } from './runtimeCore';

export const LYNX_RUNTIME_PLUGIN = '@module-federation/lynx/runtimePlugin';

const disableRemoteEntryEventCaching = (config: Configuration): void => {
  const index = config.plugins?.findIndex(
    (plugin) =>
      plugin !== false &&
      plugin !== null &&
      plugin !== undefined &&
      plugin instanceof LynxCacheEventsPlugin,
  );
  if (index === undefined || index < 0) {
    return;
  }

  const current = config.plugins![index] as LynxCacheEventsPlugin & {
    options?: LynxCacheEventsPluginOptions;
  };
  config.plugins![index] = new LynxCacheEventsPlugin({
    ...current.options,
    setupListTransformer: () => [],
  });
};

export { normalizeLynxExposes, normalizeLynxShared };
export type {
  LynxModuleFederationAdapterOptions,
  LynxModuleFederationOptions,
  LynxNativeRemoteBundleOptions,
  LynxRemoteBundleOptions,
  LynxShared,
  LynxSharedConfig,
  LynxSharedRealm,
  LynxWebRemoteBundleOptions,
} from './pluginOptions';
export type { LynxRuntimePluginOptions } from './runtimeCore';

export const pluginLynxModuleFederation = (
  options: LynxModuleFederationOptions,
  adapterOptions: LynxModuleFederationAdapterOptions = {},
): RsbuildPlugin => {
  if (!options?.name) {
    throw new Error(
      'The module federation option "name" is required in @module-federation/lynx.',
    );
  }

  return {
    name: 'module-federation:lynx',
    setup(api) {
      api.modifyEnvironmentConfig((config, { name }) => {
        if (!shouldApplyToEnvironment(adapterOptions.environment, name)) {
          return config;
        }
        config.source.include = [
          ...(config.source.include || []),
          /@module-federation[\\/]/,
        ];
        return config;
      });

      api.modifyRspackConfig(async (config, { environment }) => {
        if (
          !shouldApplyToEnvironment(
            adapterOptions.environment,
            environment.name,
          )
        ) {
          return config;
        }

        const layers = validateLayers(
          api.useExposed<ExposedLayers>(Symbol.for('LAYERS')),
        );
        const defaultLayer = adapterOptions.layer ?? layers.BACKGROUND;
        const runtimePlugin =
          adapterOptions.runtimePlugin ?? LYNX_RUNTIME_PLUGIN;
        const lynxTemplatePlugin = api.useExposed<{
          LynxTemplatePlugin: LynxTemplatePluginApi;
        }>(Symbol.for('LynxTemplatePlugin'))?.LynxTemplatePlugin;
        const remoteBundle = getRemoteBundleOptions(adapterOptions);
        const mainThreadEnabled =
          Boolean(adapterOptions.mainThread) || remoteBundle?.target === 'web';

        config.output ||= {};
        config.output.chunkLoading ??= 'lynx';
        config.output.chunkFormat ??= 'commonjs';
        config.output.iife ??= false;
        config.output.uniqueName ??= options.name;
        config.experiments ||= {};
        const experiments = config.experiments as typeof config.experiments & {
          layers?: boolean;
        };
        experiments.layers ??= true;

        if (remoteBundle) {
          disableRemoteEntryEventCaching(config as unknown as Configuration);
          await configureRemoteBundle(
            config as unknown as Configuration,
            options,
            adapterOptions,
            layers,
            remoteBundle,
            runtimePlugin,
            lynxTemplatePlugin,
          );
          return config;
        }

        const federationOptions = createFederationOptions(
          mainThreadEnabled
            ? {
                ...options,
                shareScope: getLynxShareScopes(options.shareScope, layers),
              }
            : options,
          normalizeLynxExposes(options.exposes, defaultLayer),
          mainThreadEnabled
            ? normalizeSharedForBothLayers(options.shared, layers)
            : normalizeLynxShared(options.shared, defaultLayer, layers),
          runtimePlugin,
          adapterOptions.runtimePluginOptions,
        );

        config.plugins ||= [];
        config.plugins.push(
          createCompilerModuleFederationPlugin(federationOptions),
          createLynxChunkLoadingMatcherPlugin(lynxTemplatePlugin, {
            pairedRealmChunkSuffixes: {
              background: `-${layers.BACKGROUND.replace(/:/g, '__')}`,
              mainThread: `-${layers.MAIN_THREAD.replace(/:/g, '__')}`,
            },
          }),
        );

        return config;
      });
    },
  };
};
