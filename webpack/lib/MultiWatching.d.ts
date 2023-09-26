export = MultiWatching;
/** @typedef {import("./MultiCompiler")} MultiCompiler */
/** @typedef {import("./Watching")} Watching */
/**
 * @template T
 * @callback Callback
 * @param {(Error | null)=} err
 * @param {T=} result
 */
declare class MultiWatching {
  /**
   * @param {Watching[]} watchings child compilers' watchers
   * @param {MultiCompiler} compiler the compiler
   */
  constructor(watchings: Watching[], compiler: MultiCompiler);
  watchings: import('./Watching')[];
  compiler: import('./MultiCompiler');
  /**
   * @param {Callback<void>=} callback signals when the build has completed again
   * @returns {void}
   */
  invalidate(callback?: Callback<void> | undefined): void;
  suspend(): void;
  resume(): void;
  /**
   * @param {Callback<void>} callback signals when the watcher is closed
   * @returns {void}
   */
  close(callback: Callback<void>): void;
}
declare namespace MultiWatching {
  export { MultiCompiler, Watching, Callback };
}
type Callback<T> = (
  err?: (Error | null) | undefined,
  result?: T | undefined,
) => any;
type Watching = import('./Watching');
type MultiCompiler = import('./MultiCompiler');
