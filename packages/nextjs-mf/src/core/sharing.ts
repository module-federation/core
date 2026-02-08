import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { ResolvedNextFederationOptions } from '../types';

type SharedConfig = moduleFederationPlugin.SharedConfig & {
  layer?: string;
  issuerLayer?: string | string[];
  request?: string;
  shareKey?: string;
};

const APP_ROUTER_LAYERS = ['rsc', 'ssr', 'app-pages-browser'] as const;
type AppRouterLayer = (typeof APP_ROUTER_LAYERS)[number];

function createLayeredShareEntries(
  baseKey: string,
  shareKey: string,
  requestByLayer: Record<AppRouterLayer, string>,
  fallbackRequest: string,
  layers: readonly AppRouterLayer[] = APP_ROUTER_LAYERS,
  includeFallback = true,
): moduleFederationPlugin.SharedObject {
  const layeredEntries = layers.reduce((acc, layer) => {
    const request = requestByLayer[layer];
    acc[`${baseKey}-${layer}`] = {
      singleton: true,
      requiredVersion: false,
      import: undefined,
      shareKey,
      request,
      layer,
      issuerLayer: layer,
    } as SharedConfig;
    return acc;
  }, {} as moduleFederationPlugin.SharedObject);

  if (!includeFallback) {
    return layeredEntries;
  }

  layeredEntries[shareKey] = {
    singleton: true,
    requiredVersion: false,
    import: undefined,
    shareKey,
    request: fallbackRequest,
    issuerLayer: undefined,
  } as SharedConfig;

  return layeredEntries;
}

const NEXT_INTERNAL_SHARED: moduleFederationPlugin.SharedObject = {
  'next/dynamic': {
    singleton: true,
    requiredVersion: undefined,
  },
  'next/head': {
    singleton: true,
    requiredVersion: undefined,
  },
  'next/link': {
    singleton: true,
    requiredVersion: undefined,
  },
  'next/router': {
    singleton: true,
    requiredVersion: false,
    import: undefined,
  },
  'next/compat/router': {
    singleton: true,
    requiredVersion: false,
    import: undefined,
  },
  'next/navigation': {
    singleton: true,
    requiredVersion: undefined,
  },
  'next/image': {
    singleton: true,
    requiredVersion: undefined,
  },
  'next/script': {
    singleton: true,
    requiredVersion: undefined,
  },
  react: {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'react/': {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'react-dom/': {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'react-dom/client': {
    singleton: true,
    requiredVersion: false,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: false,
  },
  'react/jsx-dev-runtime': {
    singleton: true,
    requiredVersion: false,
  },
  'styled-jsx': {
    singleton: true,
    requiredVersion: false,
  },
  'styled-jsx/style': {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'styled-jsx/css': {
    singleton: true,
    requiredVersion: undefined,
  },
};

const APP_ROUTER_INTERNAL_SHARED: moduleFederationPlugin.SharedObject = {
  'styled-jsx': {
    singleton: true,
    requiredVersion: false,
  },
  'styled-jsx/style': {
    singleton: true,
    requiredVersion: false,
    import: undefined,
  },
  'styled-jsx/css': {
    singleton: true,
    requiredVersion: false,
  },
};

const APP_ROUTER_REACT_ALIASES = {
  rsc: {
    react: 'next/dist/server/route-modules/app-page/vendored/rsc/react',
    reactDom: 'next/dist/server/route-modules/app-page/vendored/rsc/react-dom',
    reactJsxRuntime:
      'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime',
    reactJsxDevRuntime:
      'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime',
    reactDomClient: 'next/dist/compiled/react-dom/client',
  },
  ssr: {
    react: 'next/dist/server/route-modules/app-page/vendored/ssr/react',
    reactDom: 'next/dist/server/route-modules/app-page/vendored/ssr/react-dom',
    reactJsxRuntime:
      'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime',
    reactJsxDevRuntime:
      'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime',
    reactDomClient: 'next/dist/compiled/react-dom/client',
  },
  'app-pages-browser': {
    react: 'next/dist/compiled/react',
    reactDom: 'next/dist/compiled/react-dom',
    reactJsxRuntime: 'next/dist/compiled/react/jsx-runtime',
    reactJsxDevRuntime: 'next/dist/compiled/react/jsx-dev-runtime',
    reactDomClient: 'next/dist/compiled/react-dom/client',
  },
} as const satisfies Record<
  AppRouterLayer,
  {
    react: string;
    reactDom: string;
    reactJsxRuntime: string;
    reactJsxDevRuntime: string;
    reactDomClient: string;
  }
>;

function getAppRouterShared(): moduleFederationPlugin.SharedObject {
  return {
    ...APP_ROUTER_INTERNAL_SHARED,
    ...createLayeredShareEntries(
      'react',
      'react',
      {
        rsc: APP_ROUTER_REACT_ALIASES.rsc.react,
        ssr: APP_ROUTER_REACT_ALIASES.ssr.react,
        'app-pages-browser':
          APP_ROUTER_REACT_ALIASES['app-pages-browser'].react,
      },
      APP_ROUTER_REACT_ALIASES['app-pages-browser'].react,
    ),
    ...createLayeredShareEntries(
      'react-dom',
      'react-dom',
      {
        rsc: APP_ROUTER_REACT_ALIASES.rsc.reactDom,
        ssr: APP_ROUTER_REACT_ALIASES.ssr.reactDom,
        'app-pages-browser':
          APP_ROUTER_REACT_ALIASES['app-pages-browser'].reactDom,
      },
      APP_ROUTER_REACT_ALIASES['app-pages-browser'].reactDom,
    ),
    ...createLayeredShareEntries(
      'react-jsx-runtime',
      'react/jsx-runtime',
      {
        rsc: APP_ROUTER_REACT_ALIASES.rsc.reactJsxRuntime,
        ssr: APP_ROUTER_REACT_ALIASES.ssr.reactJsxRuntime,
        'app-pages-browser':
          APP_ROUTER_REACT_ALIASES['app-pages-browser'].reactJsxRuntime,
      },
      APP_ROUTER_REACT_ALIASES['app-pages-browser'].reactJsxRuntime,
    ),
    ...createLayeredShareEntries(
      'react-jsx-dev-runtime',
      'react/jsx-dev-runtime',
      {
        rsc: APP_ROUTER_REACT_ALIASES.rsc.reactJsxDevRuntime,
        ssr: APP_ROUTER_REACT_ALIASES.ssr.reactJsxDevRuntime,
        'app-pages-browser':
          APP_ROUTER_REACT_ALIASES['app-pages-browser'].reactJsxDevRuntime,
      },
      APP_ROUTER_REACT_ALIASES['app-pages-browser'].reactJsxDevRuntime,
    ),
    ...createLayeredShareEntries(
      'react-dom-client',
      'react-dom/client',
      {
        rsc: APP_ROUTER_REACT_ALIASES.rsc.reactDomClient,
        ssr: APP_ROUTER_REACT_ALIASES.ssr.reactDomClient,
        'app-pages-browser':
          APP_ROUTER_REACT_ALIASES['app-pages-browser'].reactDomClient,
      },
      APP_ROUTER_REACT_ALIASES['app-pages-browser'].reactDomClient,
      ['app-pages-browser'],
    ),
  };
}

function browserizeShared(
  shared: moduleFederationPlugin.SharedObject,
): moduleFederationPlugin.SharedObject {
  return Object.entries(shared).reduce((acc, [key, value]) => {
    const resolved = value as moduleFederationPlugin.SharedConfig;

    acc[key] = {
      ...resolved,
      import: undefined,
    };
    return acc;
  }, {} as moduleFederationPlugin.SharedObject);
}

export function getDefaultShared(
  resolved: ResolvedNextFederationOptions,
  isServer: boolean,
): moduleFederationPlugin.SharedObject {
  const shouldUseAppLayers =
    (resolved.mode === 'app' || resolved.mode === 'hybrid') &&
    resolved.app.enableRsc;

  const shared: moduleFederationPlugin.SharedObject = shouldUseAppLayers
    ? {
        ...getAppRouterShared(),
      }
    : {
        ...NEXT_INTERNAL_SHARED,
      };

  return isServer ? shared : browserizeShared(shared);
}

export function buildSharedConfig(
  resolved: ResolvedNextFederationOptions,
  isServer: boolean,
  userShared: moduleFederationPlugin.ModuleFederationPluginOptions['shared'],
): moduleFederationPlugin.ModuleFederationPluginOptions['shared'] {
  if (!resolved.sharing.includeNextInternals) {
    return userShared || {};
  }

  return {
    ...getDefaultShared(resolved, isServer),
    ...(userShared || {}),
  };
}
