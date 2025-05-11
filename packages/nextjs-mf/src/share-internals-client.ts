import type {
  SharedConfig,
  SharedObject,
} from '../../enhanced/src/declarations/plugins/sharing/SharePlugin';
import type { Compiler, RuleSetRule, Configuration } from 'webpack';
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

  const reactPath = path.relative(
    compiler.context,
    require.resolve('next/dist/compiled/react', { paths: [compiler.context] }),
  );

  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );
  // Define configurations as an array of objects
  const reactConfigs = [
    // React core - appPagesBrowser layer
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      import: 'next/dist/compiled/react',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
    },
    {
      request: 'next/dist/compiled/react',
      singleton: true,
      shareKey: 'react',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
    },
    // React core - pagesDirBrowser layer
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
    },
    {
      request: 'next/dist/compiled/react',
      singleton: true,
      shareKey: 'react',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
    },

    // React DOM - appPagesBrowser layer
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      import: 'next/dist/compiled/react-dom',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
    },
    {
      request: 'next/dist/compiled/react-dom',
      singleton: true,
      shareKey: 'react-dom',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
    },
    // React DOM - pagesDirBrowser layer
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      import: 'next/dist/compiled/react-dom',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
    },
    {
      request: 'next/dist/compiled/react-dom',
      singleton: true,
      shareKey: 'react-dom',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
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
    },
    {
      request: 'next/dist/compiled/react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
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
    },
    {
      request: 'next/dist/compiled/react-dom/client',
      singleton: true,
      shareKey: 'react-dom/client',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
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
    },
    {
      request: 'next/dist/compiled/react/jsx-runtime',
      shareKey: 'react/jsx-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
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
    },
    {
      request: 'next/dist/compiled/react/jsx-runtime',
      shareKey: 'react/jsx-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
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
    },
    {
      request: 'next/dist/compiled/react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
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
    },
    {
      request: 'next/dist/compiled/react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
    },
    // React Refresh Runtime - pagesDirBrowser layer
    {
      request: 'next/dist/compiled/react-refresh/runtime',
      singleton: true,
      shareKey: 'react-refresh/runtime',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
    },
    {
      request: 'react-refresh/runtime',
      singleton: true,
      shareKey: 'react-refresh/runtime',
      import: 'next/dist/compiled/react-refresh/runtime',
      layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
      version: reactVersion,
    },

    // React Refresh Runtime - appPagesBrowser layer
    {
      request: 'next/dist/compiled/react-refresh/runtime',
      singleton: true,
      shareKey: 'react-refresh/runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
    },
    {
      request: 'react-refresh/runtime',
      singleton: true,
      shareKey: 'react-refresh/runtime',
      import: 'next/dist/compiled/react-refresh/runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
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

/**
 * Function defining the React-JSX-Runtime related packages group for client side
 */
export const getReactJsxRuntimeGroupClient = (
  compiler: Compiler,
): Record<string, SharedConfig> => {
  const nextVersion = require(
    require.resolve('next/package.json', { paths: [compiler.context] }),
  ).version;
  // Use React's version since jsx-runtime is part of React
  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  // Client-side configuration
  return {
    'react/jsx-runtime-original': {
      request: 'react/jsx-runtime',
      singleton: true,
      shareScope: 'default',
      shareKey: 'react/jsx-runtime',
      ...(nextVersion.startsWith('15') ? { exclude: { version: '>19' } } : {}),
    },
    'react/jsx-runtime-rsc': {
      request: 'next/dist/compiled/react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      ...(nextVersion.startsWith('15') ? { exclude: { version: '>19' } } : {}),
    },
  };
};

/**
 * Function defining the React-DOM related packages group for client side
 */
export const getReactDomGroupClient = (
  compiler: Compiler,
): Record<string, SharedConfig> => {
  const nextVersion = require(
    require.resolve('next/package.json', { paths: [compiler.context] }),
  ).version;

  const reactDomVersion = getReactVersionSafely(
    'next/dist/compiled/react-dom',
    compiler.context,
  );

  // Client-side configuration
  return {
    'react-dom-original': {
      request: 'react-dom',
      singleton: true,
      shareScope: 'default',
      shareKey: 'react-dom',
      issuerLayer: undefined,
      ...(nextVersion.startsWith('15') ? { exclude: { version: '>19' } } : {}),
      // version: reactDomVersion,
      // requiredVersion: '^' + reactDomVersion,
    },
    'next-compiled-react-dom': {
      request: 'react-dom',
      import: path.relative(
        compiler.context,
        require.resolve('next/dist/compiled/react-dom', {
          paths: [compiler.context],
        }),
      ),
      shareKey: 'react-dom',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    },
    // 'pages/next/dist/compiled/react-dom': {
    //   singleton: true,
    //   shareKey: 'react-dom',
    //   request: 'next/dist/compiled/react-dom',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   version: reactDomVersion,
    //   requiredVersion: '^' + reactDomVersion,
    //   ...(nextVersion.startsWith('15')
    //     ? { exclude: { version: '>19', fallbackVersion: reactDomVersion } }
    //     : {}),
    // },
    // 'dist/react-dom': {
    //   singleton: true,
    //   shareKey: 'react-dom',
    //   request: 'react-dom',
    //   import: require.resolve('next/dist/compiled/react-dom', {
    //     paths: [compiler.context],
    //   }),
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   version: reactDomVersion,
    //   requiredVersion: '^' + reactDomVersion,
    //   ...(nextVersion.startsWith('15') ? { exclude: { version: '>19', fallbackVersion: reactDomVersion } } : {}),
    // },
  };
};

/**
 * Function defining the React-DOM/Client related packages group for client side
 */
export const getReactDomClientGroupClient = (
  compiler: Compiler,
): Record<string, SharedConfig> => {
  const nextVersion = require(
    require.resolve('next/package.json', { paths: [compiler.context] }),
  ).version;

  const reactDomVersion = getReactVersionSafely(
    'next/dist/compiled/react-dom/client',
    compiler.context,
  );

  // Client-side configuration
  return {
    'react-dom/client-original': {
      request: 'react-dom/client',
      singleton: true,
      shareScope: 'default',
      shareKey: 'react-dom/client',
      ...(nextVersion.startsWith('15') ? { exclude: { version: '18.x' } } : {}),
    },
  };
};

/**
 * Function defining the React-JSX-Dev-Runtime related packages group for client side
 */
export const getReactJsxDevRuntimeGroupClient = (
  compiler: Compiler,
): Record<string, SharedConfig> => {
  const nextVersion = require(
    require.resolve('next/package.json', { paths: [compiler.context] }),
  ).version;

  // Use React's version since jsx-dev-runtime is part of React
  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  // Client-side configuration
  return {
    'react/jsx-dev-runtime-original': {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareScope: 'default',
      shareKey: 'react/jsx-dev-runtime',
      ...(nextVersion.startsWith('15') ? { exclude: { version: '18.x' } } : {}),
    },
  };
};

const getNextGroup = (compiler: Compiler) => {
  const nextVersion = require(
    require.resolve('next/package.json', { paths: [compiler.context] }),
  ).version;

  return {
    'next/': {
      singleton: true,
      request: 'next/',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      exclude: {
        request: /compiled/,
      },
    },
    'next/dist/shared/lib/app-router-context.shared-runtime': {
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    },

    // 'next/pagesdir/': {
    //   singleton: true,
    //   request: 'next/',
    //   shareKey: 'next/',
    //   layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   exclude: {
    //     request: /compiled/,
    //   },
    // },

    // // Dedicated shared setup for router context with absolute path
    // 'next-shared-runtime': {
    //   singleton: true,
    //   request: 'next/dist/shared/',
    //   shareKey: 'next/dist/shared/',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    // },

    // // Pattern for all shared-runtime files
    // 'next-dist-shared-runtime': {
    //   singleton: true,
    //   request: 'next/dist/shared/lib/',
    //   shareKey: 'next/dist/shared/lib/',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    // },

    // 'shared-router-context': {
    //   singleton: true,
    //   request: 'next/dist/shared/lib/router-context.shared-runtime',
    //   shareKey: 'router-context',
    //   import: 'next/dist/shared/lib/router-context.shared-runtime',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    // },
    // 'next/router': {
    //   singleton: true,
    //   request: 'next/router',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    // },
    // 'next/navigation': {
    //   singleton: true,
    //   request: 'next/link',
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    // },

    //   'styled-jsx-app-pages': {
    //     request: 'styled-jsx',
    //     shareKey: 'styled-jsx',
    //     singleton: true,
    //     layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //     issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //     shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   },
    //   'styled-jsx-app-pages/': {
    //     request: 'styled-jsx/',
    //     shareKey: 'styled-jsx/',
    //     singleton: true,
    //     layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //     issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //     shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   },
    //   'styled-jsx-pages-dir': {
    //     request: 'styled-jsx',
    //     shareKey: 'styled-jsx',
    //     singleton: true,
    //     layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //     issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //     shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   },
    //   'styled-jsx-pages-dir/': {
    //     request: 'styled-jsx/',
    //     shareKey: 'styled-jsx/',
    //     singleton: true,
    //     layer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //     issuerLayer: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //     shareScope: WEBPACK_LAYERS_NAMES.pagesDirBrowser,
    //   },
  };
};

/**
 * Generates the appropriate share scope for Next.js internals based on the compiler context.
 * @param {Compiler} compiler - The webpack compiler instance.
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
  const reactDomGroup = getReactDomGroupClient(compiler);
  const reactDomClientGroup = getReactDomClientGroupClient(compiler);
  const reactJsxDevRuntimeGroup = getReactJsxDevRuntimeGroupClient(compiler);
  const reactJsxRuntimeGroup = getReactJsxRuntimeGroupClient(compiler);
  const nextGroup = getNextGroup(compiler);
  // Combine all groups
  return {
    ...reactGroup,
    ...reactDomGroup,
    // ...reactDomClientGroup,
    // ...reactJsxDevRuntimeGroup,
    // ...reactJsxRuntimeGroup,
    ...nextGroup,
  };
};
