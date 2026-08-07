import { dirname } from 'node:path';

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
  injectRuntimePlugin,
  normalizeLynxExposes,
  normalizeLynxShared,
  normalizeRealmScopedRemotes,
  normalizeRealmScopedShared,
  resolveRuntimePluginOptions,
  shouldApplyToEnvironment,
  validateLayers,
  type ExposedLayers,
  type LynxModuleFederationAdapterOptions,
  type LynxModuleFederationOptions,
} from './pluginOptions';
import { configureRemoteBundle } from './remoteBundle';
import type { LynxRuntimePluginOptions } from './runtimeCore';

export const LYNX_RUNTIME_PLUGIN = '@module-federation/lynx/runtimePlugin';
export const LYNX_REACT_RUNTIME_PLUGIN =
  '@module-federation/lynx/reactRuntimePlugin';

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

      api.modifyBundlerChain(async (chain, { environment }) => {
        const remoteBundle = getRemoteBundleOptions(adapterOptions);
        if (
          !remoteBundle ||
          !shouldApplyToEnvironment(
            adapterOptions.environment,
            environment.name,
          )
        ) {
          return;
        }

        const { LynxCacheEventsPlugin } =
          await import('@lynx-js/cache-events-webpack-plugin');
        chain
          .plugin('lynx:cache-events')
          .use(LynxCacheEventsPlugin, [{ setupListTransformer: () => [] }]);

        if (remoteBundle.chunking === 'single') {
          return;
        }

        const reactResolver = api.useExposed<{
          resolve(request: string): Promise<string>;
        }>(Symbol.for('@lynx-js/react/internal:resolve'));
        if (!reactResolver) {
          return;
        }

        const [reactEntry, lazyImportEntry] = await Promise.all([
          reactResolver.resolve('@lynx-js/react'),
          reactResolver.resolve('@lynx-js/react/experimental/lazy/import'),
        ]);
        if (dirname(reactEntry) !== dirname(lazyImportEntry)) {
          throw new Error(
            '@module-federation/lynx split ReactLynx remote bundles require `pluginReactLynx({ experimental_isLazyBundle: true })` so exposed components use the host-backed ReactLynx lazy runtime.',
          );
        }
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
        const hasReactLynx = Boolean(
          api.useExposed(Symbol.for('@lynx-js/react/internal:resolve')),
        );
        const federationOptions = hasReactLynx
          ? {
              ...options,
              runtimePlugins: injectRuntimePlugin(
                options.runtimePlugins,
                LYNX_REACT_RUNTIME_PLUGIN,
                undefined,
                'prepend',
              ),
            }
          : options;
        const lynxTemplatePlugin = api.useExposed<{
          LynxTemplatePlugin: LynxTemplatePluginApi;
        }>(Symbol.for('LynxTemplatePlugin'))?.LynxTemplatePlugin;
        const remoteBundle = getRemoteBundleOptions(adapterOptions);
        const mainThreadEnabled =
          Boolean(adapterOptions.mainThread) || remoteBundle?.target === 'web';
        const activeRealmLayers = mainThreadEnabled
          ? [layers.BACKGROUND, layers.MAIN_THREAD]
          : [layers.BACKGROUND];

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
          const { LynxCacheEventsPlugin } =
            await import('@lynx-js/cache-events-webpack-plugin');
          config.plugins = config.plugins?.map((plugin) =>
            plugin &&
            typeof plugin === 'object' &&
            plugin.constructor.name === LynxCacheEventsPlugin.name
              ? new LynxCacheEventsPlugin({ setupListTransformer: () => [] })
              : plugin,
          );
          await configureRemoteBundle(
            config as unknown as Configuration,
            federationOptions,
            adapterOptions,
            layers,
            remoteBundle,
            runtimePlugin,
            lynxTemplatePlugin,
          );
          return config;
        }

        const normalizedFederationOptions = createFederationOptions(
          {
            ...federationOptions,
            remotes: normalizeRealmScopedRemotes(
              federationOptions.remotes,
              layers,
              activeRealmLayers,
            ),
            shareScope: getLynxShareScopes(
              federationOptions.shareScope,
              layers,
              activeRealmLayers,
            ),
          },
          normalizeLynxExposes(options.exposes, defaultLayer),
          normalizeRealmScopedShared(
            options.shared,
            layers,
            defaultLayer,
            activeRealmLayers,
            options.shareScope,
          ),
          runtimePlugin,
          resolveRuntimePluginOptions(
            adapterOptions.runtimePluginOptions,
            layers,
          ),
        );

        config.plugins ||= [];
        config.plugins.push(
          createCompilerModuleFederationPlugin(normalizedFederationOptions),
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
