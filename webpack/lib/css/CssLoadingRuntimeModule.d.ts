export = CssLoadingRuntimeModule;
/**
 * @typedef {ReturnType<typeof createCompilationHooks>} CssLoadingRuntimeModulePluginHooks
 */
declare class CssLoadingRuntimeModule extends RuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    /** @type {ReadOnlyRuntimeRequirements} */
    _runtimeRequirements: ReadOnlyRuntimeRequirements;
    /**
     * The initial chunks carrying a stylesheet, and the matcher for the ones the
     * handler can still be asked to load.
     * @private
     * @returns {{ initialChunkIds: Set<ChunkId>, hasCssMatcher: ReturnType<typeof compileBooleanMatcher> }} loadable chunks
     */
    private _getLoadableChunks;
}
declare namespace CssLoadingRuntimeModule {
    export { getCompilationHooks, CssLoadingRuntimeModulePluginHooks };
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type { ReadOnlyRuntimeRequirements } from "../module/Module";
declare var getCompilationHooks: (compilation: import("../Compilation")) => {
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.66.0
     */
    createStylesheet: SyncWaterfallHook<[string, Chunk]>;
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.91.0
     */
    linkPreload: SyncWaterfallHook<[string, Chunk]>;
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.91.0
     */
    linkPrefetch: SyncWaterfallHook<[string, Chunk]>;
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.107.0
     */
    linkInsert: SyncWaterfallHook<[string, Chunk]>;
};
type CssLoadingRuntimeModulePluginHooks = ReturnType<typeof createCompilationHooks>;
import type Compilation from "../Compilation";
import { SyncWaterfallHook } from "tapable";
import type Chunk from "../graph/Chunk";
/** @import Chunk, { ChunkId } from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import { ReadOnlyRuntimeRequirements } from "../module/Module" */
declare function createCompilationHooks(): {
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.66.0
     */
    createStylesheet: SyncWaterfallHook<[string, Chunk]>;
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.91.0
     */
    linkPreload: SyncWaterfallHook<[string, Chunk]>;
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.91.0
     */
    linkPrefetch: SyncWaterfallHook<[string, Chunk]>;
    /**
     * @type {SyncWaterfallHook<[string, Chunk]>}
     * @since 5.107.0
     */
    linkInsert: SyncWaterfallHook<[string, Chunk]>;
};
