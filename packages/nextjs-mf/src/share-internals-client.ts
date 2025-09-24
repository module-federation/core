import type {
  SharedConfig,
  SharedObject,
} from '@module-federation/enhanced/src/declarations/plugins/sharing/SharePlugin';
import type { Compiler } from 'webpack';
import { WEBPACK_LAYERS_NAMES } from './constants';
import { getReactVersionSafely } from './internal-helpers';

/**
 * This file previously used simplifyWithAliasConsumption to collapse alias-based
 * duplicates. That helper has been removed; we now return the raw config lists.
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
  // NOTE (intentional): client App Router (app-dir) shares are currently
  // skipped on purpose. We are focusing on stabilizing Pages directory
  // client shares first and will re-enable app-dir client shares once
  // the layering/runtime story is finalized. See PR discussion about
  // omitting app-dir from the client scope for now.
  // const appDirShares = getAppDirSharesClient(compiler);

  return {
    ...pagesDirShares,
    // Intentionally omitted: spread of app-dir client shares (see note above)
    // ...appDirShares,
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

  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  const reactRequired: string | false = reactVersion
    ? `^${reactVersion}`
    : false;

  const pagesDirConfigs = [
    // --- React (Pages Directory) ---
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      // Rely on Next's own compiler aliases to resolve to compiled React
      // (no hardcoded import override here)
      allowNodeModulesSuffixMatch: true,
    },

    // --- React DOM (Pages Directory) ---
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      // Next will alias this to its compiled build; no explicit import
      allowNodeModulesSuffixMatch: true,
    },

    // --- React DOM Client (Pages Directory) ---
    {
      request: 'react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      packageName: 'react-dom',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      // Next will alias this to its compiled build; no explicit import
      allowNodeModulesSuffixMatch: true,
    },

    // --- React JSX Runtime (Pages Directory) ---
    {
      request: 'react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      // import: 'next/dist/compiled/react/jsx-runtime',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },

    // --- React JSX Dev Runtime (Pages Directory) ---
    {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      // import: 'next/dist/compiled/react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
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

  const pagesDirFinal = pagesDirConfigs as SharedConfig[];

  return pagesDirFinal.reduce<Record<string, SharedConfig>>(
    (
      acc: Record<string, SharedConfig>,
      config: SharedConfig,
      index: number,
    ) => {
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

  const reactRequired: string | false = reactVersion
    ? `^${reactVersion}`
    : false;

  const appDirConfigs = [
    // --- React Refresh Runtime (App Directory) ---
    {
      request: 'next/dist/compiled/react-refresh/runtime',
      singleton: true,
      shareKey: 'react-refresh/runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      // Align app-dir browser entries to default share scope to avoid split scopes
      shareScope: 'default',
    },
    {
      request: 'react-refresh/runtime',
      singleton: true,
      shareKey: 'react-refresh/runtime',
      // import: 'next/dist/compiled/react-refresh/runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
    },

    // --- React (App Directory) ---
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      packageName: 'react',
      // import: 'next/dist/compiled/react',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
    },
    {
      request: 'react/',
      singleton: true,
      shareKey: 'react/',
      // import: 'next/dist/compiled/react/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/dist/compiled/react',
      singleton: true,
      shareKey: 'react',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },

    // --- React DOM (App Directory) ---
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      packageName: 'react-dom',
      // import: 'next/dist/compiled/react-dom',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'react-dom/',
      singleton: true,
      shareKey: 'react-dom/',
      // import: 'next/dist/compiled/react-dom/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/dist/compiled/react-dom',
      singleton: true,
      shareKey: 'react-dom',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/dist/compiled/react-dom/',
      singleton: true,
      shareKey: 'react-dom/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },

    // --- React DOM Client (App Directory) ---
    {
      request: 'react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      // import: 'next/dist/compiled/react-dom/client',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/dist/compiled/react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },

    // --- React JSX Runtime (App Directory) ---
    {
      request: 'react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      // import: 'next/dist/compiled/react/jsx-runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/dist/compiled/react/jsx-runtime',
      shareKey: 'react/jsx-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },

    // --- React JSX Dev Runtime (App Directory) ---
    {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      // import: 'next/dist/compiled/react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },
    {
      request: 'next/dist/compiled/react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
      allowNodeModulesSuffixMatch: true,
    },

    // --- React Server DOM Webpack Client (App Directory) ---
    {
      request: 'react-server-dom-webpack/client',
      singleton: true,
      shareKey: 'react-server-dom-webpack/client',
      // import: 'next/dist/compiled/react-server-dom-webpack/client',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: 'default',
      version: reactVersion,
      requiredVersion: reactRequired,
    },
    {
      request: 'next/dist/compiled/react-server-dom-webpack/client',
      singleton: true,
      shareKey: 'react-server-dom-webpack/client',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: reactRequired,
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
      // import: 'next/dist/compiled/',
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

  const appDirFinal = appDirConfigs as SharedConfig[];

  return appDirFinal.reduce<Record<string, SharedConfig>>(
    (
      acc: Record<string, SharedConfig>,
      config: SharedConfig,
      index: number,
    ) => {
      const key = `${'request' in config ? `${config.request}-` : ''}${config.shareKey}-${index}${config.layer ? `-${config.layer}` : ''}`;
      acc[key] = config;
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};
