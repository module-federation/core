export type Chunk = import('../Chunk');
/** @typedef {import("../Chunk")} Chunk */
/**
 * @param {Entrypoint} entrypoint a chunk group
 * @param {(Chunk | null)=} excludedChunk1 current chunk which is excluded
 * @param {(Chunk | null)=} excludedChunk2 runtime chunk which is excluded
 * @returns {Set<Chunk>} chunks
 */
export function getAllChunks(
  entrypoint: Entrypoint,
  excludedChunk1?: (Chunk | null) | undefined,
  excludedChunk2?: (Chunk | null) | undefined,
): Set<Chunk>;
import Entrypoint = require('../Entrypoint');
