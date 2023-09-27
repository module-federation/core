export = HotUpdateChunk;
/** @typedef {import("./ChunkGraph")} ChunkGraph */
/** @typedef {import("./util/Hash")} Hash */
declare class HotUpdateChunk extends Chunk {
  constructor();
}
declare namespace HotUpdateChunk {
  export { ChunkGraph, Hash };
}
import Chunk = require('./Chunk');
type ChunkGraph = import('./ChunkGraph');
type Hash = import('./util/Hash');
