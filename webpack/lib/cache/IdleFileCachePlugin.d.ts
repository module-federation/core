export = IdleFileCachePlugin;
declare class IdleFileCachePlugin {
    /**
     * Creates an instance of IdleFileCachePlugin.
     * @param {PackFileCacheStrategy} strategy cache strategy
     * @param {number} idleTimeout timeout
     * @param {number} idleTimeoutForInitialStore initial timeout
     * @param {number} idleTimeoutAfterLargeChanges timeout after changes
     */
    constructor(strategy: PackFileCacheStrategy, idleTimeout: number, idleTimeoutForInitialStore: number, idleTimeoutAfterLargeChanges: number);
    /** @type {PackFileCacheStrategy} */
    strategy: PackFileCacheStrategy;
    /** @type {number} */
    idleTimeout: number;
    /** @type {number} */
    idleTimeoutForInitialStore: number;
    /** @type {number} */
    idleTimeoutAfterLargeChanges: number;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
import type PackFileCacheStrategy from "./PackFileCacheStrategy";
import type Compiler from "../Compiler";
