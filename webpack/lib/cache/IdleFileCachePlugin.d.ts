export = IdleFileCachePlugin;
declare class IdleFileCachePlugin {
  /**
   * @param {TODO} strategy cache strategy
   * @param {number} idleTimeout timeout
   * @param {number} idleTimeoutForInitialStore initial timeout
   * @param {number} idleTimeoutAfterLargeChanges timeout after changes
   */
  constructor(
    strategy: TODO,
    idleTimeout: number,
    idleTimeoutForInitialStore: number,
    idleTimeoutAfterLargeChanges: number,
  );
  strategy: TODO;
  idleTimeout: number;
  idleTimeoutForInitialStore: number;
  idleTimeoutAfterLargeChanges: number;
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace IdleFileCachePlugin {
  export { Compiler };
}
type Compiler = import('../Compiler');
