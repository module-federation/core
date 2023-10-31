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
    keep?: string | RegExp | ((filename: string) => boolean);
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
    CleanOptions,
    Compiler,
    Logger,
    OutputFileSystem,
    StatsCallback,
    IgnoreItem,
    Assets,
    AddToIgnoreCallback,
    CleanPluginCompilationHooks,
  };
}
type Compiler = import('./Compiler');
import Compilation = require('../lib/Compilation');
type CleanPluginCompilationHooks = {
  /**
   * when returning true the file/directory will be kept during cleaning, returning false will clean it and ignore the following plugins and config
   */
  keep: SyncBailHook<[string], boolean>;
};
type CleanOptions = import('../declarations/WebpackOptions').CleanOptions;
type Logger = import('./logging/Logger').Logger;
type OutputFileSystem = import('./util/fs').OutputFileSystem;
type StatsCallback = import('./util/fs').StatsCallback;
type IgnoreItem = ((arg0: string) => boolean) | RegExp;
type Assets = Map<string, number>;
type AddToIgnoreCallback = (arg0: IgnoreItem) => void;
import { SyncBailHook } from 'tapable';
