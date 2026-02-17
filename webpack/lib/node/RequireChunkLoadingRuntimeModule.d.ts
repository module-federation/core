export = RequireChunkLoadingRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("../Module").ReadOnlyRuntimeRequirements} ReadOnlyRuntimeRequirements */
declare class RequireChunkLoadingRuntimeModule extends RuntimeModule {
  /**
   * @param {ReadOnlyRuntimeRequirements} runtimeRequirements runtime requirements
   */
  constructor(runtimeRequirements: ReadOnlyRuntimeRequirements);
  runtimeRequirements: import('../Module').ReadOnlyRuntimeRequirements;
  /**
   * @private
   * @param {Chunk} chunk chunk
   * @param {string} rootOutputDir root output directory
   * @param {RuntimeTemplate} runtimeTemplate the runtime template
   * @returns {string} generated code
   */
  private _generateBaseUri;
}
declare namespace RequireChunkLoadingRuntimeModule {
  export {
    Chunk,
    ChunkGraph,
    Compilation,
    RuntimeTemplate,
    ReadOnlyRuntimeRequirements,
  };
}
import RuntimeModule = require('../RuntimeModule');
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type Compilation = import('../Compilation');
type RuntimeTemplate = import('../RuntimeTemplate');
type ReadOnlyRuntimeRequirements =
  import('../Module').ReadOnlyRuntimeRequirements;
