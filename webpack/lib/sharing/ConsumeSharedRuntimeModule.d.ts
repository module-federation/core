export = ConsumeSharedRuntimeModule;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Chunk").ChunkId} ChunkId */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../ChunkGraph").ModuleId} ModuleId */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").ReadOnlyRuntimeRequirements} ReadOnlyRuntimeRequirements */
/** @typedef {import("../CodeGenerationResults")} CodeGenerationResults */
declare class ConsumeSharedRuntimeModule extends RuntimeModule {
    /**
     * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
     */
    constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
    _runtimeRequirements: import("../Module").ReadOnlyRuntimeRequirements;
}
declare namespace ConsumeSharedRuntimeModule {
    export { Source, Chunk, ChunkId, ChunkGraph, ModuleId, Compilation, Module, ReadOnlyRuntimeRequirements, CodeGenerationResults };
}
import RuntimeModule = require("../RuntimeModule");
type Source = import("webpack-sources").Source;
type Chunk = import("../Chunk");
type ChunkId = import("../Chunk").ChunkId;
type ChunkGraph = import("../ChunkGraph");
type ModuleId = import("../ChunkGraph").ModuleId;
type Compilation = import("../Compilation");
type Module = import("../Module");
type ReadOnlyRuntimeRequirements = import("../Module").ReadOnlyRuntimeRequirements;
type CodeGenerationResults = import("../CodeGenerationResults");
