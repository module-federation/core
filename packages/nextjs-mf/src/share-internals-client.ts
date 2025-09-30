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
export const getNextInternalsShareScopeClient = (
  compiler: Compiler,
): SharedObject => {
  // Only proceed if this is a client compiler
  if (compiler.options.name !== 'client') {
    return {};
  }

  // Use the new split functions
  const pagesDirShares = getPagesDirSharesClient(compiler);
  const appDirShares = getAppDirSharesClient(compiler);

  return {
    ...pagesDirShares,
    ...appDirShares,
  };
};

/**
 * Function defining shares for Pages Directory (client side)
 * Uses 'default' shareScope and pagesDirBrowser layer
 */
export const getPagesDirSharesClient = (
  compiler: Compiler,
): Record<string, SharedConfig> => {
  const nextVersion = require(
    require.resolve('next/package.json', { paths: [compiler.context] }),
  ).version;

  // Prefer installed React (supports React 19) to avoid mixed versions in dev overlay
  let reactVersion: string | undefined;
  const reactPkgPath = safeRequireResolve('react/package.json', {
    paths: [compiler.context],
  });
  if (reactPkgPath && reactPkgPath !== 'react/package.json') {
    reactVersion = require(reactPkgPath).version;
  } else {
    const reactDomPkgPath = safeRequireResolve('react-dom/package.json', {
      paths: [compiler.context],
    });
    if (reactDomPkgPath && reactDomPkgPath !== 'react-dom/package.json') {
      reactVersion = require(reactDomPkgPath).version;
    } else {
      reactVersion = getReactVersionSafely(
        'next/dist/compiled/react',
        compiler.context,
      );
    }
  }

  const pagesDirConfigs = [
    // --- React (Pages Directory) ---
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react',
      import: require.resolve('react', { paths: [compiler.context] }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // --- React DOM (Pages Directory) ---
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom',
      import: require.resolve('react-dom', { paths: [compiler.context] }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // --- React DOM Client (Pages Directory) ---
    {
      request: 'react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      import: require.resolve('react-dom/client', {
        paths: [compiler.context],
      }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // --- React JSX Runtime (Pages Directory) ---
    {
      request: 'react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      import: require.resolve('react/jsx-runtime', {
        paths: [compiler.context],
      }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // --- React JSX Dev Runtime (Pages Directory) ---
    {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      import: require.resolve('react/jsx-dev-runtime', {
        paths: [compiler.context],
      }),
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // --- Unlayered React (defaults to pages directory) ---
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react',
      import: 'next/dist/compiled/react',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
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
      shareScope: 'default',
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
      shareScope: 'default',
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
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // --- Next.js Router (Pages Directory) ---
    {
      request: 'next/router',
      shareKey: 'next/router',
      import: 'next/dist/client/router',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/compat/router',
      shareKey: 'next/compat/router',
      import: 'next/dist/client/compat/router',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Unlayered Next.js Router (defaults to pages directory) ---
    {
      request: 'next/router',
      shareKey: 'next/router',
      import: 'next/dist/client/router',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },
    {
      request: 'next/compat/router',
      shareKey: 'next/compat/router',
      import: 'next/dist/client/compat/router',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Unlayered Next.js Head (defaults to pages directory) ---
    {
      request: 'next/head',
      shareKey: 'next/head',
      import: 'next/head',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Unlayered Next.js Image (defaults to pages directory) ---
    {
      request: 'next/image',
      shareKey: 'next/image',
      import: 'next/image',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Unlayered Next.js Script (defaults to pages directory) ---
    {
      request: 'next/script',
      shareKey: 'next/script',
      import: 'next/script',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Unlayered Next.js Dynamic (defaults to pages directory) ---
    {
      request: 'next/dynamic',
      shareKey: 'next/dynamic',
      import: 'next/dynamic',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: undefined, // unlayered
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Next.js Head (Pages Directory only) ---
    {
      request: 'next/head',
      shareKey: 'next/head',
      import: 'next/head',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Next.js Image (Pages Directory) ---
    {
      request: 'next/image',
      shareKey: 'next/image',
      import: 'next/image',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Next.js Script (Pages Directory) ---
    {
      request: 'next/script',
      shareKey: 'next/script',
      import: 'next/script',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Next.js Dynamic (Pages Directory) ---
    {
      request: 'next/dynamic',
      shareKey: 'next/dynamic',
      import: 'next/dynamic',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Next.js Shared (Pages Directory) ---
    {
      request: 'next/dist/shared/',
      shareKey: 'next/dist/shared/',
      import: 'next/dist/shared/',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
      allowNodeModulesSuffixMatch: true,
      include: {
        request: /shared-runtime/,
      },
    },
  ];

  return pagesDirConfigs.reduce(
    (acc, config, index) => {
      const key = `${'request' in config ? `${config.request}-` : ''}${config.shareKey}-${index}${config.layer ? `-${config.layer}` : ''}`;
      acc[key] = config;
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};

/**
 * Function defining shares for App Directory (client side)
 * Uses layer-specific shareScopes and appPagesBrowser layer
 */
export const getAppDirSharesClient = (
  compiler: Compiler,
): Record<string, SharedConfig> => {
  const nextVersion = require(
    require.resolve('next/package.json', { paths: [compiler.context] }),
  ).version;

  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  const appDirConfigs = [
    // --- React Refresh Runtime (App Directory) ---
    {
      request: 'next/dist/compiled/react-refresh/runtime',
      singleton: true,
      shareKey: 'react-refresh/runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    },
    {
      request: 'react-refresh/runtime',
      singleton: true,
      shareKey: 'react-refresh/runtime',
      import: 'next/dist/compiled/react-refresh/runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    },

    // --- React (App Directory) ---
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
      request: 'react/',
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
      request: 'next/dist/compiled/react',
      singleton: true,
      shareKey: 'react',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // --- React DOM (App Directory) ---
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom',
      import: 'next/dist/compiled/react-dom',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'react-dom/',
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
      request: 'next/dist/compiled/react-dom',
      singleton: true,
      shareKey: 'react-dom',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },
    {
      request: 'next/dist/compiled/react-dom/',
      singleton: true,
      shareKey: 'react-dom/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: `^${reactVersion}`,
    },

    // --- React DOM Client (App Directory) ---
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

    // --- React JSX Runtime (App Directory) ---
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

    // --- React JSX Dev Runtime (App Directory) ---
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

    // --- React Server DOM Webpack Client (App Directory) ---
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

    // --- Next.js Shared (App Directory) ---
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
      allowNodeModulesSuffixMatch: true,
      include: {
        request: /shared-runtime/,
      },
    },

    // --- Next.js Client (App Directory) ---
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
      allowNodeModulesSuffixMatch: true,
      include: {
        request: /request|bfcache|head-manager|use-action-queue/,
      },
    },

    // --- Next.js Compiled (App Directory) ---
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
      allowNodeModulesSuffixMatch: true,
    },

    // --- Next.js Image (App Directory) ---
    {
      request: 'next/image',
      shareKey: 'next/image',
      import: 'next/image',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Next.js Script (App Directory) ---
    {
      request: 'next/script',
      shareKey: 'next/script',
      import: 'next/script',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Next.js Dynamic (App Directory) ---
    {
      request: 'next/dynamic',
      shareKey: 'next/dynamic',
      import: 'next/dynamic',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      version: nextVersion,
    },

    // --- Next.js Link (App Directory) ---
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
      allowNodeModulesSuffixMatch: true,
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
      allowNodeModulesSuffixMatch: true,
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
      allowNodeModulesSuffixMatch: true,
    },
  ];

  return appDirConfigs.reduce(
    (acc, config, index) => {
      const key = `${'request' in config ? `${config.request}-` : ''}${config.shareKey}-${index}${config.layer ? `-${config.layer}` : ''}`;
      acc[key] = config;
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};
