export = StatsPrinter;
/**
 * @import {
 * 	StatsAsset,
 * 	StatsChunk,
 * 	StatsChunkGroup,
 * 	StatsChunkOrigin,
 * 	StatsCompilation,
 * 	StatsError,
 * 	StatsJsonValue,
 * 	StatsLogging,
 * 	StatsLoggingEntry,
 * 	StatsModule,
 * 	StatsModuleIssuer,
 * 	StatsModuleReason,
 * 	StatsModuleTraceDependency,
 * 	StatsModuleTraceItem,
 * 	StatsProfile
 * } from "./DefaultStatsFactoryPlugin"
 */
/**
 * Defines the printed element type used by this module.
 * @typedef {object} PrintedElement
 * @property {string} element
 * @property {string | undefined} content
 */
/**
 * Defines the known stats printer context type used by this module.
 * @typedef {object} KnownStatsPrinterContext
 * @property {string=} type
 * @property {StatsCompilation=} compilation
 * @property {StatsChunkGroup=} chunkGroup
 * @property {string=} chunkGroupKind
 * @property {StatsAsset=} asset
 * @property {StatsModule=} module
 * @property {StatsChunk=} chunk
 * @property {StatsModuleReason=} moduleReason
 * @property {StatsModuleIssuer=} moduleIssuer
 * @property {StatsError=} error
 * @property {StatsProfile=} profile
 * @property {StatsLogging=} logging
 * @property {StatsModuleTraceItem=} moduleTraceItem
 * @property {StatsModuleTraceDependency=} moduleTraceDependency
 */
/** @typedef {(value: string | number) => string} ColorFunction */
/**
 * Defines the known stats printer color functions type used by this module.
 * @typedef {object} KnownStatsPrinterColorFunctions
 * @property {ColorFunction=} bold
 * @property {ColorFunction=} yellow
 * @property {ColorFunction=} red
 * @property {ColorFunction=} green
 * @property {ColorFunction=} magenta
 * @property {ColorFunction=} cyan
 */
/**
 * Defines the known stats printer formatters type used by this module.
 * @typedef {object} KnownStatsPrinterFormatters
 * @property {(file: string, oversize?: boolean) => string=} formatFilename
 * @property {(id: string | number) => string=} formatModuleId
 * @property {(id: string | number, direction?: "parent" | "child" | "sibling") => string=} formatChunkId
 * @property {(size: number) => string=} formatSize
 * @property {(size: string) => string=} formatLayer
 * @property {(dateTime: number) => string=} formatDateTime
 * @property {(flag: string) => string=} formatFlag
 * @property {(time: number, boldQuantity?: boolean) => string=} formatTime
 * @property {(message: string) => string=} formatError
 */
/**
 * Extracts the inner hook type held by a `HookMap`.
 * @template T
 * @typedef {T extends HookMap<infer H> ? H : never} HookMapHook
 */
/** @typedef {KnownStatsPrinterColorFunctions & KnownStatsPrinterFormatters & KnownStatsPrinterContext & Record<string, EXPECTED_ANY>} StatsPrinterContext */
/** @typedef {StatsPrinterContext & Required<KnownStatsPrinterColorFunctions> & Required<KnownStatsPrinterFormatters> & { type: string }} StatsPrinterContextWithExtra */
/**
 * The value `print` receives for each object key webpack prints; the key also matches same-named fields.
 * @typedef {object} KnownStatsPrintObjects
 * @property {StatsCompilation} compilation
 * @property {StatsAsset} asset
 * @property {StatsChunk} chunk
 * @property {StatsChunkGroup} chunkGroup
 * @property {StatsModule | string | null} module
 * @property {StatsModuleReason} moduleReason
 * @property {StatsModuleIssuer} moduleIssuer
 * @property {StatsChunkOrigin} chunkOrigin
 * @property {StatsError} error
 * @property {StatsProfile} profile
 * @property {StatsLogging & { name: string }} loggingGroup
 * @property {StatsModuleTraceItem} moduleTraceItem
 * @property {StatsModuleTraceDependency} moduleTraceDependency
 */
/**
 * The item of each array path webpack prints stats objects for.
 * @typedef {{
 * "compilation.assets": StatsAsset,
 * "compilation.modules": StatsModule,
 * "compilation.chunks": StatsChunk,
 * "compilation.entrypoints": StatsChunkGroup,
 * "compilation.namedChunkGroups": StatsChunkGroup,
 * "compilation.errors": StatsError,
 * "compilation.warnings": StatsError,
 * "compilation.hints": StatsError,
 * "compilation.logging": StatsLogging & { name: string },
 * "compilation.children": StatsCompilation,
 * "asset.related": StatsAsset,
 * "asset.children": StatsAsset,
 * "module.modules": StatsModule,
 * "module.children": StatsModule,
 * "module.reasons": StatsModuleReason,
 * "moduleReason.children": StatsModuleReason,
 * "module.issuerPath": StatsModuleIssuer,
 * "chunk.origins": StatsChunkOrigin,
 * "chunk.modules": StatsModule,
 * "loggingGroup.entries": StatsLoggingEntry,
 * "loggingEntry.children": StatsLoggingEntry,
 * "error.moduleTrace": StatsModuleTraceItem,
 * "error.errors": StatsError,
 * "moduleTraceItem.dependencies": StatsModuleTraceDependency,
 * }} KnownStatsPrintItems
 */
/**
 * The item `getItemName` receives for each `<array path>[]` key of `KnownStatsPrintItems`.
 * @typedef {{
 * "compilation.assets[]": StatsAsset,
 * "compilation.modules[]": StatsModule,
 * "compilation.chunks[]": StatsChunk,
 * "compilation.entrypoints[]": StatsChunkGroup,
 * "compilation.namedChunkGroups[]": StatsChunkGroup,
 * "compilation.errors[]": StatsError,
 * "compilation.warnings[]": StatsError,
 * "compilation.hints[]": StatsError,
 * "compilation.logging[]": StatsLogging & { name: string },
 * "compilation.children[]": StatsCompilation,
 * "asset.related[]": StatsAsset,
 * "asset.children[]": StatsAsset,
 * "module.modules[]": StatsModule,
 * "module.children[]": StatsModule,
 * "module.reasons[]": StatsModuleReason,
 * "moduleReason.children[]": StatsModuleReason,
 * "module.issuerPath[]": StatsModuleIssuer,
 * "chunk.origins[]": StatsChunkOrigin,
 * "chunk.modules[]": StatsModule,
 * "loggingGroup.entries[]": StatsLoggingEntry,
 * "loggingEntry.children[]": StatsLoggingEntry,
 * "error.moduleTrace[]": StatsModuleTraceItem,
 * "error.errors[]": StatsError,
 * "moduleTraceItem.dependencies[]": StatsModuleTraceDependency,
 * }} KnownStatsPrintItemNames
 */
/**
 * `sortItems` hooks: the exact items for known array paths, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsPrintItems>(key: K): SyncBailHook<[KnownStatsPrintItems[K][], StatsPrinterContext], boolean | void>,
 * for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I[], StatsPrinterContext], boolean | void>
 * } & HookMap<SyncBailHook<[EXPECTED_ANY[], StatsPrinterContext], boolean | void>>} StatsPrinterSortItemsHookMap
 */
/**
 * `getItemName` hooks: the exact item for known `<array path>[]` keys, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsPrintItemNames>(key: K): SyncBailHook<[KnownStatsPrintItemNames[K], StatsPrinterContext], string | void>,
 * for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I, StatsPrinterContext], string | void>
 * } & HookMap<SyncBailHook<[EXPECTED_ANY, StatsPrinterContext], string | void>>} StatsPrinterGetItemNameHookMap
 */
/**
 * `print` hooks: the exact value for known object keys, generic for plugin keys.
 * @typedef {{
 * for<K extends keyof KnownStatsPrintObjects>(key: K): SyncBailHook<[KnownStatsPrintObjects[K], StatsPrinterContext], string | undefined | void>,
 * for<T = EXPECTED_ANY>(key: string): SyncBailHook<[T, StatsPrinterContext], string | undefined | void>
 * } & HookMap<SyncBailHook<[EXPECTED_ANY, StatsPrinterContext], string | undefined | void>>} StatsPrinterPrintHookMap
 */
/**
 * Represents the stats printer runtime component.
 * @typedef {object} StatsPrintHooks
 * @property {HookMap<SyncBailHook<[string[], StatsPrinterContext], void>>} sortElements
 * @property {HookMap<SyncBailHook<[PrintedElement[], StatsPrinterContext], string | undefined | void>>} printElements
 * @property {StatsPrinterSortItemsHookMap} sortItems
 * @property {StatsPrinterGetItemNameHookMap} getItemName
 * @property {HookMap<SyncBailHook<[string[], StatsPrinterContext], string | undefined>>} printItems
 * @property {StatsPrinterPrintHookMap} print
 * @property {HookMap<SyncWaterfallHook<[string, StatsPrinterContext]>>} result
 */
declare class StatsPrinter {
    /** @type {StatsPrintHooks} */
    hooks: StatsPrintHooks;
    /** @type {Map<StatsPrintHooks[keyof StatsPrintHooks], Map<string, HookMapHook<StatsPrintHooks[keyof StatsPrintHooks]>[]>>} */
    _levelHookCache: Map<StatsPrintHooks[keyof StatsPrintHooks], Map<string, HookMapHook<StatsPrintHooks[keyof StatsPrintHooks]>[]>>;
    /** @type {boolean} */
    _inPrint: boolean;
    /**
     * get all level hooks
     * @private
     * @template {StatsPrintHooks[keyof StatsPrintHooks]} HM
     * @template {HM extends HookMap<infer H> ? H : never} H
     * @param {HM} hookMap hook map
     * @param {string} type type
     * @returns {H[]} hooks
     */
    private _getAllLevelHooks;
    /**
     * Run `fn` for each level
     * @private
     * @template {StatsPrintHooks[keyof StatsPrintHooks]} HM
     * @template {HM extends HookMap<infer H> ? H : never} H
     * @template {H extends import("tapable").Hook<infer A, infer R> ? R : never} R
     * @param {HM} hookMap hook map
     * @param {string} type type
     * @param {(hooK: H) => R | undefined | void} fn fn
     * @returns {R | undefined} hook
     */
    private _forEachLevel;
    /**
     * Run `fn` for each level
     * @private
     * @template {StatsPrintHooks[keyof StatsPrintHooks]} HM
     * @template {HM extends HookMap<infer H> ? H : never} H
     * @param {HM} hookMap hook map
     * @param {string} type type
     * @param {string} data data
     * @param {(hook: H, data: string) => string} fn fn
     * @returns {string | undefined} result of `fn`
     */
    private _forEachLevelWaterfall;
    /**
     * Returns printed result.
     * @template T
     * @param {string} type The type
     * @param {T} object Object to print
     * @param {StatsPrinterContext=} baseContext The base context
     * @returns {string | undefined} printed result
     */
    print<T>(type: string, object: T, baseContext?: StatsPrinterContext | undefined): string | undefined;
    /**
     * Returns printed result.
     * @private
     * @template T
     * @param {string} type type
     * @param {T} object object
     * @param {StatsPrinterContext=} baseContext context
     * @returns {string | undefined} printed result
     */
    private _print;
}
declare namespace StatsPrinter {
    export { PrintedElement, KnownStatsPrinterContext, ColorFunction, KnownStatsPrinterColorFunctions, KnownStatsPrinterFormatters, HookMapHook, StatsPrinterContext, StatsPrinterContextWithExtra, KnownStatsPrintObjects, KnownStatsPrintItems, KnownStatsPrintItemNames, StatsPrinterSortItemsHookMap, StatsPrinterGetItemNameHookMap, StatsPrinterPrintHookMap, StatsPrintHooks };
}
/**
 * Defines the printed element type used by this module.
 */
type PrintedElement = {
    element: string;
    content: string | undefined;
};
/**
 * Defines the known stats printer context type used by this module.
 */
type KnownStatsPrinterContext = {
    type?: string | undefined;
    compilation?: StatsCompilation | undefined;
    chunkGroup?: StatsChunkGroup | undefined;
    chunkGroupKind?: string | undefined;
    asset?: StatsAsset | undefined;
    module?: StatsModule | undefined;
    chunk?: StatsChunk | undefined;
    moduleReason?: StatsModuleReason | undefined;
    moduleIssuer?: StatsModuleIssuer | undefined;
    error?: StatsError | undefined;
    profile?: StatsProfile | undefined;
    logging?: StatsLogging | undefined;
    moduleTraceItem?: StatsModuleTraceItem | undefined;
    moduleTraceDependency?: StatsModuleTraceDependency | undefined;
};
type ColorFunction = (value: string | number) => string;
/**
 * Defines the known stats printer color functions type used by this module.
 */
type KnownStatsPrinterColorFunctions = {
    bold?: ColorFunction | undefined;
    yellow?: ColorFunction | undefined;
    red?: ColorFunction | undefined;
    green?: ColorFunction | undefined;
    magenta?: ColorFunction | undefined;
    cyan?: ColorFunction | undefined;
};
/**
 * Defines the known stats printer formatters type used by this module.
 */
type KnownStatsPrinterFormatters = {
    formatFilename?: ((file: string, oversize?: boolean) => string) | undefined;
    formatModuleId?: ((id: string | number) => string) | undefined;
    formatChunkId?: ((id: string | number, direction?: "parent" | "child" | "sibling") => string) | undefined;
    formatSize?: ((size: number) => string) | undefined;
    formatLayer?: ((size: string) => string) | undefined;
    formatDateTime?: ((dateTime: number) => string) | undefined;
    formatFlag?: ((flag: string) => string) | undefined;
    formatTime?: ((time: number, boldQuantity?: boolean) => string) | undefined;
    formatError?: ((message: string) => string) | undefined;
};
/**
 * Extracts the inner hook type held by a `HookMap`.
 */
type HookMapHook<T> = T extends HookMap<infer H> ? H : never;
type StatsPrinterContext = KnownStatsPrinterColorFunctions & KnownStatsPrinterFormatters & KnownStatsPrinterContext & Record<string, EXPECTED_ANY>;
type StatsPrinterContextWithExtra = StatsPrinterContext & Required<KnownStatsPrinterColorFunctions> & Required<KnownStatsPrinterFormatters> & {
    type: string;
};
/**
 * The value `print` receives for each object key webpack prints; the key also matches same-named fields.
 */
type KnownStatsPrintObjects = {
    compilation: StatsCompilation;
    asset: StatsAsset;
    chunk: StatsChunk;
    chunkGroup: StatsChunkGroup;
    module: StatsModule | string | null;
    moduleReason: StatsModuleReason;
    moduleIssuer: StatsModuleIssuer;
    chunkOrigin: StatsChunkOrigin;
    error: StatsError;
    profile: StatsProfile;
    loggingGroup: StatsLogging & {
        name: string;
    };
    moduleTraceItem: StatsModuleTraceItem;
    moduleTraceDependency: StatsModuleTraceDependency;
};
/**
 * The item of each array path webpack prints stats objects for.
 */
type KnownStatsPrintItems = {
    "compilation.assets": StatsAsset;
    "compilation.modules": StatsModule;
    "compilation.chunks": StatsChunk;
    "compilation.entrypoints": StatsChunkGroup;
    "compilation.namedChunkGroups": StatsChunkGroup;
    "compilation.errors": StatsError;
    "compilation.warnings": StatsError;
    "compilation.hints": StatsError;
    "compilation.logging": StatsLogging & {
        name: string;
    };
    "compilation.children": StatsCompilation;
    "asset.related": StatsAsset;
    "asset.children": StatsAsset;
    "module.modules": StatsModule;
    "module.children": StatsModule;
    "module.reasons": StatsModuleReason;
    "moduleReason.children": StatsModuleReason;
    "module.issuerPath": StatsModuleIssuer;
    "chunk.origins": StatsChunkOrigin;
    "chunk.modules": StatsModule;
    "loggingGroup.entries": StatsLoggingEntry;
    "loggingEntry.children": StatsLoggingEntry;
    "error.moduleTrace": StatsModuleTraceItem;
    "error.errors": StatsError;
    "moduleTraceItem.dependencies": StatsModuleTraceDependency;
};
/**
 * The item `getItemName` receives for each `<array path>[]` key of `KnownStatsPrintItems`.
 */
type KnownStatsPrintItemNames = {
    "compilation.assets[]": StatsAsset;
    "compilation.modules[]": StatsModule;
    "compilation.chunks[]": StatsChunk;
    "compilation.entrypoints[]": StatsChunkGroup;
    "compilation.namedChunkGroups[]": StatsChunkGroup;
    "compilation.errors[]": StatsError;
    "compilation.warnings[]": StatsError;
    "compilation.hints[]": StatsError;
    "compilation.logging[]": StatsLogging & {
        name: string;
    };
    "compilation.children[]": StatsCompilation;
    "asset.related[]": StatsAsset;
    "asset.children[]": StatsAsset;
    "module.modules[]": StatsModule;
    "module.children[]": StatsModule;
    "module.reasons[]": StatsModuleReason;
    "moduleReason.children[]": StatsModuleReason;
    "module.issuerPath[]": StatsModuleIssuer;
    "chunk.origins[]": StatsChunkOrigin;
    "chunk.modules[]": StatsModule;
    "loggingGroup.entries[]": StatsLoggingEntry;
    "loggingEntry.children[]": StatsLoggingEntry;
    "error.moduleTrace[]": StatsModuleTraceItem;
    "error.errors[]": StatsError;
    "moduleTraceItem.dependencies[]": StatsModuleTraceDependency;
};
/**
 * `sortItems` hooks: the exact items for known array paths, generic for plugin keys.
 */
type StatsPrinterSortItemsHookMap = {
    for<K extends keyof KnownStatsPrintItems>(key: K): SyncBailHook<[KnownStatsPrintItems[K][], StatsPrinterContext], boolean | void>;
    for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I[], StatsPrinterContext], boolean | void>;
} & HookMap<SyncBailHook<[EXPECTED_ANY[], StatsPrinterContext], boolean | void>>;
/**
 * `getItemName` hooks: the exact item for known `<array path>[]` keys, generic for plugin keys.
 */
type StatsPrinterGetItemNameHookMap = {
    for<K extends keyof KnownStatsPrintItemNames>(key: K): SyncBailHook<[KnownStatsPrintItemNames[K], StatsPrinterContext], string | void>;
    for<I = EXPECTED_ANY>(key: string): SyncBailHook<[I, StatsPrinterContext], string | void>;
} & HookMap<SyncBailHook<[EXPECTED_ANY, StatsPrinterContext], string | void>>;
/**
 * `print` hooks: the exact value for known object keys, generic for plugin keys.
 */
type StatsPrinterPrintHookMap = {
    for<K extends keyof KnownStatsPrintObjects>(key: K): SyncBailHook<[KnownStatsPrintObjects[K], StatsPrinterContext], string | undefined | void>;
    for<T = EXPECTED_ANY>(key: string): SyncBailHook<[T, StatsPrinterContext], string | undefined | void>;
} & HookMap<SyncBailHook<[EXPECTED_ANY, StatsPrinterContext], string | undefined | void>>;
/**
 * Represents the stats printer runtime component.
 */
type StatsPrintHooks = {
    sortElements: HookMap<SyncBailHook<[string[], StatsPrinterContext], void>>;
    printElements: HookMap<SyncBailHook<[PrintedElement[], StatsPrinterContext], string | undefined | void>>;
    sortItems: StatsPrinterSortItemsHookMap;
    getItemName: StatsPrinterGetItemNameHookMap;
    printItems: HookMap<SyncBailHook<[string[], StatsPrinterContext], string | undefined>>;
    print: StatsPrinterPrintHookMap;
    result: HookMap<SyncWaterfallHook<[string, StatsPrinterContext]>>;
};
import type { StatsCompilation } from "./DefaultStatsFactoryPlugin";
import type { StatsChunkGroup } from "./DefaultStatsFactoryPlugin";
import type { StatsAsset } from "./DefaultStatsFactoryPlugin";
import type { StatsModule } from "./DefaultStatsFactoryPlugin";
import type { StatsChunk } from "./DefaultStatsFactoryPlugin";
import type { StatsModuleReason } from "./DefaultStatsFactoryPlugin";
import type { StatsModuleIssuer } from "./DefaultStatsFactoryPlugin";
import type { StatsError } from "./DefaultStatsFactoryPlugin";
import type { StatsProfile } from "./DefaultStatsFactoryPlugin";
import type { StatsLogging } from "./DefaultStatsFactoryPlugin";
import type { StatsModuleTraceItem } from "./DefaultStatsFactoryPlugin";
import type { StatsModuleTraceDependency } from "./DefaultStatsFactoryPlugin";
import { HookMap } from "tapable";
import type { StatsChunkOrigin } from "./DefaultStatsFactoryPlugin";
import type { StatsLoggingEntry } from "./DefaultStatsFactoryPlugin";
import { SyncBailHook } from "tapable";
import { SyncWaterfallHook } from "tapable";
