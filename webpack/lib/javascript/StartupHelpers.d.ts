export function generateEntryStartup(
  chunkGraph: ChunkGraph,
  runtimeTemplate: RuntimeTemplate,
  entries: import('../ChunkGraph').EntryModuleWithChunkGroup[],
  chunk: Chunk,
  passive: boolean,
): string;
export function updateHashForEntryStartup(
  hash: Hash,
  chunkGraph: ChunkGraph,
  entries: import('../ChunkGraph').EntryModuleWithChunkGroup[],
  chunk: Chunk,
): void;
export function getInitialChunkIds(
  chunk: Chunk,
  chunkGraph: ChunkGraph,
  filterFn: (arg0: Chunk, arg1: ChunkGraph) => boolean,
): Set<number | string>;
export type Hash = import('../util/Hash');
export type Chunk = import('../Chunk');
export type Compilation = import('../Compilation');
export type ChunkGraph = import('../ChunkGraph');
export type EntryModuleWithChunkGroup =
  import('../ChunkGraph').EntryModuleWithChunkGroup;
export type ChunkGroup = import('../ChunkGroup');
export type RuntimeTemplate = import('../RuntimeTemplate');
export type EntryItem = (string | number)[];
