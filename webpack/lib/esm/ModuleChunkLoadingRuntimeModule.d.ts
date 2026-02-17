export = ModuleChunkLoadingRuntimeModule;
declare class ModuleChunkLoadingRuntimeModule extends RuntimeModule {
    /**
     * @param {Compilation} compilation the compilation
     * @returns {JsonpCompilationPluginHooks} hooks
     */
    static getCompilationHooks(compilation: Compilation): JsonpCompilationPluginHooks;
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    _runtimeRequirements: import("../Module").ReadOnlyRuntimeRequirements;
    /**
     * @private
     * @param {Chunk} chunk chunk
     * @param {string} rootOutputDir root output directory
     * @returns {string} generated code
     */
    private _generateBaseUri;
}
declare namespace ModuleChunkLoadingRuntimeModule {
    export { Chunk, ChunkGraph, ReadOnlyRuntimeRequirements, JsonpCompilationPluginHooks };
}
import RuntimeModule = require("../RuntimeModule");
import Compilation = require("../Compilation");
type Chunk = import("../Chunk");
type ChunkGraph = import("../ChunkGraph");
type ReadOnlyRuntimeRequirements = import("../Module").ReadOnlyRuntimeRequirements;
type JsonpCompilationPluginHooks = {
    linkPreload: SyncWaterfallHook<[string, Chunk]>;
    linkPrefetch: SyncWaterfallHook<[string, Chunk]>;
};
import { SyncWaterfallHook } from "tapable";
