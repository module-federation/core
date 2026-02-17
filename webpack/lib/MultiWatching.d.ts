export = MultiWatching;
/** @typedef {import("./MultiCompiler")} MultiCompiler */
/** @typedef {import("./Watching")} Watching */
/** @typedef {import("./webpack").ErrorCallback} ErrorCallback */
declare class MultiWatching {
  /**
   * @param {Watching[]} watchings child compilers' watchers
   * @param {MultiCompiler} compiler the compiler
   */
  constructor(watchings: Watching[], compiler: MultiCompiler);
  watchings: import('./Watching')[];
  compiler: import('./MultiCompiler');
  /**
   * @param {ErrorCallback=} callback signals when the build has completed again
   * @returns {void}
   */
  invalidate(callback?: ErrorCallback | undefined): void;
  suspend(): void;
  resume(): void;
  /**
   * @param {ErrorCallback} callback signals when the watcher is closed
   * @returns {void}
   */
  close(callback: ErrorCallback): void;
}
declare namespace MultiWatching {
  export { MultiCompiler, Watching, ErrorCallback };
}
type MultiCompiler = import('./MultiCompiler');
type Watching = import('./Watching');
type ErrorCallback = import('./webpack').ErrorCallback;
