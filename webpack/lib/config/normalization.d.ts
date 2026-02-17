export type CacheOptions =
  import('../../declarations/WebpackOptions').CacheOptionsNormalized;
export type EntryDescriptionNormalized =
  import('../../declarations/WebpackOptions').EntryDescriptionNormalized;
export type EntryStatic =
  import('../../declarations/WebpackOptions').EntryStatic;
export type EntryStaticNormalized =
  import('../../declarations/WebpackOptions').EntryStaticNormalized;
export type Externals = import('../../declarations/WebpackOptions').Externals;
export type LibraryName =
  import('../../declarations/WebpackOptions').LibraryName;
export type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
export type ModuleOptionsNormalized =
  import('../../declarations/WebpackOptions').ModuleOptionsNormalized;
export type OptimizationRuntimeChunk =
  import('../../declarations/WebpackOptions').OptimizationRuntimeChunk;
export type OptimizationRuntimeChunkNormalized =
  import('../../declarations/WebpackOptions').OptimizationRuntimeChunkNormalized;
export type OutputNormalized =
  import('../../declarations/WebpackOptions').OutputNormalized;
export type Plugins = import('../../declarations/WebpackOptions').Plugins;
export type WebpackOptions =
  import('../../declarations/WebpackOptions').WebpackOptions;
export type WebpackOptionsNormalized =
  import('../../declarations/WebpackOptions').WebpackOptionsNormalized;
export type Entrypoint = import('../Entrypoint');
/**
 * @param {WebpackOptions} config input config
 * @returns {WebpackOptionsNormalized} normalized options
 */
export function getNormalizedWebpackOptions(
  config: WebpackOptions,
): WebpackOptionsNormalized;
