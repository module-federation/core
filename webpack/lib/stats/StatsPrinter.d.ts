export = StatsPrinter;
/** @template T @typedef {import("tapable").AsArray<T>} AsArray<T> */
/** @typedef {import("tapable").Hook} Hook */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsAsset} StatsAsset */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsChunk} StatsChunk */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsChunkGroup} StatsChunkGroup */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsCompilation} StatsCompilation */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModule} StatsModule */
/** @typedef {import("./DefaultStatsFactoryPlugin").StatsModuleReason} StatsModuleReason */
/**
 * @typedef {Object} PrintedElement
 * @property {string} element
 * @property {string} content
 */
/**
 * @typedef {Object} KnownStatsPrinterContext
 * @property {string=} type
 * @property {StatsCompilation=} compilation
 * @property {StatsChunkGroup=} chunkGroup
 * @property {StatsAsset=} asset
 * @property {StatsModule=} module
 * @property {StatsChunk=} chunk
 * @property {StatsModuleReason=} moduleReason
 * @property {(str: string) => string=} bold
 * @property {(str: string) => string=} yellow
 * @property {(str: string) => string=} red
 * @property {(str: string) => string=} green
 * @property {(str: string) => string=} magenta
 * @property {(str: string) => string=} cyan
 * @property {(file: string, oversize?: boolean) => string=} formatFilename
 * @property {(id: string) => string=} formatModuleId
 * @property {(id: string, direction?: "parent"|"child"|"sibling") => string=} formatChunkId
 * @property {(size: number) => string=} formatSize
 * @property {(dateTime: number) => string=} formatDateTime
 * @property {(flag: string) => string=} formatFlag
 * @property {(time: number, boldQuantity?: boolean) => string=} formatTime
 * @property {string=} chunkGroupKind
 */
/** @typedef {KnownStatsPrinterContext & Record<string, any>} StatsPrinterContext */
declare class StatsPrinter {
  hooks: Readonly<{
    /** @type {HookMap<SyncBailHook<[string[], StatsPrinterContext], true>>} */
    sortElements: HookMap<SyncBailHook<[string[], StatsPrinterContext], true>>;
    /** @type {HookMap<SyncBailHook<[PrintedElement[], StatsPrinterContext], string>>} */
    printElements: HookMap<
      SyncBailHook<[PrintedElement[], StatsPrinterContext], string>
    >;
    /** @type {HookMap<SyncBailHook<[any[], StatsPrinterContext], true>>} */
    sortItems: HookMap<SyncBailHook<[any[], StatsPrinterContext], true>>;
    /** @type {HookMap<SyncBailHook<[any, StatsPrinterContext], string>>} */
    getItemName: HookMap<SyncBailHook<[any, StatsPrinterContext], string>>;
    /** @type {HookMap<SyncBailHook<[string[], StatsPrinterContext], string>>} */
    printItems: HookMap<SyncBailHook<[string[], StatsPrinterContext], string>>;
    /** @type {HookMap<SyncBailHook<[{}, StatsPrinterContext], string>>} */
    print: HookMap<SyncBailHook<[{}, StatsPrinterContext], string>>;
    /** @type {HookMap<SyncWaterfallHook<[string, StatsPrinterContext]>>} */
    result: HookMap<SyncWaterfallHook<[string, StatsPrinterContext]>>;
  }>;
  /** @type {Map<HookMap<Hook>, Map<string, Hook[]>>} */
  _levelHookCache: Map<
    HookMap<
      import('tapable').Hook<any, any, import('tapable').UnsetAdditionalOptions>
    >,
    Map<
      string,
      import('tapable').Hook<
        any,
        any,
        import('tapable').UnsetAdditionalOptions
      >[]
    >
  >;
  _inPrint: boolean;
  /**
   * get all level hooks
   * @private
   * @template {Hook} T
   * @param {HookMap<T>} hookMap HookMap
   * @param {string} type type
   * @returns {T[]} hooks
   */
  private _getAllLevelHooks;
  /**
   * Run `fn` for each level
   * @private
   * @template T
   * @template R
   * @param {HookMap<SyncBailHook<T, R>>} hookMap HookMap
   * @param {string} type type
   * @param {(hook: SyncBailHook<T, R>) => R} fn function
   * @returns {R} result of `fn`
   */
  private _forEachLevel;
  /**
   * Run `fn` for each level
   * @private
   * @template T
   * @param {HookMap<SyncWaterfallHook<T>>} hookMap HookMap
   * @param {string} type type
   * @param {AsArray<T>[0]} data data
   * @param {(hook: SyncWaterfallHook<T>, data: AsArray<T>[0]) => AsArray<T>[0]} fn function
   * @returns {AsArray<T>[0]} result of `fn`
   */
  private _forEachLevelWaterfall;
  /**
   * @param {string} type The type
   * @param {Object} object Object to print
   * @param {Object=} baseContext The base context
   * @returns {string} printed result
   */
  print(type: string, object: any, baseContext?: any | undefined): string;
  /**
   * @private
   * @param {string} type type
   * @param {Object} object object
   * @param {Object=} baseContext context
   * @returns {string} printed result
   */
  private _print;
}
declare namespace StatsPrinter {
  export {
    AsArray,
    Hook,
    StatsAsset,
    StatsChunk,
    StatsChunkGroup,
    StatsCompilation,
    StatsModule,
    StatsModuleReason,
    PrintedElement,
    KnownStatsPrinterContext,
    StatsPrinterContext,
  };
}
import { HookMap } from 'tapable';
import { SyncBailHook } from 'tapable';
type StatsPrinterContext = KnownStatsPrinterContext & Record<string, any>;
type PrintedElement = {
  element: string;
  content: string;
};
import { SyncWaterfallHook } from 'tapable';
/**
 * <T>
 */
type AsArray<T> = import('tapable').AsArray<T>;
type Hook = import('tapable').Hook<
  any,
  any,
  import('tapable').UnsetAdditionalOptions
>;
type StatsAsset = import('./DefaultStatsFactoryPlugin').StatsAsset;
type StatsChunk = import('./DefaultStatsFactoryPlugin').StatsChunk;
type StatsChunkGroup = import('./DefaultStatsFactoryPlugin').StatsChunkGroup;
type StatsCompilation = import('./DefaultStatsFactoryPlugin').StatsCompilation;
type StatsModule = import('./DefaultStatsFactoryPlugin').StatsModule;
type StatsModuleReason =
  import('./DefaultStatsFactoryPlugin').StatsModuleReason;
type KnownStatsPrinterContext = {
  type?: string | undefined;
  compilation?: StatsCompilation | undefined;
  chunkGroup?: StatsChunkGroup | undefined;
  asset?: StatsAsset | undefined;
  module?: StatsModule | undefined;
  chunk?: StatsChunk | undefined;
  moduleReason?: StatsModuleReason | undefined;
  bold?: (str: string) => string;
  yellow?: (str: string) => string;
  red?: (str: string) => string;
  green?: (str: string) => string;
  magenta?: (str: string) => string;
  cyan?: (str: string) => string;
  formatFilename?: (file: string, oversize?: boolean) => string;
  formatModuleId?: (id: string) => string;
  formatChunkId?: (
    id: string,
    direction?: 'parent' | 'child' | 'sibling',
  ) => string;
  formatSize?: (size: number) => string;
  formatDateTime?: (dateTime: number) => string;
  formatFlag?: (flag: string) => string;
  formatTime?: (time: number, boldQuantity?: boolean) => string;
  chunkGroupKind?: string | undefined;
};
