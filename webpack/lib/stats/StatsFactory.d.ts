export = StatsFactory;
/** @import Chunk from "../graph/Chunk" */
/** @import { OriginRecord } from "../graph/ChunkGroup" */
/** @import Compilation, { Asset } from "../Compilation" */
/** @import Dependency from "../graph/Dependency" */
/** @import Module from "../module/Module" */
/** @import ModuleGraphConnection from "../graph/ModuleGraphConnection" */
/** @import WebpackError from "../errors/WebpackError" */
/**
 * Defines the comparator type used by this module.
 * @template T
 * @typedef {import("../util/comparators").Comparator<T>} Comparator
 */
/** @import ModuleProfile from "../module/ModuleProfile" */
/** @import { RuntimeSpec } from "../util/runtime" */
/**
 * Defines the group config type used by this module.
 * @template T, R
 * @typedef {import("./smartGrouping").GroupConfig<T, R>} GroupConfig
 */
/**
 * @import {
 * 	ChunkGroupInfoWithName,
 * 	ModuleTrace,
 * 	PreprocessedAsset,
 * 	StatsAsset,
 * 	StatsChunk,
 * 	StatsChunkGroup,
 * 	StatsChunkOrigin,
 * 	StatsCompilation,
 * 	StatsError,
 * 	StatsModule,
 * 	StatsModuleIssuer,
 * 	StatsModuleReason,
 * 	StatsModuleTraceDependency,
 * 	StatsModuleTraceItem,
 * 	StatsProfile
 * } from "./DefaultStatsFactoryPlugin"
 */
/**
 * Defines the known stats factory context type used by this module.
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
 * Defines the stats object type used by this module.
 * @template T
 * @template F
 * @typedef {T extends Compilation ? StatsCompilation : T extends ChunkGroupInfoWithName ? StatsChunkGroup : T extends Chunk ? StatsChunk : T extends OriginRecord ? StatsChunkOrigin : T extends Module ? StatsModule : T extends ModuleGraphConnection ? StatsModuleReason : T extends Asset ? StatsAsset : T extends ModuleTrace ? StatsModuleTraceItem : T extends Dependency ? StatsModuleTraceDependency : T extends Error ? StatsError : T extends ModuleProfile ? StatsProfile : F} StatsObject
 */
/**
 * Defines the created object type used by this module.
 * @template T
 * @template F
 * @typedef {T extends ChunkGroupInfoWithName[] ? Record<string, StatsObject<ChunkGroupInfoWithName, F>> : T extends (infer V)[] ? StatsObject<V, F>[] : StatsObject<T, F>} CreatedObject
 */
/**
 * The `[object, data]` each `extract` key webpack registers receives.
 * @typedef {object} KnownStatsFactoryExtract
 * @property {[StatsCompilation, Compilation]} compilation
 * @property {[StatsAsset, PreprocessedAsset]} asset
 * @property {[StatsAsset, PreprocessedAsset]} asset$visible
 * @property {[StatsChunkGroup, ChunkGroupInfoWithName]} chunkGroup
 * @property {[StatsModule, Module]} module
 * @property {[StatsModule, Module]} module$visible
 * @property {[StatsModuleIssuer, Module]} moduleIssuer
 * @property {[StatsProfile, ModuleProfile]} profile
 * @property {[StatsModuleReason, ModuleGraphConnection]} moduleReason
 * @property {[StatsChunk, Chunk]} chunk
 * @property {[StatsChunkOrigin, OriginRecord]} chunkOrigin
 * @property {[StatsError, WebpackError]} error
 * @property {[StatsError, WebpackError]} warning
 * @property {[StatsError, WebpackError]} cause
 * @property {[StatsModuleTraceItem, ModuleTrace]} moduleTraceItem
 * @property {[StatsModuleTraceDependency, Dependency]} moduleTraceDependency
 */
/**
 * The `[item, created item]` of each array path webpack creates.
 * @typedef {{
 * "compilation.assets": [PreprocessedAsset, StatsAsset],
 * "compilation.chunks": [Chunk, StatsChunk],
 * "compilation.modules": [Module, StatsModule],
 * "compilation.entrypoints": [ChunkGroupInfoWithName, StatsChunkGroup],
 * "compilation.namedChunkGroups": [ChunkGroupInfoWithName, StatsChunkGroup],
 * "compilation.errors": [Error, StatsError],
 * "compilation.warnings": [Error, StatsError],
 * "compilation.hints": [Error, StatsError],
 * "compilation.children": [Compilation, StatsCompilation],
 * "asset.related": [PreprocessedAsset, StatsAsset],
 * "error.errors": [Error, StatsError],
 * "warning.errors": [Error, StatsError],
 * "chunk.modules": [Module, StatsModule],
 * "chunk.rootModules": [Module, StatsModule],
 * "chunk.origins": [OriginRecord, StatsChunkOrigin],
 * "module.issuerPath": [Module, StatsModuleIssuer],
 * "module.reasons": [ModuleGraphConnection, StatsModuleReason],
 * "module.modules": [Module, StatsModule],
 * "module.children": [Module, StatsModule],
 * moduleTrace: [ModuleTrace, StatsModuleTraceItem],
 * "moduleTraceItem.dependencies": [Dependency, StatsModuleTraceDependency],
 * }} KnownStatsFactoryItems
 */
/** @typedef {{ [Key in keyof KnownStatsFactoryItems]: KnownStatsFactoryItems[Key][0] }} KnownStatsFactoryRawItems */
/** @typedef {{ [Key in keyof KnownStatsFactoryItems]: KnownStatsFactoryItems[Key][1] }} KnownStatsFactoryResultItems */
/**
 * The item `getItemName` receives for each `<array path>[]` key webpack registers.
 * @typedef {{
 * "compilation.assets[]": PreprocessedAsset,
 * "compilation.chunks[]": Chunk,
 * "compilation.modules[]": Module,
 * "compilation.entrypoints[]": ChunkGroupInfoWithName,
 * "compilation.namedChunkGroups[]": ChunkGroupInfoWithName,
 * "compilation.errors[]": Error,
 * "compilation.warnings[]": Error,
 * "compilation.hints[]": Error,
 * "compilation.children[]": Compilation,
 * "asset.related[]": PreprocessedAsset,
 * "error.errors[]": Error,
 * "warning.errors[]": Error,
 * "chunk.modules[]": Module,
 * "chunk.rootModules[]": Module,
 * "chunk.origins[]": OriginRecord,
 * "module.issuerPath[]": Module,
 * "module.reasons[]": ModuleGraphConnection,
 * "module.modules[]": Module,
 * "module.children[]": Module,
 * "moduleTrace[]": ModuleTrace,
 * "moduleTraceItem.dependencies[]": Dependency,
 * }} KnownStatsFactoryItemNames
 */
/**
 * The data `getItemFactory` receives: an item name key gets that item's data.
 * @typedef {{ [Key in keyof KnownStatsFactoryExtract]: KnownStatsFactoryExtract[Key][1] } & { "compilation.children[].compilation": Compilation }} KnownStatsFactoryItemFactories
 */
/**
 * The value `result` passes on: an object key's stats object, an array path's (merged) items.
 * @typedef {{ [Key in keyof KnownStatsFactoryExtract]: KnownStatsFactoryExtract[Key][0] } & { [Key in Exclude<keyof KnownStatsFactoryResultItems, "compilation.entrypoints" | "compilation.namedChunkGroups">]: KnownStatsFactoryResultItems[Key][] } & { "compilation.entrypoints": Record<string, StatsChunkGroup>, "compilation.namedChunkGroups": Record<string, StatsChunkGroup> }} KnownStatsFactoryResults
 */
/**
 * `extract` hooks: the exact `[object, data]` for keys webpack registers, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsFactoryExtract>(key: K): SyncBailHook<[KnownStatsFactoryExtract[K][0], KnownStatsFactoryExtract[K][1], StatsFactoryContext], void>,
 * for<O = EXPECTED_ANY, D = EXPECTED_ANY>(key: string): SyncBailHook<[O, D, StatsFactoryContext], void>
 * } & HookMap<SyncBailHook<[EXPECTED_ANY, EXPECTED_ANY, StatsFactoryContext], void>>} StatsFactoryExtractHookMap
 */
/**
 * Filter hooks over the raw item: exact for known array paths, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsFactoryRawItems>(key: K): SyncBailHook<[KnownStatsFactoryRawItems[K], StatsFactoryContext, number, number], boolean | void>,
 * for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I, StatsFactoryContext, number, number], boolean | void>
 * } & HookMap<SyncBailHook<[EXPECTED_ANY, StatsFactoryContext, number, number], boolean | void>>} StatsFactoryItemFilterHookMap
 */
/**
 * Sort hooks over the raw item: exact for known array paths, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsFactoryRawItems>(key: K): SyncBailHook<[Comparator<KnownStatsFactoryRawItems[K]>[], StatsFactoryContext], void>,
 * for<I = EXPECTED_ANY>(key: string): SyncBailHook<[Comparator<I>[], StatsFactoryContext], void>
 * } & HookMap<SyncBailHook<[Comparator<EXPECTED_ANY>[], StatsFactoryContext], void>>} StatsFactoryItemSortHookMap
 */
/**
 * Filter hooks over the created item: exact for known array paths, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsFactoryResultItems>(key: K): SyncBailHook<[KnownStatsFactoryResultItems[K], StatsFactoryContext, number, number], boolean | void>,
 * for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I, StatsFactoryContext, number, number], boolean | void>
 * } & HookMap<SyncBailHook<[EXPECTED_ANY, StatsFactoryContext, number, number], boolean | void>>} StatsFactoryResultFilterHookMap
 */
/**
 * Sort hooks over the created item: exact for known array paths, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsFactoryResultItems>(key: K): SyncBailHook<[Comparator<KnownStatsFactoryResultItems[K]>[], StatsFactoryContext], void>,
 * for<I = EXPECTED_ANY>(key: string): SyncBailHook<[Comparator<I>[], StatsFactoryContext], void>
 * } & HookMap<SyncBailHook<[Comparator<EXPECTED_ANY>[], StatsFactoryContext], void>>} StatsFactoryResultSortHookMap
 */
/**
 * `groupResults` hooks: group configs over the exact created item for known keys, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsFactoryResultItems, G = object>(key: K): SyncBailHook<[GroupConfig<KnownStatsFactoryResultItems[K], G>[], StatsFactoryContext], void>,
 * for<I = EXPECTED_ANY, G = EXPECTED_ANY>(key: string): SyncBailHook<[GroupConfig<I, G>[], StatsFactoryContext], void>
 * } & HookMap<SyncBailHook<[GroupConfig<EXPECTED_ANY, EXPECTED_ANY>[], StatsFactoryContext], void>>} StatsFactoryGroupResultsHookMap
 */
/**
 * `merge` hooks: the exact created items for known keys, merged by default into an object by name.
 * @typedef {{
 * for<K extends keyof KnownStatsFactoryResultItems, R = Record<string, KnownStatsFactoryResultItems[K]>>(key: K): SyncBailHook<[KnownStatsFactoryResultItems[K][], StatsFactoryContext], R | void>,
 * for<I = EXPECTED_ANY, R = EXPECTED_ANY>(key: string): SyncBailHook<[I[], StatsFactoryContext], R | void>
 * } & HookMap<SyncBailHook<[EXPECTED_ANY[], StatsFactoryContext], EXPECTED_ANY>>} StatsFactoryMergeHookMap
 */
/**
 * `result` hooks: the exact stats value for known keys, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsFactoryResults>(key: K): SyncBailHook<[KnownStatsFactoryResults[K], StatsFactoryContext], KnownStatsFactoryResults[K]>,
 * for<R = EXPECTED_ANY>(key: string): SyncBailHook<[R, StatsFactoryContext], R>
 * } & HookMap<SyncBailHook<[EXPECTED_ANY, StatsFactoryContext], EXPECTED_ANY>>} StatsFactoryResultHookMap
 */
/**
 * `getItemName` hooks: the exact item for known `<array path>[]` keys, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsFactoryItemNames>(key: K): SyncBailHook<[KnownStatsFactoryItemNames[K], StatsFactoryContext], string | void>,
 * for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I, StatsFactoryContext], string | void>
 * } & HookMap<SyncBailHook<[EXPECTED_ANY, StatsFactoryContext], string | void>>} StatsFactoryGetItemNameHookMap
 */
/**
 * `getItemFactory` hooks: the exact data for known item keys, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsFactoryItemFactories>(key: K): SyncBailHook<[KnownStatsFactoryItemFactories[K], StatsFactoryContext], StatsFactory | void>,
 * for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I, StatsFactoryContext], StatsFactory | void>
 * } & HookMap<SyncBailHook<[EXPECTED_ANY, StatsFactoryContext], StatsFactory | void>>} StatsFactoryGetItemFactoryHookMap
 */
/**
 * Defines the stats factory hooks type used by this module.
 * @typedef {object} StatsFactoryHooks
 * @property {StatsFactoryExtractHookMap} extract
 * @property {StatsFactoryItemFilterHookMap} filter
 * @property {StatsFactoryItemSortHookMap} sort
 * @property {StatsFactoryItemFilterHookMap} filterSorted
 * @property {StatsFactoryGroupResultsHookMap} groupResults
 * @property {StatsFactoryResultSortHookMap} sortResults
 * @property {StatsFactoryResultFilterHookMap} filterResults
 * @property {StatsFactoryMergeHookMap} merge
 * @property {StatsFactoryResultHookMap} result
 * @property {StatsFactoryGetItemNameHookMap} getItemName
 * @property {StatsFactoryGetItemFactoryHookMap} getItemFactory
 */
/**
 * Represents the stats factory runtime component.
 * @template T
 * @typedef {Map<string, T[]>} Caches
 */
declare class StatsFactory {
    /** @type {StatsFactoryHooks} */
    hooks: StatsFactoryHooks;
    _caches: {
        extract: Map<string, SyncBailHook<[EXPECTED_ANY, EXPECTED_ANY, StatsFactoryContext], void, import("tapable").UnsetAdditionalOptions>[]>;
        filter: Map<string, SyncBailHook<[EXPECTED_ANY, StatsFactoryContext, number, number], boolean | void, import("tapable").UnsetAdditionalOptions>[]>;
        sort: Map<string, SyncBailHook<[Comparator<EXPECTED_ANY>[], StatsFactoryContext], void, import("tapable").UnsetAdditionalOptions>[]>;
        filterSorted: Map<string, SyncBailHook<[EXPECTED_ANY, StatsFactoryContext, number, number], boolean | void, import("tapable").UnsetAdditionalOptions>[]>;
        groupResults: Map<string, SyncBailHook<[GroupConfig<EXPECTED_ANY, EXPECTED_ANY>[], StatsFactoryContext], void, import("tapable").UnsetAdditionalOptions>[]>;
        sortResults: Map<string, SyncBailHook<[Comparator<EXPECTED_ANY>[], StatsFactoryContext], void, import("tapable").UnsetAdditionalOptions>[]>;
        filterResults: Map<string, SyncBailHook<[EXPECTED_ANY, StatsFactoryContext, number, number], boolean | void, import("tapable").UnsetAdditionalOptions>[]>;
        merge: Map<string, SyncBailHook<[EXPECTED_ANY[], StatsFactoryContext], EXPECTED_ANY, import("tapable").UnsetAdditionalOptions>[]>;
        result: Map<string, SyncBailHook<[EXPECTED_ANY, StatsFactoryContext], EXPECTED_ANY, import("tapable").UnsetAdditionalOptions>[]>;
        getItemName: Map<string, SyncBailHook<[EXPECTED_ANY, StatsFactoryContext], string | void, import("tapable").UnsetAdditionalOptions>[]>;
        getItemFactory: Map<string, SyncBailHook<[EXPECTED_ANY, StatsFactoryContext], void | StatsFactory, import("tapable").UnsetAdditionalOptions>[]>;
    };
    /** @type {boolean} */
    _inCreate: boolean;
    /**
     * Get all level hooks.
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
     * Returns hook.
     * @template {StatsFactoryHooks[keyof StatsFactoryHooks]} HM
     * @template {HM extends HookMap<infer H> ? H : never} H
     * @template {H extends import("tapable").Hook<infer A, infer R> ? R : never} R
     * @param {HM} hookMap hook map
     * @param {Caches<H>} cache cache
     * @param {string} type type
     * @param {(hook: H) => R | void} fn fn
     * @returns {R | void} hook
     * @private
     */
    private _forEachLevel;
    /**
     * For each level waterfall.
     * @template {StatsFactoryHooks[keyof StatsFactoryHooks]} HM
     * @template {HM extends HookMap<infer H> ? H : never} H
     * @template D
     * @param {HM} hookMap hook map
     * @param {Caches<H>} cache cache
     * @param {string} type type
     * @param {D} data data
     * @param {(hook: H, data: D) => D} fn fn
     * @returns {D} data
     * @private
     */
    private _forEachLevelWaterfall;
    /**
     * For each level filter.
     * @template {StatsFactoryHooks[keyof StatsFactoryHooks]} T
     * @template {T extends HookMap<infer H> ? H : never} H
     * @template D
     * @param {T} hookMap hook map
     * @param {Caches<H>} cache cache
     * @param {string} type type
     * @param {D[]} items items
     * @param {(hook: H, item: D, idx: number, i: number) => boolean | void} fn fn
     * @param {boolean} forceClone force clone
     * @returns {D[]} result for each level
     * @private
     */
    private _forEachLevelFilter;
    /**
     * Returns created object.
     * @template FactoryData
     * @template FallbackCreatedObject
     * @param {string} type type
     * @param {FactoryData} data factory data
     * @param {Omit<StatsFactoryContext, "type">} baseContext context used as base
     * @returns {CreatedObject<FactoryData, FallbackCreatedObject>} created object
     */
    create<FactoryData, FallbackCreatedObject>(type: string, data: FactoryData, baseContext: Omit<StatsFactoryContext, "type">): CreatedObject<FactoryData, FallbackCreatedObject>;
    /**
     * Returns created object.
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
    export { Comparator, GroupConfig, KnownStatsFactoryContext, StatsFactoryContext, StatsObject, CreatedObject, KnownStatsFactoryExtract, KnownStatsFactoryItems, KnownStatsFactoryRawItems, KnownStatsFactoryResultItems, KnownStatsFactoryItemNames, KnownStatsFactoryItemFactories, KnownStatsFactoryResults, StatsFactoryExtractHookMap, StatsFactoryItemFilterHookMap, StatsFactoryItemSortHookMap, StatsFactoryResultFilterHookMap, StatsFactoryResultSortHookMap, StatsFactoryGroupResultsHookMap, StatsFactoryMergeHookMap, StatsFactoryResultHookMap, StatsFactoryGetItemNameHookMap, StatsFactoryGetItemFactoryHookMap, StatsFactoryHooks, Caches };
}
import { SyncBailHook } from "tapable";
/**
 * Defines the comparator type used by this module.
 */
type Comparator<T> = import("../util/comparators").Comparator<T>;
/**
 * Defines the group config type used by this module.
 */
type GroupConfig<T, R> = import("./smartGrouping").GroupConfig<T, R>;
/**
 * Defines the known stats factory context type used by this module.
 */
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
type StatsFactoryContext = KnownStatsFactoryContext & Record<string, EXPECTED_ANY>;
/**
 * Defines the stats object type used by this module.
 */
type StatsObject<T, F> = T extends Compilation ? StatsCompilation : T extends ChunkGroupInfoWithName ? StatsChunkGroup : T extends Chunk ? StatsChunk : T extends OriginRecord ? StatsChunkOrigin : T extends Module ? StatsModule : T extends ModuleGraphConnection ? StatsModuleReason : T extends Compilation.Asset ? StatsAsset : T extends ModuleTrace ? StatsModuleTraceItem : T extends Dependency ? StatsModuleTraceDependency : T extends Error ? StatsError : T extends ModuleProfile ? StatsProfile : F;
/**
 * Defines the created object type used by this module.
 */
type CreatedObject<T, F> = T extends ChunkGroupInfoWithName[] ? Record<string, StatsObject<ChunkGroupInfoWithName, F>> : T extends (infer V)[] ? StatsObject<V, F>[] : StatsObject<T, F>;
/**
 * The `[object, data]` each `extract` key webpack registers receives.
 */
type KnownStatsFactoryExtract = {
    compilation: [StatsCompilation, Compilation];
    asset: [StatsAsset, PreprocessedAsset];
    asset$visible: [StatsAsset, PreprocessedAsset];
    chunkGroup: [StatsChunkGroup, ChunkGroupInfoWithName];
    module: [StatsModule, Module];
    module$visible: [StatsModule, Module];
    moduleIssuer: [StatsModuleIssuer, Module];
    profile: [StatsProfile, ModuleProfile];
    moduleReason: [StatsModuleReason, ModuleGraphConnection];
    chunk: [StatsChunk, Chunk];
    chunkOrigin: [StatsChunkOrigin, OriginRecord];
    error: [StatsError, WebpackError];
    warning: [StatsError, WebpackError];
    cause: [StatsError, WebpackError];
    moduleTraceItem: [StatsModuleTraceItem, ModuleTrace];
    moduleTraceDependency: [StatsModuleTraceDependency, Dependency];
};
/**
 * The `[item, created item]` of each array path webpack creates.
 */
type KnownStatsFactoryItems = {
    "compilation.assets": [PreprocessedAsset, StatsAsset];
    "compilation.chunks": [Chunk, StatsChunk];
    "compilation.modules": [Module, StatsModule];
    "compilation.entrypoints": [ChunkGroupInfoWithName, StatsChunkGroup];
    "compilation.namedChunkGroups": [ChunkGroupInfoWithName, StatsChunkGroup];
    "compilation.errors": [Error, StatsError];
    "compilation.warnings": [Error, StatsError];
    "compilation.hints": [Error, StatsError];
    "compilation.children": [Compilation, StatsCompilation];
    "asset.related": [PreprocessedAsset, StatsAsset];
    "error.errors": [Error, StatsError];
    "warning.errors": [Error, StatsError];
    "chunk.modules": [Module, StatsModule];
    "chunk.rootModules": [Module, StatsModule];
    "chunk.origins": [OriginRecord, StatsChunkOrigin];
    "module.issuerPath": [Module, StatsModuleIssuer];
    "module.reasons": [ModuleGraphConnection, StatsModuleReason];
    "module.modules": [Module, StatsModule];
    "module.children": [Module, StatsModule];
    moduleTrace: [ModuleTrace, StatsModuleTraceItem];
    "moduleTraceItem.dependencies": [Dependency, StatsModuleTraceDependency];
};
type KnownStatsFactoryRawItems = { [Key in keyof KnownStatsFactoryItems]: KnownStatsFactoryItems[Key][0]; };
type KnownStatsFactoryResultItems = { [Key in keyof KnownStatsFactoryItems]: KnownStatsFactoryItems[Key][1]; };
/**
 * The item `getItemName` receives for each `<array path>[]` key webpack registers.
 */
type KnownStatsFactoryItemNames = {
    "compilation.assets[]": PreprocessedAsset;
    "compilation.chunks[]": Chunk;
    "compilation.modules[]": Module;
    "compilation.entrypoints[]": ChunkGroupInfoWithName;
    "compilation.namedChunkGroups[]": ChunkGroupInfoWithName;
    "compilation.errors[]": Error;
    "compilation.warnings[]": Error;
    "compilation.hints[]": Error;
    "compilation.children[]": Compilation;
    "asset.related[]": PreprocessedAsset;
    "error.errors[]": Error;
    "warning.errors[]": Error;
    "chunk.modules[]": Module;
    "chunk.rootModules[]": Module;
    "chunk.origins[]": OriginRecord;
    "module.issuerPath[]": Module;
    "module.reasons[]": ModuleGraphConnection;
    "module.modules[]": Module;
    "module.children[]": Module;
    "moduleTrace[]": ModuleTrace;
    "moduleTraceItem.dependencies[]": Dependency;
};
/**
 * The data `getItemFactory` receives: an item name key gets that item's data.
 */
type KnownStatsFactoryItemFactories = { [Key in keyof KnownStatsFactoryExtract]: KnownStatsFactoryExtract[Key][1]; } & {
    "compilation.children[].compilation": Compilation;
};
/**
 * The value `result` passes on: an object key's stats object, an array path's (merged) items.
 */
type KnownStatsFactoryResults = { [Key in keyof KnownStatsFactoryExtract]: KnownStatsFactoryExtract[Key][0]; } & { [Key in Exclude<keyof KnownStatsFactoryResultItems, "compilation.entrypoints" | "compilation.namedChunkGroups">]: KnownStatsFactoryResultItems[Key][]; } & {
    "compilation.entrypoints": Record<string, StatsChunkGroup>;
    "compilation.namedChunkGroups": Record<string, StatsChunkGroup>;
};
/**
 * `extract` hooks: the exact `[object, data]` for keys webpack registers, generic for plugin keys.
 */
type StatsFactoryExtractHookMap = {
    for<K extends keyof KnownStatsFactoryExtract>(key: K): SyncBailHook<[KnownStatsFactoryExtract[K][0], KnownStatsFactoryExtract[K][1], StatsFactoryContext], void>;
    for<O = EXPECTED_ANY, D = EXPECTED_ANY>(key: string): SyncBailHook<[O, D, StatsFactoryContext], void>;
} & HookMap<SyncBailHook<[EXPECTED_ANY, EXPECTED_ANY, StatsFactoryContext], void>>;
/**
 * Filter hooks over the raw item: exact for known array paths, generic for plugin keys.
 */
type StatsFactoryItemFilterHookMap = {
    for<K extends keyof KnownStatsFactoryRawItems>(key: K): SyncBailHook<[KnownStatsFactoryRawItems[K], StatsFactoryContext, number, number], boolean | void>;
    for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I, StatsFactoryContext, number, number], boolean | void>;
} & HookMap<SyncBailHook<[EXPECTED_ANY, StatsFactoryContext, number, number], boolean | void>>;
/**
 * Sort hooks over the raw item: exact for known array paths, generic for plugin keys.
 */
type StatsFactoryItemSortHookMap = {
    for<K extends keyof KnownStatsFactoryRawItems>(key: K): SyncBailHook<[Comparator<KnownStatsFactoryRawItems[K]>[], StatsFactoryContext], void>;
    for<I = EXPECTED_ANY>(key: string): SyncBailHook<[Comparator<I>[], StatsFactoryContext], void>;
} & HookMap<SyncBailHook<[Comparator<EXPECTED_ANY>[], StatsFactoryContext], void>>;
/**
 * Filter hooks over the created item: exact for known array paths, generic for plugin keys.
 */
type StatsFactoryResultFilterHookMap = {
    for<K extends keyof KnownStatsFactoryResultItems>(key: K): SyncBailHook<[KnownStatsFactoryResultItems[K], StatsFactoryContext, number, number], boolean | void>;
    for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I, StatsFactoryContext, number, number], boolean | void>;
} & HookMap<SyncBailHook<[EXPECTED_ANY, StatsFactoryContext, number, number], boolean | void>>;
/**
 * Sort hooks over the created item: exact for known array paths, generic for plugin keys.
 */
type StatsFactoryResultSortHookMap = {
    for<K extends keyof KnownStatsFactoryResultItems>(key: K): SyncBailHook<[Comparator<KnownStatsFactoryResultItems[K]>[], StatsFactoryContext], void>;
    for<I = EXPECTED_ANY>(key: string): SyncBailHook<[Comparator<I>[], StatsFactoryContext], void>;
} & HookMap<SyncBailHook<[Comparator<EXPECTED_ANY>[], StatsFactoryContext], void>>;
/**
 * `groupResults` hooks: group configs over the exact created item for known keys, generic for plugin keys.
 */
type StatsFactoryGroupResultsHookMap = {
    for<K extends keyof KnownStatsFactoryResultItems, G = object>(key: K): SyncBailHook<[GroupConfig<KnownStatsFactoryResultItems[K], G>[], StatsFactoryContext], void>;
    for<I = EXPECTED_ANY, G = EXPECTED_ANY>(key: string): SyncBailHook<[GroupConfig<I, G>[], StatsFactoryContext], void>;
} & HookMap<SyncBailHook<[GroupConfig<EXPECTED_ANY, EXPECTED_ANY>[], StatsFactoryContext], void>>;
/**
 * `merge` hooks: the exact created items for known keys, merged by default into an object by name.
 */
type StatsFactoryMergeHookMap = {
    for<K extends keyof KnownStatsFactoryResultItems, R = Record<string, KnownStatsFactoryResultItems[K]>>(key: K): SyncBailHook<[KnownStatsFactoryResultItems[K][], StatsFactoryContext], R | void>;
    for<I = EXPECTED_ANY, R = EXPECTED_ANY>(key: string): SyncBailHook<[I[], StatsFactoryContext], R | void>;
} & HookMap<SyncBailHook<[EXPECTED_ANY[], StatsFactoryContext], EXPECTED_ANY>>;
/**
 * `result` hooks: the exact stats value for known keys, generic for plugin keys.
 */
type StatsFactoryResultHookMap = {
    for<K extends keyof KnownStatsFactoryResults>(key: K): SyncBailHook<[KnownStatsFactoryResults[K], StatsFactoryContext], KnownStatsFactoryResults[K]>;
    for<R = EXPECTED_ANY>(key: string): SyncBailHook<[R, StatsFactoryContext], R>;
} & HookMap<SyncBailHook<[EXPECTED_ANY, StatsFactoryContext], EXPECTED_ANY>>;
/**
 * `getItemName` hooks: the exact item for known `<array path>[]` keys, generic for plugin keys.
 */
type StatsFactoryGetItemNameHookMap = {
    for<K extends keyof KnownStatsFactoryItemNames>(key: K): SyncBailHook<[KnownStatsFactoryItemNames[K], StatsFactoryContext], string | void>;
    for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I, StatsFactoryContext], string | void>;
} & HookMap<SyncBailHook<[EXPECTED_ANY, StatsFactoryContext], string | void>>;
/**
 * `getItemFactory` hooks: the exact data for known item keys, generic for plugin keys.
 */
type StatsFactoryGetItemFactoryHookMap = {
    for<K extends keyof KnownStatsFactoryItemFactories>(key: K): SyncBailHook<[KnownStatsFactoryItemFactories[K], StatsFactoryContext], StatsFactory | void>;
    for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I, StatsFactoryContext], StatsFactory | void>;
} & HookMap<SyncBailHook<[EXPECTED_ANY, StatsFactoryContext], StatsFactory | void>>;
/**
 * Defines the stats factory hooks type used by this module.
 */
type StatsFactoryHooks = {
    extract: StatsFactoryExtractHookMap;
    filter: StatsFactoryItemFilterHookMap;
    sort: StatsFactoryItemSortHookMap;
    filterSorted: StatsFactoryItemFilterHookMap;
    groupResults: StatsFactoryGroupResultsHookMap;
    sortResults: StatsFactoryResultSortHookMap;
    filterResults: StatsFactoryResultFilterHookMap;
    merge: StatsFactoryMergeHookMap;
    result: StatsFactoryResultHookMap;
    getItemName: StatsFactoryGetItemNameHookMap;
    getItemFactory: StatsFactoryGetItemFactoryHookMap;
};
/**
 * Represents the stats factory runtime component.
 */
type Caches<T> = Map<string, T[]>;
import type Compilation from "../Compilation";
import type Module from "../module/Module";
import type Chunk from "../graph/Chunk";
import type { RuntimeSpec } from "../util/runtime";
import type { StatsCompilation } from "./DefaultStatsFactoryPlugin";
import type { ChunkGroupInfoWithName } from "./DefaultStatsFactoryPlugin";
import type { StatsChunkGroup } from "./DefaultStatsFactoryPlugin";
import type { StatsChunk } from "./DefaultStatsFactoryPlugin";
import type { OriginRecord } from "../graph/ChunkGroup";
import type { StatsChunkOrigin } from "./DefaultStatsFactoryPlugin";
import type { StatsModule } from "./DefaultStatsFactoryPlugin";
import type ModuleGraphConnection from "../graph/ModuleGraphConnection";
import type { StatsModuleReason } from "./DefaultStatsFactoryPlugin";
import type { StatsAsset } from "./DefaultStatsFactoryPlugin";
import type { ModuleTrace } from "./DefaultStatsFactoryPlugin";
import type { StatsModuleTraceItem } from "./DefaultStatsFactoryPlugin";
import type Dependency from "../graph/Dependency";
import type { StatsModuleTraceDependency } from "./DefaultStatsFactoryPlugin";
import type { StatsError } from "./DefaultStatsFactoryPlugin";
import type ModuleProfile from "../module/ModuleProfile";
import type { StatsProfile } from "./DefaultStatsFactoryPlugin";
import type { PreprocessedAsset } from "./DefaultStatsFactoryPlugin";
import type { StatsModuleIssuer } from "./DefaultStatsFactoryPlugin";
import type WebpackError from "../errors/WebpackError";
import { HookMap } from "tapable";
