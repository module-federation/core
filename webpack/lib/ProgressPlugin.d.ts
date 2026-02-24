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
  handler: HandlerFn;
  modulesCount: number;
  dependenciesCount: number;
  showEntries: boolean;
  showModules: boolean;
  showDependencies: boolean;
  showActiveModules: boolean;
  percentBy: 'entries' | 'modules' | 'dependencies';
  /**
   * @param {Compiler | MultiCompiler} compiler webpack compiler
   * @returns {void}
   */
  apply(compiler: Compiler | MultiCompiler): void;
  /**
   * @param {MultiCompiler} compiler webpack multi-compiler
   * @param {HandlerFn} handler function that executes for every progress step
   * @returns {void}
   */
  _applyOnMultiCompiler(compiler: MultiCompiler, handler: HandlerFn): void;
  /**
   * @param {Compiler} compiler webpack compiler
   * @param {HandlerFn} handler function that executes for every progress step
   * @returns {void}
   */
  _applyOnCompiler(compiler: Compiler, handler: HandlerFn): void;
}
declare namespace ProgressPlugin {
  export {
    defaultOptions,
    createDefaultHandler,
    Tap,
    Hook,
    ProgressPluginArgument,
    FactorizeModuleOptions,
    Dependency,
    EntryOptions,
    Module,
    ModuleFactoryResult,
    Logger,
    AsyncQueue,
    CountsData,
    HandlerFn,
    ReportProgress,
  };
}
import Compiler = require('./Compiler');
import MultiCompiler = require('./MultiCompiler');
declare namespace defaultOptions {
  let profile: boolean;
  let modulesCount: number;
  let dependenciesCount: number;
  let modules: boolean;
  let dependencies: boolean;
  let activeModules: boolean;
  let entries: boolean;
}
/** @typedef {(percentage: number, msg: string, ...args: string[]) => void} HandlerFn */
/**
 * @param {boolean | null | undefined} profile need profile
 * @param {Logger} logger logger
 * @returns {HandlerFn} default handler
 */
declare function createDefaultHandler(
  profile: boolean | null | undefined,
  logger: Logger,
): HandlerFn;
type Tap = import('tapable').Tap;
type Hook<T, R, AdditionalOptions> = import('tapable').Hook<
  T,
  R,
  AdditionalOptions
>;
type ProgressPluginArgument =
  import('../declarations/plugins/ProgressPlugin').ProgressPluginArgument;
type FactorizeModuleOptions = import('./Compilation').FactorizeModuleOptions;
type Dependency = import('./Dependency');
type EntryOptions = import('./Entrypoint').EntryOptions;
type Module = import('./Module');
type ModuleFactoryResult = import('./ModuleFactory').ModuleFactoryResult;
type Logger = import('./logging/Logger').Logger;
type AsyncQueue<T, K, R> = import('./util/AsyncQueue')<T, K, R>;
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
type HandlerFn = (percentage: number, msg: string, ...args: string[]) => void;
type ReportProgress = (p: number, ...args: string[]) => void;
