import type {
  SharedConfig,
  SharedObject,
} from '../../enhanced/src/declarations/plugins/sharing/SharePlugin';
import type { Compiler, RuleSetRule } from 'webpack';
import {
  WEBPACK_LAYERS as WL,
  type WebpackLayerName,
  WEBPACK_LAYERS_NAMES,
} from './constants';
import { getReactVersionSafely } from './internal-helpers';
import path from 'path';
/**
 * Type guard to check if a value is a RuleSetRule
 */
export const isRuleSetRule = (rule: unknown): rule is RuleSetRule => {
  if (rule === null || rule === undefined) return false;
  if (typeof rule !== 'object') return false;
  return true;
};

/**
 * Function defining the React related packages group for client side
 */
export const getReactGroupClient = (
  compiler: Compiler,
): Record<string, SharedConfig> => {
  const nextVersion = require(
    require.resolve('next/package.json', { paths: [compiler.context] }),
  ).version;

  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );
  // Define configurations as an array of objects
  const reactConfigs = [
    // React Refresh Runtime - appPagesBrowser layer (Original position, seems logical to keep it near other refresh runtime configs)
    {
      request: 'next/dist/compiled/react-refresh/runtime',
      singleton: true,
      shareKey: 'react-refresh/runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      // no version/requiredVersion for refresh runtime
    },
    {
      request: 'react-refresh/runtime',
      singleton: true,
      shareKey: 'react-refresh/runtime',
      import: 'next/dist/compiled/react-refresh/runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      // no version/requiredVersion for refresh runtime
    },

    // React core - appPagesBrowser layer
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react',
      import: 'next/dist/compiled/react',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'react/', // For deep imports
      singleton: true,
      shareKey: 'react/',
      import: 'next/dist/compiled/react/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react', // Direct compiled path
      singleton: true,
      shareKey: 'react',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React core - pagesDirBrowser layer
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react', // Added for consistency
      import: 'next/dist/compiled/react', // Added for consistency with appPagesBrowser
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'react/', // For deep imports
      singleton: true,
      shareKey: 'react/',
      import: 'next/dist/compiled/react/',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react', // Direct compiled path
      singleton: true,
      shareKey: 'react',
      // packageName: 'react', // Not strictly necessary if shareKey is 'react'
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React DOM - appPagesBrowser layer
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom', // Added for consistency
      import: 'next/dist/compiled/react-dom',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'react-dom/', // For deep imports like react-dom/client
      singleton: true,
      shareKey: 'react-dom/',
      import: 'next/dist/compiled/react-dom/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react-dom', // Direct compiled path
      singleton: true,
      shareKey: 'react-dom',
      // packageName: 'react-dom', // Not strictly necessary if shareKey is 'react-dom'
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react-dom/', // Direct compiled path for deep imports
      singleton: true,
      shareKey: 'react-dom/', // Changed to react-dom/ to match the request
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React DOM - pagesDirBrowser layer
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom', // Added for consistency
      import: 'next/dist/compiled/react-dom',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'react-dom/', // For deep imports
      singleton: true,
      shareKey: 'react-dom/',
      import: 'next/dist/compiled/react-dom/',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react-dom', // Direct compiled path
      singleton: true,
      shareKey: 'react-dom',
      // packageName: 'react-dom', // Not strictly necessary if shareKey is 'react-dom'
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react-dom/', // Direct compiled path for deep imports
      singleton: true,
      shareKey: 'react-dom/', // Changed to react-dom/ to match the request
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React DOM Client - appPagesBrowser layer
    {
      request: 'react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      import: 'next/dist/compiled/react-dom/client',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React DOM Client - pagesDirBrowser layer
    {
      request: 'react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      import: 'next/dist/compiled/react-dom/client',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React JSX Runtime - appPagesBrowser layer
    {
      request: 'react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      import: 'next/dist/compiled/react/jsx-runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react/jsx-runtime',
      shareKey: 'react/jsx-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React JSX Runtime - pagesDirBrowser layer
    {
      request: 'react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      import: 'next/dist/compiled/react/jsx-runtime',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react/jsx-runtime',
      shareKey: 'react/jsx-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React JSX Dev Runtime - appPagesBrowser layer
    {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      import: 'next/dist/compiled/react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React JSX Dev Runtime - pagesDirBrowser layer
    {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      import: 'next/dist/compiled/react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React Server DOM Webpack Client - appPagesBrowser layer
    {
      request: 'react-server-dom-webpack/client',
      singleton: true,
      shareKey: 'react-server-dom-webpack/client',
      import: 'next/dist/compiled/react-server-dom-webpack/client',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react-server-dom-webpack/client',
      singleton: true,
      shareKey: 'react-server-dom-webpack/client',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // React Server DOM Webpack Client - pagesDirBrowser layer
    // {
    //   request: 'react-server-dom-webpack/client',
    //   singleton: true,
    //   shareKey: 'react-server-dom-webpack/client',
    //   import: 'next/dist/compiled/react-server-dom-webpack/client',
    //   layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   version: reactVersion,
    //   requiredVersion: `^${reactVersion}`,
    // },
    // {
    //   request: 'next/dist/compiled/react-server-dom-webpack/client',
    //   singleton: true,
    //   shareKey: 'react-server-dom-webpack/client',
    //   layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   version: reactVersion,
    //   requiredVersion: `^${reactVersion}`,
    // },

    // --- Unlayered React (defaults to pages directory) ---
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react',
      import: 'next/dist/compiled/react',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom',
      import: 'next/dist/compiled/react-dom',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      import: 'next/dist/compiled/react/jsx-runtime',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      import: 'next/dist/compiled/react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
  ];
  // Convert the array to a Record using reduce
  return reactConfigs.reduce(
    (acc, config, index) => {
      const key = `${'request' in config ? `${config.request}-` : ''}${config.shareKey}-${index}${config.layer ? `-${config.layer}` : ''}`;
      acc[key] = config;
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};

const getNextGroup = (compiler: Compiler): Record<string, SharedConfig> => {
  // Dynamically require 'next/package.json' to get the version.
  // The 'paths' option ensures it resolves correctly relative to the compiler's context.
  const nextVersion = require(
    require.resolve('next/package.json', { paths: [compiler.context] }),
  ).version;

  // Define configurations as an array of objects
  const nextConfigs = [
    // --- Next.js Router (Pages Directory) ---
    {
      request: 'next/router',
      shareKey: 'next/router',
      import: 'next/dist/client/router',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/compat/router',
      shareKey: 'next/compat/router',
      import: 'next/dist/client/compat/router',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // General configuration for modules under 'next/' for the appPagesBrowser layer
    {
      request: 'next/dist/shared/',
      shareKey: 'next/dist/shared/',
      import: 'next/dist/shared/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      nodeModulesReconstructedLookup: true,
      // useful for debugging
      // exclude: {
      //   request: /utils|normalized-asset-prefix|error|lazy|thenable|hash|page-path|magic-identifier|server-reference-info|encode-uri-path|segment|server-inserted-html|is-plain-object/,
      // },
      // currently only share the shared runtime
      include: {
        request: /shared-runtime/,
      },
    },
    {
      request: 'next/dist/shared/',
      shareKey: 'next/dist/shared/',
      import: 'next/dist/shared/',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      nodeModulesReconstructedLookup: true,
      // useful for debugging
      // exclude: {
      //   request: /utils|normalized-asset-prefix|error|lazy|thenable|hash|page-path|magic-identifier|server-reference-info|encode-uri-path|segment|server-inserted-html|is-plain-object/,
      // },
      // currently only share the shared runtime
      include: {
        request: /shared-runtime/,
      },
    },
    // General configuration for modules under 'next/' for the appPagesBrowser layer
    // {
    //   request: 'next/navigation',
    //   shareKey: 'next/navigation',
    //   // import: 'next/navigation',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    //   // exclude: {
    //   //   request: /dist/,
    //   // },
    // },
    {
      request: 'next/dist/client/',
      shareKey: 'next/dist/client/',
      import: 'next/dist/client/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      nodeModulesReconstructedLookup: true,
      include: {
        request: /request|bfcache|head-manager|use-action-queue/,
      },
    },
    // {
    //   request: 'next/dist/esm/',
    //   shareKey: 'next/dist/esm/',
    //   import: 'next/dist/esm/',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    //   nodeModulesReconstructedLookup: true,
    //   include: {
    //     request: /app-dir|request|bfcache|head-manager|use-action-queue/,
    //   },
    // },
    {
      request: 'next/dist/compiled/',
      shareKey: 'next/dist/compiled/',
      import: 'next/dist/compiled/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      nodeModulesReconstructedLookup: true,
    },
    // {
    //   request: 'next/dist/',
    //   shareKey: 'next/dist/',
    //   import: 'next/dist/',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    //   nodeModulesReconstructedLookup: true,
    //   exclude: {
    //     request: /^client\//,
    //   },
    // },
    // {
    //   request: 'next/dist/client/',
    //   shareKey: 'next/dist/client/',
    //   import: 'next/dist/client/',
    //   layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    //   nodeModulesReconstructedLookup: true,
    //    include: {
    //      request: /app-dir|request|bfcache/,
    //    },
    // },
    // {
    //   request:'next/dist/build/webpack/loaders/next-flight-loader/module-proxy',
    //   shareKey:'next/dist/build/webpack/loaders/next-flight-loader/module-proxy',
    //   import:'./module-proxy',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    // },
    // Next.js Link - appPagesBrowser layer (explicit configurations)
    {
      request: 'next/link',
      shareKey: 'next/link',
      import: 'next/dist/client/app-dir/link',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      nodeModulesReconstructedLookup: true,
    },
    {
      request: 'next/dist/client/app-dir/link',
      shareKey: 'next/link',
      import: 'next/dist/client/app-dir/link',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      nodeModulesReconstructedLookup: true,
    },
    {
      request: 'next/dist/client/app-dir/link.js',
      shareKey: 'next/link',
      import: 'next/dist/client/app-dir/link',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      nodeModulesReconstructedLookup: true,
    },
    // for internal next monorepo
    // {
    //     request: '/Users/bytedance/dev/next.js/packages/next/dist/client/app-dir/link.js',
    //     shareKey: 'next/link',
    //     import: 'next/dist/client/app-dir/link',
    //     layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //     issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //     shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //     singleton: true,
    //     requiredVersion: `^${nextVersion}`,
    //     version: nextVersion,
    //     nodeModulesReconstructedLookup: true,
    //   },

    // {
    //   request: 'next/link',
    //   shareKey: 'next/link',
    //   import: 'next/dist/client/app-dir/link',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    //   nodeModulesReconstructedLookup: false,
    //   // exclude: {
    //   //   request: /dist/,
    //   // },
    // },
    // {
    //   request: 'next/dist/client/app-dir/link.js',
    //   shareKey: 'next/link',
    //   import: 'next/dist/client/app-dir/link',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    //   nodeModulesReconstructedLookup: false,
    //   // exclude: {
    //   //   request: /dist/,
    //   // },
    // },
    // {
    //   request: 'next/link',
    //   shareKey: 'next/link',
    //   import: 'next/dist/client/app-dir/link',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    //   nodeModulesReconstructedLookup: true,
    //   // exclude: {
    //   //   request: /dist/,
    //   // },
    // },
    // {
    //   request: 'next/',
    //   shareKey: 'next/',
    //   import: 'next/',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    //   nodeModulesReconstructedLookup: true,
    //   include: {
    //     request: /request/,
    //   },
    // },
    // {
    //   request: 'next/',
    //   shareKey: 'next/',
    //   import: 'next/',
    //   layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    //   exclude: {
    //     request: /dist/,
    //   },
    // },
    // --- styled-jsx (for appPagesBrowser) ---
    // {
    //   import: 'styled-jsx',
    //   request: 'styled-jsx',
    //   shareKey: 'styled-jsx',
    //   singleton: true,
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   // no version/requiredVersion for styled-jsx
    // },
    // // Configuration for 'styled-jsx/' deep imports in the appPagesBrowser layer
    // {
    //   import: 'styled-jsx/',
    //   request: 'styled-jsx/',
    //   shareKey: 'styled-jsx/',
    //   singleton: true,
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   // no version/requiredVersion for styled-jsx
    // },
    // // --- styled-jsx (for pagesDirBrowser) ---
    // {
    //   import: 'styled-jsx',
    //   request: 'styled-jsx',
    //   shareKey: 'styled-jsx',
    //   singleton: true,
    //   layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   // no version/requiredVersion for styled-jsx
    // },
    // // Configuration for 'styled-jsx/' deep imports in the pagesDirBrowser layer
    // {
    //   import: 'styled-jsx/',
    //   request: 'styled-jsx/',
    //   shareKey: 'styled-jsx/',
    //   singleton: true,
    //   layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   // no version/requiredVersion for styled-jsx
    // },
  ];

  // Convert the array to a Record using reduce
  return nextConfigs.reduce(
    (acc, config, index) => {
      const key = `${'request' in config ? `${config.request}-` : ''}${config.shareKey}-${index}${config.layer ? `-${config.layer}` : ''}`;
      acc[key] = config;
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};

/**
 * @returns {SharedObject} - The generated share scope.
 */
export const getNextInternalsShareScopeClient = (
  compiler: Compiler,
): SharedObject => {
  // Only proceed if this is a client compiler
  if (compiler.options.name !== 'client') {
    return {};
  }

  // Generate the base groups
  const reactGroup = getReactGroupClient(compiler);
  const nextGroup = getNextGroup(compiler);
  return {
    ...reactGroup,
    ...nextGroup,
  };
};
