export = StartupChunkDependenciesRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
declare class StartupChunkDependenciesRuntimeModule extends RuntimeModule {
  /**
   * @param {boolean} asyncChunkLoading use async chunk loading
   */
  constructor(asyncChunkLoading: boolean);
  asyncChunkLoading: boolean;
}
declare namespace StartupChunkDependenciesRuntimeModule {
  export { Chunk, ChunkGraph, Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type Compilation = import('../Compilation');
