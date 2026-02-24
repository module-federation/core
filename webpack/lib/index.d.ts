declare namespace _exports {
  export {
    Entry,
    EntryNormalized,
    EntryObject,
    ExternalItem,
    ExternalItemFunction,
    ExternalItemObjectKnown,
    ExternalItemObjectUnknown,
    ExternalItemValue,
    Externals,
    FileCacheOptions,
    GeneratorOptionsByModuleTypeKnown,
    LibraryOptions,
    MemoryCacheOptions,
    ModuleOptions,
    ParserOptionsByModuleTypeKnown,
    ResolveOptions,
    RuleSetCondition,
    RuleSetConditionAbsolute,
    RuleSetRule,
    RuleSetUse,
    RuleSetUseFunction,
    RuleSetUseItem,
    StatsOptions,
    Configuration,
    WebpackOptionsNormalized,
    WebpackPluginFunction,
    WebpackPluginInstance,
    ChunkGroup,
    AssetEmittedInfo,
    Asset,
    AssetInfo,
    EntryOptions,
    PathData,
    CodeGenerationResults,
    Entrypoint,
    ExternalItemFunctionCallback,
    ExternalItemFunctionData,
    ExternalItemFunctionDataGetResolve,
    ExternalItemFunctionDataGetResolveCallbackResult,
    ExternalItemFunctionDataGetResolveResult,
    ExternalItemFunctionPromise,
    MultiCompilerOptions,
    MultiConfiguration,
    MultiStats,
    MultiStatsOptions,
    ResolveData,
    ParserState,
    ResolvePluginInstance,
    Resolver,
    RenderManifestEntry,
    RenderManifestOptions,
    TemplatePath,
    Watching,
    Argument,
    Problem,
    Colors,
    ColorsOptions,
    StatsAsset,
    StatsChunk,
    StatsChunkGroup,
    StatsChunkOrigin,
    StatsCompilation,
    StatsError,
    StatsLogging,
    StatsLoggingEntry,
    StatsModule,
    StatsModuleIssuer,
    StatsModuleReason,
    StatsModuleTraceDependency,
    StatsModuleTraceItem,
    StatsProfile,
    ObjectSerializerContext,
    ObjectDeserializerContext,
    InputFileSystem,
    OutputFileSystem,
  };
}
declare const _exports: {
  /**
   * @overload
   * @param {WebpackOptions} options options object
   * @param {Callback<Stats>} callback callback
   * @returns {Compiler | null} the compiler object
   */
  (
    options: import('./webpack').WebpackOptions,
    callback: import('./webpack').Callback<import('./webpack').Stats>,
  ): import('./Compiler') | null;
  /**
   * @overload
   * @param {WebpackOptions} options options object
   * @returns {Compiler} the compiler object
   */
  (options: import('./webpack').WebpackOptions): import('./Compiler');
  /**
   * @overload
   * @param {MultiWebpackOptions} options options objects
   * @param {Callback<MultiStats>} callback callback
   * @returns {MultiCompiler | null} the multi compiler object
   */
  (
    options: import('./webpack').MultiWebpackOptions,
    callback: import('./webpack').Callback<import('./webpack').MultiStats>,
  ): import('./MultiCompiler') | null;
  /**
   * @overload
   * @param {MultiWebpackOptions} options options objects
   * @returns {MultiCompiler} the multi compiler object
   */
  (options: import('./webpack').MultiWebpackOptions): import('./MultiCompiler');
} & {
  readonly webpack: {
    /**
     * @overload
     * @param {WebpackOptions} options options object
     * @param {Callback<Stats>} callback callback
     * @returns {Compiler | null} the compiler object
     */
    (
      options: import('./webpack').WebpackOptions,
      callback: import('./webpack').Callback<import('./webpack').Stats>,
    ): import('./Compiler') | null;
    /**
     * @overload
     * @param {WebpackOptions} options options object
     * @returns {Compiler} the compiler object
     */
    (options: import('./webpack').WebpackOptions): import('./Compiler');
    /**
     * @overload
     * @param {MultiWebpackOptions} options options objects
     * @param {Callback<MultiStats>} callback callback
     * @returns {MultiCompiler | null} the multi compiler object
     */
    (
      options: import('./webpack').MultiWebpackOptions,
      callback: import('./webpack').Callback<import('./webpack').MultiStats>,
    ): import('./MultiCompiler') | null;
    /**
     * @overload
     * @param {MultiWebpackOptions} options options objects
     * @returns {MultiCompiler} the multi compiler object
     */
    (
      options: import('./webpack').MultiWebpackOptions,
    ): import('./MultiCompiler');
  };
  /**
   * @returns {(configuration: Configuration | MultiConfiguration) => void} validate fn
   */
  readonly validate: (
    configuration: Configuration | MultiConfiguration,
  ) => void;
  readonly validateSchema: (
    schema: Parameters<typeof import('schema-utils').validate>[0],
    options: Parameters<typeof import('schema-utils').validate>[1],
    validationConfiguration?:
      | Parameters<typeof import('schema-utils').validate>[2]
      | undefined,
  ) => void;
  readonly version: string;
  readonly cli: typeof import('./cli');
  readonly AutomaticPrefetchPlugin: typeof import('./AutomaticPrefetchPlugin');
  readonly AsyncDependenciesBlock: typeof import('./AsyncDependenciesBlock');
  readonly BannerPlugin: typeof import('./BannerPlugin');
  readonly Cache: typeof import('./Cache');
  readonly Chunk: typeof import('./Chunk');
  readonly ChunkGraph: typeof import('./ChunkGraph');
  readonly CleanPlugin: typeof import('./CleanPlugin');
  readonly Compilation: typeof import('./Compilation');
  readonly Compiler: typeof import('./Compiler');
  readonly ConcatenationScope: typeof import('./ConcatenationScope');
  readonly ContextExclusionPlugin: typeof import('./ContextExclusionPlugin');
  readonly ContextReplacementPlugin: typeof import('./ContextReplacementPlugin');
  readonly DefinePlugin: typeof import('./DefinePlugin');
  readonly DelegatedPlugin: typeof import('./DelegatedPlugin');
  readonly Dependency: typeof import('./Dependency');
  readonly DllPlugin: typeof import('./DllPlugin');
  readonly DllReferencePlugin: typeof import('./DllReferencePlugin');
  readonly DynamicEntryPlugin: typeof import('./DynamicEntryPlugin');
  readonly DotenvPlugin: typeof import('./DotenvPlugin');
  readonly EntryOptionPlugin: typeof import('./EntryOptionPlugin');
  readonly EntryPlugin: typeof import('./EntryPlugin');
  readonly EnvironmentPlugin: typeof import('./EnvironmentPlugin');
  readonly EvalDevToolModulePlugin: typeof import('./EvalDevToolModulePlugin');
  readonly EvalSourceMapDevToolPlugin: typeof import('./EvalSourceMapDevToolPlugin');
  readonly ExternalModule: typeof import('./ExternalModule');
  readonly ExternalsPlugin: typeof import('./ExternalsPlugin');
  readonly Generator: typeof import('./Generator');
  readonly HotUpdateChunk: typeof import('./HotUpdateChunk');
  readonly HotModuleReplacementPlugin: typeof import('./HotModuleReplacementPlugin');
  readonly InitFragment: typeof import('./InitFragment');
  readonly IgnorePlugin: typeof import('./IgnorePlugin');
  readonly JavascriptModulesPlugin: typeof import('./javascript/JavascriptModulesPlugin');
  readonly LibManifestPlugin: typeof import('./LibManifestPlugin');
  readonly LibraryTemplatePlugin: typeof import('./LibraryTemplatePlugin');
  readonly LoaderOptionsPlugin: typeof import('./LoaderOptionsPlugin');
  readonly LoaderTargetPlugin: typeof import('./LoaderTargetPlugin');
  readonly Module: typeof import('./Module');
  readonly ModuleFactory: typeof import('./ModuleFactory');
  readonly ModuleFilenameHelpers: typeof import('./ModuleFilenameHelpers');
  readonly ModuleGraph: typeof import('./ModuleGraph');
  readonly ModuleGraphConnection: typeof import('./ModuleGraphConnection');
  readonly NoEmitOnErrorsPlugin: typeof import('./NoEmitOnErrorsPlugin');
  readonly NormalModule: typeof import('./NormalModule');
  readonly NormalModuleReplacementPlugin: typeof import('./NormalModuleReplacementPlugin');
  readonly MultiCompiler: typeof import('./MultiCompiler');
  readonly OptimizationStages: typeof import('./OptimizationStages');
  readonly Parser: typeof import('./Parser');
  readonly PlatformPlugin: typeof import('./PlatformPlugin');
  readonly PrefetchPlugin: typeof import('./PrefetchPlugin');
  readonly ProgressPlugin: typeof import('./ProgressPlugin');
  readonly ProvidePlugin: typeof import('./ProvidePlugin');
  readonly RuntimeGlobals: typeof import('./RuntimeGlobals');
  readonly RuntimeModule: typeof import('./RuntimeModule');
  readonly SingleEntryPlugin: typeof import('./EntryPlugin');
  readonly SourceMapDevToolPlugin: typeof import('./SourceMapDevToolPlugin');
  readonly Stats: typeof import('./Stats');
  readonly ManifestPlugin: typeof import('./ManifestPlugin');
  readonly Template: typeof import('./Template');
  readonly UsageState: Readonly<{
    Unused: 0;
    OnlyPropertiesUsed: 1;
    NoInfo: 2;
    Unknown: 3;
    Used: 4;
  }>;
  readonly WatchIgnorePlugin: typeof import('./WatchIgnorePlugin');
  readonly WebpackError: typeof import('./WebpackError');
  readonly WebpackOptionsApply: typeof import('./WebpackOptionsApply');
  readonly WebpackOptionsDefaulter: typeof import('./WebpackOptionsDefaulter');
  readonly WebpackOptionsValidationError: typeof import('schema-utils').ValidationError;
  readonly ValidationError: typeof import('schema-utils').ValidationError;
  cache: {
    readonly MemoryCachePlugin: typeof import('./cache/MemoryCachePlugin');
  };
  config: {
    readonly getNormalizedWebpackOptions: (
      config: WebpackOptions,
    ) => import('./config/normalization').WebpackOptionsNormalized;
    readonly applyWebpackOptionsDefaults: (
      options: import('./config/defaults').WebpackOptionsNormalized,
      compilerIndex?: number | undefined,
    ) => ResolvedOptions;
  };
  dependencies: {
    readonly ModuleDependency: typeof import('./dependencies/ModuleDependency');
    readonly HarmonyImportDependency: typeof import('./dependencies/HarmonyImportDependency');
    readonly ConstDependency: typeof import('./dependencies/ConstDependency');
    readonly NullDependency: typeof import('./dependencies/NullDependency');
  };
  ids: {
    readonly ChunkModuleIdRangePlugin: typeof import('./ids/ChunkModuleIdRangePlugin');
    readonly NaturalModuleIdsPlugin: typeof import('./ids/NaturalModuleIdsPlugin');
    readonly OccurrenceModuleIdsPlugin: typeof import('./ids/OccurrenceModuleIdsPlugin');
    readonly NamedModuleIdsPlugin: typeof import('./ids/NamedModuleIdsPlugin');
    readonly DeterministicChunkIdsPlugin: typeof import('./ids/DeterministicChunkIdsPlugin');
    readonly DeterministicModuleIdsPlugin: typeof import('./ids/DeterministicModuleIdsPlugin');
    readonly NamedChunkIdsPlugin: typeof import('./ids/NamedChunkIdsPlugin');
    readonly OccurrenceChunkIdsPlugin: typeof import('./ids/OccurrenceChunkIdsPlugin');
    readonly HashedModuleIdsPlugin: typeof import('./ids/HashedModuleIdsPlugin');
  };
  javascript: {
    readonly EnableChunkLoadingPlugin: typeof import('./javascript/EnableChunkLoadingPlugin');
    readonly JavascriptModulesPlugin: typeof import('./javascript/JavascriptModulesPlugin');
    readonly JavascriptParser: typeof import('./javascript/JavascriptParser');
  };
  optimize: {
    readonly AggressiveMergingPlugin: typeof import('./optimize/AggressiveMergingPlugin');
    readonly AggressiveSplittingPlugin: typeof import('./optimize/AggressiveSplittingPlugin');
    readonly InnerGraph: typeof import('./optimize/InnerGraph');
    readonly LimitChunkCountPlugin: typeof import('./optimize/LimitChunkCountPlugin');
    readonly MergeDuplicateChunksPlugin: typeof import('./optimize/MergeDuplicateChunksPlugin');
    readonly MinChunkSizePlugin: typeof import('./optimize/MinChunkSizePlugin');
    readonly ModuleConcatenationPlugin: typeof import('./optimize/ModuleConcatenationPlugin');
    readonly RealContentHashPlugin: typeof import('./optimize/RealContentHashPlugin');
    readonly RuntimeChunkPlugin: typeof import('./optimize/RuntimeChunkPlugin');
    readonly SideEffectsFlagPlugin: typeof import('./optimize/SideEffectsFlagPlugin');
    readonly SplitChunksPlugin: typeof import('./optimize/SplitChunksPlugin');
  };
  runtime: {
    readonly GetChunkFilenameRuntimeModule: typeof import('./runtime/GetChunkFilenameRuntimeModule');
    readonly LoadScriptRuntimeModule: typeof import('./runtime/LoadScriptRuntimeModule');
  };
  prefetch: {
    readonly ChunkPrefetchPreloadPlugin: typeof import('./prefetch/ChunkPrefetchPreloadPlugin');
  };
  web: {
    readonly FetchCompileWasmPlugin: typeof import('./web/FetchCompileWasmPlugin');
    readonly FetchCompileAsyncWasmPlugin: typeof import('./web/FetchCompileAsyncWasmPlugin');
    readonly JsonpChunkLoadingRuntimeModule: typeof import('./web/JsonpChunkLoadingRuntimeModule');
    readonly JsonpTemplatePlugin: typeof import('./web/JsonpTemplatePlugin');
    readonly CssLoadingRuntimeModule: typeof import('./css/CssLoadingRuntimeModule');
  };
  esm: {
    readonly ModuleChunkLoadingRuntimeModule: typeof import('./esm/ModuleChunkLoadingRuntimeModule');
  };
  webworker: {
    readonly WebWorkerTemplatePlugin: typeof import('./webworker/WebWorkerTemplatePlugin');
  };
  node: {
    readonly NodeEnvironmentPlugin: typeof import('./node/NodeEnvironmentPlugin');
    readonly NodeSourcePlugin: typeof import('./node/NodeSourcePlugin');
    readonly NodeTargetPlugin: typeof import('./node/NodeTargetPlugin');
    readonly NodeTemplatePlugin: typeof import('./node/NodeTemplatePlugin');
    readonly ReadFileCompileWasmPlugin: typeof import('./node/ReadFileCompileWasmPlugin');
    readonly ReadFileCompileAsyncWasmPlugin: typeof import('./node/ReadFileCompileAsyncWasmPlugin');
  };
  electron: {
    readonly ElectronTargetPlugin: typeof import('./electron/ElectronTargetPlugin');
  };
  wasm: {
    readonly AsyncWebAssemblyModulesPlugin: typeof import('./wasm-async/AsyncWebAssemblyModulesPlugin');
    readonly EnableWasmLoadingPlugin: typeof import('./wasm/EnableWasmLoadingPlugin');
  };
  css: {
    readonly CssModulesPlugin: typeof import('./css/CssModulesPlugin');
  };
  library: {
    readonly AbstractLibraryPlugin: typeof import('./library/AbstractLibraryPlugin');
    readonly EnableLibraryPlugin: typeof import('./library/EnableLibraryPlugin');
  };
  container: {
    readonly ContainerPlugin: typeof import('./container/ContainerPlugin');
    readonly ContainerReferencePlugin: typeof import('./container/ContainerReferencePlugin');
    readonly ModuleFederationPlugin: typeof import('./container/ModuleFederationPlugin');
    readonly scope: <T>(
      scope: string,
      options: ContainerOptionsFormat<T>,
    ) => Record<string, string | string[] | T>;
  };
  sharing: {
    readonly ConsumeSharedPlugin: typeof import('./sharing/ConsumeSharedPlugin');
    readonly ProvideSharedPlugin: typeof import('./sharing/ProvideSharedPlugin');
    readonly SharePlugin: typeof import('./sharing/SharePlugin');
    readonly scope: <T>(
      scope: string,
      options: ContainerOptionsFormat<T>,
    ) => Record<string, string | string[] | T>;
  };
  debug: {
    readonly ProfilingPlugin: typeof import('./debug/ProfilingPlugin');
  };
  util: {
    readonly createHash: (algorithm: HashFunction) => Hash;
    readonly comparators: typeof import('./util/comparators');
    readonly runtime: typeof import('./util/runtime');
    readonly serialization: {
      readonly register: typeof import('./serialization/ObjectMiddleware').register;
      readonly registerLoader: typeof import('./serialization/ObjectMiddleware').registerLoader;
      readonly registerNotSerializable: typeof import('./serialization/ObjectMiddleware').registerNotSerializable;
      readonly NOT_SERIALIZABLE: {};
      readonly MEASURE_START_OPERATION: MEASURE_START_OPERATION;
      readonly MEASURE_END_OPERATION: MEASURE_END_OPERATION;
      readonly buffersSerializer: import('./serialization/Serializer')<
        EXPECTED_ANY,
        EXPECTED_ANY,
        EXPECTED_ANY
      >;
      createFileSerializer: <D, S, C>(
        fs: IntermediateFileSystem,
        hashFunction: string | Hash,
      ) => Serializer<D, S, C>;
    };
    readonly cleverMerge: <T, O>(
      first: T | null | undefined,
      second: O | null | undefined,
    ) => (T & O) | T | O;
    readonly LazySet: typeof import('./util/LazySet');
    readonly compileBooleanMatcher: {
      (
        map: Record<string | number, boolean>,
      ): boolean | ((value: string) => string);
      fromLists: (
        positiveItems: string[],
        negativeItems: string[],
      ) => (value: string) => string;
      itemsToRegexp: (itemsArr: string[]) => string;
    };
  };
  readonly sources: typeof import('webpack-sources');
  experiments: {
    schemes: {
      readonly HttpUriPlugin: typeof import('./schemes/HttpUriPlugin');
      readonly VirtualUrlPlugin: typeof import('./schemes/VirtualUrlPlugin');
    };
    ids: {
      readonly SyncModuleIdsPlugin: typeof import('./ids/SyncModuleIdsPlugin');
    };
  };
};
export = _exports;
type Entry = import('../declarations/WebpackOptions').Entry;
type EntryNormalized = import('../declarations/WebpackOptions').EntryNormalized;
type EntryObject = import('../declarations/WebpackOptions').EntryObject;
type ExternalItem = import('../declarations/WebpackOptions').ExternalItem;
type ExternalItemFunction =
  import('../declarations/WebpackOptions').ExternalItemFunction;
type ExternalItemObjectKnown =
  import('../declarations/WebpackOptions').ExternalItemObjectKnown;
type ExternalItemObjectUnknown =
  import('../declarations/WebpackOptions').ExternalItemObjectUnknown;
type ExternalItemValue =
  import('../declarations/WebpackOptions').ExternalItemValue;
type Externals = import('../declarations/WebpackOptions').Externals;
type FileCacheOptions =
  import('../declarations/WebpackOptions').FileCacheOptions;
type GeneratorOptionsByModuleTypeKnown =
  import('../declarations/WebpackOptions').GeneratorOptionsByModuleTypeKnown;
type LibraryOptions = import('../declarations/WebpackOptions').LibraryOptions;
type MemoryCacheOptions =
  import('../declarations/WebpackOptions').MemoryCacheOptions;
type ModuleOptions = import('../declarations/WebpackOptions').ModuleOptions;
type ParserOptionsByModuleTypeKnown =
  import('../declarations/WebpackOptions').ParserOptionsByModuleTypeKnown;
type ResolveOptions = import('../declarations/WebpackOptions').ResolveOptions;
type RuleSetCondition =
  import('../declarations/WebpackOptions').RuleSetCondition;
type RuleSetConditionAbsolute =
  import('../declarations/WebpackOptions').RuleSetConditionAbsolute;
type RuleSetRule = import('../declarations/WebpackOptions').RuleSetRule;
type RuleSetUse = import('../declarations/WebpackOptions').RuleSetUse;
type RuleSetUseFunction =
  import('../declarations/WebpackOptions').RuleSetUseFunction;
type RuleSetUseItem = import('../declarations/WebpackOptions').RuleSetUseItem;
type StatsOptions = import('../declarations/WebpackOptions').StatsOptions;
type Configuration = import('../declarations/WebpackOptions').WebpackOptions;
type WebpackOptionsNormalized =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type WebpackPluginFunction =
  import('../declarations/WebpackOptions').WebpackPluginFunction;
type WebpackPluginInstance =
  import('../declarations/WebpackOptions').WebpackPluginInstance;
type ChunkGroup = import('./ChunkGroup');
type AssetEmittedInfo = import('./Compiler').AssetEmittedInfo;
type Asset = import('./Compilation').Asset;
type AssetInfo = import('./Compilation').AssetInfo;
type EntryOptions = import('./Compilation').EntryOptions;
type PathData = import('./Compilation').PathData;
type CodeGenerationResults = import('./CodeGenerationResults');
type Entrypoint = import('./Entrypoint');
type ExternalItemFunctionCallback =
  import('./ExternalModuleFactoryPlugin').ExternalItemFunctionCallback;
type ExternalItemFunctionData =
  import('./ExternalModuleFactoryPlugin').ExternalItemFunctionData;
type ExternalItemFunctionDataGetResolve =
  import('./ExternalModuleFactoryPlugin').ExternalItemFunctionDataGetResolve;
type ExternalItemFunctionDataGetResolveCallbackResult =
  import('./ExternalModuleFactoryPlugin').ExternalItemFunctionDataGetResolveCallbackResult;
type ExternalItemFunctionDataGetResolveResult =
  import('./ExternalModuleFactoryPlugin').ExternalItemFunctionDataGetResolveResult;
type ExternalItemFunctionPromise =
  import('./ExternalModuleFactoryPlugin').ExternalItemFunctionPromise;
type MultiCompilerOptions = import('./MultiCompiler').MultiCompilerOptions;
type MultiConfiguration = import('./MultiCompiler').MultiWebpackOptions;
type MultiStats = import('./MultiStats');
type MultiStatsOptions = import('./MultiStats').MultiStatsOptions;
type ResolveData = import('./NormalModuleFactory').ResolveData;
type ParserState = import('./Parser').ParserState;
type ResolvePluginInstance = import('./ResolverFactory').ResolvePluginInstance;
type Resolver = import('./ResolverFactory').Resolver;
type RenderManifestEntry = import('./Template').RenderManifestEntry;
type RenderManifestOptions = import('./Template').RenderManifestOptions;
type TemplatePath = import('./TemplatedPathPlugin').TemplatePath;
type Watching = import('./Watching');
type Argument = import('./cli').Argument;
type Problem = import('./cli').Problem;
type Colors = import('./cli').Colors;
type ColorsOptions = import('./cli').ColorsOptions;
type StatsAsset = import('./stats/DefaultStatsFactoryPlugin').StatsAsset;
type StatsChunk = import('./stats/DefaultStatsFactoryPlugin').StatsChunk;
type StatsChunkGroup =
  import('./stats/DefaultStatsFactoryPlugin').StatsChunkGroup;
type StatsChunkOrigin =
  import('./stats/DefaultStatsFactoryPlugin').StatsChunkOrigin;
type StatsCompilation =
  import('./stats/DefaultStatsFactoryPlugin').StatsCompilation;
type StatsError = import('./stats/DefaultStatsFactoryPlugin').StatsError;
type StatsLogging = import('./stats/DefaultStatsFactoryPlugin').StatsLogging;
type StatsLoggingEntry =
  import('./stats/DefaultStatsFactoryPlugin').StatsLoggingEntry;
type StatsModule = import('./stats/DefaultStatsFactoryPlugin').StatsModule;
type StatsModuleIssuer =
  import('./stats/DefaultStatsFactoryPlugin').StatsModuleIssuer;
type StatsModuleReason =
  import('./stats/DefaultStatsFactoryPlugin').StatsModuleReason;
type StatsModuleTraceDependency =
  import('./stats/DefaultStatsFactoryPlugin').StatsModuleTraceDependency;
type StatsModuleTraceItem =
  import('./stats/DefaultStatsFactoryPlugin').StatsModuleTraceItem;
type StatsProfile = import('./stats/DefaultStatsFactoryPlugin').StatsProfile;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type InputFileSystem = import('./util/fs').InputFileSystem;
type OutputFileSystem = import('./util/fs').OutputFileSystem;
