export = Compiler;
declare class Compiler {
    /**
     * @param {string} context the compilation path
     * @param {WebpackOptions} options options
     */
    constructor(context: string, options?: WebpackOptions);
    hooks: Readonly<{
        /** @type {SyncHook<[]>} */
        initialize: SyncHook<[]>;
        /** @type {SyncBailHook<[Compilation], boolean | void>} */
        shouldEmit: SyncBailHook<[Compilation], boolean | void>;
        /** @type {AsyncSeriesHook<[Stats]>} */
        done: AsyncSeriesHook<[Stats]>;
        /** @type {SyncHook<[Stats]>} */
        afterDone: SyncHook<[Stats]>;
        /** @type {AsyncSeriesHook<[]>} */
        additionalPass: AsyncSeriesHook<[]>;
        /** @type {AsyncSeriesHook<[Compiler]>} */
        beforeRun: AsyncSeriesHook<[Compiler]>;
        /** @type {AsyncSeriesHook<[Compiler]>} */
        run: AsyncSeriesHook<[Compiler]>;
        /** @type {AsyncSeriesHook<[Compilation]>} */
        emit: AsyncSeriesHook<[Compilation]>;
        /** @type {AsyncSeriesHook<[string, AssetEmittedInfo]>} */
        assetEmitted: AsyncSeriesHook<[string, AssetEmittedInfo]>;
        /** @type {AsyncSeriesHook<[Compilation]>} */
        afterEmit: AsyncSeriesHook<[Compilation]>;
        /** @type {SyncHook<[Compilation, CompilationParams]>} */
        thisCompilation: SyncHook<[Compilation, CompilationParams]>;
        /** @type {SyncHook<[Compilation, CompilationParams]>} */
        compilation: SyncHook<[Compilation, CompilationParams]>;
        /** @type {SyncHook<[NormalModuleFactory]>} */
        normalModuleFactory: SyncHook<[NormalModuleFactory]>;
        /** @type {SyncHook<[ContextModuleFactory]>}  */
        contextModuleFactory: SyncHook<[ContextModuleFactory]>;
        /** @type {AsyncSeriesHook<[CompilationParams]>} */
        beforeCompile: AsyncSeriesHook<[CompilationParams]>;
        /** @type {SyncHook<[CompilationParams]>} */
        compile: SyncHook<[CompilationParams]>;
        /** @type {AsyncParallelHook<[Compilation]>} */
        make: AsyncParallelHook<[Compilation]>;
        /** @type {AsyncParallelHook<[Compilation]>} */
        finishMake: AsyncParallelHook<[Compilation]>;
        /** @type {AsyncSeriesHook<[Compilation]>} */
        afterCompile: AsyncSeriesHook<[Compilation]>;
        /** @type {AsyncSeriesHook<[]>} */
        readRecords: AsyncSeriesHook<[]>;
        /** @type {AsyncSeriesHook<[]>} */
        emitRecords: AsyncSeriesHook<[]>;
        /** @type {AsyncSeriesHook<[Compiler]>} */
        watchRun: AsyncSeriesHook<[Compiler]>;
        /** @type {SyncHook<[Error]>} */
        failed: SyncHook<[Error]>;
        /** @type {SyncHook<[string | null, number]>} */
        invalid: SyncHook<[string | null, number]>;
        /** @type {SyncHook<[]>} */
        watchClose: SyncHook<[]>;
        /** @type {AsyncSeriesHook<[]>} */
        shutdown: AsyncSeriesHook<[]>;
        /** @type {SyncBailHook<[string, string, EXPECTED_ANY[] | undefined], true | void>} */
        infrastructureLog: SyncBailHook<[string, string, EXPECTED_ANY[] | undefined], true | void>;
        /** @type {SyncHook<[]>} */
        environment: SyncHook<[]>;
        /** @type {SyncHook<[]>} */
        afterEnvironment: SyncHook<[]>;
        /** @type {SyncHook<[Compiler]>} */
        afterPlugins: SyncHook<[Compiler]>;
        /** @type {SyncHook<[Compiler]>} */
        afterResolvers: SyncHook<[Compiler]>;
        /** @type {SyncBailHook<[string, Entry], boolean | void>} */
        entryOption: SyncBailHook<[string, Entry], boolean | void>;
    }>;
    webpack: {
        /**
         * @overload
         * @param {WebpackOptions} options options object
         * @param {Callback<Stats>} callback callback
         * @returns {Compiler | null} the compiler object
         */
        (options: import("./webpack").WebpackOptions, callback: import("./webpack").Callback<import("./webpack").Stats>): Compiler | null;
        /**
         * @overload
         * @param {WebpackOptions} options options object
         * @returns {Compiler} the compiler object
         */
        (options: import("./webpack").WebpackOptions): Compiler;
        /**
         * @overload
         * @param {MultiWebpackOptions} options options objects
         * @param {Callback<MultiStats>} callback callback
         * @returns {MultiCompiler | null} the multi compiler object
         */
        (options: import("./webpack").MultiWebpackOptions, callback: import("./webpack").Callback<import("./webpack").MultiStats>): import("./MultiCompiler") | null;
        /**
         * @overload
         * @param {MultiWebpackOptions} options options objects
         * @returns {MultiCompiler} the multi compiler object
         */
        (options: import("./webpack").MultiWebpackOptions): import("./MultiCompiler");
    } & {
        readonly webpack: {
            /**
             * @overload
             * @param {WebpackOptions} options options object
             * @param {Callback<Stats>} callback callback
             * @returns {Compiler | null} the compiler object
             */
            (options: import("./webpack").WebpackOptions, callback: import("./webpack").Callback<import("./webpack").Stats>): Compiler | null;
            /**
             * @overload
             * @param {WebpackOptions} options options object
             * @returns {Compiler} the compiler object
             */
            (options: import("./webpack").WebpackOptions): Compiler;
            /**
             * @overload
             * @param {MultiWebpackOptions} options options objects
             * @param {Callback<MultiStats>} callback callback
             * @returns {MultiCompiler | null} the multi compiler object
             */
            (options: import("./webpack").MultiWebpackOptions, callback: import("./webpack").Callback<import("./webpack").MultiStats>): import("./MultiCompiler") | null;
            /**
             * @overload
             * @param {MultiWebpackOptions} options options objects
             * @returns {MultiCompiler} the multi compiler object
             */
            (options: import("./webpack").MultiWebpackOptions): import("./MultiCompiler");
        };
        readonly validate: (configuration: Configuration | MultiConfiguration) => void;
        readonly validateSchema: (schema: Parameters<typeof import("schema-utils").validate>[0], options: Parameters<typeof import("schema-utils").validate>[1], validationConfiguration?: Parameters<typeof import("schema-utils").validate>[2] | undefined) => void;
        readonly version: string;
        readonly cli: typeof import("./cli");
        readonly AutomaticPrefetchPlugin: typeof import("./AutomaticPrefetchPlugin");
        readonly AsyncDependenciesBlock: typeof import("./AsyncDependenciesBlock");
        readonly BannerPlugin: typeof import("./BannerPlugin");
        readonly Cache: typeof Cache;
        readonly Chunk: typeof import("./Chunk");
        readonly ChunkGraph: typeof ChunkGraph;
        readonly CleanPlugin: typeof import("./CleanPlugin");
        readonly Compilation: typeof Compilation;
        readonly Compiler: typeof Compiler;
        readonly ConcatenationScope: typeof import("./ConcatenationScope");
        readonly ContextExclusionPlugin: typeof import("./ContextExclusionPlugin");
        readonly ContextReplacementPlugin: typeof import("./ContextReplacementPlugin");
        readonly DefinePlugin: typeof import("./DefinePlugin");
        readonly DelegatedPlugin: typeof import("./DelegatedPlugin");
        readonly Dependency: typeof import("./Dependency");
        readonly DllPlugin: typeof import("./DllPlugin");
        readonly DllReferencePlugin: typeof import("./DllReferencePlugin");
        readonly DynamicEntryPlugin: typeof import("./DynamicEntryPlugin");
        readonly DotenvPlugin: typeof import("./DotenvPlugin");
        readonly EntryOptionPlugin: typeof import("./EntryOptionPlugin");
        readonly EntryPlugin: typeof import("./EntryPlugin");
        readonly EnvironmentPlugin: typeof import("./EnvironmentPlugin");
        readonly EvalDevToolModulePlugin: typeof import("./EvalDevToolModulePlugin");
        readonly EvalSourceMapDevToolPlugin: typeof import("./EvalSourceMapDevToolPlugin");
        readonly ExternalModule: typeof import("./ExternalModule");
        readonly ExternalsPlugin: typeof import("./ExternalsPlugin");
        readonly Generator: typeof import("./Generator");
        readonly HotUpdateChunk: typeof import("./HotUpdateChunk");
        readonly HotModuleReplacementPlugin: typeof import("./HotModuleReplacementPlugin");
        readonly InitFragment: typeof import("./InitFragment");
        readonly IgnorePlugin: typeof import("./IgnorePlugin");
        readonly JavascriptModulesPlugin: typeof import("./javascript/JavascriptModulesPlugin");
        readonly LibManifestPlugin: typeof import("./LibManifestPlugin");
        readonly LibraryTemplatePlugin: typeof import("./LibraryTemplatePlugin");
        readonly LoaderOptionsPlugin: typeof import("./LoaderOptionsPlugin");
        readonly LoaderTargetPlugin: typeof import("./LoaderTargetPlugin");
        readonly Module: typeof import("./Module");
        readonly ModuleFactory: typeof import("./ModuleFactory");
        readonly ModuleFilenameHelpers: typeof import("./ModuleFilenameHelpers");
        readonly ModuleGraph: typeof ModuleGraph;
        readonly ModuleGraphConnection: typeof ModuleGraph.ModuleGraphConnection;
        readonly NoEmitOnErrorsPlugin: typeof import("./NoEmitOnErrorsPlugin");
        readonly NormalModule: typeof import("./NormalModule");
        readonly NormalModuleReplacementPlugin: typeof import("./NormalModuleReplacementPlugin");
        readonly MultiCompiler: typeof import("./MultiCompiler");
        readonly OptimizationStages: typeof import("./OptimizationStages");
        readonly Parser: typeof import("./Parser");
        readonly PlatformPlugin: typeof import("./PlatformPlugin");
        readonly PrefetchPlugin: typeof import("./PrefetchPlugin");
        readonly ProgressPlugin: typeof import("./ProgressPlugin");
        readonly ProvidePlugin: typeof import("./ProvidePlugin");
        readonly RuntimeGlobals: typeof import("./RuntimeGlobals");
        readonly RuntimeModule: typeof import("./RuntimeModule");
        readonly SingleEntryPlugin: typeof import("./EntryPlugin");
        readonly SourceMapDevToolPlugin: typeof import("./SourceMapDevToolPlugin");
        readonly Stats: typeof Stats;
        readonly ManifestPlugin: typeof import("./ManifestPlugin");
        readonly Template: typeof import("./Template");
        readonly UsageState: Readonly<{
            Unused: 0;
            OnlyPropertiesUsed: 1;
            NoInfo: 2;
            Unknown: 3;
            Used: 4;
        }>;
        readonly WatchIgnorePlugin: typeof import("./WatchIgnorePlugin");
        readonly WebpackError: typeof WebpackError;
        readonly WebpackOptionsApply: typeof import("./WebpackOptionsApply");
        readonly WebpackOptionsDefaulter: typeof import("./WebpackOptionsDefaulter");
        readonly WebpackOptionsValidationError: typeof import("schema-utils").ValidationError;
        readonly ValidationError: typeof import("schema-utils").ValidationError;
        cache: {
            readonly MemoryCachePlugin: typeof import("./cache/MemoryCachePlugin");
        };
        config: {
            readonly getNormalizedWebpackOptions: (config: import("./config/normalization").WebpackOptions) => WebpackOptionsNormalized;
            readonly applyWebpackOptionsDefaults: (options: WebpackOptionsNormalized, compilerIndex?: number | undefined) => ResolvedOptions;
        };
        dependencies: {
            readonly ModuleDependency: typeof import("./dependencies/ModuleDependency");
            readonly HarmonyImportDependency: typeof import("./dependencies/HarmonyImportDependency");
            readonly ConstDependency: typeof import("./dependencies/ConstDependency");
            readonly NullDependency: typeof import("./dependencies/NullDependency");
        };
        ids: {
            readonly ChunkModuleIdRangePlugin: typeof import("./ids/ChunkModuleIdRangePlugin");
            readonly NaturalModuleIdsPlugin: typeof import("./ids/NaturalModuleIdsPlugin");
            readonly OccurrenceModuleIdsPlugin: typeof import("./ids/OccurrenceModuleIdsPlugin");
            readonly NamedModuleIdsPlugin: typeof import("./ids/NamedModuleIdsPlugin");
            readonly DeterministicChunkIdsPlugin: typeof import("./ids/DeterministicChunkIdsPlugin");
            readonly DeterministicModuleIdsPlugin: typeof import("./ids/DeterministicModuleIdsPlugin");
            readonly NamedChunkIdsPlugin: typeof import("./ids/NamedChunkIdsPlugin");
            readonly OccurrenceChunkIdsPlugin: typeof import("./ids/OccurrenceChunkIdsPlugin");
            readonly HashedModuleIdsPlugin: typeof import("./ids/HashedModuleIdsPlugin");
        };
        javascript: {
            readonly EnableChunkLoadingPlugin: typeof import("./javascript/EnableChunkLoadingPlugin");
            readonly JavascriptModulesPlugin: typeof import("./javascript/JavascriptModulesPlugin");
            readonly JavascriptParser: typeof import("./javascript/JavascriptParser");
        };
        optimize: {
            readonly AggressiveMergingPlugin: typeof import("./optimize/AggressiveMergingPlugin");
            readonly AggressiveSplittingPlugin: typeof import("./optimize/AggressiveSplittingPlugin");
            readonly InnerGraph: typeof import("./optimize/InnerGraph");
            readonly LimitChunkCountPlugin: typeof import("./optimize/LimitChunkCountPlugin");
            readonly MergeDuplicateChunksPlugin: typeof import("./optimize/MergeDuplicateChunksPlugin");
            readonly MinChunkSizePlugin: typeof import("./optimize/MinChunkSizePlugin");
            readonly ModuleConcatenationPlugin: typeof import("./optimize/ModuleConcatenationPlugin");
            readonly RealContentHashPlugin: typeof import("./optimize/RealContentHashPlugin");
            readonly RuntimeChunkPlugin: typeof import("./optimize/RuntimeChunkPlugin");
            readonly SideEffectsFlagPlugin: typeof import("./optimize/SideEffectsFlagPlugin");
            readonly SplitChunksPlugin: typeof import("./optimize/SplitChunksPlugin");
        };
        runtime: {
            readonly GetChunkFilenameRuntimeModule: typeof import("./runtime/GetChunkFilenameRuntimeModule");
            readonly LoadScriptRuntimeModule: typeof import("./runtime/LoadScriptRuntimeModule");
        };
        prefetch: {
            readonly ChunkPrefetchPreloadPlugin: typeof import("./prefetch/ChunkPrefetchPreloadPlugin");
        };
        web: {
            readonly FetchCompileWasmPlugin: typeof import("./web/FetchCompileWasmPlugin");
            readonly FetchCompileAsyncWasmPlugin: typeof import("./web/FetchCompileAsyncWasmPlugin");
            readonly JsonpChunkLoadingRuntimeModule: typeof import("./web/JsonpChunkLoadingRuntimeModule");
            readonly JsonpTemplatePlugin: typeof import("./web/JsonpTemplatePlugin");
            readonly CssLoadingRuntimeModule: typeof import("./css/CssLoadingRuntimeModule");
        };
        esm: {
            readonly ModuleChunkLoadingRuntimeModule: typeof import("./esm/ModuleChunkLoadingRuntimeModule");
        };
        webworker: {
            readonly WebWorkerTemplatePlugin: typeof import("./webworker/WebWorkerTemplatePlugin");
        };
        node: {
            readonly NodeEnvironmentPlugin: typeof import("./node/NodeEnvironmentPlugin");
            readonly NodeSourcePlugin: typeof import("./node/NodeSourcePlugin");
            readonly NodeTargetPlugin: typeof import("./node/NodeTargetPlugin");
            readonly NodeTemplatePlugin: typeof import("./node/NodeTemplatePlugin");
            readonly ReadFileCompileWasmPlugin: typeof import("./node/ReadFileCompileWasmPlugin");
            readonly ReadFileCompileAsyncWasmPlugin: typeof import("./node/ReadFileCompileAsyncWasmPlugin");
        };
        electron: {
            readonly ElectronTargetPlugin: typeof import("./electron/ElectronTargetPlugin");
        };
        wasm: {
            readonly AsyncWebAssemblyModulesPlugin: typeof import("./wasm-async/AsyncWebAssemblyModulesPlugin");
            readonly EnableWasmLoadingPlugin: typeof import("./wasm/EnableWasmLoadingPlugin");
        };
        css: {
            readonly CssModulesPlugin: typeof import("./css/CssModulesPlugin");
        };
        library: {
            readonly AbstractLibraryPlugin: typeof import("./library/AbstractLibraryPlugin");
            readonly EnableLibraryPlugin: typeof import("./library/EnableLibraryPlugin");
        };
        container: {
            readonly ContainerPlugin: typeof import("./container/ContainerPlugin");
            readonly ContainerReferencePlugin: typeof import("./container/ContainerReferencePlugin");
            readonly ModuleFederationPlugin: typeof import("./container/ModuleFederationPlugin");
            readonly scope: <T>(scope: string, options: ContainerOptionsFormat<T>) => Record<string, string | string[] | T>;
        };
        sharing: {
            readonly ConsumeSharedPlugin: typeof import("./sharing/ConsumeSharedPlugin");
            readonly ProvideSharedPlugin: typeof import("./sharing/ProvideSharedPlugin");
            readonly SharePlugin: typeof import("./sharing/SharePlugin");
            readonly scope: <T>(scope: string, options: ContainerOptionsFormat<T>) => Record<string, string | string[] | T>;
        };
        debug: {
            readonly ProfilingPlugin: typeof import("./debug/ProfilingPlugin");
        };
        util: {
            readonly createHash: (algorithm: HashFunction) => Hash;
            readonly comparators: typeof import("./util/comparators");
            readonly runtime: typeof import("./util/runtime");
            readonly serialization: {
                readonly register: typeof import("./serialization/ObjectMiddleware").register;
                readonly registerLoader: typeof import("./serialization/ObjectMiddleware").registerLoader;
                readonly registerNotSerializable: typeof import("./serialization/ObjectMiddleware").registerNotSerializable;
                readonly NOT_SERIALIZABLE: {};
                readonly MEASURE_START_OPERATION: MEASURE_START_OPERATION;
                readonly MEASURE_END_OPERATION: MEASURE_END_OPERATION;
                readonly buffersSerializer: import("./serialization/Serializer")<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>;
                createFileSerializer: <D, S, C>(fs: import("./util/serialization").IntermediateFileSystem, hashFunction: string | Hash) => Serializer<D, S, C>;
            };
            readonly cleverMerge: <T, O>(first: T | null | undefined, second: O | null | undefined) => (T & O) | T | O;
            readonly LazySet: typeof import("./util/LazySet");
            readonly compileBooleanMatcher: {
                (map: Record<string | number, boolean>): boolean | ((value: string) => string);
                fromLists: (positiveItems: string[], negativeItems: string[]) => (value: string) => string;
                itemsToRegexp: (itemsArr: string[]) => string;
            };
        };
        readonly sources: typeof import("webpack-sources");
        experiments: {
            schemes: {
                readonly HttpUriPlugin: typeof import("./schemes/HttpUriPlugin");
                readonly VirtualUrlPlugin: typeof import("./schemes/VirtualUrlPlugin");
            };
            ids: {
                readonly SyncModuleIdsPlugin: typeof import("./ids/SyncModuleIdsPlugin");
            };
        };
    };
    /** @type {string | undefined} */
    name: string | undefined;
    /** @type {Compilation | undefined} */
    parentCompilation: Compilation | undefined;
    /** @type {Compiler} */
    root: Compiler;
    /** @type {string} */
    outputPath: string;
    /** @type {Watching | undefined} */
    watching: Watching | undefined;
    /** @type {OutputFileSystem | null} */
    outputFileSystem: OutputFileSystem | null;
    /** @type {IntermediateFileSystem | null} */
    intermediateFileSystem: IntermediateFileSystem | null;
    /** @type {InputFileSystem | null} */
    inputFileSystem: InputFileSystem | null;
    /** @type {WatchFileSystem | null} */
    watchFileSystem: WatchFileSystem | null;
    /** @type {string | null} */
    recordsInputPath: string | null;
    /** @type {string | null} */
    recordsOutputPath: string | null;
    /** @type {Records} */
    records: Records;
    /** @type {Set<string | RegExp>} */
    managedPaths: Set<string | RegExp>;
    /** @type {Set<string | RegExp>} */
    unmanagedPaths: Set<string | RegExp>;
    /** @type {Set<string | RegExp>} */
    immutablePaths: Set<string | RegExp>;
    /** @type {ReadonlySet<string> | undefined} */
    modifiedFiles: ReadonlySet<string> | undefined;
    /** @type {ReadonlySet<string> | undefined} */
    removedFiles: ReadonlySet<string> | undefined;
    /** @type {TimeInfoEntries | undefined} */
    fileTimestamps: TimeInfoEntries | undefined;
    /** @type {TimeInfoEntries | undefined} */
    contextTimestamps: TimeInfoEntries | undefined;
    /** @type {number | undefined} */
    fsStartTime: number | undefined;
    /** @type {ResolverFactory} */
    resolverFactory: ResolverFactory;
    /** @type {LoggingFunction | undefined} */
    infrastructureLogger: LoggingFunction | undefined;
    /** @type {Readonly<PlatformTargetProperties>} */
    platform: Readonly<PlatformTargetProperties>;
    options: import("../declarations/WebpackOptions").WebpackOptionsNormalized;
    context: string;
    requestShortener: RequestShortener;
    cache: Cache;
    /** @type {Map<Module, ModuleMemCachesItem> | undefined} */
    moduleMemCaches: Map<Module, ModuleMemCachesItem> | undefined;
    compilerPath: string;
    /** @type {boolean} */
    running: boolean;
    /** @type {boolean} */
    idle: boolean;
    /** @type {boolean} */
    watchMode: boolean;
    _backCompat: boolean;
    /** @type {Compilation | undefined} */
    _lastCompilation: Compilation | undefined;
    /** @type {NormalModuleFactory | undefined} */
    _lastNormalModuleFactory: NormalModuleFactory | undefined;
    /**
     * @private
     * @type {WeakMap<Source, CacheEntry>}
     */
    private _assetEmittingSourceCache;
    /**
     * @private
     * @type {Map<string, number>}
     */
    private _assetEmittingWrittenFiles;
    /**
     * @private
     * @type {Set<string>}
     */
    private _assetEmittingPreviousFiles;
    /**
     * @param {string} name cache name
     * @returns {CacheFacade} the cache facade instance
     */
    getCache(name: string): CacheFacade;
    /**
     * @param {string | (() => string)} name name of the logger, or function called once to get the logger name
     * @returns {Logger} a logger with that name
     */
    getInfrastructureLogger(name: string | (() => string)): Logger;
    _cleanupLastCompilation(): void;
    _cleanupLastNormalModuleFactory(): void;
    /**
     * @param {WatchOptions} watchOptions the watcher's options
     * @param {Callback<Stats>} handler signals when the call finishes
     * @returns {Watching | undefined} a compiler watcher
     */
    watch(watchOptions: WatchOptions, handler: Callback<Stats>): Watching | undefined;
    /**
     * @param {Callback<Stats>} callback signals when the call finishes
     * @returns {void}
     */
    run(callback: Callback<Stats>): void;
    /**
     * @param {RunAsChildCallback} callback signals when the call finishes
     * @returns {void}
     */
    runAsChild(callback: RunAsChildCallback): void;
    purgeInputFileSystem(): void;
    /**
     * @param {Compilation} compilation the compilation
     * @param {ErrorCallback} callback signals when the assets are emitted
     * @returns {void}
     */
    emitAssets(compilation: Compilation, callback: ErrorCallback): void;
    /**
     * @param {ErrorCallback} callback signals when the call finishes
     * @returns {void}
     */
    emitRecords(callback: ErrorCallback): void;
    /**
     * @param {ErrorCallback} callback signals when the call finishes
     * @returns {void}
     */
    _emitRecords(callback: ErrorCallback): void;
    /**
     * @param {ErrorCallback} callback signals when the call finishes
     * @returns {void}
     */
    readRecords(callback: ErrorCallback): void;
    /**
     * @param {ErrorCallback} callback signals when the call finishes
     * @returns {void}
     */
    _readRecords(callback: ErrorCallback): void;
    /**
     * @param {Compilation} compilation the compilation
     * @param {string} compilerName the compiler's name
     * @param {number} compilerIndex the compiler's index
     * @param {Partial<OutputOptions>=} outputOptions the output options
     * @param {Plugins=} plugins the plugins to apply
     * @returns {Compiler} a child compiler
     */
    createChildCompiler(compilation: Compilation, compilerName: string, compilerIndex: number, outputOptions?: Partial<OutputOptions> | undefined, plugins?: Plugins | undefined): Compiler;
    isChild(): boolean;
    /**
     * @param {CompilationParams} params the compilation parameters
     * @returns {Compilation} compilation
     */
    createCompilation(params: CompilationParams): Compilation;
    /**
     * @param {CompilationParams} params the compilation parameters
     * @returns {Compilation} the created compilation
     */
    newCompilation(params: CompilationParams): Compilation;
    createNormalModuleFactory(): NormalModuleFactory;
    createContextModuleFactory(): ContextModuleFactory;
    newCompilationParams(): {
        normalModuleFactory: NormalModuleFactory;
        contextModuleFactory: ContextModuleFactory;
    };
    /**
     * @param {Callback<Compilation>} callback signals when the compilation finishes
     * @returns {void}
     */
    compile(callback: Callback<Compilation>): void;
    /**
     * @param {ErrorCallback} callback signals when the compiler closes
     * @returns {void}
     */
    close(callback: ErrorCallback): void;
}
declare namespace Compiler {
    export { Source, Entry, OutputOptions, WatchOptions, WebpackOptions, Plugins, WebpackPluginFunction, Chunk, Dependency, ChunkHashes, ChunkModuleHashes, ChunkModuleIds, ChunkRuntime, FullHashChunkModuleHashes, HotIndex, Module, BuildInfo, RecordsChunks, RecordsModules, PlatformTargetProperties, LoggingFunction, SplitData, IStats, InputFileSystem, IntermediateFileSystem, OutputFileSystem, TimeInfoEntries, WatchFileSystem, CompilationParams, Callback, ErrorCallback, RunAsChildCallback, KnownRecords, Records, AssetEmittedInfo, CacheEntry, SimilarEntry, WeakReferences, MemCache, ModuleMemCachesItem };
}
import { SyncHook } from "tapable";
import { SyncBailHook } from "tapable";
import Compilation = require("./Compilation");
import { AsyncSeriesHook } from "tapable";
import Stats = require("./Stats");
import NormalModuleFactory = require("./NormalModuleFactory");
import ContextModuleFactory = require("./ContextModuleFactory");
import { AsyncParallelHook } from "tapable";
import webpack = require(".");
import Cache = require("./Cache");
import ChunkGraph = require("./ChunkGraph");
import ModuleGraph = require("./ModuleGraph");
import WebpackError = require("./WebpackError");
import Watching = require("./Watching");
import ResolverFactory = require("./ResolverFactory");
import RequestShortener = require("./RequestShortener");
import CacheFacade = require("./CacheFacade");
import { Logger } from "./logging/Logger";
type Source = import("webpack-sources").Source;
type Entry = import("../declarations/WebpackOptions").EntryNormalized;
type OutputOptions = import("../declarations/WebpackOptions").OutputNormalized;
type WatchOptions = import("../declarations/WebpackOptions").WatchOptions;
type WebpackOptions = import("../declarations/WebpackOptions").WebpackOptionsNormalized;
type Plugins = import("../declarations/WebpackOptions").Plugins;
type WebpackPluginFunction = import("../declarations/WebpackOptions").WebpackPluginFunction;
type Chunk = import("./Chunk");
type Dependency = import("./Dependency");
type ChunkHashes = import("./HotModuleReplacementPlugin").ChunkHashes;
type ChunkModuleHashes = import("./HotModuleReplacementPlugin").ChunkModuleHashes;
type ChunkModuleIds = import("./HotModuleReplacementPlugin").ChunkModuleIds;
type ChunkRuntime = import("./HotModuleReplacementPlugin").ChunkRuntime;
type FullHashChunkModuleHashes = import("./HotModuleReplacementPlugin").FullHashChunkModuleHashes;
type HotIndex = import("./HotModuleReplacementPlugin").HotIndex;
type Module = import("./Module");
type BuildInfo = import("./Module").BuildInfo;
type RecordsChunks = import("./RecordIdsPlugin").RecordsChunks;
type RecordsModules = import("./RecordIdsPlugin").RecordsModules;
type PlatformTargetProperties = import("./config/target").PlatformTargetProperties;
type LoggingFunction = import("./logging/createConsoleLogger").LoggingFunction;
type SplitData = import("./optimize/AggressiveSplittingPlugin").SplitData;
type IStats = import("./util/fs").IStats;
type InputFileSystem = import("./util/fs").InputFileSystem;
type IntermediateFileSystem = import("./util/fs").IntermediateFileSystem;
type OutputFileSystem = import("./util/fs").OutputFileSystem;
type TimeInfoEntries = import("./util/fs").TimeInfoEntries;
type WatchFileSystem = import("./util/fs").WatchFileSystem;
type CompilationParams = {
    normalModuleFactory: NormalModuleFactory;
    contextModuleFactory: ContextModuleFactory;
};
type Callback<T, R = void> = import("./webpack").Callback<T, R>;
type ErrorCallback = import("./webpack").ErrorCallback;
type RunAsChildCallback = (err: Error | null, entries?: Chunk[] | undefined, compilation?: Compilation | undefined) => void;
type KnownRecords = {
    aggressiveSplits?: SplitData[] | undefined;
    chunks?: RecordsChunks | undefined;
    modules?: RecordsModules | undefined;
    hash?: string | undefined;
    hotIndex?: HotIndex | undefined;
    fullHashChunkModuleHashes?: FullHashChunkModuleHashes | undefined;
    chunkModuleHashes?: ChunkModuleHashes | undefined;
    chunkHashes?: ChunkHashes | undefined;
    chunkRuntime?: ChunkRuntime | undefined;
    chunkModuleIds?: ChunkModuleIds | undefined;
};
type Records = KnownRecords & Record<string, KnownRecords[]> & Record<string, EXPECTED_ANY>;
type AssetEmittedInfo = {
    content: Buffer;
    source: Source;
    compilation: Compilation;
    outputPath: string;
    targetPath: string;
};
type CacheEntry = {
    sizeOnlySource: SizeOnlySource | undefined;
    writtenTo: Map<string, number>;
};
type SimilarEntry = {
    path: string;
    source: Source;
    size: number | undefined;
    waiting: ({
        cacheEntry: CacheEntry;
        file: string;
    }[] | undefined);
};
type WeakReferences = WeakMap<Dependency, Module>;
type MemCache = import("./util/WeakTupleMap")<EXPECTED_ANY[], EXPECTED_ANY>;
type ModuleMemCachesItem = {
    buildInfo: BuildInfo;
    references: WeakReferences | undefined;
    memCache: MemCache;
};
import { SizeOnlySource } from "webpack-sources";
