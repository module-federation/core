export = CompatRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../MainTemplate")} MainTemplate */
declare class CompatRuntimeModule extends RuntimeModule {
  constructor();
}
declare namespace CompatRuntimeModule {
  export { Chunk, ChunkGraph, Compilation, MainTemplate };
}
import RuntimeModule = require('../RuntimeModule');
type Chunk = import('../Chunk');
type ChunkGraph = import('../ChunkGraph');
type Compilation = import('../Compilation');
type MainTemplate = import('../MainTemplate');
