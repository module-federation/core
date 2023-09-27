export = Watching;
/** @typedef {import("../declarations/WebpackOptions").WatchOptions} WatchOptions */
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {import("./Compiler")} Compiler */
/** @typedef {import("./FileSystemInfo").FileSystemInfoEntry} FileSystemInfoEntry */
/** @typedef {import("./WebpackError")} WebpackError */
/** @typedef {import("./logging/Logger").Logger} Logger */
/**
 * @template T
 * @callback Callback
 * @param {(Error | null)=} err
 * @param {T=} result
 */
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
  handler: Callback<Stats>;
  /** @type {Callback<void>[]} */
  callbacks: Callback<void>[];
  /** @type {Callback<void>[] | undefined} */
  _closeCallbacks: Callback<void>[] | undefined;
  closed: boolean;
  suspended: boolean;
  blocked: boolean;
  _isBlocked: () => boolean;
  _onChange: () => void;
  _onInvalid: () => void;
  watchOptions: {
    aggregateTimeout?: number;
    followSymlinks?: boolean;
    ignored?: string | RegExp | string[];
    poll?: number | boolean;
    stdin?: boolean;
  };
  compiler: import('./Compiler');
  running: boolean;
  _initial: boolean;
  _invalidReported: boolean;
  _needRecords: boolean;
  watcher: import('./util/fs').Watcher;
  pausedWatcher: import('./util/fs').Watcher;
  /** @type {Set<string> | undefined} */
  _collectedChangedFiles: Set<string> | undefined;
  /** @type {Set<string> | undefined} */
  _collectedRemovedFiles: Set<string> | undefined;
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
   * @param {ReadonlySet<string>=} changedFiles changed files
   * @param {ReadonlySet<string>=} removedFiles removed files
   */
  _mergeWithCollected(
    changedFiles?: ReadonlySet<string> | undefined,
    removedFiles?: ReadonlySet<string> | undefined,
  ): void;
  /**
   * @param {ReadonlyMap<string, FileSystemInfoEntry | "ignore">=} fileTimeInfoEntries info for files
   * @param {ReadonlyMap<string, FileSystemInfoEntry | "ignore">=} contextTimeInfoEntries info for directories
   * @param {ReadonlySet<string>=} changedFiles changed files
   * @param {ReadonlySet<string>=} removedFiles removed files
   * @returns {void}
   */
  _go(
    fileTimeInfoEntries?:
      | ReadonlyMap<string, FileSystemInfoEntry | 'ignore'>
      | undefined,
    contextTimeInfoEntries?:
      | ReadonlyMap<string, FileSystemInfoEntry | 'ignore'>
      | undefined,
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
   * @param {Callback<void>=} callback signals when the build has completed again
   * @returns {void}
   */
  invalidate(callback?: Callback<void> | undefined): void;
  /**
   * @param {ReadonlyMap<string, FileSystemInfoEntry | "ignore">=} fileTimeInfoEntries info for files
   * @param {ReadonlyMap<string, FileSystemInfoEntry | "ignore">=} contextTimeInfoEntries info for directories
   * @param {ReadonlySet<string>=} changedFiles changed files
   * @param {ReadonlySet<string>=} removedFiles removed files
   * @returns {void}
   */
  _invalidate(
    fileTimeInfoEntries?:
      | ReadonlyMap<string, FileSystemInfoEntry | 'ignore'>
      | undefined,
    contextTimeInfoEntries?:
      | ReadonlyMap<string, FileSystemInfoEntry | 'ignore'>
      | undefined,
    changedFiles?: ReadonlySet<string> | undefined,
    removedFiles?: ReadonlySet<string> | undefined,
  ): void;
  suspend(): void;
  resume(): void;
  /**
   * @param {Callback<void>} callback signals when the watcher is closed
   * @returns {void}
   */
  close(callback: Callback<void>): void;
}
declare namespace Watching {
  export {
    WatchOptions,
    Compilation,
    Compiler,
    FileSystemInfoEntry,
    WebpackError,
    Logger,
    Callback,
  };
}
import Stats = require('./Stats');
type Callback<T> = (
  err?: (Error | null) | undefined,
  result?: T | undefined,
) => any;
type Compilation = import('./Compilation');
type FileSystemInfoEntry = import('./FileSystemInfo').FileSystemInfoEntry;
type Compiler = import('./Compiler');
type WatchOptions = import('../declarations/WebpackOptions').WatchOptions;
type WebpackError = import('./WebpackError');
type Logger = import('./logging/Logger').Logger;
