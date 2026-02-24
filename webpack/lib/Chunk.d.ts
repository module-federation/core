export = Chunk;
/**
 * A Chunk is a unit of encapsulation for Modules.
 * Chunks are "rendered" into bundles that get emitted when the build completes.
 */
declare class Chunk {
  /**
   * @param {ChunkName=} name of chunk being created, is optional (for subclasses)
   * @param {boolean} backCompat enable backward-compatibility
   */
  constructor(name?: ChunkName | undefined, backCompat?: boolean);
  /** @type {ChunkId | null} */
  id: ChunkId | null;
  /** @type {ChunkId[] | null} */
  ids: ChunkId[] | null;
  /** @type {number} */
  debugId: number;
  /** @type {ChunkName | undefined} */
  name: ChunkName | undefined;
  /** @type {IdNameHints} */
  idNameHints: IdNameHints;
  /** @type {boolean} */
  preventIntegration: boolean;
  /** @type {TemplatePath | undefined} */
  filenameTemplate: TemplatePath | undefined;
  /** @type {TemplatePath | undefined} */
  cssFilenameTemplate: TemplatePath | undefined;
  /**
   * @private
   * @type {SortableChunkGroups}
   */
  private _groups;
  /** @type {RuntimeSpec} */
  runtime: RuntimeSpec;
  /** @type {Set<string>} */
  files: Set<string>;
  /** @type {Set<string>} */
  auxiliaryFiles: Set<string>;
  /** @type {boolean} */
  rendered: boolean;
  /** @type {string=} */
  hash: string | undefined;
  /** @type {Record<string, string>} */
  contentHash: Record<string, string>;
  /** @type {string=} */
  renderedHash: string | undefined;
  /** @type {string=} */
  chunkReason: string | undefined;
  /** @type {boolean} */
  extraAsync: boolean;
  get entryModule(): import('./Module');
  /**
   * @returns {boolean} true, if the chunk contains an entry module
   */
  hasEntryModule(): boolean;
  /**
   * @param {Module} module the module
   * @returns {boolean} true, if the chunk could be added
   */
  addModule(module: Module): boolean;
  /**
   * @param {Module} module the module
   * @returns {void}
   */
  removeModule(module: Module): void;
  /**
   * @returns {number} the number of module which are contained in this chunk
   */
  getNumberOfModules(): number;
  get modulesIterable(): Iterable<import('./Module')>;
  /**
   * @param {Chunk} otherChunk the chunk to compare with
   * @returns {-1 | 0 | 1} the comparison result
   */
  compareTo(otherChunk: Chunk): -1 | 0 | 1;
  /**
   * @param {Module} module the module
   * @returns {boolean} true, if the chunk contains the module
   */
  containsModule(module: Module): boolean;
  /**
   * @returns {Module[]} the modules for this chunk
   */
  getModules(): Module[];
  /**
   * @returns {void}
   */
  remove(): void;
  /**
   * @param {Module} module the module
   * @param {Chunk} otherChunk the target chunk
   * @returns {void}
   */
  moveModule(module: Module, otherChunk: Chunk): void;
  /**
   * @param {Chunk} otherChunk the other chunk
   * @returns {boolean} true, if the specified chunk has been integrated
   */
  integrate(otherChunk: Chunk): boolean;
  /**
   * @param {Chunk} otherChunk the other chunk
   * @returns {boolean} true, if chunks could be integrated
   */
  canBeIntegrated(otherChunk: Chunk): boolean;
  /**
   * @returns {boolean} true, if this chunk contains no module
   */
  isEmpty(): boolean;
  /**
   * @returns {number} total size of all modules in this chunk
   */
  modulesSize(): number;
  /**
   * @param {ChunkSizeOptions} options options object
   * @returns {number} total size of this chunk
   */
  size(options?: ChunkSizeOptions): number;
  /**
   * @param {Chunk} otherChunk the other chunk
   * @param {ChunkSizeOptions} options options object
   * @returns {number} total size of the chunk or false if the chunk can't be integrated
   */
  integratedSize(otherChunk: Chunk, options: ChunkSizeOptions): number;
  /**
   * @param {ModuleFilterPredicate} filterFn function used to filter modules
   * @returns {ChunkModuleMaps} module map information
   */
  getChunkModuleMaps(filterFn: ModuleFilterPredicate): ChunkModuleMaps;
  /**
   * @param {ModuleFilterPredicate} filterFn predicate function used to filter modules
   * @param {ChunkFilterPredicate=} filterChunkFn predicate function used to filter chunks
   * @returns {boolean} return true if module exists in graph
   */
  hasModuleInGraph(
    filterFn: ModuleFilterPredicate,
    filterChunkFn?: ChunkFilterPredicate | undefined,
  ): boolean;
  /**
   * @deprecated
   * @param {boolean} realHash whether the full hash or the rendered hash is to be used
   * @returns {ChunkMaps} the chunk map information
   */
  getChunkMaps(realHash: boolean): ChunkMaps;
  /**
   * @returns {boolean} whether or not the Chunk will have a runtime
   */
  hasRuntime(): boolean;
  /**
   * @returns {boolean} whether or not this chunk can be an initial chunk
   */
  canBeInitial(): boolean;
  /**
   * @returns {boolean} whether this chunk can only be an initial chunk
   */
  isOnlyInitial(): boolean;
  /**
   * @returns {EntryOptions | undefined} the entry options for this chunk
   */
  getEntryOptions(): EntryOptions | undefined;
  /**
   * @param {ChunkGroup} chunkGroup the chunkGroup the chunk is being added
   * @returns {void}
   */
  addGroup(chunkGroup: ChunkGroup): void;
  /**
   * @param {ChunkGroup} chunkGroup the chunkGroup the chunk is being removed from
   * @returns {void}
   */
  removeGroup(chunkGroup: ChunkGroup): void;
  /**
   * @param {ChunkGroup} chunkGroup the chunkGroup to check
   * @returns {boolean} returns true if chunk has chunkGroup reference and exists in chunkGroup
   */
  isInGroup(chunkGroup: ChunkGroup): boolean;
  /**
   * @returns {number} the amount of groups that the said chunk is in
   */
  getNumberOfGroups(): number;
  /**
   * @returns {SortableChunkGroups} the chunkGroups that the said chunk is referenced in
   */
  get groupsIterable(): SortableChunkGroups;
  /**
   * @returns {void}
   */
  disconnectFromGroups(): void;
  /**
   * @param {Chunk} newChunk the new chunk that will be split out of
   * @returns {void}
   */
  split(newChunk: Chunk): void;
  /**
   * @param {Hash} hash hash (will be modified)
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @returns {void}
   */
  updateHash(hash: Hash, chunkGraph: ChunkGraph): void;
  /**
   * @returns {Chunks} a set of all the async chunks
   */
  getAllAsyncChunks(): Chunks;
  /**
   * @returns {Chunks} a set of all the initial chunks (including itself)
   */
  getAllInitialChunks(): Chunks;
  /**
   * @returns {Chunks} a set of all the referenced chunks (including itself)
   */
  getAllReferencedChunks(): Chunks;
  /**
   * @returns {Entrypoints} a set of all the referenced entrypoints
   */
  getAllReferencedAsyncEntrypoints(): Entrypoints;
  /**
   * @returns {boolean} true, if the chunk references async chunks
   */
  hasAsyncChunks(): boolean;
  /**
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {ChunkFilterPredicate=} filterFn function used to filter chunks
   * @returns {Record<string, ChunkId[]>} a record object of names to lists of child ids(?)
   */
  getChildIdsByOrders(
    chunkGraph: ChunkGraph,
    filterFn?: ChunkFilterPredicate | undefined,
  ): Record<string, ChunkId[]>;
  /**
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {string} type option name
   * @returns {{ onChunks: Chunk[], chunks: Chunks }[] | undefined} referenced chunks for a specific type
   */
  getChildrenOfTypeInOrder(
    chunkGraph: ChunkGraph,
    type: string,
  ):
    | {
        onChunks: Chunk[];
        chunks: Chunks;
      }[]
    | undefined;
  /**
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {boolean=} includeDirectChildren include direct children (by default only children of async children are included)
   * @param {ChunkFilterPredicate=} filterFn function used to filter chunks
   * @returns {ChunkChildIdsByOrdersMapByData} a record object of names to lists of child ids(?) by chunk id
   */
  getChildIdsByOrdersMap(
    chunkGraph: ChunkGraph,
    includeDirectChildren?: boolean | undefined,
    filterFn?: ChunkFilterPredicate | undefined,
  ): ChunkChildIdsByOrdersMapByData;
  /**
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {string} type option name
   * @param {boolean=} includeDirectChildren include direct children (by default only children of async children are included)
   * @param {ChunkFilterPredicate=} filterFn function used to filter chunks
   * @returns {boolean} true when the child is of type order, otherwise false
   */
  hasChildByOrder(
    chunkGraph: ChunkGraph,
    type: string,
    includeDirectChildren?: boolean | undefined,
    filterFn?: ChunkFilterPredicate | undefined,
  ): boolean;
}
declare namespace Chunk {
  export {
    ChunkFilterPredicate,
    ChunkSizeOptions,
    ModuleFilterPredicate,
    ModuleId,
    ChunkGroup,
    ChunkGroupOptions,
    EntryOptions,
    Module,
    TemplatePath,
    Hash,
    RuntimeSpec,
    ChunkName,
    ChunkId,
    IdNameHints,
    ChunkMaps,
    ChunkModuleIdMap,
    chunkModuleHashMap,
    ChunkModuleMaps,
    Chunks,
    Entrypoints,
    Queue,
    SortableChunkGroups,
    ChunkChildIdsByOrdersMap,
    ChunkChildIdsByOrdersMapByData,
  };
}
import ChunkGraph = require('./ChunkGraph');
type ChunkFilterPredicate = import('./ChunkGraph').ChunkFilterPredicate;
type ChunkSizeOptions = import('./ChunkGraph').ChunkSizeOptions;
type ModuleFilterPredicate = import('./ChunkGraph').ModuleFilterPredicate;
type ModuleId = import('./ChunkGraph').ModuleId;
type ChunkGroup = import('./ChunkGroup');
type ChunkGroupOptions = import('./ChunkGroup').ChunkGroupOptions;
type EntryOptions = import('./Entrypoint').EntryOptions;
type Module = import('./Module');
type TemplatePath = import('./TemplatedPathPlugin').TemplatePath;
type Hash = import('./util/Hash');
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type ChunkName = string | null;
type ChunkId = string | number;
type IdNameHints = SortableSet<string>;
type ChunkMaps = {
  hash: Record<ChunkId, string>;
  contentHash: Record<ChunkId, Record<string, string>>;
  name: Record<ChunkId, string>;
};
type ChunkModuleIdMap = Record<ChunkId, ChunkId[]>;
type chunkModuleHashMap = Record<ModuleId, string>;
type ChunkModuleMaps = {
  id: ChunkModuleIdMap;
  hash: chunkModuleHashMap;
};
type Chunks = Set<Chunk>;
type Entrypoints = Set<Entrypoint>;
type Queue = Set<ChunkGroup>;
type SortableChunkGroups = SortableSet<ChunkGroup>;
type ChunkChildIdsByOrdersMap = Record<string, ChunkId[]>;
type ChunkChildIdsByOrdersMapByData = Record<string, ChunkChildIdsByOrdersMap>;
import SortableSet = require('./util/SortableSet');
import Entrypoint = require('./Entrypoint');
