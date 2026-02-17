export = ImportScriptsChunkLoadingRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Module").ReadOnlyRuntimeRequirements} ReadOnlyRuntimeRequirements */
declare class ImportScriptsChunkLoadingRuntimeModule extends RuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     * @param {boolean} withCreateScriptUrl with createScriptUrl support
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements, withCreateScriptUrl: boolean);
    runtimeRequirements: import("../Module").ReadOnlyRuntimeRequirements;
    _withCreateScriptUrl: boolean;
    /**
     * @private
     * @param {Chunk} chunk chunk
     * @returns {string} generated code
     */
    private _generateBaseUri;
}
declare namespace ImportScriptsChunkLoadingRuntimeModule {
    export { Chunk, ChunkGraph, Compilation, ReadOnlyRuntimeRequirements };
}
import RuntimeModule = require("../RuntimeModule");
type Chunk = import("../Chunk");
type ChunkGraph = import("../ChunkGraph");
type Compilation = import("../Compilation");
type ReadOnlyRuntimeRequirements = import("../Module").ReadOnlyRuntimeRequirements;
