export = Compilation;
/** @typedef {{ id: ModuleId, modules?: Map<Module, ModuleId>, blocks?: (ChunkId | null)[] }} References */
/** @typedef {Map<Module, WeakTupleMap<EXPECTED_ANY[], EXPECTED_ANY>>} ModuleMemCaches */
declare class Compilation {
    /**
     * Creates an instance of Compilation.
     * @param {Compiler} compiler the compiler which created the compilation
     * @param {CompilationParams} params the compilation parameters
     */
    constructor(compiler: Compiler, params: CompilationParams);
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
        dependencyReferencedExports: SyncWaterfallHook<[ReferencedExports, Dependency, RuntimeSpec]>;
        /** @type {SyncHook<[ExecuteModuleArgument, ExecuteModuleContext]>} */
        executeModule: SyncHook<[ExecuteModuleArgument, ExecuteModuleContext]>;
        /** @type {AsyncParallelHook<[ExecuteModuleArgument, ExecuteModuleContext]>} */
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
        additionalChunkRuntimeRequirements: SyncHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext]>;
        /** @type {HookMap<SyncBailHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext], void>>} */
        runtimeRequirementInChunk: HookMap<SyncBailHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext], void>>;
        /** @type {SyncHook<[Module, RuntimeRequirements, RuntimeRequirementsContext]>} */
        additionalModuleRuntimeRequirements: SyncHook<[Module, RuntimeRequirements, RuntimeRequirementsContext]>;
        /** @type {HookMap<SyncBailHook<[Module, RuntimeRequirements, RuntimeRequirementsContext], void>>} */
        runtimeRequirementInModule: HookMap<SyncBailHook<[Module, RuntimeRequirements, RuntimeRequirementsContext], void>>;
        /** @type {SyncHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext]>} */
        additionalTreeRuntimeRequirements: SyncHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext]>;
        /** @type {HookMap<SyncBailHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext], void>>} */
        runtimeRequirementInTree: HookMap<SyncBailHook<[Chunk, RuntimeRequirements, RuntimeRequirementsContext], void>>;
        /** @type {SyncHook<[RuntimeModule, Chunk]>} */
        runtimeModule: SyncHook<[RuntimeModule, Chunk]>;
        /** @type {SyncHook<[Iterable<Module>, Records]>} */
        reviveModules: SyncHook<[Iterable<Module>, Records]>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        beforeModuleIds: SyncHook<[Iterable<Module>]>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        moduleIds: SyncHook<[Iterable<Module>]>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        optimizeModuleIds: SyncHook<[Iterable<Module>]>;
        /** @type {SyncHook<[Iterable<Module>]>} */
        afterOptimizeModuleIds: SyncHook<[Iterable<Module>]>;
        /** @type {SyncHook<[Iterable<Chunk>, Records]>} */
        reviveChunks: SyncHook<[Iterable<Chunk>, Records]>;
        /** @type {SyncHook<[Iterable<Chunk>]>} */
        beforeChunkIds: SyncHook<[Iterable<Chunk>]>;
        /** @type {SyncHook<[Iterable<Chunk>]>} */
        chunkIds: SyncHook<[Iterable<Chunk>]>;
        /** @type {SyncHook<[Iterable<Chunk>]>} */
        optimizeChunkIds: SyncHook<[Iterable<Chunk>]>;
        /** @type {SyncHook<[Iterable<Chunk>]>} */
        afterOptimizeChunkIds: SyncHook<[Iterable<Chunk>]>;
        /** @type {SyncHook<[Iterable<Module>, Records]>} */
        recordModules: SyncHook<[Iterable<Module>, Records]>;
        /** @type {SyncHook<[Iterable<Chunk>, Records]>} */
        recordChunks: SyncHook<[Iterable<Chunk>, Records]>;
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
        recordHash: SyncHook<[Records]>;
        /** @type {SyncHook<[Compilation, Records]>} */
        record: SyncHook<[Compilation, Records]>;
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
        /** @type {AsyncSeriesHook<[CompilationAssets]>} */
        processAdditionalAssets: AsyncSeriesHook<[CompilationAssets]>;
        /** @type {SyncBailHook<[], boolean | void>} */
        needAdditionalSeal: SyncBailHook<[], boolean | void>;
        /** @type {AsyncSeriesHook<[]>} */
        afterSeal: AsyncSeriesHook<[]>;
        /** @type {SyncWaterfallHook<[RenderManifestEntry[], RenderManifestOptions]>} */
        renderManifest: SyncWaterfallHook<[RenderManifestEntry[], RenderManifestOptions]>;
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
        readonly normalModuleLoader: SyncHook<[import("./NormalModule").AnyLoaderContext, import("./NormalModule")], void, import("tapable").UnsetAdditionalOptions>;
    }>;
    /** @type {string=} */
    name: string | undefined;
    /** @type {number | undefined} */
    startTime: number | undefined;
    /** @type {number | undefined} */
    endTime: number | undefined;
    /** @type {Compiler} */
    compiler: Compiler;
    resolverFactory: import("./ResolverFactory");
    /** @type {InputFileSystem} */
    inputFileSystem: InputFileSystem;
    fileSystemInfo: FileSystemInfo;
    /** @type {ValueCacheVersions} */
    valueCacheVersions: ValueCacheVersions;
    requestShortener: import("./RequestShortener");
    compilerPath: string;
    logger: Logger;
    options: import("./config/defaults").WebpackOptionsNormalizedWithDefaults;
    outputOptions: import("./config/defaults").OutputNormalizedWithDefaults;
    /** @type {boolean} */
    bail: boolean;
    /** @type {boolean} */
    profile: boolean;
    params: import("./Compiler").CompilationParams;
    mainTemplate: MainTemplate;
    chunkTemplate: ChunkTemplate;
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
    /** @type {AsyncQueue<Module, Module, Module>} */
    processDependenciesQueue: AsyncQueue<Module, Module, Module>;
    /** @type {AsyncQueue<Module, string, Module>} */
    addModuleQueue: AsyncQueue<Module, string, Module>;
    /** @type {AsyncQueue<FactorizeModuleOptions, string, Module | ModuleFactoryResult>} */
    factorizeQueue: AsyncQueue<FactorizeModuleOptions, string, Module | ModuleFactoryResult>;
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
    entries: Map<Exclude<ChunkName, null>, EntryData>;
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
    records: Records | null;
    /** @type {string[]} */
    additionalChunkAssets: string[];
    /** @type {CompilationAssets} */
    assets: CompilationAssets;
    /** @type {Map<string, AssetInfo>} */
    assetsInfo: Map<string, AssetInfo>;
    /** @type {Map<string, Map<string, Set<string>>>} */
    _assetsRelatedIn: Map<string, Map<string, Set<string>>>;
    /** @type {Error[]} */
    errors: Error[];
    /** @type {Error[]} */
    warnings: Error[];
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
    compilationDependencies: {
        add: (item: string) => FileSystemDependencies;
    };
    _modulesCache: import("./CacheFacade");
    _assetsCache: import("./CacheFacade");
    _codeGenerationCache: import("./CacheFacade");
    _unsafeCache: boolean;
    _unsafeCachePredicate: (module: import("./Module")) => boolean;
    getStats(): Stats;
    /**
     * @param {string | boolean | StatsOptions | undefined} optionsOrPreset stats option value
     * @param {CreateStatsOptionsContext=} context context
     * @returns {NormalizedStatsOptions} normalized options
     */
    createStatsOptions(optionsOrPreset: string | boolean | StatsOptions | undefined, context?: CreateStatsOptionsContext | undefined): NormalizedStatsOptions;
    /**
     * @param {NormalizedStatsOptions} options options
     * @returns {StatsFactory} the stats factory
     */
    createStatsFactory(options: NormalizedStatsOptions): StatsFactory;
    /**
     * @param {NormalizedStatsOptions} options options
     * @returns {StatsPrinter} the stats printer
     */
    createStatsPrinter(options: NormalizedStatsOptions): StatsPrinter;
    /**
     * @param {string} name cache name
     * @returns {CacheFacade} the cache facade instance
     */
    getCache(name: string): CacheFacade;
    /**
     * @param {string | (() => string)} name name of the logger, or function called once to get the logger name
     * @returns {Logger} a logger with that name
     */
    getLogger(name: string | (() => string)): Logger;
    /**
     * @param {Module} module module to be added that was created
     * @param {ModuleCallback} callback returns the module in the compilation,
     * it could be the passed one (if new), or an already existing in the compilation
     * @returns {void}
     */
    addModule(module: Module, callback: ModuleCallback): void;
    /**
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
     * @returns {Module|undefined} attempt to search for module and return it, else undefined
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
     * @param {Module} module to be processed for deps
     * @param {ModuleCallback} callback callback to be triggered
     * @returns {void}
     */
    processModuleDependencies(module: Module, callback: ModuleCallback): void;
    /**
     * @param {Module} module to be processed for deps
     * @returns {void}
     */
    processModuleDependenciesNonRecursive(module: Module): void;
    /**
     * @param {Module} module to be processed for deps
     * @param {ModuleCallback} callback callback to be triggered
     * @returns {void}
     */
    _processModuleDependencies(module: Module, callback: ModuleCallback): void;
    /**
     * @private
     * @param {Module} originModule original module
     * @param {Dependency} dependency dependency
     * @param {Module} module cached module
     * @param {Callback} callback callback
     */
    private _handleNewModuleFromUnsafeCache;
    /**
     * @private
     * @param {Module} originModule original modules
     * @param {Dependency} dependency dependency
     * @param {Module} module cached module
     */
    private _handleExistingModuleFromUnsafeCache;
    /**
     * @param {FactorizeModuleOptions} options options
     * @param {ModuleOrModuleFactoryResultCallback} callback callback
     * @returns {void}
     */
    _factorizeModule({ currentProfile, factory, dependencies, originModule, factoryResult, contextInfo, context }: FactorizeModuleOptions, callback: ModuleOrModuleFactoryResultCallback): void;
    /**
     * @overload
     * @param {FactorizeModuleOptions & { factoryResult?: false }} options options
     * @param {ModuleCallback} callback callback
     * @returns {void}
     */
    factorizeModule(options: FactorizeModuleOptions & {
        factoryResult?: false;
    }, callback: ModuleCallback): void;
    /**
     * @overload
     * @param {FactorizeModuleOptions & { factoryResult: true }} options options
     * @param {ModuleFactoryResultCallback} callback callback
     * @returns {void}
     */
    factorizeModule(options: FactorizeModuleOptions & {
        factoryResult: true;
    }, callback: ModuleFactoryResultCallback): void;
    /**
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
     * @param {HandleModuleCreationOptions} options options object
     * @param {ModuleCallback} callback callback
     * @returns {void}
     */
    handleModuleCreation({ factory, dependencies, originModule, contextInfo, context, recursive, connectOrigin, checkCycle }: {
        factory: ModuleFactory;
        dependencies: Dependency[];
        originModule: Module | null;
        contextInfo?: Partial<ModuleFactoryCreateDataContextInfo> | undefined;
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
     * @private
     * @param {Module | null} originModule original module
     * @param {Module} module module
     * @param {boolean} recursive true if make it recursive, otherwise false
     * @param {boolean} checkCycle true if need to check cycle, otherwise false
     * @param {ModuleCallback} callback callback
     * @returns {void}
     */
    private _handleModuleBuildAndDependencies;
    /**
     * @param {string} context context string path
     * @param {Dependency} dependency dependency used to create Module chain
     * @param {ModuleCallback} callback callback for when module chain is complete
     * @returns {void} will throw if dependency instance is not a valid Dependency
     */
    addModuleChain(context: string, dependency: Dependency, callback: ModuleCallback): void;
    /**
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
        contextInfo?: Partial<ModuleFactoryCreateDataContextInfo> | undefined;
    }, callback: ModuleCallback): void;
    /**
     * @param {string} context context path for entry
     * @param {Dependency} entry entry dependency that should be followed
     * @param {string | EntryOptions} optionsOrName options or deprecated name of entry
     * @param {ModuleCallback} callback callback function
     * @returns {void} returns
     */
    addEntry(context: string, entry: Dependency, optionsOrName: string | EntryOptions, callback: ModuleCallback): void;
    /**
     * @param {string} context context path for entry
     * @param {Dependency} dependency dependency that should be followed
     * @param {EntryOptions} options options
     * @param {ModuleCallback} callback callback function
     * @returns {void} returns
     */
    addInclude(context: string, dependency: Dependency, options: EntryOptions, callback: ModuleCallback): void;
    /**
     * @param {string} context context path for entry
     * @param {Dependency} entry entry dependency that should be followed
     * @param {"dependencies" | "includeDependencies"} target type of entry
     * @param {EntryOptions} options options
     * @param {ModuleCallback} callback callback function
     * @returns {void} returns
     */
    _addEntryItem(context: string, entry: Dependency, target: "dependencies" | "includeDependencies", options: EntryOptions, callback: ModuleCallback): void;
    /**
     * @param {Module} module module to be rebuilt
     * @param {ModuleCallback} callback callback when module finishes rebuilding
     * @returns {void}
     */
    rebuildModule(module: Module, callback: ModuleCallback): void;
    /**
     * @param {Module} module module to be rebuilt
     * @param {ModuleCallback} callback callback when module finishes rebuilding
     * @returns {void}
     */
    _rebuildModule(module: Module, callback: ModuleCallback): void;
    /**
     * @private
     * @param {Set<Module>} modules modules
     */
    private _computeAffectedModules;
    _computeAffectedModulesWithChunkGraph(): void;
    /**
     * @param {Callback} callback callback
     */
    finish(callback: Callback): void;
    unseal(): void;
    /**
     * @param {Callback} callback signals when the call finishes
     * @returns {void}
     */
    seal(callback: Callback): void;
    /**
     * @param {Module} module module to report from
     * @param {DependenciesBlock[]} blocks blocks to report from
     * @returns {boolean} true, when it has warnings or errors
     */
    reportDependencyErrorsAndWarnings(module: Module, blocks: DependenciesBlock[]): boolean;
    /**
     * @param {Callback} callback callback
     */
    codeGeneration(callback: Callback): void;
    /**
     * @private
     * @param {CodeGenerationJobs} jobs code generation jobs
     * @param {Callback} callback callback
     * @returns {void}
     */
    private _runCodeGenerationJobs;
    /**
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
     */
    _codeGenerationModule(module: Module, runtime: RuntimeSpec, runtimes: RuntimeSpec[], hash: string, dependencyTemplates: DependencyTemplates, chunkGraph: ChunkGraph, moduleGraph: ModuleGraph, runtimeTemplate: RuntimeTemplate, errors: WebpackError[], results: CodeGenerationResults, callback: (err?: WebpackError | null, result?: boolean) => void): void;
    _getChunkGraphEntries(): Set<Chunk>;
    /**
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
     * @param {string=} request the request from which the the chunk group is referenced
     * @returns {ChunkGroup} the new or existing chunk group
     */
    addChunkInGroup(groupOptions: string | ChunkGroupOptions, module?: Module | undefined, loc?: DependencyLocation | undefined, request?: string | undefined): ChunkGroup;
    /**
     * @param {EntryOptions} options options for the entrypoint
     * @param {Module} module the module the references the chunk group
     * @param {DependencyLocation} loc the location from with the chunk group is referenced (inside of module)
     * @param {string} request the request from which the the chunk group is referenced
     * @returns {Entrypoint} the new or existing entrypoint
     */
    addAsyncEntrypoint(options: EntryOptions, module: Module, loc: DependencyLocation, request: string): Entrypoint;
    /**
     * This method first looks to see if a name is provided for a new chunk,
     * and first looks to see if any named chunks already exist and reuse that chunk instead.
     * @param {ChunkName=} name optional chunk name to be provided
     * @returns {Chunk} create a chunk (invoked during seal event)
     */
    addChunk(name?: ChunkName | undefined): Chunk;
    /**
     * @deprecated
     * @param {Module} module module to assign depth
     * @returns {void}
     */
    assignDepth(module: Module): void;
    /**
     * @param {Set<Module>} modules module to assign depth
     * @returns {void}
     */
    assignDepths(modules: Set<Module>): void;
    /**
     * @param {Dependency} dependency the dependency
     * @param {RuntimeSpec} runtime the runtime
     * @returns {ReferencedExports} referenced exports
     */
    getDependencyReferencedExports(dependency: Dependency, runtime: RuntimeSpec): ReferencedExports;
    /**
     * @param {Module} module module relationship for removal
     * @param {DependenciesBlockLike} block dependencies block
     * @returns {void}
     */
    removeReasonsOfDependencyBlock(module: Module, block: DependenciesBlockLike): void;
    /**
     * @param {Module} module module to patch tie
     * @param {Chunk} chunk chunk to patch tie
     * @returns {void}
     */
    patchChunksAfterReasonRemoval(module: Module, chunk: Chunk): void;
    /**
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
     * @param {string} file file name
     * @param {Source} source asset source
     * @param {AssetInfo} assetInfo extra asset information
     * @returns {void}
     */
    emitAsset(file: string, source: Source, assetInfo?: AssetInfo): void;
    /**
     * @private
     * @param {string} file file name
     * @param {AssetInfo=} newInfo new asset information
     * @param {AssetInfo=} oldInfo old asset information
     */
    private _setAssetInfo;
    /**
     * @param {string} file file name
     * @param {Source | ((source: Source) => Source)} newSourceOrFunction new asset source or function converting old to new
     * @param {(AssetInfo | ((assetInfo?: AssetInfo) => AssetInfo | undefined)) | undefined} assetInfoUpdateOrFunction new asset info or function converting old to new
     */
    updateAsset(file: string, newSourceOrFunction: Source | ((source: Source) => Source), assetInfoUpdateOrFunction?: (AssetInfo | ((assetInfo?: AssetInfo) => AssetInfo | undefined)) | undefined): void;
    /**
     * @param {string} file file name
     * @param {string} newFile the new name of file
     */
    renameAsset(file: string, newFile: string): void;
    /**
     * @param {string} file file name
     */
    deleteAsset(file: string): void;
    getAssets(): Readonly<Asset>[];
    /**
     * @param {string} name the name of the asset
     * @returns {Readonly<Asset> | undefined} the asset or undefined when not found
     */
    getAsset(name: string): Readonly<Asset> | undefined;
    clearAssets(): void;
    createModuleAssets(): void;
    /**
     * @param {RenderManifestOptions} options options object
     * @returns {RenderManifestEntry[]} manifest entries
     */
    getRenderManifest(options: RenderManifestOptions): RenderManifestEntry[];
    /**
     * @param {Callback} callback signals when the call finishes
     * @returns {void}
     */
    createChunkAssets(callback: Callback): void;
    /**
     * @param {TemplatePath} filename used to get asset path with hash
     * @param {PathData} data context data
     * @returns {string} interpolated path
     */
    getPath(filename: TemplatePath, data?: PathData): string;
    /**
     * @param {TemplatePath} filename used to get asset path with hash
     * @param {PathData} data context data
     * @returns {InterpolatedPathAndAssetInfo} interpolated path and asset info
     */
    getPathWithInfo(filename: TemplatePath, data?: PathData): InterpolatedPathAndAssetInfo;
    /**
     * @param {TemplatePath} filename used to get asset path with hash
     * @param {PathData} data context data
     * @returns {string} interpolated path
     */
    getAssetPath(filename: TemplatePath, data: PathData): string;
    /**
     * @param {TemplatePath} filename used to get asset path with hash
     * @param {PathData} data context data
     * @returns {InterpolatedPathAndAssetInfo} interpolated path and asset info
     */
    getAssetPathWithInfo(filename: TemplatePath, data: PathData): InterpolatedPathAndAssetInfo;
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
     * @param {Module} module the module
     * @param {ExecuteModuleOptions} options options
     * @param {ExecuteModuleCallback} callback callback
     */
    executeModule(module: Module, options: ExecuteModuleOptions, callback: ExecuteModuleCallback): void;
    checkConstraints(): void;
}
declare namespace Compilation {
    export { PROCESS_ASSETS_STAGE_ADDITIONAL, PROCESS_ASSETS_STAGE_PRE_PROCESS, PROCESS_ASSETS_STAGE_DERIVED, PROCESS_ASSETS_STAGE_ADDITIONS, PROCESS_ASSETS_STAGE_OPTIMIZE, PROCESS_ASSETS_STAGE_OPTIMIZE_COUNT, PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY, PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE, PROCESS_ASSETS_STAGE_DEV_TOOLING, PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE, PROCESS_ASSETS_STAGE_SUMMARIZE, PROCESS_ASSETS_STAGE_OPTIMIZE_HASH, PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER, PROCESS_ASSETS_STAGE_ANALYSE, PROCESS_ASSETS_STAGE_REPORT, Source, OutputOptions, HashFunction, HashDigest, HashDigestLength, StatsOptions, Plugins, WebpackOptions, OutputOptionsWithDefaults, AsyncDependenciesBlock, Cache, CacheFacade, ChunkName, ChunkId, ChunkGroupOptions, Compiler, CompilationParams, MemCache, WeakReferences, ModuleMemCachesItem, Records, DependenciesBlock, DependencyLocation, ReferencedExports, EntryOptions, NameForCondition, BuildInfo, ValueCacheVersions, RuntimeRequirements, NormalModuleCompilationHooks, FactoryMeta, CodeGenerationResult, ModuleFactory, ResolveOptions, ModuleId, ModuleGraphConnection, ModuleFactoryCreateDataContextInfo, ModuleFactoryResult, ParserOptions, GeneratorOptions, RequestShortener, RuntimeModule, RenderManifestEntry, RenderManifestOptions, StatsAsset, StatsError, StatsModule, TemplatePath, Hash, AsArray, FakeHook, RuntimeSpec, InputFileSystem, Callback, ModuleCallback, ModuleFactoryResultCallback, ModuleOrModuleFactoryResultCallback, ExecuteModuleCallback, DependencyConstructor, CompilationAssets, AvailableModulesChunkGroupMapping, DependenciesBlockLike, Chunks, ChunkPathData, ChunkHashContext, RuntimeRequirementsContext, ExecuteModuleOptions, FileSystemDependencies, ExecuteModuleExports, ExecuteModuleResult, ExecuteModuleObject, ExecuteModuleArgument, WebpackRequire, ExecuteOptions, ExecuteModuleAssets, ExecuteModuleContext, EntryData, LogEntry, KnownAssetInfo, AssetInfo, InterpolatedPathAndAssetInfo, Asset, HashWithLengthFunction, ModulePathData, PrepareIdFunction, PathData, ExcludeModulesType, KnownNormalizedStatsOptions, NormalizedStatsOptions, KnownCreateStatsOptionsContext, CreateStatsOptionsContext, CodeGenerationJob, CodeGenerationJobs, ModuleTemplates, NotCodeGeneratedModules, KnownUnsafeCacheData, UnsafeCacheData, ModuleWithRestoreFromUnsafeCache, References, ModuleMemCaches, FactorizeModuleOptions };
}
import { SyncHook } from "tapable";
import Module = require("./Module");
import WebpackError = require("./WebpackError");
import Dependency = require("./Dependency");
import { SyncWaterfallHook } from "tapable";
import { AsyncParallelHook } from "tapable";
import { AsyncSeriesHook } from "tapable";
import Chunk = require("./Chunk");
import { SyncBailHook } from "tapable";
import ChunkGroup = require("./ChunkGroup");
import { AsyncSeriesBailHook } from "tapable";
import { HookMap } from "tapable";
import StatsFactory = require("./stats/StatsFactory");
import StatsPrinter = require("./stats/StatsPrinter");
import FileSystemInfo = require("./FileSystemInfo");
import { Logger } from "./logging/Logger";
import MainTemplate = require("./MainTemplate");
import ChunkTemplate = require("./ChunkTemplate");
import RuntimeTemplate = require("./RuntimeTemplate");
import ModuleGraph = require("./ModuleGraph");
import ChunkGraph = require("./ChunkGraph");
import CodeGenerationResults = require("./CodeGenerationResults");
import AsyncQueue = require("./util/AsyncQueue");
import Entrypoint = require("./Entrypoint");
import DependencyTemplates = require("./DependencyTemplates");
import Stats = require("./Stats");
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
type Source = import("webpack-sources").Source;
type OutputOptions = import("../declarations/WebpackOptions").OutputNormalized;
type HashFunction = import("../declarations/WebpackOptions").HashFunction;
type HashDigest = import("../declarations/WebpackOptions").HashDigest;
type HashDigestLength = import("../declarations/WebpackOptions").HashDigestLength;
type StatsOptions = import("../declarations/WebpackOptions").StatsOptions;
type Plugins = import("../declarations/WebpackOptions").Plugins;
type WebpackOptions = import("./config/defaults").WebpackOptionsNormalizedWithDefaults;
type OutputOptionsWithDefaults = import("./config/defaults").OutputNormalizedWithDefaults;
type AsyncDependenciesBlock = import("./AsyncDependenciesBlock");
type Cache = import("./Cache");
type CacheFacade = import("./CacheFacade");
type ChunkName = import("./Chunk").ChunkName;
type ChunkId = import("./Chunk").ChunkId;
type ChunkGroupOptions = import("./ChunkGroup").ChunkGroupOptions;
type Compiler = import("./Compiler");
type CompilationParams = import("./Compiler").CompilationParams;
type MemCache = import("./Compiler").MemCache;
type WeakReferences = import("./Compiler").WeakReferences;
type ModuleMemCachesItem = import("./Compiler").ModuleMemCachesItem;
type Records = import("./Compiler").Records;
type DependenciesBlock = import("./DependenciesBlock");
type DependencyLocation = import("./Dependency").DependencyLocation;
type ReferencedExports = import("./Dependency").ReferencedExports;
type EntryOptions = import("./Entrypoint").EntryOptions;
type NameForCondition = import("./Module").NameForCondition;
type BuildInfo = import("./Module").BuildInfo;
type ValueCacheVersions = import("./Module").ValueCacheVersions;
type RuntimeRequirements = import("./Module").RuntimeRequirements;
type NormalModuleCompilationHooks = import("./NormalModule").NormalModuleCompilationHooks;
type FactoryMeta = import("./Module").FactoryMeta;
type CodeGenerationResult = import("./Module").CodeGenerationResult;
type ModuleFactory = import("./ModuleFactory");
type ResolveOptions = import("../declarations/WebpackOptions").ResolveOptions;
type ModuleId = import("./ChunkGraph").ModuleId;
type ModuleGraphConnection = import("./ModuleGraphConnection");
type ModuleFactoryCreateDataContextInfo = import("./ModuleFactory").ModuleFactoryCreateDataContextInfo;
type ModuleFactoryResult = import("./ModuleFactory").ModuleFactoryResult;
type ParserOptions = import("./NormalModule").ParserOptions;
type GeneratorOptions = import("./NormalModule").GeneratorOptions;
type RequestShortener = import("./RequestShortener");
type RuntimeModule = import("./RuntimeModule");
type RenderManifestEntry = import("./Template").RenderManifestEntry;
type RenderManifestOptions = import("./Template").RenderManifestOptions;
type StatsAsset = import("./stats/DefaultStatsFactoryPlugin").StatsAsset;
type StatsError = import("./stats/DefaultStatsFactoryPlugin").StatsError;
type StatsModule = import("./stats/DefaultStatsFactoryPlugin").StatsModule;
type TemplatePath = import("./TemplatedPathPlugin").TemplatePath;
type Hash = import("./util/Hash");
/**
 * <T>
 */
type AsArray<T> = import("tapable").AsArray<T>;
/**
 * <T>
 */
type FakeHook<T> = import("./util/deprecation").FakeHook<T>;
type RuntimeSpec = import("./util/runtime").RuntimeSpec;
type InputFileSystem = import("./util/fs").InputFileSystem;
type Callback = (err?: (WebpackError | null) | undefined) => void;
type ModuleCallback = (err?: (WebpackError | null) | undefined, result?: (Module | null) | undefined) => void;
type ModuleFactoryResultCallback = (err?: (WebpackError | null) | undefined, result?: (ModuleFactoryResult | null) | undefined) => void;
type ModuleOrModuleFactoryResultCallback = (err?: (WebpackError | null) | undefined, result?: (Module | ModuleFactoryResult | null) | undefined) => void;
type ExecuteModuleCallback = (err?: (WebpackError | null) | undefined, result?: (ExecuteModuleResult | null) | undefined) => void;
type DependencyConstructor = new (...args: EXPECTED_ANY[]) => Dependency;
type CompilationAssets = Record<string, Source>;
type AvailableModulesChunkGroupMapping = {
    chunkGroup: ChunkGroup;
    availableModules: Set<Module>;
    needCopy: boolean;
};
type DependenciesBlockLike = {
    dependencies: Dependency[];
    blocks: AsyncDependenciesBlock[];
};
type Chunks = Set<Chunk>;
type ChunkPathData = {
    id: string | number;
    name?: string | undefined;
    hash: string;
    hashWithLength?: HashWithLengthFunction | undefined;
    contentHash?: (Record<string, string>) | undefined;
    contentHashWithLength?: (Record<string, HashWithLengthFunction>) | undefined;
};
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
type ExecuteModuleOptions = {
    entryOptions?: EntryOptions | undefined;
};
type FileSystemDependencies = LazySet<string>;
type ExecuteModuleExports = EXPECTED_ANY;
type ExecuteModuleResult = {
    exports: ExecuteModuleExports;
    cacheable: boolean;
    assets: ExecuteModuleAssets;
    fileDependencies: FileSystemDependencies;
    contextDependencies: FileSystemDependencies;
    missingDependencies: FileSystemDependencies;
    buildDependencies: FileSystemDependencies;
};
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
type ExecuteModuleArgument = {
    module: Module;
    moduleObject?: ExecuteModuleObject | undefined;
    codeGenerationResult: CodeGenerationResult;
};
type WebpackRequire = ((id: string) => ExecuteModuleExports) & {
    i?: ((options: ExecuteOptions) => void)[];
    c?: Record<string, ExecuteModuleObject>;
};
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
type ExecuteModuleContext = {
    assets: ExecuteModuleAssets;
    chunk: Chunk;
    chunkGraph: ChunkGraph;
    __webpack_require__?: WebpackRequire | undefined;
};
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
type LogEntry = {
    type: string;
    args?: EXPECTED_ANY[] | undefined;
    time: number;
    trace?: string[] | undefined;
};
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
     * when asset was created from a source file (potentially transformed), the original filename relative to compilation context
     */
    sourceFilename?: string | undefined;
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
type ModulePathData = {
    id: string | number;
    hash: string;
    hashWithLength?: HashWithLengthFunction | undefined;
};
type PrepareIdFunction = (id: string | number) => string | number;
type PathData = {
    chunkGraph?: ChunkGraph | undefined;
    hash?: string | undefined;
    hashWithLength?: HashWithLengthFunction | undefined;
    chunk?: (Chunk | ChunkPathData) | undefined;
    module?: (Module | ModulePathData) | undefined;
    runtime?: RuntimeSpec | undefined;
    filename?: string | undefined;
    basename?: string | undefined;
    query?: string | undefined;
    contentHashType?: string | undefined;
    contentHash?: string | undefined;
    contentHashWithLength?: HashWithLengthFunction | undefined;
    noChunkHash?: boolean | undefined;
    url?: string | undefined;
    prepareId?: PrepareIdFunction | undefined;
};
type ExcludeModulesType = "module" | "chunk" | "root-of-chunk" | "nested";
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
    _env: EXPECTED_ANY;
};
type NormalizedStatsOptions = KnownNormalizedStatsOptions & Omit<StatsOptions, keyof KnownNormalizedStatsOptions> & Record<string, EXPECTED_ANY>;
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
type KnownUnsafeCacheData = {
    /**
     * factory meta
     */
    factoryMeta?: FactoryMeta | undefined;
    /**
     * resolve options
     */
    resolveOptions?: ResolveOptions | undefined;
    parserOptions?: ParserOptions | undefined;
    generatorOptions?: GeneratorOptions | undefined;
};
type UnsafeCacheData = KnownUnsafeCacheData & Record<string, EXPECTED_ANY>;
type ModuleWithRestoreFromUnsafeCache = Module & {
    restoreFromUnsafeCache?: (unsafeCacheData: UnsafeCacheData, moduleFactory: ModuleFactory, compilationParams: CompilationParams) => void;
};
type References = {
    id: ModuleId;
    modules?: Map<Module, ModuleId>;
    blocks?: (ChunkId | null)[];
};
type ModuleMemCaches = Map<Module, WeakTupleMap<EXPECTED_ANY[], EXPECTED_ANY>>;
type FactorizeModuleOptions = {
    currentProfile?: ModuleProfile | undefined;
    factory: ModuleFactory;
    dependencies: Dependency[];
    /**
     * return full ModuleFactoryResult instead of only module
     */
    factoryResult?: boolean | undefined;
    originModule: Module | null;
    contextInfo?: Partial<ModuleFactoryCreateDataContextInfo> | undefined;
    context?: string | undefined;
};
import LazySet = require("./util/LazySet");
import ModuleTemplate = require("./ModuleTemplate");
import WeakTupleMap = require("./util/WeakTupleMap");
import ModuleProfile = require("./ModuleProfile");
