export = ChunkGraph;
/** @typedef {string | number} RuntimeId */
/** @typedef {Record<ModuleId, string>} IdToHashMap */
/** @typedef {Record<ChunkId, IdToHashMap>} ChunkModuleHashMap */
/** @typedef {Record<ChunkId, ModuleId[]>} ChunkModuleIdMap */
/** @typedef {Record<ChunkId, boolean>} ChunkConditionMap */
/** @typedef {(a: Module, b: Module) => -1 | 0 | 1} ModuleComparator */
declare class ChunkGraph {
    /**
     * Records that a chunk contains a module, growing what the record holds from
     * nothing to the one chunk to a set.
     * @param {ChunkGraphModule} cgm the module's chunk graph record
     * @param {Chunk} chunk the chunk containing it
     * @returns {void}
     */
    static _addModuleChunk(cgm: ChunkGraphModule, chunk: Chunk): void;
    /**
     * Records that a chunk no longer contains a module. A set is not shrunk back
     * to an array, so a module that was in two chunks keeps the set.
     * @param {ChunkGraphModule} cgm the module's chunk graph record
     * @param {Chunk} chunk the chunk that no longer contains it
     * @returns {void}
     */
    static _removeModuleChunk(cgm: ChunkGraphModule, chunk: Chunk): void;
    /**
     * Gets chunk graph for module.
     * @deprecated
     * @param {Module} module the module
     * @param {string} deprecateMessage message for the deprecation message
     * @param {string} deprecationCode code for the deprecation
     * @returns {ChunkGraph} the chunk graph
     */
    static getChunkGraphForModule(module: Module, deprecateMessage: string, deprecationCode: string): ChunkGraph;
    /**
     * Sets chunk graph for module.
     * @deprecated
     * @param {Module} module the module
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {void}
     */
    static setChunkGraphForModule(module: Module, chunkGraph: ChunkGraph): void;
    /**
     * Clear chunk graph for module.
     * @deprecated
     * @param {Module} module the module
     * @returns {void}
     */
    static clearChunkGraphForModule(module: Module): void;
    /**
     * Gets chunk graph for chunk.
     * @deprecated
     * @param {Chunk} chunk the chunk
     * @param {string} deprecateMessage message for the deprecation message
     * @param {string} deprecationCode code for the deprecation
     * @returns {ChunkGraph} the chunk graph
     */
    static getChunkGraphForChunk(chunk: Chunk, deprecateMessage: string, deprecationCode: string): ChunkGraph;
    /**
     * Sets chunk graph for chunk.
     * @deprecated
     * @param {Chunk} chunk the chunk
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {void}
     */
    static setChunkGraphForChunk(chunk: Chunk, chunkGraph: ChunkGraph): void;
    /**
     * Clear chunk graph for chunk.
     * @deprecated
     * @param {Chunk} chunk the chunk
     * @returns {void}
     */
    static clearChunkGraphForChunk(chunk: Chunk): void;
    /**
     * Creates an instance of ChunkGraph.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {HashFunction} hashFunction the hash function to use
     */
    constructor(moduleGraph: ModuleGraph, hashFunction?: HashFunction);
    /**
     * @private
     * @type {WeakMap<Module, ChunkGraphModule>}
     */
    private _modules;
    /**
     * @private
     * @type {WeakMap<Chunk, ChunkGraphChunk>}
     */
    private _chunks;
    /**
     * @private
     * @type {WeakMap<AsyncDependenciesBlock, ChunkGroup>}
     */
    private _blockChunkGroups;
    /**
     * @private
     * @type {Map<string, RuntimeId>}
     */
    private _runtimeIds;
    /**
     * Module runtime requirement Sets stored without copying (ownership not
     * transferred). They must be copied before being mutated.
     * @private
     * @type {WeakSet<RuntimeRequirements>}
     */
    private _sharedModuleRuntimeRequirements;
    /** @type {ModuleGraph} */
    moduleGraph: ModuleGraph;
    /** @type {boolean} */
    buildTimeExecution: boolean;
    /** @type {HashFunction} */
    _hashFunction: HashFunction;
    /** @type {boolean} */
    _hasOverwrittenSourceTypes: boolean;
    /**
     * Returns the graph roots.
     * @param {SortableSet<Module>} set the sortable Set to get the roots of
     * @returns {Module[]} the graph roots
     */
    _getGraphRoots(set: SortableSet<Module>): Module[];
    /**
     * Get chunk graph module.
     * @private
     * @param {Module} module the module
     * @returns {ChunkGraphModule} internal module
     */
    private _getChunkGraphModule;
    /**
     * Get chunk graph chunk.
     * @private
     * @param {Chunk} chunk the chunk
     * @returns {ChunkGraphChunk} internal chunk
     */
    private _getChunkGraphChunk;
    /**
     * Connects chunk and module.
     * @param {Chunk} chunk the new chunk
     * @param {Module} module the module
     * @returns {void}
     */
    connectChunkAndModule(chunk: Chunk, module: Module): void;
    /**
     * Disconnects chunk and module.
     * @param {Chunk} chunk the chunk
     * @param {Module} module the module
     * @returns {void}
     */
    disconnectChunkAndModule(chunk: Chunk, module: Module): void;
    /**
     * Processes the provided chunk.
     * @param {Chunk} chunk the chunk which will be disconnected
     * @returns {void}
     */
    disconnectChunk(chunk: Chunk): void;
    /**
     * Processes the provided chunk.
     * @param {Chunk} chunk the chunk
     * @param {Iterable<Module>} modules the modules
     * @returns {void}
     */
    attachModules(chunk: Chunk, modules: Iterable<Module>): void;
    /**
     * Attach runtime modules.
     * @param {Chunk} chunk the chunk
     * @param {Iterable<RuntimeModule>} modules the runtime modules
     * @returns {void}
     */
    attachRuntimeModules(chunk: Chunk, modules: Iterable<RuntimeModule>): void;
    /**
     * Attach full hash modules.
     * @param {Chunk} chunk the chunk
     * @param {Iterable<RuntimeModule>} modules the modules that require a full hash
     * @returns {void}
     */
    attachFullHashModules(chunk: Chunk, modules: Iterable<RuntimeModule>): void;
    /**
     * Attach dependent hash modules.
     * @param {Chunk} chunk the chunk
     * @param {Iterable<RuntimeModule>} modules the modules that require a full hash
     * @returns {void}
     */
    attachDependentHashModules(chunk: Chunk, modules: Iterable<RuntimeModule>): void;
    /**
     * Processes the provided old module.
     * @param {Module} oldModule the replaced module
     * @param {Module} newModule the replacing module
     * @returns {void}
     */
    replaceModule(oldModule: Module, newModule: Module): void;
    /**
     * Checks whether this chunk graph is module in chunk.
     * @param {Module} module the checked module
     * @param {Chunk} chunk the checked chunk
     * @returns {boolean} true, if the chunk contains the module
     */
    isModuleInChunk(module: Module, chunk: Chunk): boolean;
    /**
     * Checks whether this chunk graph is module in chunk group.
     * @param {Module} module the checked module
     * @param {ChunkGroup} chunkGroup the checked chunk group
     * @returns {boolean} true, if the chunk contains the module
     */
    isModuleInChunkGroup(module: Module, chunkGroup: ChunkGroup): boolean;
    /**
     * Checks whether this chunk graph is entry module.
     * @param {Module} module the checked module
     * @returns {boolean} true, if the module is entry of any chunk
     */
    isEntryModule(module: Module): boolean;
    /**
     * Gets module chunks iterable.
     * @param {Module} module the module
     * @returns {Iterable<Chunk>} iterable of chunks (do not modify)
     */
    getModuleChunksIterable(module: Module): Iterable<Chunk>;
    /**
     * Gets ordered module chunks iterable.
     * @param {Module} module the module
     * @param {(a: Chunk, b: Chunk) => -1 | 0 | 1} sortFn sort function
     * @returns {Iterable<Chunk>} iterable of chunks (do not modify)
     */
    getOrderedModuleChunksIterable(module: Module, sortFn: (a: Chunk, b: Chunk) => -1 | 0 | 1): Iterable<Chunk>;
    /**
     * Gets module chunks.
     * @param {Module} module the module
     * @returns {Chunk[]} array of chunks (cached, do not modify)
     */
    getModuleChunks(module: Module): Chunk[];
    /**
     * Gets number of module chunks.
     * @param {Module} module the module
     * @returns {number} the number of chunk which contain the module
     */
    getNumberOfModuleChunks(module: Module): number;
    /**
     * Gets module runtimes.
     * @param {Module} module the module
     * @returns {RuntimeSpecSet} runtimes
     */
    getModuleRuntimes(module: Module): RuntimeSpecSet;
    /**
     * Gets number of chunk modules.
     * @param {Chunk} chunk the chunk
     * @returns {number} the number of modules which are contained in this chunk
     */
    getNumberOfChunkModules(chunk: Chunk): number;
    /**
     * Gets number of chunk full hash modules.
     * @param {Chunk} chunk the chunk
     * @returns {number} the number of full hash modules which are contained in this chunk
     */
    getNumberOfChunkFullHashModules(chunk: Chunk): number;
    /**
     * Gets chunk modules iterable.
     * @param {Chunk} chunk the chunk
     * @returns {Iterable<Module>} return the modules for this chunk
     */
    getChunkModulesIterable(chunk: Chunk): Iterable<Module>;
    /**
     * Gets chunk modules iterable by source type.
     * @param {Chunk} chunk the chunk
     * @param {string} sourceType source type
     * @returns {Iterable<Module> | undefined} return the modules for this chunk
     */
    getChunkModulesIterableBySourceType(chunk: Chunk, sourceType: string): Iterable<Module> | undefined;
    /**
     * Sets chunk module source types.
     * @param {Chunk} chunk chunk
     * @param {Module} module chunk module
     * @param {SourceTypes} sourceTypes source types
     */
    setChunkModuleSourceTypes(chunk: Chunk, module: Module, sourceTypes: Module.SourceTypes): void;
    /**
     * Gets chunk module source types.
     * @param {Chunk} chunk chunk
     * @param {Module} module chunk module
     * @returns {SourceTypes} source types
     */
    getChunkModuleSourceTypes(chunk: Chunk, module: Module): Module.SourceTypes;
    /**
     * Gets module source types.
     * @param {Module} module module
     * @returns {SourceTypes} source types
     */
    getModuleSourceTypes(module: Module): Module.SourceTypes;
    /**
     * Get overwritten module source types.
     * @param {Module} module module
     * @returns {SourceTypes | undefined} source types
     */
    _getOverwrittenModuleSourceTypes(module: Module): Module.SourceTypes | undefined;
    /**
     * Gets ordered chunk modules iterable.
     * @param {Chunk} chunk the chunk
     * @param {ModuleComparator} comparator comparator function
     * @returns {Iterable<Module>} return the modules for this chunk
     */
    getOrderedChunkModulesIterable(chunk: Chunk, comparator: ModuleComparator): Iterable<Module>;
    /**
     * Gets ordered chunk modules iterable by source type.
     * @param {Chunk} chunk the chunk
     * @param {string} sourceType source type
     * @param {ModuleComparator} comparator comparator function
     * @returns {Iterable<Module> | undefined} return the modules for this chunk
     */
    getOrderedChunkModulesIterableBySourceType(chunk: Chunk, sourceType: string, comparator: ModuleComparator): Iterable<Module> | undefined;
    /**
     * Gets chunk modules.
     * @param {Chunk} chunk the chunk
     * @returns {Module[]} return the modules for this chunk (cached, do not modify)
     */
    getChunkModules(chunk: Chunk): Module[];
    /**
     * Gets ordered chunk modules.
     * @param {Chunk} chunk the chunk
     * @param {ModuleComparator} comparator comparator function
     * @returns {Module[]} return the modules for this chunk (cached, do not modify)
     */
    getOrderedChunkModules(chunk: Chunk, comparator: ModuleComparator): Module[];
    /**
     * Gets chunk module id map.
     * @param {Chunk} chunk the chunk
     * @param {ModuleFilterPredicate} filterFn function used to filter modules
     * @param {boolean} includeAllChunks all chunks or only async chunks
     * @returns {ChunkModuleIdMap} chunk to module ids object
     */
    getChunkModuleIdMap(chunk: Chunk, filterFn: ModuleFilterPredicate, includeAllChunks?: boolean): ChunkModuleIdMap;
    /**
     * Gets chunk module rendered hash map.
     * @param {Chunk} chunk the chunk
     * @param {ModuleFilterPredicate} filterFn function used to filter modules
     * @param {number} hashLength length of the hash
     * @param {boolean} includeAllChunks all chunks or only async chunks
     * @returns {ChunkModuleHashMap} chunk to module id to module hash object
     */
    getChunkModuleRenderedHashMap(chunk: Chunk, filterFn: ModuleFilterPredicate, hashLength?: number, includeAllChunks?: boolean): ChunkModuleHashMap;
    /**
     * Gets chunk condition map.
     * @param {Chunk} chunk the chunk
     * @param {ChunkFilterPredicate} filterFn function used to filter chunks
     * @returns {ChunkConditionMap} chunk condition map
     */
    getChunkConditionMap(chunk: Chunk, filterFn: ChunkFilterPredicate): ChunkConditionMap;
    /**
     * Checks whether this chunk graph contains the chunk.
     * @param {Chunk} chunk the chunk
     * @param {ModuleFilterPredicate} filterFn predicate function used to filter modules
     * @param {ChunkFilterPredicate=} filterChunkFn predicate function used to filter chunks
     * @returns {boolean} return true if module exists in graph
     */
    hasModuleInGraph(chunk: Chunk, filterFn: ModuleFilterPredicate, filterChunkFn?: ChunkFilterPredicate | undefined): boolean;
    /**
     * Compares the provided values and returns their ordering.
     * @param {Chunk} chunkA first chunk
     * @param {Chunk} chunkB second chunk
     * @returns {-1 | 0 | 1} this is a comparator function like sort and returns -1, 0, or 1 based on sort order
     */
    compareChunks(chunkA: Chunk, chunkB: Chunk): -1 | 0 | 1;
    /**
     * Gets chunk modules size.
     * @param {Chunk} chunk the chunk
     * @returns {number} total size of all modules in the chunk
     */
    getChunkModulesSize(chunk: Chunk): number;
    /**
     * Gets chunk modules sizes.
     * @param {Chunk} chunk the chunk
     * @returns {Record<string, number>} total sizes of all modules in the chunk by source type
     */
    getChunkModulesSizes(chunk: Chunk): Record<string, number>;
    /**
     * Gets chunk root modules.
     * @param {Chunk} chunk the chunk
     * @returns {Module[]} root modules of the chunks (ordered by identifier)
     */
    getChunkRootModules(chunk: Chunk): Module[];
    /**
     * Returns total size of the chunk.
     * @param {Chunk} chunk the chunk
     * @param {ChunkSizeOptions} options options object
     * @returns {number} total size of the chunk
     */
    getChunkSize(chunk: Chunk, options?: ChunkSizeOptions): number;
    /**
     * Gets integrated chunks size.
     * @param {Chunk} chunkA chunk
     * @param {Chunk} chunkB chunk
     * @param {ChunkSizeOptions} options options object
     * @returns {number} total size of the chunk or false if chunks can't be integrated
     */
    getIntegratedChunksSize(chunkA: Chunk, chunkB: Chunk, options?: ChunkSizeOptions): number;
    /**
     * Checks whether it can chunks be integrated.
     * @param {Chunk} chunkA chunk
     * @param {Chunk} chunkB chunk
     * @returns {boolean} true, if chunks could be integrated
     */
    canChunksBeIntegrated(chunkA: Chunk, chunkB: Chunk): boolean;
    /**
     * Processes the provided chunk a.
     * @param {Chunk} chunkA the target chunk
     * @param {Chunk} chunkB the chunk to integrate
     * @returns {void}
     */
    integrateChunks(chunkA: Chunk, chunkB: Chunk): void;
    /**
     * Upgrade dependent to full hash modules.
     * @param {Chunk} chunk the chunk to upgrade
     * @returns {void}
     */
    upgradeDependentToFullHashModules(chunk: Chunk): void;
    /**
     * Checks whether this chunk graph is entry module in chunk.
     * @param {Module} module the checked module
     * @param {Chunk} chunk the checked chunk
     * @returns {boolean} true, if the chunk contains the module as entry
     */
    isEntryModuleInChunk(module: Module, chunk: Chunk): boolean;
    /**
     * Connects chunk and entry module.
     * @param {Chunk} chunk the new chunk
     * @param {Module} module the entry module
     * @param {Entrypoint} entrypoint the chunk group which must be loaded before the module is executed
     * @returns {void}
     */
    connectChunkAndEntryModule(chunk: Chunk, module: Module, entrypoint: Entrypoint): void;
    /**
     * Connects chunk and runtime module.
     * @param {Chunk} chunk the new chunk
     * @param {RuntimeModule} module the runtime module
     * @returns {void}
     */
    connectChunkAndRuntimeModule(chunk: Chunk, module: RuntimeModule): void;
    /**
     * Adds full hash module to chunk.
     * @param {Chunk} chunk the new chunk
     * @param {RuntimeModule} module the module that require a full hash
     * @returns {void}
     */
    addFullHashModuleToChunk(chunk: Chunk, module: RuntimeModule): void;
    /**
     * Adds dependent hash module to chunk.
     * @param {Chunk} chunk the new chunk
     * @param {RuntimeModule} module the module that require a full hash
     * @returns {void}
     */
    addDependentHashModuleToChunk(chunk: Chunk, module: RuntimeModule): void;
    /**
     * Disconnects chunk and entry module.
     * @param {Chunk} chunk the new chunk
     * @param {Module} module the entry module
     * @returns {void}
     */
    disconnectChunkAndEntryModule(chunk: Chunk, module: Module): void;
    /**
     * Disconnects chunk and runtime module.
     * @param {Chunk} chunk the new chunk
     * @param {RuntimeModule} module the runtime module
     * @returns {void}
     */
    disconnectChunkAndRuntimeModule(chunk: Chunk, module: RuntimeModule): void;
    /**
     * Disconnects entry module.
     * @param {Module} module the entry module, it will no longer be entry
     * @returns {void}
     */
    disconnectEntryModule(module: Module): void;
    /**
     * Disconnects entries.
     * @param {Chunk} chunk the chunk, for which all entries will be removed
     * @returns {void}
     */
    disconnectEntries(chunk: Chunk): void;
    /**
     * Gets number of entry modules.
     * @param {Chunk} chunk the chunk
     * @returns {number} the amount of entry modules in chunk
     */
    getNumberOfEntryModules(chunk: Chunk): number;
    /**
     * Gets number of runtime modules.
     * @param {Chunk} chunk the chunk
     * @returns {number} the amount of entry modules in chunk
     */
    getNumberOfRuntimeModules(chunk: Chunk): number;
    /**
     * Gets chunk entry modules iterable.
     * @param {Chunk} chunk the chunk
     * @returns {Iterable<Module>} iterable of modules (do not modify)
     */
    getChunkEntryModulesIterable(chunk: Chunk): Iterable<Module>;
    /**
     * Gets chunk entry dependent chunks iterable.
     * @param {Chunk} chunk the chunk
     * @returns {Iterable<Chunk>} iterable of chunks
     */
    getChunkEntryDependentChunksIterable(chunk: Chunk): Iterable<Chunk>;
    /**
     * Gets runtime chunk dependent chunks iterable.
     * @param {Chunk} chunk the chunk
     * @returns {Iterable<Chunk>} iterable of chunks and include chunks from children entrypoints
     */
    getRuntimeChunkDependentChunksIterable(chunk: Chunk): Iterable<Chunk>;
    /**
     * Checks whether this chunk graph contains the chunk.
     * @param {Chunk} chunk the chunk
     * @returns {boolean} true, when it has dependent chunks
     */
    hasChunkEntryDependentChunks(chunk: Chunk): boolean;
    /**
     * Gets chunk runtime modules iterable.
     * @param {Chunk} chunk the chunk
     * @returns {Iterable<RuntimeModule>} iterable of modules (do not modify)
     */
    getChunkRuntimeModulesIterable(chunk: Chunk): Iterable<RuntimeModule>;
    /**
     * Gets chunk runtime modules in order.
     * @param {Chunk} chunk the chunk
     * @returns {RuntimeModule[]} array of modules in order of execution
     */
    getChunkRuntimeModulesInOrder(chunk: Chunk): RuntimeModule[];
    /**
     * Gets chunk full hash modules iterable.
     * @param {Chunk} chunk the chunk
     * @returns {Iterable<RuntimeModule> | undefined} iterable of modules (do not modify)
     */
    getChunkFullHashModulesIterable(chunk: Chunk): Iterable<RuntimeModule> | undefined;
    /**
     * Gets chunk full hash modules set.
     * @param {Chunk} chunk the chunk
     * @returns {ReadonlySet<RuntimeModule> | undefined} set of modules (do not modify)
     */
    getChunkFullHashModulesSet(chunk: Chunk): ReadonlySet<RuntimeModule> | undefined;
    /**
     * Gets chunk dependent hash modules iterable.
     * @param {Chunk} chunk the chunk
     * @returns {Iterable<RuntimeModule> | undefined} iterable of modules (do not modify)
     */
    getChunkDependentHashModulesIterable(chunk: Chunk): Iterable<RuntimeModule> | undefined;
    /**
     * Gets chunk entry modules with chunk group iterable.
     * @param {Chunk} chunk the chunk
     * @returns {Iterable<EntryModuleWithChunkGroup>} iterable of modules (do not modify)
     */
    getChunkEntryModulesWithChunkGroupIterable(chunk: Chunk): Iterable<EntryModuleWithChunkGroup>;
    /**
     * Gets block chunk group.
     * @param {AsyncDependenciesBlock} depBlock the async block
     * @returns {ChunkGroup | undefined} the chunk group
     */
    getBlockChunkGroup(depBlock: AsyncDependenciesBlock): ChunkGroup | undefined;
    /**
     * Connects block and chunk group.
     * @param {AsyncDependenciesBlock} depBlock the async block
     * @param {ChunkGroup} chunkGroup the chunk group
     * @returns {void}
     */
    connectBlockAndChunkGroup(depBlock: AsyncDependenciesBlock, chunkGroup: ChunkGroup): void;
    /**
     * Disconnects chunk group.
     * @param {ChunkGroup} chunkGroup the chunk group
     * @returns {void}
     */
    disconnectChunkGroup(chunkGroup: ChunkGroup): void;
    /**
     * Returns the id of the module.
     * @param {Module} module the module
     * @returns {ModuleId | null} the id of the module
     */
    getModuleId(module: Module): ModuleId | null;
    /**
     * Updates module id using the provided module.
     * @param {Module} module the module
     * @param {ModuleId} id the id of the module
     * @returns {void}
     */
    setModuleId(module: Module, id: ModuleId): void;
    /**
     * Returns the id of the runtime.
     * @param {string} runtime runtime
     * @returns {RuntimeId} the id of the runtime
     */
    getRuntimeId(runtime: string): RuntimeId;
    /**
     * Updates runtime id using the provided runtime.
     * @param {string} runtime runtime
     * @param {RuntimeId} id the id of the runtime
     * @returns {void}
     */
    setRuntimeId(runtime: string, id: RuntimeId): void;
    /**
     * Get module hash info.
     * @template T
     * @param {Module} module the module
     * @param {RuntimeSpecMap<T>} hashes hashes data
     * @param {RuntimeSpec} runtime the runtime
     * @returns {T} hash
     */
    _getModuleHashInfo<T_1>(module: Module, hashes: RuntimeSpecMap<T_1>, runtime: RuntimeSpec): T_1;
    /**
     * Checks whether this chunk graph contains the module.
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @returns {boolean} true, if the module has hashes for this runtime
     */
    hasModuleHashes(module: Module, runtime: RuntimeSpec): boolean;
    /**
     * Returns hash.
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @returns {string} hash
     */
    getModuleHash(module: Module, runtime: RuntimeSpec): string;
    /**
     * Gets rendered module hash.
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @returns {string} hash
     */
    getRenderedModuleHash(module: Module, runtime: RuntimeSpec): string;
    /**
     * Sets module hashes.
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @param {string} hash the full hash
     * @param {string} renderedHash the shortened hash for rendering
     * @returns {void}
     */
    setModuleHashes(module: Module, runtime: RuntimeSpec, hash: string, renderedHash: string): void;
    /**
     * Adds module runtime requirements.
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @param {RuntimeRequirements} items runtime requirements to be added (ownership of this Set is given to ChunkGraph when transferOwnership not false)
     * @param {boolean} transferOwnership true: transfer ownership of the items object, false: items is immutable and shared and won't be modified
     * @returns {void}
     */
    addModuleRuntimeRequirements(module: Module, runtime: RuntimeSpec, items: Module.RuntimeRequirements, transferOwnership?: boolean): void;
    /**
     * Adds chunk runtime requirements.
     * @param {Chunk} chunk the chunk
     * @param {RuntimeRequirements} items runtime requirements to be added (ownership of this Set is given to ChunkGraph)
     * @returns {void}
     */
    addChunkRuntimeRequirements(chunk: Chunk, items: Module.RuntimeRequirements): void;
    /**
     * Adds tree runtime requirements.
     * @param {Chunk} chunk the chunk
     * @param {Iterable<string>} items runtime requirements to be added
     * @returns {void}
     */
    addTreeRuntimeRequirements(chunk: Chunk, items: Iterable<string>): void;
    /**
     * Gets module runtime requirements.
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @returns {ReadOnlyRuntimeRequirements} runtime requirements
     */
    getModuleRuntimeRequirements(module: Module, runtime: RuntimeSpec): Module.ReadOnlyRuntimeRequirements;
    /**
     * Gets chunk runtime requirements.
     * @param {Chunk} chunk the chunk
     * @returns {ReadOnlyRuntimeRequirements} runtime requirements
     */
    getChunkRuntimeRequirements(chunk: Chunk): Module.ReadOnlyRuntimeRequirements;
    /**
     * Gets module graph hash.
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @param {boolean} withConnections include connections
     * @returns {string} hash
     */
    getModuleGraphHash(module: Module, runtime: RuntimeSpec, withConnections?: boolean): string;
    /**
     * Gets module graph hash big int.
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @param {boolean} withConnections include connections
     * @returns {bigint} hash
     */
    getModuleGraphHashBigInt(module: Module, runtime: RuntimeSpec, withConnections?: boolean): bigint;
    /**
     * Get module graph hash big int.
     * @param {ChunkGraphModule} cgm the ChunkGraphModule
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @returns {bigint} hash as big int
     */
    _getModuleGraphHashBigInt(cgm: ChunkGraphModule, module: Module, runtime: RuntimeSpec): bigint;
    /**
     * Get module graph hash with connections.
     * @param {ChunkGraphModule} cgm the ChunkGraphModule
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @returns {string} hash
     */
    _getModuleGraphHashWithConnections(cgm: ChunkGraphModule, module: Module, runtime: RuntimeSpec): string;
    /**
     * Gets tree runtime requirements.
     * @param {Chunk} chunk the chunk
     * @returns {ReadOnlyRuntimeRequirements} runtime requirements
     */
    getTreeRuntimeRequirements(chunk: Chunk): Module.ReadOnlyRuntimeRequirements;
}
declare namespace ChunkGraph {
    export { ChunkFilterPredicate, ModuleFilterPredicate, EntryModuleWithChunkGroup, ChunkSizeOptions, ModulesBySourceType, ModuleSetToArrayFunction, SizesOfModules, SortableChunks, EntryInChunks, RuntimeInChunks, ModuleId, ChunkGraphRuntimeRequirements, SourceTypesByModule, EntryModules, RuntimeId, IdToHashMap, ChunkModuleHashMap, ChunkModuleIdMap, ChunkConditionMap, ModuleComparator };
}
import type ModuleGraph from "./ModuleGraph";
import type { HashFunction } from "../util/Hash";
import SortableSet = require("../util/SortableSet");
import type Module from "../module/Module";
import type Chunk from "./Chunk";
import type RuntimeModule from "../runtime/RuntimeModule";
import type ChunkGroup from "./ChunkGroup";
import { RuntimeSpecSet } from "../util/runtime";
import type Entrypoint from "./Entrypoint";
import type AsyncDependenciesBlock from "./AsyncDependenciesBlock";
import { RuntimeSpecMap } from "../util/runtime";
import type { RuntimeSpec } from "../util/runtime";
/** @typedef {SortableSet<Chunk>} SortableChunks */
/** @typedef {Set<Chunk>} EntryInChunks */
/** @typedef {Set<Chunk>} RuntimeInChunks */
/** @typedef {string | number} ModuleId */
/** @typedef {RuntimeSpecMap<Set<string>, RuntimeRequirements>} ChunkGraphRuntimeRequirements */
declare class ChunkGraphModule {
    /** @type {SortableChunks | readonly Chunk[] | undefined} */
    chunks: SortableChunks | readonly Chunk[] | undefined;
    /** @type {RuntimeSpecSet | undefined} */
    runtimes: RuntimeSpecSet | undefined;
    /** @type {EntryInChunks | undefined} */
    entryInChunks: EntryInChunks | undefined;
    /** @type {RuntimeInChunks | undefined} */
    runtimeInChunks: RuntimeInChunks | undefined;
    /** @type {RuntimeSpecMap<ModuleHashInfo> | undefined} */
    hashes: RuntimeSpecMap<ModuleHashInfo> | undefined;
    /** @type {ModuleId | null} */
    id: ModuleId | null;
    /** @type {ChunkGraphRuntimeRequirements | undefined} */
    runtimeRequirements: ChunkGraphRuntimeRequirements | undefined;
    /** @type {RuntimeSpecMap<string, bigint> | undefined} */
    graphHashes: RuntimeSpecMap<string, bigint> | undefined;
    /** @type {RuntimeSpecMap<string, string> | undefined} */
    graphHashesWithConnections: RuntimeSpecMap<string, string> | undefined;
}
type ChunkFilterPredicate = (c: Chunk, chunkGraph: ChunkGraph) => boolean;
type ModuleFilterPredicate = (m: Module) => boolean;
type EntryModuleWithChunkGroup = [Module, Entrypoint | undefined];
/**
 * Represents the module hash info runtime component.
 */
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
type ModulesBySourceType = (set: SortableSet<Module>) => Map<string, SortableSet<Module>>;
/**
 * Defines the module set to array function type used by this module.
 */
type ModuleSetToArrayFunction = (set: SortableSet<Module>) => Module[];
type SizesOfModules = Record<string, number>;
type SortableChunks = SortableSet<Chunk>;
type EntryInChunks = Set<Chunk>;
type RuntimeInChunks = Set<Chunk>;
type ModuleId = string | number;
type ChunkGraphRuntimeRequirements = RuntimeSpecMap<Set<string>, Module.RuntimeRequirements>;
type SourceTypesByModule = WeakMap<Module, Module.SourceTypes>;
type EntryModules = Map<Module, Entrypoint>;
type RuntimeId = string | number;
type IdToHashMap = Record<ModuleId, string>;
type ChunkModuleHashMap = Record<Chunk.ChunkId, IdToHashMap>;
type ChunkModuleIdMap = Record<Chunk.ChunkId, ModuleId[]>;
type ChunkConditionMap = Record<Chunk.ChunkId, boolean>;
type ModuleComparator = (a: Module, b: Module) => -1 | 0 | 1;
/** @typedef {(c: Chunk, chunkGraph: ChunkGraph) => boolean} ChunkFilterPredicate */
/** @typedef {(m: Module) => boolean} ModuleFilterPredicate */
/** @typedef {[Module, Entrypoint | undefined]} EntryModuleWithChunkGroup */
/**
 * Represents the module hash info runtime component.
 * @typedef {object} ChunkSizeOptions
 * @property {number=} chunkOverhead constant overhead for a chunk
 * @property {number=} entryChunkMultiplicator multiplicator for initial chunks
 */
declare class ModuleHashInfo {
    /**
     * Creates an instance of ModuleHashInfo.
     * @param {string} hash hash
     * @param {string} renderedHash rendered hash
     */
    constructor(hash: string, renderedHash: string);
    /** @type {string} */
    hash: string;
    /** @type {string} */
    renderedHash: string;
}
