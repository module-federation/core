export = RuntimeIdRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
declare class RuntimeIdRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace RuntimeIdRuntimeModule {
  export { Chunk, ChunkGraph };
}
import RuntimeModule = require('../RuntimeModule');
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
