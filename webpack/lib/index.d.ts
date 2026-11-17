declare namespace _exports {
    export { Entry, EntryNormalized, EntryObject, ExternalItem, ExternalItemFunction, ExternalItemObjectKnown, ExternalItemObjectUnknown, ExternalItemValue, Externals, FileCacheOptions, GeneratorOptionsByModuleTypeKnown, LibraryOptions, MemoryCacheOptions, ModuleOptions, ParserOptionsByModuleTypeKnown, ResolveOptions, RuleSetCondition, RuleSetConditionAbsolute, RuleSetRule, RuleSetUse, RuleSetUseFunction, RuleSetUseItem, StatsOptions, Configuration, WebpackOptionsNormalized, WebpackPluginFunction, WebpackPluginInstance, AssetModuleBuildInfo, ChunkGroup, AssetEmittedInfo, ContextModuleBuildInfo, CssModuleBuildInfo, CssModuleBuildMeta, ExternalModuleBuildInfo, HtmlModuleBuildInfo, JavascriptModuleBuildInfo, JavascriptModuleBuildMeta, JsonModuleBuildInfo, BuildInfo, BuildMeta, NormalModuleBuildInfo, ConcatenatedModuleBuildInfo, SyncWasmModuleBuildMeta, Asset, AssetInfo, EntryOptions, PathData, PathDataChunk, PathDataModule, CodeGenerationResults, Entrypoint, ExternalItemFunctionCallback, ExternalItemFunctionData, ExternalItemFunctionDataGetResolve, ExternalItemFunctionDataGetResolveCallbackResult, ExternalItemFunctionDataGetResolveResult, ExternalItemFunctionPromise, MultiCompilerOptions, MultiCompilerPluginFunction, MultiCompilerPluginInstance, MultiConfiguration, MultiStats, MultiStatsOptions, ResolveData, ParserState, ResolvePluginInstance, Resolver, RenderManifestEntry, RenderManifestOptions, TemplatePath, Watching, Argument, Problem, Colors, ColorsOptions, ConfigurationFactory, DefineConfigInput, StatsAsset, StatsChunk, StatsChunkGroup, StatsChunkOrigin, StatsCompilation, StatsError, StatsLogging, StatsLoggingEntry, StatsModule, StatsModuleIssuer, StatsModuleReason, StatsModuleTraceDependency, StatsModuleTraceItem, StatsProfile, ObjectSerializerContext, ObjectDeserializerContext, InputFileSystem, OutputFileSystem, LoaderModule, RawLoaderDefinition, LoaderDefinition, LoaderDefinitionFunction, PitchLoaderDefinitionFunction, RawLoaderDefinitionFunction, LoaderContext };
}
declare const _exports: {
    /**
     * Returns the compiler object.
     * @overload
     * @param {WebpackOptions} options options object
     * @param {Callback<Stats>} callback callback
     * @returns {Compiler | null} the compiler object
     */
    (options: import("../declarations/WebpackOptions").WebpackOptions, callback: import("./webpack").Callback<import("./stats/Stats")>): import("./Compiler") | null;
    /**
     * Returns the compiler object.
     * @overload
     * @param {WebpackOptions} options options object
     * @returns {Compiler} the compiler object
     */
    (options: import("../declarations/WebpackOptions").WebpackOptions): import("./Compiler");
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
        (options: import("../declarations/WebpackOptions").WebpackOptions, callback: import("./webpack").Callback<import("./stats/Stats")>): import("./Compiler") | null;
        /**
         * Returns the compiler object.
         * @overload
         * @param {WebpackOptions} options options object
         * @returns {Compiler} the compiler object
         */
        (options: import("../declarations/WebpackOptions").WebpackOptions): import("./Compiler");
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
    readonly defineConfig: <T extends import("./config/defineConfig").DefineConfigInput>(config: T) => T;
    /**
     * Returns validate fn.
     * @returns {(configuration: Configuration | MultiConfiguration) => void} validate fn
     */
    readonly validate: (configuration: Configuration | MultiConfiguration) => void;
    /**
     * Validates a value against a JSON schema.
     * @deprecated use `config.validateSchema` — TODO in the next major release: remove
     * @returns {typeof import("./config/validateSchema")} the schema validator
     */
    readonly validateSchema: typeof import("./config/validateSchema");
    readonly version: string;
    readonly cli: {
        readonly getArguments: (schema?: Schema | undefined) => Flags;
        readonly processArguments: (args: Flags, config: ObjectConfiguration, values: Values) => import("./config/cli").Problem[] | null;
        readonly createColors: ({ useColor }?: import("./util/terminalColors").ColorsOptions | undefined) => import("./util/terminalColors").Colors;
        readonly isColorSupported: () => boolean;
    };
    /**
     * Resolves every module of the last build eagerly.
     * @deprecated use `prefetch.AutomaticPrefetchPlugin` — TODO in the next major release: remove
     * @returns {typeof import("./prefetch/AutomaticPrefetchPlugin")} the moved export
     */
    readonly AutomaticPrefetchPlugin: typeof import("./prefetch/AutomaticPrefetchPlugin");
    readonly AsyncDependenciesBlock: typeof import("./graph/AsyncDependenciesBlock");
    readonly BannerPlugin: typeof import("./output/BannerPlugin");
    /**
     * The cache a compilation stores and restores through.
     * @deprecated use `cache.Cache` — TODO in the next major release: remove
     * @returns {typeof import("./cache/Cache")} the moved export
     */
    readonly Cache: typeof import("./cache/Cache");
    readonly Chunk: typeof import("./graph/Chunk");
    readonly ChunkGraph: typeof import("./graph/ChunkGraph");
    readonly CleanPlugin: typeof import("./output/CleanPlugin");
    readonly Compilation: typeof import("./Compilation");
    readonly Compiler: typeof import("./Compiler");
    /**
     * The protocol scope hoisting renders through.
     * @deprecated use `optimize.ConcatenationScope` — TODO in the next major release: remove
     * @returns {typeof import("./optimize/ConcatenationScope")} the moved export
     */
    readonly ConcatenationScope: typeof import("./optimize/ConcatenationScope");
    readonly ContextExclusionPlugin: typeof import("./context/ContextExclusionPlugin");
    readonly ContextReplacementPlugin: typeof import("./context/ContextReplacementPlugin");
    readonly CopyPlugin: typeof import("./output/CopyPlugin");
    readonly DefinePlugin: typeof import("./define/DefinePlugin");
    readonly Dependency: typeof import("./graph/Dependency");
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
    readonly Module: typeof import("./module/Module");
    readonly ModuleFactory: typeof import("./module/ModuleFactory");
    readonly ModuleFilenameHelpers: typeof import("./devtool/ModuleFilenameHelpers");
    readonly ModuleGraph: typeof import("./graph/ModuleGraph");
    readonly ModuleGraphConnection: typeof import("./graph/ModuleGraphConnection");
    readonly NoEmitOnErrorsPlugin: typeof import("./diagnostics/NoEmitOnErrorsPlugin");
    readonly NormalModule: typeof import("./module/NormalModule");
    readonly NormalModuleReplacementPlugin: typeof import("./resolve/NormalModuleReplacementPlugin");
    readonly MultiCompiler: typeof import("./MultiCompiler");
    /**
     * The stage constants the optimization hooks are tapped at.
     * @deprecated use `optimize.OptimizationStages` — TODO in the next major release: remove
     * @returns {typeof import("./optimize/OptimizationStages")} the moved export
     */
    readonly OptimizationStages: typeof import("./optimize/OptimizationStages");
    readonly Parser: typeof import("./module/Parser");
    /**
     * Pins the target platform a `target: false` build cannot infer.
     * @deprecated use `config.PlatformPlugin` — TODO in the next major release: remove
     * @returns {typeof import("./config/PlatformPlugin")} the moved export
     */
    readonly PlatformPlugin: typeof import("./config/PlatformPlugin");
    /**
     * Resolves one request eagerly at build time.
     * @deprecated use `prefetch.PrefetchPlugin` — TODO in the next major release: remove
     * @returns {typeof import("./prefetch/PrefetchPlugin")} the moved export
     */
    readonly PrefetchPlugin: typeof import("./prefetch/PrefetchPlugin");
    readonly ProgressPlugin: typeof import("./logging/ProgressPlugin");
    readonly ProvidePlugin: typeof import("./provide/ProvidePlugin");
    /**
     * The symbols a runtime module may declare a requirement on.
     * @deprecated use `runtime.RuntimeGlobals` — TODO in the next major release: remove
     * @returns {typeof import("./runtime/RuntimeGlobals")} the moved export
     */
    readonly RuntimeGlobals: typeof import("./runtime/RuntimeGlobals");
    /**
     * The base class every emitted runtime module extends.
     * @deprecated use `runtime.RuntimeModule` — TODO in the next major release: remove
     * @returns {typeof import("./runtime/RuntimeModule")} the moved export
     */
    readonly RuntimeModule: typeof import("./runtime/RuntimeModule");
    readonly SingleEntryPlugin: typeof import("./entry/EntryPlugin");
    readonly SSRManifestPlugin: typeof import("./output/SSRManifestPlugin");
    readonly SourceMapDevToolPlugin: typeof import("./devtool/SourceMapDevToolPlugin");
    readonly Stats: typeof import("./stats/Stats");
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
    readonly WebpackError: typeof import("./errors/WebpackError");
    /**
     * Reads a resolved configuration into the plugins it implies.
     * @deprecated use `config.WebpackOptionsApply` — TODO in the next major release: remove
     * @returns {typeof import("./config/WebpackOptionsApply")} the moved export
     */
    readonly WebpackOptionsApply: typeof import("./config/WebpackOptionsApply");
    readonly WebpackOptionsDefaulter: typeof import("./config/WebpackOptionsDefaulter");
    readonly WebpackOptionsValidationError: typeof import("schema-utils").ValidationError;
    readonly ValidationError: typeof import("schema-utils").ValidationError;
    cache: {
        readonly Cache: typeof import("./cache/Cache");
        readonly MemoryCachePlugin: typeof import("./cache/MemoryCachePlugin");
    };
    config: {
        readonly PlatformPlugin: typeof import("./config/PlatformPlugin");
        readonly WebpackOptionsApply: typeof import("./config/WebpackOptionsApply");
        readonly defineConfig: <T extends import("./config/defineConfig").DefineConfigInput>(config: T) => T;
        readonly validateSchema: (schema: Parameters<typeof import("schema-utils").validate>[0], options: Parameters<typeof import("schema-utils").validate>[1], validationConfiguration?: Parameters<typeof import("schema-utils").validate>[2] | undefined) => void;
        readonly getNormalizedWebpackOptions: (config: import("../declarations/WebpackOptions").WebpackOptions) => import("../declarations/WebpackOptions").WebpackOptionsNormalized;
        readonly applyWebpackOptionsDefaults: (options: import("../declarations/WebpackOptions").WebpackOptionsNormalized, compilerIndex?: number | undefined) => ResolvedOptions;
    };
    dependencies: {
        readonly ModuleDependency: typeof import("./dependencies/core/ModuleDependency");
        readonly ESMImportDependency: typeof import("./dependencies/esm/ESMImportDependency");
        /**
         * The dependency an ESM `import` declaration makes.
         * @deprecated use `dependencies.ESMImportDependency` — TODO in the next major release: remove
         * @returns {typeof import("./dependencies/esm/ESMImportDependency")} the dependency
         */
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
        /**
         * The runtime module that loads a chunk's CSS.
         * @deprecated use `css.CssLoadingRuntimeModule`, the scope this module lives in — TODO in the next major release: remove
         * @returns {typeof import("./css/CssLoadingRuntimeModule")} the runtime module
         */
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
                extractComments?: MinimizeExtractComments;
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
            createFileSerializer: <D, S, C>(fs: import("./fs/fs").IntermediateFileSystem, hashFunction: import("./util/Hash").HashFunction) => Serializer<D, S, C>;
        };
        readonly makeSerializable: <T extends new (...params: never[]) => EXPECTED_OBJECT>(Constructor: T, request: string | (string | [string, string | null])[], name?: (string | null) | undefined) => void;
        readonly cleverMerge: <T, O>(first: T | null | undefined, second: O | null | undefined) => (T & O) | T | O;
        readonly LazySet: typeof import("./util/LazySet");
        readonly RequestShortener: typeof import("./util/RequestShortener");
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
export = _exports;
type Entry = import("../declarations/WebpackOptions").Entry;
type EntryNormalized = import("../declarations/WebpackOptions").EntryNormalized;
type EntryObject = import("../declarations/WebpackOptions").EntryObject;
type ExternalItem = import("../declarations/WebpackOptions").ExternalItem;
type ExternalItemFunction = import("../declarations/WebpackOptions").ExternalItemFunction;
type ExternalItemObjectKnown = import("../declarations/WebpackOptions").ExternalItemObjectKnown;
type ExternalItemObjectUnknown = import("../declarations/WebpackOptions").ExternalItemObjectUnknown;
type ExternalItemValue = import("../declarations/WebpackOptions").ExternalItemValue;
type Externals = import("../declarations/WebpackOptions").Externals;
type FileCacheOptions = import("../declarations/WebpackOptions").FileCacheOptions;
type GeneratorOptionsByModuleTypeKnown = import("../declarations/WebpackOptions").GeneratorOptionsByModuleTypeKnown;
type LibraryOptions = import("../declarations/WebpackOptions").LibraryOptions;
type MemoryCacheOptions = import("../declarations/WebpackOptions").MemoryCacheOptions;
type ModuleOptions = import("../declarations/WebpackOptions").ModuleOptions;
type ParserOptionsByModuleTypeKnown = import("../declarations/WebpackOptions").ParserOptionsByModuleTypeKnown;
type ResolveOptions = import("../declarations/WebpackOptions").ResolveOptions;
type RuleSetCondition = import("../declarations/WebpackOptions").RuleSetCondition;
type RuleSetConditionAbsolute = import("../declarations/WebpackOptions").RuleSetConditionAbsolute;
type RuleSetRule = import("../declarations/WebpackOptions").RuleSetRule;
type RuleSetUse = import("../declarations/WebpackOptions").RuleSetUse;
type RuleSetUseFunction = import("../declarations/WebpackOptions").RuleSetUseFunction;
type RuleSetUseItem = import("../declarations/WebpackOptions").RuleSetUseItem;
type StatsOptions = import("../declarations/WebpackOptions").StatsOptions;
type Configuration = import("../declarations/WebpackOptions").WebpackOptions;
type WebpackOptionsNormalized = import("../declarations/WebpackOptions").WebpackOptionsNormalized;
type WebpackPluginFunction = import("../declarations/WebpackOptions").WebpackPluginFunction;
type WebpackPluginInstance = import("../declarations/WebpackOptions").WebpackPluginInstance;
type AssetModuleBuildInfo = import("./asset/AssetModule").AssetModuleBuildInfo;
type ChunkGroup = import("./graph/ChunkGroup");
type AssetEmittedInfo = import("./Compiler").AssetEmittedInfo;
type ContextModuleBuildInfo = import("./context/ContextModule").ContextModuleBuildInfo;
type CssModuleBuildInfo = import("./css/CssModule").CssModuleBuildInfo;
type CssModuleBuildMeta = import("./css/CssModule").CssModuleBuildMeta;
type ExternalModuleBuildInfo = import("./externals/ExternalModule").ExternalModuleBuildInfo;
type HtmlModuleBuildInfo = import("./html/HtmlModule").HtmlModuleBuildInfo;
type JavascriptModuleBuildInfo = import("./javascript/JavascriptModule").JavascriptModuleBuildInfo;
type JavascriptModuleBuildMeta = import("./javascript/JavascriptModule").JavascriptModuleBuildMeta;
type JsonModuleBuildInfo = import("./json/JsonModule").JsonModuleBuildInfo;
type BuildInfo = import("./module/Module").BuildInfo;
type BuildMeta = import("./module/Module").BuildMeta;
type NormalModuleBuildInfo = import("./module/NormalModule").NormalModuleBuildInfo;
type ConcatenatedModuleBuildInfo = import("./optimize/ConcatenatedModule").ConcatenatedModuleBuildInfo;
type SyncWasmModuleBuildMeta = import("./wasm-sync/SyncWasmModule").SyncWasmModuleBuildMeta;
type Asset = import("./Compilation").Asset;
type AssetInfo = import("./Compilation").AssetInfo;
type EntryOptions = import("./Compilation").EntryOptions;
type PathData = import("./Compilation").PathData;
type PathDataChunk = import("./Compilation").PathDataChunk;
type PathDataModule = import("./Compilation").PathDataModule;
type CodeGenerationResults = import("./module/CodeGenerationResults");
type Entrypoint = import("./graph/Entrypoint");
type ExternalItemFunctionCallback = import("./externals/ExternalModuleFactoryPlugin").ExternalItemFunctionCallback;
type ExternalItemFunctionData = import("./externals/ExternalModuleFactoryPlugin").ExternalItemFunctionData;
type ExternalItemFunctionDataGetResolve = import("./externals/ExternalModuleFactoryPlugin").ExternalItemFunctionDataGetResolve;
type ExternalItemFunctionDataGetResolveCallbackResult = import("./externals/ExternalModuleFactoryPlugin").ExternalItemFunctionDataGetResolveCallbackResult;
type ExternalItemFunctionDataGetResolveResult = import("./externals/ExternalModuleFactoryPlugin").ExternalItemFunctionDataGetResolveResult;
type ExternalItemFunctionPromise = import("./externals/ExternalModuleFactoryPlugin").ExternalItemFunctionPromise;
type MultiCompilerOptions = import("./MultiCompiler").MultiCompilerOptions;
type MultiCompilerPluginFunction = import("./MultiCompiler").MultiCompilerPluginFunction;
type MultiCompilerPluginInstance = import("./MultiCompiler").MultiCompilerPluginInstance;
type MultiConfiguration = import("./MultiCompiler").MultiWebpackOptions;
type MultiStats = import("./stats/MultiStats");
type MultiStatsOptions = import("./stats/MultiStats").MultiStatsOptions;
type ResolveData = import("./module/NormalModuleFactory").ResolveData;
type ParserState<TModule extends import("./module/NormalModule") = import("./module/NormalModule")> = import("./module/Parser").ParserState<TModule>;
type ResolvePluginInstance = import("./resolve/ResolverFactory").ResolvePluginInstance;
type Resolver = import("./resolve/ResolverFactory").Resolver;
type RenderManifestEntry = import("./template/Template").RenderManifestEntry;
type RenderManifestOptions = import("./template/Template").RenderManifestOptions;
type TemplatePath = import("./template/TemplatedPathPlugin").TemplatePath;
type Watching = import("./watch/Watching");
type Argument = import("./config/cli").Argument;
type Problem = import("./config/cli").Problem;
type Colors = import("./util/terminalColors").Colors;
type ColorsOptions = import("./util/terminalColors").ColorsOptions;
type ConfigurationFactory = import("./config/defineConfig").ConfigurationFactory;
type DefineConfigInput = import("./config/defineConfig").DefineConfigInput;
type StatsAsset = import("./stats/DefaultStatsFactoryPlugin").StatsAsset;
type StatsChunk = import("./stats/DefaultStatsFactoryPlugin").StatsChunk;
type StatsChunkGroup = import("./stats/DefaultStatsFactoryPlugin").StatsChunkGroup;
type StatsChunkOrigin = import("./stats/DefaultStatsFactoryPlugin").StatsChunkOrigin;
type StatsCompilation = import("./stats/DefaultStatsFactoryPlugin").StatsCompilation;
type StatsError = import("./stats/DefaultStatsFactoryPlugin").StatsError;
type StatsLogging = import("./stats/DefaultStatsFactoryPlugin").StatsLogging;
type StatsLoggingEntry = import("./stats/DefaultStatsFactoryPlugin").StatsLoggingEntry;
type StatsModule = import("./stats/DefaultStatsFactoryPlugin").StatsModule;
type StatsModuleIssuer = import("./stats/DefaultStatsFactoryPlugin").StatsModuleIssuer;
type StatsModuleReason = import("./stats/DefaultStatsFactoryPlugin").StatsModuleReason;
type StatsModuleTraceDependency = import("./stats/DefaultStatsFactoryPlugin").StatsModuleTraceDependency;
type StatsModuleTraceItem = import("./stats/DefaultStatsFactoryPlugin").StatsModuleTraceItem;
type StatsProfile = import("./stats/DefaultStatsFactoryPlugin").StatsProfile;
type ObjectSerializerContext = import("./serialization/ObjectMiddleware").ObjectSerializerContext;
type ObjectDeserializerContext = import("./serialization/ObjectMiddleware").ObjectDeserializerContext;
type InputFileSystem = import("./fs/fs").InputFileSystem;
type OutputFileSystem = import("./fs/fs").OutputFileSystem;
/**
 * The loader-authoring types, re-exported here because this file is what
 * `generate-types.js` reads webpack's public type surface from
 */
type LoaderModule<OptionsType = {}, ContextAdditions = {}> = import("./loaders/LoaderRunner").LoaderModule<OptionsType, ContextAdditions>;
type RawLoaderDefinition<OptionsType = {}, ContextAdditions = {}> = import("./loaders/LoaderRunner").RawLoaderDefinition<OptionsType, ContextAdditions>;
type LoaderDefinition<OptionsType = {}, ContextAdditions = {}> = import("./loaders/LoaderRunner").LoaderDefinition<OptionsType, ContextAdditions>;
type LoaderDefinitionFunction<OptionsType = {}, ContextAdditions = {}> = import("./loaders/LoaderRunner").LoaderDefinitionFunction<OptionsType, ContextAdditions>;
type PitchLoaderDefinitionFunction<OptionsType = {}, ContextAdditions = {}> = import("./loaders/LoaderRunner").PitchLoaderDefinitionFunction<OptionsType, ContextAdditions>;
type RawLoaderDefinitionFunction<OptionsType = {}, ContextAdditions = {}> = import("./loaders/LoaderRunner").RawLoaderDefinitionFunction<OptionsType, ContextAdditions>;
type LoaderContext<OptionsType> = import("./module/NormalModule").LoaderContext<OptionsType>;
