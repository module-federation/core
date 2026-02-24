export = StatsFactory;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../ChunkGroup").OriginRecord} OriginRecord */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Compilation").Asset} Asset */
/** @typedef {import("../Compilation").NormalizedStatsOptions} NormalizedStatsOptions */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../ModuleGraph").ModuleProfile} ModuleProfile */
/** @typedef {import("../ModuleGraphConnection")} ModuleGraphConnection */
/** @typedef {import("../WebpackError")} WebpackError */
/** @typedef {import("../util/comparators").Comparator<EXPECTED_ANY>} Comparator */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/**
 * @template T, R
 * @typedef {import("../util/smartGrouping").GroupConfig<T, R>} GroupConfig
 */
/** @typedef {import("./DefaultStatsFactoryPlugin").ChunkGroupInfoWithName} ChunkGroupInfoWithName */
/** @typedef {import("./DefaultStatsFactoryPlugin").ModuleIssuerPath} ModuleIssuerPath */
/** @typedef {import("./DefaultStatsFactoryPlugin").ModuleTrace} ModuleTrace */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsAsset} StatsAsset */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsChunk} StatsChunk */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsChunkGroup} StatsChunkGroup */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsChunkOrigin} StatsChunkOrigin */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsCompilation} StatsCompilation */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsError} StatsError */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModule} StatsModule */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModuleIssuer} StatsModuleIssuer */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModuleReason} StatsModuleReason */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModuleTraceDependency} StatsModuleTraceDependency */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModuleTraceItem} StatsModuleTraceItem */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsProfile} StatsProfile */
/**
 * @typedef {object} KnownStatsFactoryContext
 * @property {string} type
 * @property {Compilation} compilation
 * @property {(path: string) => string} makePathsRelative
 * @property {Set<Module>} rootModules
 * @property {Map<string, Chunk[]>} compilationFileToChunks
 * @property {Map<string, Chunk[]>} compilationAuxiliaryFileToChunks
 * @property {RuntimeSpec} runtime
 * @property {(compilation: Compilation) => Error[]} cachedGetErrors
 * @property {(compilation: Compilation) => Error[]} cachedGetWarnings
 */
/** @typedef {KnownStatsFactoryContext & Record<string, EXPECTED_ANY>} StatsFactoryContext */
/**
 * @template T
 * @template F
 * @typedef {T extends Compilation ? StatsCompilation : T extends ChunkGroupInfoWithName ? StatsChunkGroup : T extends Chunk ? StatsChunk : T extends OriginRecord ? StatsChunkOrigin : T extends Module ? StatsModule : T extends ModuleGraphConnection ? StatsModuleReason : T extends Asset ? StatsAsset : T extends ModuleTrace ? StatsModuleTraceItem : T extends Dependency ? StatsModuleTraceDependency : T extends Error ? StatsError : T extends ModuleProfile ? StatsProfile : F} StatsObject
 */
/**
 * @template T
 * @template F
 * @typedef {T extends ChunkGroupInfoWithName[] ? Record<string, StatsObject<ChunkGroupInfoWithName, F>> : T extends (infer V)[] ? StatsObject<V, F>[] : StatsObject<T, F>} CreatedObject
 */
/** @typedef {EXPECTED_ANY} ObjectForExtract */
/** @typedef {EXPECTED_ANY} FactoryData */
/** @typedef {EXPECTED_ANY} FactoryDataItem */
/** @typedef {EXPECTED_ANY} Result */
/**
 * @typedef {object} StatsFactoryHooks
 * @property {HookMap<SyncBailHook<[ObjectForExtract, FactoryData, StatsFactoryContext], void>>} extract
 * @property {HookMap<SyncBailHook<[FactoryDataItem, StatsFactoryContext, number, number], boolean | void>>} filter
 * @property {HookMap<SyncBailHook<[Comparator[], StatsFactoryContext], void>>} sort
 * @property {HookMap<SyncBailHook<[FactoryDataItem, StatsFactoryContext, number, number], boolean | void>>} filterSorted
 * @property {HookMap<SyncBailHook<[GroupConfig<EXPECTED_ANY, EXPECTED_ANY>[], StatsFactoryContext], void>>} groupResults
 * @property {HookMap<SyncBailHook<[Comparator[], StatsFactoryContext], void>>} sortResults
 * @property {HookMap<SyncBailHook<[FactoryDataItem, StatsFactoryContext, number, number], boolean | void>>} filterResults
 * @property {HookMap<SyncBailHook<[FactoryDataItem[], StatsFactoryContext], Result | void>>} merge
 * @property {HookMap<SyncBailHook<[Result, StatsFactoryContext], Result>>} result
 * @property {HookMap<SyncBailHook<[FactoryDataItem, StatsFactoryContext], string | void>>} getItemName
 * @property {HookMap<SyncBailHook<[FactoryDataItem, StatsFactoryContext], StatsFactory | void>>} getItemFactory
 */
/**
 * @template T
 * @typedef {Map<string, T[]>} Caches
 */
declare class StatsFactory {
  /** @type {StatsFactoryHooks} */
  hooks: StatsFactoryHooks;
  _caches: {
    extract: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
    filter: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
    sort: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
    filterSorted: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
    groupResults: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
    sortResults: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
    filterResults: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
    merge: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
    result: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
    getItemName: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
    getItemFactory: Map<
      string,
      SyncBailHook<
        EXPECTED_ANY,
        EXPECTED_ANY,
        import('tapable').UnsetAdditionalOptions
      >[]
    >;
  };
  _inCreate: boolean;
  /**
   * @template {StatsFactoryHooks[keyof StatsFactoryHooks]} HM
   * @template {HM extends HookMap<infer H> ? H : never} H
   * @param {HM} hookMap hook map
   * @param {Caches<H>} cache cache
   * @param {string} type type
   * @returns {H[]} hooks
   * @private
   */
  private _getAllLevelHooks;
  /**
   * @template {StatsFactoryHooks[keyof StatsFactoryHooks]} HM
   * @template {HM extends HookMap<infer H> ? H : never} H
   * @template {H extends import("tapable").Hook<any, infer R> ? R : never} R
   * @param {HM} hookMap hook map
   * @param {Caches<H>} cache cache
   * @param {string} type type
   * @param {(hook: H) => R | void} fn fn
   * @returns {R | void} hook
   * @private
   */
  private _forEachLevel;
  /**
   * @template {StatsFactoryHooks[keyof StatsFactoryHooks]} HM
   * @template {HM extends HookMap<infer H> ? H : never} H
   * @param {HM} hookMap hook map
   * @param {Caches<H>} cache cache
   * @param {string} type type
   * @param {FactoryData} data data
   * @param {(hook: H, factoryData: FactoryData) => FactoryData} fn fn
   * @returns {FactoryData} data
   * @private
   */
  private _forEachLevelWaterfall;
  /**
   * @template {StatsFactoryHooks[keyof StatsFactoryHooks]} T
   * @template {T extends HookMap<infer H> ? H : never} H
   * @template {H extends import("tapable").Hook<any, infer R> ? R : never} R
   * @param {T} hookMap hook map
   * @param {Caches<H>} cache cache
   * @param {string} type type
   * @param {FactoryData[]} items items
   * @param {(hook: H, item: R, idx: number, i: number) => R | undefined} fn fn
   * @param {boolean} forceClone force clone
   * @returns {R[]} result for each level
   * @private
   */
  private _forEachLevelFilter;
  /**
   * @template FactoryData
   * @template FallbackCreatedObject
   * @param {string} type type
   * @param {FactoryData} data factory data
   * @param {Omit<StatsFactoryContext, "type">} baseContext context used as base
   * @returns {CreatedObject<FactoryData, FallbackCreatedObject>} created object
   */
  create<FactoryData, FallbackCreatedObject>(
    type: string,
    data: FactoryData,
    baseContext: Omit<StatsFactoryContext, 'type'>,
  ): CreatedObject<FactoryData, FallbackCreatedObject>;
  /**
   * @private
   * @template FactoryData
   * @template FallbackCreatedObject
   * @param {string} type type
   * @param {FactoryData} data factory data
   * @param {Omit<StatsFactoryContext, "type">} baseContext context used as base
   * @returns {CreatedObject<FactoryData, FallbackCreatedObject>} created object
   */
  private _create;
}
declare namespace StatsFactory {
  export {
    Chunk,
    OriginRecord,
    Compilation,
    Asset,
    NormalizedStatsOptions,
    Dependency,
    Module,
    ModuleProfile,
    ModuleGraphConnection,
    WebpackError,
    Comparator,
    RuntimeSpec,
    GroupConfig,
    ChunkGroupInfoWithName,
    ModuleIssuerPath,
    ModuleTrace,
    StatsAsset,
    StatsChunk,
    StatsChunkGroup,
    StatsChunkOrigin,
    StatsCompilation,
    StatsError,
    StatsModule,
    StatsModuleIssuer,
    StatsModuleReason,
    StatsModuleTraceDependency,
    StatsModuleTraceItem,
    StatsProfile,
    KnownStatsFactoryContext,
    StatsFactoryContext,
    StatsObject,
    CreatedObject,
    ObjectForExtract,
    FactoryData,
    FactoryDataItem,
    Result,
    StatsFactoryHooks,
    Caches,
  };
}
import { SyncBailHook } from 'tapable';
type Chunk = import('../Chunk');
type OriginRecord = import('../ChunkGroup').OriginRecord;
type Compilation = import('../Compilation');
type Asset = import('../Compilation').Asset;
type NormalizedStatsOptions = import('../Compilation').NormalizedStatsOptions;
type Dependency = import('../Dependency');
type Module = import('../Module');
type ModuleProfile = import('../ModuleGraph').ModuleProfile;
type ModuleGraphConnection = import('../ModuleGraphConnection');
type WebpackError = import('../WebpackError');
type Comparator = import('../util/comparators').Comparator<EXPECTED_ANY>;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type GroupConfig<T, R> = import('../util/smartGrouping').GroupConfig<T, R>;
type ChunkGroupInfoWithName =
  import('./DefaultStatsFactoryPlugin').ChunkGroupInfoWithName;
type ModuleIssuerPath = import('./DefaultStatsFactoryPlugin').ModuleIssuerPath;
type ModuleTrace = import('./DefaultStatsFactoryPlugin').ModuleTrace;
type StatsAsset = import('./DefaultStatsFactoryPlugin').StatsAsset;
type StatsChunk = import('./DefaultStatsFactoryPlugin').StatsChunk;
type StatsChunkGroup = import('./DefaultStatsFactoryPlugin').StatsChunkGroup;
type StatsChunkOrigin = import('./DefaultStatsFactoryPlugin').StatsChunkOrigin;
type StatsCompilation = import('./DefaultStatsFactoryPlugin').StatsCompilation;
type StatsError = import('./DefaultStatsFactoryPlugin').StatsError;
type StatsModule = import('./DefaultStatsFactoryPlugin').StatsModule;
type StatsModuleIssuer =
  import('./DefaultStatsFactoryPlugin').StatsModuleIssuer;
type StatsModuleReason =
  import('./DefaultStatsFactoryPlugin').StatsModuleReason;
type StatsModuleTraceDependency =
  import('./DefaultStatsFactoryPlugin').StatsModuleTraceDependency;
type StatsModuleTraceItem =
  import('./DefaultStatsFactoryPlugin').StatsModuleTraceItem;
type StatsProfile = import('./DefaultStatsFactoryPlugin').StatsProfile;
type KnownStatsFactoryContext = {
  type: string;
  compilation: Compilation;
  makePathsRelative: (path: string) => string;
  rootModules: Set<Module>;
  compilationFileToChunks: Map<string, Chunk[]>;
  compilationAuxiliaryFileToChunks: Map<string, Chunk[]>;
  runtime: RuntimeSpec;
  cachedGetErrors: (compilation: Compilation) => Error[];
  cachedGetWarnings: (compilation: Compilation) => Error[];
};
type StatsFactoryContext = KnownStatsFactoryContext &
  Record<string, EXPECTED_ANY>;
type StatsObject<T, F> = T extends Compilation
  ? StatsCompilation
  : T extends ChunkGroupInfoWithName
    ? StatsChunkGroup
    : T extends Chunk
      ? StatsChunk
      : T extends OriginRecord
        ? StatsChunkOrigin
        : T extends Module
          ? StatsModule
          : T extends ModuleGraphConnection
            ? StatsModuleReason
            : T extends Asset
              ? StatsAsset
              : T extends ModuleTrace
                ? StatsModuleTraceItem
                : T extends Dependency
                  ? StatsModuleTraceDependency
                  : T extends Error
                    ? StatsError
                    : T extends ModuleProfile
                      ? StatsProfile
                      : F;
type CreatedObject<T, F> = T extends ChunkGroupInfoWithName[]
  ? Record<string, StatsObject<ChunkGroupInfoWithName, F>>
  : T extends (infer V)[]
    ? StatsObject<V, F>[]
    : StatsObject<T, F>;
type ObjectForExtract = EXPECTED_ANY;
type FactoryData = EXPECTED_ANY;
type FactoryDataItem = EXPECTED_ANY;
type Result = EXPECTED_ANY;
type StatsFactoryHooks = {
  extract: HookMap<
    SyncBailHook<[ObjectForExtract, FactoryData, StatsFactoryContext], void>
  >;
  filter: HookMap<
    SyncBailHook<
      [FactoryDataItem, StatsFactoryContext, number, number],
      boolean | void
    >
  >;
  sort: HookMap<SyncBailHook<[Comparator[], StatsFactoryContext], void>>;
  filterSorted: HookMap<
    SyncBailHook<
      [FactoryDataItem, StatsFactoryContext, number, number],
      boolean | void
    >
  >;
  groupResults: HookMap<
    SyncBailHook<
      [GroupConfig<EXPECTED_ANY, EXPECTED_ANY>[], StatsFactoryContext],
      void
    >
  >;
  sortResults: HookMap<SyncBailHook<[Comparator[], StatsFactoryContext], void>>;
  filterResults: HookMap<
    SyncBailHook<
      [FactoryDataItem, StatsFactoryContext, number, number],
      boolean | void
    >
  >;
  merge: HookMap<
    SyncBailHook<[FactoryDataItem[], StatsFactoryContext], Result | void>
  >;
  result: HookMap<SyncBailHook<[Result, StatsFactoryContext], Result>>;
  getItemName: HookMap<
    SyncBailHook<[FactoryDataItem, StatsFactoryContext], string | void>
  >;
  getItemFactory: HookMap<
    SyncBailHook<[FactoryDataItem, StatsFactoryContext], StatsFactory | void>
  >;
};
type Caches<T> = Map<string, T[]>;
import { HookMap } from 'tapable';
