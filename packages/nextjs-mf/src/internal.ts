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
  react: {
    singleton: true,
    requiredVersion: false,
    eager: true,
    import: false,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: false,
    import: undefined,
    eager: false,
  },
  'react/jsx-dev-runtime': {
    singleton: true,
    requiredVersion: false,
    import: undefined,
    eager: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
    eager: true,
    import: false,
  },
  'next/dynamic': {
    eager: false,
    requiredVersion: false,
    singleton: true,
    import: undefined,
  },
  'styled-jsx': {
    requiredVersion: false,
    singleton: true,
    import: undefined,
    eager: false,
  },
  'styled-jsx/style': {
    requiredVersion: false,
    singleton: true,
    import: undefined,
    eager: false,
  },
  'next/link': {
    requiredVersion: false,
    singleton: true,
    import: undefined,
    eager: false,
  },
  'next/router': {
    requiredVersion: false,
    singleton: true,
    import: undefined,
    eager: undefined,
  },
  'next/script': {
    requiredVersion: false,
    singleton: true,
    import: undefined,
    eager: false,
  },
  'next/head': {
    requiredVersion: false,
    singleton: true,
    import: undefined,
    eager: undefined,
  },
};

/**
 * A default share scope for the browser environment.
 * It takes the DEFAULT_SHARE_SCOPE and sets eager to true for all entries.
 * The module hoisting system relocates these modules into the right runtime and out of the remote
 *
 * @type {SharedObject}
 */
export const DEFAULT_SHARE_SCOPE_BROWSER: SharedObject = Object.entries(
  DEFAULT_SHARE_SCOPE
).reduce((acc, item) => {
  const [key, value] = item as [string, SharedConfig];

  acc[key] = { ...value, eager: false, import: undefined };

  return acc;
}, {} as SharedObject);

/**
 * Checks if the remote value is an internal or promise delegate module reference.
 *
 * @param {string} value - The remote value to check.
 * @returns {boolean} - True if the value is an internal or promise delegate module reference, false otherwise.
 */
const isInternalOrPromise = (value: string): boolean => {
  return value.startsWith('internal ') || value.startsWith('promise ');
};

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
 * Parses the remotes object, checking if they are using a custom promise template or not.
 * If it's a custom promise template, the remote syntax is parsed to get the module name and version number.
 *
 * @param {Record<string, any>} remotes - The remotes object to be parsed.
 * @returns {Record<string, string>} - The parsed remotes object.
 */
export const parseRemotes = (
  remotes: Record<string, any>
): Record<string, string> => {
  return Object.entries(remotes).reduce((acc, [key, value]) => {
    if (isInternalOrPromise(value)) {
      return { ...acc, [key]: value };
    }

    if (isStandardRemoteSyntax(value)) {
      return {
        ...acc,
        [key]: createDelegatedModule(require.resolve('./default-delegate.js'), {
          remote: value,
        }),
      };
    }

    return { ...acc, [key]: value };
  }, {} as Record<string, string>);
};

/**
 * Checks if the remote value is an internal delegate module reference.
 *
 * @param {string} value - The remote value to check.
 * @returns {boolean} - True if the value is an internal delegate module reference, false otherwise.
 */
const isInternalDelegate = (value: string): boolean => {
  return value.startsWith('internal ');
};

/**
 * Gets the delegate modules from the remotes object.
 *
 * @param {Record<string, any>} remotes - The remotes object containing delegates.
 * @returns {Record<string, string>} - The delegate modules from the remotes object.
 */
export const getDelegates = (
  remotes: Record<string, any>
): Record<string, string> => {
  return Object.entries(remotes).reduce((acc, [key, value]) => {
    if (isInternalDelegate(value)) {
      return { ...acc, [key]: value };
    }

    return acc;
  }, {} as Record<string, string>);
};

/**
 * Validates the shared item type and returns the shared config object based on the item and key.
 *
 * @param {string} item - The shared item.
 * @param {string} key - The key for the shared item.
 * @returns {object} - The shared config object.
 * @throws {Error} - If the item type is not a string.
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
 * Parses the share options in ModuleFederationPluginOptions and creates a new object with all
 * of the shared configs. This object is then used as the value for the shared property
 * of Module Federation Plugin Options.
 *
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions object.
 * @returns {Record<string, SharedConfig>} - The parsed share options object.
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
 * Formats an error object into a displayable string.
 *
 * @param {Error} error - The error object to format.
 * @returns {string} - The formatted error string.
 */
const formatError = (error: Error): string => {
  let { message } = error;
  if (error.stack) {
    message += `\n${error.stack}`;
  }
  return message;
};

/**
 * Converts an array of Error objects into a single string with formatted error messages,
 * separated by newline characters.
 *
 * @param {Error[]} err - The array of Error objects.
 * @returns {string} - The combined formatted error messages as a single string.
 */
export const toDisplayErrors = (err: Error[]): string => {
  return err.map(formatError).join('\n');
};
