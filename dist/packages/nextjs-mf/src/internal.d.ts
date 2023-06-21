import type { SharedObject } from '@module-federation/utilities';
/**
 * @typedef SharedObject
 * @type {object}
 * @property {object} [key] - The key representing the shared object's package name.
 * @property {boolean} key.singleton - Whether the shared object should be a singleton.
 * @property {boolean} key.requiredVersion - Whether a specific version of the shared object is required.
 * @property {boolean} key.eager - Whether the shared object should be eagerly loaded.
 * @property {boolean} key.import - Whether the shared object should be imported or not.
 */
export declare const DEFAULT_SHARE_SCOPE: SharedObject;
/**
 * A default share scope for the browser environment.
 * It takes the DEFAULT_SHARE_SCOPE and sets eager to true for all entries.
 * The module hoisting system relocates these modules into the right runtime and out of the remote
 *
 * @type {SharedObject}
 */
export declare const DEFAULT_SHARE_SCOPE_BROWSER: SharedObject;
/**
 * Parses the remotes object, checking if they are using a custom promise template or not.
 * If it's a custom promise template, the remote syntax is parsed to get the module name and version number.
 *
 * @param {Record<string, any>} remotes - The remotes object to be parsed.
 * @returns {Record<string, string>} - The parsed remotes object.
 */
export declare const parseRemotes: (remotes: Record<string, any>) => Record<string, string>;
/**
 * Gets the delegate modules from the remotes object.
 *
 * @param {Record<string, any>} remotes - The remotes object containing delegates.
 * @returns {Record<string, string>} - The delegate modules from the remotes object.
 */
export declare const getDelegates: (remotes: Record<string, any>) => Record<string, string>;
/**
 * Converts an array of Error objects into a single string with formatted error messages,
 * separated by newline characters.
 *
 * @param {Error[]} err - The array of Error objects.
 * @returns {string} - The combined formatted error messages as a single string.
 */
export declare const toDisplayErrors: (err: Error[]) => string;
