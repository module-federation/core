export = NodeWatchFileSystem;
/** @typedef {import("../../declarations/WebpackOptions").WatchOptions} WatchOptions */
/** @typedef {import("../FileSystemInfo").FileSystemInfoEntry} FileSystemInfoEntry */
/** @typedef {import("../util/fs").WatchFileSystem} WatchFileSystem */
/** @typedef {import("../util/fs").WatchMethod} WatchMethod */
/** @typedef {import("../util/fs").Watcher} Watcher */
declare class NodeWatchFileSystem {
  constructor(inputFileSystem: any);
  inputFileSystem: any;
  watcherOptions: {
    aggregateTimeout: number;
  };
  watcher: any;
  /**
   * @param {Iterable<string>} files watched files
   * @param {Iterable<string>} directories watched directories
   * @param {Iterable<string>} missing watched exitance entries
   * @param {number} startTime timestamp of start time
   * @param {WatchOptions} options options object
   * @param {function((Error | null)=, Map<string, FileSystemInfoEntry>, Map<string, FileSystemInfoEntry>, Set<string>, Set<string>): void} callback aggregated callback
   * @param {function(string, number): void} callbackUndelayed callback when the first change was detected
   * @returns {Watcher} a watcher
   */
  watch(
    files: Iterable<string>,
    directories: Iterable<string>,
    missing: Iterable<string>,
    startTime: number,
    options: WatchOptions,
    callback: (
      arg0: (Error | null) | undefined,
      arg1: Map<string, FileSystemInfoEntry>,
      arg2: Map<string, FileSystemInfoEntry>,
      arg3: Set<string>,
      arg4: Set<string>,
    ) => void,
    callbackUndelayed: (arg0: string, arg1: number) => void,
  ): Watcher;
}
declare namespace NodeWatchFileSystem {
  export {
    WatchOptions,
    FileSystemInfoEntry,
    WatchFileSystem,
    WatchMethod,
    Watcher,
  };
}
type WatchOptions = import('../../declarations/WebpackOptions').WatchOptions;
type FileSystemInfoEntry = import('../FileSystemInfo').FileSystemInfoEntry;
type Watcher = import('../util/fs').Watcher;
type WatchFileSystem = import('../util/fs').WatchFileSystem;
type WatchMethod = import('../util/fs').WatchMethod;
