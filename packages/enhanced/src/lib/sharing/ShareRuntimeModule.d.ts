export = ShareRuntimeModule;
/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("webpack/lib/ChunkGraph")} ChunkGraph */
/** @typedef {import("webpack/lib/Compilation")} Compilation */
declare class ShareRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace ShareRuntimeModule {
  export { Chunk, ChunkGraph, Compilation };
}
import RuntimeModule = require('webpack/lib/RuntimeModule');
type Chunk = import('webpack/lib/Chunk');
type ChunkGraph = import('webpack/lib/ChunkGraph');
type Compilation = import('webpack/lib/Compilation');
