export type InputFileSystem = import('./fs').InputFileSystem;
export type ErrorFirstCallback = (error: Error | null, result?: Buffer) => void;
/**
 * Get scheme if specifier is an absolute URL specifier
 * e.g. Absolute specifiers like 'file:///user/webpack/index.js'
 * https://tools.ietf.org/html/rfc3986#section-3.1
 * @param {string} specifier specifier
 * @returns {string|undefined} scheme if absolute URL specifier provided
 */
export function getScheme(specifier: string): string | undefined;
/**
 * @param {string} specifier specifier
 * @returns {string | null | undefined} protocol if absolute URL specifier provided
 */
export function getProtocol(specifier: string): string | null | undefined;
