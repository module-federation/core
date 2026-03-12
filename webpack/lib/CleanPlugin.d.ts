export = CleanPlugin;
declare class CleanPlugin {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {CleanPluginCompilationHooks} the attached hooks
   */
  static getCompilationHooks(
    compilation: Compilation,
  ): CleanPluginCompilationHooks;
  /** @param {CleanOptions} options options */
  constructor(options?: CleanOptions);
  options: {
    dry: boolean;
    keep?: RegExp | string | import('./CleanPlugin').KeepFn;
  };
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace CleanPlugin {
  export {
    getDirectories as _getDirectories,
    CurrentAssets,
    CleanOptions,
    Compiler,
    Logger,
    IStats,
    OutputFileSystem,
    StatsCallback,
    Assets,
    CleanPluginCompilationHooks,
    KeepFn,
    Diff,
  };
}
import Compilation = require('./Compilation');
/** @typedef {Map<string, number>} CurrentAssets */
/**
 * @param {CurrentAssets} assets current assets
 * @returns {Set<string>} Set of directory paths
 */
declare function getDirectories(assets: CurrentAssets): Set<string>;
type CurrentAssets = Map<string, number>;
type CleanOptions = import('../declarations/WebpackOptions').CleanOptions;
type Compiler = import('./Compiler');
type Logger = import('./logging/Logger').Logger;
type IStats = import('./util/fs').IStats;
type OutputFileSystem = import('./util/fs').OutputFileSystem;
type StatsCallback = import('./util/fs').StatsCallback;
type Assets = Map<string, number>;
type CleanPluginCompilationHooks = {
  /**
   * when returning true the file/directory will be kept during cleaning, returning false will clean it and ignore the following plugins and config
   */
  keep: SyncBailHook<[string], boolean | void>;
};
type KeepFn = (path: string) => boolean | undefined;
type Diff = Set<string>;
import { SyncBailHook } from 'tapable';
