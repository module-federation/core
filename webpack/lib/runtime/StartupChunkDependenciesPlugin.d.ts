export = StartupChunkDependenciesPlugin;
/**
 * Adds runtime modules that delay entry startup until entry-dependent chunks
 * required by the selected chunk loading strategy have been loaded.
 */
declare class StartupChunkDependenciesPlugin {
    /**
     * Configures which chunk loading implementation this plugin should enhance
     * and whether startup waits should use promises or synchronous ensures.
     * @param {Options} options options
     */
    constructor(options: Options);
    /** @type {ChunkLoadingType} */
    chunkLoading: ChunkLoadingType;
    /** @type {boolean} */
    asyncChunkLoading: boolean;
    /**
     * Registers compilation hooks that attach the startup dependency runtime
     * modules to entry chunks using the configured chunk loading mechanism.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace StartupChunkDependenciesPlugin {
    export { Options };
}
import type { ChunkLoadingType } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
/**
 * Options that describe which chunk loading backend should receive startup
 * dependency handling and whether the runtime should wait for those chunks
 * asynchronously.
 */
type Options = {
    chunkLoading: ChunkLoadingType;
    asyncChunkLoading?: boolean | undefined;
};
