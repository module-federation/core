export = NormalModuleFactory;
declare class NormalModuleFactory extends ModuleFactory {
  /**
   * @param {object} param params
   * @param {string=} param.context context
   * @param {InputFileSystem} param.fs file system
   * @param {ResolverFactory} param.resolverFactory resolverFactory
   * @param {ModuleOptions} param.options options
   * @param {object=} param.associatedObjectForCache an object to which the cache will be attached
   * @param {boolean=} param.layers enable layers
   */
  constructor({
    context,
    fs,
    resolverFactory,
    options,
    associatedObjectForCache,
    layers,
  }: {
    context?: string | undefined;
    fs: InputFileSystem;
    resolverFactory: ResolverFactory;
    options: ModuleOptions;
    associatedObjectForCache?: object | undefined;
    layers?: boolean | undefined;
  });
  hooks: Readonly<{
    /** @type {AsyncSeriesBailHook<[ResolveData], Module | false | void>} */
    resolve: AsyncSeriesBailHook<[ResolveData], Module | false | void>;
    /** @type {HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>} */
    resolveForScheme: HookMap<
      AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>
    >;
    /** @type {HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>} */
    resolveInScheme: HookMap<
      AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>
    >;
    /** @type {AsyncSeriesBailHook<[ResolveData], Module | undefined>} */
    factorize: AsyncSeriesBailHook<[ResolveData], Module | undefined>;
    /** @type {AsyncSeriesBailHook<[ResolveData], false | void>} */
    beforeResolve: AsyncSeriesBailHook<[ResolveData], false | void>;
    /** @type {AsyncSeriesBailHook<[ResolveData], false | void>} */
    afterResolve: AsyncSeriesBailHook<[ResolveData], false | void>;
    /** @type {AsyncSeriesBailHook<[ResolveData["createData"], ResolveData], Module | void>} */
    createModule: AsyncSeriesBailHook<
      [ResolveData['createData'], ResolveData],
      Module | void
    >;
    /** @type {SyncWaterfallHook<[Module, ResolveData["createData"], ResolveData], Module>} */
    module: SyncWaterfallHook<
      [Module, ResolveData['createData'], ResolveData],
      Module
    >;
    /** @type {HookMap<SyncBailHook<[ParserOptions], Parser>>} */
    createParser: HookMap<SyncBailHook<[ParserOptions], Parser>>;
    /** @type {HookMap<SyncBailHook<[TODO, ParserOptions], void>>} */
    parser: HookMap<SyncBailHook<[TODO, ParserOptions], void>>;
    /** @type {HookMap<SyncBailHook<[GeneratorOptions], Generator>>} */
    createGenerator: HookMap<SyncBailHook<[GeneratorOptions], Generator>>;
    /** @type {HookMap<SyncBailHook<[TODO, GeneratorOptions], void>>} */
    generator: HookMap<SyncBailHook<[TODO, GeneratorOptions], void>>;
    /** @type {HookMap<SyncBailHook<[TODO, ResolveData], Module>>} */
    createModuleClass: HookMap<SyncBailHook<[TODO, ResolveData], Module>>;
  }>;
  resolverFactory: import('./ResolverFactory');
  ruleSet: RuleSetCompiler.RuleSet;
  context: string;
  fs: import('./util/fs').InputFileSystem;
  _globalParserOptions: import('../declarations/WebpackOptions').ParserOptionsByModuleType;
  _globalGeneratorOptions: import('../declarations/WebpackOptions').GeneratorOptionsByModuleType;
  /** @type {Map<string, WeakMap<object, Parser>>} */
  parserCache: Map<string, WeakMap<object, Parser>>;
  /** @type {Map<string, WeakMap<object, Generator>>} */
  generatorCache: Map<string, WeakMap<object, Generator>>;
  /** @type {Set<Module>} */
  _restoredUnsafeCacheEntries: Set<Module>;
  _parseResourceWithoutFragment: import('./util/identifier').BindCacheResultFn<
    import('./util/identifier').ParsedResourceWithoutFragment
  >;
  cleanupForCache(): void;
  /**
   * @param {ModuleFactoryCreateDataContextInfo} contextInfo context info
   * @param {string} context context
   * @param {string} unresolvedResource unresolved resource
   * @param {ResolverWithOptions} resolver resolver
   * @param {ResolveContext} resolveContext resolver context
   * @param {(err: null | Error, res?: string | false, req?: ResolveRequest) => void} callback callback
   */
  resolveResource(
    contextInfo: ModuleFactoryCreateDataContextInfo,
    context: string,
    unresolvedResource: string,
    resolver: ResolverWithOptions,
    resolveContext: ResolveContext,
    callback: (
      err: null | Error,
      res?: string | false,
      req?: ResolveRequest,
    ) => void,
  ): void;
  /**
   * @param {Error} error error
   * @param {ModuleFactoryCreateDataContextInfo} contextInfo context info
   * @param {string} context context
   * @param {string} unresolvedResource unresolved resource
   * @param {ResolverWithOptions} resolver resolver
   * @param {ResolveContext} resolveContext resolver context
   * @param {Callback<string[]>} callback callback
   * @private
   */
  private _resolveResourceErrorHints;
  /**
   * @param {ModuleFactoryCreateDataContextInfo} contextInfo context info
   * @param {string} context context
   * @param {LoaderItem[]} array array
   * @param {ResolverWithOptions} resolver resolver
   * @param {ResolveContext} resolveContext resolve context
   * @param {Callback<LoaderItem[]>} callback callback
   * @returns {void} result
   */
  resolveRequestArray(
    contextInfo: ModuleFactoryCreateDataContextInfo,
    context: string,
    array: LoaderItem[],
    resolver: ResolverWithOptions,
    resolveContext: ResolveContext,
    callback: Callback<LoaderItem[]>,
  ): void;
  /**
   * @param {string} type type
   * @param {ParserOptions} parserOptions parser options
   * @returns {Parser} parser
   */
  getParser(type: string, parserOptions?: ParserOptions): Parser;
  /**
   * @param {string} type type
   * @param {ParserOptions} parserOptions parser options
   * @returns {Parser} parser
   */
  createParser(type: string, parserOptions?: ParserOptions): Parser;
  /**
   * @param {string} type type of generator
   * @param {GeneratorOptions} generatorOptions generator options
   * @returns {Generator} generator
   */
  getGenerator(type: string, generatorOptions?: GeneratorOptions): Generator;
  /**
   * @param {string} type type of generator
   * @param {GeneratorOptions} generatorOptions generator options
   * @returns {Generator} generator
   */
  createGenerator(type: string, generatorOptions?: GeneratorOptions): Generator;
  /**
   * @param {Parameters<ResolverFactory["get"]>[0]} type type of resolver
   * @param {Parameters<ResolverFactory["get"]>[1]=} resolveOptions options
   * @returns {ReturnType<ResolverFactory["get"]>} the resolver
   */
  getResolver(
    type: Parameters<ResolverFactory['get']>[0],
    resolveOptions?: Parameters<ResolverFactory['get']>[1] | undefined,
  ): ReturnType<ResolverFactory['get']>;
}
declare namespace NormalModuleFactory {
  export {
    ModuleOptions,
    RuleSetRule,
    Generator,
    ModuleFactoryCreateData,
    ModuleFactoryCreateDataContextInfo,
    ModuleFactoryResult,
    GeneratorOptions,
    LoaderItem,
    NormalModuleCreateData,
    ParserOptions,
    Parser,
    ResolverFactory,
    ResolveContext,
    ResolveRequest,
    ResolverWithOptions,
    ModuleDependency,
    InputFileSystem,
    ModuleSettings,
    CreateData,
    ResolveData,
    ResourceData,
    ResourceDataWithData,
    ParsedLoaderRequest,
    Callback,
  };
}
import ModuleFactory = require('./ModuleFactory');
import { AsyncSeriesBailHook } from 'tapable';
import Module = require('./Module');
import { HookMap } from 'tapable';
import { SyncWaterfallHook } from 'tapable';
import { SyncBailHook } from 'tapable';
import RuleSetCompiler = require('./rules/RuleSetCompiler');
type ModuleOptions =
  import('../declarations/WebpackOptions').ModuleOptionsNormalized;
type RuleSetRule = import('../declarations/WebpackOptions').RuleSetRule;
type Generator = import('./Generator');
type ModuleFactoryCreateData =
  import('./ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryCreateDataContextInfo =
  import('./ModuleFactory').ModuleFactoryCreateDataContextInfo;
type ModuleFactoryResult = import('./ModuleFactory').ModuleFactoryResult;
type GeneratorOptions = import('./NormalModule').GeneratorOptions;
type LoaderItem = import('./NormalModule').LoaderItem;
type NormalModuleCreateData = import('./NormalModule').NormalModuleCreateData;
type ParserOptions = import('./NormalModule').ParserOptions;
type Parser = import('./Parser');
type ResolverFactory = import('./ResolverFactory');
type ResolveContext = import('./ResolverFactory').ResolveContext;
type ResolveRequest = import('./ResolverFactory').ResolveRequest;
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type ModuleDependency = import('./dependencies/ModuleDependency');
type InputFileSystem = import('./util/fs').InputFileSystem;
type ModuleSettings = Pick<
  RuleSetRule,
  'type' | 'sideEffects' | 'parser' | 'generator' | 'resolve' | 'layer'
>;
type CreateData = Partial<
  NormalModuleCreateData & {
    settings: ModuleSettings;
  }
>;
type ResolveData = {
  contextInfo: ModuleFactoryCreateData['contextInfo'];
  resolveOptions: ModuleFactoryCreateData['resolveOptions'];
  context: string;
  request: string;
  assertions: Record<string, any> | undefined;
  dependencies: ModuleDependency[];
  dependencyType: string;
  createData: CreateData;
  fileDependencies: LazySet<string>;
  missingDependencies: LazySet<string>;
  contextDependencies: LazySet<string>;
  /**
   * allow to use the unsafe cache
   */
  cacheable: boolean;
};
type ResourceData = {
  resource: string;
  path?: string | undefined;
  query?: string | undefined;
  fragment?: string | undefined;
  context?: string | undefined;
};
type ResourceDataWithData = ResourceData & {
  data: Record<string, any>;
};
type ParsedLoaderRequest = {
  /**
   * loader
   */
  loader: string;
  /**
   * options
   */
  options: string | undefined;
};
type Callback<T> = (
  err?: (Error | null) | undefined,
  stats?: T | undefined,
) => void;
import LazySet = require('./util/LazySet');
