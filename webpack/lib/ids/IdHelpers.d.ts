export type Chunk = import('../Chunk');
export type ChunkGraph = import('../ChunkGraph');
export type Compilation = import('../Compilation');
export type Module = import('../Module');
export type Hash = typeof import('../util/Hash');
export type AssociatedObjectForCache =
  import('../util/identifier').AssociatedObjectForCache;
export type BuildMeta = import('../Module').BuildMeta;
export type UsedModuleIds = Set<string>;
export type UsedChunkIds = Set<string>;
/**
 * @param {Iterable<Chunk>} chunks the chunks
 * @param {Compilation} compilation the compilation
 * @returns {void}
 */
export function assignAscendingChunkIds(
  chunks: Iterable<Chunk>,
  compilation: Compilation,
): void;
/**
 * @param {UsedModuleIds} usedIds used ids
 * @param {Iterable<Module>} modules the modules
 * @param {Compilation} compilation the compilation
 * @returns {void}
 */
export function assignAscendingModuleIds(
  usedIds: UsedModuleIds,
  modules: Iterable<Module>,
  compilation: Compilation,
): void;
/**
 * @template T
 * @param {T[]} items list of items to be named
 * @param {(item: T) => string} getName get a name for an item
 * @param {(a: T, n: T) => -1 | 0 | 1} comparator order of items
 * @param {(item: T, id: number) => boolean} assignId assign an id to an item
 * @param {number[]} ranges usable ranges for ids
 * @param {number} expandFactor factor to create more ranges
 * @param {number} extraSpace extra space to allocate, i. e. when some ids are already used
 * @param {number} salt salting number to initialize hashing
 * @returns {void}
 */
export function assignDeterministicIds<T>(
  items: T[],
  getName: (item: T) => string,
  comparator: (a: T, n: T) => -1 | 0 | 1,
  assignId: (item: T, id: number) => boolean,
  ranges?: number[],
  expandFactor?: number,
  extraSpace?: number,
  salt?: number,
): void;
/**
 * @template T
 * @param {Iterable<T>} items list of items to be named
 * @param {(item: T) => string} getShortName get a short name for an item
 * @param {(item: T, name: string) => string} getLongName get a long name for an item
 * @param {(a: T, b: T) => -1 | 0 | 1} comparator order of items
 * @param {Set<string>} usedIds already used ids, will not be assigned
 * @param {(item: T, name: string) => void} assignName assign a name to an item
 * @returns {T[]} list of items without a name
 */
export function assignNames<T>(
  items: Iterable<T>,
  getShortName: (item: T) => string,
  getLongName: (item: T, name: string) => string,
  comparator: (a: T, b: T) => -1 | 0 | 1,
  usedIds: Set<string>,
  assignName: (item: T, name: string) => void,
): T[];
/**
 * @param {Chunk} chunk the chunk
 * @param {ChunkGraph} chunkGraph the chunk graph
 * @param {string} context context directory
 * @param {AssociatedObjectForCache=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} full chunk name
 */
export function getFullChunkName(
  chunk: Chunk,
  chunkGraph: ChunkGraph,
  context: string,
  associatedObjectForCache?: AssociatedObjectForCache | undefined,
): string;
/**
 * @param {Module} module the module
 * @param {string} context context directory
 * @param {AssociatedObjectForCache=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} full module name
 */
export function getFullModuleName(
  module: Module,
  context: string,
  associatedObjectForCache?: AssociatedObjectForCache | undefined,
): string;
/**
 * @param {Chunk} chunk the chunk
 * @param {ChunkGraph} chunkGraph the chunk graph
 * @param {string} context context directory
 * @param {string} delimiter delimiter for names
 * @param {string | Hash} hashFunction hash function to use
 * @param {AssociatedObjectForCache=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} short chunk name
 */
export function getLongChunkName(
  chunk: Chunk,
  chunkGraph: ChunkGraph,
  context: string,
  delimiter: string,
  hashFunction: string | Hash,
  associatedObjectForCache?: AssociatedObjectForCache | undefined,
): string;
/**
 * @param {string} shortName the short name
 * @param {Module} module the module
 * @param {string} context context directory
 * @param {string | Hash} hashFunction hash function to use
 * @param {AssociatedObjectForCache=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} long module name
 */
export function getLongModuleName(
  shortName: string,
  module: Module,
  context: string,
  hashFunction: string | Hash,
  associatedObjectForCache?: AssociatedObjectForCache | undefined,
): string;
/**
 * @param {Chunk} chunk the chunk
 * @param {ChunkGraph} chunkGraph the chunk graph
 * @param {string} context context directory
 * @param {string} delimiter delimiter for names
 * @param {string | Hash} hashFunction hash function to use
 * @param {AssociatedObjectForCache=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} short chunk name
 */
export function getShortChunkName(
  chunk: Chunk,
  chunkGraph: ChunkGraph,
  context: string,
  delimiter: string,
  hashFunction: string | Hash,
  associatedObjectForCache?: AssociatedObjectForCache | undefined,
): string;
/**
 * @param {Module} module the module
 * @param {string} context context directory
 * @param {AssociatedObjectForCache=} associatedObjectForCache an object to which the cache will be attached
 * @returns {string} short module name
 */
export function getShortModuleName(
  module: Module,
  context: string,
  associatedObjectForCache?: AssociatedObjectForCache | undefined,
): string;
/** @typedef {Set<string>} UsedChunkIds */
/**
 * @param {Compilation} compilation the compilation
 * @returns {UsedChunkIds} used chunk ids as strings
 */
export function getUsedChunkIds(compilation: Compilation): UsedChunkIds;
/** @typedef {Set<string>} UsedModuleIds */
/**
 * @param {Compilation} compilation the compilation
 * @param {((module: Module) => boolean)=} filter filter modules
 * @returns {[UsedModuleIds, Module[]]} used module ids as strings and modules without id matching the filter
 */
export function getUsedModuleIdsAndModules(
  compilation: Compilation,
  filter?: ((module: Module) => boolean) | undefined,
): [UsedModuleIds, Module[]];
/**
 * @param {string} request the request
 * @returns {string} id representation
 */
export function requestToId(request: string): string;
