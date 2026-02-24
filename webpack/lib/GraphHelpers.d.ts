export type Chunk = import('./Chunk');
export type ChunkGroup = import('./ChunkGroup');
export type Entrypoint = import('.').Entrypoint;
/** @typedef {import("./Chunk")} Chunk */
/** @typedef {import("./ChunkGroup")} ChunkGroup */
/** @typedef {import(".").Entrypoint} Entrypoint */
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
/**
 * @param {Entrypoint} entrypoint the entrypoint
 * @param {Entrypoint} dependOnEntrypoint the dependOnEntrypoint
 * @returns {void}
 */
export function connectEntrypointAndDependOn(
  entrypoint: Entrypoint,
  dependOnEntrypoint: Entrypoint,
): void;
