import type {
  moduleFederationPlugin,
  sharePlugin,
} from '@module-federation/sdk';

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

const createSharedConfig = (
  name: string,
  layers: (string | undefined)[],
  options: { request?: string; import?: false | undefined } = {},
) => {
  return layers.reduce(
    (acc, layer) => {
      const key = layer ? `${layer}-${name}` : name;
      acc[key] = {
        singleton: true,
        requiredVersion: false,
        import: layer ? undefined : (options.import ?? false),
        shareKey: options.request ?? name,
        request: options.request ?? name,
        layer,
        issuerLayer: layer,
        shareScope: layer ? [layer] : undefined,
      };
      return acc;
    },
    {} as Record<string, ExtendedSharedConfig>,
  );
};

const defaultLayers = [
  WEBPACK_LAYERS_NAMES.reactServerComponents,
  WEBPACK_LAYERS_NAMES.serverSideRendering,
  undefined,
];

const navigationLayers = [
  WEBPACK_LAYERS_NAMES.reactServerComponents,
  WEBPACK_LAYERS_NAMES.serverSideRendering,
];

const reactShares = createSharedConfig('react', defaultLayers, {
  request: 'react',
  import: undefined,
});
const reactDomShares = createSharedConfig('react', defaultLayers, {
  request: 'react-dom',
});
const jsxRuntimeShares = createSharedConfig(
  'react/jsx-runtime',
  navigationLayers,
  {
    request: 'react/jsx-runtime',
    import: undefined,
  },
);
const jsxDevRuntimeShares = createSharedConfig(
  'react/jsx-dev-runtime',
  navigationLayers,
  {
    request: 'react/jsx-dev-runtime',
    import: undefined,
  },
);
const prefixReact = createSharedConfig('react/', defaultLayers, {
  request: 'react/',
  import: undefined,
});
const nextNavigationShares = createSharedConfig(
  'next-navigation',
  navigationLayers,
  { request: 'next/navigation' },
);

/**
 * @typedef SharedObject
 * @type {object}
 * @property {object} [key] - The key representing the shared object's package name.
 * @property {boolean} key.singleton - Whether the shared object should be a singleton.
 * @property {boolean} key.requiredVersion - Whether a specific version of the shared object is required.
 * @property {boolean} key.eager - Whether the shared object should be eagerly loaded.
 * @property {boolean} key.import - Whether the shared object should be imported or not.
 * @property {string} key.layer - The webpack layer this shared module belongs to.
 * @property {string|string[]} key.issuerLayer - The webpack layer that can import this shared module.
 */
// Group React related packages
const reactGroup = {
  // "react": {
  //   singleton: true,
  //   import: false
  // },
  'ssr-react': {
    requiredVersion: false,
    request: 'react',
    import: 'next/dist/server/route-modules/app-page/vendored/ssr/react.js',
    singleton: true,
    shareKey: 'react',
    layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
    issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
    shareScope: [WEBPACK_LAYERS_NAMES.serverSideRendering],
  },
  'rsc-react': {
    requiredVersion: false,
    singleton: true,
    shareKey: 'react',
    request: 'react',
    import: 'next/dist/server/route-modules/app-page/vendored/rsc/react.js',
    layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
    issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
    shareScope: [WEBPACK_LAYERS_NAMES.reactServerComponents],
  },
};

const reactJsxRuntimeGroup = {
  'react/jsx-dev-runtime': {
    singleton: true,
    import: false,
  },
  // "react/jsx-dev-runtime-ssr": {
  //   singleton: true,
  //   shareKey: 'react/jsx-dev-runtime',
  //   request: 'react/jsx-dev-runtime',
  //   layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
  //   issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
  //   shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
  // },
  // "react/jsx-dev-runtime-rsc": {
  //   request: 'react/jsx-dev-runtime',
  //   singleton: true,
  //   shareKey: 'react/jsx-dev-runtime',
  //   layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
  //   issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
  //   shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
  // }
};

// Group React-DOM related packages
const reactDomGroup = {
  // "react-dom": {
  //   singleton: true,
  //   import: false,
  // },
  // "rsc-react-dom": {
  //   singleton: true,
  //   shareKey: 'react-dom',
  //   request: 'react-dom',
  //   layer: WEBPACK_LAYERS_NAMES.reactServerComponents,
  //   issuerLayer: WEBPACK_LAYERS_NAMES.reactServerComponents,
  //   shareScope: WEBPACK_LAYERS_NAMES.reactServerComponents,
  // },
  // "react-dom-ssr": {
  //   request: 'react-dom',
  //   singleton: true,
  //   shareKey: 'react-dom',
  //   layer: WEBPACK_LAYERS_NAMES.serverSideRendering,
  //   issuerLayer: WEBPACK_LAYERS_NAMES.serverSideRendering,
  //   shareScope: WEBPACK_LAYERS_NAMES.serverSideRendering,
  // }
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

//@ts-ignore
export const DEFAULT_SHARE_SCOPE: moduleFederationPlugin.SharedObject = {
  ...reactGroup,
  ...reactDomGroup,
  // ...nextGroup,
  // ...styledJsxGroup,
  // ...reactJsxRuntimeGroup,
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

export const DEFAULT_SHARE_SCOPE_BROWSER: moduleFederationPlugin.SharedObject =
  Object.entries(DEFAULT_SHARE_SCOPE).reduce((acc, item) => {
    const [key, value] = item as [string, moduleFederationPlugin.SharedConfig];
    // if(key.startsWith(WEBPACK_LAYERS_NAMES.reactServerComponents) || key.startsWith(WEBPACK_LAYERS_NAMES.serverSideRendering)) {
    //   return acc
    // }
    //
    // if(key === 'next-navigation') {
    //   return acc;
    // }
    // Set eager and import to undefined for all entries, except for the ones specified above
    acc[key] = { ...value, import: undefined };

    return acc;
  }, {} as moduleFederationPlugin.SharedObject);

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
