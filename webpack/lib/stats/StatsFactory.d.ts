export = StatsFactory;
/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../WebpackError")} WebpackError */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
/** @typedef {import("../util/smartGrouping").GroupConfig<any, object>} GroupConfig */
/**
 * @typedef {Object} KnownStatsFactoryContext
 * @property {string} type
 * @property {function(string): string=} makePathsRelative
 * @property {Compilation=} compilation
 * @property {Set<Module>=} rootModules
 * @property {Map<string,Chunk[]>=} compilationFileToChunks
 * @property {Map<string,Chunk[]>=} compilationAuxiliaryFileToChunks
 * @property {RuntimeSpec=} runtime
 * @property {function(Compilation): WebpackError[]=} cachedGetErrors
 * @property {function(Compilation): WebpackError[]=} cachedGetWarnings
 */
/** @typedef {KnownStatsFactoryContext & Record<string, any>} StatsFactoryContext */
declare class StatsFactory {
  hooks: Readonly<{
    /** @type {HookMap<SyncBailHook<[Object, any, StatsFactoryContext]>>} */
    extract: HookMap<
      SyncBailHook<
        [any, any, StatsFactoryContext],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
    /** @type {HookMap<SyncBailHook<[any, StatsFactoryContext, number, number]>>} */
    filter: HookMap<
      SyncBailHook<
        [any, StatsFactoryContext, number, number],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
    /** @type {HookMap<SyncBailHook<[(function(any, any): number)[], StatsFactoryContext]>>} */
    sort: HookMap<
      SyncBailHook<
        [((arg0: any, arg1: any) => number)[], StatsFactoryContext],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
    /** @type {HookMap<SyncBailHook<[any, StatsFactoryContext, number, number]>>} */
    filterSorted: HookMap<
      SyncBailHook<
        [any, StatsFactoryContext, number, number],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
    /** @type {HookMap<SyncBailHook<[GroupConfig[], StatsFactoryContext]>>} */
    groupResults: HookMap<
      SyncBailHook<
        [GroupConfig[], StatsFactoryContext],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
    /** @type {HookMap<SyncBailHook<[(function(any, any): number)[], StatsFactoryContext]>>} */
    sortResults: HookMap<
      SyncBailHook<
        [((arg0: any, arg1: any) => number)[], StatsFactoryContext],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
    /** @type {HookMap<SyncBailHook<[any, StatsFactoryContext, number, number]>>} */
    filterResults: HookMap<
      SyncBailHook<
        [any, StatsFactoryContext, number, number],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
    /** @type {HookMap<SyncBailHook<[any[], StatsFactoryContext]>>} */
    merge: HookMap<
      SyncBailHook<
        [any[], StatsFactoryContext],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
    /** @type {HookMap<SyncBailHook<[any[], StatsFactoryContext]>>} */
    result: HookMap<
      SyncBailHook<
        [any[], StatsFactoryContext],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
    /** @type {HookMap<SyncBailHook<[any, StatsFactoryContext]>>} */
    getItemName: HookMap<
      SyncBailHook<
        [any, StatsFactoryContext],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
    /** @type {HookMap<SyncBailHook<[any, StatsFactoryContext]>>} */
    getItemFactory: HookMap<
      SyncBailHook<
        [any, StatsFactoryContext],
        any,
        import('tapable').UnsetAdditionalOptions
      >
    >;
  }>;
  _caches: Record<
    | 'filter'
    | 'sort'
    | 'merge'
    | 'result'
    | 'extract'
    | 'filterSorted'
    | 'groupResults'
    | 'sortResults'
    | 'filterResults'
    | 'getItemName'
    | 'getItemFactory',
    Map<
      string,
      SyncBailHook<
        [any[], StatsFactoryContext],
        any,
        import('tapable').UnsetAdditionalOptions
      >[]
    >
  >;
  _inCreate: boolean;
  _getAllLevelHooks(hookMap: any, cache: any, type: any): any;
  _forEachLevel(hookMap: any, cache: any, type: any, fn: any): any;
  _forEachLevelWaterfall(
    hookMap: any,
    cache: any,
    type: any,
    data: any,
    fn: any,
  ): any;
  _forEachLevelFilter(
    hookMap: any,
    cache: any,
    type: any,
    items: any,
    fn: any,
    forceClone: any,
  ): any;
  /**
   * @param {string} type type
   * @param {any} data factory data
   * @param {Omit<StatsFactoryContext, "type">} baseContext context used as base
   * @returns {any} created object
   */
  create(
    type: string,
    data: any,
    baseContext: Omit<StatsFactoryContext, 'type'>,
  ): any;
  _create(type: any, data: any, baseContext: any): any;
}
declare namespace StatsFactory {
  export {
    Chunk,
    Compilation,
    Module,
    WebpackError,
    RuntimeSpec,
    GroupConfig,
    KnownStatsFactoryContext,
    StatsFactoryContext,
  };
}
import { HookMap } from 'tapable';
type StatsFactoryContext = KnownStatsFactoryContext & Record<string, any>;
import { SyncBailHook } from 'tapable';
type GroupConfig = import('../util/smartGrouping').GroupConfig<any, object>;
type Chunk = import('../Chunk');
type Compilation = import('../Compilation');
type Module = import('../Module');
type WebpackError = import('../WebpackError');
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
type KnownStatsFactoryContext = {
  type: string;
  makePathsRelative?: ((arg0: string) => string) | undefined;
  compilation?: Compilation | undefined;
  rootModules?: Set<Module> | undefined;
  compilationFileToChunks?: Map<string, Chunk[]> | undefined;
  compilationAuxiliaryFileToChunks?: Map<string, Chunk[]> | undefined;
  runtime?: RuntimeSpec | undefined;
  cachedGetErrors?: ((arg0: Compilation) => WebpackError[]) | undefined;
  cachedGetWarnings?: ((arg0: Compilation) => WebpackError[]) | undefined;
};
