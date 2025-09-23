import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { Compiler } from 'webpack';
import type { SharedObject } from '@module-federation/enhanced/src/declarations/plugins/sharing/SharePlugin';

export const WEBPACK_LAYERS_NAMES = {
  /**
   * The layer for the shared code between the client and server bundles.
   */
  shared: 'shared',
  /**
   * The layer for server-only runtime and picking up `react-server` export conditions.
   * Including app router RSC pages and app router custom routes and metadata routes.
   */
  reactServerComponents: 'rsc',
  /**
   * Server Side Rendering layer for app (ssr).
   */
  serverSideRendering: 'ssr',
  /**
   * The browser client bundle layer for actions.
   */
  actionBrowser: 'action-browser',
  /**
   * The layer for the API routes.
   */
  api: 'api',
  /**
   * The layer for the middleware code.
   */
  middleware: 'middleware',
  /**
   * The layer for the instrumentation hooks.
   */
  instrument: 'instrument',
  /**
   * The layer for assets on the edge.
   */
  edgeAsset: 'edge-asset',
  /**
   * The browser client bundle layer for App directory.
   */
  appPagesBrowser: 'app-pages-browser',
} as const;
export const DEFAULT_SHARE_SCOPE: moduleFederationPlugin.SharedObject = {
  'next/dynamic': {
    requiredVersion: undefined,
    singleton: true,
    import: undefined,
  },
  'next/head': {
    requiredVersion: undefined,
    singleton: true,
    import: undefined,
  },
  'next/link': {
    requiredVersion: undefined,
    singleton: true,
    import: undefined,
  },
  'next/router': {
    requiredVersion: false,
    singleton: true,
    import: undefined,
  },
  'next/image': {
    requiredVersion: undefined,
    singleton: true,
    import: undefined,
  },
  'next/script': {
    requiredVersion: undefined,
    singleton: true,
    import: undefined,
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
  'react-dom/': {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'react/jsx-dev-runtime': {
    singleton: true,
    requiredVersion: false,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: false,
  },
  'styled-jsx': {
    singleton: true,
    import: undefined,
    version: require('styled-jsx/package.json').version,
    requiredVersion: '^' + require('styled-jsx/package.json').version,
  },
  'styled-jsx/style': {
    singleton: true,
    import: false,
    version: require('styled-jsx/package.json').version,
    requiredVersion: '^' + require('styled-jsx/package.json').version,
  },
  'styled-jsx/css': {
    singleton: true,
    import: undefined,
    version: require('styled-jsx/package.json').version,
    requiredVersion: '^' + require('styled-jsx/package.json').version,
  },
};

/**
 * Defines a default share scope for the browser environment.
 * This function takes the DEFAULT_SHARE_SCOPE and sets eager to undefined and import to undefined for all entries.
 * For 'react', 'react-dom', 'next/router', and 'next/link', it sets eager to true.
 * The module hoisting system relocates these modules into the right runtime and out of the remote.
 *
 * @type {SharedObject}
 * @returns {SharedObject} - The modified share scope for the browser environment.
 */

// Build base browser share scope (allow local fallback by default)
const BASE_BROWSER_SCOPE: moduleFederationPlugin.SharedObject = Object.entries(
  DEFAULT_SHARE_SCOPE,
).reduce((acc, item) => {
  const [key, value] = item as [string, moduleFederationPlugin.SharedConfig];
  acc[key] = { ...value, import: undefined };
  return acc;
}, {} as moduleFederationPlugin.SharedObject);

// Ensure the pages directory browser layer uses shared consumption for core React entries
const PAGES_DIR_BROWSER_LAYER = 'pages-dir-browser';
const addPagesDirBrowserLayerFor = (
  scope: moduleFederationPlugin.SharedObject,
  name: string,
  request: string,
) => {
  const key = `${name}-${PAGES_DIR_BROWSER_LAYER}`;
  (scope as Record<string, moduleFederationPlugin.SharedConfig>)[key] = {
    singleton: true,
    requiredVersion: false,
    import: undefined,
    shareKey: request,
    request,
    layer: PAGES_DIR_BROWSER_LAYER,
    issuerLayer: PAGES_DIR_BROWSER_LAYER,
  } as moduleFederationPlugin.SharedConfig;
};

addPagesDirBrowserLayerFor(BASE_BROWSER_SCOPE, 'react', 'react');
addPagesDirBrowserLayerFor(BASE_BROWSER_SCOPE, 'react', 'react-dom');
addPagesDirBrowserLayerFor(
  BASE_BROWSER_SCOPE,
  'react/jsx-runtime',
  'react/jsx-runtime',
);
addPagesDirBrowserLayerFor(
  BASE_BROWSER_SCOPE,
  'react/jsx-dev-runtime',
  'react/jsx-dev-runtime',
);

export const DEFAULT_SHARE_SCOPE_BROWSER: moduleFederationPlugin.SharedObject =
  BASE_BROWSER_SCOPE;

/**
 * Gets the Next.js version from compiler context
 * @param {Compiler} compiler - The webpack compiler instance
 * @returns {string} - The Next.js version
 */
export const getNextVersion = (compiler: Compiler): string => {
  if (!compiler.context) {
    throw new Error(
      'Compiler context is not available. Cannot resolve Next.js version.',
    );
  }

  try {
    const nextPackageJsonPath = require.resolve('next/package.json', {
      paths: [compiler.context],
    });
    // Use global require if available (for testing), otherwise use normal require
    const requireFn = (global as any).require || require;
    return requireFn(nextPackageJsonPath).version;
  } catch (error) {
    throw new Error('Could not resolve Next.js version from compiler context.');
  }
};

/**
 * Checks if the Next.js version is 15 or higher
 * @param {string} version - The Next.js version string
 * @returns {boolean} - True if version is 15+, false otherwise
 */
export const isNextJs15Plus = (version: string): boolean => {
  const majorVersion = parseInt(version.split('.')[0], 10);
  return majorVersion >= 15;
};

/**
 * Version-aware function to get Next.js internals share scope
 * For Next.js 14 and lower, returns DEFAULT_SHARE_SCOPE_BROWSER for client or DEFAULT_SHARE_SCOPE for server
 * For Next.js 15+, uses specialized client/server configurations
 * @param {Compiler} compiler - The webpack compiler instance
 * @returns {SharedObject} - The generated share scope based on version and compiler type
 */
export const getNextInternalsShareScope = (
  compiler: Compiler,
): SharedObject => {
  const nextVersion = getNextVersion(compiler);
  const isNext15Plus = isNextJs15Plus(nextVersion);
  const isClient = compiler.options.name === 'client';

  if (isNext15Plus) {
    // For Next.js 15+, use the specialized internal configurations
    if (isClient) {
      const {
        getNextInternalsShareScopeClient,
      } = require('./share-internals-client');
      return getNextInternalsShareScopeClient(compiler);
    } else {
      const {
        getNextInternalsShareScopeServer,
      } = require('./share-internals-server');
      return getNextInternalsShareScopeServer(compiler);
    }
  } else {
    throw new Error('Not next 14');
    // For Next.js 14 and lower, use the main branch compatible approach
    return isClient ? DEFAULT_SHARE_SCOPE_BROWSER : DEFAULT_SHARE_SCOPE;
  }
};

/**
 * Legacy function for backwards compatibility
 * @deprecated Use getNextInternalsShareScope instead
 */
export const getShareScope = (
  compiler: Compiler,
): moduleFederationPlugin.SharedObject => {
  return getNextInternalsShareScope(compiler);
};
