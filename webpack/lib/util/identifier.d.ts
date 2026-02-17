/**
 * @param {string} context context used to create relative path
 * @param {string} identifier identifier used to create relative path
 * @param {Object=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} the returned relative path
 */
export function makePathsRelative(
  context: string,
  identifier: string,
  associatedObjectForCache?: any | undefined,
): string;
export namespace makePathsRelative {
  /**
   * @param {Object=} associatedObjectForCache an object to which the cache will be attached
   * @returns {function(string, string): string} cached function
   */
  function bindCache(
    associatedObjectForCache?: any,
  ): (arg0: string, arg1: string) => string;
  /**
   * @param {string} context context used to create relative path
   * @param {Object=} associatedObjectForCache an object to which the cache will be attached
   * @returns {function(string): string} cached function
   */
  function bindContextCache(
    context: string,
    associatedObjectForCache?: any,
  ): (arg0: string) => string;
}
/**
 * @param {string} context context used to create relative path
 * @param {string} identifier identifier used to create relative path
 * @param {Object=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} the returned relative path
 */
export function makePathsAbsolute(
  context: string,
  identifier: string,
  associatedObjectForCache?: any | undefined,
): string;
export namespace makePathsAbsolute {}
/**
 * @param {string} str the path with query and fragment
 * @param {Object=} associatedObjectForCache an object to which the cache will be attached
 * @returns {ParsedResource} parsed parts
 */
export function parseResource(
  str: string,
  associatedObjectForCache?: any | undefined,
): ParsedResource;
export namespace parseResource {
  function bindCache(associatedObjectForCache: any): (str: any) => any;
}
/**
 * @param {string} str the path with query and fragment
 * @param {Object=} associatedObjectForCache an object to which the cache will be attached
 * @returns {ParsedResource} parsed parts
 */
export function parseResourceWithoutFragment(
  str: string,
  associatedObjectForCache?: any | undefined,
): ParsedResource;
export namespace parseResourceWithoutFragment {}
export function getUndoPath(
  filename: string,
  outputPath: string,
  enforceRelative: boolean,
): string;
export type MakeRelativePathsCache = {
  relativePaths?: Map<string, Map<string, string>> | undefined;
};
export type ParsedResource = {
  resource: string;
  path: string;
  query: string;
  fragment: string;
};
export type ParsedResourceWithoutFragment = {
  resource: string;
  path: string;
  query: string;
};
/**
 * @param {string} context context used to create relative path
 * @param {string} identifier identifier used to create relative path
 * @param {Object=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} the returned relative path
 */
export function contextify(
  context: string,
  identifier: string,
  associatedObjectForCache?: any | undefined,
): string;
export namespace contextify {}
/**
 * @param {string} context context used to create relative path
 * @param {string} identifier identifier used to create relative path
 * @param {Object=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} the returned relative path
 */
export function absolutify(
  context: string,
  identifier: string,
  associatedObjectForCache?: any | undefined,
): string;
export namespace absolutify {}
import path = require('path');
