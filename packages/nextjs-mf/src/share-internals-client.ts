import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';
import type { Compiler, RuleSetRule, Configuration } from 'webpack';
import {
  WEBPACK_LAYERS as WL,
  type WebpackLayerName,
  WEBPACK_LAYERS_NAMES,
} from './constants';
import { safeRequireResolve, getReactVersionSafely } from './internal-helpers';

// Extend the SharedConfig type to include layer properties
export type ExtendedSharedConfig = sharePlugin.SharedConfig & {
  layer?: string;
  issuerLayer?: string | string[];
  request?: string;
  shareKey?: string;
};

/**
 * Extracts aliases from webpack rules
 */
const extractRuleAliases = (rules: Configuration['module']['rules']): any[] => {
  const collectedAliases: any[] = [];

  const traverse = (rule: RuleSetRule) => {
    if (!rule || typeof rule !== 'object') return;

    const ruleInfo: any = {
      conditions: {},
      resolve: {},
    };

    let hasResolveConfig = false;

    // Collect all rule conditions
    if (rule.test) ruleInfo.conditions.test = rule.test.toString();
    if (rule.include) ruleInfo.conditions.include = rule.include;
    if (rule.exclude) ruleInfo.conditions.exclude = rule.exclude;
    if (rule.issuer) ruleInfo.conditions.issuer = rule.issuer;
    if (rule.issuerLayer) {
      ruleInfo.conditions.issuerLayer = rule.issuerLayer;
    }
    if (rule.layer) {
      ruleInfo.conditions.layer = rule.layer;
    }
    if (rule.resourceQuery) {
      ruleInfo.conditions.resourceQuery = rule.resourceQuery.toString();
    }

    // Collect resolve configuration
    if (rule.resolve) {
      if (rule.resolve.alias) {
        ruleInfo.resolve.alias = rule.resolve.alias;
        hasResolveConfig = true;
      }
      if (rule.resolve.fallback) {
        ruleInfo.resolve.fallback = rule.resolve.fallback;
        hasResolveConfig = true;
      }
      if (rule.resolve.mainFields) {
        ruleInfo.resolve.mainFields = rule.resolve.mainFields;
        hasResolveConfig = true;
      }
      if (rule.resolve.conditionNames) {
        ruleInfo.resolve.conditionNames = rule.resolve.conditionNames;
        hasResolveConfig = true;
      }
    }

    if (hasResolveConfig) {
      collectedAliases.push(ruleInfo);
    }

    // Traverse nested rules
    if ('oneOf' in rule && Array.isArray(rule.oneOf)) {
      rule.oneOf.forEach((r) => {
        if (isRuleSetRule(r)) {
          traverse(r);
        }
      });
    }
    if ('rules' in rule && Array.isArray(rule.rules)) {
      rule.rules.forEach((r) => {
        if (isRuleSetRule(r)) {
          traverse(r);
        }
      });
    }
  };

  if (rules) {
    rules.forEach((rule: unknown) => {
      if (isRuleSetRule(rule)) {
        traverse(rule);
      }
    });
  }
  return collectedAliases;
};

// Type guard to check if a value is a RuleSetRule
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
): Record<string, ExtendedSharedConfig> => {
  const aliases = {
    ssr: 'next/dist/server/route-modules/app-page/vendored/ssr/react.js',
    rsc: 'next/dist/server/route-modules/app-page/vendored/rsc/react.js',
    browser: 'next/dist/compiled/react',
    original: 'react',
  };

  const reactVersion = getReactVersionSafely(aliases.browser, compiler.context);

  // Client-side configuration
  return {
    'react-original': {
      request: aliases.original,
      singleton: true,
      shareScope: 'default',
      shareKey: 'react',
    },
    // Direct import of the browser alias path
    'react-direct': {
      request: aliases.browser,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      import:
        safeRequireResolve(aliases.browser, { paths: [compiler.context] }) ||
        false,
      version: reactVersion,
      shareKey: 'react',
    },
    // User requests 'react'
    'react-user': {
      request: 'react',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      import:
        safeRequireResolve(aliases.browser, { paths: [compiler.context] }) ||
        false,
      version: reactVersion,
      shareKey: 'react',
    },
    // SSR layer - direct import
    'react-ssr-direct': {
      request: aliases.ssr,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(aliases.ssr, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react',
    },
    // SSR layer - user request
    'react-ssr-user': {
      request: 'react',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(aliases.ssr, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react',
    },
    // RSC layer - direct import
    'react-rsc-direct': {
      request: aliases.rsc,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(aliases.rsc, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react',
    },
    // RSC layer - user request
    'react-rsc-user': {
      request: 'react',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(aliases.rsc, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react',
    },
  };
};

/**
 * Function defining the React-JSX-Runtime related packages group for client side
 */
export const getReactJsxRuntimeGroupClient = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  const aliases = {
    ssr: 'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js',
    rsc: 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime.js',
    browser: 'next/dist/compiled/react/jsx-runtime',
    original: 'react/jsx-runtime',
  };

  // Use React's version since jsx-runtime is part of React
  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  // Client-side configuration
  return {
    'react/jsx-runtime-original': {
      request: aliases.original,
      singleton: true,
      shareScope: 'default',
      shareKey: 'react/jsx-runtime',
    },
    // Direct import of the browser alias path
    'react/jsx-runtime-direct': {
      request: aliases.browser,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      import:
        safeRequireResolve(aliases.browser, { paths: [compiler.context] }) ||
        false,
      version: reactVersion,
      shareKey: 'react/jsx-runtime',
    },
    // User requests 'react/jsx-runtime'
    'react/jsx-runtime-user': {
      request: 'react/jsx-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      import:
        safeRequireResolve(aliases.browser, { paths: [compiler.context] }) ||
        false,
      version: reactVersion,
      shareKey: 'react/jsx-runtime',
    },
    // SSR layer - direct import
    'react/jsx-runtime-ssr-direct': {
      request: aliases.ssr,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(aliases.ssr, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-runtime',
    },
    // SSR layer - user request
    'react/jsx-runtime-ssr-user': {
      request: 'react/jsx-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(aliases.ssr, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-runtime',
    },
    // RSC layer - direct import
    'react/jsx-runtime-rsc-direct': {
      request: aliases.rsc,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(aliases.rsc, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-runtime',
    },
    // RSC layer - user request
    'react/jsx-runtime-rsc-user': {
      request: 'react/jsx-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(aliases.rsc, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-runtime',
    },
  };
};

/**
 * Function defining the React-DOM related packages group for client side
 */
export const getReactDomGroupClient = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  const aliases = {
    ssr: 'next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js',
    rsc: 'next/dist/server/route-modules/app-page/vendored/rsc/react-dom.js',
    browser: 'next/dist/compiled/react-dom',
    original: 'react-dom',
  };

  const reactDomVersion = getReactVersionSafely(
    aliases.browser,
    compiler.context,
  );

  // Client-side configuration
  return {
    'react-dom-original': {
      request: aliases.original,
      singleton: true,
      shareScope: 'default',
      shareKey: 'react-dom',
    },
    // Direct import of the browser alias path
    'react-dom-direct': {
      request: aliases.browser,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      import:
        safeRequireResolve(aliases.browser, { paths: [compiler.context] }) ||
        false,
      version: reactDomVersion,
      shareKey: 'react-dom',
    },
    // User requests 'react-dom'
    'react-dom-user': {
      request: 'react-dom',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      import:
        safeRequireResolve(aliases.browser, { paths: [compiler.context] }) ||
        false,
      version: reactDomVersion,
      shareKey: 'react-dom',
    },
    // SSR layer - direct import
    'react-dom-ssr-direct': {
      request: aliases.ssr,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(aliases.ssr, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom',
    },
    // SSR layer - user request
    'react-dom-ssr-user': {
      request: 'react-dom',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(aliases.ssr, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom',
    },
    // RSC layer - direct import
    'react-dom-rsc-direct': {
      request: aliases.rsc,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(aliases.rsc, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom',
    },
    // RSC layer - user request
    'react-dom-rsc-user': {
      request: 'react-dom',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(aliases.rsc, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom',
    },
  };
};

/**
 * Function defining the React-DOM/Client related packages group for client side
 */
export const getReactDomClientGroupClient = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  const aliases = {
    ssr: 'next/dist/server/route-modules/app-page/vendored/ssr/react-dom-client.js',
    rsc: 'next/dist/server/route-modules/app-page/vendored/rsc/react-dom-client.js',
    browser: 'next/dist/compiled/react-dom/client',
    original: 'react-dom/client',
  };

  const reactDomVersion = getReactVersionSafely(
    aliases.browser,
    compiler.context,
  );

  // Client-side configuration
  return {
    'react-dom/client-original': {
      request: aliases.original,
      singleton: true,
      shareScope: 'default',
      shareKey: 'react-dom/client',
    },
    // Direct import of the browser alias path
    'react-dom/client-direct': {
      request: aliases.browser,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      import:
        safeRequireResolve(aliases.browser, { paths: [compiler.context] }) ||
        false,
      version: reactDomVersion,
      shareKey: 'react-dom/client',
    },
    // User requests 'react-dom/client'
    'react-dom/client-user': {
      request: 'react-dom/client',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      import:
        safeRequireResolve(aliases.browser, { paths: [compiler.context] }) ||
        false,
      version: reactDomVersion,
      shareKey: 'react-dom/client',
    },
    // SSR layer - direct import
    'react-dom/client-ssr-direct': {
      request: aliases.ssr,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(aliases.ssr, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom/client',
    },
    // SSR layer - user request
    'react-dom/client-ssr-user': {
      request: 'react-dom/client',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(aliases.ssr, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom/client',
    },
    // RSC layer - direct import
    'react-dom/client-rsc-direct': {
      request: aliases.rsc,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(aliases.rsc, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom/client',
    },
    // RSC layer - user request
    'react-dom/client-rsc-user': {
      request: 'react-dom/client',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(aliases.rsc, { paths: [compiler.context] }) || false,
      version: reactDomVersion,
      shareKey: 'react-dom/client',
    },
  };
};

/**
 * Function defining the React-JSX-Dev-Runtime related packages group for client side
 */
export const getReactJsxDevRuntimeGroupClient = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  const aliases = {
    ssr: 'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js',
    rsc: 'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js',
    browser: 'next/dist/compiled/react/jsx-dev-runtime',
    original: 'react/jsx-dev-runtime',
  };

  // Use React's version since jsx-dev-runtime is part of React
  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  // Client-side configuration
  return {
    'react/jsx-dev-runtime-original': {
      request: aliases.original,
      singleton: true,
      shareScope: 'default',
      shareKey: 'react/jsx-dev-runtime',
    },
    // Direct import of the browser alias path
    'react/jsx-dev-runtime-direct': {
      request: aliases.browser,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      import:
        safeRequireResolve(aliases.browser, { paths: [compiler.context] }) ||
        false,
      version: reactVersion,
      shareKey: 'react/jsx-dev-runtime',
    },
    // User requests 'react/jsx-dev-runtime'
    'react/jsx-dev-runtime-user': {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      issuerLayer: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      shareScope: WEBPACK_LAYERS_NAMES.appPagesBrowser,
      import:
        safeRequireResolve(aliases.browser, { paths: [compiler.context] }) ||
        false,
      version: reactVersion,
      shareKey: 'react/jsx-dev-runtime',
    },
    // SSR layer - direct import
    'react/jsx-dev-runtime-ssr-direct': {
      request: aliases.ssr,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(aliases.ssr, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-dev-runtime',
    },
    // SSR layer - user request
    'react/jsx-dev-runtime-ssr-user': {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        safeRequireResolve(aliases.ssr, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-dev-runtime',
    },
    // RSC layer - direct import
    'react/jsx-dev-runtime-rsc-direct': {
      request: aliases.rsc,
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(aliases.rsc, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-dev-runtime',
    },
    // RSC layer - user request
    'react/jsx-dev-runtime-rsc-user': {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        safeRequireResolve(aliases.rsc, { paths: [compiler.context] }) || false,
      version: reactVersion,
      shareKey: 'react/jsx-dev-runtime',
    },
  };
};

/**
 * Generates the appropriate share scope for Next.js internals based on the compiler context.
 * @param {Compiler} compiler - The webpack compiler instance.
 * @returns {moduleFederationPlugin.SharedObject} - The generated share scope.
 */
export const getNextInternalsShareScopeClient = (
  compiler: Compiler,
): moduleFederationPlugin.SharedObject => {
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

  // Combine all groups
  return {
    ...reactGroup,
    ...reactDomGroup,
    ...reactDomClientGroup,
    ...reactJsxDevRuntimeGroup,
    ...reactJsxRuntimeGroup,
  };
};
