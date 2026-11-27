export const makePathsAbsolute: MakeCacheableWithContextResult & {
    bindCache: BindCacheForContext;
    bindContextCache: BindContextCacheForContext;
};
export const parseResourceWithoutFragment: MakeCacheableResult<ParsedResourceWithoutFragment> & {
    bindCache: BindCache<ParsedResourceWithoutFragment>;
};
export type AssociatedObjectForCache = EXPECTED_OBJECT;
/**
 * Defines the make cacheable result type used by this module.
 */
export type MakeCacheableResult<T> = (value: string, cache?: AssociatedObjectForCache) => T;
/**
 * Defines the bind cache result fn type used by this module.
 */
export type BindCacheResultFn<T> = (value: string) => T;
/**
 * Defines the bind cache type used by this module.
 */
export type BindCache<T> = (cache: AssociatedObjectForCache) => BindCacheResultFn<T>;
export type MakeCacheableWithContextResult = (context: string, value: string, associatedObjectForCache?: AssociatedObjectForCache) => string;
export type BindCacheForContextResultFn = (context: string, value: string) => string;
export type BindContextCacheForContextResultFn = (value: string) => string;
export type BindCacheForContext = (associatedObjectForCache?: AssociatedObjectForCache) => BindCacheForContextResultFn;
export type BindContextCacheForContext = (value: string, associatedObjectForCache?: AssociatedObjectForCache) => BindContextCacheForContextResultFn;
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
export const ABSOLUTE_PATH_REGEXP: RegExp;
export const NODE_MODULES_REGEXP: RegExp;
export const RELATIVE_PATH_PREFIX_REGEXP: RegExp;
export const RESOLVABLE_SPECIFIER_REGEXP: RegExp;
export const WINDOWS_ABS_PATH_REGEXP: RegExp;
export const WINDOWS_PATH_SEPARATOR_REGEXP: RegExp;
export const absolutify: MakeCacheableWithContextResult & {
    bindCache: BindCacheForContext;
    bindContextCache: BindContextCacheForContext;
};
export const contextify: MakeCacheableWithContextResult & {
    bindCache: BindCacheForContext;
    bindContextCache: BindContextCacheForContext;
};
/**
 * Turns a source path into a `webpack://`-prefixed, context-relative source
 * URL, as used for the `sources` of module-level source maps.
 * @param {string} context absolute context path
 * @param {string} source a source path
 * @param {AssociatedObjectForCache=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} new source path
 */
export function contextifySourceUrl(context: string, source: string, associatedObjectForCache?: AssociatedObjectForCache | undefined): string;
/**
 * Escape `#` characters that appear inside a path request's directory portion
 * with the `\0#` escape recognized by enhanced-resolve, so a project located at
 * a path like `/home/user/proj#1/` (or `./proj#1/`) resolves correctly. Applies
 * to absolute paths (Unix or Windows) and relative paths (starting with `./` or
 * `../`). Only triggers when a query string is present, because that is the case
 * where the resolver's parseIdentifier fails (without a `?`, the resolver
 * handles directory `#` via its own fallback). A `#` after the last path
 * separator is left alone so that explicit fragment requests like
 * `/abs/path/file.js#fragment` still behave the same. Bare module specifiers
 * are not touched. Already-escaped `\0#` sequences are preserved so the
 * explicit opt-out remains stable.
 * @param {string} request request to potentially escape
 * @returns {string} request with directory `#` characters escaped
 */
export function escapeHashInPathRequest(request: string): string;
/**
 * Converts a file URL to the path it names. Any other value is returned
 * unchanged, so this is safe to apply to an option that also takes a path.
 * @param {string} pathOrUrl an absolute path or a file URL
 * @returns {string} an absolute path
 */
export function fileUrlToPath(pathOrUrl: string): string;
/**
 * The basename a request lends to what it is emitted as, so `./my-script.js`
 * names `my-script`. A `data:` request carries no path and so no name.
 * @param {string} request a request
 * @returns {string | undefined} the basename without extension, when it has one
 */
export function getRequestBaseName(request: string): string | undefined;
/**
 * Returns repeated ../ to leave the directory of the provided filename to be back on output dir.
 * @param {string} filename the filename which should be undone
 * @param {string} outputPath the output path that is restored (only relevant when filename contains "..")
 * @param {boolean} enforceRelative true returns ./ for empty paths
 * @returns {string} repeated ../ to leave the directory of the provided filename to be back on output dir
 */
export function getUndoPath(filename: string, outputPath: string, enforceRelative: boolean): string;
/** @typedef {EXPECTED_OBJECT} AssociatedObjectForCache */
/**
 * Defines the make cacheable result type used by this module.
 * @template T
 * @typedef {(value: string, cache?: AssociatedObjectForCache) => T} MakeCacheableResult
 */
/**
 * Defines the bind cache result fn type used by this module.
 * @template T
 * @typedef {(value: string) => T} BindCacheResultFn
 */
/**
 * Defines the bind cache type used by this module.
 * @template T
 * @typedef {(cache: AssociatedObjectForCache) => BindCacheResultFn<T>} BindCache
 */
/**
 * Returns } cacheable function.
 * @template T
 * @param {((value: string) => T)} realFn real function
 * @returns {MakeCacheableResult<T> & { bindCache: BindCache<T> }} cacheable function
 */
export function makeCacheable<T>(realFn: ((value: string) => T)): MakeCacheableResult<T> & {
    bindCache: BindCache<T>;
};
export const makePathsRelative: MakeCacheableWithContextResult & {
    bindCache: BindCacheForContext;
    bindContextCache: BindContextCacheForContext;
};
/**
 * A source map's source URL in the normal form source map readers resolve it
 * to (`resolve-uri` with no base), so `./a/../b.js` reads `./b.js`.
 * @param {string} url a source map's `sourceRoot` and source, joined
 * @returns {string} the URL, normalized
 */
export function normalizeSourceMapUrl(url: string): string;
export const parseResource: MakeCacheableResult<ParsedResource> & {
    bindCache: BindCache<ParsedResource>;
};
/**
 * Relative path to request.
 * @param {string} relativePath relative path
 * @returns {string} request
 */
export function relativePathToRequest(relativePath: string): string;
/**
 * Quotes a string as a JS string literal safe to inline in generated code.
 * `JSON.stringify` leaves U+2028/U+2029 raw, but both terminate a JS string
 * literal (valid in JSON, not in JS), so escape them (matches JsonGenerator).
 * @param {string} str raw string
 * @returns {string} a quoted, inline-safe JS string literal
 */
export function toJsStringLiteral(str: string): string;
