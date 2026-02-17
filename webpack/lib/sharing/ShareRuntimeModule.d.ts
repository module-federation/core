export = ShareRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../CodeGenerationResults")} CodeGenerationResults */
declare class ShareRuntimeModule extends RuntimeModule {
    constructor();
}
declare namespace ShareRuntimeModule {
    export { Chunk, ChunkGraph, Compilation, CodeGenerationResults };
}
import RuntimeModule = require("../RuntimeModule");
type Chunk = import("../Chunk");
type ChunkGraph = import("../ChunkGraph");
type Compilation = import("../Compilation");
type CodeGenerationResults = import("../CodeGenerationResults");
