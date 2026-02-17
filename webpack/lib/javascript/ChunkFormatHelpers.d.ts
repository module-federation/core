export type ChunkGraph = import("../ChunkGraph");
export type Module = import("../Module");
export type Chunk = import("../Chunk");
export type Entrypoint = import("../Entrypoint");
export type Hash = import("../util/Hash");
export type ChunkHashContext = import("../Compilation").ChunkHashContext;
/**
 * Creates a chunk hash handler
 * @param {string} name The name of the chunk
 * @returns {(chunk: Chunk, hash: Hash, { chunkGraph }: ChunkHashContext) => void} The chunk hash handler
 */
export function createChunkHashHandler(name: string): (chunk: Chunk, hash: Hash, { chunkGraph }: ChunkHashContext) => void;
/** @typedef {import("../ChunkGraph")} ChunkGraph */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Entrypoint")} Entrypoint */
/** @typedef {import("../util/Hash")} Hash */
/** @typedef {import("../Compilation").ChunkHashContext} ChunkHashContext */
/**
 * Gets information about a chunk including its entries and runtime chunk
 * @param {Chunk} chunk The chunk to get information for
 * @param {ChunkGraph} chunkGraph The chunk graph containing the chunk
 * @returns {{ entries: [Module, Entrypoint | undefined][], runtimeChunk: Chunk | null }} Object containing chunk entries and runtime chunk
 */
export function getChunkInfo(chunk: Chunk, chunkGraph: ChunkGraph): {
    entries: [Module, Entrypoint | undefined][];
    runtimeChunk: Chunk | null;
};
