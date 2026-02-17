export type CacheOptions =
  import('../../declarations/WebpackOptions').CacheOptionsNormalized;
export type Context = import('../../declarations/WebpackOptions').Context;
export type CssExperimentOptions =
  import('../../declarations/WebpackOptions').CssExperimentOptions;
export type EntryDescription =
  import('../../declarations/WebpackOptions').EntryDescription;
export type Entry = import('../../declarations/WebpackOptions').EntryNormalized;
export type EntryStaticNormalized =
  import('../../declarations/WebpackOptions').EntryStaticNormalized;
export type Environment =
  import('../../declarations/WebpackOptions').Environment;
export type Experiments =
  import('../../declarations/WebpackOptions').Experiments;
export type ExperimentsNormalized =
  import('../../declarations/WebpackOptions').ExperimentsNormalized;
export type ExternalsPresets =
  import('../../declarations/WebpackOptions').ExternalsPresets;
export type ExternalsType =
  import('../../declarations/WebpackOptions').ExternalsType;
export type FileCacheOptions =
  import('../../declarations/WebpackOptions').FileCacheOptions;
export type InfrastructureLogging =
  import('../../declarations/WebpackOptions').InfrastructureLogging;
export type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
export type Library = import('../../declarations/WebpackOptions').Library;
export type LibraryName =
  import('../../declarations/WebpackOptions').LibraryName;
export type LibraryOptions =
  import('../../declarations/WebpackOptions').LibraryOptions;
export type LibraryType =
  import('../../declarations/WebpackOptions').LibraryType;
export type Loader = import('../../declarations/WebpackOptions').Loader;
export type Mode = import('../../declarations/WebpackOptions').Mode;
export type ModuleOptions =
  import('../../declarations/WebpackOptions').ModuleOptionsNormalized;
export type WebpackNode = import('../../declarations/WebpackOptions').Node;
export type Optimization =
  import('../../declarations/WebpackOptions').Optimization;
export type OptimizationSplitChunksOptions =
  import('../../declarations/WebpackOptions').OptimizationSplitChunksOptions;
export type Output =
  import('../../declarations/WebpackOptions').OutputNormalized;
export type ParserOptionsByModuleTypeKnown =
  import('../../declarations/WebpackOptions').ParserOptionsByModuleTypeKnown;
export type Performance =
  import('../../declarations/WebpackOptions').Performance;
export type ResolveOptions =
  import('../../declarations/WebpackOptions').ResolveOptions;
export type RuleSetRules =
  import('../../declarations/WebpackOptions').RuleSetRules;
export type SnapshotOptions =
  import('../../declarations/WebpackOptions').SnapshotOptions;
export type Target = import('../../declarations/WebpackOptions').Target;
export type WebpackOptions =
  import('../../declarations/WebpackOptions').WebpackOptionsNormalized;
export type Compiler = import('../Compiler');
export type Module = import('../Module');
export type TargetProperties = import('./target').TargetProperties;
/**
 * @param {WebpackOptions} options options to be modified
 * @returns {void}
 */
export function applyWebpackOptionsBaseDefaults(options: WebpackOptions): void;
/**
 * @param {WebpackOptions} options options to be modified
 * @returns {void}
 */
export function applyWebpackOptionsDefaults(options: WebpackOptions): void;
