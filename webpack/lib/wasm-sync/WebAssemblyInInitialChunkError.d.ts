export = WebAssemblyInInitialChunkError;
declare class WebAssemblyInInitialChunkError extends WebpackError {
  /**
   * @param {Module} module WASM module
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {RequestShortener} requestShortener request shortener
   */
  constructor(
    module: Module,
    moduleGraph: ModuleGraph,
    chunkGraph: ChunkGraph,
    requestShortener: RequestShortener,
  );
}
declare namespace WebAssemblyInInitialChunkError {
  export { ChunkGraph, Module, ModuleGraph, RequestShortener };
}
import WebpackError = require('../WebpackError');
type ChunkGraph = import('../ChunkGraph');
type Module = import('../Module');
type ModuleGraph = import('../ModuleGraph');
type RequestShortener = import('../RequestShortener');
