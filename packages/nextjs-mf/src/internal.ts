import type {
  ModuleFederationPluginOptions,
  SharedConfig,
  SharedObject,
} from '@module-federation/utilities';
import { createDelegatedModule } from '@module-federation/utilities';
import { isRequiredVersion } from '@module-federation/enhanced/src/lib/sharing/utils';
import { parseOptions } from '@module-federation/enhanced/src/lib/container/options';

/**
 * @typedef SharedObject
 * @type {object}
 * @property {object} [key] - The key representing the shared object's package name.
 * @property {boolean} key.singleton - Whether the shared object should be a singleton.
 * @property {boolean} key.requiredVersion - Whether a specific version of the shared object is required.
 * @property {boolean} key.eager - Whether the shared object should be eagerly loaded.
 * @property {boolean} key.import - Whether the shared object should be imported or not.
 */
export const DEFAULT_SHARE_SCOPE: SharedObject = {
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
  '@module-federation/utilities': {
    eager: true,
    version: require('@module-federation/utilities/package.json').version,
    requiredVersion: require('@module-federation/utilities/package.json')
      .version,
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
  react: {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'react/': {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'react-dom/': {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
    import: false,
  },
  'react/jsx-dev-runtime': {
    singleton: true,
    requiredVersion: undefined,
    import: undefined,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: undefined,
    // import: false,
  },
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

/**
 * Defines a default share scope for the browser environment.
 * This function takes the DEFAULT_SHARE_SCOPE and sets eager to undefined and import to undefined for all entries.
 * For 'react', 'react-dom', 'next/router', and 'next/link', it sets eager to true.
 * The module hoisting system relocates these modules into the right runtime and out of the remote.
 *
 * @type {SharedObject}
 * @returns {SharedObject} - The modified share scope for the browser environment.
 */

export const DEFAULT_SHARE_SCOPE_BROWSER: SharedObject = Object.entries(
  DEFAULT_SHARE_SCOPE,
).reduce((acc, item) => {
  const [key, value] = item as [string, SharedConfig];

  // Set eager and import to undefined for all entries, except for the ones specified above
  acc[key] = { ...value, import: undefined };

  return acc;
}, {} as SharedObject);

/**
 * Checks if the remote value is an internal or promise delegate module reference.
 *
 * @param {string} value - The remote value to check.
 * @returns {boolean} - True if the value is an internal or promise delegate module reference, false otherwise.
 */
const isInternalOrPromise = (value: string): boolean =>
  ['internal ', 'promise '].some((prefix) => value.startsWith(prefix));

/**
 * Checks if the remote value is using the standard remote syntax.
 *
 * @param {string} value - The remote value to check.
 * @returns {boolean} - True if the value is using the standard remote syntax, false otherwise.
 */
const isStandardRemoteSyntax = (value: string): boolean => {
  return value.includes('@');
};
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
 * This function validates the type of the shared item and constructs a shared configuration object based on the item and key.
 * If the item is identical to the key or if the item does not necessitate a specific version,
 * the function returns an object with the import property set to the item.
 * Otherwise, it returns an object with the import property set to the key and the requiredVersion property set to the item.
 *
 * @param {string | string[]} item - The shared item to be validated and used to construct the shared configuration object. It can be a string or an array of strings.
 * @param {string} key - The key associated with the shared item.
 * @returns {object} - The constructed shared configuration object.
 * @throws {Error} - An error is thrown if the item type is not a string or an array of strings.
 */
const getSharedConfig = (item: string | string[], key: string) => {
  if (Array.isArray(item)) {
    // This handles the case where item is an array
    // Replace the following line with your actual logic
    return item.map((i) => ({
      import: i === key || !isRequiredVersion(i) ? i : key,
      requiredVersion: i === key || !isRequiredVersion(i) ? undefined : i,
    }));
  } else if (typeof item === 'string') {
    // Handle the case where item is a string
    return {
      import: item === key || !isRequiredVersion(item) ? item : key,
      requiredVersion:
        item === key || !isRequiredVersion(item) ? undefined : item,
    };
  } else {
    throw new Error('Unexpected type in shared');
  }
};

/**
 * Parses the share options from the provided ModuleFederationPluginOptions object and constructs a new object containing all shared configurations.
 * This newly constructed object is then used as the value for the 'shared' property of the Module Federation Plugin Options.
 * The function uses the 'parseOptions' utility function from webpack to parse the 'shared' property of the provided options object.
 * The 'getSharedConfig' function is used as the 'config' argument for 'parseOptions' to construct the shared configuration object for each shared item.
 * The 'item' argument for 'parseOptions' is a function that simply returns the item as it is.
 * The function then reduces the parsed shared options into a new object with the shared configuration for each shared item.
 *
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions object to parse the share options from.
 * @returns {Record<string, SharedConfig>} - An object containing the shared configuration for each shared item.
 */
const parseShareOptions = (options: ModuleFederationPluginOptions) => {
  if (!options.shared) return options;
  const sharedOptions: [string, SharedConfig][] = parseOptions(
    options.shared,
    getSharedConfig,
    (item: any) => item,
  );

  return sharedOptions.reduce(
    (acc, [key, options]) => {
      acc[key] = {
        import: options.import,
        shareKey: options.shareKey || key,
        shareScope: options.shareScope,
        requiredVersion: options.requiredVersion,
        strictVersion: options.strictVersion,
        singleton: options.singleton,
        packageName: options.packageName,
        eager: options.eager,
      };
      return acc;
    },
    {} as Record<string, SharedConfig>,
  );
};

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
