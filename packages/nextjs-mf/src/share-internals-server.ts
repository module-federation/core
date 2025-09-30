import type {
  SharedConfig,
  SharedObject,
} from '@module-federation/enhanced/src/declarations/plugins/sharing/SharePlugin';
import type { Compiler } from 'webpack';
import { WEBPACK_LAYERS_NAMES } from './constants';
import { safeRequireResolve, getReactVersionSafely } from './internal-helpers';

/**
 * @returns {SharedObject} - The generated share scope.
 */
export const getNextInternalsShareScopeServer = (
  compiler: Compiler,
): SharedObject => {
  if (compiler.options.name === 'client') {
    return {};
  }

  // Use the new split functions
  const pagesDirShares = getPagesDirSharesServer(compiler);
  const appDirShares = getAppDirSharesServer(compiler);

  return {
    ...pagesDirShares,
    ...appDirShares,
  };
};

/**
 * Function defining shares for Pages Directory (server side)
 * Uses 'default' shareScope and pagesDirNode layer
 */
export const getPagesDirSharesServer = (
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
  let reactVersion: string | undefined;
  const reactDomPkgPath = safeRequireResolve('react-dom/package.json', {
    paths: [compiler.context],
  });
  if (reactDomPkgPath && reactDomPkgPath !== 'react-dom/package.json') {
    const reactDomPkg = require(reactDomPkgPath);
    reactVersion = reactDomPkg.version;
  }

  const reactPkgPath = safeRequireResolve('react/package.json', {
    paths: [compiler.context],
  });
  if (reactPkgPath && reactPkgPath !== 'react/package.json') {
    reactVersion = require(reactPkgPath).version;
  }

  if (!reactVersion) {
    reactVersion = getReactVersionSafely(
      'next/dist/compiled/react',
      compiler.context,
    );
  }

  const pagesDirConfigs: SharedConfig[] = [
    // --- Unlayered React (defaults to pages directory) ---
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react',
      import: require.resolve('react', { paths: [compiler.context] }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      allowNodeModulesSuffixMatch: false,
    },
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom',
      import: require.resolve('react-dom', { paths: [compiler.context] }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      allowNodeModulesSuffixMatch: false,
    },
    {
      request: 'react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      import: require.resolve('react/jsx-runtime', {
        paths: [compiler.context],
      }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      allowNodeModulesSuffixMatch: false,
    },
    {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      import: require.resolve('react/jsx-dev-runtime', {
        paths: [compiler.context],
      }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      allowNodeModulesSuffixMatch: false,
    },
    {
      request: 'next/dist/compiled/react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react',
      import: require.resolve('react', { paths: [compiler.context] }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined,
      shareScope: 'default',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      allowNodeModulesSuffixMatch: false,
    },
    {
      request: 'next/dist/compiled/react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      packageName: 'react',
      import: require.resolve('react/jsx-runtime', {
        paths: [compiler.context],
      }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined,
      shareScope: 'default',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      allowNodeModulesSuffixMatch: false,
    },
    {
      request: 'next/dist/compiled/react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      packageName: 'react',
      import: require.resolve('react/jsx-dev-runtime', {
        paths: [compiler.context],
      }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined,
      shareScope: 'default',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      allowNodeModulesSuffixMatch: false,
    },
    {
      request: 'next/dist/compiled/react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom',
      import: require.resolve('react-dom', { paths: [compiler.context] }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined,
      shareScope: 'default',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      allowNodeModulesSuffixMatch: false,
    },
    {
      request: 'next/dist/compiled/react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      packageName: 'react-dom',
      import: require.resolve('react-dom/client', {
        paths: [compiler.context],
      }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined,
      shareScope: 'default',
      version: reactVersion || undefined,
      requiredVersion: reactVersion ? `^${reactVersion}` : undefined,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Router (Pages Directory) ---
    {
      request: 'next/router',
      shareKey: 'next/router',
      import: 'next/dist/client/router',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/compat/router',
      shareKey: 'next/compat/router',
      import: 'next/dist/client/compat/router',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
    },

    // --- Unlayered Next.js Router (defaults to pages directory) ---
    {
      request: 'next/router',
      shareKey: 'next/router',
      import: 'next/dist/client/router',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/compat/router',
      shareKey: 'next/compat/router',
      import: 'next/dist/client/compat/router',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
    },

    // --- Unlayered Next.js Head (defaults to pages directory) ---
    {
      request: 'next/head',
      shareKey: 'next/head',
      import: 'next/head',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Unlayered Next.js Image (defaults to pages directory) ---
    {
      request: 'next/image',
      shareKey: 'next/image',
      import: 'next/image',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Unlayered Next.js Script (defaults to pages directory) ---
    {
      request: 'next/script',
      shareKey: 'next/script',
      import: 'next/script',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Unlayered Next.js Dynamic (defaults to pages directory) ---
    {
      request: 'next/dynamic',
      shareKey: 'next/dynamic',
      import: 'next/dynamic',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Head (Pages Directory only) ---
    {
      request: 'next/head',
      shareKey: 'next/head',
      import: 'next/head',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Image (Pages Directory) ---
    {
      request: 'next/image',
      shareKey: 'next/image',
      import: 'next/image',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Script (Pages Directory) ---
    {
      request: 'next/script',
      shareKey: 'next/script',
      import: 'next/script',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Dynamic (Pages Directory) ---
    {
      request: 'next/dynamic',
      shareKey: 'next/dynamic',
      import: 'next/dynamic',
      layer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirNode,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },
  ];

  return pagesDirConfigs.reduce(
    (acc, config, index) => {
      const key = `${config.request || 'config'}-${config.shareKey}-${config.layer || 'global'}-${index}`;
      acc[key] = config;
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};

/**
 * Function defining shares for App Directory (server side)
 * Uses layer-specific shareScopes (reactServerComponents, serverSideRendering)
 */
export const getAppDirSharesServer = (
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
  let reactVersion: string | undefined;
  const reactDomPkgPath = safeRequireResolve('react-dom/package.json', {
    paths: [compiler.context],
  });
  if (reactDomPkgPath && reactDomPkgPath !== 'react-dom/package.json') {
    const reactDomPkg = require(reactDomPkgPath);
    reactVersion = reactDomPkg.version;
  }

  const reactPkgPath = safeRequireResolve('react/package.json', {
    paths: [compiler.context],
  });
  if (reactPkgPath && reactPkgPath !== 'react/package.json') {
    reactVersion = require(reactPkgPath).version;
  }

  if (!reactVersion) {
    reactVersion = getReactVersionSafely(
      'next/dist/compiled/react',
      compiler.context,
    );
  }

  const appDirConfigs: SharedConfig[] = [
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
    {
      request:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime',
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
    {
      request:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime',
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
    {
      request:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime',
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
    {
      request:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime',
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
    {
      request:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-compiler-runtime',
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
    {
      request:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-server-dom-webpack-client-edge',
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
    {
      request:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-edge',
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
    {
      request:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-server-node',
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
    {
      request:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-webpack-static-edge',
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
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Image (App Directory - Server Side Rendering) ---
    {
      request: 'next/image',
      shareKey: 'next/image',
      import: 'next/image',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Image (App Directory - React Server Components) ---
    {
      request: 'next/image',
      shareKey: 'next/image',
      import: 'next/image',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Script (App Directory - Server Side Rendering) ---
    {
      request: 'next/script',
      shareKey: 'next/script',
      import: 'next/script',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Script (App Directory - React Server Components) ---
    {
      request: 'next/script',
      shareKey: 'next/script',
      import: 'next/script',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Dynamic (App Directory - Server Side Rendering) ---
    {
      request: 'next/dynamic',
      shareKey: 'next/dynamic',
      import: 'next/dynamic',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Dynamic (App Directory - React Server Components) ---
    {
      request: 'next/dynamic',
      shareKey: 'next/dynamic',
      import: 'next/dynamic',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: false,
    },

    // --- Next.js Link (App Directory) ---
    {
      request: 'next/link',
      shareKey: 'next/link',
      import: 'next/dist/client/app-dir/link',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/dist/client/app-dir/link',
      shareKey: 'next/link',
      import: 'next/dist/client/app-dir/link',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/dist/client/app-dir/link.js',
      shareKey: 'next/link',
      import: 'next/dist/client/app-dir/link',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
    },
    // Next.js Link - serverSideRendering layer (explicit configurations)
    {
      request: 'next/link',
      shareKey: 'next/link',
      import: 'next/dist/client/app-dir/link',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/dist/client/app-dir/link',
      shareKey: 'next/link',
      import: 'next/dist/client/app-dir/link',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/dist/client/app-dir/link.js',
      shareKey: 'next/link',
      import: 'next/dist/client/app-dir/link',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
    },

    // --- Next.js Internal Contexts (React-specific) ---
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
    {
      request:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-compiler-runtime',
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
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
      allowNodeModulesSuffixMatch: false,
    },
  ];

  return appDirConfigs.reduce(
    (acc, config, index) => {
      const key = `${config.request || 'config'}-${config.shareKey}-${config.layer || 'global'}-${index}`;
      acc[key] = config;
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};
