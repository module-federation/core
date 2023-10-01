export = MultiCompiler;
declare class MultiCompiler {
  /**
   * @param {Compiler[] | Record<string, Compiler>} compilers child compilers
   * @param {MultiCompilerOptions} options options
   */
  constructor(
    compilers: Compiler[] | Record<string, Compiler>,
    options: MultiCompilerOptions,
  );
  hooks: Readonly<{
    /** @type {SyncHook<[MultiStats]>} */
    done: SyncHook<[MultiStats]>;
    /** @type {MultiHook<SyncHook<[string | null, number]>>} */
    invalid: MultiHook<SyncHook<[string | null, number]>>;
    /** @type {MultiHook<AsyncSeriesHook<[Compiler]>>} */
    run: MultiHook<AsyncSeriesHook<[Compiler]>>;
    /** @type {SyncHook<[]>} */
    watchClose: SyncHook<[]>;
    /** @type {MultiHook<AsyncSeriesHook<[Compiler]>>} */
    watchRun: MultiHook<AsyncSeriesHook<[Compiler]>>;
    /** @type {MultiHook<SyncBailHook<[string, string, any[]], true>>} */
    infrastructureLog: MultiHook<SyncBailHook<[string, string, any[]], true>>;
  }>;
  compilers: import('./Compiler')[];
  /** @type {MultiCompilerOptions} */
  _options: MultiCompilerOptions;
  /** @type {WeakMap<Compiler, string[]>} */
  dependencies: WeakMap<Compiler, string[]>;
  running: boolean;
  get options(): import('../declarations/WebpackOptions').WebpackOptionsNormalized[] &
    MultiCompilerOptions;
  get outputPath(): string;
  /**
   * @param {InputFileSystem} value the new input file system
   */
  set inputFileSystem(arg: import('./util/fs').InputFileSystem);
  get inputFileSystem(): import('./util/fs').InputFileSystem;
  /**
   * @param {OutputFileSystem} value the new output file system
   */
  set outputFileSystem(arg: import('./util/fs').OutputFileSystem);
  get outputFileSystem(): import('./util/fs').OutputFileSystem;
  /**
   * @param {WatchFileSystem} value the new watch file system
   */
  set watchFileSystem(arg: import('./util/fs').WatchFileSystem);
  get watchFileSystem(): import('./util/fs').WatchFileSystem;
  /**
   * @param {IntermediateFileSystem} value the new intermediate file system
   */
  set intermediateFileSystem(arg: import('./util/fs').IntermediateFileSystem);
  get intermediateFileSystem(): import('./util/fs').IntermediateFileSystem;
  getInfrastructureLogger(name: any): import('./logging/Logger').Logger;
  /**
   * @param {Compiler} compiler the child compiler
   * @param {string[]} dependencies its dependencies
   * @returns {void}
   */
  setDependencies(compiler: Compiler, dependencies: string[]): void;
  /**
   * @param {Callback<MultiStats>} callback signals when the validation is complete
   * @returns {boolean} true if the dependencies are valid
   */
  validateDependencies(callback: Callback<MultiStats>): boolean;
  /**
   * @deprecated This method should have been private
   * @param {Compiler[]} compilers the child compilers
   * @param {RunWithDependenciesHandler} fn a handler to run for each compiler
   * @param {Callback<MultiStats>} callback the compiler's handler
   * @returns {void}
   */
  runWithDependencies(
    compilers: Compiler[],
    fn: RunWithDependenciesHandler,
    callback: Callback<MultiStats>,
  ): void;
  /**
   * @template SetupResult
   * @param {function(Compiler, number, Callback<Stats>, function(): boolean, function(): void, function(): void): SetupResult} setup setup a single compiler
   * @param {function(Compiler, SetupResult, Callback<Stats>): void} run run/continue a single compiler
   * @param {Callback<MultiStats>} callback callback when all compilers are done, result includes Stats of all changed compilers
   * @returns {SetupResult[]} result of setup
   */
  _runGraph<SetupResult>(
    setup: (
      arg0: Compiler,
      arg1: number,
      arg2: Callback<Stats>,
      arg3: () => boolean,
      arg4: () => void,
      arg5: () => void,
    ) => SetupResult,
    run: (arg0: Compiler, arg1: SetupResult, arg2: Callback<Stats>) => void,
    callback: Callback<MultiStats>,
  ): SetupResult[];
  /**
   * @param {WatchOptions|WatchOptions[]} watchOptions the watcher's options
   * @param {Callback<MultiStats>} handler signals when the call finishes
   * @returns {MultiWatching} a compiler watcher
   */
  watch(
    watchOptions: WatchOptions | WatchOptions[],
    handler: Callback<MultiStats>,
  ): MultiWatching;
  /**
   * @param {Callback<MultiStats>} callback signals when the call finishes
   * @returns {void}
   */
  run(callback: Callback<MultiStats>): void;
  purgeInputFileSystem(): void;
  /**
   * @param {Callback<void>} callback signals when the compiler closes
   * @returns {void}
   */
  close(callback: Callback<void>): void;
}
declare namespace MultiCompiler {
  export {
    AsyncSeriesHook,
    SyncBailHook,
    WatchOptions,
    Compiler,
    Stats,
    Watching,
    InputFileSystem,
    IntermediateFileSystem,
    OutputFileSystem,
    WatchFileSystem,
    Callback,
    RunWithDependenciesHandler,
    MultiCompilerOptions,
  };
}
import { SyncHook } from 'tapable';
import MultiStats = require('./MultiStats');
import { MultiHook } from 'tapable';
/**
 * <T>
 */
type AsyncSeriesHook<T> = import('tapable').AsyncSeriesHook<T>;
type Compiler = import('./Compiler');
/**
 * <T, R>
 */
type SyncBailHook<T, R> = import('tapable').SyncBailHook<T, R>;
type MultiCompilerOptions = {
  /**
   * how many Compilers are allows to run at the same time in parallel
   */
  parallelism?: number | undefined;
};
type Callback<T> = (
  err?: (Error | null) | undefined,
  result?: T | undefined,
) => any;
type RunWithDependenciesHandler = (
  compiler: Compiler,
  callback: Callback<MultiStats>,
) => any;
type Stats = import('./Stats');
type WatchOptions = import('../declarations/WebpackOptions').WatchOptions;
import MultiWatching = require('./MultiWatching');
type Watching = import('./Watching');
type InputFileSystem = import('./util/fs').InputFileSystem;
type IntermediateFileSystem = import('./util/fs').IntermediateFileSystem;
type OutputFileSystem = import('./util/fs').OutputFileSystem;
type WatchFileSystem = import('./util/fs').WatchFileSystem;
