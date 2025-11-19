import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export type ModuleFederationOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions;
export type RsbuildPluginOptions = Parameters<typeof pluginModuleFederation>[1];
type RspeedyPlugin = ReturnType<typeof pluginModuleFederation>;
type LayeredSharedConfig = sharePlugin.SharedConfig & {
  issuerLayer?: string;
  layer?: string;
  request?: string;
};

const RSPEEDY_LAYERS = {
  BACKGROUND: 'react:background',
  MAIN_THREAD: 'react:main-thread',
} as const;

const RSPEEDY_LAYERED_PACKAGES = [
  '@lynx-js/react',
  '@lynx-js/react/jsx-runtime',
  '@lynx-js/react/jsx-dev-runtime',
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
];

const RSPEEDY_SHARE_LAYERS = [
  undefined,
  RSPEEDY_LAYERS.BACKGROUND,
  RSPEEDY_LAYERS.MAIN_THREAD,
] as const;

const RSPEEDY_DEFAULT_SHARED = createRspeedyDefaultShared();

function createRspeedyDefaultShared(): moduleFederationPlugin.SharedObject {
  return RSPEEDY_LAYERED_PACKAGES.reduce(
    (acc, pkg) => ({
      ...acc,
      ...createLayeredSharedEntries(pkg),
    }),
    {} as moduleFederationPlugin.SharedObject,
  );
}

function createLayeredSharedEntries(
  request: string,
): moduleFederationPlugin.SharedObject {
  return RSPEEDY_SHARE_LAYERS.reduce((acc, layer) => {
    const key = layer ? `${request}::${layer}` : request;
    acc[key] = createSharedConfigForLayer(request, layer);
    return acc;
  }, {} as moduleFederationPlugin.SharedObject);
}

function createSharedConfigForLayer(
  request: string,
  layer?: string,
): LayeredSharedConfig {
  const config: LayeredSharedConfig = {
    import: request,
    shareKey: request,
    request,
    singleton: true,
    requiredVersion: false,
    eager: false,
    strictVersion: false,
  };

  if (layer) {
    config.issuerLayer = layer;
    config.layer = layer;
  }

  return config;
}

export function withRspeedySharedDefaults(
  shared?: ModuleFederationOptions['shared'],
): ModuleFederationOptions['shared'] {
  if (!shared) {
    return { ...RSPEEDY_DEFAULT_SHARED };
  }

  if (Array.isArray(shared)) {
    return shared;
  }

  if (typeof shared === 'object') {
    return {
      ...RSPEEDY_DEFAULT_SHARED,
      ...shared,
    };
  }

  return shared;
}

export const pluginModuleFederationRspeedy = (
  moduleFederationOptions: ModuleFederationOptions,
  rsbuildOptions?: RsbuildPluginOptions,
): RspeedyPlugin => {
  const sharedWithDefaults = withRspeedySharedDefaults(
    moduleFederationOptions.shared,
  );

  return pluginModuleFederation(
    {
      ...(moduleFederationOptions as moduleFederationPlugin.ModuleFederationPluginOptions),
      shared: sharedWithDefaults,
    },
    rsbuildOptions,
  );
};

export { RSPEEDY_LAYERS };
