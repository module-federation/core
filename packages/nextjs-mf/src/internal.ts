import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';
import type { Compiler } from 'webpack';

// Extend the SharedConfig type to include layer properties
type ExtendedSharedConfig = sharePlugin.SharedConfig & {
  layer?: string;
  issuerLayer?: string | string[];
  request?: string;
  shareKey?: string;
};

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

/**
 * Gets the alias for a given name from the compiler's alias configuration.
 * If the alias doesn't exist, it returns the fallback value.
 *
 * @param {Compiler} compiler - The webpack compiler instance
 * @param {string} aliasName - The name of the alias to look up
 * @param {string} fallback - The fallback value if the alias doesn't exist
 * @returns {string} - The alias value or fallback
 */
function getAlias(
  compiler: Compiler,
  aliasName: string,
  fallback: string,
): string {
  if (
    !compiler ||
    !compiler.options ||
    !compiler.options.resolve ||
    !compiler.options.resolve.alias
  ) {
    return fallback;
  }

  const alias = compiler.options.resolve.alias as Record<string, string>;

  return alias[aliasName] || alias[aliasName.replace('$', '')] || fallback;
}

// Function defining the React related packages group
const getReactGroup = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  const aliases = {
    ssr: getAlias(
      compiler,
      'react$',
      'next/dist/server/route-modules/app-page/vendored/ssr/react.js',
    ),
    rsc: getAlias(
      compiler,
      'react$',
      'next/dist/server/route-modules/app-page/vendored/rsc/react.js',
    ),
    browser: getAlias(compiler, 'react$', 'next/dist/compiled/react'),
  };

  const reactVersion = require(
    require.resolve(aliases.browser, { paths: [compiler.context] }),
  ).version;

  const createSharedConfig = (
    layer: keyof typeof WEBPACK_LAYERS_NAMES,
    alias: string,
    request: string,
    overrides?: Partial<ExtendedSharedConfig>,
  ) => {
    const baseConfig: ExtendedSharedConfig = {
      request,
      singleton: true,
      shareKey: 'react',
      layer: WEBPACK_LAYERS_NAMES[layer],
      issuerLayer: WEBPACK_LAYERS_NAMES[layer],
      shareScope: WEBPACK_LAYERS_NAMES[layer],
      import: alias,
      version: reactVersion,
    };
    return { ...baseConfig, ...overrides };
  };

  if (compiler.options.name === 'client') {
    const browserConfig = createSharedConfig(
      'appPagesBrowser',
      aliases.browser,
      'next/dist/compiled/react',
    );
    return {
      react: browserConfig,
      'react-app-userRequest': createSharedConfig(
        'appPagesBrowser',
        aliases.browser,
        'next/dist/compiled/react',
        { request: 'react' },
      ),
    };
  }

  // Server side configurations
  return {
    react: {
      singleton: true,
      import: false,
      shareKey: 'react',
      version: reactVersion,
    }, // Base react config for server
    'react-ssr-userRequest': createSharedConfig(
      'serverSideRendering',
      aliases.ssr,
      'react',
    ),
    'react-rsc-userRequest': createSharedConfig(
      'reactServerComponents',
      aliases.rsc,
      'react',
    ),
    'react-ssr': createSharedConfig(
      'serverSideRendering',
      aliases.ssr,
      'react',
      {
        requiredVersion: false,
        request: aliases.ssr,
      },
    ),
    'rsc-react': createSharedConfig(
      'reactServerComponents',
      aliases.rsc,
      'react',
      {
        requiredVersion: false,
        request: aliases.rsc,
      },
    ),
  };
};

// Function defining the React-JSX related packages group
const getReactJsxDevRuntimeGroup = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  // if(compiler.options.name === 'client') {
  //   return {
  //     'react/jsx-dev-runtime': {
  //       singleton: true,
  //     },
  //   }
  // }

  return {
    'react/jsx-dev-runtime': {
      singleton: true,
      import: false,
    },
    'react/jsx-dev-runtime-ssr': {
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      request: 'react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js',
    },
    'react/jsx-dev-runtime-rsc': {
      request: 'react/jsx-dev-runtime',
      singleton: true,
      shareKey: 'react/jsx-dev-runtime',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js',
    },
  };
};

// Function defining the React-JSX related packages group
const getReactJsxRuntimeGroup = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  // if(compiler.options.name === 'client') {
  //   return {
  //     'react/jsx-dev-runtime': {
  //       singleton: true,
  //     },
  //   }
  // }

  return {
    'react/jsx-runtime': {
      singleton: true,
      import: false,
    },
    'react/jsx-runtime-ssr': {
      singleton: true,
      shareKey: 'react/jsx-runtime',
      request: 'react/jsx-runtime',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js',
    },
    'react/jsx-runtime-rsc': {
      request: 'react/jsx-runtime',
      singleton: true,
      shareKey: 'react/jsx-runtime',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime.js',
    },
  };
};

// Function defining the React-DOM related packages group
const getReactDomGroup = (
  compiler: Compiler,
): Record<string, ExtendedSharedConfig> => {
  // if(compiler.options.name === 'client') {
  //   return {
  //     "react-dom": {
  //       singleton: true,
  //     },
  //   }
  // }
  return {
    'react-dom': {
      singleton: true,
      import: false,
    },
    'rsc-react-dom': {
      singleton: true,
      shareKey: 'react-dom',
      request: 'react-dom',
      import:
        'next/dist/server/route-modules/app-page/vendored/rsc/react-dom.js',
      layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
      shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
    },
    'react-dom-ssr': {
      request: 'react-dom',
      singleton: true,
      shareKey: 'react-dom',
      import:
        'next/dist/server/route-modules/app-page/vendored/ssr/react-dom.js',
      layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
      shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
    },
  };
};

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

  // Generate the base groups by calling the new functions
  const reactGroup = getReactGroup(compiler);
  const reactDomGroup = getReactDomGroup(compiler);
  const reactJsxDevRuntimeGroup = getReactJsxDevRuntimeGroup(compiler);
  const reactJsxRuntimeGroup = getReactJsxRuntimeGroup(compiler);

  // Combine the groups manually
  let combinedScope: moduleFederationPlugin.SharedObject = { ...reactGroup };
  if (compiler.options.name === 'server') {
    Object.keys(reactDomGroup).forEach((key) => {
      combinedScope[key] = reactDomGroup[key];
    });
    Object.keys(reactJsxDevRuntimeGroup).forEach((key) => {
      combinedScope[key] = reactJsxDevRuntimeGroup[key];
    });
    Object.keys(reactJsxRuntimeGroup).forEach((key) => {
      combinedScope[key] = reactJsxRuntimeGroup[key];
    });
  }

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
