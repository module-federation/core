export type Chunk = import('../Chunk');
/** @typedef {import("../Chunk")} Chunk */
/**
 * @param {Entrypoint} entrypoint a chunk group
 * @param {Chunk=} excludedChunk1 current chunk which is excluded
 * @param {Chunk=} excludedChunk2 runtime chunk which is excluded
 * @returns {Set<Chunk>} chunks
 */
export function getAllChunks(
  entrypoint: Entrypoint,
  excludedChunk1?: Chunk | undefined,
  excludedChunk2?: Chunk | undefined,
): Set<Chunk>;
import Entrypoint = require('../Entrypoint');
