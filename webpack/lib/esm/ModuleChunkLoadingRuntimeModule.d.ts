export = ModuleChunkLoadingRuntimeModule;
/**
 * @typedef {ReturnType<typeof createCompilationHooks>} JsonpCompilationPluginHooks
 */
declare class ModuleChunkLoadingRuntimeModule extends RuntimeModule {
    /**
     * Creates an instance of ModuleChunkLoadingRuntimeModule.
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    /** @type {ReadOnlyRuntimeRequirements} */
    _runtimeRequirements: ReadOnlyRuntimeRequirements;
    /**
     * Returns generated code.
     * @private
     * @param {Chunk} chunk chunk
     * @param {string} rootOutputDir root output directory
     * @returns {string} generated code
     */
    private _generateBaseUri;
}
declare namespace ModuleChunkLoadingRuntimeModule {
    export { getCompilationHooks, JsonpCompilationPluginHooks };
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type { ReadOnlyRuntimeRequirements } from "../module/Module";
declare var getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.41.0
     */
    linkPreload: SyncWaterfallHook<[string, Chunk]>;
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.41.0
     */
    linkPrefetch: SyncWaterfallHook<[string, Chunk]>;
};
type JsonpCompilationPluginHooks = ReturnType<typeof createCompilationHooks>;
import type Compilation from "../Compilation";
import { SyncWaterfallHook } from "tapable";
import type Chunk from "../graph/Chunk";
/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import { ReadOnlyRuntimeRequirements } from "../module/Module" */
declare function createCompilationHooks(): {
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.41.0
     */
    linkPreload: SyncWaterfallHook<[string, Chunk]>;
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.41.0
     */
    linkPrefetch: SyncWaterfallHook<[string, Chunk]>;
};
