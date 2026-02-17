export type Source = import("webpack-sources").Source;
/**
 * @param {Source} a a source
 * @param {Source} b another source
 * @returns {boolean} true, when both sources are equal
 */
export function isSourceEqual(a: Source, b: Source): boolean;
