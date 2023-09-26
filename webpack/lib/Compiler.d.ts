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
        /** @type {SyncBailHook<[Compilation], boolean | undefined>} */
        shouldEmit: SyncBailHook<[Compilation], boolean | undefined>;
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
        /** @type {SyncBailHook<[string, string, any[]], true>} */
        infrastructureLog: SyncBailHook<[string, string, any[]], true>;
        /** @type {SyncHook<[]>} */
        environment: SyncHook<[]>;
        /** @type {SyncHook<[]>} */
        afterEnvironment: SyncHook<[]>;
        /** @type {SyncHook<[Compiler]>} */
        afterPlugins: SyncHook<[Compiler]>;
        /** @type {SyncHook<[Compiler]>} */
        afterResolvers: SyncHook<[Compiler]>;
        /** @type {SyncBailHook<[string, Entry], boolean>} */
        entryOption: SyncBailHook<[string, Entry], boolean>;
    }>;
    webpack: import("./webpack").WebpackFunctionSingle & import("./webpack").WebpackFunctionMulti & {
        readonly webpack: import("./webpack").WebpackFunctionSingle & import("./webpack").WebpackFunctionMulti;
        readonly validate: (options: any) => void;
        readonly validateSchema: (schema: import("schema-utils/declarations/validate").Schema, options: object | object[], validationConfiguration?: import("schema-utils/declarations/validate").ValidationErrorConfiguration) => void;
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
        readonly IgnorePlugin: typeof import("./IgnorePlugin");
        readonly JavascriptModulesPlugin: typeof import("./javascript/JavascriptModulesPlugin");
        readonly LibManifestPlugin: typeof import("./LibManifestPlugin");
        readonly LibraryTemplatePlugin: typeof import("./LibraryTemplatePlugin");
        readonly LoaderOptionsPlugin: typeof import("./LoaderOptionsPlugin");
        readonly LoaderTargetPlugin: typeof import("./LoaderTargetPlugin");
        readonly Module: typeof import("./Module");
        readonly ModuleFilenameHelpers: typeof import("./ModuleFilenameHelpers");
        readonly ModuleGraph: typeof ModuleGraph;
        readonly ModuleGraphConnection: typeof ModuleGraph.ModuleGraphConnection;
        readonly NoEmitOnErrorsPlugin: typeof import("./NoEmitOnErrorsPlugin");
        readonly NormalModule: typeof import("./NormalModule");
        readonly NormalModuleReplacementPlugin: typeof import("./NormalModuleReplacementPlugin");
        readonly MultiCompiler: typeof import("./MultiCompiler");
        readonly Parser: typeof import("./Parser");
        readonly PrefetchPlugin: typeof import("./PrefetchPlugin");
        readonly ProgressPlugin: typeof import("./ProgressPlugin");
        readonly ProvidePlugin: typeof import("./ProvidePlugin");
        readonly RuntimeGlobals: typeof import("./RuntimeGlobals");
        readonly RuntimeModule: typeof import("./RuntimeModule");
        readonly SingleEntryPlugin: typeof import("./EntryPlugin");
        readonly SourceMapDevToolPlugin: typeof import("./SourceMapDevToolPlugin");
        readonly Stats: typeof Stats;
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
        readonly WebpackOptionsValidationError: typeof import("schema-utils/declarations/ValidationError").default;
        readonly ValidationError: typeof import("schema-utils/declarations/ValidationError").default;
        cache: {
            readonly MemoryCachePlugin: typeof import("./cache/MemoryCachePlugin");
        };
        config: {
            readonly getNormalizedWebpackOptions: (config: import("../declarations/WebpackOptions").WebpackOptions) => import("../declarations/WebpackOptions").WebpackOptionsNormalized;
            readonly applyWebpackOptionsDefaults: (options: import("../declarations/WebpackOptions").WebpackOptionsNormalized) => void;
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
            readonly FetchCompileAsyncWasmPlugin: typeof import("./web/FetchCompileAsyncWasmPlugin");
            readonly FetchCompileWasmPlugin: typeof import("./web/FetchCompileWasmPlugin");
            readonly JsonpChunkLoadingRuntimeModule: typeof import("./web/JsonpChunkLoadingRuntimeModule");
            readonly JsonpTemplatePlugin: typeof import("./web/JsonpTemplatePlugin");
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
        };
        electron: {
            readonly ElectronTargetPlugin: typeof import("./electron/ElectronTargetPlugin");
        };
        wasm: {
            readonly AsyncWebAssemblyModulesPlugin: typeof import("./wasm-async/AsyncWebAssemblyModulesPlugin");
            readonly EnableWasmLoadingPlugin: typeof import("./wasm/EnableWasmLoadingPlugin");
        };
        library: {
            readonly AbstractLibraryPlugin: typeof import("./library/AbstractLibraryPlugin");
            readonly EnableLibraryPlugin: typeof import("./library/EnableLibraryPlugin");
        };
        container: {
            readonly ContainerPlugin: typeof import("./container/ContainerPlugin");
            readonly ContainerReferencePlugin: typeof import("./container/ContainerReferencePlugin");
            readonly ModuleFederationPlugin: typeof import("./container/ModuleFederationPlugin");
            readonly scope: <T>(scope: string, options: import("./container/options").ContainerOptionsFormat<T>) => Record<string, string | string[] | T>;
        };
        sharing: {
            readonly ConsumeSharedPlugin: typeof import("./sharing/ConsumeSharedPlugin");
            readonly ProvideSharedPlugin: typeof import("./sharing/ProvideSharedPlugin");
            readonly SharePlugin: typeof import("./sharing/SharePlugin");
            readonly scope: <T>(scope: string, options: import("./container/options").ContainerOptionsFormat<T>) => Record<string, string | string[] | T>;
        };
        debug: {
            readonly ProfilingPlugin: typeof import("./debug/ProfilingPlugin");
        };
        util: {
            readonly createHash: (algorithm: string | typeof import("./util/Hash")) => import("./util/Hash");
            readonly comparators: typeof import("./util/comparators");
            readonly runtime: typeof import("./util/runtime");
            readonly serialization: {
                readonly register: typeof import("./serialization/ObjectMiddleware").register;
                readonly registerLoader: typeof import("./serialization/ObjectMiddleware").registerLoader;
                readonly registerNotSerializable: typeof import("./serialization/ObjectMiddleware").registerNotSerializable;
                readonly NOT_SERIALIZABLE: {};
                readonly MEASURE_START_OPERATION: unique symbol;
                readonly MEASURE_END_OPERATION: unique symbol;
                readonly buffersSerializer: import("./serialization/Serializer");
                createFileSerializer: (fs: import("./util/fs").IntermediateFileSystem, hashFunction: string | typeof import("./util/Hash")) => import("./serialization/Serializer");
            };
            readonly cleverMerge: <T_1, O>(first: T_1, second: O) => T_1 | O | (T_1 & O);
            readonly LazySet: typeof import("./util/LazySet");
        };
        readonly sources: any;
        experiments: {
            schemes: {
                readonly HttpUriPlugin: typeof import("./schemes/HttpUriPlugin");
            };
            ids: {
                readonly SyncModuleIdsPlugin: typeof import("./ids/SyncModuleIdsPlugin");
            };
        };
    };
    /** @type {string=} */
    name: string | undefined;
    /** @type {Compilation=} */
    parentCompilation: Compilation | undefined;
    /** @type {Compiler} */
    root: Compiler;
    /** @type {string} */
    outputPath: string;
    /** @type {Watching | undefined} */
    watching: Watching | undefined;
    /** @type {OutputFileSystem} */
    outputFileSystem: OutputFileSystem;
    /** @type {IntermediateFileSystem} */
    intermediateFileSystem: IntermediateFileSystem;
    /** @type {InputFileSystem} */
    inputFileSystem: InputFileSystem;
    /** @type {WatchFileSystem} */
    watchFileSystem: WatchFileSystem;
    /** @type {string|null} */
    recordsInputPath: string | null;
    /** @type {string|null} */
    recordsOutputPath: string | null;
    records: {};
    /** @type {Set<string | RegExp>} */
    managedPaths: Set<string | RegExp>;
    /** @type {Set<string | RegExp>} */
    immutablePaths: Set<string | RegExp>;
    /** @type {ReadonlySet<string> | undefined} */
    modifiedFiles: ReadonlySet<string> | undefined;
    /** @type {ReadonlySet<string> | undefined} */
    removedFiles: ReadonlySet<string> | undefined;
    /** @type {ReadonlyMap<string, FileSystemInfoEntry | "ignore" | null> | undefined} */
    fileTimestamps: ReadonlyMap<string, FileSystemInfoEntry | "ignore" | null> | undefined;
    /** @type {ReadonlyMap<string, FileSystemInfoEntry | "ignore" | null> | undefined} */
    contextTimestamps: ReadonlyMap<string, FileSystemInfoEntry | "ignore" | null> | undefined;
    /** @type {number | undefined} */
    fsStartTime: number | undefined;
    /** @type {ResolverFactory} */
    resolverFactory: ResolverFactory;
    infrastructureLogger: any;
    options: import("../declarations/WebpackOptions").WebpackOptionsNormalized;
    context: string;
    requestShortener: RequestShortener;
    cache: Cache;
    /** @type {Map<Module, { buildInfo: object, references: WeakMap<Dependency, Module>, memCache: WeakTupleMap }> | undefined} */
    moduleMemCaches: Map<import("./Module"), {
        buildInfo: object;
        references: WeakMap<Dependency, Module>;
        memCache: import("./util/WeakTupleMap")<any, any>;
    }>;
    compilerPath: string;
    /** @type {boolean} */
    running: boolean;
    /** @type {boolean} */
    idle: boolean;
    /** @type {boolean} */
    watchMode: boolean;
    _backCompat: boolean;
    /** @type {Compilation} */
    _lastCompilation: Compilation;
    /** @type {NormalModuleFactory} */
    _lastNormalModuleFactory: NormalModuleFactory;
    /** @private @type {WeakMap<Source, { sizeOnlySource: SizeOnlySource, writtenTo: Map<string, number> }>} */
    private _assetEmittingSourceCache;
    /** @private @type {Map<string, number>} */
    private _assetEmittingWrittenFiles;
    /** @private @type {Set<string>} */
    private _assetEmittingPreviousFiles;
    /**
     * @param {string} name cache name
     * @returns {CacheFacade} the cache facade instance
     */
    getCache(name: string): CacheFacade;
    /**
     * @param {string | (function(): string)} name name of the logger, or function called once to get the logger name
     * @returns {Logger} a logger with that name
     */
    getInfrastructureLogger(name: string | (() => string)): Logger;
    _cleanupLastCompilation(): void;
    _cleanupLastNormalModuleFactory(): void;
    /**
     * @param {WatchOptions} watchOptions the watcher's options
     * @param {Callback<Stats>} handler signals when the call finishes
     * @returns {Watching} a compiler watcher
     */
    watch(watchOptions: WatchOptions, handler: Callback<Stats>): Watching;
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
     * @param {Callback<void>} callback signals when the assets are emitted
     * @returns {void}
     */
    emitAssets(compilation: Compilation, callback: Callback<void>): void;
    /**
     * @param {Callback<void>} callback signals when the call finishes
     * @returns {void}
     */
    emitRecords(callback: Callback<void>): void;
    /**
     * @param {Callback<void>} callback signals when the call finishes
     * @returns {void}
     */
    _emitRecords(callback: Callback<void>): void;
    /**
     * @param {Callback<void>} callback signals when the call finishes
     * @returns {void}
     */
    readRecords(callback: Callback<void>): void;
    /**
     * @param {Callback<void>} callback signals when the call finishes
     * @returns {void}
     */
    _readRecords(callback: Callback<void>): void;
    /**
     * @param {Compilation} compilation the compilation
     * @param {string} compilerName the compiler's name
     * @param {number} compilerIndex the compiler's index
     * @param {OutputOptions=} outputOptions the output options
     * @param {WebpackPluginInstance[]=} plugins the plugins to apply
     * @returns {Compiler} a child compiler
     */
    createChildCompiler(compilation: Compilation, compilerName: string, compilerIndex: number, outputOptions?: OutputOptions | undefined, plugins?: WebpackPluginInstance[] | undefined): Compiler;
    isChild(): boolean;
    createCompilation(params: any): Compilation;
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
     * @param {Callback<void>} callback signals when the compiler closes
     * @returns {void}
     */
    close(callback: Callback<void>): void;
}
declare namespace Compiler {
    export { Source, Entry, OutputOptions, WatchOptions, WebpackOptions, WebpackPluginInstance, Chunk, Dependency, FileSystemInfoEntry, Module, WeakTupleMap, InputFileSystem, IntermediateFileSystem, OutputFileSystem, WatchFileSystem, CompilationParams, Callback, RunAsChildCallback, AssetEmittedInfo };
}
import { SyncHook } from "tapable";
import { SyncBailHook } from "tapable";
import Compilation = require("./Compilation");
import { AsyncSeriesHook } from "tapable";
import Stats = require("./Stats");
type AssetEmittedInfo = {
    content: Buffer;
    source: any;
    compilation: Compilation;
    outputPath: string;
    targetPath: string;
};
type CompilationParams = {
    normalModuleFactory: NormalModuleFactory;
    contextModuleFactory: ContextModuleFactory;
};
import NormalModuleFactory = require("./NormalModuleFactory");
import ContextModuleFactory = require("./ContextModuleFactory");
import { AsyncParallelHook } from "tapable";
type Entry = import("../declarations/WebpackOptions").EntryNormalized;
import Cache = require("./Cache");
import ChunkGraph = require("./ChunkGraph");
import ModuleGraph = require("./ModuleGraph");
import WebpackError = require("./WebpackError");
import Watching = require("./Watching");
type OutputFileSystem = import("./util/fs").OutputFileSystem;
type IntermediateFileSystem = import("./util/fs").IntermediateFileSystem;
type InputFileSystem = import("./util/fs").InputFileSystem;
type WatchFileSystem = import("./util/fs").WatchFileSystem;
type FileSystemInfoEntry = import("./FileSystemInfo").FileSystemInfoEntry;
import ResolverFactory = require("./ResolverFactory");
import RequestShortener = require("./RequestShortener");
type Dependency = import("./Dependency");
type Module = import("./Module");
import CacheFacade = require("./CacheFacade");
import { Logger } from "./logging/Logger";
type WatchOptions = import("../declarations/WebpackOptions").WatchOptions;
type Callback<T> = (err?: (Error | null) | undefined, result?: T | undefined) => any;
type RunAsChildCallback = (err?: (Error | null) | undefined, entries?: Chunk[] | undefined, compilation?: Compilation | undefined) => any;
type OutputOptions = import("../declarations/WebpackOptions").OutputNormalized;
type WebpackPluginInstance = import("../declarations/WebpackOptions").WebpackPluginInstance;
type WebpackOptions = import("../declarations/WebpackOptions").WebpackOptionsNormalized;
type Source = any;
type Chunk = import("./Chunk");
type WeakTupleMap = import("./util/WeakTupleMap")<any, any>;
