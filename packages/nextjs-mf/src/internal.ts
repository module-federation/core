import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';
import type { Compiler } from 'webpack';
import type {
  SharedConfig,
  SharedObject,
} from '@module-federation/enhanced/src/declarations/plugins/sharing/SharePlugin';
import { getReactVersionSafely } from './internal-helpers';

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

// Group Next.js related packages
const nextGroup = {
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
    requiredVersion: undefined,
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
};

// Group styled-jsx related packages
const styledJsxGroup = {
  'styled-jsx': {
    singleton: true,
    import: undefined,
    version: require('styled-jsx/package.json').version,
    requiredVersion: '^' + require('styled-jsx/package.json').version,
  },
  'styled-jsx/style': {
    singleton: true,
    import: undefined,
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

// --- New getShareScope Function ---

/**
 * Generates the appropriate default share scope based on the compiler context.
 * @param {Compiler} compiler - The webpack compiler instance.
 * @returns {moduleFederationPlugin.SharedObject} - The generated share scope.
 */
export const getShareScope = (
  compiler: Compiler,
): moduleFederationPlugin.SharedObject => {
  const isClient = compiler.options.name === 'client';

  // Combine the groups manually
  let combinedScope: moduleFederationPlugin.SharedObject = {
    ...nextGroup,
    ...styledJsxGroup,
  };

  // Apply browser-specific modifications
  if (isClient) {
    combinedScope = Object.entries(combinedScope).reduce(
      (acc, [key, value]) => {
        // Ensure value is treated correctly if it's a simple string (though unlikely with current groups)
        const configValue =
          typeof value === 'string' ? { import: value } : value;

        // ONLY change `import: false` to `import: undefined` for client builds.
        // Keep other import values (strings, undefined) as they are.
        // if (configValue.import === false) {
        //    acc[key] = { ...configValue, import: undefined };
        // } else {
        //   // Otherwise, keep the original value entirely
        acc[key] = value;
        // }
        return acc;
      },
      {} as moduleFederationPlugin.SharedObject,
    );
  }

  return combinedScope;
};

/**
 * Checks if the remote value is an internal or promise delegate module reference.
 *
 * @param {string} value - The remote value to check.
 * @returns {boolean} - True if the value is an internal or promise delegate module reference, false otherwise.
 */
const isInternalOrPromise = (value: string): boolean =>
  ['internal ', 'promise '].some((prefix) => value.startsWith(prefix));

/**
 * Parses the remotes object and checks if they are using a custom promise template or not.
 * If it's a custom promise template, the remote syntax is parsed to get the module name and version number.
 * If the remote value is using the standard remote syntax, a delegated module is created.
 *
 * @param {Record<string, any>} remotes - The remotes object to be parsed.
 * @returns {Record<string, string>} - The parsed remotes object with either the original value,
 * the value for internal or promise delegate module reference, or the created delegated module.
 */
export const parseRemotes = (
  remotes: Record<string, any>,
): Record<string, string> => {
  return Object.entries(remotes).reduce(
    (acc, [key, value]) => {
      if (isInternalOrPromise(value)) {
        // If the value is an internal or promise delegate module reference, keep the original value
        return { ...acc, [key]: value };
      }

      return { ...acc, [key]: value };
    },
    {} as Record<string, string>,
  );
};
/**
 * Checks if the remote value is an internal delegate module reference.
 * An internal delegate module reference starts with the string 'internal '.
 *
 * @param {string} value - The remote value to check.
 * @returns {boolean} - Returns true if the value is an internal delegate module reference, otherwise returns false.
 */
const isInternalDelegate = (value: string): boolean => {
  return value.startsWith('internal ');
};
/**
 * Extracts the delegate modules from the provided remotes object.
 * This function iterates over the remotes object and checks if each remote value is an internal delegate module reference.
 * If it is, the function adds it to the returned object.
 *
 * @param {Record<string, any>} remotes - The remotes object containing delegate module references.
 * @returns {Record<string, string>} - An object containing only the delegate modules from the remotes object.
 */
export const getDelegates = (
  remotes: Record<string, any>,
): Record<string, string> =>
  Object.entries(remotes).reduce(
    (acc, [key, value]) =>
      isInternalDelegate(value) ? { ...acc, [key]: value } : acc,
    {},
  );

/**
 * Takes an error object and formats it into a displayable string.
 * If the error object contains a stack trace, it is appended to the error message.
 *
 * @param {Error} error - The error object to be formatted.
 * @returns {string} - The formatted error message string. If a stack trace is present in the error object, it is appended to the error message.
 */
const formatError = (error: Error): string => {
  let { message } = error;
  if (error.stack) {
    message += `\n${error.stack}`;
  }
  return message;
};

/**
 * Transforms an array of Error objects into a single string. Each error message is formatted using the 'formatError' function.
 * The resulting error messages are then joined together, separated by newline characters.
 *
 * @param {Error[]} err - An array of Error objects that need to be formatted and combined.
 * @returns {string} - A single string containing all the formatted error messages, separated by newline characters.
 */
export const toDisplayErrors = (err: Error[]): string => {
  return err.map(formatError).join('\n');
};

/**
 * Gets the Next.js version from compiler context
 * @param {Compiler} compiler - The webpack compiler instance
 * @returns {string} - The Next.js version
 */
const getNextVersion = (compiler: Compiler): string => {
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
 * Checks if the Next.js version is 14 or higher
 * @param {string} version - The Next.js version string
 * @returns {boolean} - True if version is 14+, false otherwise
 */
const isNextJs14Plus = (version: string): boolean => {
  const majorVersion = parseInt(version.split('.')[0], 10);
  return majorVersion >= 14;
};

/**
 * Version-aware function to get Next.js internals share scope
 * Uses existing client/server configurations based on Next.js version detection
 * @param {Compiler} compiler - The webpack compiler instance
 * @returns {SharedObject} - The generated share scope based on version and compiler type
 */
export const getNextInternalsShareScope = (
  compiler: Compiler,
): SharedObject => {
  const nextVersion = getNextVersion(compiler);
  const isNext14Plus = isNextJs14Plus(nextVersion);
  const isClient = compiler.options.name === 'client';

  if (isNext14Plus) {
    // For Next.js 14+, use the unified internal configuration
    if (isClient) {
      // Import and use the existing client configuration
      const {
        getNextInternalsShareScopeClient,
      } = require('./share-internals-client');
      return getNextInternalsShareScopeClient(compiler);
    } else {
      // Import and use the existing server configuration
      const {
        getNextInternalsShareScopeServer,
      } = require('./share-internals-server');
      return getNextInternalsShareScopeServer(compiler);
    }
  } else {
    // For older Next.js versions, return basic configuration
    return getBasicNextInternalsShareScope(compiler);
  }
};

/**
 * Basic share scope for older Next.js versions (pre-14)
 * Provides minimal sharing configuration for compatibility
 */
const getBasicNextInternalsShareScope = (compiler: Compiler): SharedObject => {
  if (!compiler.context) {
    console.warn('Compiler context is not available. Cannot resolve versions.');
    return {};
  }

  const nextVersion = getNextVersion(compiler);
  const reactVersion = getReactVersionSafely(
    'next/dist/compiled/react',
    compiler.context,
  );

  const basicConfigs: SharedConfig[] = [
    {
      request: 'react',
      singleton: true,
      requiredVersion: `^${reactVersion}`,
      shareKey: 'react',
      shareScope: 'default',
      version: reactVersion,
    },
    {
      request: 'react-dom',
      singleton: true,
      requiredVersion: `^${reactVersion}`,
      shareKey: 'react-dom',
      shareScope: 'default',
      version: reactVersion,
    },
    {
      request: 'next/router',
      singleton: true,
      requiredVersion: `^${nextVersion}`,
      shareKey: 'next/router',
      shareScope: 'default',
      version: nextVersion,
    },
  ];

  return basicConfigs.reduce(
    (acc, config, index) => {
      const key = `${config.request}-${config.shareKey}-${index}-basic`;
      acc[key] = config;
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};
