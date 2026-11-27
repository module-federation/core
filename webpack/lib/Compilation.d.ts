export = Compilation;
/** @typedef {{ id: ModuleId, modules?: Map<Module, string>, blocks?: (ChunkId | null)[], sourceTypes?: SourceTypes, chunkSourceTypes?: string }} References */
/** @typedef {Map<Module, WeakTupleMap<EXPECTED_ANY[], EXPECTED_ANY>>} ModuleMemCaches */
/**
 * A queued lazy runtime module; `create` takes exactly what its own `load`
 * resolves, which differs per entry.
 * @typedef {{ chunk: Chunk, load: () => Promise<EXPECTED_OBJECT>, create: (loaded: never) => RuntimeModule, chunkGraph: ChunkGraph }} PendingRuntimeModule
 */
declare class Compilation {
    /**
     * Creates an instance of Compilation.
     * @param {Compiler} compiler the compiler which created the compilation
     * @param {CompilationParams} params the compilation parameters
     */
    constructor(compiler: Compiler, params: Compiler.CompilationParams);
    /** @type {boolean} */
    _backCompat: boolean;
    hooks: Readonly<{
        /** @type {SyncHook<[Module]>} */
        buildModule: SyncHook<[Module]>;
        /** @type {SyncHook<[Module]>} */
        rebuildModule: SyncHook<[Module]>;
        /** @type {SyncHook<[Module, WebpackError]>} */
        failedModule: SyncHook<[Module, WebpackError]>;
        /** @type {SyncHook<[Module]>} */
        succeedModule: SyncHook<[Module]>;
        /** @type {SyncHook<[Module]>} */
        stillValidModule: SyncHook<[Module]>;
        /** @type {SyncHook<[Dependency, EntryOptions]>} */
        addEntry: SyncHook<[Dependency, EntryOptions]>;
        /** @type {SyncHook<[Dependency, EntryOptions, Error]>} */
        failedEntry: SyncHook<[Dependency, EntryOptions, Error]>;
        /** @type {SyncHook<[Dependency, EntryOptions, Module]>} */
        succeedEntry: SyncHook<[Dependency, EntryOptions, Module]>;
        /** @type {SyncWaterfallHook<[ReferencedExports, Dependency, RuntimeSpec]>} */
        dependencyReferencedExports: SyncWaterfallHook<[Dependency.ReferencedExports, Dependency, RuntimeSpec]>;
        /**
         * @type {SyncHook<[ExecuteModuleArgument, ExecuteModuleContext]>}
         * @since 5.32.0
         */
        executeModule: SyncHook<[ExecuteModuleArgument, ExecuteModuleContext]>;
        /**
         * @type {AsyncParallelHook<[ExecuteModuleArgument, ExecuteModuleContext]>}
         * @since 5.33.0
         */
        prepareModuleExecution: AsyncParallelHook<[ExecuteModuleArgument, ExecuteModuleContext]>;
        /** @type {AsyncSeriesHook<[Iterable<Module>]>} */
        finishModules: AsyncSeriesHook<[Iterable<Module>]>;
        /** @type {AsyncSeriesHook<[Module]>} */
        finishRebuildingModule: AsyncSeriesHook<[Module]>;
        /** @type {SyncHook<[]>} */
        unseal: SyncHook<[]>;
        /** @type {SyncHook<[]>} */
        seal: SyncHook<[]>;
        /** @type {SyncHook<[]>} */
        beforeChunks: SyncHook<[]>;
        /**
         * The `afterChunks` hook is called directly after the chunks and module graph have
         * been created and before the chunks and modules have been optimized. This hook is useful to
         * inspect, analyze, and/or modify the chunk graph.
         * @type {SyncHook<[Iterable<Chunk>]>}
         */
        afterChunks: SyncHook<[Iterable<Chunk>]>;
        /** @type {SyncBailHook<[Iterable<Module>], boolean | void>} */
        optimizeDependencies: SyncBailHook<[Iterable<Module>], boolean | void>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        afterOptimizeDependencies: SyncHook<[Iterable<Module>]>;
        /** @type {SyncHook<[]>} */
        optimize: SyncHook<[]>;
        /** @type {SyncBailHook<[Iterable<Module>], boolean | void>} */
        optimizeModules: SyncBailHook<[Iterable<Module>], boolean | void>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        afterOptimizeModules: SyncHook<[Iterable<Module>]>;
        /** @type {SyncBailHook<[Iterable<Chunk>, ChunkGroup[]], boolean | void>} */
        optimizeChunks: SyncBailHook<[Iterable<Chunk>, ChunkGroup[]], boolean | void>;
        /** @type {SyncHook<[Iterable<Chunk>, ChunkGroup[]]>} */
        afterOptimizeChunks: SyncHook<[Iterable<Chunk>, ChunkGroup[]]>;
        /** @type {AsyncSeriesHook<[Iterable<Chunk>, Iterable<Module>]>} */
        optimizeTree: AsyncSeriesHook<[Iterable<Chunk>, Iterable<Module>]>;
        /** @type {SyncHook<[Iterable<Chunk>, Iterable<Module>]>} */
        afterOptimizeTree: SyncHook<[Iterable<Chunk>, Iterable<Module>]>;
        /** @type {AsyncSeriesBailHook<[Iterable<Chunk>, Iterable<Module>], void>} */
        optimizeChunkModules: AsyncSeriesBailHook<[Iterable<Chunk>, Iterable<Module>], void>;
        /** @type {SyncHook<[Iterable<Chunk>, Iterable<Module>]>} */
        afterOptimizeChunkModules: SyncHook<[Iterable<Chunk>, Iterable<Module>]>;
        /** @type {SyncBailHook<[], boolean | void>} */
        shouldRecord: SyncBailHook<[], boolean | void>;
        /** @type {SyncHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext]>} */
        additionalChunkRuntimeRequirements: SyncHook<[Chunk, Module.RuntimeRequirements, RuntimeRequirementsContext]>;
        /** @type {HookMap<SyncBailHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext], void>>} */
        runtimeRequirementInChunk: HookMap<SyncBailHook<[Chunk, Module.RuntimeRequirements, RuntimeRequirementsContext], void>>;
        /** @type {SyncHook<[Module, RuntimeRequirements, RuntimeRequirementsContext]>} */
        additionalModuleRuntimeRequirements: SyncHook<[Module, Module.RuntimeRequirements, RuntimeRequirementsContext]>;
        /** @type {HookMap<SyncBailHook<[Module, RuntimeRequirements, RuntimeRequirementsContext], void>>} */
        runtimeRequirementInModule: HookMap<SyncBailHook<[Module, Module.RuntimeRequirements, RuntimeRequirementsContext], void>>;
        /** @type {SyncHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext]>} */
        additionalTreeRuntimeRequirements: SyncHook<[Chunk, Module.RuntimeRequirements, RuntimeRequirementsContext]>;
        /** @type {HookMap<SyncBailHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext], void>>} */
        runtimeRequirementInTree: HookMap<SyncBailHook<[Chunk, Module.RuntimeRequirements, RuntimeRequirementsContext], void>>;
        /** @type {SyncHook<[RuntimeModule, Chunk]>} */
        runtimeModule: SyncHook<[RuntimeModule, Chunk]>;
        /** @type {SyncHook<[Iterable<Module>, Records]>} */
        reviveModules: SyncHook<[Iterable<Module>, Compiler.Records]>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        beforeModuleIds: SyncHook<[Iterable<Module>]>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        moduleIds: SyncHook<[Iterable<Module>]>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        optimizeModuleIds: SyncHook<[Iterable<Module>]>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        afterOptimizeModuleIds: SyncHook<[Iterable<Module>]>;
        /** @type {SyncHook<[Iterable<Chunk>, Records]>} */
        reviveChunks: SyncHook<[Iterable<Chunk>, Compiler.Records]>;
        /** @type {SyncHook<[Iterable<Chunk>]>} */
        beforeChunkIds: SyncHook<[Iterable<Chunk>]>;
        /** @type {SyncHook<[Iterable<Chunk>]>} */
        chunkIds: SyncHook<[Iterable<Chunk>]>;
        /** @type {SyncHook<[Iterable<Chunk>]>} */
        optimizeChunkIds: SyncHook<[Iterable<Chunk>]>;
        /** @type {SyncHook<[Iterable<Chunk>]>} */
        afterOptimizeChunkIds: SyncHook<[Iterable<Chunk>]>;
        /** @type {SyncHook<[Iterable<Module>, Records]>} */
        recordModules: SyncHook<[Iterable<Module>, Compiler.Records]>;
        /** @type {SyncHook<[Iterable<Chunk>, Records]>} */
        recordChunks: SyncHook<[Iterable<Chunk>, Compiler.Records]>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        optimizeCodeGeneration: SyncHook<[Iterable<Module>]>;
        /** @type {SyncHook<[]>} */
        beforeModuleHash: SyncHook<[]>;
        /** @type {SyncHook<[]>} */
        afterModuleHash: SyncHook<[]>;
        /** @type {SyncHook<[]>} */
        beforeCodeGeneration: SyncHook<[]>;
        /** @type {SyncHook<[]>} */
        afterCodeGeneration: SyncHook<[]>;
        /** @type {SyncHook<[]>} */
        beforeRuntimeRequirements: SyncHook<[]>;
        /** @type {SyncHook<[]>} */
        afterRuntimeRequirements: SyncHook<[]>;
        /** @type {SyncHook<[]>} */
        beforeHash: SyncHook<[]>;
        /** @type {SyncHook<[Chunk]>} */
        contentHash: SyncHook<[Chunk]>;
        /** @type {SyncHook<[]>} */
        afterHash: SyncHook<[]>;
        /** @type {SyncHook<[Records]>} */
        recordHash: SyncHook<[Compiler.Records]>;
        /** @type {SyncHook<[Compilation, Records]>} */
        record: SyncHook<[Compilation, Compiler.Records]>;
        /** @type {SyncHook<[]>} */
        beforeModuleAssets: SyncHook<[]>;
        /** @type {SyncBailHook<[], boolean | void>} */
        shouldGenerateChunkAssets: SyncBailHook<[], boolean | void>;
        /** @type {SyncHook<[]>} */
        beforeChunkAssets: SyncHook<[]>;
        /** @deprecated */
        additionalChunkAssets: FakeHook<Pick<AsyncSeriesHook<[Chunks]>, "tap" | "tapAsync" | "tapPromise" | "name">>;
        /** @deprecated */
        additionalAssets: FakeHook<Pick<AsyncSeriesHook<[]>, "tap" | "tapAsync" | "tapPromise" | "name">>;
        /** @deprecated */
        optimizeChunkAssets: FakeHook<Pick<AsyncSeriesHook<[Chunks]>, "tap" | "tapAsync" | "tapPromise" | "name">>;
        /** @deprecated */
        afterOptimizeChunkAssets: FakeHook<Pick<AsyncSeriesHook<[Chunks]>, "tap" | "tapAsync" | "tapPromise" | "name">>;
        /** @deprecated */
        optimizeAssets: AsyncSeriesHook<[CompilationAssets], {
            additionalAssets?: boolean | ((assets: CompilationAssets) => void);
        }>;
        /** @deprecated */
        afterOptimizeAssets: SyncHook<[CompilationAssets], void, import("tapable").UnsetAdditionalOptions>;
        processAssets: AsyncSeriesHook<[CompilationAssets], {
            additionalAssets?: boolean | ((assets: CompilationAssets) => void);
        }>;
        afterProcessAssets: SyncHook<[CompilationAssets], void, import("tapable").UnsetAdditionalOptions>;
        /**
         * @type {AsyncSeriesHook<[CompilationAssets]>}
         * @since 5.8.0
         */
        processAdditionalAssets: AsyncSeriesHook<[CompilationAssets]>;
        /** @type {SyncBailHook<[], boolean | void>} */
        needAdditionalSeal: SyncBailHook<[], boolean | void>;
        /** @type {AsyncSeriesHook<[]>} */
        afterSeal: AsyncSeriesHook<[]>;
        /** @type {SyncWaterfallHook<[RenderManifestEntry[], RenderManifestOptions]>} */
        renderManifest: SyncWaterfallHook<[RenderManifestEntry[], RenderManifestOptions]>;
        /**
         * Called with source written in one language that a module emits inside
         * another — CSS or HTML reaching the bundle as a JavaScript string
         * literal today — before it is embedded; return the (possibly
         * transformed) source, e.g. a minified one. `info.type` says which
         * language it is, so one tap serves every pair; no asset carries this
         * source, so an asset-level minimizer cannot reach it.
         * @type {AsyncSeriesWaterfallHook<[Source, EmbeddedSourceInfo]>}
         * @since 5.110.0
         */
        renderEmbeddedSource: AsyncSeriesWaterfallHook<[Source, EmbeddedSourceInfo]>;
        /**
         * Called while hashing a module that embeds such a source. Module hashes
         * are taken before code generation, so a `renderEmbeddedSource` tap must
         * write whatever it varies on into the hash, or the codegen cache
         * replays output from before its options changed.
         * @type {SyncHook<[Module, Hash]>}
         * @since 5.110.0
         */
        embeddedSourceHash: SyncHook<[Module, Hash]>;
        /** @type {SyncHook<[Hash]>} */
        fullHash: SyncHook<[Hash]>;
        /** @type {SyncHook<[Chunk, Hash, ChunkHashContext]>} */
        chunkHash: SyncHook<[Chunk, Hash, ChunkHashContext]>;
        /** @type {SyncHook<[Module, string]>} */
        moduleAsset: SyncHook<[Module, string]>;
        /** @type {SyncHook<[Chunk, string]>} */
        chunkAsset: SyncHook<[Chunk, string]>;
        /** @type {SyncWaterfallHook<[string, PathData, AssetInfo | undefined]>} */
        assetPath: SyncWaterfallHook<[string, PathData, AssetInfo | undefined]>;
        /** @type {SyncBailHook<[], boolean | void>} */
        needAdditionalPass: SyncBailHook<[], boolean | void>;
        /** @type {SyncHook<[Compiler, string, number]>} */
        childCompiler: SyncHook<[Compiler, string, number]>;
        /** @type {SyncBailHook<[string, LogEntry], boolean | void>} */
        log: SyncBailHook<[string, LogEntry], boolean | void>;
        /** @type {SyncWaterfallHook<[Error[]]>} */
        processWarnings: SyncWaterfallHook<[Error[]]>;
        /** @type {SyncWaterfallHook<[Error[]]>} */
        processErrors: SyncWaterfallHook<[Error[]]>;
        /** @type {HookMap<SyncHook<[Partial<NormalizedStatsOptions>, CreateStatsOptionsContext]>>} */
        statsPreset: HookMap<SyncHook<[Partial<NormalizedStatsOptions>, CreateStatsOptionsContext]>>;
        /** @type {SyncHook<[Partial<NormalizedStatsOptions>, CreateStatsOptionsContext]>} */
        statsNormalize: SyncHook<[Partial<NormalizedStatsOptions>, CreateStatsOptionsContext]>;
        /** @type {SyncHook<[StatsFactory, NormalizedStatsOptions]>} */
        statsFactory: SyncHook<[StatsFactory, NormalizedStatsOptions]>;
        /** @type {SyncHook<[StatsPrinter, NormalizedStatsOptions]>} */
        statsPrinter: SyncHook<[StatsPrinter, NormalizedStatsOptions]>;
        /**
         * Gets normal module loader.
         * @deprecated
         * @returns {SyncHook<[AnyLoaderContext, NormalModule]>} normal module loader hook
         */
        readonly normalModuleLoader: SyncHook<[NormalModule.AnyLoaderContext, NormalModule]>;
    }>;
    /** @type {string=} */
    name: string | undefined;
    /** @type {number | undefined} */
    startTime: number | undefined;
    /** @type {number | undefined} */
    endTime: number | undefined;
    /** @type {Compiler} */
    compiler: Compiler;
    resolverFactory: import("./resolve/ResolverFactory");
    /** @type {InputFileSystem} */
    inputFileSystem: InputFileSystem;
    /** @type {FileSystemInfo} */
    fileSystemInfo: FileSystemInfo;
    /** @type {ValueCacheVersions} */
    valueCacheVersions: Module.ValueCacheVersions;
    /** @type {RequestShortener} */
    requestShortener: RequestShortener;
    /** @type {string} */
    compilerPath: string;
    logger: Logger;
    options: WebpackOptions;
    outputOptions: OutputOptionsWithDefaults;
    /** @type {boolean} */
    bail: boolean;
    /** @type {boolean} */
    profile: boolean;
    /** @type {CompilationParams} */
    params: Compiler.CompilationParams;
    /** @type {MainTemplate} */
    mainTemplate: MainTemplate;
    /** @type {ChunkTemplate} */
    chunkTemplate: ChunkTemplate;
    /** @type {RuntimeTemplate} */
    runtimeTemplate: RuntimeTemplate;
    /** @type {ModuleTemplates} */
    moduleTemplates: ModuleTemplates;
    /** @type {ModuleMemCaches | undefined} */
    moduleMemCaches: ModuleMemCaches | undefined;
    /** @type {ModuleMemCaches | undefined} */
    moduleMemCaches2: ModuleMemCaches | undefined;
    /** @type {ModuleGraph} */
    moduleGraph: ModuleGraph;
    /** @type {ChunkGraph} */
    chunkGraph: ChunkGraph;
    /** @type {CodeGenerationResults | undefined} */
    codeGenerationResults: CodeGenerationResults | undefined;
    /**
     * What `renderEmbeddedSource` returned, by module and by language pair and
     * text. Never shared between modules: a returned source may carry a map,
     * which names the module it came from.
     * @type {Map<Module, Map<string, Source>>}
     * @private
     */
    private _embeddedSources;
    /**
     * Embedded source seen this pass that the hook has not been run over yet.
     * @type {Map<Module, Map<string, { source: Source, info: EmbeddedSourceInfo, jobModule: Module }>>}
     * @private
     */
    private _pendingEmbeddedSources;
    /**
     * The module whose code generation is currently running — the outer one
     * when a generator runs nested, as `ConcatenatedModule` does.
     * @type {Module | undefined}
     * @private
     */
    private _generatingModule;
    /** @type {AsyncQueue<Module, Module, Module>} */
    processDependenciesQueue: AsyncQueue<Module, Module, Module>;
    /** @type {AsyncQueue<Module, string, Module>} */
    addModuleQueue: AsyncQueue<Module, string, Module>;
    /** @type {AsyncQueue<FactorizeModuleOptions, string, Module | ModuleFactoryResult>} */
    factorizeQueue: AsyncQueue<FactorizeModuleOptions, string, Module | ModuleFactory.ModuleFactoryResult>;
    /** @type {AsyncQueue<Module, Module, Module>} */
    buildQueue: AsyncQueue<Module, Module, Module>;
    /** @type {AsyncQueue<Module, Module, Module>} */
    rebuildQueue: AsyncQueue<Module, Module, Module>;
    /**
     * Modules in value are building during the build of Module in key.
     * Means value blocking key from finishing.
     * Needed to detect build cycles.
     * @type {WeakMap<Module, Set<Module>>}
     */
    creatingModuleDuringBuild: WeakMap<Module, Set<Module>>;
    /** @type {Map<Exclude<ChunkName, null>, EntryData>} */
    entries: Map<Exclude<Chunk.ChunkName, null>, EntryData>;
    /** @type {EntryData} */
    globalEntry: EntryData;
    /** @type {Map<string, Entrypoint>} */
    entrypoints: Map<string, Entrypoint>;
    /** @type {Entrypoint[]} */
    asyncEntrypoints: Entrypoint[];
    /** @type {Chunks} */
    chunks: Chunks;
    /** @type {ChunkGroup[]} */
    chunkGroups: ChunkGroup[];
    /** @type {Map<string, ChunkGroup>} */
    namedChunkGroups: Map<string, ChunkGroup>;
    /** @type {Map<string, Chunk>} */
    namedChunks: Map<string, Chunk>;
    /** @type {Set<Module>} */
    modules: Set<Module>;
    /**
     * @private
     * @type {Map<string, Module>}
     */
    private _modules;
    /** @type {Records | null} */
    records: Compiler.Records | null;
    /** @type {string[]} */
    additionalChunkAssets: string[];
    /** @type {CompilationAssets} */
    assets: CompilationAssets;
    /** @type {Map<string, AssetInfo>} */
    assetsInfo: Map<string, AssetInfo>;
    /** @type {Map<string, Map<string, Set<string>>>} */
    _assetsRelatedIn: Map<string, Map<string, Set<string>>>;
    /** @type {Map<string, Set<Chunk>> | undefined} */
    _assetToChunkIndex: Map<string, Set<Chunk>> | undefined;
    /** @type {Map<string, Set<Chunk>> | undefined} */
    _assetToChunkAuxiliaryIndex: Map<string, Set<Chunk>> | undefined;
    /** @type {Error[]} */
    errors: Error[];
    /** @type {Error[]} */
    warnings: Error[];
    /** @type {Error[]} */
    hints: Error[];
    /** @type {Compilation[]} */
    children: Compilation[];
    /** @type {Map<string, LogEntry[]>} */
    logging: Map<string, LogEntry[]>;
    /** @type {Map<DependencyConstructor, ModuleFactory>} */
    dependencyFactories: Map<DependencyConstructor, ModuleFactory>;
    /** @type {DependencyTemplates} */
    dependencyTemplates: DependencyTemplates;
    /** @type {Record<string, number>} */
    childrenCounters: Record<string, number>;
    /** @type {Set<number> | null} */
    usedChunkIds: Set<number> | null;
    /** @type {Set<number> | null} */
    usedModuleIds: Set<number> | null;
    /** @type {boolean} */
    needAdditionalPass: boolean;
    /** @type {Set<ModuleWithRestoreFromUnsafeCache>} */
    _restoredUnsafeCacheModuleEntries: Set<ModuleWithRestoreFromUnsafeCache>;
    /** @type {Map<string, ModuleWithRestoreFromUnsafeCache>} */
    _restoredUnsafeCacheEntries: Map<string, ModuleWithRestoreFromUnsafeCache>;
    /** @type {WeakSet<Module>} */
    builtModules: WeakSet<Module>;
    /** @type {Set<Module>} */
    _modulesWithUnresolvedDependencies: Set<Module>;
    /** @type {WeakSet<Module>} */
    codeGeneratedModules: WeakSet<Module>;
    /** @type {WeakSet<Module>} */
    buildTimeExecutedModules: WeakSet<Module>;
    /** @type {Set<string>} */
    emittedAssets: Set<string>;
    /** @type {Set<string>} */
    comparedForEmitAssets: Set<string>;
    /** @type {FileSystemDependencies} */
    fileDependencies: FileSystemDependencies;
    /** @type {FileSystemDependencies} */
    contextDependencies: FileSystemDependencies;
    /** @type {FileSystemDependencies} */
    missingDependencies: FileSystemDependencies;
    /** @type {FileSystemDependencies} */
    buildDependencies: FileSystemDependencies;
    /** @type {FileSystemDependencies} */
    optionalBuildDependencies: FileSystemDependencies;
    /**
     * @deprecated
     * @type {{ add: (item: string) => FileSystemDependencies }}
     */
    compilationDependencies: {
        add: (item: string) => FileSystemDependencies;
    };
    /** @type {CacheFacade} */
    _modulesCache: CacheFacade;
    /** @type {CacheFacade} */
    _assetsCache: CacheFacade;
    /** @type {CacheFacade} */
    _codeGenerationCache: CacheFacade;
    /** @type {PendingRuntimeModule[] | undefined} */
    _pendingRuntimeModules: PendingRuntimeModule[] | undefined;
    /** @type {boolean} */
    _unsafeCache: boolean;
    /** @type {UnsafeCachePredicate} */
    _unsafeCachePredicate: UnsafeCachePredicate;
    /** @type {LazyBarrels} */
    _lazyBarrels: LazyBarrels;
    getStats(): Stats;
    /**
     * Creates a stats options.
     * @param {string | boolean | StatsOptions | undefined} optionsOrPreset stats option value
     * @param {CreateStatsOptionsContext=} context context
     * @returns {NormalizedStatsOptions} normalized options
     */
    createStatsOptions(optionsOrPreset: string | boolean | StatsOptions | undefined, context?: CreateStatsOptionsContext | undefined): NormalizedStatsOptions;
    /**
     * Creates a stats factory.
     * @param {NormalizedStatsOptions} options options
     * @returns {StatsFactory} the stats factory
     */
    createStatsFactory(options: NormalizedStatsOptions): StatsFactory;
    /**
     * Creates a stats printer.
     * @param {NormalizedStatsOptions} options options
     * @returns {StatsPrinter} the stats printer
     */
    createStatsPrinter(options: NormalizedStatsOptions): StatsPrinter;
    /**
     * Returns the cache facade instance.
     * @param {string} name cache name
     * @returns {CacheFacade} the cache facade instance
     */
    getCache(name: string): CacheFacade;
    /**
     * Returns a logger with that name.
     * @param {string | (() => string)} name name of the logger, or function called once to get the logger name
     * @returns {Logger} a logger with that name
     */
    getLogger(name: string | (() => string)): Logger;
    /**
     * Adds the provided module to the compilation.
     * @param {Module} module module to be added that was created
     * @param {ModuleCallback} callback returns the module in the compilation,
     * it could be the passed one (if new), or an already existing in the compilation
     * @returns {void}
     */
    addModule(module: Module, callback: ModuleCallback): void;
    /**
     * Adds the provided module to the compilation.
     * @param {Module} module module to be added that was created
     * @param {ModuleCallback} callback returns the module in the compilation,
     * it could be the passed one (if new), or an already existing in the compilation
     * @returns {void}
     */
    _addModule(module: Module, callback: ModuleCallback): void;
    /**
     * Fetches a module from a compilation by its identifier
     * @param {Module} module the module provided
     * @returns {Module} the module requested
     */
    getModule(module: Module): Module;
    /**
     * Attempts to search for a module by its identifier
     * @param {string} identifier identifier (usually path) for module
     * @returns {Module | undefined} attempt to search for module and return it, else undefined
     */
    findModule(identifier: string): Module | undefined;
    /**
     * Schedules a build of the module object
     * @param {Module} module module to be built
     * @param {ModuleCallback} callback the callback
     * @returns {void}
     */
    buildModule(module: Module, callback: ModuleCallback): void;
    /**
     * Builds the module object
     * @param {Module} module module to be built
     * @param {ModuleCallback} callback the callback
     * @returns {void}
     */
    _buildModule(module: Module, callback: ModuleCallback): void;
    /**
     * Process module dependencies.
     * @param {Module} module to be processed for deps
     * @param {ModuleCallback} callback callback to be triggered
     * @returns {void}
     */
    processModuleDependencies(module: Module, callback: ModuleCallback): void;
    /**
     * Process module dependencies non recursive.
     * @param {Module} module to be processed for deps
     * @returns {void}
     */
    processModuleDependenciesNonRecursive(module: Module): void;
    /**
     * Process module dependencies.
     * @param {Module} module to be processed for deps
     * @param {ModuleCallback} callback callback to be triggered
     * @returns {void}
     */
    _processModuleDependencies(module: Module, callback: ModuleCallback): void;
    /**
     * Handle new module from unsafe cache.
     * @private
     * @param {Module} originModule original module
     * @param {Dependency} dependency dependency
     * @param {Module} module cached module
     * @param {Callback} callback callback
     */
    private _handleNewModuleFromUnsafeCache;
    /**
     * Handle existing module from unsafe cache.
     * @private
     * @param {Module} originModule original modules
     * @param {Dependency} dependency dependency
     * @param {Module} module cached module
     */
    private _handleExistingModuleFromUnsafeCache;
    /**
     * Processes the provided factorize module option.
     * @param {FactorizeModuleOptions} options options
     * @param {ModuleOrModuleFactoryResultCallback} callback callback
     * @returns {void}
     */
    _factorizeModule({ currentProfile, factory, dependencies, originModule, factoryResult, contextInfo, context }: FactorizeModuleOptions, callback: ModuleOrModuleFactoryResultCallback): void;
    /**
     * Processes the provided module callback.
     * @overload
     * @param {FactorizeModuleOptions & { factoryResult?: false }} options options
     * @param {ModuleCallback} callback callback
     * @returns {void}
     */
    factorizeModule(options: FactorizeModuleOptions & {
        factoryResult?: false;
    }, callback: ModuleCallback): void;
    /**
     * Processes the provided module factory result callback.
     * @overload
     * @param {FactorizeModuleOptions & { factoryResult: true }} options options
     * @param {ModuleFactoryResultCallback} callback callback
     * @returns {void}
     */
    factorizeModule(options: FactorizeModuleOptions & {
        factoryResult: true;
    }, callback: ModuleFactoryResultCallback): void;
    /**
     * Defines the handle module creation options type used by this module.
     * @typedef {object} HandleModuleCreationOptions
     * @property {ModuleFactory} factory
     * @property {Dependency[]} dependencies
     * @property {Module | null} originModule
     * @property {Partial<ModuleFactoryCreateDataContextInfo>=} contextInfo
     * @property {string=} context
     * @property {boolean=} recursive recurse into dependencies of the created module
     * @property {boolean=} connectOrigin connect the resolved module with the origin module
     * @property {boolean=} checkCycle check the cycle dependencies of the created module
     */
    /**
     * Handle module creation.
     * @param {HandleModuleCreationOptions} options options object
     * @param {ModuleCallback} callback callback
     * @returns {void}
     */
    handleModuleCreation({ factory, dependencies, originModule, contextInfo, context, recursive, connectOrigin, checkCycle }: {
        factory: ModuleFactory;
        dependencies: Dependency[];
        originModule: Module | null;
        contextInfo?: Partial<ModuleFactory.ModuleFactoryCreateDataContextInfo> | undefined;
        context?: string | undefined;
        /**
         * recurse into dependencies of the created module
         */
        recursive?: boolean | undefined;
        /**
         * connect the resolved module with the origin module
         */
        connectOrigin?: boolean | undefined;
        /**
         * check the cycle dependencies of the created module
         */
        checkCycle?: boolean | undefined;
    }, callback: ModuleCallback): void;
    /**
     * Handle module build and dependencies.
     * @private
     * @param {Module | null} originModule original module
     * @param {Module} module module
     * @param {boolean} recursive true if make it recursive, otherwise false
     * @param {boolean} checkCycle true if need to check cycle, otherwise false
     * @param {Dependency[]} dependencies the dependencies that resolved to the module (lazy barrel)
     * @param {ModuleCallback} callback callback
     * @returns {void}
     */
    private _handleModuleBuildAndDependencies;
    /**
     * Adds the provided string to the compilation.
     * @param {string} context context string path
     * @param {Dependency} dependency dependency used to create Module chain
     * @param {ModuleCallback} callback callback for when module chain is complete
     * @returns {void} will throw if dependency instance is not a valid Dependency
     */
    addModuleChain(context: string, dependency: Dependency, callback: ModuleCallback): void;
    /**
     * Adds the provided object to the compilation.
     * @param {object} options options
     * @param {string} options.context context string path
     * @param {Dependency} options.dependency dependency used to create Module chain
     * @param {Partial<ModuleFactoryCreateDataContextInfo>=} options.contextInfo additional context info for the root module
     * @param {ModuleCallback} callback callback for when module chain is complete
     * @returns {void} will throw if dependency instance is not a valid Dependency
     */
    addModuleTree({ context, dependency, contextInfo }: {
        context: string;
        dependency: Dependency;
        contextInfo?: Partial<ModuleFactory.ModuleFactoryCreateDataContextInfo> | undefined;
    }, callback: ModuleCallback): void;
    /**
     * Adds the provided string to the compilation.
     * @param {string} context context path for entry
     * @param {Dependency} entry entry dependency that should be followed
     * @param {string | EntryOptions} optionsOrName options or deprecated name of entry
     * @param {ModuleCallback} callback callback function
     * @returns {void} returns
     */
    addEntry(context: string, entry: Dependency, optionsOrName: string | EntryOptions, callback: ModuleCallback): void;
    /**
     * Adds the provided string to the compilation.
     * @param {string} context context path for entry
     * @param {Dependency} dependency dependency that should be followed
     * @param {EntryOptions} options options
     * @param {ModuleCallback} callback callback function
     * @returns {void} returns
     */
    addInclude(context: string, dependency: Dependency, options: EntryOptions, callback: ModuleCallback): void;
    /**
     * Adds the provided string to the compilation.
     * @param {string} context context path for entry
     * @param {Dependency} entry entry dependency that should be followed
     * @param {"dependencies" | "includeDependencies"} target type of entry
     * @param {EntryOptions} options options
     * @param {ModuleCallback} callback callback function
     * @returns {void} returns
     */
    _addEntryItem(context: string, entry: Dependency, target: "dependencies" | "includeDependencies", options: EntryOptions, callback: ModuleCallback): void;
    /**
     * Processes the provided module.
     * @param {Module} module module to be rebuilt
     * @param {ModuleCallback} callback callback when module finishes rebuilding
     * @returns {void}
     */
    rebuildModule(module: Module, callback: ModuleCallback): void;
    /**
     * Processes the provided module.
     * @param {Module} module module to be rebuilt
     * @param {ModuleCallback} callback callback when module finishes rebuilding
     * @returns {void}
     */
    _rebuildModule(module: Module, callback: ModuleCallback): void;
    /**
     * Returns the requests a lazy barrel still defers, which neither render nor
     * report what they would once requested, though no connection changes.
     * @private
     * @param {Module} module the module
     * @returns {string | undefined} the deferred requests as one key, if any
     */
    private _getLazyRequests;
    /**
     * Compute affected modules.
     * @private
     * @param {Set<Module>} modules modules
     */
    private _computeAffectedModules;
    _computeAffectedModulesWithChunkGraph(): void;
    /**
     * Returns the modules whose dependency report depends on a dependency that
     * failed to resolve: they must not be remembered as clean, as the target can
     * appear without any of them being rebuilt.
     * @private
     * @returns {Set<Module>} the modules with such a dependency and their parents
     */
    private _modulesReportingUnresolved;
    /**
     * Assigns a fresh dependency report cache token to every module whose
     * dependency errors/warnings could have changed since the previous
     * compilation: built modules and their (transitive) parents.
     * @private
     * @param {Set<Module>} modules modules
     * @returns {void}
     */
    private _flagModulesForDependencyReporting;
    /**
     * Processes the provided callback.
     * @param {Callback} callback callback
     */
    finish(callback: Callback): void;
    unseal(): void;
    /**
     * Processes the provided callback.
     * @param {Callback} callback signals when the call finishes
     * @returns {void}
     */
    seal(callback: Callback): void;
    /**
     * Report dependency errors and warnings.
     * @param {Module} module module to report from
     * @param {DependenciesBlock[]} blocks blocks to report from
     * @returns {boolean} true, when it has warnings or errors
     */
    reportDependencyErrorsAndWarnings(module: Module, blocks: DependenciesBlock[]): boolean;
    /**
     * Generates code and runtime requirements for this module.
     * @param {Callback} callback callback
     */
    codeGeneration(callback: Callback): void;
    /**
     * Offer source one language embeds in another to `renderEmbeddedSource`. The
     * hook is async and generation is not, so the first pass returns the source
     * untouched and records it; `_resolveEmbeddedSources` awaits the hook and
     * generates those modules again, when the resolved source is waiting here.
     * @param {Source} source the embedded source
     * @param {EmbeddedSourceInfo} info what it is and where it is going
     * @returns {Source} the resolved source, or `source` until it is resolved
     */
    _resolveEmbeddedSource(source: Source, info: EmbeddedSourceInfo): Source;
    /**
     * Run `renderEmbeddedSource` over everything the last pass recorded, then
     * generate those modules again so the resolved source is the one embedded.
     * @private
     * @param {CodeGenerationJobs} jobs the jobs the last pass ran
     * @param {Callback} callback callback
     * @returns {void}
     */
    private _resolveEmbeddedSources;
    /**
     * Run code generation jobs.
     * @private
     * @param {CodeGenerationJobs} jobs code generation jobs
     * @param {Callback} callback callback
     * @returns {void}
     */
    private _runCodeGenerationJobs;
    /**
     * Code generation module.
     * @param {Module} module module
     * @param {RuntimeSpec} runtime runtime
     * @param {RuntimeSpec[]} runtimes runtimes
     * @param {string} hash hash
     * @param {DependencyTemplates} dependencyTemplates dependencyTemplates
     * @param {ChunkGraph} chunkGraph chunkGraph
     * @param {ModuleGraph} moduleGraph moduleGraph
     * @param {RuntimeTemplate} runtimeTemplate runtimeTemplate
     * @param {WebpackError[]} errors errors
     * @param {CodeGenerationResults} results results
     * @param {(err?: WebpackError | null, result?: boolean) => void} callback callback
     * @returns {void}
     */
    _codeGenerationModule(module: Module, runtime: RuntimeSpec, runtimes: RuntimeSpec[], hash: string, dependencyTemplates: DependencyTemplates, chunkGraph: ChunkGraph, moduleGraph: ModuleGraph, runtimeTemplate: RuntimeTemplate, errors: WebpackError[], results: CodeGenerationResults, callback: (err?: WebpackError | null, result?: boolean) => void): void;
    _getChunkGraphEntries(): Set<Chunk>;
    /**
     * Process runtime requirements.
     * @param {object} options options
     * @param {ChunkGraph=} options.chunkGraph the chunk graph
     * @param {Iterable<Module>=} options.modules modules
     * @param {Iterable<Chunk>=} options.chunks chunks
     * @param {CodeGenerationResults=} options.codeGenerationResults codeGenerationResults
     * @param {Iterable<Chunk>=} options.chunkGraphEntries chunkGraphEntries
     * @returns {void}
     */
    processRuntimeRequirements({ chunkGraph, modules, chunks, codeGenerationResults, chunkGraphEntries }?: {
        chunkGraph?: ChunkGraph | undefined;
        modules?: Iterable<Module> | undefined;
        chunks?: Iterable<Chunk> | undefined;
        codeGenerationResults?: CodeGenerationResults | undefined;
        chunkGraphEntries?: Iterable<Chunk> | undefined;
    }): void;
    /**
     * Queues a runtime module whose implementation is loaded on demand, for
     * `_attachPendingRuntimeModules` to await and build once the requirement pass
     * is over. `runtimeRequirementInTree` is a sync hook, so a tap cannot await
     * the load itself; anything the tap reads off the requirement set must be
     * captured before queueing, since `create` runs later.
     * @template {object} T
     * @param {Chunk} chunk target chunk
     * @param {() => Promise<T>} load resolves the runtime module implementation
     * @param {(loaded: T) => RuntimeModule} create builds the runtime module from it
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {void}
     */
    addLazyRuntimeModule<T extends unknown>(chunk: Chunk, load: () => Promise<T>, create: (loaded: T) => RuntimeModule, chunkGraph?: ChunkGraph): void;
    /**
     * Awaits and attaches everything `addLazyRuntimeModule` queued. The only
     * place a deferred runtime module implementation is loaded.
     * @param {Callback} callback signals when the call finishes
     * @returns {void}
     */
    _attachPendingRuntimeModules(callback: Callback): void;
    /**
     * Adds runtime module.
     * @param {Chunk} chunk target chunk
     * @param {RuntimeModule} module runtime module
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {void}
     */
    addRuntimeModule(chunk: Chunk, module: RuntimeModule, chunkGraph?: ChunkGraph): void;
    /**
     * If `module` is passed, `loc` and `request` must also be passed.
     * @param {string | ChunkGroupOptions} groupOptions options for the chunk group
     * @param {Module=} module the module the references the chunk group
     * @param {DependencyLocation=} loc the location from with the chunk group is referenced (inside of module)
     * @param {string=} request the request from which the chunk group is referenced
     * @returns {ChunkGroup} the new or existing chunk group
     */
    addChunkInGroup(groupOptions: string | ChunkGroup.ChunkGroupOptions, module?: Module | undefined, loc?: Dependency.DependencyLocation | undefined, request?: string | undefined): ChunkGroup;
    /**
     * Adds the provided async entrypoint to this chunk group.
     * @param {EntryOptions} options options for the entrypoint
     * @param {Module} module the module the references the chunk group
     * @param {DependencyLocation} loc the location from with the chunk group is referenced (inside of module)
     * @param {string} request the request from which the chunk group is referenced
     * @returns {Entrypoint} the new or existing entrypoint
     */
    addAsyncEntrypoint(options: EntryOptions, module: Module, loc: Dependency.DependencyLocation, request: string): Entrypoint;
    /**
     * This method first looks to see if a name is provided for a new chunk,
     * and first looks to see if any named chunks already exist and reuse that chunk instead.
     * @param {ChunkName=} name optional chunk name to be provided
     * @returns {Chunk} create a chunk (invoked during seal event)
     */
    addChunk(name?: Chunk.ChunkName | undefined): Chunk;
    /**
     * Processes the provided module.
     * @deprecated
     * @param {Module} module module to assign depth
     * @returns {void}
     */
    assignDepth(module: Module): void;
    /**
     * Assigns depth values to the provided modules.
     * @param {Module[] | Set<Module>} modules modules to assign depth
     * @returns {void}
     */
    assignDepths(modules: Module[] | Set<Module>): void;
    /**
     * Gets dependency referenced exports.
     * @param {Dependency} dependency the dependency
     * @param {RuntimeSpec} runtime the runtime
     * @returns {ReferencedExports} referenced exports
     */
    getDependencyReferencedExports(dependency: Dependency, runtime: RuntimeSpec): Dependency.ReferencedExports;
    /**
     * Removes reasons of dependency block.
     * @param {Module} module module relationship for removal
     * @param {DependenciesBlockLike} block dependencies block
     * @returns {void}
     */
    removeReasonsOfDependencyBlock(module: Module, block: DependenciesBlockLike): void;
    /**
     * Patch chunks after reason removal.
     * @param {Module} module module to patch tie
     * @param {Chunk} chunk chunk to patch tie
     * @returns {void}
     */
    patchChunksAfterReasonRemoval(module: Module, chunk: Chunk): void;
    /**
     * Removes chunk from dependencies.
     * @param {DependenciesBlock} block block tie for Chunk
     * @param {Chunk} chunk chunk to remove from dep
     * @returns {void}
     */
    removeChunkFromDependencies(block: DependenciesBlock, chunk: Chunk): void;
    assignRuntimeIds(): void;
    sortItemsWithChunkIds(): void;
    summarizeDependencies(): void;
    createModuleHashes(): void;
    /**
     * Create module hash.
     * @private
     * @param {Module} module module
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {RuntimeSpec} runtime runtime
     * @param {HashFunction} hashFunction hash function
     * @param {RuntimeTemplate} runtimeTemplate runtime template
     * @param {HashDigest} hashDigest hash digest
     * @param {HashDigestLength} hashDigestLength hash digest length
     * @param {WebpackError[]} errors errors
     * @returns {string} module hash digest
     */
    private _createModuleHash;
    createHash(): CodeGenerationJobs;
    fullHash: string;
    hash: string;
    /**
     * Processes the provided file.
     * @param {string} file file name
     * @param {Source} source asset source
     * @param {AssetInfo} assetInfo extra asset information
     * @returns {void}
     */
    emitAsset(file: string, source: Source, assetInfo?: AssetInfo): void;
    /**
     * Processes the provided file.
     * @private
     * @param {string} file file name
     * @param {AssetInfo=} newInfo new asset information
     * @param {AssetInfo=} oldInfo old asset information
     */
    private _setAssetInfo;
    /**
     * Updates asset using the provided file.
     * @param {string} file file name
     * @param {Source | ((source: Source) => Source)} newSourceOrFunction new asset source or function converting old to new
     * @param {(AssetInfo | ((assetInfo?: AssetInfo) => AssetInfo | undefined)) | undefined} assetInfoUpdateOrFunction new asset info or function converting old to new
     */
    updateAsset(file: string, newSourceOrFunction: Source | ((source: Source) => Source), assetInfoUpdateOrFunction?: (AssetInfo | ((assetInfo?: AssetInfo) => AssetInfo | undefined)) | undefined): void;
    /**
     * Processes the provided file.
     * @param {string} file file name
     * @param {string} newFile the new name of file
     */
    renameAsset(file: string, newFile: string): void;
    /**
     * @private
     * @returns {void}
     */
    private _buildAssetToChunkIndex;
    /**
     * @private
     * @param {Chunk} chunk the chunk owning the set
     * @param {Set<string>} set chunk.files or chunk.auxiliaryFiles
     * @param {Map<string, Set<Chunk>>} index matching reverse index
     * @param {string} file old file name
     * @param {string} newFile new file name
     * @returns {void}
     */
    private _renameAssetInChunk;
    /**
     * Processes the provided file.
     * @param {string} file file name
     */
    deleteAsset(file: string): void;
    getAssets(): Readonly<Asset>[];
    /**
     * Returns the asset or undefined when not found.
     * @param {string} name the name of the asset
     * @returns {Readonly<Asset> | undefined} the asset or undefined when not found
     */
    getAsset(name: string): Readonly<Asset> | undefined;
    clearAssets(): void;
    createModuleAssets(): void;
    /**
     * Gets render manifest.
     * @param {RenderManifestOptions} options options object
     * @returns {RenderManifestEntry[]} manifest entries
     */
    getRenderManifest(options: RenderManifestOptions): RenderManifestEntry[];
    /**
     * Creates a chunk assets.
     * @param {Callback} callback signals when the call finishes
     * @returns {void}
     */
    createChunkAssets(callback: Callback): void;
    /**
     * Returns interpolated path.
     * @template {PathData} [T=PathData]
     * @param {string | import("./template/TemplatedPathPlugin").TemplatePathFn<T>} filename used to get asset path with hash
     * @param {T=} data context data
     * @returns {string} interpolated path
     */
    getPath<T extends PathData = PathData>(filename: string | import("./template/TemplatedPathPlugin").TemplatePathFn<T>, data?: T | undefined): string;
    /**
     * Gets path with info.
     * @template {PathData} [T=PathData]
     * @param {string | import("./template/TemplatedPathPlugin").TemplatePathFn<T>} filename used to get asset path with hash
     * @param {T=} data context data
     * @returns {InterpolatedPathAndAssetInfo} interpolated path and asset info
     */
    getPathWithInfo<T extends PathData = PathData>(filename: string | import("./template/TemplatedPathPlugin").TemplatePathFn<T>, data?: T | undefined): InterpolatedPathAndAssetInfo;
    /**
     * Returns interpolated path.
     * @template {PathData} [T=PathData]
     * @param {string | import("./template/TemplatedPathPlugin").TemplatePathFn<T>} filename used to get asset path with hash
     * @param {T} data context data
     * @returns {string} interpolated path
     */
    getAssetPath<T extends PathData = PathData>(filename: string | import("./template/TemplatedPathPlugin").TemplatePathFn<T>, data: T): string;
    /**
     * Gets asset path with info.
     * @template {PathData} [T=PathData]
     * @param {string | import("./template/TemplatedPathPlugin").TemplatePathFn<T>} filename used to get asset path with hash
     * @param {T} data context data
     * @returns {InterpolatedPathAndAssetInfo} interpolated path and asset info
     */
    getAssetPathWithInfo<T extends PathData = PathData>(filename: string | import("./template/TemplatedPathPlugin").TemplatePathFn<T>, data: T): InterpolatedPathAndAssetInfo;
    getWarnings(): Error[];
    getErrors(): Error[];
    /**
     * This function allows you to run another instance of webpack inside of webpack however as
     * a child with different settings and configurations (if desired) applied. It copies all hooks, plugins
     * from parent (or top level compiler) and creates a child Compilation
     * @param {string} name name of the child compiler
     * @param {Partial<OutputOptions>=} outputOptions // Need to convert config schema to types for this
     * @param {Plugins=} plugins webpack plugins that will be applied
     * @returns {Compiler} creates a child Compiler instance
     */
    createChildCompiler(name: string, outputOptions?: Partial<OutputOptions> | undefined, plugins?: Plugins | undefined): Compiler;
    /**
     * Processes the provided module.
     * @param {Module} module the module
     * @param {ExecuteModuleOptions} options options
     * @param {ExecuteModuleCallback} callback callback
     */
    executeModule(module: Module, options: ExecuteModuleOptions, callback: ExecuteModuleCallback): void;
    checkConstraints(): void;
}
declare namespace Compilation {
    export { PROCESS_ASSETS_STAGE_ADDITIONAL, PROCESS_ASSETS_STAGE_PRE_PROCESS, PROCESS_ASSETS_STAGE_DERIVED, PROCESS_ASSETS_STAGE_ADDITIONS, PROCESS_ASSETS_STAGE_OPTIMIZE, PROCESS_ASSETS_STAGE_OPTIMIZE_COUNT, PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY, PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE, PROCESS_ASSETS_STAGE_DEV_TOOLING, PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE, PROCESS_ASSETS_STAGE_SUMMARIZE, PROCESS_ASSETS_STAGE_OPTIMIZE_HASH, PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER, PROCESS_ASSETS_STAGE_ANALYSE, PROCESS_ASSETS_STAGE_REPORT, EntryOptions, EmbeddedSourceInfo, AsArray, FakeHook, Callback, ModuleCallback, ModuleFactoryResultCallback, ModuleOrModuleFactoryResultCallback, ExecuteModuleCallback, DependencyConstructor, CompilationAssets, AvailableModulesChunkGroupMapping, DependenciesBlockLike, Chunks, ChunkPathData, ChunkHashContext, RuntimeRequirementsContext, ExecuteModuleOptions, FileSystemDependencies, ExecuteModuleExports, ExecuteModuleResult, ExecuteModuleObject, ExecuteModuleArgument, WebpackRequire, ExecuteOptions, ExecuteModuleAssets, ExecuteModuleContext, EntryData, LogEntry, AssetSymlink, AssetTimestamps, KnownAssetInfo, AssetInfo, InterpolatedPathAndAssetInfo, Asset, HashWithLengthFunction, HashWithDigestFunction, ModulePathData, PrepareIdFunction, PathData, PathDataChunk, PathDataModule, ExcludeModulesType, KnownNormalizedStatsOptions, NormalizedStatsOptions, KnownCreateStatsOptionsContext, CreateStatsOptionsContext, CodeGenerationJob, CodeGenerationJobs, ModuleTemplates, NotCodeGeneratedModules, KnownUnsafeCacheData, UnsafeCacheData, ModuleWithRestoreFromUnsafeCache, UnsafeCachePredicate, DependencyReportCacheToken, References, ModuleMemCaches, PendingRuntimeModule, FactorizeModuleOptions };
}
import { SyncHook } from "tapable";
import Module = require("./module/Module");
import WebpackError = require("./errors/WebpackError");
import Dependency = require("./graph/Dependency");
import { SyncWaterfallHook } from "tapable";
import type { RuntimeSpec } from "./util/runtime";
import { AsyncParallelHook } from "tapable";
import { AsyncSeriesHook } from "tapable";
import Chunk = require("./graph/Chunk");
import { SyncBailHook } from "tapable";
import ChunkGroup = require("./graph/ChunkGroup");
import { AsyncSeriesBailHook } from "tapable";
import { HookMap } from "tapable";
import type RuntimeModule from "./runtime/RuntimeModule";
import type Compiler from "./Compiler";
import type { RenderManifestEntry } from "./template/Template";
import type { RenderManifestOptions } from "./template/Template";
import { AsyncSeriesWaterfallHook } from "tapable";
import type { Source } from "webpack-sources";
import type Hash from "./util/Hash";
import StatsFactory = require("./stats/StatsFactory");
import StatsPrinter = require("./stats/StatsPrinter");
import type NormalModule from "./module/NormalModule";
import type { InputFileSystem } from "./fs/fs";
import FileSystemInfo = require("./fs/FileSystemInfo");
import type RequestShortener from "./util/RequestShortener";
import { Logger } from "./logging/Logger";
import type { WebpackOptionsNormalizedWithDefaults as WebpackOptions } from "./config/defaults";
import type { OutputNormalizedWithDefaults as OutputOptionsWithDefaults } from "./config/defaults";
import MainTemplate = require("./template/MainTemplate");
import ChunkTemplate = require("./template/ChunkTemplate");
import RuntimeTemplate = require("./template/RuntimeTemplate");
import ModuleGraph = require("./graph/ModuleGraph");
import ChunkGraph = require("./graph/ChunkGraph");
import CodeGenerationResults = require("./module/CodeGenerationResults");
import AsyncQueue = require("./util/AsyncQueue");
import type ModuleFactory from "./module/ModuleFactory";
import Entrypoint = require("./graph/Entrypoint");
import DependencyTemplates = require("./template/DependencyTemplates");
import type CacheFacade from "./cache/CacheFacade";
import LazyBarrels = require("./optimize/LazyBarrels");
import Stats = require("./stats/Stats");
import type { StatsOptions } from "../declarations/WebpackOptions";
import type DependenciesBlock from "./graph/DependenciesBlock";
import type { OutputNormalized as OutputOptions } from "../declarations/WebpackOptions";
import type { Plugins } from "../declarations/WebpackOptions";
declare var PROCESS_ASSETS_STAGE_ADDITIONAL: number;
declare var PROCESS_ASSETS_STAGE_PRE_PROCESS: number;
declare var PROCESS_ASSETS_STAGE_DERIVED: number;
declare var PROCESS_ASSETS_STAGE_ADDITIONS: number;
declare var PROCESS_ASSETS_STAGE_OPTIMIZE: number;
declare var PROCESS_ASSETS_STAGE_OPTIMIZE_COUNT: number;
declare var PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY: number;
declare var PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE: number;
declare var PROCESS_ASSETS_STAGE_DEV_TOOLING: number;
declare var PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE: number;
declare var PROCESS_ASSETS_STAGE_SUMMARIZE: number;
declare var PROCESS_ASSETS_STAGE_OPTIMIZE_HASH: number;
declare var PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER: number;
declare var PROCESS_ASSETS_STAGE_ANALYSE: number;
declare var PROCESS_ASSETS_STAGE_REPORT: number;
type EntryOptions = import("./graph/Entrypoint").EntryOptions;
/**
 * One language's source embedded in another's output.
 */
type EmbeddedSourceInfo = {
    /**
     * the embedded source's type, e.g. `"css"` / `"html"`
     */
    type: Module.SourceType;
    /**
     * the type of the source it is embedded in, e.g. `"javascript"`
     */
    hostType: Module.SourceType;
    /**
     * the module being generated
     */
    module: Module;
    /**
     * which of that language's productions this is, where more than one can be embedded — a `style=""` holds `"block-contents"`, an inline `<style>` a whole `"stylesheet"`. Absent where the language has only one
     */
    as?: string | undefined;
};
/**
 * <T>
 */
type AsArray<T> = import("tapable").AsArray<T>;
/**
 * <T>
 */
type FakeHook<T> = import("./util/deprecation").FakeHook<T>;
/**
 * Defines the callback callback.
 */
type Callback = (err?: (WebpackError | null) | undefined) => void;
/**
 * Defines the module callback callback.
 */
type ModuleCallback = (err?: (WebpackError | null) | undefined, result?: (Module | null) | undefined) => void;
/**
 * Defines the module factory result callback callback.
 */
type ModuleFactoryResultCallback = (err?: (WebpackError | null) | undefined, result?: (ModuleFactory.ModuleFactoryResult | null) | undefined) => void;
/**
 * Defines the module or module factory result callback callback.
 */
type ModuleOrModuleFactoryResultCallback = (err?: (WebpackError | null) | undefined, result?: (Module | ModuleFactory.ModuleFactoryResult | null) | undefined) => void;
/**
 * Defines the execute module callback callback.
 */
type ExecuteModuleCallback = (err?: (WebpackError | null) | undefined, result?: (ExecuteModuleResult | null) | undefined) => void;
type DependencyConstructor = abstract new (...args: never[]) => Dependency;
type CompilationAssets = Record<string, Source>;
/**
 * Defines the available modules chunk group mapping type used by this module.
 */
type AvailableModulesChunkGroupMapping = {
    chunkGroup: ChunkGroup;
    availableModules: Set<Module>;
    needCopy: boolean;
};
/**
 * Defines the dependencies block like type used by this module.
 */
type DependenciesBlockLike = {
    dependencies: Dependency[];
    blocks: AsyncDependenciesBlock[];
};
type Chunks = Set<Chunk>;
/**
 * Defines the chunk path data type used by this module.
 */
type ChunkPathData = {
    id: string | number;
    name?: string | undefined;
    hash: string;
    hashWithLength?: HashWithLengthFunction | undefined;
    /**
     * builds `[chunkhash:<digest>]` per chunk in the runtime chunk-filename map
     */
    hashWithDigest?: HashWithDigestFunction | undefined;
    contentHash?: (Record<string, string>) | undefined;
    contentHashWithLength?: (Record<string, HashWithLengthFunction>) | undefined;
    /**
     * builds `[contenthash:<digest>]` per chunk in the runtime chunk-filename map
     */
    contentHashWithDigest?: (Record<string, HashWithDigestFunction>) | undefined;
};
/**
 * Defines the chunk hash context type used by this module.
 */
type ChunkHashContext = {
    /**
     * results of code generation
     */
    codeGenerationResults: CodeGenerationResults;
    /**
     * the runtime template
     */
    runtimeTemplate: RuntimeTemplate;
    /**
     * the module graph
     */
    moduleGraph: ModuleGraph;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
};
/**
 * Defines the runtime requirements context type used by this module.
 */
type RuntimeRequirementsContext = {
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the code generation results
     */
    codeGenerationResults: CodeGenerationResults;
};
/**
 * Defines the execute module options type used by this module.
 */
type ExecuteModuleOptions = {
    entryOptions?: EntryOptions | undefined;
};
type FileSystemDependencies = LazySet<string>;
type ExecuteModuleExports = EXPECTED_ANY;
/**
 * Defines the execute module result type used by this module.
 */
type ExecuteModuleResult = {
    exports: ExecuteModuleExports;
    cacheable: boolean;
    /**
     * reasons why the executed modules are not cacheable
     */
    notCacheableReasons: string[];
    assets: ExecuteModuleAssets;
    fileDependencies: FileSystemDependencies;
    contextDependencies: FileSystemDependencies;
    missingDependencies: FileSystemDependencies;
    buildDependencies: FileSystemDependencies;
};
/**
 * Defines the execute module object type used by this module.
 */
type ExecuteModuleObject = {
    /**
     * module id
     */
    id?: string | undefined;
    /**
     * exports
     */
    exports: ExecuteModuleExports;
    /**
     * is loaded
     */
    loaded: boolean;
    /**
     * error
     */
    error?: Error | undefined;
};
/**
 * Defines the execute module argument type used by this module.
 */
type ExecuteModuleArgument = {
    module: Module;
    moduleObject?: ExecuteModuleObject | undefined;
    codeGenerationResult: Module.CodeGenerationResult;
};
type WebpackRequire = ((id: string) => ExecuteModuleExports) & {
    i?: ((options: ExecuteOptions) => void)[];
    c?: Record<string, ExecuteModuleObject>;
    p?: string;
};
/**
 * Defines the execute options type used by this module.
 */
type ExecuteOptions = {
    /**
     * module id
     */
    id?: string | undefined;
    /**
     * module
     */
    module: ExecuteModuleObject;
    /**
     * require function
     */
    require: WebpackRequire;
};
type ExecuteModuleAssets = Map<string, {
    source: Source;
    info: AssetInfo | undefined;
}>;
/**
 * Defines the execute module context type used by this module.
 */
type ExecuteModuleContext = {
    assets: ExecuteModuleAssets;
    chunk: Chunk;
    chunkGraph: ChunkGraph;
    __webpack_require__?: WebpackRequire | undefined;
};
/**
 * Defines the entry data type used by this module.
 */
type EntryData = {
    /**
     * dependencies of the entrypoint that should be evaluated at startup
     */
    dependencies: Dependency[];
    /**
     * dependencies of the entrypoint that should be included but not evaluated
     */
    includeDependencies: Dependency[];
    /**
     * options of the entrypoint
     */
    options: EntryOptions;
};
/**
 * Defines the log entry type used by this module.
 */
type LogEntry = {
    type: "info" | "error" | "warn" | "log" | "debug" | "trace" | "group" | "groupCollapsed" | "groupEnd" | "profile" | "profileEnd" | "time" | "clear" | "status";
    args?: EXPECTED_ANY[] | undefined;
    time: number;
    trace?: string[] | undefined;
};
/**
 * Where an asset which is a symbolic link points, as the link itself spells it.
 */
type AssetSymlink = {
    /**
     * what the link points at, left as it is written
     */
    target: string;
    /**
     * whether it points at a directory, which is what Windows needs in order to create one
     */
    isDirectory: boolean;
};
/**
 * Access and modification times an asset carries onto the file it is written to.
 */
type AssetTimestamps = {
    /**
     * last access time, in milliseconds
     */
    atime: number;
    /**
     * last modification time, in milliseconds
     */
    mtime: number;
};
/**
 * Defines the known asset info type used by this module.
 */
type KnownAssetInfo = {
    /**
     * true, if the asset can be long term cached forever (contains a hash)
     */
    immutable?: boolean | undefined;
    /**
     * whether the asset is minimized
     */
    minimized?: boolean | undefined;
    /**
     * the value(s) of the full hash used for this asset
     */
    fullhash?: (string | string[]) | undefined;
    /**
     * the value(s) of the chunk hash used for this asset
     */
    chunkhash?: (string | string[]) | undefined;
    /**
     * the value(s) of the module hash used for this asset
     */
    modulehash?: (string | string[]) | undefined;
    /**
     * the value(s) of the content hash used for this asset
     */
    contenthash?: (string | string[]) | undefined;
    /**
     * maps a `[contenthash:<digest>]` value to its digest, so `RealContentHashPlugin` re-encodes the recomputed hash in it
     */
    contenthashDigest?: Record<string, string> | undefined;
    /**
     * when asset was created from a source file (potentially transformed), the original filename relative to compilation context
     */
    sourceFilename?: string | undefined;
    /**
     * true, when the asset was copied from a file by `output.copy`
     */
    copied?: boolean | undefined;
    /**
     * when set, the asset is emitted as a symbolic link rather than as its content
     */
    symlink?: AssetSymlink | undefined;
    /**
     * when set, the file the asset is written to is given these permissions
     */
    mode?: number | undefined;
    /**
     * when set, the file the asset is written to is stamped with these times
     */
    timestamps?: AssetTimestamps | undefined;
    /**
     * size in bytes, only set after asset has been emitted
     */
    size?: number | undefined;
    /**
     * true, when asset is only used for development and doesn't count towards user-facing assets
     */
    development?: boolean | undefined;
    /**
     * true, when asset ships data for updating an existing application (HMR)
     */
    hotModuleReplacement?: boolean | undefined;
    /**
     * true, when asset is javascript and an ESM
     */
    javascriptModule?: boolean | undefined;
    /**
     * true, when file is a manifest
     */
    manifest?: boolean | undefined;
    /**
     * object of pointers to other assets, keyed by type of relation (only points from parent to child)
     */
    related?: Record<string, null | string | string[]> | undefined;
};
type AssetInfo = KnownAssetInfo & Record<string, EXPECTED_ANY>;
type InterpolatedPathAndAssetInfo = {
    path: string;
    info: AssetInfo;
};
/**
 * Defines the asset type used by this module.
 */
type Asset = {
    /**
     * the filename of the asset
     */
    name: string;
    /**
     * source of the asset
     */
    source: Source;
    /**
     * info about the asset
     */
    info: AssetInfo;
};
type HashWithLengthFunction = (length: number) => string;
type HashWithDigestFunction = (digest: string, length?: number) => string;
/**
 * Defines the module path data type used by this module.
 */
type ModulePathData = {
    id: string | number;
    hash: string;
    hashWithLength?: HashWithLengthFunction | undefined;
};
type PrepareIdFunction = (id: string | number) => string | number;
/**
 * Defines the path data type used by this module.
 */
type PathData = {
    chunkGraph?: ChunkGraph | undefined;
    hash?: string | undefined;
    /**
     * untruncated compilation hash, for re-encoding `[fullhash:<digest>]`
     */
    fullHash?: string | undefined;
    /**
     * digest `fullHash` is encoded in (defaults to `hashDigest`)
     */
    fullHashDigest?: string | undefined;
    hashWithLength?: HashWithLengthFunction | undefined;
    /**
     * builds `[fullhash:<digest>]`/`[hash:<digest>]` in the runtime chunk-filename context, where it throws because a runtime `getFullHash()` expression cannot be re-encoded
     */
    hashWithDigest?: HashWithDigestFunction | undefined;
    chunk?: (Chunk | ChunkPathData) | undefined;
    module?: (Module | ModulePathData) | undefined;
    runtime?: RuntimeSpec | undefined;
    filename?: string | undefined;
    basename?: string | undefined;
    query?: string | undefined;
    contentHashType?: string | undefined;
    contentHash?: string | undefined;
    /**
     * untruncated module/asset content hash, for re-encoding `[contenthash:<digest>]` from full entropy
     */
    contentHashFull?: string | undefined;
    contentHashWithLength?: HashWithLengthFunction | undefined;
    /**
     * digest the stored hashes are encoded in (for `[hash:<digest>]`)
     */
    hashDigest?: string | undefined;
    /**
     * whether `optimization.realContentHash` recomputes content hashes (records an inline `[contenthash:<digest>]` so it re-encodes in that digest)
     */
    realContentHash?: boolean | undefined;
    /**
     * treat `[hash]` as `[fullhash]` rather than the module hash (CSS local idents)
     */
    hashAsFullHash?: boolean | undefined;
    noChunkHash?: boolean | undefined;
    url?: string | undefined;
    local?: string | undefined;
    uniqueName?: string | undefined;
    prepareId?: PrepareIdFunction | undefined;
};
/**
 * Path data narrowed for the chunk filename / chunk asset interpolation context,
 * where `chunk` is always provided. Use as the type parameter to `TemplatePathFn`
 * for callbacks that receive a chunk context (for example `output.filename`,
 * `output.chunkFilename`, `output.cssFilename`, `output.cssChunkFilename`,
 * `optimization.splitChunks.cacheGroups[*].filename`).
 */
type PathDataChunk = PathData & {
    chunk: Chunk | ChunkPathData;
};
/**
 * Path data narrowed for the module asset interpolation context, where `module`
 * and `chunkGraph` are always provided. Use as the type parameter to
 * `TemplatePathFn` for callbacks that receive a module context (for example
 * `output.assetModuleFilename`, the per-module `generator.filename` /
 * `generator.outputPath`, and `module.parser.css.localIdentName`).
 */
type PathDataModule = PathData & {
    module: Module | ModulePathData;
    chunkGraph: ChunkGraph;
};
type ExcludeModulesType = "module" | "chunk" | "root-of-chunk" | "nested";
/**
 * Defines the known normalized stats options type used by this module.
 */
type KnownNormalizedStatsOptions = {
    context: string;
    requestShortener: RequestShortener;
    chunksSort: string | false;
    modulesSort: string | false;
    chunkModulesSort: string | false;
    nestedModulesSort: string | false;
    assetsSort: string | false;
    ids: boolean;
    cachedAssets: boolean;
    groupAssetsByEmitStatus: boolean;
    groupAssetsByPath: boolean;
    groupAssetsByExtension: boolean;
    assetsSpace: number;
    excludeAssets: ((value: string, asset: StatsAsset) => boolean)[];
    excludeModules: ((name: string, module: StatsModule, type: ExcludeModulesType) => boolean)[];
    warningsFilter: ((warning: StatsError, textValue: string) => boolean)[];
    cachedModules: boolean;
    orphanModules: boolean;
    dependentModules: boolean;
    runtimeModules: boolean;
    groupModulesByCacheStatus: boolean;
    groupModulesByLayer: boolean;
    groupModulesByAttributes: boolean;
    groupModulesByPath: boolean;
    groupModulesByExtension: boolean;
    groupModulesByType: boolean;
    entrypoints: boolean | "auto";
    chunkGroups: boolean;
    chunkGroupAuxiliary: boolean;
    chunkGroupChildren: boolean;
    chunkGroupMaxAssets: number;
    modulesSpace: number;
    chunkModulesSpace: number;
    nestedModulesSpace: number;
    logging: false | "none" | "error" | "warn" | "info" | "log" | "verbose";
    loggingDebug: ((value: string) => boolean)[];
    loggingTrace: boolean;
    _env: StatsJsonValue;
};
type NormalizedStatsOptions = KnownNormalizedStatsOptions & Omit<StatsOptions, keyof KnownNormalizedStatsOptions> & Record<string, EXPECTED_ANY>;
/**
 * Defines the known create stats options context type used by this module.
 */
type KnownCreateStatsOptionsContext = {
    forToString?: boolean | undefined;
};
type CreateStatsOptionsContext = KnownCreateStatsOptionsContext & Record<string, EXPECTED_ANY>;
type CodeGenerationJob = {
    module: Module;
    hash: string;
    runtime: RuntimeSpec;
    runtimes: RuntimeSpec[];
};
type CodeGenerationJobs = CodeGenerationJob[];
type ModuleTemplates = {
    javascript: ModuleTemplate;
};
type NotCodeGeneratedModules = Set<Module>;
/**
 * Defines the known unsafe cache data type used by this module.
 */
type KnownUnsafeCacheData = {
    /**
     * factory meta
     */
    factoryMeta?: Module.FactoryMeta | undefined;
    /**
     * resolve options
     */
    resolveOptions?: ResolveOptions | undefined;
    parserOptions?: NormalModule.ParserOptions | undefined;
    generatorOptions?: NormalModule.GeneratorOptions | undefined;
};
type UnsafeCacheData = KnownUnsafeCacheData & Record<string, EXPECTED_ANY>;
/**
 * Defines the module with restore from unsafe cache type used by this module.
 */
type ModuleWithRestoreFromUnsafeCache = Module & {
    restoreFromUnsafeCache?: (unsafeCacheData: UnsafeCacheData, moduleFactory: ModuleFactory, compilationParams: Compiler.CompilationParams) => void;
};
type UnsafeCachePredicate = (module: Module) => boolean;
type DependencyReportCacheToken = EXPECTED_OBJECT;
type References = {
    id: ChunkGraph.ModuleId;
    modules?: Map<Module, string>;
    blocks?: (Chunk.ChunkId | null)[];
    sourceTypes?: Module.SourceTypes;
    chunkSourceTypes?: string;
};
type ModuleMemCaches = Map<Module, WeakTupleMap<EXPECTED_ANY[], EXPECTED_ANY>>;
/**
 * A queued lazy runtime module; `create` takes exactly what its own `load`
 * resolves, which differs per entry.
 */
type PendingRuntimeModule = {
    chunk: Chunk;
    load: () => Promise<EXPECTED_OBJECT>;
    create: (loaded: never) => RuntimeModule;
    chunkGraph: ChunkGraph;
};
/**
 * Defines the factorize module options type used by this module.
 */
type FactorizeModuleOptions = {
    currentProfile?: ModuleProfile | undefined;
    factory: ModuleFactory;
    dependencies: Dependency[];
    /**
     * return full ModuleFactoryResult instead of only module
     */
    factoryResult?: boolean | undefined;
    originModule: Module | null;
    contextInfo?: Partial<ModuleFactory.ModuleFactoryCreateDataContextInfo> | undefined;
    context?: string | undefined;
};
import type AsyncDependenciesBlock from "./graph/AsyncDependenciesBlock";
import LazySet = require("./util/LazySet");
import type { StatsAsset } from "./stats/DefaultStatsFactoryPlugin";
import type { StatsModule } from "./stats/DefaultStatsFactoryPlugin";
import type { StatsError } from "./stats/DefaultStatsFactoryPlugin";
import type { StatsJsonValue } from "./stats/DefaultStatsFactoryPlugin";
import ModuleTemplate = require("./template/ModuleTemplate");
import type { ResolveOptions } from "../declarations/WebpackOptions";
import WeakTupleMap = require("./util/WeakTupleMap");
import ModuleProfile = require("./module/ModuleProfile");
