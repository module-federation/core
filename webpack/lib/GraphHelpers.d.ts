export type AsyncDependenciesBlock = import('./AsyncDependenciesBlock');
export type Chunk = import('./Chunk');
export type ChunkGroup = import('./ChunkGroup');
export type DependenciesBlock = import('./DependenciesBlock');
export type Module = import('./Module');
/** @typedef {import("./AsyncDependenciesBlock")} AsyncDependenciesBlock */
/** @typedef {import("./Chunk")} Chunk */
/** @typedef {import("./ChunkGroup")} ChunkGroup */
/** @typedef {import("./DependenciesBlock")} DependenciesBlock */
/** @typedef {import("./Module")} Module */
/**
 * @param {ChunkGroup} chunkGroup the ChunkGroup to connect
 * @param {Chunk} chunk chunk to tie to ChunkGroup
 * @returns {void}
 */
export function connectChunkGroupAndChunk(
  chunkGroup: ChunkGroup,
  chunk: Chunk,
): void;
/**
 * @param {ChunkGroup} parent parent ChunkGroup to connect
 * @param {ChunkGroup} child child ChunkGroup to connect
 * @returns {void}
 */
export function connectChunkGroupParentAndChild(
  parent: ChunkGroup,
  child: ChunkGroup,
): void;
