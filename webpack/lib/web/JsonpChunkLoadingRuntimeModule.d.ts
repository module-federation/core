export = JsonpChunkLoadingRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import { ReadOnlyRuntimeRequirements } from "../module/Module" */
/**
 * @typedef {object} JsonpCompilationPluginHooks
 * @property {SyncWaterfallHook<[string, Chunk]>} linkPreload
 * @property {SyncWaterfallHook<[string, Chunk]>} linkPrefetch
 */
declare class JsonpChunkLoadingRuntimeModule extends RuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    /** @type {ReadOnlyRuntimeRequirements} */
    _runtimeRequirements: ReadOnlyRuntimeRequirements;
    /**
     * @private
     * @param {Chunk} chunk chunk
     * @returns {string} generated code
     */
    private _generateBaseUri;
}
declare namespace JsonpChunkLoadingRuntimeModule {
    export { getCompilationHooks, JsonpCompilationPluginHooks };
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type { ReadOnlyRuntimeRequirements } from "../module/Module";
declare var getCompilationHooks: (compilation: import("../Compilation")) => JsonpCompilationPluginHooks;
type JsonpCompilationPluginHooks = {
    linkPreload: SyncWaterfallHook<[string, Chunk]>;
    linkPrefetch: SyncWaterfallHook<[string, Chunk]>;
};
import type Compilation from "../Compilation";
import { SyncWaterfallHook } from "tapable";
import type Chunk from "../graph/Chunk";
