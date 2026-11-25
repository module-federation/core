export type SourceScore = "nginx" | "apache" | "iana" | "default";
/**
 * Get the default extension for a MIME type.
 * @param {string} type type
 * @returns {undefined | string} resolve extension
 */
export function extension(type: string): undefined | string;
/**
 * Lookup the MIME type for a file path/extension.
 * @param {string} path path
 * @returns {undefined | string} resolved MIME type
 */
export function lookup(path: string): undefined | string;
