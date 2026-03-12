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
    StatsValue,
    StatsFactory,
    StatsFactoryContext,
    Chunk,
    ChunkId,
    ChunkName,
    ModuleId,
    ChunkGroup,
    OriginRecord,
    Compilation,
    Asset,
    AssetInfo,
    ExcludeModulesType,
    KnownNormalizedStatsOptions,
    NormalizedStatsOptions,
    Compiler,
    Dependency,
    DependencyLocation,
    Module,
    NameForCondition,
    BuildInfo,
    ModuleGraphConnection,
    ModuleProfile,
    WebpackError,
    AggregateError,
    ErrorWithCause,
    ExportInfoName,
    Comparator,
    GroupConfig,
    StatsCompilation,
    KnownStatsCompilation,
    StatsLogging,
    KnownStatsLogging,
    StatsLoggingEntry,
    KnownStatsLoggingEntry,
    StatsAsset,
    ChunkIdHints,
    KnownStatsAsset,
    StatsChunkGroup,
    KnownStatsChunkGroup,
    ModuleIssuerPath,
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
    ChunkGroupInfoWithName,
    ModuleTrace,
    SimpleExtractors,
    MappedValues,
    Children,
    ModuleGroupBySizeResult,
    BaseGroup,
    BaseGroupWithChildren,
    AssetsGroupers,
    ModulesGroupers,
    ModuleReasonsGroupers,
    AssetSorters,
    ExtractFunction,
    NamedObject,
  };
}
type Source = import('webpack-sources').Source;
type StatsValue = import('../../declarations/WebpackOptions').StatsValue;
type StatsFactory = import('./StatsFactory');
type StatsFactoryContext = import('./StatsFactory').StatsFactoryContext;
type Chunk = import('../Chunk');
type ChunkId = import('../Chunk').ChunkId;
type ChunkName = import('../Chunk').ChunkName;
type ModuleId = import('../ChunkGraph').ModuleId;
type ChunkGroup = import('../ChunkGroup');
type OriginRecord = import('../ChunkGroup').OriginRecord;
type Compilation = import('../Compilation');
type Asset = import('../Compilation').Asset;
type AssetInfo = import('../Compilation').AssetInfo;
type ExcludeModulesType = import('../Compilation').ExcludeModulesType;
type KnownNormalizedStatsOptions =
  import('../Compilation').KnownNormalizedStatsOptions;
type NormalizedStatsOptions = import('../Compilation').NormalizedStatsOptions;
type Compiler = import('../Compiler');
type Dependency = import('../Dependency');
type DependencyLocation = import('../Dependency').DependencyLocation;
type Module = import('../Module');
type NameForCondition = import('../Module').NameForCondition;
type BuildInfo = import('../Module').BuildInfo;
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ModuleProfile = import('../ModuleProfile');
type WebpackError = import('../WebpackError');
type AggregateError =
  import('../serialization/AggregateErrorSerializer').AggregateError;
type ErrorWithCause =
  import('../serialization/ErrorObjectSerializer').ErrorWithCause;
type ExportInfoName = import('../ExportsInfo').ExportInfoName;
/**
 * <T>
 */
type Comparator<T_1> = import('../util/comparators').Comparator<T_1>;
type GroupConfig<I, G> = import('../util/smartGrouping').GroupConfig<I, G>;
type StatsCompilation = KnownStatsCompilation & Record<string, EXPECTED_ANY>;
type KnownStatsCompilation = {
  env?: EXPECTED_ANY | undefined;
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
  filteredWarningDetailsCount?: number | undefined;
  filteredErrorDetailsCount?: number | undefined;
};
type StatsLogging = KnownStatsLogging & Record<string, EXPECTED_ANY>;
type KnownStatsLogging = {
  entries: StatsLoggingEntry[];
  filteredEntries: number;
  debug: boolean;
};
type StatsLoggingEntry = KnownStatsLoggingEntry & Record<string, EXPECTED_ANY>;
type KnownStatsLoggingEntry = {
  type: string;
  message?: string | undefined;
  trace?: string[] | undefined;
  children?: StatsLoggingEntry[] | undefined;
  args?: EXPECTED_ANY[] | undefined;
  time?: number | undefined;
};
type StatsAsset = KnownStatsAsset & Record<string, EXPECTED_ANY>;
type ChunkIdHints = string[];
type KnownStatsAsset = {
  type: string;
  name: string;
  info: AssetInfo;
  size: number;
  emitted: boolean;
  comparedForEmit: boolean;
  cached: boolean;
  related?: StatsAsset[] | undefined;
  chunks?: ChunkId[] | undefined;
  chunkNames?: ChunkName[] | undefined;
  chunkIdHints?: ChunkIdHints | undefined;
  auxiliaryChunks?: ChunkId[] | undefined;
  auxiliaryChunkNames?: ChunkName[] | undefined;
  auxiliaryChunkIdHints?: ChunkIdHints | undefined;
  filteredRelated?: number | undefined;
  isOverSizeLimit?: boolean | undefined;
};
type StatsChunkGroup = KnownStatsChunkGroup & Record<string, EXPECTED_ANY>;
type KnownStatsChunkGroup = {
  name?: ChunkName | undefined;
  chunks?: ChunkId[] | undefined;
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
  children?: Record<string, StatsChunkGroup[]> | undefined;
  childAssets?: Record<string, string[]> | undefined;
  isOverSizeLimit?: boolean | undefined;
};
type ModuleIssuerPath = Module[];
type StatsModule = KnownStatsModule & Record<string, EXPECTED_ANY>;
type KnownStatsModule = {
  type?: string | undefined;
  moduleType?: string | undefined;
  layer?: (string | null) | undefined;
  identifier?: string | undefined;
  name?: string | undefined;
  nameForCondition?: (NameForCondition | null) | undefined;
  index?: number | undefined;
  preOrderIndex?: number | undefined;
  index2?: number | undefined;
  postOrderIndex?: number | undefined;
  size?: number | undefined;
  sizes?: Record<string, number> | undefined;
  cacheable?: boolean | undefined;
  built?: boolean | undefined;
  codeGenerated?: boolean | undefined;
  buildTimeExecuted?: boolean | undefined;
  cached?: boolean | undefined;
  optional?: boolean | undefined;
  orphan?: boolean | undefined;
  id?: ModuleId | undefined;
  issuerId?: (ModuleId | null) | undefined;
  chunks?: ChunkId[] | undefined;
  assets?: string[] | undefined;
  dependent?: boolean | undefined;
  issuer?: (string | null) | undefined;
  issuerName?: (string | null) | undefined;
  issuerPath?: (StatsModuleIssuer[] | null) | undefined;
  failed?: boolean | undefined;
  errors?: number | undefined;
  warnings?: number | undefined;
  profile?: StatsProfile | undefined;
  reasons?: StatsModuleReason[] | undefined;
  usedExports?: (boolean | null | ExportInfoName[]) | undefined;
  providedExports?: (ExportInfoName[] | null) | undefined;
  optimizationBailout?: string[] | undefined;
  depth?: (number | null) | undefined;
  modules?: StatsModule[] | undefined;
  filteredModules?: number | undefined;
  source?: ReturnType<Source['source']> | undefined;
};
type StatsProfile = KnownStatsProfile & Record<string, EXPECTED_ANY>;
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
type StatsModuleIssuer = KnownStatsModuleIssuer & Record<string, EXPECTED_ANY>;
type KnownStatsModuleIssuer = {
  identifier: string;
  name: string;
  id?: ModuleId | undefined;
  profile: StatsProfile;
};
type StatsModuleReason = KnownStatsModuleReason & Record<string, EXPECTED_ANY>;
type KnownStatsModuleReason = {
  moduleIdentifier: string | null;
  module: string | null;
  moduleName: string | null;
  resolvedModuleIdentifier: string | null;
  resolvedModule: string | null;
  type: string | null;
  active: boolean;
  explanation: string | null;
  userRequest: string | null;
  loc?: (string | null) | undefined;
  moduleId?: (ModuleId | null) | undefined;
  resolvedModuleId?: (ModuleId | null) | undefined;
};
type StatsChunk = KnownStatsChunk & Record<string, EXPECTED_ANY>;
type KnownStatsChunk = {
  rendered: boolean;
  initial: boolean;
  entry: boolean;
  recorded: boolean;
  reason?: string | undefined;
  size: number;
  sizes: Record<string, number>;
  names: string[];
  idHints: string[];
  runtime?: string[] | undefined;
  files: string[];
  auxiliaryFiles: string[];
  hash: string;
  childrenByOrder: Record<string, ChunkId[]>;
  id?: ChunkId | undefined;
  siblings?: ChunkId[] | undefined;
  parents?: ChunkId[] | undefined;
  children?: ChunkId[] | undefined;
  modules?: StatsModule[] | undefined;
  filteredModules?: number | undefined;
  origins?: StatsChunkOrigin[] | undefined;
};
type StatsChunkOrigin = KnownStatsChunkOrigin & Record<string, EXPECTED_ANY>;
type KnownStatsChunkOrigin = {
  module: string;
  moduleIdentifier: string;
  moduleName: string;
  loc: string;
  request: string;
  moduleId?: ModuleId | undefined;
};
type StatsModuleTraceItem = KnownStatsModuleTraceItem &
  Record<string, EXPECTED_ANY>;
type KnownStatsModuleTraceItem = {
  originIdentifier?: string | undefined;
  originName?: string | undefined;
  moduleIdentifier?: string | undefined;
  moduleName?: string | undefined;
  dependencies?: StatsModuleTraceDependency[] | undefined;
  originId?: ModuleId | undefined;
  moduleId?: ModuleId | undefined;
};
type StatsModuleTraceDependency = KnownStatsModuleTraceDependency &
  Record<string, EXPECTED_ANY>;
type KnownStatsModuleTraceDependency = {
  loc?: string | undefined;
};
type StatsError = KnownStatsError & Record<string, EXPECTED_ANY>;
type KnownStatsError = {
  message: string;
  chunkName?: string | undefined;
  chunkEntry?: boolean | undefined;
  chunkInitial?: boolean | undefined;
  file?: string | undefined;
  moduleIdentifier?: string | undefined;
  moduleName?: string | undefined;
  loc?: string | undefined;
  chunkId?: ChunkId | undefined;
  moduleId?: ModuleId | undefined;
  moduleTrace?: StatsModuleTraceItem[] | undefined;
  details?: string | undefined;
  stack?: string | undefined;
  cause?: KnownStatsError | undefined;
  errors?: KnownStatsError[] | undefined;
  compilerPath?: string | undefined;
};
type PreprocessedAsset = Asset & {
  type: string;
  related: PreprocessedAsset[] | undefined;
};
type ExtractorsByOption<T_1, O> = Record<
  string,
  (
    object: O,
    data: T_1,
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
    factory: StatsFactory,
  ) => void
>;
type ChunkGroupInfoWithName = {
  name: string;
  chunkGroup: ChunkGroup;
};
type ModuleTrace = {
  origin: Module;
  module: Module;
};
type SimpleExtractors = {
  compilation: ExtractorsByOption<Compilation, StatsCompilation>;
  asset: ExtractorsByOption<PreprocessedAsset, StatsAsset>;
  asset$visible: ExtractorsByOption<PreprocessedAsset, StatsAsset>;
  chunkGroup: ExtractorsByOption<ChunkGroupInfoWithName, StatsChunkGroup>;
  module: ExtractorsByOption<Module, StatsModule>;
  module$visible: ExtractorsByOption<Module, StatsModule>;
  moduleIssuer: ExtractorsByOption<Module, StatsModuleIssuer>;
  profile: ExtractorsByOption<ModuleProfile, StatsProfile>;
  moduleReason: ExtractorsByOption<ModuleGraphConnection, StatsModuleReason>;
  chunk: ExtractorsByOption<Chunk, StatsChunk>;
  chunkOrigin: ExtractorsByOption<OriginRecord, StatsChunkOrigin>;
  error: ExtractorsByOption<WebpackError, StatsError>;
  warning: ExtractorsByOption<WebpackError, StatsError>;
  cause: ExtractorsByOption<WebpackError, StatsError>;
  moduleTraceItem: ExtractorsByOption<ModuleTrace, StatsModuleTraceItem>;
  moduleTraceDependency: ExtractorsByOption<
    Dependency,
    StatsModuleTraceDependency
  >;
};
/**
 * <T, R>
 */
type MappedValues<T_1, R> = { [P in keyof T_1]: R };
type Children<T_1> = T_1 & {
  children?: Children<T_1>[] | undefined;
  filteredChildren?: number;
};
type ModuleGroupBySizeResult = {
  size: number;
  sizes: Record<string, number>;
};
type BaseGroup = {
  type: string;
};
type BaseGroupWithChildren<T_1> = BaseGroup & {
  children: T_1[];
  size: number;
};
type AssetsGroupers = {
  _: (
    groupConfigs: GroupConfig<
      KnownStatsAsset,
      | (BaseGroup & {
          filteredChildren: number;
          size: number;
        })
      | BaseGroupWithChildren<KnownStatsAsset>
    >[],
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
  ) => void;
  groupAssetsByInfo: (
    groupConfigs: GroupConfig<
      KnownStatsAsset,
      BaseGroupWithChildren<KnownStatsAsset>
    >[],
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
  ) => void;
  groupAssetsByChunk: (
    groupConfigs: GroupConfig<
      KnownStatsAsset,
      BaseGroupWithChildren<KnownStatsAsset>
    >[],
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
  ) => void;
  excludeAssets: (
    groupConfigs: GroupConfig<
      KnownStatsAsset,
      BaseGroup & {
        filteredChildren: number;
        size: number;
      }
    >[],
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
  ) => void;
};
type ModulesGroupers = {
  _: (
    groupConfigs: GroupConfig<
      KnownStatsModule,
      BaseGroup & {
        filteredChildren?: number;
        children?: KnownStatsModule[];
        size: number;
        sizes: Record<string, number>;
      }
    >[],
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
  ) => void;
  excludeModules: (
    groupConfigs: GroupConfig<
      KnownStatsModule,
      BaseGroup & {
        filteredChildren: number;
        size: number;
        sizes: Record<string, number>;
      }
    >[],
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
  ) => void;
};
type ModuleReasonsGroupers = {
  groupReasonsByOrigin: (
    groupConfigs: GroupConfig<
      KnownStatsModuleReason,
      BaseGroup & {
        module: string;
        children: KnownStatsModuleReason[];
        active: boolean;
      }
    >[],
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
  ) => void;
};
type AssetSorters = {
  assetsSort: (
    comparators: Comparator<Asset>[],
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
  ) => void;
  _: (
    comparators: Comparator<Asset>[],
    context: StatsFactoryContext,
    options: NormalizedStatsOptions,
  ) => void;
};
type ExtractFunction<T_1> =
  T_1 extends Record<string, Record<string, infer F>> ? F : never;
type NamedObject<T_1> = {
  name: T_1;
};
