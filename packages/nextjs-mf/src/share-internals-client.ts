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
import path from 'path'
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

  const reactPath = path.relative(compiler.context,require.resolve('next/dist/compiled/react', { paths: [compiler.context] }));

  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  // Define configurations as an array of objects
  const reactConfigs = [
    {
      request: 'react',
      singleton: true,
      shareScope: 'default',
      shareKey: 'react',
      issuerLayer: undefined,
      ...(nextVersion.startsWith('15') ? { exclude: { version: '>19' } } : {}),
    },
    {
      request: 'react/',
      singleton: true,
      shareScope: 'default',
      shareKey: 'react/',
      issuerLayer: undefined,
      ...(nextVersion.startsWith('15') ? { exclude: { version: '>19' } } : {}),
    },
    {
      request: 'react',
      singleton: true,
      shareKey: 'react',
      import: reactPath,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    },
    {
      request: 'next/dist/compiled/react',
      singleton: true,
      shareKey: 'react',
      import: reactPath,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    },
    {
      request: 'react-dom',
      singleton: true,
      shareKey: 'next/dist/compiled/react-dom',
      import: path.relative(compiler.context, require.resolve('next/dist/compiled/react-dom', { paths: [compiler.context] })),
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    },
    {
      request: 'react-dom/client',
      singleton: true,
      shareKey: 'next/dist/compiled/react-dom/client',
      import: path.relative(compiler.context, require.resolve('next/dist/compiled/react-dom/client', { paths: [compiler.context] })),
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    },
    {
      request: 'react/jsx-runtime',
      singleton: true,
      shareKey: 'next/dist/compiled/react/jsx-runtime',
      import: path.relative(compiler.context, require.resolve('next/dist/compiled/react/jsx-runtime', { paths: [compiler.context] })),
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    },
    {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareScope: 'default',
      shareKey: 'react/jsx-dev-runtime',
      issuerLayer: undefined,
    },
    // {
    //   request: 'next/dist/compiled/',
    //   singleton: true,
    //   layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
    //   shareKey: 'next/dist/compiled/',
    //   version: reactVersion,
    //   requiredVersion: '^' + reactVersion,
    //   include: {
    //     request: /react/,
    //   },
    // },
  ];

  // Convert the array to a Record using reduce
  return reactConfigs.reduce((acc, config, index) => {
    const key = `${config.request}-${index}${config.layer ? `-${config.layer}` : ''}`;
    acc[key] = config;
    return acc;
  }, {} as Record<string, SharedConfig>);
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
      import: path.relative(compiler.context, require.resolve('next/dist/compiled/react-dom', { paths: [compiler.context] })),
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
    'next-pages': {
      request: 'next/',
      singleton: true,
      shareScope: 'default',
      shareKey: 'next/',
      exclude: {
        request: /(dist|navigation)/,
        ...(nextVersion.startsWith('15') ? { version: '<15' } : {}),
      },
    },
    'next/link': {
      singleton: true,
      request: 'next/link',
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      exclude: {
        request: /dist/,
        ...(nextVersion.startsWith('15') ? { version: '<15.x' } : {}),
      },
    },
    'styled-jsx': {
      singleton: true,
      shareScope: 'default',
    },
    'styled-jsx/': {
      singleton: true,
      shareScope: 'default',
    },
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
    // ...nextGroup,
  };
};
