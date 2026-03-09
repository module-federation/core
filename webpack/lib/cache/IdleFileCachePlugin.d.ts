export = IdleFileCachePlugin;
declare class IdleFileCachePlugin {
    /**
     * @param {PackFileCacheStrategy} strategy cache strategy
     * @param {number} idleTimeout timeout
     * @param {number} idleTimeoutForInitialStore initial timeout
     * @param {number} idleTimeoutAfterLargeChanges timeout after changes
     */
    constructor(strategy: PackFileCacheStrategy, idleTimeout: number, idleTimeoutForInitialStore: number, idleTimeoutAfterLargeChanges: number);
    strategy: import("./PackFileCacheStrategy");
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
    export { Compiler, PackFileCacheStrategy };
}
type Compiler = import("../Compiler");
type PackFileCacheStrategy = import("./PackFileCacheStrategy");
