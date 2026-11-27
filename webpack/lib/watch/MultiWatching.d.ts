export = MultiWatching;
/** @import MultiCompiler from "../MultiCompiler" */
/** @import Watching from "./Watching" */
/** @import { ErrorCallback } from "../webpack" */
declare class MultiWatching {
    /**
     * Creates an instance of MultiWatching.
     * @param {Watching[]} watchings child compilers' watchers
     * @param {MultiCompiler} compiler the compiler
     */
    constructor(watchings: Watching[], compiler: MultiCompiler);
    /** @type {Watching[]} */
    watchings: Watching[];
    /** @type {MultiCompiler} */
    compiler: MultiCompiler;
    /**
     * Processes the provided error callback.
     * @param {ErrorCallback=} callback signals when the build has completed again
     * @returns {void}
     */
    invalidate(callback?: ErrorCallback | undefined): void;
    suspend(): void;
    resume(): void;
    /**
     * Processes the provided error callback.
     * @param {ErrorCallback} callback signals when the watcher is closed
     * @returns {void}
     */
    close(callback: ErrorCallback): void;
}
import type Watching from "./Watching";
import type MultiCompiler from "../MultiCompiler";
import type { ErrorCallback } from "../webpack";
