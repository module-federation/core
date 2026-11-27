export = Compiler;
declare class Compiler {
    /**
     * Creates an instance of Compiler.
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
        /**
         * @type {AsyncSeriesHook<[]>}
         * @since 5.67.0
         */
        readRecords: AsyncSeriesHook<[]>;
        /**
         * @type {AsyncSeriesHook<[]>}
         * @since 5.67.0
         */
        emitRecords: AsyncSeriesHook<[]>;
        /** @type {AsyncSeriesHook<[Compiler]>} */
        watchRun: AsyncSeriesHook<[Compiler]>;
        /** @type {SyncHook<[Error]>} */
        failed: SyncHook<[Error]>;
        /** @type {SyncHook<[string | null, number]>} */
        invalid: SyncHook<[string | null, number]>;
        /** @type {SyncHook<[]>} */
        watchClose: SyncHook<[]>;
        /**
         * @type {AsyncSeriesHook<[]>}
         * @since 5.17.0
         */
        shutdown: AsyncSeriesHook<[]>;
        /** @type {SyncBailHook<[string, string, EXPECTED_ANY[] | undefined], true | void>} */
        infrastructureLog: SyncBailHook<[string, string, EXPECTED_ANY[] | undefined], true | void>;
        /**
         * @type {SyncHook<[]>}
         * @since 5.106.0
         */
        validate: SyncHook<[]>;
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
         * Returns the compiler object.
         * @overload
         * @param {WebpackOptions} options options object
         * @param {Callback<Stats>} callback callback
         * @returns {Compiler | null} the compiler object
         */
        (options: import("../declarations/WebpackOptions").WebpackOptions, callback: import("./webpack").Callback<Stats>): Compiler | null;
        /**
         * Returns the compiler object.
         * @overload
         * @param {WebpackOptions} options options object
         * @returns {Compiler} the compiler object
         */
        (options: import("../declarations/WebpackOptions").WebpackOptions): Compiler;
        /**
         * Returns the multi compiler object.
         * @overload
         * @param {MultiWebpackOptions} options options objects
         * @param {Callback<MultiStats>} callback callback
         * @returns {MultiCompiler | null} the multi compiler object
         */
        (options: import("./MultiCompiler").MultiWebpackOptions, callback: import("./webpack").Callback<import("./stats/MultiStats")>): import("./MultiCompiler") | null;
        /**
         * Returns the multi compiler object.
         * @overload
         * @param {MultiWebpackOptions} options options objects
         * @returns {MultiCompiler} the multi compiler object
         */
        (options: import("./MultiCompiler").MultiWebpackOptions): import("./MultiCompiler");
    } & {
        readonly webpack: {
            /**
             * Returns the compiler object.
             * @overload
             * @param {WebpackOptions} options options object
             * @param {Callback<Stats>} callback callback
             * @returns {Compiler | null} the compiler object
             */
            (options: import("../declarations/WebpackOptions").WebpackOptions, callback: import("./webpack").Callback<Stats>): Compiler | null;
            /**
             * Returns the compiler object.
             * @overload
             * @param {WebpackOptions} options options object
             * @returns {Compiler} the compiler object
             */
            (options: import("../declarations/WebpackOptions").WebpackOptions): Compiler;
            /**
             * Returns the multi compiler object.
             * @overload
             * @param {MultiWebpackOptions} options options objects
             * @param {Callback<MultiStats>} callback callback
             * @returns {MultiCompiler | null} the multi compiler object
             */
            (options: import("./MultiCompiler").MultiWebpackOptions, callback: import("./webpack").Callback<import("./stats/MultiStats")>): import("./MultiCompiler") | null;
            /**
             * Returns the multi compiler object.
             * @overload
             * @param {MultiWebpackOptions} options options objects
             * @returns {MultiCompiler} the multi compiler object
             */
            (options: import("./MultiCompiler").MultiWebpackOptions): import("./MultiCompiler");
        };
        readonly defineConfig: <T extends DefineConfigInput>(config: T) => T;
        readonly validate: (configuration: Configuration | MultiConfiguration) => void;
        readonly validateSchema: typeof import("./config/validateSchema");
        readonly version: string;
        readonly cli: {
            readonly getArguments: (schema?: import("./config/cli").Schema | undefined) => Flags;
            readonly processArguments: (args: Flags, config: ObjectConfiguration, values: Values) => Problem[] | null;
            readonly createColors: ({ useColor }?: ColorsOptions | undefined) => Colors;
            readonly isColorSupported: () => boolean;
        };
        readonly AutomaticPrefetchPlugin: typeof import("./prefetch/AutomaticPrefetchPlugin");
        readonly AsyncDependenciesBlock: typeof import("./graph/AsyncDependenciesBlock");
        readonly BannerPlugin: typeof import("./output/BannerPlugin");
        readonly Cache: typeof import("./cache/Cache");
        readonly Chunk: typeof Chunk;
        readonly ChunkGraph: typeof ChunkGraph;
        readonly CleanPlugin: typeof import("./output/CleanPlugin");
        readonly Compilation: typeof Compilation;
        readonly Compiler: typeof Compiler;
        readonly ConcatenationScope: typeof import("./optimize/ConcatenationScope");
        readonly ContextExclusionPlugin: typeof import("./context/ContextExclusionPlugin");
        readonly ContextReplacementPlugin: typeof import("./context/ContextReplacementPlugin");
        readonly CopyPlugin: typeof import("./output/CopyPlugin");
        readonly DefinePlugin: typeof import("./define/DefinePlugin");
        readonly Dependency: typeof Dependency;
        readonly DynamicEntryPlugin: typeof import("./entry/DynamicEntryPlugin");
        readonly DotenvPlugin: typeof import("./define/DotenvPlugin");
        readonly EntryOptionPlugin: typeof import("./entry/EntryOptionPlugin");
        readonly EntryPlugin: typeof import("./entry/EntryPlugin");
        readonly EnvironmentPlugin: typeof import("./define/EnvironmentPlugin");
        readonly EvalDevToolModulePlugin: typeof import("./devtool/EvalDevToolModulePlugin");
        readonly EvalSourceMapDevToolPlugin: typeof import("./devtool/EvalSourceMapDevToolPlugin");
        readonly ExternalModule: typeof import("./externals/ExternalModule");
        readonly ExternalsPlugin: typeof import("./externals/ExternalsPlugin");
        readonly Generator: typeof import("./module/Generator");
        readonly HotUpdateChunk: typeof import("./graph/HotUpdateChunk");
        readonly HotModuleReplacementPlugin: typeof import("./hmr/HotModuleReplacementPlugin");
        readonly InitFragment: typeof import("./template/InitFragment");
        readonly IgnorePlugin: typeof import("./resolve/IgnorePlugin");
        readonly JavascriptModulesPlugin: typeof import("./javascript/JavascriptModulesPlugin");
        readonly LibraryTemplatePlugin: typeof import("./library/LibraryTemplatePlugin");
        readonly LoaderOptionsPlugin: typeof import("./loaders/LoaderOptionsPlugin");
        readonly LoaderTargetPlugin: typeof import("./loaders/LoaderTargetPlugin");
        readonly Module: typeof Module;
        readonly ModuleFactory: typeof import("./module/ModuleFactory");
        readonly ModuleFilenameHelpers: typeof import("./devtool/ModuleFilenameHelpers");
        readonly ModuleGraph: typeof ModuleGraph;
        readonly ModuleGraphConnection: typeof import("./graph/ModuleGraphConnection");
        readonly NoEmitOnErrorsPlugin: typeof import("./diagnostics/NoEmitOnErrorsPlugin");
        readonly NormalModule: typeof import("./module/NormalModule");
        readonly NormalModuleReplacementPlugin: typeof import("./resolve/NormalModuleReplacementPlugin");
        readonly MultiCompiler: typeof import("./MultiCompiler");
        readonly OptimizationStages: typeof import("./optimize/OptimizationStages");
        readonly Parser: typeof import("./module/Parser");
        readonly PlatformPlugin: typeof import("./config/PlatformPlugin");
        readonly PrefetchPlugin: typeof import("./prefetch/PrefetchPlugin");
        readonly ProgressPlugin: typeof import("./logging/ProgressPlugin");
        readonly ProvidePlugin: typeof import("./provide/ProvidePlugin");
        readonly RuntimeGlobals: typeof import("./runtime/RuntimeGlobals");
        readonly RuntimeModule: typeof import("./runtime/RuntimeModule");
        readonly SingleEntryPlugin: typeof import("./entry/EntryPlugin");
        readonly SSRManifestPlugin: typeof import("./output/SSRManifestPlugin");
        readonly SourceMapDevToolPlugin: typeof import("./devtool/SourceMapDevToolPlugin");
        readonly Stats: typeof Stats;
        readonly ManifestPlugin: typeof import("./output/ManifestPlugin");
        readonly Template: typeof import("./template/Template");
        readonly UsageState: Readonly<{
            Unused: 0;
            OnlyPropertiesUsed: 1;
            NoInfo: 2;
            Unknown: 3;
            Used: 4;
        }>;
        readonly WatchIgnorePlugin: typeof import("./watch/WatchIgnorePlugin");
        readonly WebpackError: typeof WebpackError;
        readonly WebpackOptionsApply: typeof import("./config/WebpackOptionsApply");
        readonly WebpackOptionsDefaulter: typeof import("./config/WebpackOptionsDefaulter");
        readonly WebpackOptionsValidationError: typeof import("schema-utils").ValidationError;
        readonly ValidationError: typeof import("schema-utils").ValidationError;
        cache: {
            readonly Cache: typeof Cache;
            readonly MemoryCachePlugin: typeof import("./cache/MemoryCachePlugin");
        };
        config: {
            readonly PlatformPlugin: typeof import("./config/PlatformPlugin");
            readonly WebpackOptionsApply: typeof import("./config/WebpackOptionsApply");
            readonly defineConfig: <T extends DefineConfigInput>(config: T) => T;
            readonly validateSchema: (schema: Parameters<typeof import("schema-utils").validate>[0], options: Parameters<typeof import("schema-utils").validate>[1], validationConfiguration?: Parameters<typeof import("schema-utils").validate>[2] | undefined) => void;
            readonly getNormalizedWebpackOptions: (config: import("../declarations/WebpackOptions").WebpackOptions) => WebpackOptions;
            readonly applyWebpackOptionsDefaults: (options: WebpackOptions, compilerIndex?: number | undefined) => ResolvedOptions;
        };
        dependencies: {
            readonly ModuleDependency: typeof import("./dependencies/core/ModuleDependency");
            readonly ESMImportDependency: typeof import("./dependencies/esm/ESMImportDependency");
            readonly HarmonyImportDependency: typeof import("./dependencies/esm/ESMImportDependency");
            readonly ConstDependency: typeof import("./dependencies/core/ConstDependency");
            readonly NullDependency: typeof import("./dependencies/core/NullDependency");
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
            readonly syntax: {
                readonly parser: SyntaxParser;
                readonly printer: SyntaxPrinter;
                readonly toEstreeObject: SyntaxParser["toEstreeObject"];
            };
        };
        optimize: {
            readonly ConcatenationScope: typeof import("./optimize/ConcatenationScope");
            readonly OptimizationStages: typeof import("./optimize/OptimizationStages");
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
            readonly RuntimeGlobals: typeof import("./runtime/RuntimeGlobals");
            readonly RuntimeModule: typeof import("./runtime/RuntimeModule");
            readonly GetChunkFilenameRuntimeModule: typeof import("./runtime/GetChunkFilenameRuntimeModule");
            readonly LoadScriptRuntimeModule: typeof import("./runtime/LoadScriptRuntimeModule");
        };
        module: {
            readonly NullFactory: typeof import("./module/NullFactory");
        };
        template: {
            readonly DependencyTemplate: typeof import("./template/DependencyTemplate");
        };
        prefetch: {
            readonly AutomaticPrefetchPlugin: typeof import("./prefetch/AutomaticPrefetchPlugin");
            readonly PrefetchPlugin: typeof import("./prefetch/PrefetchPlugin");
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
        bun: {
            readonly BunTargetPlugin: typeof import("./bun/BunTargetPlugin");
        };
        deno: {
            readonly DenoTargetPlugin: typeof import("./deno/DenoTargetPlugin");
        };
        wasm: {
            readonly AsyncWebAssemblyModulesPlugin: typeof import("./wasm/AsyncWebAssemblyModulesPlugin");
            readonly EnableWasmLoadingPlugin: typeof import("./wasm/EnableWasmLoadingPlugin");
        };
        asset: {
            readonly AssetModulesPlugin: typeof import("./asset/AssetModulesPlugin");
        };
        json: {
            readonly JsonModulesPlugin: typeof import("./json/JsonModulesPlugin");
        };
        css: {
            readonly CssLoadingRuntimeModule: typeof import("./css/CssLoadingRuntimeModule");
            readonly CssModulesPlugin: typeof import("./css/CssModulesPlugin");
            readonly cssMinify: {
                (input: {
                    [file: string]: string | Buffer;
                }, sourceMap?: object | undefined, minimizerOptions?: ({
                    as?: "stylesheet" | "block-contents";
                    environment?: import("./css/syntax-parser").CssEnvironment;
                    charset?: "auto" | false;
                    convertLengthUnits?: boolean;
                    convertApproximateColors?: boolean;
                    dropOverriddenDeclarations?: boolean;
                    extractComments
                    /** @import { LoggingFunction } from "./logging/createConsoleLogger" */
                    /** @import { SplitData } from "./optimize/AggressiveSplittingPlugin" */
                    /**
                     * @import {
                     * 	IStats,
                     * 	InputFileSystem,
                     * 	IntermediateFileSystem,
                     * 	OutputFileSystem,
                     * 	TimeInfoEntries,
                     * 	WatchFileSystem
                     * } from "./fs/fs"
                     */
                    /** @import { Schema, ValidationErrorConfiguration } from "schema-utils" */
                    /**
                     * Defines the compilation params type used by this module.
                     * @typedef {object} CompilationParams
                     * @property {NormalModuleFactory} normalModuleFactory
                     * @property {ContextModuleFactory} contextModuleFactory
                     */
                    /**
                     * Defines the callback type used by this module.
                     * @template T
                     * @template [R=void]
                     * @typedef {import("./webpack").Callback<T, R>} Callback
                     */
                    /**
                     * Defines the run as child callback callback.
                     * @callback RunAsChildCallback
                     * @param {Error | null} err
                     * @param {Chunk[]=} entries
                     * @param {Compilation=} compilation
                     * @returns {void}
                     */
                    /**
                     * Defines the known records type used by this module.
                     * @typedef {object} KnownRecords
                     * @property {SplitData[]=} aggressiveSplits
                     * @property {RecordsChunks=} chunks
                     * @property {RecordsModules=} modules
                     * @property {string=} hash
                     * @property {HotIndex=} hotIndex
                     * @property {FullHashChunkModuleHashes=} fullHashChunkModuleHashes
                     * @property {ChunkModuleHashes=} chunkModuleHashes
                     * @property {ChunkHashes=} chunkHashes
                     * @property {ChunkRuntime=} chunkRuntime
                     * @property {ChunkModuleIds=} chunkModuleIds
                     */
                    /** @typedef {KnownRecords & Record<string, KnownRecords[]> & Record<string, EXPECTED_ANY>} Records */
                    /**
                     * Defines the asset emitted info type used by this module.
                     * @typedef {object} AssetEmittedInfo
                     * @property {Buffer} content
                     * @property {Source} source
                     * @property {Compilation} compilation
                     * @property {string} outputPath
                     * @property {string} targetPath
                     */
                    /** @typedef {{ sizeOnlySource: SizeOnlySource | undefined, writtenTo: Map<string, number> }} CacheEntry */
                    /** @typedef {{ path: string, source: Source, size: number | undefined, waiting: ({ cacheEntry: CacheEntry, file: string }[] | undefined) }} SimilarEntry */
                    /** @typedef {WeakMap<Dependency, Module>} WeakReferences */
                    /** @typedef {import("./util/WeakTupleMap")<EXPECTED_ANY[], EXPECTED_ANY>} MemCache */
                    /** @typedef {{ buildInfo: BuildInfo, references: WeakReferences | undefined, lazyRequests: string | undefined, memCache: MemCache }} ModuleMemCachesItem */
                    /**
                     * Checks whether this object is sorted.
                     * @template T
                     * @param {T[]} array an array
                     * @returns {boolean} true, if the array is sorted
                     */
                    ?: MinimizeExtractComments;
                    mergeDistantRules?: boolean;
                    rewriteCustomProperties?: boolean;
                    unusedSymbols?: string[];
                    pseudoClasses?: {
                        [name: string]: string;
                    };
                    renderEmbeddedSource?: AsyncEmbeddedSourceRenderer;
                    svg?: boolean;
                } & import("./css/syntax-parser").CssTransformOptions) | undefined, extractComments?: ExtractCommentsOption | undefined): Promise<{
                    code: string;
                    map?: import("./util/SourceProcessor").SourceMap;
                    extractedComments?: string[];
                    warnings?: (Error | string)[];
                    errors?: (Error | string)[];
                }>;
                supportsWorkerThreads(): boolean;
                getBannerPosition(): "end";
                getTypes(): string[];
                getEmbeddedTypes(): string[];
                filter(name: string): boolean;
            };
            readonly syntax: {
                readonly parser: SyntaxParser;
                readonly printer: SyntaxPrinter;
                SourceProcessor: {
                    new <TState = unknown>(): {
                        _grammar: import("./util/SourceProcessor").Grammar<{
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        }, import("./css/syntax-parser").Node, import("./css/syntax-parser").CssProcessOptions, import("./css/syntax-parser").CssPrintOptions>;
                        _visitors: import("./util/SourceProcessor").CompiledVisitorMap<{
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        }>;
                        _printer: import("./util/SourceProcessor").NodePrinter<{
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        }, import("./css/syntax-parser").Node, import("./css/syntax-parser").CssPrintOptions>;
                        _loadPrinter: () => import("./util/SourceProcessor").NodePrinter<{
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        }, import("./css/syntax-parser").Node, import("./css/syntax-parser").CssPrintOptions>;
                        _path: {
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        };
                        _deferred: (ctx: {
                            options: import("./util/SourceProcessor").PrintOptions & import("./css/syntax-parser").CssPrintOptions;
                            _printer: import("./util/SourceProcessor").NodePrinter<{
                                state: unknown;
                                readonly node: import("./css/syntax-parser").Node;
                                readonly parent: import("./css/syntax-parser").Node | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: import("./css/syntax-parser").Node | undefined): number;
                                range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                                start(n?: import("./css/syntax-parser").Node | undefined): number;
                                end(n?: import("./css/syntax-parser").Node | undefined): number;
                                loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                                source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                                value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                                name(n?: import("./css/syntax-parser").Node | undefined): string;
                                childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                                child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                                children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                                fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                                rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                                startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                            }, import("./css/syntax-parser").Node, import("./css/syntax-parser").CssPrintOptions>;
                            _storeText: (string | null)[];
                            _storeGen: Int32Array;
                            _sourceText: (node: import("./css/syntax-parser").Node) => string;
                            _gen: number;
                            _storeLow: number;
                            _storeHigh: number;
                            _chunks: string[];
                            _deferred: Map<number, {
                                readonly text: string;
                            }>;
                            _tail: string;
                            _tailLength: number;
                            _flattened: number;
                            mapWanted: boolean;
                            _mappings: number[];
                            _retractableMappings: number[] | null;
                            _inserts: [number, string][];
                            _insertIdx: number;
                            _pending: string[];
                            _pendingAnchor: [number | undefined, number | undefined, number | undefined] | null;
                            pushPending(text: string): number;
                            setPending(depth: number, text: string): void;
                            flushPending(): void;
                            anchorPending(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            isPending(depth: number): boolean;
                            dropPending(): void;
                            markCut(): number;
                            emitStreamed(text: string): void;
                            _growStore(need: number): void;
                            dropStore(): void;
                            _moveEpoch(): void;
                            dropTrailing(from: number, charCode: number): void;
                            replaceEnd(printed: string, text: string, closer: number): boolean;
                            printNode(node: import("./css/syntax-parser").Node, path: {
                                state: unknown;
                                readonly node: import("./css/syntax-parser").Node;
                                readonly parent: import("./css/syntax-parser").Node | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: import("./css/syntax-parser").Node | undefined): number;
                                range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                                start(n?: import("./css/syntax-parser").Node | undefined): number;
                                end(n?: import("./css/syntax-parser").Node | undefined): number;
                                loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                                source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                                value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                                name(n?: import("./css/syntax-parser").Node | undefined): string;
                                childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                                child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                                children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                                fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                                rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                                startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                            }): void;
                            printedAs(node: import("./css/syntax-parser").Node, text: string): void;
                            printedSource(node: import("./css/syntax-parser").Node, sourceText: (node: import("./css/syntax-parser").Node) => string): void;
                            printPiece(path: {
                                state: unknown;
                                readonly node: import("./css/syntax-parser").Node;
                                readonly parent: import("./css/syntax-parser").Node | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: import("./css/syntax-parser").Node | undefined): number;
                                range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                                start(n?: import("./css/syntax-parser").Node | undefined): number;
                                end(n?: import("./css/syntax-parser").Node | undefined): number;
                                loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                                source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                                value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                                name(n?: import("./css/syntax-parser").Node | undefined): string;
                                childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                                child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                                children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                                fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                                rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                                startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                            }): string;
                            get(node: import("./css/syntax-parser").Node): string;
                            _emit(text: string): void;
                            _cutTail(): void;
                            emitRetractable(text: string): number;
                            retract(index: number): void;
                            writesNonAscii(index: number): boolean;
                            foldIntoRetractable(index: number, text: string): void;
                            rewriteRetractable(index: number, text: string): void;
                            deferRetractable(index: number, source: {
                                readonly text: string;
                            }): void;
                            _settleDeferred(): void;
                            takeRetractable(node: import("./css/syntax-parser").Node, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): number;
                            take(node: import("./css/syntax-parser").Node, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): void;
                            anchor(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            hasInsertBefore(pos: number): boolean;
                            flushInsertsBefore(pos: number): void;
                            insert(pos: number, text: string): void;
                            takeInserts(start: number, end: number): string;
                            _flushBefore(pos: number): void;
                            sourceMap(options: SourceMapOptions, code?: string | undefined): SourceMap;
                            substitute(resolve: (id: number) => string | undefined, infix: string): void;
                            replaceAll(text: string): void;
                            result(): string;
                        }, build: () => {
                            code: string;
                            map: import("./util/SourceProcessor").SourceMap | undefined;
                        }) => void;
                        /**
                         * Register one bucket for several node types, as a map naming each would;
                         * its path takes only the parts those types have.
                         * @template {number} T
                         * @overload
                         * @param {T[]} types the node types the bucket visits
                         * @param {VisitorBucket<TypedNodePath<TPath, TNode, TParts, T, TState>>} bucket the visitor
                         * @returns {SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>} `this`, for chaining
                         */
                        use<T extends number>(types: T[], bucket: import("./util/SourceProcessor").VisitorBucket<import("./util/SourceProcessor").TypedNodePath<{
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        }, import("./css/syntax-parser").Node, import("./css/syntax-parser").CssParts, T, TState>>): import("./util/SourceProcessor")<{
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        }, import("./css/syntax-parser").Node, import("./css/syntax-parser").CssProcessOptions, import("./css/syntax-parser").CssPrintOptions, import("./css/syntax-parser").CssParts, TState, import("./css/syntax").CssVisitorMap<TState>>;
                        /**
                         * Register a visitor map; calls accumulate per node type, and each
                         * visitor's path takes only its type's parts.
                         * A bucket is a function (= `{ enter }`) or `{ enter?, exit? }`.
                         * @overload
                         * @param {TVisitors} map visitor map keyed by node type
                         * @returns {SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>} `this`, for chaining
                         */
                        use(map: import("./css/syntax").CssVisitorMap<TState>): import("./util/SourceProcessor")<{
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        }, import("./css/syntax-parser").Node, import("./css/syntax-parser").CssProcessOptions, import("./css/syntax-parser").CssPrintOptions, import("./css/syntax-parser").CssParts, TState, import("./css/syntax").CssVisitorMap<TState>>;
                        /**
                         * Register a visitor map built at runtime, keyed by any node type.
                         * @overload
                         * @param {VisitorMap<TPath>} map visitor map keyed by node type
                         * @returns {SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>} `this`, for chaining
                         */
                        use(map: import("./util/SourceProcessor").VisitorMap<{
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        }>): import("./util/SourceProcessor")<{
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        }, import("./css/syntax-parser").Node, import("./css/syntax-parser").CssProcessOptions, import("./css/syntax-parser").CssPrintOptions, import("./css/syntax-parser").CssParts, TState, import("./css/syntax").CssVisitorMap<TState>>;
                        _add(type: number, visitor: import("./util/SourceProcessor").VisitorBucket<{
                            state: unknown;
                            readonly node: import("./css/syntax-parser").Node;
                            readonly parent: import("./css/syntax-parser").Node | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: import("./css/syntax-parser").Node | undefined): number;
                            range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                            start(n?: import("./css/syntax-parser").Node | undefined): number;
                            end(n?: import("./css/syntax-parser").Node | undefined): number;
                            loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                            source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                            value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                            name(n?: import("./css/syntax-parser").Node | undefined): string;
                            childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                            child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                            children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                            fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                            flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                            rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                            startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                            textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                        }>): void;
                        _run(input: string, ctx: {
                            options: import("./util/SourceProcessor").PrintOptions & import("./css/syntax-parser").CssPrintOptions;
                            _printer: import("./util/SourceProcessor").NodePrinter<{
                                state: unknown;
                                readonly node: import("./css/syntax-parser").Node;
                                readonly parent: import("./css/syntax-parser").Node | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: import("./css/syntax-parser").Node | undefined): number;
                                range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                                start(n?: import("./css/syntax-parser").Node | undefined): number;
                                end(n?: import("./css/syntax-parser").Node | undefined): number;
                                loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                                source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                                value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                                name(n?: import("./css/syntax-parser").Node | undefined): string;
                                childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                                child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                                children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                                fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                                rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                                startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                            }, import("./css/syntax-parser").Node, import("./css/syntax-parser").CssPrintOptions>;
                            _storeText: (string | null)[];
                            _storeGen: Int32Array;
                            _sourceText: (node: import("./css/syntax-parser").Node) => string;
                            _gen: number;
                            _storeLow: number;
                            _storeHigh: number;
                            _chunks: string[];
                            _deferred: Map<number, {
                                readonly text: string;
                            }>;
                            _tail: string;
                            _tailLength: number;
                            _flattened: number;
                            mapWanted: boolean;
                            _mappings: number[];
                            _retractableMappings: number[] | null;
                            _inserts: [number, string][];
                            _insertIdx: number;
                            _pending: string[];
                            _pendingAnchor: [number | undefined, number | undefined, number | undefined] | null;
                            pushPending(text: string): number;
                            setPending(depth: number, text: string): void;
                            flushPending(): void;
                            anchorPending(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            isPending(depth: number): boolean;
                            dropPending(): void;
                            markCut(): number;
                            emitStreamed(text: string): void;
                            _growStore(need: number): void;
                            dropStore(): void;
                            _moveEpoch(): void;
                            dropTrailing(from: number, charCode: number): void;
                            replaceEnd(printed: string, text: string, closer: number): boolean;
                            printNode(node: import("./css/syntax-parser").Node, path: {
                                state: unknown;
                                readonly node: import("./css/syntax-parser").Node;
                                readonly parent: import("./css/syntax-parser").Node | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: import("./css/syntax-parser").Node | undefined): number;
                                range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                                start(n?: import("./css/syntax-parser").Node | undefined): number;
                                end(n?: import("./css/syntax-parser").Node | undefined): number;
                                loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                                source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                                value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                                name(n?: import("./css/syntax-parser").Node | undefined): string;
                                childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                                child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                                children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                                fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                                rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                                startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                            }): void;
                            printedAs(node: import("./css/syntax-parser").Node, text: string): void;
                            printedSource(node: import("./css/syntax-parser").Node, sourceText: (node: import("./css/syntax-parser").Node) => string): void;
                            printPiece(path: {
                                state: unknown;
                                readonly node: import("./css/syntax-parser").Node;
                                readonly parent: import("./css/syntax-parser").Node | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: import("./css/syntax-parser").Node | undefined): number;
                                range(n?: import("./css/syntax-parser").Node | undefined): [number, number];
                                start(n?: import("./css/syntax-parser").Node | undefined): number;
                                end(n?: import("./css/syntax-parser").Node | undefined): number;
                                loc(n?: import("./css/syntax-parser").Node | undefined): [number, number, number, number];
                                source(n?: (import("./css/syntax-parser").Node | number) | undefined, end?: number | undefined): string;
                                value(n?: import("./css/syntax-parser").Node | undefined): string | number;
                                name(n?: import("./css/syntax-parser").Node | undefined): string;
                                childCount(n?: import("./css/syntax-parser").Node | undefined): number;
                                child(i: number, n?: import("./css/syntax-parser").Node | undefined): ComponentValue;
                                children(n?: import("./css/syntax-parser").Node | undefined): ComponentValue[];
                                fieldCount(field: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                field(i: number, field: number, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                fieldNamed(field: number, name: string, n?: import("./css/syntax-parser").Node | undefined): import("./css/syntax-parser").Node;
                                flag(flag: number, n?: import("./css/syntax-parser").Node | undefined): boolean;
                                rangeOf(part: number, n?: import("./css/syntax-parser").Node | undefined): [number, number] | null;
                                startOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                endOf(part: number, n?: import("./css/syntax-parser").Node | undefined): number;
                                textOf(_part: number, _n?: import("./css/syntax-parser").Node | undefined): null;
                            }): string;
                            get(node: import("./css/syntax-parser").Node): string;
                            _emit(text: string): void;
                            _cutTail(): void;
                            emitRetractable(text: string): number;
                            retract(index: number): void;
                            writesNonAscii(index: number): boolean;
                            foldIntoRetractable(index: number, text: string): void;
                            rewriteRetractable(index: number, text: string): void;
                            deferRetractable(index: number, source: {
                                readonly text: string;
                            }): void;
                            _settleDeferred(): void;
                            takeRetractable(node: import("./css/syntax-parser").Node, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): number;
                            take(node: import("./css/syntax-parser").Node, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): void;
                            anchor(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            hasInsertBefore(pos: number): boolean;
                            flushInsertsBefore(pos: number): void;
                            insert(pos: number, text: string): void;
                            takeInserts(start: number, end: number): string;
                            _flushBefore(pos: number): void;
                            sourceMap(options: SourceMapOptions, code?: string | undefined): SourceMap;
                            substitute(resolve: (id: number) => string | undefined, infix: string): void;
                            replaceAll(text: string): void;
                            result(): string;
                        }, opts: import("./css/syntax-parser").CssProcessOptions): void;
                        /**
                         * Parse `input` once and fire the visitors in source order. Asking for output
                         * — `mode`, the one thing that names it — makes the same walk print, given a
                         * printer supplied at construction: a
                         * {@link PrintContext} is created, each node's printer fires into it as the node
                         * finishes, and the result is returned as `{ code, map }`: the serialized output
                         * and, for a caller that named its input with `source` / `content`, the
                         * input->output source map — `map` is `undefined` without one. Asking for
                         * none of it only walks and returns `undefined`. A single parse — printing
                         * never re-parses; all configuration is per-call.
                         * @overload
                         * @param {string} input the source
                         * @param {TProcessOptions & RunState<TState> & { mode: PrintOptions["mode"] } & { source: string, content?: string }} options process options, naming the input so a map is built
                         * @returns {{ code: string, map: SourceMap }} the output and its map
                         */
                        process(input: string, options: import("./css/syntax-parser").CssProcessOptions & import("./util/SourceProcessor").RunState<TState> & {
                            mode: import("./util/SourceProcessor").PrintOptions["mode"];
                        } & {
                            source: string;
                            content?: string;
                        }): {
                            code: string;
                            map: import("./util/SourceProcessor").SourceMap;
                        };
                        /**
                         * @overload
                         * @param {string} input the source
                         * @param {TProcessOptions & RunState<TState> & { mode: PrintOptions["mode"] }} options process options, asking for output but no map
                         * @returns {{ code: string, map: undefined }} the output alone
                         */
                        process(input: string, options: import("./css/syntax-parser").CssProcessOptions & import("./util/SourceProcessor").RunState<TState> & {
                            mode: import("./util/SourceProcessor").PrintOptions["mode"];
                        }): {
                            code: string;
                            map: undefined;
                        };
                        /**
                         * @overload
                         * @param {string} input the source
                         * @param {(TProcessOptions & RunState<TState>)=} options process options, asking for no output
                         * @returns {undefined} nothing — the walk alone
                         */
                        process(input: string, options: import("./css/syntax-parser").CssProcessOptions & import("./util/SourceProcessor").RunState<TState>): undefined;
                        processAsync(input: string, options: Omit<import("./css/syntax-parser").CssProcessOptions, "renderEmbeddedSource"> & import("./util/SourceProcessor").RunState<TState> & {
                            mode: PrintOptions["mode"];
                        } & {
                            source?: string;
                            content?: string;
                            renderEmbeddedSource?: (source: string, hole: import("./util/dataURL").DeferredEmbeddedSource) => Promise<string | undefined> | string | undefined;
                        }): Promise<{
                            code: string;
                            map: SourceMap | undefined;
                        }>;
                        _processDeferred(input: string, options: import("./css/syntax-parser").CssProcessOptions & import("./util/SourceProcessor").RunState<TState> & {
                            mode: PrintOptions["mode"];
                        } & {
                            source?: string;
                            content?: string;
                        }): {
                            finish: (resolve: (id: number) => string | undefined) => {
                                code: string;
                                map: SourceMap | undefined;
                            };
                        };
                    };
                    PrintContext: {
                        new <TPath, TNode, TPrintOptions = any>(options: import("./util/SourceProcessor").PrintOptions & TPrintOptions, printer: import("./util/SourceProcessor").NodePrinter<TPath, TNode, TPrintOptions>): {
                            options: import("./util/SourceProcessor").PrintOptions & TPrintOptions;
                            _printer: import("./util/SourceProcessor").NodePrinter<TPath, TNode, TPrintOptions>;
                            _storeText: (string | null)[];
                            _storeGen: Int32Array;
                            _sourceText: (node: TNode) => string;
                            _gen: number;
                            _storeLow: number;
                            _storeHigh: number;
                            _chunks: string[];
                            _deferred: Map<number, {
                                readonly text: string;
                            }>;
                            _tail: string;
                            _tailLength: number;
                            _flattened: number;
                            mapWanted: boolean;
                            _mappings: number[];
                            _retractableMappings: number[] | null;
                            _inserts: [number, string][];
                            _insertIdx: number;
                            _pending: string[];
                            _pendingAnchor: [number | undefined, number | undefined, number | undefined] | null;
                            pushPending(text: string): number;
                            setPending(depth: number, text: string): void;
                            flushPending(): void;
                            anchorPending(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            isPending(depth: number): boolean;
                            dropPending(): void;
                            markCut(): number;
                            emitStreamed(text: string): void;
                            _growStore(need: number): void;
                            dropStore(): void;
                            _moveEpoch(): void;
                            dropTrailing(from: number, charCode: number): void;
                            replaceEnd(printed: string, text: string, closer: number): boolean;
                            printNode(node: TNode, path: TPath): void;
                            printedAs(node: TNode, text: string): void;
                            printedSource(node: TNode, sourceText: (node: TNode) => string): void;
                            printPiece(path: TPath): string;
                            get(node: TNode): string;
                            _emit(text: string): void;
                            _cutTail(): void;
                            emitRetractable(text: string): number;
                            retract(index: number): void;
                            writesNonAscii(index: number): boolean;
                            foldIntoRetractable(index: number, text: string): void;
                            rewriteRetractable(index: number, text: string): void;
                            deferRetractable(index: number, source: {
                                readonly text: string;
                            }): void;
                            _settleDeferred(): void;
                            takeRetractable(node: TNode, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): number;
                            take(node: TNode | undefined, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): void;
                            anchor(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            hasInsertBefore(pos: number): boolean;
                            flushInsertsBefore(pos: number): void;
                            insert(pos: number, text: string): void;
                            takeInserts(start: number, end: number): string;
                            _flushBefore(pos: number): void;
                            sourceMap(options: SourceMapOptions, code?: string | undefined): SourceMap;
                            substitute(resolve: (id: number) => string | undefined, infix: string): void;
                            replaceAll(text: string): void;
                            result(): string;
                        };
                    };
                    declineDeferredWrites: (text: string, writes: DeferredWrite[]) => string;
                    deferredWrite: (id: number) => string;
                };
            };
        };
        html: {
            readonly builtinEmbeddedRenderer: (options?: BuiltinEmbeddedRendererOptions | undefined) => import("./html/syntax-printer").EmbeddedSourceRenderer;
            readonly HtmlModulesPlugin: typeof import("./html/HtmlModulesPlugin");
            readonly htmlMinify: {
                (input: {
                    [file: string]: string | Buffer;
                }, sourceMap?: (import("webpack-sources").RawSourceMap | undefined) | undefined, minimizerOptions?: (Omit<import("./html/syntax-printer").HtmlPrintOptions, "renderEmbeddedSource" | "deferEmbeddedSource"> & {
                    environment?: import("./css/syntax-parser").CssEnvironment;
                    css?: {
                        convertLengthUnits?: boolean;
                        convertApproximateColors?: boolean;
                        dropOverriddenDeclarations?: boolean;
                        rewriteCustomProperties?: boolean;
                        unusedSymbols?: string[];
                        pseudoClasses?: {
                            [name: string]: string;
                        };
                    } & import("./css/syntax-parser").CssTransformOptions;
                    minifyConditionalComments?: boolean;
                    extractComments?: MinimizeExtractComments;
                    renderEmbeddedSource?: AsyncEmbeddedSourceRenderer;
                    svg?: boolean;
                } & import("./html/syntax-printer").HtmlTransformOptions) | undefined, extractComments?: ExtractCommentsOption | undefined): Promise<{
                    code: string;
                    extractedComments?: string[];
                    warnings?: (Error | string)[];
                    errors?: (Error | string)[];
                }>;
                supportsWorkerThreads(): boolean;
                getTypes(): string[];
                getEmbeddedTypes(): string[];
                filter(name: string): boolean;
                formatBanner(banner: string): string;
                getBannerPosition(): "end";
            };
            readonly syntax: {
                readonly parser: SyntaxParser;
                readonly printer: SyntaxPrinter;
                SourceProcessor: {
                    new <TState = unknown>(): {
                        _grammar: import("./util/SourceProcessor").Grammar<{
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        }, number, import("./html/syntax-printer").HtmlProcessOptions, import("./html/syntax-printer").HtmlPrintOptions>;
                        _visitors: import("./util/SourceProcessor").CompiledVisitorMap<{
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        }>;
                        _printer: import("./util/SourceProcessor").NodePrinter<{
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        }, number, import("./html/syntax-printer").HtmlPrintOptions>;
                        _loadPrinter: () => import("./util/SourceProcessor").NodePrinter<{
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        }, number, import("./html/syntax-printer").HtmlPrintOptions>;
                        _path: {
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        };
                        _deferred: (ctx: {
                            options: import("./util/SourceProcessor").PrintOptions & import("./html/syntax-printer").HtmlPrintOptions;
                            _printer: import("./util/SourceProcessor").NodePrinter<{
                                state: unknown;
                                readonly node: HtmlNodeRef;
                                readonly parent: HtmlNodeRef | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: HtmlNodeRef | undefined): number;
                                range(n?: HtmlNodeRef | undefined): [number, number];
                                start(n?: HtmlNodeRef | undefined): number;
                                end(n?: HtmlNodeRef | undefined): number;
                                loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                                source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                                name(n?: HtmlNodeRef | undefined): string;
                                fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                                field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                                rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                                startOf(part: number, n?: HtmlNodeRef | undefined): number;
                                endOf(part: number, n?: HtmlNodeRef | undefined): number;
                                textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                                value(n?: HtmlNodeRef | undefined): string;
                                childCount(n?: HtmlNodeRef | undefined): number;
                                child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                            }, number, import("./html/syntax-printer").HtmlPrintOptions>;
                            _storeText: (string | null)[];
                            _storeGen: Int32Array;
                            _sourceText: (node: number) => string;
                            _gen: number;
                            _storeLow: number;
                            _storeHigh: number;
                            _chunks: string[];
                            _deferred: Map<number, {
                                readonly text: string;
                            }>;
                            _tail: string;
                            _tailLength: number;
                            _flattened: number;
                            mapWanted: boolean;
                            _mappings: number[];
                            _retractableMappings: number[] | null;
                            _inserts: [number, string][];
                            _insertIdx: number;
                            _pending: string[];
                            _pendingAnchor: [number | undefined, number | undefined, number | undefined] | null;
                            pushPending(text: string): number;
                            setPending(depth: number, text: string): void;
                            flushPending(): void;
                            anchorPending(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            isPending(depth: number): boolean;
                            dropPending(): void;
                            markCut(): number;
                            emitStreamed(text: string): void;
                            _growStore(need: number): void;
                            dropStore(): void;
                            _moveEpoch(): void;
                            dropTrailing(from: number, charCode: number): void;
                            replaceEnd(printed: string, text: string, closer: number): boolean;
                            printNode(node: number, path: {
                                state: unknown;
                                readonly node: HtmlNodeRef;
                                readonly parent: HtmlNodeRef | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: HtmlNodeRef | undefined): number;
                                range(n?: HtmlNodeRef | undefined): [number, number];
                                start(n?: HtmlNodeRef | undefined): number;
                                end(n?: HtmlNodeRef | undefined): number;
                                loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                                source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                                name(n?: HtmlNodeRef | undefined): string;
                                fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                                field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                                rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                                startOf(part: number, n?: HtmlNodeRef | undefined): number;
                                endOf(part: number, n?: HtmlNodeRef | undefined): number;
                                textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                                value(n?: HtmlNodeRef | undefined): string;
                                childCount(n?: HtmlNodeRef | undefined): number;
                                child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                            }): void;
                            printedAs(node: number, text: string): void;
                            printedSource(node: number, sourceText: (node: number) => string): void;
                            printPiece(path: {
                                state: unknown;
                                readonly node: HtmlNodeRef;
                                readonly parent: HtmlNodeRef | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: HtmlNodeRef | undefined): number;
                                range(n?: HtmlNodeRef | undefined): [number, number];
                                start(n?: HtmlNodeRef | undefined): number;
                                end(n?: HtmlNodeRef | undefined): number;
                                loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                                source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                                name(n?: HtmlNodeRef | undefined): string;
                                fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                                field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                                rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                                startOf(part: number, n?: HtmlNodeRef | undefined): number;
                                endOf(part: number, n?: HtmlNodeRef | undefined): number;
                                textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                                value(n?: HtmlNodeRef | undefined): string;
                                childCount(n?: HtmlNodeRef | undefined): number;
                                child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                            }): string;
                            get(node: number): string;
                            _emit(text: string): void;
                            _cutTail(): void;
                            emitRetractable(text: string): number;
                            retract(index: number): void;
                            writesNonAscii(index: number): boolean;
                            foldIntoRetractable(index: number, text: string): void;
                            rewriteRetractable(index: number, text: string): void;
                            deferRetractable(index: number, source: {
                                readonly text: string;
                            }): void;
                            _settleDeferred(): void;
                            takeRetractable(node: number, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): number;
                            take(node: number, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): void;
                            anchor(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            hasInsertBefore(pos: number): boolean;
                            flushInsertsBefore(pos: number): void;
                            insert(pos: number, text: string): void;
                            takeInserts(start: number, end: number): string;
                            _flushBefore(pos: number): void;
                            sourceMap(options: SourceMapOptions, code?: string | undefined): SourceMap;
                            substitute(resolve: (id: number) => string | undefined, infix: string): void;
                            replaceAll(text: string): void;
                            result(): string;
                        }, build: () => {
                            code: string;
                            map: import("./util/SourceProcessor").SourceMap | undefined;
                        }) => void;
                        /**
                         * Register one bucket for several node types, as a map naming each would;
                         * its path takes only the parts those types have.
                         * @template {number} T
                         * @overload
                         * @param {T[]} types the node types the bucket visits
                         * @param {VisitorBucket<TypedNodePath<TPath, TNode, TParts, T, TState>>} bucket the visitor
                         * @returns {SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>} `this`, for chaining
                         */
                        use<T extends number>(types: T[], bucket: import("./util/SourceProcessor").VisitorBucket<import("./util/SourceProcessor").TypedNodePath<{
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        }, number, import("./html/syntax-parser").HtmlParts, T, TState>>): import("./util/SourceProcessor")<{
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        }, number, import("./html/syntax-printer").HtmlProcessOptions, import("./html/syntax-printer").HtmlPrintOptions, import("./html/syntax-parser").HtmlParts, TState, import("./html/syntax").HtmlVisitorMap<TState>>;
                        /**
                         * Register a visitor map; calls accumulate per node type, and each
                         * visitor's path takes only its type's parts.
                         * A bucket is a function (= `{ enter }`) or `{ enter?, exit? }`.
                         * @overload
                         * @param {TVisitors} map visitor map keyed by node type
                         * @returns {SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>} `this`, for chaining
                         */
                        use(map: import("./html/syntax").HtmlVisitorMap<TState>): import("./util/SourceProcessor")<{
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        }, number, import("./html/syntax-printer").HtmlProcessOptions, import("./html/syntax-printer").HtmlPrintOptions, import("./html/syntax-parser").HtmlParts, TState, import("./html/syntax").HtmlVisitorMap<TState>>;
                        /**
                         * Register a visitor map built at runtime, keyed by any node type.
                         * @overload
                         * @param {VisitorMap<TPath>} map visitor map keyed by node type
                         * @returns {SourceProcessor<TPath, TNode, TProcessOptions, TPrintOptions, TParts, TState, TVisitors>} `this`, for chaining
                         */
                        use(map: import("./util/SourceProcessor").VisitorMap<{
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        }>): import("./util/SourceProcessor")<{
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        }, number, import("./html/syntax-printer").HtmlProcessOptions, import("./html/syntax-printer").HtmlPrintOptions, import("./html/syntax-parser").HtmlParts, TState, import("./html/syntax").HtmlVisitorMap<TState>>;
                        _add(type: number, visitor: import("./util/SourceProcessor").VisitorBucket<{
                            state: unknown;
                            readonly node: HtmlNodeRef;
                            readonly parent: HtmlNodeRef | null;
                            readonly index: number;
                            skipChildren(): void;
                            stop(): void;
                            within(type: number): boolean;
                            type(n?: HtmlNodeRef | undefined): number;
                            range(n?: HtmlNodeRef | undefined): [number, number];
                            start(n?: HtmlNodeRef | undefined): number;
                            end(n?: HtmlNodeRef | undefined): number;
                            loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                            source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                            name(n?: HtmlNodeRef | undefined): string;
                            fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                            field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                            rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                            startOf(part: number, n?: HtmlNodeRef | undefined): number;
                            endOf(part: number, n?: HtmlNodeRef | undefined): number;
                            textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                            value(n?: HtmlNodeRef | undefined): string;
                            childCount(n?: HtmlNodeRef | undefined): number;
                            child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                            children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                        }>): void;
                        _run(input: string, ctx: {
                            options: import("./util/SourceProcessor").PrintOptions & import("./html/syntax-printer").HtmlPrintOptions;
                            _printer: import("./util/SourceProcessor").NodePrinter<{
                                state: unknown;
                                readonly node: HtmlNodeRef;
                                readonly parent: HtmlNodeRef | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: HtmlNodeRef | undefined): number;
                                range(n?: HtmlNodeRef | undefined): [number, number];
                                start(n?: HtmlNodeRef | undefined): number;
                                end(n?: HtmlNodeRef | undefined): number;
                                loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                                source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                                name(n?: HtmlNodeRef | undefined): string;
                                fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                                field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                                rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                                startOf(part: number, n?: HtmlNodeRef | undefined): number;
                                endOf(part: number, n?: HtmlNodeRef | undefined): number;
                                textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                                value(n?: HtmlNodeRef | undefined): string;
                                childCount(n?: HtmlNodeRef | undefined): number;
                                child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                            }, number, import("./html/syntax-printer").HtmlPrintOptions>;
                            _storeText: (string | null)[];
                            _storeGen: Int32Array;
                            _sourceText: (node: number) => string;
                            _gen: number;
                            _storeLow: number;
                            _storeHigh: number;
                            _chunks: string[];
                            _deferred: Map<number, {
                                readonly text: string;
                            }>;
                            _tail: string;
                            _tailLength: number;
                            _flattened: number;
                            mapWanted: boolean;
                            _mappings: number[];
                            _retractableMappings: number[] | null;
                            _inserts: [number, string][];
                            _insertIdx: number;
                            _pending: string[];
                            _pendingAnchor: [number | undefined, number | undefined, number | undefined] | null;
                            pushPending(text: string): number;
                            setPending(depth: number, text: string): void;
                            flushPending(): void;
                            anchorPending(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            isPending(depth: number): boolean;
                            dropPending(): void;
                            markCut(): number;
                            emitStreamed(text: string): void;
                            _growStore(need: number): void;
                            dropStore(): void;
                            _moveEpoch(): void;
                            dropTrailing(from: number, charCode: number): void;
                            replaceEnd(printed: string, text: string, closer: number): boolean;
                            printNode(node: number, path: {
                                state: unknown;
                                readonly node: HtmlNodeRef;
                                readonly parent: HtmlNodeRef | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: HtmlNodeRef | undefined): number;
                                range(n?: HtmlNodeRef | undefined): [number, number];
                                start(n?: HtmlNodeRef | undefined): number;
                                end(n?: HtmlNodeRef | undefined): number;
                                loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                                source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                                name(n?: HtmlNodeRef | undefined): string;
                                fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                                field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                                rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                                startOf(part: number, n?: HtmlNodeRef | undefined): number;
                                endOf(part: number, n?: HtmlNodeRef | undefined): number;
                                textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                                value(n?: HtmlNodeRef | undefined): string;
                                childCount(n?: HtmlNodeRef | undefined): number;
                                child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                            }): void;
                            printedAs(node: number, text: string): void;
                            printedSource(node: number, sourceText: (node: number) => string): void;
                            printPiece(path: {
                                state: unknown;
                                readonly node: HtmlNodeRef;
                                readonly parent: HtmlNodeRef | null;
                                readonly index: number;
                                skipChildren(): void;
                                stop(): void;
                                within(type: number): boolean;
                                type(n?: HtmlNodeRef | undefined): number;
                                range(n?: HtmlNodeRef | undefined): [number, number];
                                start(n?: HtmlNodeRef | undefined): number;
                                end(n?: HtmlNodeRef | undefined): number;
                                loc(n?: HtmlNodeRef | undefined): [number, number, number, number];
                                source(n?: (HtmlNodeRef | number) | undefined, end?: number | undefined): string;
                                name(n?: HtmlNodeRef | undefined): string;
                                fieldCount(field: number, n?: HtmlNodeRef | undefined): number;
                                field(i: number, field: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                fieldNamed(field: number, name: string, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                flag(flag: number, n?: HtmlNodeRef | undefined): boolean;
                                rangeOf(part: number, n?: HtmlNodeRef | undefined): [number, number] | null;
                                startOf(part: number, n?: HtmlNodeRef | undefined): number;
                                endOf(part: number, n?: HtmlNodeRef | undefined): number;
                                textOf(part: number, n?: HtmlNodeRef | undefined): string | null;
                                value(n?: HtmlNodeRef | undefined): string;
                                childCount(n?: HtmlNodeRef | undefined): number;
                                child(i: number, n?: HtmlNodeRef | undefined): HtmlNodeRef;
                                children(n?: HtmlNodeRef | undefined): HtmlNodeRef[];
                            }): string;
                            get(node: number): string;
                            _emit(text: string): void;
                            _cutTail(): void;
                            emitRetractable(text: string): number;
                            retract(index: number): void;
                            writesNonAscii(index: number): boolean;
                            foldIntoRetractable(index: number, text: string): void;
                            rewriteRetractable(index: number, text: string): void;
                            deferRetractable(index: number, source: {
                                readonly text: string;
                            }): void;
                            _settleDeferred(): void;
                            takeRetractable(node: number, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): number;
                            take(node: number, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): void;
                            anchor(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            hasInsertBefore(pos: number): boolean;
                            flushInsertsBefore(pos: number): void;
                            insert(pos: number, text: string): void;
                            takeInserts(start: number, end: number): string;
                            _flushBefore(pos: number): void;
                            sourceMap(options: SourceMapOptions, code?: string | undefined): SourceMap;
                            substitute(resolve: (id: number) => string | undefined, infix: string): void;
                            replaceAll(text: string): void;
                            result(): string;
                        }, opts: import("./html/syntax-printer").HtmlProcessOptions): void;
                        /**
                         * Parse `input` once and fire the visitors in source order. Asking for output
                         * — `mode`, the one thing that names it — makes the same walk print, given a
                         * printer supplied at construction: a
                         * {@link PrintContext} is created, each node's printer fires into it as the node
                         * finishes, and the result is returned as `{ code, map }`: the serialized output
                         * and, for a caller that named its input with `source` / `content`, the
                         * input->output source map — `map` is `undefined` without one. Asking for
                         * none of it only walks and returns `undefined`. A single parse — printing
                         * never re-parses; all configuration is per-call.
                         * @overload
                         * @param {string} input the source
                         * @param {TProcessOptions & RunState<TState> & { mode: PrintOptions["mode"] } & { source: string, content?: string }} options process options, naming the input so a map is built
                         * @returns {{ code: string, map: SourceMap }} the output and its map
                         */
                        process(input: string, options: import("./html/syntax-printer").HtmlProcessOptions & import("./util/SourceProcessor").RunState<TState> & {
                            mode: import("./util/SourceProcessor").PrintOptions["mode"];
                        } & {
                            source: string;
                            content?: string;
                        }): {
                            code: string;
                            map: import("./util/SourceProcessor").SourceMap;
                        };
                        /**
                         * @overload
                         * @param {string} input the source
                         * @param {TProcessOptions & RunState<TState> & { mode: PrintOptions["mode"] }} options process options, asking for output but no map
                         * @returns {{ code: string, map: undefined }} the output alone
                         */
                        process(input: string, options: import("./html/syntax-printer").HtmlProcessOptions & import("./util/SourceProcessor").RunState<TState> & {
                            mode: import("./util/SourceProcessor").PrintOptions["mode"];
                        }): {
                            code: string;
                            map: undefined;
                        };
                        /**
                         * @overload
                         * @param {string} input the source
                         * @param {(TProcessOptions & RunState<TState>)=} options process options, asking for no output
                         * @returns {undefined} nothing — the walk alone
                         */
                        process(input: string, options: import("./html/syntax-printer").HtmlProcessOptions & import("./util/SourceProcessor").RunState<TState>): undefined;
                        processAsync(input: string, options: Omit<import("./html/syntax-printer").HtmlProcessOptions, "renderEmbeddedSource"> & import("./util/SourceProcessor").RunState<TState> & {
                            mode: PrintOptions["mode"];
                        } & {
                            source?: string;
                            content?: string;
                            renderEmbeddedSource?: (source: string, hole: import("./util/dataURL").DeferredEmbeddedSource) => Promise<string | undefined> | string | undefined;
                        }): Promise<{
                            code: string;
                            map: SourceMap | undefined;
                        }>;
                        _processDeferred(input: string, options: import("./html/syntax-printer").HtmlProcessOptions & import("./util/SourceProcessor").RunState<TState> & {
                            mode: PrintOptions["mode"];
                        } & {
                            source?: string;
                            content?: string;
                        }): {
                            finish: (resolve: (id: number) => string | undefined) => {
                                code: string;
                                map: SourceMap | undefined;
                            };
                        };
                    };
                    PrintContext: {
                        new <TPath, TNode, TPrintOptions = any>(options: import("./util/SourceProcessor").PrintOptions & TPrintOptions, printer: import("./util/SourceProcessor").NodePrinter<TPath, TNode, TPrintOptions>): {
                            options: import("./util/SourceProcessor").PrintOptions & TPrintOptions;
                            _printer: import("./util/SourceProcessor").NodePrinter<TPath, TNode, TPrintOptions>;
                            _storeText: (string | null)[];
                            _storeGen: Int32Array;
                            _sourceText: (node: TNode) => string;
                            _gen: number;
                            _storeLow: number;
                            _storeHigh: number;
                            _chunks: string[];
                            _deferred: Map<number, {
                                readonly text: string;
                            }>;
                            _tail: string;
                            _tailLength: number;
                            _flattened: number;
                            mapWanted: boolean;
                            _mappings: number[];
                            _retractableMappings: number[] | null;
                            _inserts: [number, string][];
                            _insertIdx: number;
                            _pending: string[];
                            _pendingAnchor: [number | undefined, number | undefined, number | undefined] | null;
                            pushPending(text: string): number;
                            setPending(depth: number, text: string): void;
                            flushPending(): void;
                            anchorPending(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            isPending(depth: number): boolean;
                            dropPending(): void;
                            markCut(): number;
                            emitStreamed(text: string): void;
                            _growStore(need: number): void;
                            dropStore(): void;
                            _moveEpoch(): void;
                            dropTrailing(from: number, charCode: number): void;
                            replaceEnd(printed: string, text: string, closer: number): boolean;
                            printNode(node: TNode, path: TPath): void;
                            printedAs(node: TNode, text: string): void;
                            printedSource(node: TNode, sourceText: (node: TNode) => string): void;
                            printPiece(path: TPath): string;
                            get(node: TNode): string;
                            _emit(text: string): void;
                            _cutTail(): void;
                            emitRetractable(text: string): number;
                            retract(index: number): void;
                            writesNonAscii(index: number): boolean;
                            foldIntoRetractable(index: number, text: string): void;
                            rewriteRetractable(index: number, text: string): void;
                            deferRetractable(index: number, source: {
                                readonly text: string;
                            }): void;
                            _settleDeferred(): void;
                            takeRetractable(node: TNode, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): number;
                            take(node: TNode | undefined, srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined, text?: string | undefined): void;
                            anchor(srcOffset?: number | undefined, srcLine?: number | undefined, srcCol?: number | undefined): void;
                            hasInsertBefore(pos: number): boolean;
                            flushInsertsBefore(pos: number): void;
                            insert(pos: number, text: string): void;
                            takeInserts(start: number, end: number): string;
                            _flushBefore(pos: number): void;
                            sourceMap(options: SourceMapOptions, code?: string | undefined): SourceMap;
                            substitute(resolve: (id: number) => string | undefined, infix: string): void;
                            replaceAll(text: string): void;
                            result(): string;
                        };
                    };
                    declineDeferredWrites: (text: string, writes: DeferredWrite[]) => string;
                    deferredWrite: (id: number) => string;
                };
            };
            readonly xmlMinify: {
                (input: {
                    [file: string]: string | Buffer;
                }, sourceMap?: (import("webpack-sources").RawSourceMap | undefined) | undefined, minimizerOptions?: (import("../declarations/WebpackOptions").OptimizationMinimizeXml & {
                    environment?: import("./css/syntax-parser").CssEnvironment;
                    css?: {
                        convertLengthUnits?: boolean;
                        convertApproximateColors?: boolean;
                        dropOverriddenDeclarations?: boolean;
                        rewriteCustomProperties?: boolean;
                        unusedSymbols?: string[];
                        pseudoClasses?: {
                            [name: string]: string;
                        };
                    } & import("./css/syntax-parser").CssTransformOptions;
                }) | undefined): Promise<{
                    code: string;
                }>;
                supportsWorkerThreads(): boolean;
                getTypes(): string[];
                filter(name: string): boolean;
            };
        };
        library: {
            readonly AbstractLibraryPlugin: typeof import("./library/AbstractLibraryPlugin");
            readonly EnableLibraryPlugin: typeof import("./library/EnableLibraryPlugin");
        };
        readonly DelegatedPlugin: typeof import("./dll/DelegatedPlugin");
        readonly DllPlugin: typeof import("./dll/DllPlugin");
        readonly DllReferencePlugin: typeof import("./dll/DllReferencePlugin");
        readonly LibManifestPlugin: typeof import("./dll/LibManifestPlugin");
        dll: {
            readonly DelegatedPlugin: typeof import("./dll/DelegatedPlugin");
            readonly DllPlugin: typeof import("./dll/DllPlugin");
            readonly DllReferencePlugin: typeof import("./dll/DllReferencePlugin");
            readonly LibManifestPlugin: typeof import("./dll/LibManifestPlugin");
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
            readonly createHash: (algorithm: import("../declarations/WebpackOptions").HashFunction) => import("./util/Hash");
            readonly comparators: typeof import("./util/comparators");
            readonly runtime: typeof import("./util/runtime");
            readonly serialization: {
                readonly register: typeof import("./serialization/ObjectMiddleware").register;
                readonly registerLegacyRequest: typeof import("./serialization/ObjectMiddleware").registerLegacyRequest;
                readonly registerLoader: typeof import("./serialization/ObjectMiddleware").registerLoader;
                readonly registerNotSerializable: typeof import("./serialization/ObjectMiddleware").registerNotSerializable;
                readonly NOT_SERIALIZABLE: {};
                readonly MEASURE_START_OPERATION: import("./serialization/BinaryMiddleware").MEASURE_START_OPERATION_TYPE;
                readonly MEASURE_END_OPERATION: import("./serialization/BinaryMiddleware").MEASURE_END_OPERATION_TYPE;
                readonly buffersSerializer: import("./serialization/Serializer")<any, import("./serialization/types").BufferSerializableType[], EXPECTED_OBJECT>;
                createFileSerializer: <D, S, C>(fs: IntermediateFileSystem, hashFunction: import("./util/Hash").HashFunction) => Serializer<D, S, C>;
            };
            readonly makeSerializable: <T extends new (...params: never[]) => EXPECTED_OBJECT>(Constructor: T, request: string | (string | [string, string | null])[], name?: (string | null) | undefined) => void;
            readonly cleverMerge: <T, O>(first: T | null | undefined, second: O | null | undefined) => (T & O) | T | O;
            readonly LazySet: typeof import("./util/LazySet");
            readonly RequestShortener: typeof RequestShortener;
            readonly compileBooleanMatcher: {
                (map: Record<string | number, boolean>): boolean | ((value: string) => string);
                fromLists: (positiveItems: string[], negativeItems: string[]) => (value: string) => string;
                itemsToRegexp: (itemsArr: string[]) => string;
            };
            readonly dataURL: typeof import("./util/dataURL");
            readonly extractComments: typeof import("./util/extractComments");
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
            typescript: {
                readonly TypeScriptPlugin: typeof import("./typescript/TypeScriptPlugin");
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
    options: WebpackOptions;
    /** @type {string} */
    context: string;
    /** @type {RequestShortener} */
    requestShortener: RequestShortener;
    /** @type {Cache} */
    cache: Cache;
    /** @type {Map<Module, ModuleMemCachesItem> | undefined} */
    moduleMemCaches: Map<Module, ModuleMemCachesItem> | undefined;
    /** @type {string} */
    compilerPath: string;
    /** @type {boolean} */
    running: boolean;
    /** @type {boolean} */
    idle: boolean;
    /** @type {boolean} */
    watchMode: boolean;
    /** @type {boolean} */
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
     * Returns the cache facade instance.
     * @param {string} name cache name
     * @returns {CacheFacade} the cache facade instance
     */
    getCache(name: string): CacheFacade;
    /**
     * Gets infrastructure logger.
     * @param {string | (() => string)} name name of the logger, or function called once to get the logger name
     * @returns {Logger} a logger with that name
     */
    getInfrastructureLogger(name: string | (() => string)): Logger;
    _cleanupLastCompilation(): void;
    /**
     * Drops the graph references a finished compilation left on its modules and
     * chunks. Recurses, because child compilations nest: a module only reached
     * below the first level keeps its parser, generator and memoized
     * `ModuleGraph`, which pins the whole stale compilation.
     * @param {Compilation} compilation compilation to clean up
     * @returns {void}
     */
    _cleanupCompilationForCache(compilation: Compilation): void;
    _cleanupLastNormalModuleFactory(): void;
    /**
     * Release fields on a finished compilation that nothing reads after emit,
     * so the heap can shrink while user code still holds the Stats reference.
     * Recurses into child compilations. Stats output is preserved — only
     * codeGen byproducts are dropped.
     * @param {Compilation} compilation finished compilation to slim down
     * @returns {void}
     */
    _releaseUnusedCompilationData(compilation: Compilation): void;
    /**
     * Returns a compiler watcher.
     * @param {WatchOptions} watchOptions the watcher's options
     * @param {Callback<Stats>} handler signals when the call finishes
     * @returns {Watching | undefined} a compiler watcher
     */
    watch(watchOptions: WatchOptions, handler: Callback<Stats>): Watching | undefined;
    /**
     * Processes the provided stat.
     * @param {Callback<Stats>} callback signals when the call finishes
     * @returns {void}
     */
    run(callback: Callback<Stats>): void;
    /**
     * Processes the provided run as child callback.
     * @param {RunAsChildCallback} callback signals when the call finishes
     * @returns {void}
     */
    runAsChild(callback: RunAsChildCallback): void;
    purgeInputFileSystem(): void;
    /**
     * Processes the provided compilation.
     * @param {Compilation} compilation the compilation
     * @param {ErrorCallback} callback signals when the assets are emitted
     * @returns {void}
     */
    emitAssets(compilation: Compilation, callback: ErrorCallback): void;
    /**
     * Gives the file an asset was written to the permissions and the times the
     * asset carries. A symbolic link never carries either, as both follow it to
     * its target.
     * @private
     * @param {string} targetPath absolute path of the file
     * @param {AssetInfo} info info of the asset
     * @param {ErrorCallback} callback signals when the call finishes
     * @returns {void}
     */
    private _setAssetFileAttributes;
    /**
     * Creates an asset which is a symbolic link, replacing whatever else is at
     * its path. An existing link already pointing there is left alone, so a watch
     * rebuild does not touch it.
     * @private
     * @param {Compilation} compilation the compilation
     * @param {object} asset the asset which is a link
     * @param {string} asset.file the filename of the asset
     * @param {Source} asset.source content of the asset, which is what the link points at
     * @param {string} asset.outputPath absolute path the assets are emitted into
     * @param {string} asset.targetPath absolute path the link is created at
     * @param {AssetSymlink} symlink what the link points at
     * @param {ErrorCallback} callback signals when the call finishes
     * @returns {void}
     */
    private _emitSymlink;
    /**
     * Processes the provided error callback.
     * @param {ErrorCallback} callback signals when the call finishes
     * @returns {void}
     */
    emitRecords(callback: ErrorCallback): void;
    /**
     * Processes the provided error callback.
     * @param {ErrorCallback} callback signals when the call finishes
     * @returns {void}
     */
    _emitRecords(callback: ErrorCallback): void;
    /**
     * Processes the provided error callback.
     * @param {ErrorCallback} callback signals when the call finishes
     * @returns {void}
     */
    readRecords(callback: ErrorCallback): void;
    /**
     * Processes the provided error callback.
     * @param {ErrorCallback} callback signals when the call finishes
     * @returns {void}
     */
    _readRecords(callback: ErrorCallback): void;
    /**
     * Creates a child compiler.
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
     * Creates a compilation.
     * @param {CompilationParams} params the compilation parameters
     * @returns {Compilation} compilation
     */
    createCompilation(params: CompilationParams): Compilation;
    /**
     * Returns the created compilation.
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
     * Processes the provided compilation.
     * @param {Callback<Compilation>} callback signals when the compilation finishes
     * @returns {void}
     */
    compile(callback: Callback<Compilation>): void;
    /**
     * Processes the provided error callback.
     * @param {ErrorCallback} callback signals when the compiler closes
     * @returns {void}
     */
    close(callback: ErrorCallback): void;
    /**
     * Schema validation function with optional pre-compiled check
     * @template {EXPECTED_OBJECT | EXPECTED_OBJECT[]} [T=EXPECTED_OBJECT]
     * @param {Schema | (() => Schema)} schema schema
     * @param {T} value value
     * @param {ValidationErrorConfiguration=} options options
     * @param {((value: T) => boolean)=} check options
     */
    validate<T extends EXPECTED_OBJECT | EXPECTED_OBJECT[] = EXPECTED_OBJECT>(schema: Schema | (() => Schema), value: T, options?: ValidationErrorConfiguration | undefined, check?: ((value: T) => boolean) | undefined): void;
}
declare namespace Compiler {
    export { CompilationParams, Callback, RunAsChildCallback, KnownRecords, Records, AssetEmittedInfo, CacheEntry, SimilarEntry, WeakReferences, MemCache, ModuleMemCachesItem };
}
import { SyncHook } from "tapable";
import { SyncBailHook } from "tapable";
import Compilation = require("./Compilation");
import { AsyncSeriesHook } from "tapable";
import Stats = require("./stats/Stats");
import NormalModuleFactory = require("./module/NormalModuleFactory");
import ContextModuleFactory = require("./context/ContextModuleFactory");
import { AsyncParallelHook } from "tapable";
import type { EntryNormalized as Entry } from "../declarations/WebpackOptions";
import webpack = require(".");
import Cache = require("./cache/Cache");
import type Chunk from "./graph/Chunk";
import ChunkGraph = require("./graph/ChunkGraph");
import type Dependency from "./graph/Dependency";
import type Module from "./module/Module";
import ModuleGraph = require("./graph/ModuleGraph");
import WebpackError = require("./errors/WebpackError");
import type { WebpackOptionsNormalized as WebpackOptions } from "../declarations/WebpackOptions";
import type { IntermediateFileSystem } from "./fs/fs";
import RequestShortener = require("./util/RequestShortener");
import type Watching from "./watch/Watching";
import type { OutputFileSystem } from "./fs/fs";
import type { InputFileSystem } from "./fs/fs";
import type { WatchFileSystem } from "./fs/fs";
import type { TimeInfoEntries } from "./fs/fs";
import ResolverFactory = require("./resolve/ResolverFactory");
import type { LoggingFunction } from "./logging/createConsoleLogger";
import type { PlatformTargetProperties } from "./config/target";
import CacheFacade = require("./cache/CacheFacade");
import { Logger } from "./logging/Logger";
import type { WatchOptions } from "../declarations/WebpackOptions";
import type { ErrorCallback } from "./webpack";
import type { OutputNormalized as OutputOptions } from "../declarations/WebpackOptions";
import type { Plugins } from "../declarations/WebpackOptions";
import type { Schema } from "schema-utils";
import type { ValidationErrorConfiguration } from "schema-utils";
/**
 * Defines the compilation params type used by this module.
 */
type CompilationParams = {
    normalModuleFactory: NormalModuleFactory;
    contextModuleFactory: ContextModuleFactory;
};
/**
 * Defines the callback type used by this module.
 */
type Callback<T, R = void> = import("./webpack").Callback<T, R>;
/**
 * Defines the run as child callback callback.
 */
type RunAsChildCallback = (err: Error | null, entries?: Chunk[] | undefined, compilation?: Compilation | undefined) => void;
/**
 * Defines the known records type used by this module.
 */
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
/**
 * Defines the asset emitted info type used by this module.
 */
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
    buildInfo: Module.BuildInfo;
    references: WeakReferences | undefined;
    lazyRequests: string | undefined;
    memCache: MemCache;
};
import type { SplitData } from "./optimize/AggressiveSplittingPlugin";
import type { RecordsChunks } from "./ids/RecordIdsPlugin";
import type { RecordsModules } from "./ids/RecordIdsPlugin";
import type { HotIndex } from "./hmr/HotModuleReplacementPlugin";
import type { FullHashChunkModuleHashes } from "./hmr/HotModuleReplacementPlugin";
import type { ChunkModuleHashes } from "./hmr/HotModuleReplacementPlugin";
import type { ChunkHashes } from "./hmr/HotModuleReplacementPlugin";
import type { ChunkRuntime } from "./hmr/HotModuleReplacementPlugin";
import type { ChunkModuleIds } from "./hmr/HotModuleReplacementPlugin";
import type { Source } from "webpack-sources";
import { SizeOnlySource } from "webpack-sources";
