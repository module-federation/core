export = ProgressPlugin;
declare class ProgressPlugin {
  /**
   * @param {Compiler} compiler the current compiler
   * @returns {ReportProgress | undefined} a progress reporter, if any
   */
  static getReporter(compiler: Compiler): ReportProgress | undefined;
  /**
   * @param {ProgressPluginArgument} options options
   */
  constructor(options?: ProgressPluginArgument);
  profile: boolean;
  handler: import('../declarations/plugins/ProgressPlugin').HandlerFunction;
  modulesCount: number;
  dependenciesCount: number;
  showEntries: boolean;
  showModules: boolean;
  showDependencies: boolean;
  showActiveModules: boolean;
  percentBy: 'entries' | 'dependencies' | 'modules';
  /**
   * @param {Compiler | MultiCompiler} compiler webpack compiler
   * @returns {void}
   */
  apply(compiler: Compiler | MultiCompiler): void;
  /**
   * @param {MultiCompiler} compiler webpack multi-compiler
   * @param {HandlerFunction} handler function that executes for every progress step
   * @returns {void}
   */
  _applyOnMultiCompiler(
    compiler: MultiCompiler,
    handler: HandlerFunction,
  ): void;
  /**
   * @param {Compiler} compiler webpack compiler
   * @param {HandlerFunction} handler function that executes for every progress step
   * @returns {void}
   */
  _applyOnCompiler(compiler: Compiler, handler: HandlerFunction): void;
}
declare namespace ProgressPlugin {
  export {
    defaultOptions,
    createDefaultHandler,
    Tap,
    HandlerFunction,
    ProgressPluginArgument,
    ProgressPluginOptions,
    Dependency,
    EntryOptions,
    Module,
    Logger,
    CountsData,
    ReportProgress,
  };
}
import Compiler = require('./Compiler');
import MultiCompiler = require('./MultiCompiler');
type HandlerFunction =
  import('../declarations/plugins/ProgressPlugin').HandlerFunction;
type ReportProgress = (p: number, ...args: string[]) => void;
type ProgressPluginArgument =
  import('../declarations/plugins/ProgressPlugin').ProgressPluginArgument;
declare namespace defaultOptions {
  const profile: boolean;
  const modulesCount: number;
  const dependenciesCount: number;
  const modules: boolean;
  const dependencies: boolean;
  const activeModules: boolean;
  const entries: boolean;
}
/**
 * @param {boolean | null | undefined} profile need profile
 * @param {Logger} logger logger
 * @returns {defaultHandler} default handler
 */
declare function createDefaultHandler(
  profile: boolean | null | undefined,
  logger: Logger,
): (percentage: number, msg: string, ...args: string[]) => void;
type Tap = import('tapable').Tap;
type ProgressPluginOptions =
  import('../declarations/plugins/ProgressPlugin').ProgressPluginOptions;
type Dependency = import('./Dependency');
type EntryOptions = import('./Entrypoint').EntryOptions;
type Module = import('./Module');
type Logger = import('./logging/Logger').Logger;
type CountsData = {
  /**
   * modules count
   */
  modulesCount: number;
  /**
   * dependencies count
   */
  dependenciesCount: number;
};
