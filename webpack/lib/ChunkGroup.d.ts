export = ChunkGroup;
declare class ChunkGroup {
  /**
   * Creates an instance of ChunkGroup.
   * @param {string|ChunkGroupOptions=} options chunk group options passed to chunkGroup
   */
  constructor(options?: (string | ChunkGroupOptions) | undefined);
  /** @type {number} */
  groupDebugId: number;
  options: ChunkGroupOptions;
  /** @type {SortableSet<ChunkGroup>} */
  _children: SortableSet<ChunkGroup>;
  /** @type {SortableSet<ChunkGroup>} */
  _parents: SortableSet<ChunkGroup>;
  /** @type {SortableSet<ChunkGroup>} */
  _asyncEntrypoints: SortableSet<ChunkGroup>;
  _blocks: SortableSet<any>;
  /** @type {Chunk[]} */
  chunks: Chunk[];
  /** @type {OriginRecord[]} */
  origins: OriginRecord[];
  /** Indices in top-down order */
  /** @private @type {Map<Module, number>} */
  private _modulePreOrderIndices;
  /** Indices in bottom-up order */
  /** @private @type {Map<Module, number>} */
  private _modulePostOrderIndices;
  /** @type {number | undefined} */
  index: number | undefined;
  /**
   * when a new chunk is added to a chunkGroup, addingOptions will occur.
   * @param {ChunkGroupOptions} options the chunkGroup options passed to addOptions
   * @returns {void}
   */
  addOptions(options: ChunkGroupOptions): void;
  /**
   * sets a new name for current ChunkGroup
   * @param {string | undefined} value the new name for ChunkGroup
   * @returns {void}
   */
  set name(arg: string);
  /**
   * returns the name of current ChunkGroup
   * @returns {string | undefined} returns the ChunkGroup name
   */
  get name(): string;
  /**
   * get a uniqueId for ChunkGroup, made up of its member Chunk debugId's
   * @returns {string} a unique concatenation of chunk debugId's
   */
  get debugId(): string;
  /**
   * get a unique id for ChunkGroup, made up of its member Chunk id's
   * @returns {string} a unique concatenation of chunk ids
   */
  get id(): string;
  /**
   * Performs an unshift of a specific chunk
   * @param {Chunk} chunk chunk being unshifted
   * @returns {boolean} returns true if attempted chunk shift is accepted
   */
  unshiftChunk(chunk: Chunk): boolean;
  /**
   * inserts a chunk before another existing chunk in group
   * @param {Chunk} chunk Chunk being inserted
   * @param {Chunk} before Placeholder/target chunk marking new chunk insertion point
   * @returns {boolean} return true if insertion was successful
   */
  insertChunk(chunk: Chunk, before: Chunk): boolean;
  /**
   * add a chunk into ChunkGroup. Is pushed on or prepended
   * @param {Chunk} chunk chunk being pushed into ChunkGroupS
   * @returns {boolean} returns true if chunk addition was successful.
   */
  pushChunk(chunk: Chunk): boolean;
  /**
   * @param {Chunk} oldChunk chunk to be replaced
   * @param {Chunk} newChunk New chunk that will be replaced with
   * @returns {boolean} returns true if the replacement was successful
   */
  replaceChunk(oldChunk: Chunk, newChunk: Chunk): boolean;
  /**
   * @param {Chunk} chunk chunk to remove
   * @returns {boolean} returns true if chunk was removed
   */
  removeChunk(chunk: Chunk): boolean;
  /**
   * @returns {boolean} true, when this chunk group will be loaded on initial page load
   */
  isInitial(): boolean;
  /**
   * @param {ChunkGroup} group chunk group to add
   * @returns {boolean} returns true if chunk group was added
   */
  addChild(group: ChunkGroup): boolean;
  /**
   * @returns {ChunkGroup[]} returns the children of this group
   */
  getChildren(): ChunkGroup[];
  getNumberOfChildren(): number;
  get childrenIterable(): SortableSet<ChunkGroup>;
  /**
   * @param {ChunkGroup} group the chunk group to remove
   * @returns {boolean} returns true if the chunk group was removed
   */
  removeChild(group: ChunkGroup): boolean;
  /**
   * @param {ChunkGroup} parentChunk the parent group to be added into
   * @returns {boolean} returns true if this chunk group was added to the parent group
   */
  addParent(parentChunk: ChunkGroup): boolean;
  /**
   * @returns {ChunkGroup[]} returns the parents of this group
   */
  getParents(): ChunkGroup[];
  getNumberOfParents(): number;
  /**
   * @param {ChunkGroup} parent the parent group
   * @returns {boolean} returns true if the parent group contains this group
   */
  hasParent(parent: ChunkGroup): boolean;
  get parentsIterable(): SortableSet<ChunkGroup>;
  /**
   * @param {ChunkGroup} chunkGroup the parent group
   * @returns {boolean} returns true if this group has been removed from the parent
   */
  removeParent(chunkGroup: ChunkGroup): boolean;
  /**
   * @param {Entrypoint} entrypoint entrypoint to add
   * @returns {boolean} returns true if entrypoint was added
   */
  addAsyncEntrypoint(entrypoint: Entrypoint): boolean;
  get asyncEntrypointsIterable(): SortableSet<ChunkGroup>;
  /**
   * @returns {Array<AsyncDependenciesBlock>} an array containing the blocks
   */
  getBlocks(): Array<AsyncDependenciesBlock>;
  getNumberOfBlocks(): number;
  /**
   * @param {AsyncDependenciesBlock} block block
   * @returns {boolean} true, if block exists
   */
  hasBlock(block: AsyncDependenciesBlock): boolean;
  /**
   * @returns {Iterable<AsyncDependenciesBlock>} blocks
   */
  get blocksIterable(): Iterable<import('./AsyncDependenciesBlock')>;
  /**
   * @param {AsyncDependenciesBlock} block a block
   * @returns {boolean} false, if block was already added
   */
  addBlock(block: AsyncDependenciesBlock): boolean;
  /**
   * @param {Module} module origin module
   * @param {DependencyLocation} loc location of the reference in the origin module
   * @param {string} request request name of the reference
   * @returns {void}
   */
  addOrigin(module: Module, loc: DependencyLocation, request: string): void;
  /**
   * @returns {string[]} the files contained this chunk group
   */
  getFiles(): string[];
  /**
   * @returns {void}
   */
  remove(): void;
  sortItems(): void;
  /**
   * Sorting predicate which allows current ChunkGroup to be compared against another.
   * Sorting values are based off of number of chunks in ChunkGroup.
   *
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {ChunkGroup} otherGroup the chunkGroup to compare this against
   * @returns {-1|0|1} sort position for comparison
   */
  compareTo(chunkGraph: ChunkGraph, otherGroup: ChunkGroup): -1 | 0 | 1;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @returns {Record<string, ChunkGroup[]>} mapping from children type to ordered list of ChunkGroups
   */
  getChildrenByOrders(
    moduleGraph: ModuleGraph,
    chunkGraph: ChunkGraph,
  ): Record<string, ChunkGroup[]>;
  /**
   * Sets the top-down index of a module in this ChunkGroup
   * @param {Module} module module for which the index should be set
   * @param {number} index the index of the module
   * @returns {void}
   */
  setModulePreOrderIndex(module: Module, index: number): void;
  /**
   * Gets the top-down index of a module in this ChunkGroup
   * @param {Module} module the module
   * @returns {number | undefined} index
   */
  getModulePreOrderIndex(module: Module): number | undefined;
  /**
   * Sets the bottom-up index of a module in this ChunkGroup
   * @param {Module} module module for which the index should be set
   * @param {number} index the index of the module
   * @returns {void}
   */
  setModulePostOrderIndex(module: Module, index: number): void;
  /**
   * Gets the bottom-up index of a module in this ChunkGroup
   * @param {Module} module the module
   * @returns {number | undefined} index
   */
  getModulePostOrderIndex(module: Module): number | undefined;
  checkConstraints(): void;
  getModuleIndex: (module: Module) => number | undefined;
  getModuleIndex2: (module: Module) => number | undefined;
}
declare namespace ChunkGroup {
  export {
    AsyncDependenciesBlock,
    Chunk,
    ChunkGraph,
    DependencyLocation,
    Entrypoint,
    Module,
    ModuleGraph,
    HasId,
    OriginRecord,
    RawChunkGroupOptions,
    ChunkGroupOptions,
  };
}
type ChunkGroupOptions = RawChunkGroupOptions & {
  name?: string;
};
import SortableSet = require('./util/SortableSet');
type Chunk = import('./Chunk');
type OriginRecord = {
  module: Module;
  loc: DependencyLocation;
  request: string;
};
type Entrypoint = import('./Entrypoint');
type AsyncDependenciesBlock = import('./AsyncDependenciesBlock');
type Module = import('./Module');
type DependencyLocation = import('./Dependency').DependencyLocation;
type ChunkGraph = import('./ChunkGraph');
type ModuleGraph = import('./ModuleGraph');
type HasId = {
  id: number;
};
type RawChunkGroupOptions = {
  preloadOrder?: number | undefined;
  prefetchOrder?: number | undefined;
  fetchPriority?: ('low' | 'high' | 'auto') | undefined;
};
declare namespace module {
  namespace exports {
    export {
      AsyncDependenciesBlock,
      Chunk,
      ChunkGraph,
      DependencyLocation,
      Entrypoint,
      Module,
      ModuleGraph,
      HasId,
      OriginRecord,
      RawChunkGroupOptions,
      ChunkGroupOptions,
    };
  }
}
