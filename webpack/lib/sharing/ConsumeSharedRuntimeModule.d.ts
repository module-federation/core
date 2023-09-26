export = ConsumeSharedRuntimeModule;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Module")} Module */
/** @typedef {import("./ConsumeSharedModule")} ConsumeSharedModule */
declare class ConsumeSharedRuntimeModule extends RuntimeModule {
  /**
   * @param {ReadonlySet<string>} runtimeRequirements runtime requirements
   */
  constructor(runtimeRequirements: ReadonlySet<string>);
  _runtimeRequirements: ReadonlySet<string>;
}
declare namespace ConsumeSharedRuntimeModule {
  export {
    Source,
    Chunk,
    ChunkGraph,
    Compilation,
    Module,
    ConsumeSharedModule,
  };
}
import RuntimeModule = require('../RuntimeModule');
type Source = any;
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type Compilation = import('../Compilation');
type Module = import('../Module');
type ConsumeSharedModule = import('./ConsumeSharedModule');
