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

const normalizeSharedValue = (
  key: string,
  value: string | LynxSharedConfig,
  defaultLayer: string,
  isolateShareScope = false,
  layers?: ExposedLayers,
): SharedConfig => {
  const config: LynxSharedConfig =
    typeof value === 'string'
      ? value === key || !isRequiredVersion(value)
        ? { import: value }
        : { import: key, requiredVersion: value }
      : value;
  const { realm, ...sharedConfig } = config;
  const realmLayer =
    realm === 'background'
      ? layers?.BACKGROUND
      : realm === 'main-thread'
        ? layers?.MAIN_THREAD
        : undefined;
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
  const layer = sharedConfig.layer ?? realmLayer ?? defaultLayer;
  const issuerLayer = sharedConfig.issuerLayer ?? realmLayer ?? defaultLayer;

  return {
    ...sharedConfig,
    layer,
    issuerLayer,
    ...(isolateShareScope
      ? {
          shareScope: (Array.isArray(config.shareScope)
            ? config.shareScope
            : [config.shareScope ?? 'default']
          ).map((scope) => `${scope}:${issuerLayer}`),
        }
      : {}),
  };
};

const normalizeSharedItem = (
  item: string | Record<string, string | LynxSharedConfig>,
  defaultLayer: string,
  isolateShareScope = false,
  layers?: ExposedLayers,
): Record<string, SharedConfig> => {
  if (typeof item === 'string') {
    return {
      [item]: normalizeSharedValue(
        item,
        item,
        defaultLayer,
        isolateShareScope,
        layers,
      ),
    };
  }

  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key,
      normalizeSharedValue(key, value, defaultLayer, isolateShareScope, layers),
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

  return Array.isArray(shared)
    ? shared.map((item) =>
        normalizeSharedItem(item, defaultLayer, false, layers),
      )
    : normalizeSharedItem(shared, defaultLayer, false, layers);
};

export const normalizeSharedForBothLayers = (
  shared: LynxShared | undefined,
  layers: ExposedLayers,
): Shared | undefined => {
  if (!shared) {
    return undefined;
  }

  const items = Array.isArray(shared) ? shared : [shared];
  return items.map((item) =>
    normalizeSharedItem(item, layers.BACKGROUND, true, layers),
  );
};

export const getLynxShareScopes = (
  shareScope: ModuleFederationPluginOptions['shareScope'],
  layers: ExposedLayers,
): string[] =>
  (Array.isArray(shareScope) ? shareScope : [shareScope ?? 'default']).flatMap(
    (scope) => [
      `${scope}:${layers.BACKGROUND}`,
      `${scope}:${layers.MAIN_THREAD}`,
    ],
  );

export const injectRuntimePlugin = (
  runtimePlugins: ModuleFederationPluginOptions['runtimePlugins'],
  runtimePlugin: string,
  runtimePluginOptions: LynxRuntimePluginOptions | undefined,
): NonNullable<ModuleFederationPluginOptions['runtimePlugins']> => {
  const plugins = runtimePlugins ?? [];
  if (
    plugins.some((plugin) =>
      Array.isArray(plugin)
        ? plugin[0] === runtimePlugin
        : plugin === runtimePlugin,
    )
  ) {
    return plugins;
  }

  const useTuples =
    runtimePluginOptions !== undefined || plugins.some(Array.isArray);
  if (useTuples) {
    return [
      ...plugins.map((plugin) =>
        Array.isArray(plugin) ? plugin : [plugin, {}],
      ),
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
