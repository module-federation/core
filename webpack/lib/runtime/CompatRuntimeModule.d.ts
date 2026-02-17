export = CompatRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
declare class CompatRuntimeModule extends RuntimeModule {
    constructor();
}
declare namespace CompatRuntimeModule {
    export { Chunk, ChunkGraph, Compilation };
}
import RuntimeModule = require("../RuntimeModule");
type Chunk = import("../Chunk");
type ChunkGraph = import("../ChunkGraph");
type Compilation = import("../Compilation");
