export function entryStartupAwaitsChunks(chunkGraph: ChunkGraph, chunk: Chunk): boolean;
export function generateEntryStartup(chunkGraph: ChunkGraph, runtimeTemplate: RuntimeTemplate, entries: ChunkGraph.EntryModuleWithChunkGroup[], chunk: Chunk, passive: boolean): string;
export function getInitialChunkIds(chunk: Chunk, chunkGraph: ChunkGraph, filterFn: (chunk: Chunk, chunkGraph: ChunkGraph) => boolean): Set<Chunk.ChunkId>;
export function renderAwaitedEntries(targets: string[]): string[];
export function updateHashForEntryStartup(hash: Hash, chunkGraph: ChunkGraph, entries: ChunkGraph.EntryModuleWithChunkGroup[], chunk: Chunk): void;
export type Chunks = Set<Chunk>;
export type ModuleIds = ChunkGraph.ModuleId[];
/** @typedef {Set<Chunk>} Chunks */
/** @typedef {ModuleId[]} ModuleIds */
/**
 * The module id an entry helper runs, assigned to `entryModuleId` only where a reader
 * (`require.main`, `import.meta.main`) asked for that global itself. A split runtime
 * chunk carries the tree requirements, so the chunk being rendered has none to read.
 * @param {ChunkGraph} chunkGraph chunkGraph
 * @param {Chunk} chunk the chunk the helper is rendered into
 * @param {string} moduleIdExpression the module id the helper runs
 * @returns {string} what to hand `__webpack_require__`
 */
export function entryModuleIdExpression(chunkGraph: ChunkGraph, chunk: Chunk, moduleIdExpression: string): string;
import type ChunkGraph from "../graph/ChunkGraph";
import type Chunk from "../graph/Chunk";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type Hash from "../util/Hash";
