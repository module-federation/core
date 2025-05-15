import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';
import type { Compiler } from 'webpack';
import {
  WEBPACK_LAYERS as WL,
  type WebpackLayerName,
  WEBPACK_LAYERS_NAMES,
} from './constants';
import { safeRequireResolve, getReactVersionSafely } from './internal-helpers';

// Extend the SharedConfig type to include layer properties
export type ExtendedSharedConfig = sharePlugin.SharedConfig & {
  layer?: string;
  issuerLayer?: string | string[];
  request?: string;
  shareKey?: string;
};

/**
 * Gets the appropriate React alias based on the layer
 */
const getReactAliasForLayer = (layer: WebpackLayerName): string => {
  switch (layer) {
    case WL.reactServerComponents:
      return 'next/dist/server/route-modules/app-page/vendored/rsc/react';
    case WL.serverSideRendering:
      return 'next/dist/server/route-modules/app-page/vendored/ssr/react';
    case WL.appPagesBrowser:
      return 'next/dist/compiled/react';
    default:
      return 'next/dist/server/route-modules/app-page/vendored/rsc/react';
  }
};

/**
 * Gets the appropriate React DOM alias based on the layer
 */
const getReactDomAliasForLayer = (layer: WebpackLayerName): string => {
  switch (layer) {
    case WL.reactServerComponents:
      return 'next/dist/server/route-modules/app-page/vendored/rsc/react-dom';
    case WL.serverSideRendering:
      return 'next/dist/server/route-modules/app-page/vendored/ssr/react-dom';
    case WL.appPagesBrowser:
      return 'next/dist/compiled/react-dom';
    default:
      return 'next/dist/server/route-modules/app-page/vendored/rsc/react-dom';
  }
};

/**
 * Gets the appropriate React JSX Runtime alias based on the layer
 */
const getReactJsxRuntimeAliasForLayer = (layer: WebpackLayerName): string => {
  switch (layer) {
    case WL.reactServerComponents:
      return 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime';
    case WL.serverSideRendering:
      return 'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime';
    case WL.appPagesBrowser:
      return 'next/dist/compiled/react/jsx-runtime';
    default:
      return 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime';
  }
};

/**
 * Gets the appropriate React JSX Dev Runtime alias based on the layer
 */
const getReactJsxDevRuntimeAliasForLayer = (
  layer: WebpackLayerName,
): string => {
  switch (layer) {
    case WL.reactServerComponents:
      return 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime';
    case WL.serverSideRendering:
      return 'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime';
    case WL.appPagesBrowser:
      return 'next/dist/compiled/react/jsx-dev-runtime';
    default:
      return 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime';
  }
};

/**
 * Gets the appropriate React Server DOM Webpack alias based on the layer
 */
const getReactServerDomWebpackAliasForLayer = (
  layer: WebpackLayerName,
): { request: string } => {
  switch (layer) {
    case WL.reactServerComponents:
      return {
        request:
          'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-edge',
      };
    case WL.serverSideRendering:
      return {
        request:
          'next/dist/server/route-modules/app-page/vendored/ssr/react-server-dom-webpack-client-edge',
      };
    default:
      return {
        request: 'next/dist/compiled/react-server-dom-webpack/server.edge',
      };
  }
};

/**
 * Function defining the React related packages group for server side
 */
export const getReactGroupServer = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  const rscAlias = getReactAliasForLayer(WL.reactServerComponents);
  const ssrAlias = getReactAliasForLayer(WL.serverSideRendering);

  const reactVersion = getReactVersionSafely(rscAlias, compiler.context);

  return {
    // RSC layer entries
    'react-rsc': {
      request: rscAlias,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(rscAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react',
    },
    'react-rsc-user': {
      request: 'react',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(rscAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react',
    },
    // SSR layer entries
    'react-ssr': {
      request: ssrAlias,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(ssrAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react',
    },
    'react-ssr-user': {
      request: 'react',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(ssrAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react',
    },
  };
};

/**
 * Function defining the React-DOM related packages group for server side
 */
export const getReactDomGroupServer = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  const rscAlias = getReactDomAliasForLayer(WL.reactServerComponents);
  const ssrAlias = getReactDomAliasForLayer(WL.serverSideRendering);

  const reactDomVersion = getReactVersionSafely(rscAlias, compiler.context);

  return {
    // RSC layer entries
    'react-dom-rsc': {
      request: rscAlias,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(rscAlias, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom',
    },
    'react-dom-rsc-user': {
      request: 'react-dom',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(rscAlias, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom',
    },
    // SSR layer entries
    'react-dom-ssr': {
      request: ssrAlias,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(ssrAlias, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom',
    },
    'react-dom-ssr-user': {
      request: 'react-dom',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(ssrAlias, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom',
    },
    // Server-specific entries
    'react-dom/server': {
      request: 'next/dist/compiled/react-dom/server',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve('next/dist/compiled/react-dom/server', {
          paths: [compiler.context],
        }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom/server',
    },
    'react-dom/server.edge': {
      request: 'next/dist/build/webpack/alias/react-dom-server-edge.js',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(
          'next/dist/build/webpack/alias/react-dom-server-edge.js',
          { paths: [compiler.context] },
        ) || false,
      version: reactDomVersion,
      shareKey: 'react-dom/server.edge',
    },
  };
};

/**
 * Function defining the React-Server-DOM-Webpack related packages group for server side
 */
export const getReactServerDomWebpackGroupServer = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  const rscConfig = getReactServerDomWebpackAliasForLayer(
    WL.reactServerComponents,
  );
  const ssrConfig = getReactServerDomWebpackAliasForLayer(
    WL.serverSideRendering,
  );

  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react-server-dom-webpack/server.edge',
    compiler.context,
  );

  return {
    'react-server-dom-webpack/server.edge': {
      request: rscConfig.request,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(rscConfig.request, {
          paths: [compiler.context],
        }) || false,
      version: reactVersion,
      shareKey: 'react-server-dom-webpack/server.edge',
    },
    'react-server-dom-webpack/server.node': {
      request:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-node',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(
          'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-node',
          {
            paths: [compiler.context],
          },
        ) || false,
      version: reactVersion,
      shareKey: 'react-server-dom-webpack/server.node',
    },
    'react-server-dom-webpack/client.edge': {
      request: ssrConfig.request,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(ssrConfig.request, {
          paths: [compiler.context],
        }) || false,
      version: reactVersion,
      shareKey: 'react-server-dom-webpack/client.edge',
    },
  };
};

/**
 * Function defining the React-JSX-Runtime related packages group for server side
 */
export const getReactJsxRuntimeGroupServer = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  const rscAlias = getReactJsxRuntimeAliasForLayer(WL.reactServerComponents);
  const ssrAlias = getReactJsxRuntimeAliasForLayer(WL.serverSideRendering);

  // Use React's version since jsx-runtime is part of React
  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  return {
    // RSC layer entries
    'react/jsx-runtime-rsc': {
      request: rscAlias,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(rscAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-runtime',
    },
    'react/jsx-runtime-rsc-user': {
      request: 'react/jsx-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(rscAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-runtime',
    },
    // SSR layer entries
    'react/jsx-runtime-ssr': {
      request: ssrAlias,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(ssrAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-runtime',
    },
    'react/jsx-runtime-ssr-user': {
      request: 'react/jsx-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(ssrAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-runtime',
    },
  };
};

/**
 * Function defining the React-JSX-Dev-Runtime related packages group for server side
 */
export const getReactJsxDevRuntimeGroupServer = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  const rscAlias = getReactJsxDevRuntimeAliasForLayer(WL.reactServerComponents);
  const ssrAlias = getReactJsxDevRuntimeAliasForLayer(WL.serverSideRendering);

  // Use React's version since jsx-dev-runtime is part of React
  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  return {
    // RSC layer entries
    'react/jsx-dev-runtime-rsc': {
      request: rscAlias,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(rscAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-dev-runtime',
    },
    'react/jsx-dev-runtime-rsc-user': {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(rscAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-dev-runtime',
    },
    // SSR layer entries
    'react/jsx-dev-runtime-ssr': {
      request: ssrAlias,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(ssrAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-dev-runtime',
    },
    'react/jsx-dev-runtime-ssr-user': {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(ssrAlias, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-dev-runtime',
    },
  };
};

/**
 * Generates the appropriate share scope for Next.js internals based on the server compiler context.
 * @param {Compiler} compiler - The webpack compiler instance.
 * @returns {moduleFederationPlugin.SharedObject} - The generated share scope.
 */
export const getNextInternalsShareScopeServer = (
  compiler: Compiler,
): moduleFederationPlugin.SharedObject => {
  // Only proceed if this is a server compiler
  if (compiler.options.name !== 'server') {
    return {};
  }

  // Generate all the server-side sharing groups
  const reactGroup = getReactGroupServer(compiler);
  const reactDomGroup = getReactDomGroupServer(compiler);
  const reactServerDomWebpackGroup =
    getReactServerDomWebpackGroupServer(compiler);
  const reactJsxRuntimeGroup = getReactJsxRuntimeGroupServer(compiler);
  const reactJsxDevRuntimeGroup = getReactJsxDevRuntimeGroupServer(compiler);

  // Combine all groups
  return {
    ...reactGroup,
    ...reactDomGroup,
    ...reactServerDomWebpackGroup,
    ...reactJsxRuntimeGroup,
    ...reactJsxDevRuntimeGroup,
  };
};
