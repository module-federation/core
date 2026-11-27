export = ImportScriptsChunkLoadingRuntimeModule;
/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import Compilation from "../Compilation" */
/** @import { ReadOnlyRuntimeRequirements } from "../module/Module" */
declare class ImportScriptsChunkLoadingRuntimeModule extends RuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     * @param {boolean} withCreateScriptUrl with createScriptUrl support
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements, withCreateScriptUrl: boolean);
    /** @type {ReadOnlyRuntimeRequirements} */
    runtimeRequirements: ReadOnlyRuntimeRequirements;
    /** @type {boolean} */
    _withCreateScriptUrl: boolean;
    /**
     * @private
     * @param {Chunk} chunk chunk
     * @returns {string} generated code
     */
    private _generateBaseUri;
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type { ReadOnlyRuntimeRequirements } from "../module/Module";
