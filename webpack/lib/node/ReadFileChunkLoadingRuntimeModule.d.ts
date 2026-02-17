export = ReadFileChunkLoadingRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
declare class ReadFileChunkLoadingRuntimeModule extends RuntimeModule {
  /**
   * @param {ReadonlySet<string>} runtimeRequirements runtime requirements
   */
  constructor(runtimeRequirements: ReadonlySet<string>);
  runtimeRequirements: ReadonlySet<string>;
  /**
   * @private
   * @param {Chunk} chunk chunk
   * @param {string} rootOutputDir root output directory
   * @returns {string} generated code
   */
  private _generateBaseUri;
}
declare namespace ReadFileChunkLoadingRuntimeModule {
  export { Chunk, ChunkGraph, Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type Compilation = import('../Compilation');
