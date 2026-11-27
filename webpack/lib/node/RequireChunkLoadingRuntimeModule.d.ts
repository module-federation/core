export = RequireChunkLoadingRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import Compilation from "../Compilation" */
/** @import RuntimeTemplate from "../template/RuntimeTemplate" */
/** @import { ReadOnlyRuntimeRequirements } from "../module/Module" */
declare class RequireChunkLoadingRuntimeModule extends RuntimeModule {
    /**
     * Creates an instance of RequireChunkLoadingRuntimeModule.
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    /** @type {ReadOnlyRuntimeRequirements} */
    runtimeRequirements: ReadOnlyRuntimeRequirements;
    /**
     * Returns generated code.
     * @private
     * @param {Chunk} chunk chunk
     * @param {string} rootOutputDir root output directory
     * @param {RuntimeTemplate} runtimeTemplate the runtime template
     * @returns {string} generated code
     */
    private _generateBaseUri;
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type { ReadOnlyRuntimeRequirements } from "../module/Module";
