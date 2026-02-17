export = Chunk;
/**
 * A Chunk is a unit of encapsulation for Modules.
 * Chunks are "rendered" into bundles that get emitted when the build completes.
 */
declare class Chunk {
  /**
   * @param {string=} name of chunk being created, is optional (for subclasses)
   * @param {boolean} backCompat enable backward-compatibility
   */
  constructor(name?: string | undefined, backCompat?: boolean);
  /** @type {ChunkId | null} */
  id: ChunkId | null;
  /** @type {ChunkId[] | null} */
  ids: ChunkId[] | null;
  /** @type {number} */
  debugId: number;
  /** @type {string | undefined} */
  name: string | undefined;
  /** @type {SortableSet<string>} */
  idNameHints: SortableSet<string>;
  /** @type {boolean} */
  preventIntegration: boolean;
  /** @type {(string | function(PathData, AssetInfo=): string) | undefined} */
  filenameTemplate:
    | string
    | ((arg0: PathData, arg1?: AssetInfo | undefined) => string);
  /** @type {(string | function(PathData, AssetInfo=): string) | undefined} */
  cssFilenameTemplate:
    | string
    | ((arg0: PathData, arg1?: AssetInfo | undefined) => string);
  /** @private @type {SortableSet<ChunkGroup>} */
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
   * @returns {-1|0|1} the comparison result
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
   * @returns {SortableSet<ChunkGroup>} the chunkGroups that the said chunk is referenced in
   */
  get groupsIterable(): SortableSet<import('./ChunkGroup')>;
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
   * @returns {Set<Chunk>} a set of all the async chunks
   */
  getAllAsyncChunks(): Set<Chunk>;
  /**
   * @returns {Set<Chunk>} a set of all the initial chunks (including itself)
   */
  getAllInitialChunks(): Set<Chunk>;
  /**
   * @returns {Set<Chunk>} a set of all the referenced chunks (including itself)
   */
  getAllReferencedChunks(): Set<Chunk>;
  /**
   * @returns {Set<Entrypoint>} a set of all the referenced entrypoints
   */
  getAllReferencedAsyncEntrypoints(): Set<Entrypoint>;
  /**
   * @returns {boolean} true, if the chunk references async chunks
   */
  hasAsyncChunks(): boolean;
  /**
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {ChunkFilterPredicate=} filterFn function used to filter chunks
   * @returns {Record<string, (string | number)[]>} a record object of names to lists of child ids(?)
   */
  getChildIdsByOrders(
    chunkGraph: ChunkGraph,
    filterFn?: ChunkFilterPredicate | undefined,
  ): Record<string, (string | number)[]>;
  /**
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {string} type option name
   * @returns {{ onChunks: Chunk[], chunks: Set<Chunk> }[] | undefined} referenced chunks for a specific type
   */
  getChildrenOfTypeInOrder(
    chunkGraph: ChunkGraph,
    type: string,
  ):
    | {
        onChunks: Chunk[];
        chunks: Set<Chunk>;
      }[]
    | undefined;
  /**
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {boolean=} includeDirectChildren include direct children (by default only children of async children are included)
   * @param {ChunkFilterPredicate=} filterFn function used to filter chunks
   * @returns {Record<string|number, Record<string, (string | number)[]>>} a record object of names to lists of child ids(?) by chunk id
   */
  getChildIdsByOrdersMap(
    chunkGraph: ChunkGraph,
    includeDirectChildren?: boolean | undefined,
    filterFn?: ChunkFilterPredicate | undefined,
  ): Record<string | number, Record<string, (string | number)[]>>;
}
declare namespace Chunk {
  export {
    Source,
    ChunkFilterPredicate,
    ChunkSizeOptions,
    ModuleFilterPredicate,
    ChunkGroup,
    ChunkGroupOptions,
    Compilation,
    AssetInfo,
    PathData,
    EntryOptions,
    Module,
    ModuleGraph,
    Hash,
    RuntimeSpec,
    ChunkId,
    WithId,
    ChunkMaps,
    ChunkModuleMaps,
  };
}
type ChunkId = number | string;
import SortableSet = require('./util/SortableSet');
type PathData = import('./Compilation').PathData;
type AssetInfo = import('./Compilation').AssetInfo;
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type Module = import('./Module');
type ChunkSizeOptions = import('./ChunkGraph').ChunkSizeOptions;
type ModuleFilterPredicate = import('./ChunkGraph').ModuleFilterPredicate;
type ChunkModuleMaps = {
  id: Record<string | number, (string | number)[]>;
  hash: Record<string | number, string>;
};
type ChunkFilterPredicate = import('./ChunkGraph').ChunkFilterPredicate;
type ChunkMaps = {
  hash: Record<string | number, string>;
  contentHash: Record<string | number, Record<string, string>>;
  name: Record<string | number, string>;
};
type EntryOptions = import('./Entrypoint').EntryOptions;
type ChunkGroup = import('./ChunkGroup');
type Hash = import('./util/Hash');
import ChunkGraph = require('./ChunkGraph');
import Entrypoint = require('./Entrypoint');
type Source = any;
type ChunkGroupOptions = import('./ChunkGroup').ChunkGroupOptions;
type Compilation = import('./Compilation');
type ModuleGraph = import('./ModuleGraph');
/**
 * an object who has an id property *
 */
type WithId = {
  /**
   * the id of the object
   */
  id: string | number;
};
