export = DefaultStatsFactoryPlugin;
declare class DefaultStatsFactoryPlugin {
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
declare namespace DefaultStatsFactoryPlugin {
  export {
    Source,
    Chunk,
    ChunkGroup,
    OriginRecord,
    Compilation,
    Asset,
    AssetInfo,
    NormalizedStatsOptions,
    Compiler,
    Dependency,
    DependencyLocation,
    Module,
    ModuleGraphConnection,
    ModuleProfile,
    RequestShortener,
    WebpackError,
    Comparator,
    RuntimeSpec,
    GroupConfig,
    StatsFactory,
    StatsFactoryContext,
    StatsCompilation,
    KnownStatsCompilation,
    StatsLogging,
    KnownStatsLogging,
    StatsLoggingEntry,
    KnownStatsLoggingEntry,
    StatsAsset,
    KnownStatsAsset,
    StatsChunkGroup,
    KnownStatsChunkGroup,
    StatsModule,
    KnownStatsModule,
    StatsProfile,
    KnownStatsProfile,
    StatsModuleIssuer,
    KnownStatsModuleIssuer,
    StatsModuleReason,
    KnownStatsModuleReason,
    StatsChunk,
    KnownStatsChunk,
    StatsChunkOrigin,
    KnownStatsChunkOrigin,
    StatsModuleTraceItem,
    KnownStatsModuleTraceItem,
    StatsModuleTraceDependency,
    KnownStatsModuleTraceDependency,
    StatsError,
    KnownStatsError,
    PreprocessedAsset,
    ExtractorsByOption,
    SimpleExtractors,
    MappedValues,
  };
}
type Compiler = import('../Compiler');
type Source = any;
type Chunk = import('../Chunk');
type ChunkGroup = import('../ChunkGroup');
type OriginRecord = import('../ChunkGroup').OriginRecord;
type Compilation = import('../Compilation');
type Asset = import('../Compilation').Asset;
type AssetInfo = import('../Compilation').AssetInfo;
type NormalizedStatsOptions = import('../Compilation').NormalizedStatsOptions;
type Dependency = import('../Dependency');
type DependencyLocation = import('../Dependency').DependencyLocation;
type Module = import('../Module');
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ModuleProfile = import('../ModuleProfile');
type RequestShortener = import('../RequestShortener');
type WebpackError = import('../WebpackError');
/**
 * <T>
 */
type Comparator<T> = import('../util/comparators').Comparator<T>;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type GroupConfig = import('../util/smartGrouping').GroupConfig<any, object>;
type StatsFactory = import('./StatsFactory');
type StatsFactoryContext = import('./StatsFactory').StatsFactoryContext;
type StatsCompilation = KnownStatsCompilation & Record<string, any>;
type KnownStatsCompilation = {
  env?: any | undefined;
  name?: string | undefined;
  hash?: string | undefined;
  version?: string | undefined;
  time?: number | undefined;
  builtAt?: number | undefined;
  needAdditionalPass?: boolean | undefined;
  publicPath?: string | undefined;
  outputPath?: string | undefined;
  assetsByChunkName?: Record<string, string[]> | undefined;
  assets?: StatsAsset[] | undefined;
  filteredAssets?: number | undefined;
  chunks?: StatsChunk[] | undefined;
  modules?: StatsModule[] | undefined;
  filteredModules?: number | undefined;
  entrypoints?: Record<string, StatsChunkGroup> | undefined;
  namedChunkGroups?: Record<string, StatsChunkGroup> | undefined;
  errors?: StatsError[] | undefined;
  errorsCount?: number | undefined;
  warnings?: StatsError[] | undefined;
  warningsCount?: number | undefined;
  children?: StatsCompilation[] | undefined;
  logging?: Record<string, StatsLogging> | undefined;
};
type StatsLogging = KnownStatsLogging & Record<string, any>;
type KnownStatsLogging = {
  entries: StatsLoggingEntry[];
  filteredEntries: number;
  debug: boolean;
};
type StatsLoggingEntry = KnownStatsLoggingEntry & Record<string, any>;
type KnownStatsLoggingEntry = {
  type: string;
  message: string;
  trace?: string[] | undefined;
  children?: StatsLoggingEntry[] | undefined;
  args?: any[] | undefined;
  time?: number | undefined;
};
type StatsAsset = KnownStatsAsset & Record<string, any>;
type KnownStatsAsset = {
  type: string;
  name: string;
  info: AssetInfo;
  size: number;
  emitted: boolean;
  comparedForEmit: boolean;
  cached: boolean;
  related?: StatsAsset[] | undefined;
  chunkNames?: (string | number)[] | undefined;
  chunkIdHints?: (string | number)[] | undefined;
  chunks?: (string | number)[] | undefined;
  auxiliaryChunkNames?: (string | number)[] | undefined;
  auxiliaryChunks?: (string | number)[] | undefined;
  auxiliaryChunkIdHints?: (string | number)[] | undefined;
  filteredRelated?: number | undefined;
  isOverSizeLimit?: boolean | undefined;
};
type StatsChunkGroup = KnownStatsChunkGroup & Record<string, any>;
type KnownStatsChunkGroup = {
  name?: string | undefined;
  chunks?: (string | number)[] | undefined;
  assets?:
    | {
        name: string;
        size?: number;
      }[]
    | undefined;
  filteredAssets?: number | undefined;
  assetsSize?: number | undefined;
  auxiliaryAssets?:
    | {
        name: string;
        size?: number;
      }[]
    | undefined;
  filteredAuxiliaryAssets?: number | undefined;
  auxiliaryAssetsSize?: number | undefined;
  children?: {
    [x: string]: StatsChunkGroup[];
  };
  childAssets?: {
    [x: string]: string[];
  };
  isOverSizeLimit?: boolean | undefined;
};
type StatsModule = KnownStatsModule & Record<string, any>;
type KnownStatsModule = {
  type?: string | undefined;
  moduleType?: string | undefined;
  layer?: string | undefined;
  identifier?: string | undefined;
  name?: string | undefined;
  nameForCondition?: string | undefined;
  index?: number | undefined;
  preOrderIndex?: number | undefined;
  index2?: number | undefined;
  postOrderIndex?: number | undefined;
  size?: number | undefined;
  sizes?: {
    [x: string]: number;
  };
  cacheable?: boolean | undefined;
  built?: boolean | undefined;
  codeGenerated?: boolean | undefined;
  buildTimeExecuted?: boolean | undefined;
  cached?: boolean | undefined;
  optional?: boolean | undefined;
  orphan?: boolean | undefined;
  id?: (string | number) | undefined;
  issuerId?: (string | number) | undefined;
  chunks?: (string | number)[] | undefined;
  assets?: (string | number)[] | undefined;
  dependent?: boolean | undefined;
  issuer?: string | undefined;
  issuerName?: string | undefined;
  issuerPath?: StatsModuleIssuer[] | undefined;
  failed?: boolean | undefined;
  errors?: number | undefined;
  warnings?: number | undefined;
  profile?: StatsProfile | undefined;
  reasons?: StatsModuleReason[] | undefined;
  usedExports?: (boolean | string[]) | undefined;
  providedExports?: string[] | undefined;
  optimizationBailout?: string[] | undefined;
  depth?: number | undefined;
  modules?: StatsModule[] | undefined;
  filteredModules?: number | undefined;
  source?: ReturnType<Source['source']> | undefined;
};
type StatsProfile = KnownStatsProfile & Record<string, any>;
type KnownStatsProfile = {
  total: number;
  resolving: number;
  restoring: number;
  building: number;
  integration: number;
  storing: number;
  additionalResolving: number;
  additionalIntegration: number;
  factory: number;
  dependencies: number;
};
type StatsModuleIssuer = KnownStatsModuleIssuer & Record<string, any>;
type KnownStatsModuleIssuer = {
  identifier?: string | undefined;
  name?: string | undefined;
  id?: (string | number) | undefined;
  profile?: StatsProfile | undefined;
};
type StatsModuleReason = KnownStatsModuleReason & Record<string, any>;
type KnownStatsModuleReason = {
  moduleIdentifier?: string | undefined;
  module?: string | undefined;
  moduleName?: string | undefined;
  resolvedModuleIdentifier?: string | undefined;
  resolvedModule?: string | undefined;
  type?: string | undefined;
  active: boolean;
  explanation?: string | undefined;
  userRequest?: string | undefined;
  loc?: string | undefined;
  moduleId?: (string | number) | undefined;
  resolvedModuleId?: (string | number) | undefined;
};
type StatsChunk = KnownStatsChunk & Record<string, any>;
type KnownStatsChunk = {
  rendered: boolean;
  initial: boolean;
  entry: boolean;
  recorded: boolean;
  reason?: string | undefined;
  size: number;
  sizes?: Record<string, number> | undefined;
  names?: string[] | undefined;
  idHints?: string[] | undefined;
  runtime?: string[] | undefined;
  files?: string[] | undefined;
  auxiliaryFiles?: string[] | undefined;
  hash: string;
  childrenByOrder?: Record<string, (string | number)[]> | undefined;
  id?: (string | number) | undefined;
  siblings?: (string | number)[] | undefined;
  parents?: (string | number)[] | undefined;
  children?: (string | number)[] | undefined;
  modules?: StatsModule[] | undefined;
  filteredModules?: number | undefined;
  origins?: StatsChunkOrigin[] | undefined;
};
type StatsChunkOrigin = KnownStatsChunkOrigin & Record<string, any>;
type KnownStatsChunkOrigin = {
  module?: string | undefined;
  moduleIdentifier?: string | undefined;
  moduleName?: string | undefined;
  loc?: string | undefined;
  request?: string | undefined;
  moduleId?: (string | number) | undefined;
};
type StatsModuleTraceItem = KnownStatsModuleTraceItem & Record<string, any>;
type KnownStatsModuleTraceItem = {
  originIdentifier?: string | undefined;
  originName?: string | undefined;
  moduleIdentifier?: string | undefined;
  moduleName?: string | undefined;
  dependencies?: StatsModuleTraceDependency[] | undefined;
  originId?: (string | number) | undefined;
  moduleId?: (string | number) | undefined;
};
type StatsModuleTraceDependency = KnownStatsModuleTraceDependency &
  Record<string, any>;
type KnownStatsModuleTraceDependency = {
  loc?: string | undefined;
};
type StatsError = KnownStatsError & Record<string, any>;
type KnownStatsError = {
  message: string;
  chunkName?: string | undefined;
  chunkEntry?: boolean | undefined;
  chunkInitial?: boolean | undefined;
  file?: string | undefined;
  moduleIdentifier?: string | undefined;
  moduleName?: string | undefined;
  loc?: string | undefined;
  chunkId?: (string | number) | undefined;
  moduleId?: (string | number) | undefined;
  moduleTrace?: StatsModuleTraceItem[] | undefined;
  details?: any | undefined;
  stack?: string | undefined;
};
type PreprocessedAsset = Asset & {
  type: string;
  related: PreprocessedAsset[];
};
type ExtractorsByOption<T, O> = {
  [x: string]: (
    object: O,
    data: T,
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
    factory: StatsFactory,
  ) => void;
};
type SimpleExtractors = {
  compilation: ExtractorsByOption<Compilation, StatsCompilation>;
  asset: ExtractorsByOption<PreprocessedAsset, StatsAsset>;
  asset$visible: ExtractorsByOption<PreprocessedAsset, StatsAsset>;
  chunkGroup: ExtractorsByOption<
    {
      name: string;
      chunkGroup: ChunkGroup;
    },
    StatsChunkGroup
  >;
  module: ExtractorsByOption<Module, StatsModule>;
  module$visible: ExtractorsByOption<Module, StatsModule>;
  moduleIssuer: ExtractorsByOption<Module, StatsModuleIssuer>;
  profile: ExtractorsByOption<ModuleProfile, StatsProfile>;
  moduleReason: ExtractorsByOption<ModuleGraphConnection, StatsModuleReason>;
  chunk: ExtractorsByOption<Chunk, StatsChunk>;
  chunkOrigin: ExtractorsByOption<OriginRecord, StatsChunkOrigin>;
  error: ExtractorsByOption<WebpackError, StatsError>;
  warning: ExtractorsByOption<WebpackError, StatsError>;
  moduleTraceItem: ExtractorsByOption<
    {
      origin: Module;
      module: Module;
    },
    StatsModuleTraceItem
  >;
  moduleTraceDependency: ExtractorsByOption<
    Dependency,
    StatsModuleTraceDependency
  >;
};
/**
 * <T, R>
 */
type MappedValues<T, R> = { [P in keyof T]: R };
declare namespace module {
  namespace exports {
    export {
      Source,
      Chunk,
      ChunkGroup,
      OriginRecord,
      Compilation,
      Asset,
      AssetInfo,
      NormalizedStatsOptions,
      Compiler,
      Dependency,
      DependencyLocation,
      Module,
      ModuleGraphConnection,
      ModuleProfile,
      RequestShortener,
      WebpackError,
      Comparator,
      RuntimeSpec,
      GroupConfig,
      StatsFactory,
      StatsFactoryContext,
      StatsCompilation,
      KnownStatsCompilation,
      StatsLogging,
      KnownStatsLogging,
      StatsLoggingEntry,
      KnownStatsLoggingEntry,
      StatsAsset,
      KnownStatsAsset,
      StatsChunkGroup,
      KnownStatsChunkGroup,
      StatsModule,
      KnownStatsModule,
      StatsProfile,
      KnownStatsProfile,
      StatsModuleIssuer,
      KnownStatsModuleIssuer,
      StatsModuleReason,
      KnownStatsModuleReason,
      StatsChunk,
      KnownStatsChunk,
      StatsChunkOrigin,
      KnownStatsChunkOrigin,
      StatsModuleTraceItem,
      KnownStatsModuleTraceItem,
      StatsModuleTraceDependency,
      KnownStatsModuleTraceDependency,
      StatsError,
      KnownStatsError,
      PreprocessedAsset,
      ExtractorsByOption,
      SimpleExtractors,
      MappedValues,
    };
  }
}
