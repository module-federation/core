import { isRequiredVersion } from '@module-federation/sdk';
import type {
  Exposes,
  ExposesConfig,
  ModuleFederationPluginOptions,
  Shared,
  SharedConfig,
} from '@rspack/core';

import type { LynxRuntimePluginOptions } from './runtimeCore';

export interface ExposedLayers {
  BACKGROUND: string;
  MAIN_THREAD: string;
}

interface LynxRemoteBundleBaseOptions {
  /** Output basename ending in `.lynx.bundle`. Defaults to `<federation-name>.lynx.bundle`. */
  filename?: string;
  /** Lynx engine version passed to the external bundle encoder. Defaults to `3.7`. */
  engineVersion?: string;
  /**
   * Keep ordinary Rspeedy entry bundles beside federation artifacts. Disable
   * only for a dedicated remote environment whose source entry is disposable.
   *
   * @defaultValue `true`
   */
  preserveSourceEntryBundles?: boolean;
}

export interface LynxNativeRemoteBundleOptions extends LynxRemoteBundleBaseOptions {
  /** Emit native Lynx bundles using `@lynx-js/tasm`. */
  target: 'lynx';
  /**
   * Keep paired UI bundles separate (`split`) or embed background-only module
   * chunks in the container (`single`). ReactLynx UI exposures require split.
   *
   * @defaultValue `'split'`
   */
  chunking?: 'split' | 'single';
}

export interface LynxWebRemoteBundleOptions extends LynxRemoteBundleBaseOptions {
  /** Emit a Lynx for Web bundle containing background and main-thread sections. */
  target: 'web';
  /** Paired ReactLynx exposure roots require independently loadable bundles. */
  chunking?: 'split';
}

export type LynxRemoteBundleOptions =
  | LynxNativeRemoteBundleOptions
  | LynxWebRemoteBundleOptions;

export type LynxSharedRealm = 'background' | 'main-thread';

export interface LynxSharedConfig extends SharedConfig {
  /** Select the Lynx JavaScript realm without depending on DSL layer names. */
  realm?: LynxSharedRealm;
}

export type LynxShared =
  | string
  | Record<string, string | LynxSharedConfig>
  | Array<string | Record<string, string | LynxSharedConfig>>;

export type LynxModuleFederationOptions = Omit<
  ModuleFederationPluginOptions,
  'shared'
> & {
  shared?: LynxShared;
};

export interface LynxModuleFederationAdapterOptions {
  /** Only apply federation to these Rsbuild environments. */
  environment?: string | string[];
  /** Default Rspack layer for exposes and shared modules. */
  layer?: string;
  /** Emit a manifest-addressable native or web external bundle. */
  remoteBundle?: LynxRemoteBundleOptions;
  /** Enable main-thread federation. */
  mainThread?: boolean;
  /** Override the runtime transport plugin module. */
  runtimePlugin?: string;
  /** Options passed to the Lynx runtime transport plugin. */
  runtimePluginOptions?: LynxRuntimePluginOptions;
}

export const shouldApplyToEnvironment = (
  configuredEnvironment: string | string[] | undefined,
  environmentName: string,
): boolean => {
  if (!configuredEnvironment) {
    return true;
  }

  return Array.isArray(configuredEnvironment)
    ? configuredEnvironment.includes(environmentName)
    : configuredEnvironment === environmentName;
};

export const validateLayers = (
  layers: ExposedLayers | undefined,
): ExposedLayers => {
  if (
    !layers ||
    typeof layers.BACKGROUND !== 'string' ||
    !layers.BACKGROUND ||
    typeof layers.MAIN_THREAD !== 'string' ||
    !layers.MAIN_THREAD ||
    layers.BACKGROUND === layers.MAIN_THREAD
  ) {
    throw new Error(
      '@module-federation/lynx requires exposed `LAYERS` with distinct string `BACKGROUND` and `MAIN_THREAD` values. Install a Lynx DSL plugin such as `pluginReactLynx` before it.',
    );
  }

  return layers;
};

export const normalizeLynxExposes = (
  exposes: Exposes | undefined,
  defaultLayer: string,
): Exposes | undefined => {
  if (!exposes) {
    return undefined;
  }

  const normalized: Record<string, ExposesConfig> = {};
  for (const item of Array.isArray(exposes) ? exposes : [exposes]) {
    if (typeof item === 'string') {
      normalized[item] = { import: item, layer: defaultLayer };
      continue;
    }

    for (const [key, value] of Object.entries(item)) {
      normalized[key] =
        typeof value === 'string' || Array.isArray(value)
          ? { import: value, layer: defaultLayer }
          : { ...value, layer: value.layer ?? defaultLayer };
    }
  }

  return normalized;
};

type SharedNormalizationContext =
  | {
      defaultLayer: string;
      isolateShareScope: false;
      layers?: ExposedLayers;
    }
  | {
      activeRealmLayers: readonly string[];
      defaultLayer: string;
      isolateShareScope: true;
      layers: ExposedLayers;
      shareScope: ModuleFederationPluginOptions['shareScope'];
    };

const getRealmLayer = (
  realm: LynxSharedConfig['realm'],
  layers: ExposedLayers | undefined,
): string | undefined => {
  if (realm === 'background') return layers?.BACKGROUND;
  if (realm === 'main-thread') return layers?.MAIN_THREAD;
  return undefined;
};

const getShareScopeLayer = (
  realmLayer: string | undefined,
  issuerLayer: string,
  layers: ExposedLayers,
): string => {
  if (realmLayer) return realmLayer;
  if (issuerLayer === layers.MAIN_THREAD) return layers.MAIN_THREAD;
  if (issuerLayer === layers.BACKGROUND) return layers.BACKGROUND;
  return layers.BACKGROUND;
};

const normalizeSharedValue = (
  key: string,
  value: string | LynxSharedConfig,
  context: SharedNormalizationContext,
): SharedConfig => {
  const config: LynxSharedConfig =
    typeof value === 'string'
      ? value === key || !isRequiredVersion(value)
        ? { import: value }
        : { import: key, requiredVersion: value }
      : value;
  const { realm, ...sharedConfig } = config;
  const realmLayer = getRealmLayer(realm, context.layers);
  if (realm && !realmLayer) {
    throw new Error(
      `@module-federation/lynx cannot resolve shared realm "${realm}" without exposed Lynx layers.`,
    );
  }
  if (
    realmLayer &&
    ((sharedConfig.layer && sharedConfig.layer !== realmLayer) ||
      (sharedConfig.issuerLayer && sharedConfig.issuerLayer !== realmLayer))
  ) {
    throw new Error(
      `@module-federation/lynx shared module "${key}" cannot combine realm "${realm}" with a different layer or issuerLayer.`,
    );
  }
  const layer = sharedConfig.layer ?? realmLayer ?? context.defaultLayer;
  const issuerLayer =
    sharedConfig.issuerLayer ?? realmLayer ?? context.defaultLayer;
  let scopedShareScopes: string[] | undefined;
  if (context.isolateShareScope) {
    const shareScopeLayer = getShareScopeLayer(
      realmLayer,
      issuerLayer,
      context.layers,
    );
    if (!context.activeRealmLayers.includes(shareScopeLayer)) {
      throw new Error(
        `@module-federation/lynx shared module "${key}" uses inactive realm layer "${shareScopeLayer}". Enable its Lynx realm or choose one of: ${context.activeRealmLayers.join(', ')}.`,
      );
    }
    const shareScope = config.shareScope ?? context.shareScope ?? 'default';
    scopedShareScopes = (
      Array.isArray(shareScope) ? shareScope : [shareScope]
    ).map((scope) => `${scope}:${shareScopeLayer}`);
  }

  return {
    ...sharedConfig,
    layer,
    issuerLayer,
    ...(scopedShareScopes ? { shareScope: scopedShareScopes } : {}),
  };
};

const normalizeSharedItem = (
  item: string | Record<string, string | LynxSharedConfig>,
  context: SharedNormalizationContext,
): Record<string, SharedConfig> => {
  if (typeof item === 'string') {
    return {
      [item]: normalizeSharedValue(item, item, context),
    };
  }

  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key,
      normalizeSharedValue(key, value, context),
    ]),
  );
};

export const normalizeLynxShared = (
  shared: LynxShared | undefined,
  defaultLayer: string,
  layers?: ExposedLayers,
): Shared | undefined => {
  if (!shared) {
    return undefined;
  }

  const context: SharedNormalizationContext = {
    defaultLayer,
    isolateShareScope: false,
    layers,
  };
  return Array.isArray(shared)
    ? shared.map((item) => normalizeSharedItem(item, context))
    : normalizeSharedItem(shared, context);
};

export const normalizeRealmScopedShared = (
  shared: LynxShared | undefined,
  layers: ExposedLayers,
  defaultLayer = layers.BACKGROUND,
  activeRealmLayers: readonly string[] = [
    layers.BACKGROUND,
    layers.MAIN_THREAD,
  ],
  shareScope?: ModuleFederationPluginOptions['shareScope'],
): Shared | undefined => {
  if (!shared) {
    return undefined;
  }

  const items = Array.isArray(shared) ? shared : [shared];
  const context: SharedNormalizationContext = {
    activeRealmLayers,
    defaultLayer,
    isolateShareScope: true,
    layers,
    shareScope,
  };
  return items.map((item) => normalizeSharedItem(item, context));
};

export const getLynxShareScopes = (
  shareScope: ModuleFederationPluginOptions['shareScope'],
  layers: ExposedLayers,
  activeRealmLayers: readonly string[] = [
    layers.BACKGROUND,
    layers.MAIN_THREAD,
  ],
): string[] =>
  (Array.isArray(shareScope) ? shareScope : [shareScope ?? 'default']).flatMap(
    (scope) => activeRealmLayers.map((layer) => `${scope}:${layer}`),
  );

type Remotes = NonNullable<ModuleFederationPluginOptions['remotes']>;
type RemotesObject = Exclude<Remotes, unknown[]>;

const normalizeRemotesObject = (
  remotes: RemotesObject,
  layers: ExposedLayers,
  activeRealmLayers: readonly string[],
): RemotesObject =>
  Object.fromEntries(
    Object.entries(remotes).map(([alias, value]) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return [alias, value];
      }
      const config = value as { shareScope?: string | string[] };
      return [
        alias,
        config.shareScope === undefined
          ? config
          : {
              ...config,
              shareScope: getLynxShareScopes(
                config.shareScope,
                layers,
                activeRealmLayers,
              ),
            },
      ];
    }),
  ) as RemotesObject;

export const normalizeRealmScopedRemotes = (
  remotes: ModuleFederationPluginOptions['remotes'],
  layers: ExposedLayers,
  activeRealmLayers: readonly string[],
): ModuleFederationPluginOptions['remotes'] => {
  if (!remotes) return remotes;
  if (Array.isArray(remotes)) {
    return remotes.map((remote) =>
      typeof remote === 'string'
        ? remote
        : normalizeRemotesObject(remote, layers, activeRealmLayers),
    );
  }
  return normalizeRemotesObject(remotes, layers, activeRealmLayers);
};

export const resolveRuntimePluginOptions = (
  options: LynxRuntimePluginOptions | undefined,
  layers: ExposedLayers,
): LynxRuntimePluginOptions => ({
  ...options,
  realmLayers: {
    background: layers.BACKGROUND,
    'main-thread': layers.MAIN_THREAD,
  },
});

export const injectRuntimePlugin = (
  runtimePlugins: ModuleFederationPluginOptions['runtimePlugins'],
  runtimePlugin: string,
  runtimePluginOptions: LynxRuntimePluginOptions | undefined,
): NonNullable<ModuleFederationPluginOptions['runtimePlugins']> => {
  const plugins = runtimePlugins ?? [];
  const useTuples =
    runtimePluginOptions !== undefined || plugins.some(Array.isArray);
  let hasRuntimePlugin = false;
  const normalizedPlugins = plugins.map((plugin) => {
    const pluginPath = Array.isArray(plugin) ? plugin[0] : plugin;
    if (pluginPath !== runtimePlugin) {
      return useTuples && !Array.isArray(plugin) ? [plugin, {}] : plugin;
    }

    hasRuntimePlugin = true;
    if (!useTuples) return plugin;
    const existingOptions = Array.isArray(plugin) ? plugin[1] : undefined;
    return [runtimePlugin, { ...existingOptions, ...runtimePluginOptions }];
  });

  if (hasRuntimePlugin) {
    return normalizedPlugins as NonNullable<
      ModuleFederationPluginOptions['runtimePlugins']
    >;
  }
  if (useTuples) {
    return [
      ...normalizedPlugins,
      [runtimePlugin, runtimePluginOptions ?? {}],
    ] as [string, Record<string, unknown>][];
  }

  return [...plugins, runtimePlugin] as string[];
};

export const getRemoteBundleOptions = (
  adapterOptions: LynxModuleFederationAdapterOptions,
): LynxRemoteBundleOptions | undefined => adapterOptions.remoteBundle;

export const createFederationOptions = (
  options: LynxModuleFederationOptions,
  exposes: Exposes | undefined,
  shared: Shared | undefined,
  runtimePlugin: string,
  runtimePluginOptions: LynxRuntimePluginOptions | undefined,
): ModuleFederationPluginOptions => ({
  ...options,
  exposes,
  shared,
  filename: options.filename ?? 'remoteEntry.js',
  library: options.library ?? { type: 'commonjs-module' },
  remoteType: options.remoteType ?? 'script',
  experiments: {
    ...options.experiments,
    asyncStartup: options.experiments?.asyncStartup ?? true,
  },
  runtimePlugins: injectRuntimePlugin(
    options.runtimePlugins,
    runtimePlugin,
    runtimePluginOptions,
  ),
});
