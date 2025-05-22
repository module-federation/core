import type {
  SharedConfig,
  SharedObject,
} from '../../enhanced/src/declarations/plugins/sharing/SharePlugin';
import type { Compiler } from 'webpack';
import {
  WEBPACK_LAYERS as WL,
  type WebpackLayerName,
  WEBPACK_LAYERS_NAMES,
} from './constants';
import { getReactVersionSafely } from './internal-helpers';
import path from 'path';

/**
 * Gets the appropriate React alias based on the layer
 */
const getReactAliasForLayer = (layer: WebpackLayerName): string => {
  switch (layer) {
    case WL.reactServerComponents:
      return 'next/dist/server/route-modules/app-page/vendored/rsc/react';
    case WL.serverSideRendering:
      return 'next/dist/server/route-modules/app-page/vendored/ssr/react';
    default:
      console.warn(
        `getReactAliasForLayer: Unexpected layer ${String(layer)}, defaulting to RSC vendored React.`,
      );
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
    default:
      console.warn(
        `getReactDomAliasForLayer: Unexpected layer ${String(layer)}, defaulting to RSC vendored React DOM.`,
      );
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
    default:
      console.warn(
        `getReactJsxRuntimeAliasForLayer: Unexpected layer ${String(layer)}, defaulting to RSC vendored JSX runtime.`,
      );
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
    default:
      console.warn(
        `getReactJsxDevRuntimeAliasForLayer: Unexpected layer ${String(layer)}, defaulting to RSC vendored JSX dev runtime.`,
      );
      return 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime';
  }
};

/**
 * Function defining the React related packages group for server side
 */
export const getReactGroupServer = (
  compiler: Compiler,
): Record<string, SharedConfig> => {
  if (!compiler.context) {
    console.warn(
      'Compiler context is not available. Cannot resolve Next.js or React versions.',
    );
    return {};
  }
  const nextPackageJsonPath = require.resolve('next/package.json', {
    paths: [compiler.context],
  });
  const nextVersion = require(nextPackageJsonPath).version;

  // Get React version.
  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  if (!reactVersion) {
    console.warn(
      'Could not determine React version. Sharing configurations for React might be incomplete.',
    );
  }

  const reactConfigs: SharedConfig[] = [
    // --- React (Server Side Rendering) ---
    {
      request: 'next/dist/server/route-modules/app-page/vendored/ssr/react',
      singleton: true,
      shareKey: 'react',
      import: 'next/dist/server/route-modules/app-page/vendored/ssr/react',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
      nodeModulesReconstructedLookup: false
    },
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      import: 'next/dist/server/route-modules/app-page/vendored/ssr/react',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
      nodeModulesReconstructedLookup: false
    },
    // --- React (React Server Components) ---
    {
      request: 'next/dist/server/route-modules/app-page/vendored/rsc/react',
      singleton: true,
      shareKey: 'react',
      import: 'next/dist/server/route-modules/app-page/vendored/rsc/react',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
      nodeModulesReconstructedLookup: false
    },
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      import: 'next/dist/server/route-modules/app-page/vendored/rsc/react',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
      nodeModulesReconstructedLookup: false
    },
    // --- React (Default Fallback) ---
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      import: `next/dist/compiled/react`,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
      packageName: 'react',
      nodeModulesReconstructedLookup: false
    },

    // --- React DOM (Server Side Rendering) ---
    {
      request: 'react-dom',
      shareKey: 'react-dom',
      import: 'next/dist/server/route-modules/app-page/vendored/ssr/react-dom',
      singleton: true,
      packageName: 'react-dom',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/ssr/react-dom',
      shareKey: 'react-dom',
      import: 'next/dist/server/route-modules/app-page/vendored/ssr/react-dom',
      singleton: true,
      packageName: 'react-dom',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
    // --- React DOM (React Server Components) ---
    {
      request: 'react-dom',
      shareKey: 'react-dom',
      import: 'next/dist/server/route-modules/app-page/vendored/rsc/react-dom',
      singleton: true,
      packageName: 'react-dom',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/rsc/react-dom',
      shareKey: 'react-dom',
      import: 'next/dist/server/route-modules/app-page/vendored/rsc/react-dom',
      singleton: true,
      packageName: 'react-dom',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    // --- React DOM (Default Fallback) ---
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      import: `next/dist/compiled/react-dom`,
      shareScope: 'default',
      packageName: 'react-dom',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      nodeModulesReconstructedLookup: false,
    },

    // --- React JSX Runtime (Server Side Rendering) ---
    {
      request: 'react/jsx-runtime',
      shareKey: 'react/jsx-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime',
      shareKey: 'react/jsx-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
    // --- React JSX Runtime (React Server Components) ---
    {
      request: 'react/jsx-runtime',
      shareKey: 'react/jsx-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime',
      shareKey: 'react/jsx-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    // --- React JSX Runtime (Default Fallback) ---
    {
      request: 'react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      import: `next/dist/compiled/react/jsx-runtime`,
      shareScope: 'default',
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      nodeModulesReconstructedLookup: false,
    },

    // --- React JSX Dev Runtime (Server Side Rendering) ---
    {
      request: 'react/jsx-dev-runtime',
      shareKey: 'react/jsx-dev-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime',
      shareKey: 'react/jsx-dev-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
    // --- React JSX Dev Runtime (React Server Components) ---
    {
      request: 'react/jsx-dev-runtime',
      shareKey: 'react/jsx-dev-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime',
      shareKey: 'react/jsx-dev-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    // --- React JSX Dev Runtime (Default Fallback) ---
    {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      import: `next/dist/compiled/react/jsx-dev-runtime`,
      shareScope: 'default',
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      nodeModulesReconstructedLookup: false,
    },

    // --- React Compiler Runtime (Server Side Rendering) ---
    {
      request: 'react/compiler-runtime',
      shareKey: 'react/compiler-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-compiler-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/ssr/react-compiler-runtime',
      shareKey: 'react/compiler-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-compiler-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
    // --- React Compiler Runtime (React Server Components) ---
    {
      request: 'react/compiler-runtime',
      shareKey: 'react/compiler-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-compiler-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/rsc/react-compiler-runtime',
      shareKey: 'react/compiler-runtime',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-compiler-runtime',
      singleton: true,
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    // --- React Compiler Runtime (Default Fallback) ---
    {
      request: 'react/compiler-runtime',
      singleton: true,
      shareKey: 'react/compiler-runtime',
      import: `next/dist/compiled/react/compiler-runtime`,
      shareScope: 'default',
      packageName: 'react',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      nodeModulesReconstructedLookup: false,
    },

    // --- react-server-dom-webpack/client.edge (Server Side Rendering) ---
    {
      request: 'react-server-dom-webpack/client.edge',
      shareKey: 'react-server-dom-webpack/client.edge',
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-server-dom-webpack-client-edge',
      singleton: true,
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/ssr/react-server-dom-webpack-client-edge',
      shareKey: 'react-server-dom-webpack/client.edge',
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-server-dom-webpack-client-edge',
      singleton: true,
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
    // --- react-server-dom-webpack/client.edge (Default Fallback) ---
    {
      request: 'react-server-dom-webpack/client.edge',
      singleton: true,
      shareKey: 'react-server-dom-webpack/client.edge',
      import: `next/dist/compiled/react-server-dom-webpack/client.edge`,
      shareScope: 'default',
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      nodeModulesReconstructedLookup: false,
    },

    // --- react-server-dom-webpack/server.edge (React Server Components) ---
    {
      request: 'react-server-dom-webpack/server.edge',
      shareKey: 'react-server-dom-webpack/server.edge',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-edge',
      singleton: true,
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-edge',
      shareKey: 'react-server-dom-webpack/server.edge',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-edge',
      singleton: true,
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    // --- react-server-dom-webpack/server.edge (Default Fallback) ---
    {
      request: 'react-server-dom-webpack/server.edge',
      singleton: true,
      shareKey: 'react-server-dom-webpack/server.edge',
      import: `next/dist/compiled/react-server-dom-webpack/server.edge`,
      shareScope: 'default',
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      nodeModulesReconstructedLookup: false,
    },

    // --- react-server-dom-webpack/server.node (React Server Components) ---
    {
      request: 'react-server-dom-webpack/server.node',
      shareKey: 'react-server-dom-webpack/server.node',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-node',
      singleton: true,
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-node',
      shareKey: 'react-server-dom-webpack/server.node',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-node',
      singleton: true,
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    // --- react-server-dom-webpack/server.node (Default Fallback) ---
    {
      request: 'react-server-dom-webpack/server.node',
      singleton: true,
      shareKey: 'react-server-dom-webpack/server.node',
      import: `next/dist/compiled/react-server-dom-webpack/server.node`,
      shareScope: 'default',
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      nodeModulesReconstructedLookup: false,
    },

    // --- react-server-dom-webpack/static.edge (React Server Components) ---
    {
      request: 'react-server-dom-webpack/static.edge',
      shareKey: 'react-server-dom-webpack/static.edge',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-static-edge',
      singleton: true,
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-static-edge',
      shareKey: 'react-server-dom-webpack/static.edge',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-static-edge',
      singleton: true,
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    // --- react-server-dom-webpack/static.edge (Default Fallback) ---
    {
      request: 'react-server-dom-webpack/static.edge',
      singleton: true,
      shareKey: 'react-server-dom-webpack/static.edge',
      import: `next/dist/compiled/react-server-dom-webpack/static.edge`,
      shareScope: 'default',
      packageName: 'react-server-dom-webpack',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      nodeModulesReconstructedLookup: false,
    },
  ];


  // Convert the array to a Record using reduce, ensuring unique keys by including the index.
  return reactConfigs.reduce(
    (acc, config, index) => {
      // Construct a unique key for each configuration to avoid overwrites in the accumulator object.
      const key = `${config.request || 'config'}-${config.shareKey}-${config.layer || 'global'}-${index}`;
      if (acc[key]) {
        // This case should ideally not be hit if reactConfigs are generated correctly.
        console.warn(
          `Duplicate key detected in reactConfigs reduction: ${key}. Check configurations.`,
        );
      }
      acc[key] = config;
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};

export const getNextGroupServer = (
  compiler: Compiler,
): Record<string, SharedConfig> => {
  if (!compiler.context) {
    console.warn(
      'Compiler context is not available. Cannot resolve Next.js version for getNextGroupServer.',
    );
    return {};
  }
  const nextPackageJsonPath = require.resolve('next/package.json', {
    paths: [compiler.context],
  });
  const nextVersion = require(nextPackageJsonPath).version;

  const nextConfigs: SharedConfig[] = [
    // --- Server Action Related Modules ---
    // 'next/dist/build/webpack/loaders/next-flight-loader/action-validate' is REMOVED as per instructions.
    {
      request:
        'next/dist/build/webpack/loaders/next-flight-loader/server-reference',
      shareKey:
        'next/dist/build/webpack/loaders/next-flight-loader/server-reference',
      import:
        'next/dist/build/webpack/loaders/next-flight-loader/server-reference',
      singleton: true,
      version: nextVersion,
      requiredVersion: `^${nextVersion}`,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents, // Or 'default' if broadly applicable
      shareScope: 'default',
    },
    {
      request: 'next/dist/server/app-render/encryption',
      shareKey: 'next/dist/server/app-render/encryption',
      import: 'next/dist/server/app-render/encryption',
      singleton: true,
      version: nextVersion,
      requiredVersion: `^${nextVersion}`,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: 'default',
    },
    {
      request:
        'next/dist/build/webpack/loaders/next-flight-loader/cache-wrapper',
      shareKey:
        'next/dist/build/webpack/loaders/next-flight-loader/cache-wrapper',
      import:
        'next/dist/build/webpack/loaders/next-flight-loader/cache-wrapper',
      singleton: true,
      version: nextVersion,
      requiredVersion: `^${nextVersion}`,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: 'default',
    },
    {
      request:
        'next/dist/build/webpack/loaders/next-flight-loader/track-dynamic-import',
      shareKey:
        'next/dist/build/webpack/loaders/next-flight-loader/track-dynamic-import',
      import:
        'next/dist/build/webpack/loaders/next-flight-loader/track-dynamic-import',
      singleton: true,
      version: nextVersion,
      requiredVersion: `^${nextVersion}`,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents, // Primarily RSC, but could be default if used by SSR too
      shareScope: 'default',
    },

    // --- Aliased Next.js Modules ---
    {
      request: '@vercel/og', // Request ends with $ to signify exact match for alias
      shareKey: '@vercel/og', // ShareKey without $
      import: 'next/dist/server/og/image-response',
      singleton: true,
      version: nextVersion,
      requiredVersion: `^${nextVersion}`,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering, // Or default if applicable to RSC too
      shareScope: 'default',
    },
    {
      request: '@opentelemetry/api', // Assuming exact match for alias
      shareKey: '@opentelemetry/api',
      import: 'next/dist/compiled/@opentelemetry/api',
      singleton: true,
      version: nextVersion, // This should ideally be the version of OTel used by Next.js
      requiredVersion: `^${nextVersion}`, // Or specific OTel version range
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering, // Or default
      shareScope: 'default',
    },

    // --- Core Next.js Server/Shared Utilities ---
    // For `next/headers` (used in App Router)
    {
      request: 'next/headers',
      shareKey: 'next/headers',
      // Path based on Next.js's App Router API aliases
      import: 'next/dist/server/app-render/build/server-inserted-html.js',
      singleton: true,
      version: nextVersion,
      requiredVersion: `^${nextVersion}`,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents, // Primarily for App Router server components
      shareScope: 'default',
    },
    // For `next/cookies` (used in App Router)
    {
      request: 'next/cookies',
      shareKey: 'next/cookies',
      // Path based on Next.js's App Router API aliases
      import: 'next/dist/server/app-render/build/server-request-cookies.js', // Updated path based on typical Next.js structure for request cookies in App Router
      singleton: true,
      version: nextVersion,
      requiredVersion: `^${nextVersion}`,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents, // Primarily for App Router server components
      shareScope: 'default',
    },
    // For `next/server` (NextResponse, NextRequest - used in App Router and Middleware)
    // Sharing the specific components rather than the whole module might be better if possible
    // For NextResponse
    {
      request: 'next/server', // This request might be too broad if only NextResponse is needed
      shareKey: 'next/server/next-response', // More specific share key
      import: 'next/dist/server/web/spec-extension/response.js',
      singleton: true,
      version: nextVersion,
      requiredVersion: `^${nextVersion}`,
      // Applicable to RSC, SSR (edge), and Middleware (edge)
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents, // And potentially others like edge SSR
      shareScope: 'default',
    },
    // For NextRequest
    {
      // request: 'next/server', // Already covered or use a more specific request if needed
      shareKey: 'next/server/next-request', // More specific share key
      import: 'next/dist/server/web/spec-extension/request.js',
      singleton: true,
      version: nextVersion,
      requiredVersion: `^${nextVersion}`,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents, // And potentially others
      shareScope: 'default',
    },

    // --- Existing Next.js Internal Contexts (React-specific) ---
    // Kept from original structure, ensure they are still relevant and correctly configured
    {
      request: 'next/dist/server/route-modules/app-page/vendored/contexts/',
      shareKey: 'next/dist/server/route-modules/app-page/vendored/contexts/',
      import: 'next/dist/server/route-modules/app-page/vendored/contexts/',
      singleton: true,
      packageName: 'next',
      version: nextVersion || undefined,
      requiredVersion: nextVersion ? `^${nextVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      nodeModulesReconstructedLookup: false,
    },
    {
      request: 'next/dist/server/route-modules/app-page/vendored/contexts/',
      shareKey: 'next/dist/server/route-modules/app-page/vendored/contexts/',
      import: 'next/dist/server/route-modules/app-page/vendored/contexts/',
      singleton: true,
      packageName: 'next',
      version: nextVersion || undefined,
      requiredVersion: nextVersion ? `^${nextVersion}` : undefined,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      nodeModulesReconstructedLookup: false,
    },
  ];
  return nextConfigs.reduce(
    (acc, config, index) => {
      const key = `${config.request || 'config'}-${config.shareKey}-${config.layer || 'global'}-${index}`;
      acc[key] = config;
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};

/**
 * @returns {SharedObject} - The generated share scope.
 */
export const getNextInternalsShareScopeServer = (
  compiler: Compiler,
): SharedObject => {
  if (compiler.options.name === 'client') {
    return {};
  }

  const reactGroup = getReactGroupServer(compiler);
  const nextGroup = getNextGroupServer(compiler);
  return {
    ...reactGroup,
    ...nextGroup, // Ensure nextGroup is included
  };
};
