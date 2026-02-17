export = NodeWatchFileSystem;
/** @typedef {import("../util/fs").InputFileSystem} InputFileSystem */
/** @typedef {import("../util/fs").WatchMethod} WatchMethod */
/** @typedef {import("../util/fs").Changes} Changes */
/** @typedef {import("../util/fs").Removals} Removals */
declare class NodeWatchFileSystem {
  /**
   * @param {InputFileSystem} inputFileSystem input filesystem
   */
  constructor(inputFileSystem: InputFileSystem);
  inputFileSystem: import('../util/fs').InputFileSystem;
  watcherOptions: {
    aggregateTimeout: number;
  };
  /** @type {Watchpack | null} */
  watcher: Watchpack | null;
  watch(
    files: Iterable<string>,
    directories: Iterable<string>,
    missing: Iterable<string>,
    startTime: number,
    options: import('../util/fs').WatchOptions,
    callback: (
      err: Error | null,
      timeInfoEntries1?: import('../util/fs').TimeInfoEntries,
      timeInfoEntries2?: import('../util/fs').TimeInfoEntries,
      changes?: import('../util/fs').Changes,
      removals?: import('../util/fs').Removals,
    ) => void,
    callbackUndelayed: (value: string, num: number) => void,
  ): import('../util/fs').Watcher;
}
declare namespace NodeWatchFileSystem {
  export { InputFileSystem, WatchMethod, Changes, Removals };
}
type InputFileSystem = import('../util/fs').InputFileSystem;
type WatchMethod = import('../util/fs').WatchMethod;
type Changes = import('../util/fs').Changes;
type Removals = import('../util/fs').Removals;
