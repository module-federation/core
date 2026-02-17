declare const _exports: import('./webpack').WebpackFunctionSingle &
  import('./webpack').WebpackFunctionMulti & {
    readonly webpack: import('./webpack').WebpackFunctionSingle &
      import('./webpack').WebpackFunctionMulti;
    readonly validate: (options: any) => void;
    readonly validateSchema: (
      schema: import('schema-utils/declarations/validate').Schema,
      options: object | object[],
      validationConfiguration?: import('schema-utils/declarations/validate').ValidationErrorConfiguration,
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
    readonly IgnorePlugin: typeof import('./IgnorePlugin');
    readonly JavascriptModulesPlugin: typeof import('./javascript/JavascriptModulesPlugin');
    readonly LibManifestPlugin: typeof import('./LibManifestPlugin');
    readonly LibraryTemplatePlugin: typeof import('./LibraryTemplatePlugin');
    readonly LoaderOptionsPlugin: typeof import('./LoaderOptionsPlugin');
    readonly LoaderTargetPlugin: typeof import('./LoaderTargetPlugin');
    readonly Module: typeof import('./Module');
    readonly ModuleFilenameHelpers: typeof import('./ModuleFilenameHelpers');
    readonly ModuleGraph: typeof import('./ModuleGraph');
    readonly ModuleGraphConnection: typeof import('./ModuleGraphConnection');
    readonly NoEmitOnErrorsPlugin: typeof import('./NoEmitOnErrorsPlugin');
    readonly NormalModule: typeof import('./NormalModule');
    readonly NormalModuleReplacementPlugin: typeof import('./NormalModuleReplacementPlugin');
    readonly MultiCompiler: typeof import('./MultiCompiler');
    readonly Parser: typeof import('./Parser');
    readonly PrefetchPlugin: typeof import('./PrefetchPlugin');
    readonly ProgressPlugin: typeof import('./ProgressPlugin');
    readonly ProvidePlugin: typeof import('./ProvidePlugin');
    readonly RuntimeGlobals: typeof import('./RuntimeGlobals');
    readonly RuntimeModule: typeof import('./RuntimeModule');
    readonly SingleEntryPlugin: typeof import('./EntryPlugin');
    readonly SourceMapDevToolPlugin: typeof import('./SourceMapDevToolPlugin');
    readonly Stats: typeof import('./Stats');
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
    readonly WebpackOptionsValidationError: typeof import('schema-utils/declarations/ValidationError').default;
    readonly ValidationError: typeof import('schema-utils/declarations/ValidationError').default;
    cache: {
      readonly MemoryCachePlugin: typeof import('./cache/MemoryCachePlugin');
    };
    config: {
      readonly getNormalizedWebpackOptions: (
        config: import('../declarations/WebpackOptions').WebpackOptions,
      ) => import('../declarations/WebpackOptions').WebpackOptionsNormalized;
      readonly applyWebpackOptionsDefaults: (
        options: import('../declarations/WebpackOptions').WebpackOptionsNormalized,
      ) => void;
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
      readonly FetchCompileAsyncWasmPlugin: typeof import('./web/FetchCompileAsyncWasmPlugin');
      readonly FetchCompileWasmPlugin: typeof import('./web/FetchCompileWasmPlugin');
      readonly JsonpChunkLoadingRuntimeModule: typeof import('./web/JsonpChunkLoadingRuntimeModule');
      readonly JsonpTemplatePlugin: typeof import('./web/JsonpTemplatePlugin');
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
    };
    electron: {
      readonly ElectronTargetPlugin: typeof import('./electron/ElectronTargetPlugin');
    };
    wasm: {
      readonly AsyncWebAssemblyModulesPlugin: typeof import('./wasm-async/AsyncWebAssemblyModulesPlugin');
      readonly EnableWasmLoadingPlugin: typeof import('./wasm/EnableWasmLoadingPlugin');
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
        options: import('./container/options').ContainerOptionsFormat<T>,
      ) => Record<string, string | string[] | T>;
    };
    sharing: {
      readonly ConsumeSharedPlugin: typeof import('./sharing/ConsumeSharedPlugin');
      readonly ProvideSharedPlugin: typeof import('./sharing/ProvideSharedPlugin');
      readonly SharePlugin: typeof import('./sharing/SharePlugin');
      readonly scope: <T>(
        scope: string,
        options: import('./container/options').ContainerOptionsFormat<T>,
      ) => Record<string, string | string[] | T>;
    };
    debug: {
      readonly ProfilingPlugin: typeof import('./debug/ProfilingPlugin');
    };
    util: {
      readonly createHash: (
        algorithm: string | typeof import('./util/Hash'),
      ) => import('./util/Hash');
      readonly comparators: typeof import('./util/comparators');
      readonly runtime: typeof import('./util/runtime');
      readonly serialization: {
        readonly register: typeof import('./serialization/ObjectMiddleware').register;
        readonly registerLoader: typeof import('./serialization/ObjectMiddleware').registerLoader;
        readonly registerNotSerializable: typeof import('./serialization/ObjectMiddleware').registerNotSerializable;
        readonly NOT_SERIALIZABLE: {};
        readonly MEASURE_START_OPERATION: unique symbol /** @typedef {import("./Compilation").Asset} Asset */;
        readonly MEASURE_END_OPERATION: unique symbol;
        readonly buffersSerializer: import('./serialization/Serializer');
        createFileSerializer: (
          fs: import('./util/fs').IntermediateFileSystem,
          hashFunction: string | typeof import('./util/Hash'),
        ) => import('./serialization/Serializer');
      };
      readonly cleverMerge: <T_1, O>(
        first: T_1,
        second: O,
      ) => T_1 | O | (T_1 & O);
      readonly LazySet: typeof import('./util/LazySet');
    };
    readonly sources: any;
    experiments: {
      schemes: {
        readonly HttpUriPlugin: typeof import('./schemes/HttpUriPlugin');
      };
      ids: {
        readonly SyncModuleIdsPlugin: typeof import('./ids/SyncModuleIdsPlugin');
      };
    };
  };
export = _exports;
export type Entry = import('../declarations/WebpackOptions').Entry;
export type EntryNormalized =
  import('../declarations/WebpackOptions').EntryNormalized;
export type EntryObject = import('../declarations/WebpackOptions').EntryObject;
export type ExternalItemFunctionData =
  import('../declarations/WebpackOptions').ExternalItemFunctionData;
export type ExternalItemObjectKnown =
  import('../declarations/WebpackOptions').ExternalItemObjectKnown;
export type ExternalItemObjectUnknown =
  import('../declarations/WebpackOptions').ExternalItemObjectUnknown;
export type ExternalItemValue =
  import('../declarations/WebpackOptions').ExternalItemValue;
export type Externals = import('../declarations/WebpackOptions').Externals;
export type FileCacheOptions =
  import('../declarations/WebpackOptions').FileCacheOptions;
export type LibraryOptions =
  import('../declarations/WebpackOptions').LibraryOptions;
export type MemoryCacheOptions =
  import('../declarations/WebpackOptions').MemoryCacheOptions;
export type ModuleOptions =
  import('../declarations/WebpackOptions').ModuleOptions;
export type ResolveOptions =
  import('../declarations/WebpackOptions').ResolveOptions;
export type RuleSetCondition =
  import('../declarations/WebpackOptions').RuleSetCondition;
export type RuleSetConditionAbsolute =
  import('../declarations/WebpackOptions').RuleSetConditionAbsolute;
export type RuleSetRule = import('../declarations/WebpackOptions').RuleSetRule;
export type RuleSetUse = import('../declarations/WebpackOptions').RuleSetUse;
export type RuleSetUseItem =
  import('../declarations/WebpackOptions').RuleSetUseItem;
export type StatsOptions =
  import('../declarations/WebpackOptions').StatsOptions;
export type Configuration =
  import('../declarations/WebpackOptions').WebpackOptions;
export type WebpackOptionsNormalized =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
export type WebpackPluginFunction =
  import('../declarations/WebpackOptions').WebpackPluginFunction;
export type WebpackPluginInstance =
  import('../declarations/WebpackOptions').WebpackPluginInstance;
export type ChunkGroup = import('./ChunkGroup');
export type Asset = import('./Compilation').Asset;
export type AssetInfo = import('./Compilation').AssetInfo;
export type EntryOptions = import('./Compilation').EntryOptions;
export type PathData = import('./Compilation').PathData;
export type AssetEmittedInfo = import('./Compiler').AssetEmittedInfo;
export type MultiStats = import('./MultiStats');
export type ResolveData = import('./NormalModuleFactory').ResolveData;
export type ParserState = import('./Parser').ParserState;
export type ResolvePluginInstance =
  import('./ResolverFactory').ResolvePluginInstance;
export type Resolver = import('./ResolverFactory').Resolver;
export type Watching = import('./Watching');
export type Argument = import('./cli').Argument;
export type Problem = import('./cli').Problem;
export type StatsAsset = import('./stats/DefaultStatsFactoryPlugin').StatsAsset;
export type StatsChunk = import('./stats/DefaultStatsFactoryPlugin').StatsChunk;
export type StatsChunkGroup =
  import('./stats/DefaultStatsFactoryPlugin').StatsChunkGroup;
export type StatsChunkOrigin =
  import('./stats/DefaultStatsFactoryPlugin').StatsChunkOrigin;
export type StatsCompilation =
  import('./stats/DefaultStatsFactoryPlugin').StatsCompilation;
export type StatsError = import('./stats/DefaultStatsFactoryPlugin').StatsError;
export type StatsLogging =
  import('./stats/DefaultStatsFactoryPlugin').StatsLogging;
export type StatsLoggingEntry =
  import('./stats/DefaultStatsFactoryPlugin').StatsLoggingEntry;
export type StatsModule =
  import('./stats/DefaultStatsFactoryPlugin').StatsModule;
export type StatsModuleIssuer =
  import('./stats/DefaultStatsFactoryPlugin').StatsModuleIssuer;
export type StatsModuleReason =
  import('./stats/DefaultStatsFactoryPlugin').StatsModuleReason;
export type StatsModuleTraceDependency =
  import('./stats/DefaultStatsFactoryPlugin').StatsModuleTraceDependency;
export type StatsModuleTraceItem =
  import('./stats/DefaultStatsFactoryPlugin').StatsModuleTraceItem;
export type StatsProfile =
  import('./stats/DefaultStatsFactoryPlugin').StatsProfile;
