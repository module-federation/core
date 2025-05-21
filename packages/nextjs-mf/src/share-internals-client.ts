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
  ];
  // Convert the array to a Record using reduce
  return reactConfigs.reduce(
    (acc, config, index) => {
      const key = `${'request' in config ? `${config.request}-` : ''}${config.shareKey}-${index}${config.layer ? `-${config.layer}` : ''}-${Math.random().toString(36).substring(7)}`;
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
  const nextConfigs: SharedConfig[] = [
    // Server Action related modules (client-side)
    {
      request:
        'next/dist/build/webpack/loaders/next-flight-loader/server-reference',
      shareKey:
        'next/dist/build/webpack/loaders/next-flight-loader/server-reference',
      import:
        'next/dist/build/webpack/loaders/next-flight-loader/server-reference',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request:
        'next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper',
      shareKey:
        'next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper',
      import:
        'next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    // Optimized Modules/Polyfills
    {
      request: 'unfetch',
      shareKey: 'unfetch',
      import: 'next/dist/build/polyfills/fetch/index.js',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'isomorphic-unfetch',
      shareKey: 'isomorphic-unfetch',
      import: 'next/dist/build/polyfills/fetch/index.js',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'whatwg-fetch',
      shareKey: 'whatwg-fetch',
      import: 'next/dist/build/polyfills/fetch/whatwg-fetch.js',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'object-assign',
      shareKey: 'object-assign',
      import: 'next/dist/build/polyfills/object-assign.js',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'url',
      shareKey: 'url',
      import: 'next/dist/compiled/native-url',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    // Core Next.js Client Utilities - appPagesBrowser
    {
      request: 'next/link',
      shareKey: 'next/link',
      import: 'next/dist/client/link.js', // Default, might need app-dir specific if available and distinct
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/navigation',
      shareKey: 'next/navigation',
      import: 'next/dist/client/components/navigation.js',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/router', // Primarily for pages, but provide a consistent share for app if used
      shareKey: 'next/router',
      import: 'next/dist/client/router.js',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser, // Available, though navigation is preferred in App
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/image',
      shareKey: 'next/image',
      import: 'next/dist/client/image-component.js',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/script',
      shareKey: 'next/script',
      import: 'next/dist/client/script.js',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/head',
      shareKey: 'next/head/app', // Differentiate for app router to use noop-head
      import: 'next/dist/client/components/noop-head.js',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    // Core Next.js Client Utilities - pagesDirBrowser
    {
      request: 'next/link',
      shareKey: 'next/link',
      import: 'next/dist/client/link.js',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/router',
      shareKey: 'next/router',
      import: 'next/dist/client/router.js',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/image',
      shareKey: 'next/image',
      import: 'next/dist/client/image-component.js',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/script',
      shareKey: 'next/script',
      import: 'next/dist/client/script.js', // Assuming same script loader for pages
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/head',
      shareKey: 'next/head/pages', // Differentiate for pages router to use head-manager
      import: 'next/dist/client/head-manager.js',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    // Refined shared configuration for 'next/dist/shared/lib/'
    // Instead of sharing everything under next/dist/shared/lib/,
    // we can be more specific or keep it broad if many utilities are used.
    // For now, let's assume specific common utilities from shared/lib are needed.
    // Example: 'next/dist/shared/lib/utils.js'
    // If specific utilities are few, list them. Otherwise, a broader pattern might be okay.
    // Given the original had a broad include for /shared-runtime/, let's refine that.
    {
      request: 'next/dist/shared/lib/router-context.js', // Example specific share
      shareKey: 'next/dist/shared/lib/router-context',
      import: 'next/dist/shared/lib/router-context.js',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/dist/shared/lib/router-context.js', // Example specific share
      shareKey: 'next/dist/shared/lib/router-context',
      import: 'next/dist/shared/lib/router-context.js',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    // The original 'next/dist/shared/' with include for /shared-runtime/ might still be valuable
    // if 'shared-runtime' bundles multiple small utilities.
    // Let's keep it but ensure it doesn't excessively overlap or cause issues with more specific shares.
    // Adjusted to be more specific to `shared-runtime.js` if that's the actual entry.
    // The following two entries for 'next/dist/shared/lib/shared-runtime.js' are removed 
    // as they are expected to be covered by the prefix share 'next/dist/shared/' with 
    // 'include: { request: /shared-runtime/ }'.
    // {
    //   request: 'next/dist/shared/lib/shared-runtime.js', // Assuming this is a concrete file
    //   shareKey: 'next/dist/shared/lib/shared-runtime',
    //   import: 'next/dist/shared/lib/shared-runtime.js',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    // },
    // {
    //   request: 'next/dist/shared/lib/shared-runtime.js', // Assuming this is a concrete file
    //   shareKey: 'next/dist/shared/lib/shared-runtime',
    //   import: 'next/dist/shared/lib/shared-runtime.js',
    //   layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   singleton: true,
    //   requiredVersion: `^${nextVersion}`,
    //   version: nextVersion,
    // },
    // Remove broad 'next/' and 'next/dist/shared/' if specific shares are comprehensive.
    // For now, I'm commenting them out. If testing reveals missing shares, they can be reinstated or adjusted.
    
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
      include: { request: /shared-runtime/ }, 
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
      include: { request: /shared-runtime/ }, 
    },
    {
      request: 'next/',
      shareKey: 'next/',
      import: 'next/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      exclude: { request: /dist/ },
    },
    {
      request: 'next/',
      shareKey: 'next/',
      import: 'next/',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      exclude: { request: /dist/ },
    },
    
    // --- styled-jsx (for appPagesBrowser) ---
    {
      import: 'styled-jsx',
      request: 'styled-jsx',
      shareKey: 'styled-jsx',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      // no version/requiredVersion for styled-jsx
    },
    // Configuration for 'styled-jsx/' deep imports in the appPagesBrowser layer
    {
      import: 'styled-jsx/',
      request: 'styled-jsx/',
      shareKey: 'styled-jsx/',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      // no version/requiredVersion for styled-jsx
    },
    // --- styled-jsx (for pagesDirBrowser) ---
    {
      import: 'styled-jsx',
      request: 'styled-jsx',
      shareKey: 'styled-jsx',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      // no version/requiredVersion for styled-jsx
    },
    // Configuration for 'styled-jsx/' deep imports in the pagesDirBrowser layer
    {
      import: 'styled-jsx/',
      request: 'styled-jsx/',
      shareKey: 'styled-jsx/',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      // no version/requiredVersion for styled-jsx
    },
  ];

  // Convert the array to a Record using reduce
  return nextConfigs.reduce(
    (acc, config, index) => {
      const key = `${'request' in config ? `${config.request}-` : ''}${config.shareKey}-${index}${config.layer ? `-${config.layer}` : ''}-${Math.random().toString(36).substring(7)}`;
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
  // Combine all groups
  return {
    ...reactGroup,
    ...nextGroup,
  };
};
