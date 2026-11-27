/** @import Chunk from "../graph/Chunk" */
/** @import ChunkGraph from "../graph/ChunkGraph" */
/** @import Entrypoint from "../graph/Entrypoint" */
/** @import Module from "../module/Module" */
/** @import Hash from "../util/Hash" */
/** @import { ChunkHashContext } from "../Compilation" */
/**
 * Returns chunks.
 * @param {Entrypoint} entrypoint a chunk group
 * @param {(Chunk | null)=} excludedChunk1 current chunk which is excluded
 * @param {(Chunk | null)=} excludedChunk2 runtime chunk which is excluded
 * @returns {Set<Chunk>} chunks
 */
export function getAllChunks(entrypoint: Entrypoint, excludedChunk1?: (Chunk | null) | undefined, excludedChunk2?: (Chunk | null) | undefined): Set<Chunk>;
/**
 * Creates a chunk hash handler
 * @param {string} name The name of the chunk
 * @returns {(chunk: Chunk, hash: Hash, { chunkGraph }: ChunkHashContext) => void} The chunk hash handler
 */
export function createChunkHashHandler(name: string): (chunk: Chunk, hash: Hash, { chunkGraph }: ChunkHashContext) => void;
/**
 * Returns } Object containing chunk entries and runtime chunk.
 * @param {Chunk} chunk The chunk to get information for
 * @param {ChunkGraph} chunkGraph The chunk graph containing the chunk
 * @returns {{ entries: [Module, Entrypoint | undefined][], runtimeChunk: Chunk | null }} Object containing chunk entries and runtime chunk
 */
export function getChunkInfo(chunk: Chunk, chunkGraph: ChunkGraph): {
    entries: [Module, Entrypoint | undefined][];
    runtimeChunk: Chunk | null;
};
import type Entrypoint from "../graph/Entrypoint";
import type Chunk from "../graph/Chunk";
import type Hash from "../util/Hash";
import type { ChunkHashContext } from "../Compilation";
import type ChunkGraph from "../graph/ChunkGraph";
import type Module from "../module/Module";
