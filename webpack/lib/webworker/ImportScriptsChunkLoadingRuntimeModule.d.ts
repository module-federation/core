export = ImportScriptsChunkLoadingRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
declare class ImportScriptsChunkLoadingRuntimeModule extends RuntimeModule {
  /**
   * @param {Set<string>} runtimeRequirements runtime requirements
   * @param {boolean} withCreateScriptUrl with createScriptUrl support
   */
  constructor(runtimeRequirements: Set<string>, withCreateScriptUrl: boolean);
  runtimeRequirements: Set<string>;
  _withCreateScriptUrl: boolean;
  /**
   * @private
   * @param {Chunk} chunk chunk
   * @returns {string} generated code
   */
  private _generateBaseUri;
}
declare namespace ImportScriptsChunkLoadingRuntimeModule {
  export { Chunk, ChunkGraph, Compilation };
}
import RuntimeModule = require('../RuntimeModule');
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type Compilation = import('../Compilation');
