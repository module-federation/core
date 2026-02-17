export = StatsPrinter;
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsAsset} StatsAsset */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsChunk} StatsChunk */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsChunkGroup} StatsChunkGroup */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsCompilation} StatsCompilation */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsError} StatsError */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsLogging} StatsLogging */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModule} StatsModule */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModuleIssuer} StatsModuleIssuer */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModuleReason} StatsModuleReason */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModuleTraceDependency} StatsModuleTraceDependency */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModuleTraceItem} StatsModuleTraceItem */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsProfile} StatsProfile */
/**
 * @typedef {object} PrintedElement
 * @property {string} element
 * @property {string | undefined} content
 */
/**
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
 * @typedef {object} KnownStatsPrinterColorFunctions
 * @property {ColorFunction=} bold
 * @property {ColorFunction=} yellow
 * @property {ColorFunction=} red
 * @property {ColorFunction=} green
 * @property {ColorFunction=} magenta
 * @property {ColorFunction=} cyan
 */
/**
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
/** @typedef {KnownStatsPrinterColorFunctions & KnownStatsPrinterFormatters & KnownStatsPrinterContext & Record<string, EXPECTED_ANY>} StatsPrinterContext */
/** @typedef {StatsPrinterContext & Required<KnownStatsPrinterColorFunctions> & Required<KnownStatsPrinterFormatters> & { type: string }} StatsPrinterContextWithExtra */
/** @typedef {EXPECTED_ANY} PrintObject */
/**
 * @typedef {object} StatsPrintHooks
 * @property {HookMap<SyncBailHook<[string[], StatsPrinterContext], void>>} sortElements
 * @property {HookMap<SyncBailHook<[PrintedElement[], StatsPrinterContext], string | undefined | void>>} printElements
 * @property {HookMap<SyncBailHook<[PrintObject[], StatsPrinterContext], boolean | void>>} sortItems
 * @property {HookMap<SyncBailHook<[PrintObject, StatsPrinterContext], string | void>>} getItemName
 * @property {HookMap<SyncBailHook<[string[], StatsPrinterContext], string | undefined>>} printItems
 * @property {HookMap<SyncBailHook<[PrintObject, StatsPrinterContext], string | undefined | void>>} print
 * @property {HookMap<SyncWaterfallHook<[string, StatsPrinterContext]>>} result
 */
declare class StatsPrinter {
  /** @type {StatsPrintHooks} */
  hooks: StatsPrintHooks;
  /** @type {Map<StatsPrintHooks[keyof StatsPrintHooks], Map<string, import("tapable").Hook<EXPECTED_ANY, EXPECTED_ANY>[]>>} */
  _levelHookCache: Map<
    StatsPrintHooks[keyof StatsPrintHooks],
    Map<string, import('tapable').Hook<EXPECTED_ANY, EXPECTED_ANY>[]>
  >;
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
   * @template {H extends import("tapable").Hook<EXPECTED_ANY, infer R> ? R : never} R
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
   * @param {string} type The type
   * @param {PrintObject} object Object to print
   * @param {StatsPrinterContext=} baseContext The base context
   * @returns {string | undefined} printed result
   */
  print(
    type: string,
    object: PrintObject,
    baseContext?: StatsPrinterContext | undefined,
  ): string | undefined;
  /**
   * @private
   * @param {string} type type
   * @param {PrintObject} object object
   * @param {StatsPrinterContext=} baseContext context
   * @returns {string | undefined} printed result
   */
  private _print;
}
declare namespace StatsPrinter {
  export {
    StatsAsset,
    StatsChunk,
    StatsChunkGroup,
    StatsCompilation,
    StatsError,
    StatsLogging,
    StatsModule,
    StatsModuleIssuer,
    StatsModuleReason,
    StatsModuleTraceDependency,
    StatsModuleTraceItem,
    StatsProfile,
    PrintedElement,
    KnownStatsPrinterContext,
    ColorFunction,
    KnownStatsPrinterColorFunctions,
    KnownStatsPrinterFormatters,
    StatsPrinterContext,
    StatsPrinterContextWithExtra,
    PrintObject,
    StatsPrintHooks,
  };
}
type StatsAsset = import('./DefaultStatsFactoryPlugin').StatsAsset;
type StatsChunk = import('./DefaultStatsFactoryPlugin').StatsChunk;
type StatsChunkGroup = import('./DefaultStatsFactoryPlugin').StatsChunkGroup;
type StatsCompilation = import('./DefaultStatsFactoryPlugin').StatsCompilation;
type StatsError = import('./DefaultStatsFactoryPlugin').StatsError;
type StatsLogging = import('./DefaultStatsFactoryPlugin').StatsLogging;
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
type PrintedElement = {
  element: string;
  content: string | undefined;
};
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
type KnownStatsPrinterColorFunctions = {
  bold?: ColorFunction | undefined;
  yellow?: ColorFunction | undefined;
  red?: ColorFunction | undefined;
  green?: ColorFunction | undefined;
  magenta?: ColorFunction | undefined;
  cyan?: ColorFunction | undefined;
};
type KnownStatsPrinterFormatters = {
  formatFilename?: ((file: string, oversize?: boolean) => string) | undefined;
  formatModuleId?: ((id: string | number) => string) | undefined;
  formatChunkId?:
    | ((
        id: string | number,
        direction?: 'parent' | 'child' | 'sibling',
      ) => string)
    | undefined;
  formatSize?: ((size: number) => string) | undefined;
  formatLayer?: ((size: string) => string) | undefined;
  formatDateTime?: ((dateTime: number) => string) | undefined;
  formatFlag?: ((flag: string) => string) | undefined;
  formatTime?: ((time: number, boldQuantity?: boolean) => string) | undefined;
  formatError?: ((message: string) => string) | undefined;
};
type StatsPrinterContext = KnownStatsPrinterColorFunctions &
  KnownStatsPrinterFormatters &
  KnownStatsPrinterContext &
  Record<string, EXPECTED_ANY>;
type StatsPrinterContextWithExtra = StatsPrinterContext &
  Required<KnownStatsPrinterColorFunctions> &
  Required<KnownStatsPrinterFormatters> & {
    type: string;
  };
type PrintObject = EXPECTED_ANY;
type StatsPrintHooks = {
  sortElements: HookMap<SyncBailHook<[string[], StatsPrinterContext], void>>;
  printElements: HookMap<
    SyncBailHook<
      [PrintedElement[], StatsPrinterContext],
      string | undefined | void
    >
  >;
  sortItems: HookMap<
    SyncBailHook<[PrintObject[], StatsPrinterContext], boolean | void>
  >;
  getItemName: HookMap<
    SyncBailHook<[PrintObject, StatsPrinterContext], string | void>
  >;
  printItems: HookMap<
    SyncBailHook<[string[], StatsPrinterContext], string | undefined>
  >;
  print: HookMap<
    SyncBailHook<[PrintObject, StatsPrinterContext], string | undefined | void>
  >;
  result: HookMap<SyncWaterfallHook<[string, StatsPrinterContext]>>;
};
import { HookMap } from 'tapable';
import { SyncBailHook } from 'tapable';
import { SyncWaterfallHook } from 'tapable';
