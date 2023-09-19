export = ConsumeSharedRuntimeModule;
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("webpack/lib/ChunkGraph")} ChunkGraph */
/** @typedef {import("webpack/lib/Compilation")} Compilation */
/** @typedef {import("webpack/lib/Module")} Module */
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
import RuntimeModule = require('webpack/lib/RuntimeModule');
type Source = import('webpack-sources').Source;
type Chunk = import('webpack/lib/Chunk');
type ChunkGraph = import('webpack/lib/ChunkGraph');
type Compilation = import('webpack/lib/Compilation');
type Module = import('webpack/lib/Module');
type ConsumeSharedModule = import('./ConsumeSharedModule');
