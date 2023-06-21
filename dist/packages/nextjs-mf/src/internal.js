"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDisplayErrors = exports.getDelegates = exports.parseRemotes = exports.DEFAULT_SHARE_SCOPE_BROWSER = exports.DEFAULT_SHARE_SCOPE = void 0;
const utilities_1 = require("@module-federation/utilities");
const utils_1 = require("webpack/lib/sharing/utils");
const options_1 = require("webpack/lib/container/options");
/**
 * @typedef SharedObject
 * @type {object}
 * @property {object} [key] - The key representing the shared object's package name.
 * @property {boolean} key.singleton - Whether the shared object should be a singleton.
 * @property {boolean} key.requiredVersion - Whether a specific version of the shared object is required.
 * @property {boolean} key.eager - Whether the shared object should be eagerly loaded.
 * @property {boolean} key.import - Whether the shared object should be imported or not.
 */
exports.DEFAULT_SHARE_SCOPE = {
    'next/dynamic': {
        eager: false,
        requiredVersion: false,
        singleton: true,
        import: undefined,
    },
    'next/head': {
        eager: false,
        requiredVersion: false,
        singleton: true,
        import: undefined,
    },
    'next/link': {
        eager: true,
        requiredVersion: false,
        singleton: true,
        import: undefined,
    },
    'next/router': {
        requiredVersion: false,
        singleton: true,
        import: false,
        eager: false,
    },
    'next/script': {
        requiredVersion: false,
        singleton: true,
        import: undefined,
        eager: false,
    },
    react: {
        singleton: true,
        requiredVersion: false,
        eager: false,
        import: false,
    },
    'react-dom': {
        singleton: true,
        requiredVersion: false,
        eager: false,
        import: false,
    },
    'react/jsx-dev-runtime': {
        singleton: true,
        requiredVersion: false,
        import: undefined,
        eager: false,
    },
    'react/jsx-runtime': {
        singleton: true,
        requiredVersion: false,
        eager: false,
        import: false,
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
};
/**
 * A default share scope for the browser environment.
 * It takes the DEFAULT_SHARE_SCOPE and sets eager to true for all entries.
 * The module hoisting system relocates these modules into the right runtime and out of the remote
 *
 * @type {SharedObject}
 */
exports.DEFAULT_SHARE_SCOPE_BROWSER = Object.entries(exports.DEFAULT_SHARE_SCOPE).reduce((acc, item) => {
    const [key, value] = item;
    acc[key] = { ...value, eager: undefined, import: undefined };
    if (key === 'react' ||
        key === 'react-dom' ||
        key === 'next/router' ||
        key === 'next/link') {
        //@ts-ignore
        acc[key].eager = true;
    }
    return acc;
}, {});
/**
 * Checks if the remote value is an internal or promise delegate module reference.
 *
 * @param {string} value - The remote value to check.
 * @returns {boolean} - True if the value is an internal or promise delegate module reference, false otherwise.
 */
const isInternalOrPromise = (value) => {
    return value.startsWith('internal ') || value.startsWith('promise ');
};
/**
 * Checks if the remote value is using the standard remote syntax.
 *
 * @param {string} value - The remote value to check.
 * @returns {boolean} - True if the value is using the standard remote syntax, false otherwise.
 */
const isStandardRemoteSyntax = (value) => {
    return value.includes('@');
};
/**
 * Parses the remotes object, checking if they are using a custom promise template or not.
 * If it's a custom promise template, the remote syntax is parsed to get the module name and version number.
 *
 * @param {Record<string, any>} remotes - The remotes object to be parsed.
 * @returns {Record<string, string>} - The parsed remotes object.
 */
const parseRemotes = (remotes) => {
    return Object.entries(remotes).reduce((acc, [key, value]) => {
        if (isInternalOrPromise(value)) {
            return { ...acc, [key]: value };
        }
        if (isStandardRemoteSyntax(value)) {
            return {
                ...acc,
                [key]: (0, utilities_1.createDelegatedModule)(require.resolve('./default-delegate.js'), {
                    remote: value,
                }),
            };
        }
        return { ...acc, [key]: value };
    }, {});
};
exports.parseRemotes = parseRemotes;
/**
 * Checks if the remote value is an internal delegate module reference.
 *
 * @param {string} value - The remote value to check.
 * @returns {boolean} - True if the value is an internal delegate module reference, false otherwise.
 */
const isInternalDelegate = (value) => {
    return value.startsWith('internal ');
};
/**
 * Gets the delegate modules from the remotes object.
 *
 * @param {Record<string, any>} remotes - The remotes object containing delegates.
 * @returns {Record<string, string>} - The delegate modules from the remotes object.
 */
const getDelegates = (remotes) => {
    return Object.entries(remotes).reduce((acc, [key, value]) => {
        if (isInternalDelegate(value)) {
            return { ...acc, [key]: value };
        }
        return acc;
    }, {});
};
exports.getDelegates = getDelegates;
/**
 * Validates the shared item type and returns the shared config object based on the item and key.
 *
 * @param {string} item - The shared item.
 * @param {string} key - The key for the shared item.
 * @returns {object} - The shared config object.
 * @throws {Error} - If the item type is not a string.
 */
const getSharedConfig = (item, key) => {
    if (typeof item !== 'string') {
        throw new Error('Unexpected array in shared');
    }
    return item === key || !(0, utils_1.isRequiredVersion)(item)
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
const parseShareOptions = (options) => {
    const sharedOptions = (0, options_1.parseOptions)(options.shared, getSharedConfig, (item) => item);
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
    }, {});
};
/**
 * Formats an error object into a displayable string.
 *
 * @param {Error} error - The error object to format.
 * @returns {string} - The formatted error string.
 */
const formatError = (error) => {
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
const toDisplayErrors = (err) => {
    return err.map(formatError).join('\n');
};
exports.toDisplayErrors = toDisplayErrors;
//# sourceMappingURL=internal.js.map