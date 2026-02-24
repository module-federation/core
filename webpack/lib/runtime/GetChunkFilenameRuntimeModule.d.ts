export = GetChunkFilenameRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Chunk").ChunkId} ChunkId */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Compilation").HashWithLengthFunction} HashWithLengthFunction */
/** @typedef {import("../TemplatedPathPlugin").TemplatePath} TemplatePath */
declare class GetChunkFilenameRuntimeModule extends RuntimeModule {
  /**
   * @param {string} contentType the contentType to use the content hash for
   * @param {string} name kind of filename
   * @param {string} global function name to be assigned
   * @param {(chunk: Chunk) => TemplatePath | false} getFilenameForChunk functor to get the filename or function
   * @param {boolean} allChunks when false, only async chunks are included
   */
  constructor(
    contentType: string,
    name: string,
    global: string,
    getFilenameForChunk: (chunk: Chunk) => TemplatePath | false,
    allChunks: boolean,
  );
  contentType: string;
  global: string;
  getFilenameForChunk: (chunk: Chunk) => TemplatePath | false;
  allChunks: boolean;
}
declare namespace GetChunkFilenameRuntimeModule {
  export {
    Chunk,
    ChunkId,
    ChunkGraph,
    Compilation,
    HashWithLengthFunction,
    TemplatePath,
  };
}
import RuntimeModule = require('../RuntimeModule');
type Chunk = import('../Chunk');
type ChunkId = import('../Chunk').ChunkId;
type ChunkGraph = import('../ChunkGraph');
type Compilation = import('../Compilation');
type HashWithLengthFunction = import('../Compilation').HashWithLengthFunction;
type TemplatePath = import('../TemplatedPathPlugin').TemplatePath;
