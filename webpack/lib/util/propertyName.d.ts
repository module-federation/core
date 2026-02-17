export const SAFE_IDENTIFIER: RegExp;
export const RESERVED_IDENTIFIER: Set<string>;
/**
 * @summary Returns a valid JS property name for the given property.
 * Certain strings like "default", "null", and names with whitespace are not
 * valid JS property names, so they are returned as strings.
 *
 * @param {string} prop property name to analyze
 * @returns {string} valid JS property name
 */
export function propertyName(prop: string): string;
