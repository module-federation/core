export = GetChunkFilenameRuntimeModule;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Compilation").AssetInfo} AssetInfo */
/** @typedef {import("../Compilation").PathData} PathData */
/** @typedef {function(PathData, AssetInfo=): string} FilenameFunction */
declare class GetChunkFilenameRuntimeModule extends RuntimeModule {
  /**
   * @param {string} contentType the contentType to use the content hash for
   * @param {string} name kind of filename
   * @param {string} global function name to be assigned
   * @param {function(Chunk): string | FilenameFunction} getFilenameForChunk functor to get the filename or function
   * @param {boolean} allChunks when false, only async chunks are included
   */
  constructor(
    contentType: string,
    name: string,
    global: string,
    getFilenameForChunk: (arg0: Chunk) => string | FilenameFunction,
    allChunks: boolean,
  );
  contentType: string;
  global: string;
  getFilenameForChunk: (arg0: Chunk) => string | FilenameFunction;
  allChunks: boolean;
}
declare namespace GetChunkFilenameRuntimeModule {
  export {
    Chunk,
    ChunkGraph,
    Compilation,
    AssetInfo,
    PathData,
    FilenameFunction,
  };
}
import RuntimeModule = require('../RuntimeModule');
type Chunk = import('../Chunk');
type FilenameFunction = (arg0: PathData, arg1: AssetInfo | undefined) => string;
type ChunkGraph = import('../ChunkGraph');
type Compilation = import('../Compilation');
type AssetInfo = import('../Compilation').AssetInfo;
type PathData = import('../Compilation').PathData;
