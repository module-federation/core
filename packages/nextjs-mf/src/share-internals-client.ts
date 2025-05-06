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
  // Client-side configuration
  return {
    'react-original': {
      request: 'react',
      singleton: true,
      shareScope: 'default',
      shareKey: 'react',
      ...(nextVersion.startsWith('15') ? { exclude: { version: '18.x' } } : {}),
    },
    // Direct import of the browser alias path
    'next-compiled-react': {
      request: 'next/dist/compiled/',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      version: reactVersion,
      requiredVersion: '^' + reactVersion,
      shareKey: 'next/dist/compiled/',
      exclude: {
        request: /^(?!.*react).*|react-refresh/,
      },
    },
    'next-compiled': {
      request: 'next/dist/compiled/',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      // version: reactVersion,
      shareKey: 'next/dist/compiled/',
    },
  };
};

/**
 * Function defining the React-JSX-Runtime related packages group for client side
 */
export const getReactJsxRuntimeGroupClient = (
  compiler: Compiler,
): Record<string, SharedConfig> => {
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
      ...(nextVersion.startsWith('15') ? { exclude: { version: '18.x' } } : {}),
    },
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

const getNextGroup = () => {
  return {
    'next/': {
      singleton: true,
      exclude: {
        request: /dist/,
      },
    },
    'styled-jsx': {
      singleton: true,
    },
    'styled-jsx/': {
      singleton: true,
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
  const nextGroup = getNextGroup();
  // Combine all groups
  return {
    ...reactGroup,
    ...reactDomGroup,
    ...reactDomClientGroup,
    ...reactJsxDevRuntimeGroup,
    ...reactJsxRuntimeGroup,
    ...nextGroup,
  };
};
