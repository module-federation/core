export = Watching;
/** @typedef {import("../declarations/WebpackOptions").WatchOptions} WatchOptions */
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./Compiler").ErrorCallback} ErrorCallback */
/** @typedef {import("./WebpackError")} WebpackError */
/** @typedef {import("./logging/Logger").Logger} Logger */
/** @typedef {import("./util/fs").TimeInfoEntries} TimeInfoEntries */
/** @typedef {import("./util/fs").WatchFileSystem} WatchFileSystem */
/**
 * @template T
 * @template [R=void]
 * @typedef {import("./webpack").Callback<T, R>} Callback
 */
/** @typedef {Set<string>} CollectedFiles */
declare class Watching {
  /**
   * @param {Compiler} compiler the compiler
   * @param {WatchOptions} watchOptions options
   * @param {Callback<Stats>} handler completion handler
   */
  constructor(
    compiler: Compiler,
    watchOptions: WatchOptions,
    handler: Callback<Stats>,
  );
  startTime: number;
  invalid: boolean;
  handler: Callback<Stats, void>;
  /** @type {ErrorCallback[]} */
  callbacks: ErrorCallback[];
  /** @type {ErrorCallback[] | undefined} */
  _closeCallbacks: ErrorCallback[] | undefined;
  closed: boolean;
  suspended: boolean;
  blocked: boolean;
  _isBlocked: () => boolean;
  _onChange: () => void;
  _onInvalid: () => void;
  /** @type {WatchOptions} */
  watchOptions: WatchOptions;
  compiler: import('./Compiler');
  running: boolean;
  _initial: boolean;
  _invalidReported: boolean;
  _needRecords: boolean;
  watcher: import('./util/fs').Watcher;
  pausedWatcher: import('./util/fs').Watcher;
  /** @type {CollectedFiles | undefined} */
  _collectedChangedFiles: CollectedFiles | undefined;
  /** @type {CollectedFiles | undefined} */
  _collectedRemovedFiles: CollectedFiles | undefined;
  /**
   * @param {(Error | null)=} err an optional error
   * @param {Compilation=} compilation the compilation
   * @returns {void}
   */
  _done(
    err?: (Error | null) | undefined,
    compilation?: Compilation | undefined,
  ): void;
  /**
   * @param {ReadonlySet<string> | undefined | null} changedFiles changed files
   * @param {ReadonlySet<string> | undefined | null} removedFiles removed files
   */
  _mergeWithCollected(
    changedFiles: ReadonlySet<string> | undefined | null,
    removedFiles: ReadonlySet<string> | undefined | null,
  ): void;
  /**
   * @param {TimeInfoEntries=} fileTimeInfoEntries info for files
   * @param {TimeInfoEntries=} contextTimeInfoEntries info for directories
   * @param {ReadonlySet<string>=} changedFiles changed files
   * @param {ReadonlySet<string>=} removedFiles removed files
   * @returns {void}
   */
  _go(
    fileTimeInfoEntries?: TimeInfoEntries | undefined,
    contextTimeInfoEntries?: TimeInfoEntries | undefined,
    changedFiles?: ReadonlySet<string> | undefined,
    removedFiles?: ReadonlySet<string> | undefined,
  ): void;
  lastWatcherStartTime: number;
  /**
   * @param {Compilation} compilation the compilation
   * @returns {Stats} the compilation stats
   */
  _getStats(compilation: Compilation): Stats;
  /**
   * @param {Iterable<string>} files watched files
   * @param {Iterable<string>} dirs watched directories
   * @param {Iterable<string>} missing watched existence entries
   * @returns {void}
   */
  watch(
    files: Iterable<string>,
    dirs: Iterable<string>,
    missing: Iterable<string>,
  ): void;
  /**
   * @param {ErrorCallback=} callback signals when the build has completed again
   * @returns {void}
   */
  invalidate(callback?: ErrorCallback | undefined): void;
  /**
   * @param {TimeInfoEntries=} fileTimeInfoEntries info for files
   * @param {TimeInfoEntries=} contextTimeInfoEntries info for directories
   * @param {ReadonlySet<string>=} changedFiles changed files
   * @param {ReadonlySet<string>=} removedFiles removed files
   * @returns {void}
   */
  _invalidate(
    fileTimeInfoEntries?: TimeInfoEntries | undefined,
    contextTimeInfoEntries?: TimeInfoEntries | undefined,
    changedFiles?: ReadonlySet<string> | undefined,
    removedFiles?: ReadonlySet<string> | undefined,
  ): void;
  suspend(): void;
  resume(): void;
  /**
   * @param {ErrorCallback} callback signals when the watcher is closed
   * @returns {void}
   */
  close(callback: ErrorCallback): void;
}
declare namespace Watching {
  export {
    WatchOptions,
    Compilation,
    Compiler,
    ErrorCallback,
    WebpackError,
    Logger,
    TimeInfoEntries,
    WatchFileSystem,
    Callback,
    CollectedFiles,
  };
}
import Stats = require('./Stats');
type WatchOptions = import('../declarations/WebpackOptions').WatchOptions;
type Compilation = import('./Compilation');
type Compiler = import('./Compiler');
type ErrorCallback = import('./Compiler').ErrorCallback;
type WebpackError = import('./WebpackError');
type Logger = import('./logging/Logger').Logger;
type TimeInfoEntries = import('./util/fs').TimeInfoEntries;
type WatchFileSystem = import('./util/fs').WatchFileSystem;
type Callback<T, R = void> = import('./webpack').Callback<T, R>;
type CollectedFiles = Set<string>;
