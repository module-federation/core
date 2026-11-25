export = ConsumeSharedRuntimeModule;
/** @import { Source } from "webpack-sources" */
/** @import Chunk, { ChunkId } from "../graph/Chunk" */
/** @import ChunkGraph, { ModuleId } from "../graph/ChunkGraph" */
/** @import Compilation from "../Compilation" */
/** @import Module, { ReadOnlyRuntimeRequirements } from "../module/Module" */
/** @import CodeGenerationResults from "../module/CodeGenerationResults" */
declare class ConsumeSharedRuntimeModule extends RuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: Module.ReadOnlyRuntimeRequirements);
    /** @type {ReadOnlyRuntimeRequirements} */
    _runtimeRequirements: Module.ReadOnlyRuntimeRequirements;
}
import RuntimeModule = require("../runtime/RuntimeModule");
import type Module from "../module/Module";
