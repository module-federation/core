export = ChunkGraph;
declare class ChunkGraph {
  /**
   * @param {Module} module the module
   * @param {string} deprecateMessage message for the deprecation message
   * @param {string} deprecationCode code for the deprecation
   * @returns {ChunkGraph} the chunk graph
   */
  static getChunkGraphForModule(
    module: Module,
    deprecateMessage: string,
    deprecationCode: string,
  ): ChunkGraph;
  /**
   * @param {Module} module the module
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @returns {void}
   */
  static setChunkGraphForModule(module: Module, chunkGraph: ChunkGraph): void;
  /**
   * @param {Module} module the module
   * @returns {void}
   */
  static clearChunkGraphForModule(module: Module): void;
  /**
   * @param {Chunk} chunk the chunk
   * @param {string} deprecateMessage message for the deprecation message
   * @param {string} deprecationCode code for the deprecation
   * @returns {ChunkGraph} the chunk graph
   */
  static getChunkGraphForChunk(
    chunk: Chunk,
    deprecateMessage: string,
    deprecationCode: string,
  ): ChunkGraph;
  /**
   * @param {Chunk} chunk the chunk
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @returns {void}
   */
  static setChunkGraphForChunk(chunk: Chunk, chunkGraph: ChunkGraph): void;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {void}
   */
  static clearChunkGraphForChunk(chunk: Chunk): void;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {string | Hash} hashFunction the hash function to use
   */
  constructor(moduleGraph: ModuleGraph, hashFunction?: string | Hash);
  /** @private @type {WeakMap<Module, ChunkGraphModule>} */
  private _modules;
  /** @private @type {WeakMap<Chunk, ChunkGraphChunk>} */
  private _chunks;
  /** @private @type {WeakMap<AsyncDependenciesBlock, ChunkGroup>} */
  private _blockChunkGroups;
  /** @private @type {Map<string, string | number>} */
  private _runtimeIds;
  /** @type {ModuleGraph} */
  moduleGraph: ModuleGraph;
  _hashFunction: string | typeof import('./util/Hash');
  /**
   * @param {SortableSet<Module>} set the sortable Set to get the roots of
   * @returns {Module[]} the graph roots
   */
  _getGraphRoots(set: SortableSet<Module>): Module[];
  /**
   * @private
   * @param {Module} module the module
   * @returns {ChunkGraphModule} internal module
   */
  private _getChunkGraphModule;
  /**
   * @private
   * @param {Chunk} chunk the chunk
   * @returns {ChunkGraphChunk} internal chunk
   */
  private _getChunkGraphChunk;
  /**
   * @param {Chunk} chunk the new chunk
   * @param {Module} module the module
   * @returns {void}
   */
  connectChunkAndModule(chunk: Chunk, module: Module): void;
  /**
   * @param {Chunk} chunk the chunk
   * @param {Module} module the module
   * @returns {void}
   */
  disconnectChunkAndModule(chunk: Chunk, module: Module): void;
  /**
   * @param {Chunk} chunk the chunk which will be disconnected
   * @returns {void}
   */
  disconnectChunk(chunk: Chunk): void;
  /**
   * @param {Chunk} chunk the chunk
   * @param {Iterable<Module>} modules the modules
   * @returns {void}
   */
  attachModules(chunk: Chunk, modules: Iterable<Module>): void;
  /**
   * @param {Chunk} chunk the chunk
   * @param {Iterable<RuntimeModule>} modules the runtime modules
   * @returns {void}
   */
  attachRuntimeModules(chunk: Chunk, modules: Iterable<RuntimeModule>): void;
  /**
   * @param {Chunk} chunk the chunk
   * @param {Iterable<RuntimeModule>} modules the modules that require a full hash
   * @returns {void}
   */
  attachFullHashModules(chunk: Chunk, modules: Iterable<RuntimeModule>): void;
  /**
   * @param {Chunk} chunk the chunk
   * @param {Iterable<RuntimeModule>} modules the modules that require a full hash
   * @returns {void}
   */
  attachDependentHashModules(
    chunk: Chunk,
    modules: Iterable<RuntimeModule>,
  ): void;
  /**
   * @param {Module} oldModule the replaced module
   * @param {Module} newModule the replacing module
   * @returns {void}
   */
  replaceModule(oldModule: Module, newModule: Module): void;
  /**
   * @param {Module} module the checked module
   * @param {Chunk} chunk the checked chunk
   * @returns {boolean} true, if the chunk contains the module
   */
  isModuleInChunk(module: Module, chunk: Chunk): boolean;
  /**
   * @param {Module} module the checked module
   * @param {ChunkGroup} chunkGroup the checked chunk group
   * @returns {boolean} true, if the chunk contains the module
   */
  isModuleInChunkGroup(module: Module, chunkGroup: ChunkGroup): boolean;
  /**
   * @param {Module} module the checked module
   * @returns {boolean} true, if the module is entry of any chunk
   */
  isEntryModule(module: Module): boolean;
  /**
   * @param {Module} module the module
   * @returns {Iterable<Chunk>} iterable of chunks (do not modify)
   */
  getModuleChunksIterable(module: Module): Iterable<Chunk>;
  /**
   * @param {Module} module the module
   * @param {function(Chunk, Chunk): -1|0|1} sortFn sort function
   * @returns {Iterable<Chunk>} iterable of chunks (do not modify)
   */
  getOrderedModuleChunksIterable(
    module: Module,
    sortFn: (arg0: Chunk, arg1: Chunk) => -1 | 0 | 1,
  ): Iterable<Chunk>;
  /**
   * @param {Module} module the module
   * @returns {Chunk[]} array of chunks (cached, do not modify)
   */
  getModuleChunks(module: Module): Chunk[];
  /**
   * @param {Module} module the module
   * @returns {number} the number of chunk which contain the module
   */
  getNumberOfModuleChunks(module: Module): number;
  /**
   * @param {Module} module the module
   * @returns {RuntimeSpecSet} runtimes
   */
  getModuleRuntimes(module: Module): RuntimeSpecSet;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {number} the number of modules which are contained in this chunk
   */
  getNumberOfChunkModules(chunk: Chunk): number;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {number} the number of full hash modules which are contained in this chunk
   */
  getNumberOfChunkFullHashModules(chunk: Chunk): number;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {Iterable<Module>} return the modules for this chunk
   */
  getChunkModulesIterable(chunk: Chunk): Iterable<Module>;
  /**
   * @param {Chunk} chunk the chunk
   * @param {string} sourceType source type
   * @returns {Iterable<Module> | undefined} return the modules for this chunk
   */
  getChunkModulesIterableBySourceType(
    chunk: Chunk,
    sourceType: string,
  ): Iterable<Module> | undefined;
  /**
   * @param {Chunk} chunk chunk
   * @param {Module} module chunk module
   * @param {Set<string>} sourceTypes source types
   */
  setChunkModuleSourceTypes(
    chunk: Chunk,
    module: Module,
    sourceTypes: Set<string>,
  ): void;
  /**
   * @param {Chunk} chunk chunk
   * @param {Module} module chunk module
   * @returns {Set<string>} source types
   */
  getChunkModuleSourceTypes(chunk: Chunk, module: Module): Set<string>;
  /**
   * @param {Module} module module
   * @returns {Set<string>} source types
   */
  getModuleSourceTypes(module: Module): Set<string>;
  /**
   * @param {Module} module module
   * @returns {Set<string> | undefined} source types
   */
  _getOverwrittenModuleSourceTypes(module: Module): Set<string> | undefined;
  /**
   * @param {Chunk} chunk the chunk
   * @param {function(Module, Module): -1|0|1} comparator comparator function
   * @returns {Iterable<Module>} return the modules for this chunk
   */
  getOrderedChunkModulesIterable(
    chunk: Chunk,
    comparator: (arg0: Module, arg1: Module) => -1 | 0 | 1,
  ): Iterable<Module>;
  /**
   * @param {Chunk} chunk the chunk
   * @param {string} sourceType source type
   * @param {function(Module, Module): -1|0|1} comparator comparator function
   * @returns {Iterable<Module> | undefined} return the modules for this chunk
   */
  getOrderedChunkModulesIterableBySourceType(
    chunk: Chunk,
    sourceType: string,
    comparator: (arg0: Module, arg1: Module) => -1 | 0 | 1,
  ): Iterable<Module> | undefined;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {Module[]} return the modules for this chunk (cached, do not modify)
   */
  getChunkModules(chunk: Chunk): Module[];
  /**
   * @param {Chunk} chunk the chunk
   * @param {function(Module, Module): -1|0|1} comparator comparator function
   * @returns {Module[]} return the modules for this chunk (cached, do not modify)
   */
  getOrderedChunkModules(
    chunk: Chunk,
    comparator: (arg0: Module, arg1: Module) => -1 | 0 | 1,
  ): Module[];
  /**
   * @param {Chunk} chunk the chunk
   * @param {ModuleFilterPredicate} filterFn function used to filter modules
   * @param {boolean} includeAllChunks all chunks or only async chunks
   * @returns {Record<string|number, (string|number)[]>} chunk to module ids object
   */
  getChunkModuleIdMap(
    chunk: Chunk,
    filterFn: ModuleFilterPredicate,
    includeAllChunks?: boolean,
  ): Record<string | number, (string | number)[]>;
  /**
   * @param {Chunk} chunk the chunk
   * @param {ModuleFilterPredicate} filterFn function used to filter modules
   * @param {number} hashLength length of the hash
   * @param {boolean} includeAllChunks all chunks or only async chunks
   * @returns {Record<string|number, Record<string|number, string>>} chunk to module id to module hash object
   */
  getChunkModuleRenderedHashMap(
    chunk: Chunk,
    filterFn: ModuleFilterPredicate,
    hashLength?: number,
    includeAllChunks?: boolean,
  ): Record<string | number, Record<string | number, string>>;
  /**
   * @param {Chunk} chunk the chunk
   * @param {ChunkFilterPredicate} filterFn function used to filter chunks
   * @returns {Record<string|number, boolean>} chunk map
   */
  getChunkConditionMap(
    chunk: Chunk,
    filterFn: ChunkFilterPredicate,
  ): Record<string | number, boolean>;
  /**
   * @param {Chunk} chunk the chunk
   * @param {ModuleFilterPredicate} filterFn predicate function used to filter modules
   * @param {ChunkFilterPredicate=} filterChunkFn predicate function used to filter chunks
   * @returns {boolean} return true if module exists in graph
   */
  hasModuleInGraph(
    chunk: Chunk,
    filterFn: ModuleFilterPredicate,
    filterChunkFn?: ChunkFilterPredicate | undefined,
  ): boolean;
  /**
   * @param {Chunk} chunkA first chunk
   * @param {Chunk} chunkB second chunk
   * @returns {-1|0|1} this is a comparator function like sort and returns -1, 0, or 1 based on sort order
   */
  compareChunks(chunkA: Chunk, chunkB: Chunk): -1 | 0 | 1;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {number} total size of all modules in the chunk
   */
  getChunkModulesSize(chunk: Chunk): number;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {Record<string, number>} total sizes of all modules in the chunk by source type
   */
  getChunkModulesSizes(chunk: Chunk): Record<string, number>;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {Module[]} root modules of the chunks (ordered by identifier)
   */
  getChunkRootModules(chunk: Chunk): Module[];
  /**
   * @param {Chunk} chunk the chunk
   * @param {ChunkSizeOptions} options options object
   * @returns {number} total size of the chunk
   */
  getChunkSize(chunk: Chunk, options?: ChunkSizeOptions): number;
  /**
   * @param {Chunk} chunkA chunk
   * @param {Chunk} chunkB chunk
   * @param {ChunkSizeOptions} options options object
   * @returns {number} total size of the chunk or false if chunks can't be integrated
   */
  getIntegratedChunksSize(
    chunkA: Chunk,
    chunkB: Chunk,
    options?: ChunkSizeOptions,
  ): number;
  /**
   * @param {Chunk} chunkA chunk
   * @param {Chunk} chunkB chunk
   * @returns {boolean} true, if chunks could be integrated
   */
  canChunksBeIntegrated(chunkA: Chunk, chunkB: Chunk): boolean;
  /**
   * @param {Chunk} chunkA the target chunk
   * @param {Chunk} chunkB the chunk to integrate
   * @returns {void}
   */
  integrateChunks(chunkA: Chunk, chunkB: Chunk): void;
  /**
   * @param {Chunk} chunk the chunk to upgrade
   * @returns {void}
   */
  upgradeDependentToFullHashModules(chunk: Chunk): void;
  /**
   * @param {Module} module the checked module
   * @param {Chunk} chunk the checked chunk
   * @returns {boolean} true, if the chunk contains the module as entry
   */
  isEntryModuleInChunk(module: Module, chunk: Chunk): boolean;
  /**
   * @param {Chunk} chunk the new chunk
   * @param {Module} module the entry module
   * @param {Entrypoint=} entrypoint the chunk group which must be loaded before the module is executed
   * @returns {void}
   */
  connectChunkAndEntryModule(
    chunk: Chunk,
    module: Module,
    entrypoint?: Entrypoint | undefined,
  ): void;
  /**
   * @param {Chunk} chunk the new chunk
   * @param {RuntimeModule} module the runtime module
   * @returns {void}
   */
  connectChunkAndRuntimeModule(chunk: Chunk, module: RuntimeModule): void;
  /**
   * @param {Chunk} chunk the new chunk
   * @param {RuntimeModule} module the module that require a full hash
   * @returns {void}
   */
  addFullHashModuleToChunk(chunk: Chunk, module: RuntimeModule): void;
  /**
   * @param {Chunk} chunk the new chunk
   * @param {RuntimeModule} module the module that require a full hash
   * @returns {void}
   */
  addDependentHashModuleToChunk(chunk: Chunk, module: RuntimeModule): void;
  /**
   * @param {Chunk} chunk the new chunk
   * @param {Module} module the entry module
   * @returns {void}
   */
  disconnectChunkAndEntryModule(chunk: Chunk, module: Module): void;
  /**
   * @param {Chunk} chunk the new chunk
   * @param {RuntimeModule} module the runtime module
   * @returns {void}
   */
  disconnectChunkAndRuntimeModule(chunk: Chunk, module: RuntimeModule): void;
  /**
   * @param {Module} module the entry module, it will no longer be entry
   * @returns {void}
   */
  disconnectEntryModule(module: Module): void;
  /**
   * @param {Chunk} chunk the chunk, for which all entries will be removed
   * @returns {void}
   */
  disconnectEntries(chunk: Chunk): void;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {number} the amount of entry modules in chunk
   */
  getNumberOfEntryModules(chunk: Chunk): number;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {number} the amount of entry modules in chunk
   */
  getNumberOfRuntimeModules(chunk: Chunk): number;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {Iterable<Module>} iterable of modules (do not modify)
   */
  getChunkEntryModulesIterable(chunk: Chunk): Iterable<Module>;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {Iterable<Chunk>} iterable of chunks
   */
  getChunkEntryDependentChunksIterable(chunk: Chunk): Iterable<Chunk>;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {boolean} true, when it has dependent chunks
   */
  hasChunkEntryDependentChunks(chunk: Chunk): boolean;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {Iterable<RuntimeModule>} iterable of modules (do not modify)
   */
  getChunkRuntimeModulesIterable(chunk: Chunk): Iterable<RuntimeModule>;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {RuntimeModule[]} array of modules in order of execution
   */
  getChunkRuntimeModulesInOrder(chunk: Chunk): RuntimeModule[];
  /**
   * @param {Chunk} chunk the chunk
   * @returns {Iterable<RuntimeModule> | undefined} iterable of modules (do not modify)
   */
  getChunkFullHashModulesIterable(
    chunk: Chunk,
  ): Iterable<RuntimeModule> | undefined;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {ReadonlySet<RuntimeModule> | undefined} set of modules (do not modify)
   */
  getChunkFullHashModulesSet(
    chunk: Chunk,
  ): ReadonlySet<RuntimeModule> | undefined;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {Iterable<RuntimeModule> | undefined} iterable of modules (do not modify)
   */
  getChunkDependentHashModulesIterable(
    chunk: Chunk,
  ): Iterable<RuntimeModule> | undefined;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {Iterable<EntryModuleWithChunkGroup>} iterable of modules (do not modify)
   */
  getChunkEntryModulesWithChunkGroupIterable(
    chunk: Chunk,
  ): Iterable<EntryModuleWithChunkGroup>;
  /**
   * @param {AsyncDependenciesBlock} depBlock the async block
   * @returns {ChunkGroup} the chunk group
   */
  getBlockChunkGroup(depBlock: AsyncDependenciesBlock): ChunkGroup;
  /**
   * @param {AsyncDependenciesBlock} depBlock the async block
   * @param {ChunkGroup} chunkGroup the chunk group
   * @returns {void}
   */
  connectBlockAndChunkGroup(
    depBlock: AsyncDependenciesBlock,
    chunkGroup: ChunkGroup,
  ): void;
  /**
   * @param {ChunkGroup} chunkGroup the chunk group
   * @returns {void}
   */
  disconnectChunkGroup(chunkGroup: ChunkGroup): void;
  /**
   * @param {Module} module the module
   * @returns {string | number} the id of the module
   */
  getModuleId(module: Module): string | number;
  /**
   * @param {Module} module the module
   * @param {string | number} id the id of the module
   * @returns {void}
   */
  setModuleId(module: Module, id: string | number): void;
  /**
   * @param {string} runtime runtime
   * @returns {string | number} the id of the runtime
   */
  getRuntimeId(runtime: string): string | number;
  /**
   * @param {string} runtime runtime
   * @param {string | number} id the id of the runtime
   * @returns {void}
   */
  setRuntimeId(runtime: string, id: string | number): void;
  /**
   * @template T
   * @param {Module} module the module
   * @param {RuntimeSpecMap<T>} hashes hashes data
   * @param {RuntimeSpec} runtime the runtime
   * @returns {T} hash
   */
  _getModuleHashInfo<T>(
    module: Module,
    hashes: RuntimeSpecMap<T>,
    runtime: RuntimeSpec,
  ): T;
  /**
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @returns {boolean} true, if the module has hashes for this runtime
   */
  hasModuleHashes(module: Module, runtime: RuntimeSpec): boolean;
  /**
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @returns {string} hash
   */
  getModuleHash(module: Module, runtime: RuntimeSpec): string;
  /**
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @returns {string} hash
   */
  getRenderedModuleHash(module: Module, runtime: RuntimeSpec): string;
  /**
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @param {string} hash the full hash
   * @param {string} renderedHash the shortened hash for rendering
   * @returns {void}
   */
  setModuleHashes(
    module: Module,
    runtime: RuntimeSpec,
    hash: string,
    renderedHash: string,
  ): void;
  /**
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @param {Set<string>} items runtime requirements to be added (ownership of this Set is given to ChunkGraph when transferOwnership not false)
   * @param {boolean} transferOwnership true: transfer ownership of the items object, false: items is immutable and shared and won't be modified
   * @returns {void}
   */
  addModuleRuntimeRequirements(
    module: Module,
    runtime: RuntimeSpec,
    items: Set<string>,
    transferOwnership?: boolean,
  ): void;
  /**
   * @param {Chunk} chunk the chunk
   * @param {Set<string>} items runtime requirements to be added (ownership of this Set is given to ChunkGraph)
   * @returns {void}
   */
  addChunkRuntimeRequirements(chunk: Chunk, items: Set<string>): void;
  /**
   * @param {Chunk} chunk the chunk
   * @param {Iterable<string>} items runtime requirements to be added
   * @returns {void}
   */
  addTreeRuntimeRequirements(chunk: Chunk, items: Iterable<string>): void;
  /**
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @returns {ReadonlySet<string>} runtime requirements
   */
  getModuleRuntimeRequirements(
    module: Module,
    runtime: RuntimeSpec,
  ): ReadonlySet<string>;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {ReadonlySet<string>} runtime requirements
   */
  getChunkRuntimeRequirements(chunk: Chunk): ReadonlySet<string>;
  /**
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @param {boolean} withConnections include connections
   * @returns {string} hash
   */
  getModuleGraphHash(
    module: Module,
    runtime: RuntimeSpec,
    withConnections?: boolean,
  ): string;
  /**
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @param {boolean} withConnections include connections
   * @returns {bigint} hash
   */
  getModuleGraphHashBigInt(
    module: Module,
    runtime: RuntimeSpec,
    withConnections?: boolean,
  ): bigint;
  /**
   * @param {ChunkGraphModule} cgm the ChunkGraphModule
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @returns {bigint} hash as big int
   */
  _getModuleGraphHashBigInt(
    cgm: ChunkGraphModule,
    module: Module,
    runtime: RuntimeSpec,
  ): bigint;
  /**
   * @param {ChunkGraphModule} cgm the ChunkGraphModule
   * @param {Module} module the module
   * @param {RuntimeSpec} runtime the runtime
   * @returns {string} hash
   */
  _getModuleGraphHashWithConnections(
    cgm: ChunkGraphModule,
    module: Module,
    runtime: RuntimeSpec,
  ): string;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {ReadonlySet<string>} runtime requirements
   */
  getTreeRuntimeRequirements(chunk: Chunk): ReadonlySet<string>;
}
declare namespace ChunkGraph {
  export {
    AsyncDependenciesBlock,
    Chunk,
    ChunkGroup,
    Module,
    ModuleGraph,
    RuntimeModule,
    Hash,
    RuntimeSpec,
    ChunkFilterPredicate,
    ModuleFilterPredicate,
    EntryModuleWithChunkGroup,
    ChunkSizeOptions,
    SetToArrayFunction,
  };
}
type ModuleGraph = import('./ModuleGraph');
import SortableSet = require('./util/SortableSet');
type Module = import('./Module');
type Chunk = import('./Chunk');
type RuntimeModule = import('./RuntimeModule');
type ChunkGroup = import('./ChunkGroup');
import { RuntimeSpecSet } from './util/runtime';
type ModuleFilterPredicate = (m: Module) => boolean;
type ChunkFilterPredicate = (c: Chunk, chunkGraph: ChunkGraph) => boolean;
type ChunkSizeOptions = {
  /**
   * constant overhead for a chunk
   */
  chunkOverhead?: number | undefined;
  /**
   * multiplicator for initial chunks
   */
  entryChunkMultiplicator?: number | undefined;
};
import Entrypoint = require('./Entrypoint');
type EntryModuleWithChunkGroup = [Module, Entrypoint | undefined];
type AsyncDependenciesBlock = import('./AsyncDependenciesBlock');
import { RuntimeSpecMap } from './util/runtime';
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
declare class ChunkGraphModule {
  /** @type {SortableSet<Chunk>} */
  chunks: SortableSet<Chunk>;
  /** @type {Set<Chunk> | undefined} */
  entryInChunks: Set<Chunk> | undefined;
  /** @type {Set<Chunk> | undefined} */
  runtimeInChunks: Set<Chunk> | undefined;
  /** @type {RuntimeSpecMap<ModuleHashInfo> | undefined} */
  hashes: RuntimeSpecMap<ModuleHashInfo> | undefined;
  /** @type {string | number} */
  id: string | number;
  /** @type {RuntimeSpecMap<Set<string>> | undefined} */
  runtimeRequirements: RuntimeSpecMap<Set<string>> | undefined;
  /** @type {RuntimeSpecMap<string>} */
  graphHashes: RuntimeSpecMap<string>;
  /** @type {RuntimeSpecMap<string>} */
  graphHashesWithConnections: RuntimeSpecMap<string>;
}
type Hash = typeof import('./util/Hash');
/**
 * <T>
 */
type SetToArrayFunction<T> = (set: SortableSet<T>) => T[];
/** @typedef {(c: Chunk, chunkGraph: ChunkGraph) => boolean} ChunkFilterPredicate */
/** @typedef {(m: Module) => boolean} ModuleFilterPredicate */
/** @typedef {[Module, Entrypoint | undefined]} EntryModuleWithChunkGroup */
/**
 * @typedef {Object} ChunkSizeOptions
 * @property {number=} chunkOverhead constant overhead for a chunk
 * @property {number=} entryChunkMultiplicator multiplicator for initial chunks
 */
declare class ModuleHashInfo {
  constructor(hash: any, renderedHash: any);
  hash: any;
  renderedHash: any;
}
