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
  normalizeRealmScopedRemotes,
  normalizeRealmScopedShared,
  resolveRuntimePluginOptions,
  type ExposedLayers,
  type LynxModuleFederationAdapterOptions,
  type LynxModuleFederationOptions,
  type LynxRemoteBundleOptions,
} from './pluginOptions';
import { createLynxRemoteManifestPlugin } from './remoteManifest';
import { MAIN_THREAD_EXPOSE_SUFFIX } from './runtimeCore';
import { getLynxWebEncodeMode } from './webEncode';

interface RemoteBundlePlanBase {
  backgroundChunkPrefix: string;
  backgroundEntry: string;
  bundleFileName: string;
  entryAssets: string[];
  includedChunkPrefixes: string[];
}

type RemoteBundlePlan = RemoteBundlePlanBase &
  (
    | {
        chunking: 'single';
        mainThreadChunkPrefix: undefined;
        mainThreadEntry: undefined;
        mode: 'native-single';
      }
    | {
        chunking: 'split';
        mainThreadChunkPrefix: string;
        mainThreadEntry: undefined;
        mode: 'native-split';
      }
    | {
        chunking: 'split';
        mainThreadChunkPrefix: string;
        mainThreadEntry: string;
        mode: 'web-split';
      }
  );

const toSafeOutputName = (name: string): string => {
  const sanitizedName = name.replace(/[^A-Za-z0-9@_-]+/g, '_');
  let start = 0;
  let end = sanitizedName.length;
  while (start < end && sanitizedName[start] === '_') {
    start += 1;
  }
  while (end > start && sanitizedName[end - 1] === '_') {
    end -= 1;
  }
  const outputName = sanitizedName.slice(start, end) || 'remote';
  return /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(outputName)
    ? `_${outputName}`
    : outputName;
};

const normalizeRemoteBundlePlan = (
  name: string,
  remoteBundle: LynxRemoteBundleOptions,
): RemoteBundlePlan => {
  if (remoteBundle.target !== 'lynx' && remoteBundle.target !== 'web') {
    throw new Error(
      '@module-federation/lynx `remoteBundle.target` must be either `"lynx"` or `"web"`.',
    );
  }

  const chunking = remoteBundle.chunking ?? 'split';
  if (remoteBundle.target === 'web' && chunking === 'single') {
    throw new Error(
      '@module-federation/lynx web remotes require `chunking: "split"`; one external bundle has only one main-thread root and cannot activate independently scoped ReactLynx exposure roots.',
    );
  }

  const outputName = toSafeOutputName(name);
  const backgroundEntry = `${outputName}.js`;
  const backgroundChunkPrefix = `${outputName}__background_`;
  const bundleFileName = remoteBundle.filename ?? `${outputName}.lynx.bundle`;
  const basePlan = {
    backgroundChunkPrefix,
    backgroundEntry,
    bundleFileName,
  };
  if (chunking === 'single') {
    return {
      ...basePlan,
      chunking,
      entryAssets: [backgroundEntry],
      includedChunkPrefixes: [backgroundChunkPrefix],
      mainThreadChunkPrefix: undefined,
      mainThreadEntry: undefined,
      mode: 'native-single',
    };
  }

  const mainThreadChunkPrefix = `${outputName}__main-thread__`;
  const splitPlan = {
    ...basePlan,
    chunking,
    includedChunkPrefixes: [backgroundChunkPrefix, mainThreadChunkPrefix],
    mainThreadChunkPrefix,
  };
  if (remoteBundle.target === 'web') {
    const mainThreadEntry = `${outputName}__main-thread.js`;
    return {
      ...splitPlan,
      entryAssets: [backgroundEntry, mainThreadEntry],
      mainThreadEntry,
      mode: 'web-split',
    };
  }

  return {
    ...splitPlan,
    entryAssets: [backgroundEntry],
    mainThreadEntry: undefined,
    mode: 'native-split',
  };
};

const hasExposes = (exposes: Exposes | undefined): exposes is Exposes => {
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

const assertUniqueChunkNames = (exposes: Exposes): Map<string, string> => {
  const normalized = normalizeLynxExposes(exposes, '') as Record<
    string,
    ExposesConfig
  >;
  const keysByChunkName = new Map<string, string>();
  const chunkNamesByExpose = new Map<string, string>();
  for (const key of Object.keys(normalized)) {
    const chunkName = toChunkName(key);
    const previousKey = keysByChunkName.get(chunkName);
    if (previousKey) {
      throw new Error(
        `@module-federation/lynx expose keys "${previousKey}" and "${key}" both map to chunk name "${chunkName}"; rename one expose to keep lazy bundle names unique.`,
      );
    }
    keysByChunkName.set(chunkName, key);
    chunkNamesByExpose.set(key, chunkName);
  }
  return chunkNamesByExpose;
};

const createRemoteExposes = (
  exposes: Exposes,
  layer: string,
  prefix: string,
  keySuffix = '',
  chunkNameSuffix = '',
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
        name: `${prefix}${toChunkName(key)}${chunkNameSuffix}`,
      },
    ]),
  );
};

const isModuleInLayer = (module: unknown, layer: string): boolean => {
  return (module as { layer?: string }).layer === layer;
};

const classifyRemoteChunk = (
  modules: Iterable<unknown>,
  name: string | undefined,
  backgroundChunkPrefix: string,
  mainThreadLayer: string,
) => ({
  containsBackgroundExpose:
    typeof name === 'string' && name.startsWith(backgroundChunkPrefix),
  containsMainThreadModule: Array.from(modules).some((module) =>
    isModuleInLayer(module, mainThreadLayer),
  ),
});

const createRemoteAssetsPlugin = (
  pairedBundleChunks: string[],
  backgroundEntry: string,
  mainThreadEntry: string | undefined,
  backgroundChunkPrefix: string,
  mainThreadLayer: string,
) => ({
  apply(compiler: Compiler) {
    const pluginName = 'LynxModuleFederationPairedBundleChunks';
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: `${pluginName}BackgroundIdentity`,
          // ReactLynx adds debug metadata during ADDITIONS, then RuntimeWrapper
          // closes over `exports` at stage NONE. Inject the identity between them.
          stage:
            compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS + 1,
        },
        () => {
          for (const chunk of compilation.chunks) {
            const { containsBackgroundExpose, containsMainThreadModule } =
              classifyRemoteChunk(
                compilation.chunkGraph.getChunkModulesIterable(chunk),
                chunk.name,
                backgroundChunkPrefix,
                mainThreadLayer,
              );
            if (!containsBackgroundExpose || containsMainThreadModule) {
              continue;
            }

            for (const filename of chunk.files) {
              if (filename.endsWith('.js') && filename !== backgroundEntry) {
                const asset = compilation.getAsset(filename);
                if (asset) {
                  compilation.updateAsset(
                    filename,
                    new compiler.webpack.sources.ConcatSource(
                      asset.source,
                      "\nif (typeof globDynamicComponentEntry !== 'string') { throw new Error('Lynx DynamicComponent entry identity is unavailable.'); }\n",
                      'exports.__lynx_dynamic_component_entry__ = globDynamicComponentEntry;\n',
                    ),
                    asset.info,
                  );
                }
              }
            }
          }
        },
      );

      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage:
            compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 2,
        },
        () => {
          pairedBundleChunks.length = 0;
          if (mainThreadEntry) {
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
            pairedBundleChunks.push(mainThreadEntry);
          }

          for (const chunk of compilation.chunks) {
            const { containsBackgroundExpose, containsMainThreadModule } =
              classifyRemoteChunk(
                compilation.chunkGraph.getChunkModulesIterable(chunk),
                chunk.name,
                backgroundChunkPrefix,
                mainThreadLayer,
              );
            if (!containsMainThreadModule && !containsBackgroundExpose) {
              continue;
            }

            for (const filename of chunk.files) {
              if (filename.endsWith('.js') && filename !== backgroundEntry) {
                pairedBundleChunks.push(filename);
                const asset = compilation.getAsset(filename);
                if (asset && containsMainThreadModule) {
                  compilation.updateAsset(
                    filename,
                    new compiler.webpack.sources.ConcatSource(
                      '(function (globDynamicComponentEntry) {\n',
                      '  const module = { exports: {} };\n',
                      '  const exports = module.exports;\n',
                      asset.source,
                      '\n  module.exports.__lynx_dynamic_component_entry__ = globDynamicComponentEntry;\n',
                      '  return module.exports;\n})',
                    ),
                    {
                      ...asset.info,
                      'lynx:main-thread': true,
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
  const exposes = options.exposes;
  if (!hasExposes(exposes)) {
    throw new Error(
      '@module-federation/lynx `remoteBundle` requires at least one expose.',
    );
  }
  const plan = normalizeRemoteBundlePlan(options.name, remoteBundle);
  if (
    remoteBundle.filename !== undefined &&
    !remoteBundle.filename.endsWith('.lynx.bundle')
  ) {
    throw new Error(
      '@module-federation/lynx `remoteBundle.filename` must end with `.lynx.bundle`.',
    );
  }
  if (remoteBundle.filename && /[\\/]/.test(remoteBundle.filename)) {
    throw new Error(
      '@module-federation/lynx `remoteBundle.filename` must be a basename without path separators so split lazy bundles resolve from the same output root.',
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
    exposes,
    layers.BACKGROUND,
  );
  if (conflictingLayer) {
    throw new Error(
      `@module-federation/lynx \`remoteBundle\` owns expose layers; remove the explicit \`${conflictingLayer}\` expose layer.`,
    );
  }
  const chunkNamesByExpose = assertUniqueChunkNames(exposes);

  const reservedExposeKey = findReservedExposeKey(
    exposes,
    MAIN_THREAD_EXPOSE_SUFFIX,
  );
  if (reservedExposeKey) {
    throw new Error(
      `@module-federation/lynx remoteBundle reserves expose keys ending in "${MAIN_THREAD_EXPOSE_SUFFIX}"; rename "${reservedExposeKey}".`,
    );
  }

  const pairedPlan = plan.mode === 'native-single' ? undefined : plan;
  const mainThreadChunkSuffix = `-${layers.MAIN_THREAD.replace(/:/g, '__')}`;
  const remoteExposes = pairedPlan
    ? {
        ...createRemoteExposes(
          exposes,
          layers.BACKGROUND,
          plan.backgroundChunkPrefix,
        ),
        ...createRemoteExposes(
          exposes,
          layers.MAIN_THREAD,
          pairedPlan.mainThreadChunkPrefix,
          MAIN_THREAD_EXPOSE_SUFFIX,
          mainThreadChunkSuffix,
        ),
      }
    : createRemoteExposes(
        exposes,
        layers.BACKGROUND,
        plan.backgroundChunkPrefix,
      );
  const activeRealmLayers = pairedPlan
    ? [layers.BACKGROUND, layers.MAIN_THREAD]
    : [layers.BACKGROUND];
  const remoteShared = normalizeRealmScopedShared(
    options.shared,
    layers,
    layers.BACKGROUND,
    activeRealmLayers,
    options.shareScope,
  );
  const federationOptions = {
    ...createFederationOptions(
      {
        ...options,
        remotes: normalizeRealmScopedRemotes(
          options.remotes,
          layers,
          activeRealmLayers,
        ),
        shareScope: getLynxShareScopes(
          options.shareScope,
          layers,
          activeRealmLayers,
        ),
      },
      remoteExposes,
      remoteShared,
      runtimePlugin,
      resolveRuntimePluginOptions(adapterOptions.runtimePluginOptions, layers),
    ),
    manifest: options.manifest ?? true,
    filename: plan.backgroundEntry,
    runtime: false as const,
  };
  const entryGlobalName =
    typeof federationOptions.library?.name === 'string'
      ? federationOptions.library.name
      : options.name;
  const entrySectionNames = new Map([[plan.backgroundEntry, entryGlobalName]]);
  if (plan.mainThreadEntry) {
    entrySectionNames.set(
      plan.mainThreadEntry,
      `${entryGlobalName}__main-thread`,
    );
  }
  const pairedBundleChunks: string[] = [];
  const lazyBundleAssets = new Set<string>();
  const lazyBundleAssetByExpose = new Map<string, string>();
  const exposeByExpectedLazyBundleChunk = new Map(
    Array.from(chunkNamesByExpose, ([expose, chunkName]) => [
      `${plan.backgroundChunkPrefix}${chunkName}`,
      expose,
    ]),
  );
  const discardedTemplateAssets = new Set<string>();
  const { manifestFileName, statsFileName } = getManifestFileName(
    federationOptions.manifest,
  );
  const encode =
    plan.mode === 'web-split'
      ? getLynxWebEncodeMode()
      : ((await import('@lynx-js/tasm')).getEncodeMode() as (
          value: unknown,
        ) => Promise<{ buffer: Buffer }>);
  config.plugins ||= [];
  config.plugins.push(
    createCompilerModuleFederationPlugin(federationOptions),
    createLynxChunkLoadingMatcherPlugin(lynxTemplatePlugin, {
      autoPublicPath: config.output?.publicPath === 'auto',
      backgroundOnlyRemote: !pairedPlan,
      chunking: plan.chunking,
      discardSourceEntryBundles:
        remoteBundle.preserveSourceEntryBundles === false,
      discardedTemplateAssets,
      includedChunkPrefixes: plan.includedChunkPrefixes,
      lazyBundleAssets,
      lazyBundleAssetByExpose,
      exposeByExpectedLazyBundleChunk,
      remoteEntryName: options.name,
      ...(pairedPlan
        ? {
            pairedRealmChunkPrefixes: {
              background: plan.backgroundChunkPrefix,
              mainThread: pairedPlan.mainThreadChunkPrefix,
            },
            pairedRealmChunkSuffixes: {
              background: `-${layers.BACKGROUND.replace(/:/g, '__')}`,
              mainThread: `-${layers.MAIN_THREAD.replace(/:/g, '__')}`,
            },
          }
        : {}),
    }),
  );
  if (pairedPlan) {
    config.plugins.push(
      createRemoteAssetsPlugin(
        pairedBundleChunks,
        plan.backgroundEntry,
        plan.mainThreadEntry,
        plan.backgroundChunkPrefix,
        layers.MAIN_THREAD,
      ),
    );
  }
  config.plugins.push(
    createLynxExternalBundlePlugin({
      bundleFileName: plan.bundleFileName,
      chunking: plan.chunking,
      discardedTemplateAssets,
      encode,
      engineVersion: remoteBundle.engineVersion,
      entryAssets: plan.entryAssets,
      entryName: options.name,
      entrySectionNames,
      includedChunkPrefixes: plan.includedChunkPrefixes,
      lazyBundleAssets,
      lazyBundleAssetByExpose,
      exposeByExpectedLazyBundleChunk,
      pairedBundleChunks,
      preservedAssets: [manifestFileName, statsFileName],
    }),
    createLynxRemoteManifestPlugin(
      federationOptions.manifest,
      plan.bundleFileName,
    ),
  );
};
