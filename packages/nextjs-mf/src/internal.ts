import type {
  ModuleFederationPluginOptions,
  SharedConfig,
  SharedObject,
} from '@module-federation/utilities';
import { createDelegatedModule } from '@module-federation/utilities';

import { isRequiredVersion } from 'webpack/lib/sharing/utils';
import { parseOptions } from 'webpack/lib/container/options';

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
  // 'next/dynamic': {
  //   eager: false,
  //   requiredVersion: false,
  //   singleton: true,
  //   import: undefined,
  // },
  // 'next/head': {
  //   eager: false,
  //   requiredVersion: false,
  //   singleton: true,
  //   import: undefined,
  // },
  // 'next/link': {
  //   eager: true,
  //   requiredVersion: false,
  //   singleton: true,
  //   import: undefined,
  // },
  // 'next/router': {
  //   requiredVersion: false,
  //   singleton: true,
  //   import: false,
  //   eager: false,
  // },
  // 'next/image': {
  //   requiredVersion: false,
  //   singleton: true,
  //   import: undefined,
  //   eager: false,
  // },
  // 'next/script': {
  //   requiredVersion: false,
  //   singleton: true,
  //   import: undefined,
  //   eager: false,
  // },
  // react: {
  //   singleton: true,
  //   requiredVersion: false,
  //   eager: false,
  //   import: false,
  // },
  // 'react-dom': {
  //   singleton: true,
  //   requiredVersion: false,
  //   eager: false,
  //   import: false,
  // },
  // 'react/jsx-dev-runtime': {
  //   singleton: true,
  //   requiredVersion: false,
  //   import: undefined,
  //   eager: false,
  // },
  // 'react/jsx-runtime': {
  //   singleton: true,
  //   requiredVersion: false,
  //   eager: false,
  //   import: false,
  // },
  // 'styled-jsx': {
  //   requiredVersion: false,
  //   singleton: true,
  //   import: undefined,
  //   eager: false,
  // },
  // 'styled-jsx/style': {
  //   requiredVersion: false,
  //   singleton: true,
  //   import: undefined,
  //   eager: false,
  // },
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
  DEFAULT_SHARE_SCOPE
).reduce((acc, item) => {
  const [key, value] = item as [string, SharedConfig];

  // Initialize eager as true for 'react', 'react-dom', 'next/router', and 'next/link', otherwise undefined
  const eager = ['react', 'react-dom', 'next/router', 'next/link'].some(k => k === key) ? true : undefined;

  // Set eager and import to undefined for all entries, except for the ones specified above
  acc[key] = { ...value, eager, import: undefined };

  return acc;
}, {} as SharedObject);

/**
 * Checks if the remote value is an internal or promise delegate module reference.
 *
 * @param {string} value - The remote value to check.
 * @returns {boolean} - True if the value is an internal or promise delegate module reference, false otherwise.
 */
const isInternalOrPromise = (value: string): boolean => ['internal ', 'promise '].some(prefix => value.startsWith(prefix));

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
  remotes: Record<string, any>
): Record<string, string> => {
  return Object.entries(remotes).reduce((acc, [key, value]) => {
    if (isInternalOrPromise(value)) {
      // If the value is an internal or promise delegate module reference, keep the original value
      return { ...acc, [key]: value };
    }

    return { ...acc, [key]: value };


    if (isStandardRemoteSyntax(value)) {
      let resolvePath
      try {
        resolvePath = require.resolve('./default-delegate.cjs')
      } catch(e) {
        resolvePath = require.resolve('./default-delegate')
      }

      // If the value is using the standard remote syntax, create a delegated module
      return {
        ...acc,
        [key]: createDelegatedModule(resolvePath, {
          remote: value,
        }),
      };
    }

    // If none of the above conditions are met, keep the original value
    return { ...acc, [key]: value };
  }, {} as Record<string, string>);
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
export const getDelegates = (remotes: Record<string, any>): Record<string, string> =>
  Object.entries(remotes).reduce((acc, [key, value]) => isInternalDelegate(value) ? {...acc, [key]: value} : acc, {});

/**
 * Validates the shared item type and constructs a shared configuration object based on the item and key.
 * If the item is the same as the key or if the item does not require a specific version,
 * the function returns an object with the import property set to the item.
 * Otherwise, it returns an object with the import property set to the key and the requiredVersion property set to the item.
 *
 * @param {string} item - The shared item to be validated and used in the shared configuration object.
 * @param {string} key - The key associated with the shared item.
 * @returns {object} - The constructed shared configuration object.
 * @throws {Error} - Throws an error if the item type is not a string.
 */
const getSharedConfig = (item: string, key: string) => {
  if (typeof item !== 'string') {
    throw new Error('Unexpected array in shared');
  }

  return item === key || !isRequiredVersion(item)
    ? {
        import: item,
      }
    : {
        import: key,
        requiredVersion: item,
      };
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
  const sharedOptions: [string, SharedConfig][] = parseOptions(
    options.shared,
    getSharedConfig,
    (item: any) => item
  );

  return sharedOptions.reduce((acc, [key, options]) => {
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
  }, {} as Record<string, SharedConfig>);
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
