import type {
  Compiler,
  Configuration,
  Exposes,
  ExposesConfig,
} from '@rspack/core';
import { getManifestFileName } from '@module-federation/sdk';

import {
  createLynxChunkLoadingMatcherPlugin,
  type LynxTemplatePluginApi,
} from './chunkLoadingMatcher';
import { createCompilerModuleFederationPlugin } from './compilerFederation';
import { createLynxExternalBundlePlugin } from './externalBundle';
import {
  createFederationOptions,
  getLynxShareScopes,
  normalizeLynxExposes,
  normalizeLynxShared,
  normalizeSharedForBothLayers,
  type ExposedLayers,
  type LynxModuleFederationAdapterOptions,
  type LynxModuleFederationOptions,
  type LynxRemoteBundleOptions,
} from './pluginOptions';
import { createLynxRemoteManifestPlugin } from './remoteManifest';
import { MAIN_THREAD_EXPOSE_SUFFIX } from './runtimeCore';
import { getLynxWebEncodeMode } from './webEncode';

const hasExposes = (exposes: Exposes | undefined): boolean => {
  if (!exposes) {
    return false;
  }

  return Array.isArray(exposes)
    ? exposes.some(
        (item) => typeof item === 'string' || Object.keys(item).length > 0,
      )
    : Object.keys(exposes).length > 0;
};

const findConflictingExposeLayer = (
  exposes: Exposes,
  backgroundLayer: string,
): string | undefined => {
  for (const item of Array.isArray(exposes) ? exposes : [exposes]) {
    if (typeof item === 'string') {
      continue;
    }

    for (const value of Object.values(item)) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value.layer !== undefined &&
        value.layer !== backgroundLayer
      ) {
        return value.layer;
      }
    }
  }

  return undefined;
};

const findReservedExposeKey = (
  exposes: Exposes,
  suffix: string,
): string | undefined => {
  for (const item of Array.isArray(exposes) ? exposes : [exposes]) {
    const keys = typeof item === 'string' ? [item] : Object.keys(item);
    const reservedKey = keys.find((key) => key.endsWith(suffix));
    if (reservedKey) {
      return reservedKey;
    }
  }

  return undefined;
};

const toChunkName = (key: string): string => {
  const name = key.replace(/^\.\//, '').replace(/[^A-Za-z0-9_-]+/g, '_');
  return name || 'expose';
};

const assertUniqueChunkNames = (exposes: Exposes): void => {
  const normalized = normalizeLynxExposes(exposes, '') as Record<
    string,
    ExposesConfig
  >;
  const keysByChunkName = new Map<string, string>();
  for (const key of Object.keys(normalized)) {
    const chunkName = toChunkName(key);
    const previousKey = keysByChunkName.get(chunkName);
    if (previousKey) {
      throw new Error(
        `@module-federation/lynx expose keys "${previousKey}" and "${key}" both map to chunk name "${chunkName}"; rename one expose to keep lazy bundle names unique.`,
      );
    }
    keysByChunkName.set(chunkName, key);
  }
};

const createRemoteExposes = (
  exposes: Exposes,
  layer: string,
  prefix: string,
  keySuffix = '',
): Record<string, ExposesConfig> => {
  const normalized = normalizeLynxExposes(exposes, layer) as Record<
    string,
    ExposesConfig
  >;

  return Object.fromEntries(
    Object.entries(normalized).map(([key, value]) => [
      `${key}${keySuffix}`,
      {
        ...value,
        layer,
        name: `${prefix}${toChunkName(key)}`,
      },
    ]),
  );
};

const isModuleInLayer = (module: unknown, layer: string): boolean => {
  return (module as { layer?: string }).layer === layer;
};

const createWebRemoteAssetsPlugin = (
  mainThreadChunks: string[],
  backgroundEntry: string,
  mainThreadEntry: string,
  backgroundChunkPrefix: string,
  mainThreadLayer: string,
) => ({
  apply(compiler: Compiler) {
    const pluginName = 'LynxModuleFederationMainThreadChunks';
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage:
            compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 2,
        },
        () => {
          mainThreadChunks.length = 0;
          const entryAsset = compilation.getAsset(backgroundEntry);
          if (!entryAsset) {
            throw new Error(
              `@module-federation/lynx could not find generated container asset "${backgroundEntry}".`,
            );
          }
          compilation.emitAsset(
            mainThreadEntry,
            entryAsset.source,
            entryAsset.info,
          );
          mainThreadChunks.push(mainThreadEntry);

          for (const chunk of compilation.chunks) {
            const containsMainThreadModule = Array.from(
              compilation.chunkGraph.getChunkModulesIterable(chunk),
            ).some((module) => isModuleInLayer(module, mainThreadLayer));
            const containsBackgroundExpose =
              typeof chunk.name === 'string' &&
              chunk.name.startsWith(backgroundChunkPrefix);
            if (!containsMainThreadModule && !containsBackgroundExpose) {
              continue;
            }

            for (const filename of chunk.files) {
              if (filename.endsWith('.js') && filename !== backgroundEntry) {
                mainThreadChunks.push(filename);
                const asset = compilation.getAsset(filename);
                if (asset) {
                  compilation.updateAsset(
                    filename,
                    containsMainThreadModule
                      ? new compiler.webpack.sources.ConcatSource(
                          '(function (globDynamicComponentEntry) {\n',
                          '  const module = { exports: {} };\n',
                          '  const exports = module.exports;\n',
                          asset.source,
                          '\n  module.exports.__lynx_dynamic_component_entry__ = globDynamicComponentEntry;\n',
                          '  return module.exports;\n})',
                        )
                      : new compiler.webpack.sources.ConcatSource(
                          asset.source,
                          "\nif (typeof globDynamicComponentEntry !== 'string') { throw new Error('Lynx DynamicComponent entry identity is unavailable.'); }\n",
                          'exports.__lynx_dynamic_component_entry__ = globDynamicComponentEntry;\n',
                        ),
                    {
                      ...asset.info,
                      ...(containsMainThreadModule
                        ? { 'lynx:main-thread': true }
                        : {}),
                    },
                  );
                }
              }
            }
          }
        },
      );
    });
  },
});

export const configureRemoteBundle = async (
  config: Configuration,
  options: LynxModuleFederationOptions,
  adapterOptions: LynxModuleFederationAdapterOptions,
  layers: ExposedLayers,
  remoteBundle: LynxRemoteBundleOptions,
  runtimePlugin: string,
  lynxTemplatePlugin?: LynxTemplatePluginApi,
): Promise<void> => {
  if (!hasExposes(options.exposes)) {
    throw new Error(
      '@module-federation/lynx `remoteBundle` requires at least one expose.',
    );
  }
  if (remoteBundle.target !== 'lynx' && remoteBundle.target !== 'web') {
    throw new Error(
      '@module-federation/lynx `remoteBundle.target` must be either `"lynx"` or `"web"`.',
    );
  }
  if (
    remoteBundle.target === 'web' &&
    (remoteBundle as { chunking?: string }).chunking === 'single'
  ) {
    throw new Error(
      '@module-federation/lynx web remotes require `chunking: "split"`; one external bundle has only one main-thread root and cannot activate independently scoped ReactLynx exposure roots.',
    );
  }
  if (
    remoteBundle.filename !== undefined &&
    !remoteBundle.filename.endsWith('.lynx.bundle')
  ) {
    throw new Error(
      '@module-federation/lynx `remoteBundle.filename` must end with `.lynx.bundle`.',
    );
  }
  if (options.filename !== undefined) {
    throw new Error(
      '@module-federation/lynx `remoteBundle` manages container filenames; remove `options.filename`.',
    );
  }
  if (options.library && options.library.type !== 'commonjs-module') {
    throw new Error(
      '@module-federation/lynx `remoteBundle` requires `library.type: "commonjs-module"`.',
    );
  }
  if (options.runtime !== undefined) {
    throw new Error(
      '@module-federation/lynx `remoteBundle` manages the container runtime; remove `options.runtime`.',
    );
  }
  if (options.manifest === false) {
    throw new Error(
      '@module-federation/lynx `remoteBundle` requires the Module Federation manifest; remove `manifest: false`.',
    );
  }
  if (adapterOptions.layer && adapterOptions.layer !== layers.BACKGROUND) {
    throw new Error(
      '@module-federation/lynx `remoteBundle` requires the adapter layer to be `LAYERS.BACKGROUND`.',
    );
  }

  const conflictingLayer = findConflictingExposeLayer(
    options.exposes!,
    layers.BACKGROUND,
  );
  if (conflictingLayer) {
    throw new Error(
      `@module-federation/lynx \`remoteBundle\` owns expose layers; remove the explicit \`${conflictingLayer}\` expose layer.`,
    );
  }
  assertUniqueChunkNames(options.exposes!);

  const reservedExposeKey = findReservedExposeKey(
    options.exposes!,
    MAIN_THREAD_EXPOSE_SUFFIX,
  );
  if (reservedExposeKey) {
    throw new Error(
      `@module-federation/lynx remoteBundle reserves expose keys ending in "${MAIN_THREAD_EXPOSE_SUFFIX}"; rename "${reservedExposeKey}".`,
    );
  }

  const bundleFileName = remoteBundle.filename ?? `${options.name}.lynx.bundle`;
  const backgroundEntry = `${options.name}.js`;
  const mainThreadEntry = `${options.name}__main-thread.js`;
  const backgroundChunkPrefix = `${options.name}__background_`;
  const mainThreadChunkPrefix = `${options.name}__main-thread__`;
  const webTarget = remoteBundle.target === 'web';
  const remoteExposes = webTarget
    ? {
        ...createRemoteExposes(
          options.exposes!,
          layers.BACKGROUND,
          backgroundChunkPrefix,
        ),
        ...createRemoteExposes(
          options.exposes!,
          layers.MAIN_THREAD,
          mainThreadChunkPrefix,
          MAIN_THREAD_EXPOSE_SUFFIX,
        ),
      }
    : createRemoteExposes(
        options.exposes!,
        layers.BACKGROUND,
        backgroundChunkPrefix,
      );
  const remoteShared = webTarget
    ? normalizeSharedForBothLayers(options.shared, layers)
    : normalizeLynxShared(options.shared, layers.BACKGROUND, layers);
  const federationOptions = {
    ...createFederationOptions(
      webTarget
        ? {
            ...options,
            shareScope: getLynxShareScopes(options.shareScope, layers),
          }
        : options,
      remoteExposes,
      remoteShared,
      runtimePlugin,
      adapterOptions.runtimePluginOptions,
    ),
    manifest: options.manifest ?? true,
    filename: backgroundEntry,
    runtime: false as const,
  };
  const mainThreadChunks: string[] = [];
  const lazyBundleAssets = new Set<string>();
  const discardedTemplateAssets = new Set<string>();
  const { manifestFileName, statsFileName } = getManifestFileName(
    federationOptions.manifest,
  );
  const encode = webTarget
    ? getLynxWebEncodeMode()
    : ((await import('@lynx-js/tasm')).getEncodeMode() as (
        value: unknown,
      ) => Promise<{ buffer: Buffer }>);
  config.plugins ||= [];
  config.plugins.push(
    createCompilerModuleFederationPlugin(federationOptions),
    createLynxChunkLoadingMatcherPlugin(lynxTemplatePlugin, {
      backgroundOnlyRemote: !webTarget,
      chunking: remoteBundle.chunking ?? 'split',
      discardSourceEntryBundles:
        remoteBundle.preserveSourceEntryBundles === false,
      discardedTemplateAssets,
      includedChunkPrefixes: [
        backgroundChunkPrefix,
        ...(webTarget ? [mainThreadChunkPrefix] : []),
      ],
      lazyBundleAssets,
      remoteEntryName: options.name,
      ...(webTarget
        ? {
            pairedRealmChunkPrefixes: {
              background: backgroundChunkPrefix,
              mainThread: mainThreadChunkPrefix,
            },
            pairedRealmChunkSuffixes: {
              background: `-${layers.BACKGROUND.replace(/:/g, '__')}`,
              mainThread: `-${layers.MAIN_THREAD.replace(/:/g, '__')}`,
            },
          }
        : {}),
    }),
  );
  if (webTarget) {
    config.plugins.push(
      createWebRemoteAssetsPlugin(
        mainThreadChunks,
        backgroundEntry,
        mainThreadEntry,
        backgroundChunkPrefix,
        layers.MAIN_THREAD,
      ),
    );
  }
  config.plugins.push(
    createLynxExternalBundlePlugin({
      bundleFileName,
      chunking: remoteBundle.chunking ?? 'split',
      discardedTemplateAssets,
      encode,
      engineVersion: remoteBundle.engineVersion,
      entryAssets: [backgroundEntry, ...(webTarget ? [mainThreadEntry] : [])],
      entryName: options.name,
      includedChunkPrefixes: [
        backgroundChunkPrefix,
        ...(webTarget ? [mainThreadChunkPrefix] : []),
      ],
      lazyBundleAssets,
      mainThreadChunks,
      preservedAssets: [manifestFileName, statsFileName],
    }),
    createLynxRemoteManifestPlugin(federationOptions.manifest, bundleFileName),
  );
};
