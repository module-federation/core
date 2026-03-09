export const makePathsAbsolute: MakeCacheableWithContextResult & {
  bindCache: BindCacheForContext;
  bindContextCache: BindContextCacheForContext;
};
export const makePathsRelative: MakeCacheableWithContextResult & {
  bindCache: BindCacheForContext;
  bindContextCache: BindContextCacheForContext;
};
export const parseResource: MakeCacheableResult<ParsedResource> & {
  bindCache: BindCache<ParsedResource>;
};
export const parseResourceWithoutFragment: MakeCacheableResult<ParsedResourceWithoutFragment> & {
  bindCache: BindCache<ParsedResourceWithoutFragment>;
};
export type AssociatedObjectForCache = EXPECTED_OBJECT;
export type MakeCacheableResult<T> = (
  value: string,
  cache?: AssociatedObjectForCache,
) => T;
export type BindCacheResultFn<T> = (value: string) => T;
export type BindCache<T> = (
  cache: AssociatedObjectForCache,
) => BindCacheResultFn<T>;
export type MakeCacheableWithContextResult = (
  context: string,
  value: string,
  associatedObjectForCache?: AssociatedObjectForCache,
) => string;
export type BindCacheForContextResultFn = (
  context: string,
  value: string,
) => string;
export type BindContextCacheForContextResultFn = (value: string) => string;
export type BindCacheForContext = (
  associatedObjectForCache?: AssociatedObjectForCache,
) => BindCacheForContextResultFn;
export type BindContextCacheForContext = (
  value: string,
  associatedObjectForCache?: AssociatedObjectForCache,
) => BindContextCacheForContextResultFn;
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
export const absolutify: MakeCacheableWithContextResult & {
  bindCache: BindCacheForContext;
  bindContextCache: BindContextCacheForContext;
};
export const contextify: MakeCacheableWithContextResult & {
  bindCache: BindCacheForContext;
  bindContextCache: BindContextCacheForContext;
};
/**
 * @param {string} filename the filename which should be undone
 * @param {string} outputPath the output path that is restored (only relevant when filename contains "..")
 * @param {boolean} enforceRelative true returns ./ for empty paths
 * @returns {string} repeated ../ to leave the directory of the provided filename to be back on output dir
 */
export function getUndoPath(
  filename: string,
  outputPath: string,
  enforceRelative: boolean,
): string;
