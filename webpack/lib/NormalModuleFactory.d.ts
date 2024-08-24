export = NormalModuleFactory;
declare class NormalModuleFactory extends ModuleFactory {
  /**
   * @param {Object} param params
   * @param {string=} param.context context
   * @param {InputFileSystem} param.fs file system
   * @param {ResolverFactory} param.resolverFactory resolverFactory
   * @param {ModuleOptions} param.options options
   * @param {Object=} param.associatedObjectForCache an object to which the cache will be attached
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
    associatedObjectForCache?: any | undefined;
    layers?: boolean | undefined;
  });
  hooks: Readonly<{
    resolve: AsyncSeriesBailHook<[ResolveData], false | void | Module>;
    resolveForScheme: HookMap<
      AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>
    >;
    resolveInScheme: HookMap<
      AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>
    >;
    factorize: AsyncSeriesBailHook<[ResolveData], undefined | Module>;
    beforeResolve: AsyncSeriesBailHook<[ResolveData], false | void>;
    afterResolve: AsyncSeriesBailHook<[ResolveData], false | void>;
    createModule: AsyncSeriesBailHook<
      [
        Partial<NormalModuleCreateData & { settings: ModuleSettings }>,
        ResolveData,
      ],
      void | Module
    >;
    module: SyncWaterfallHook<
      [
        Module,
        Partial<NormalModuleCreateData & { settings: ModuleSettings }>,
        ResolveData,
      ],
      Module
    >;
    createParser: HookMap<SyncBailHook<[ParserOptions], Parser>>;
    parser: HookMap<SyncBailHook<[any, ParserOptions], void>>;
    createGenerator: HookMap<SyncBailHook<[GeneratorOptions], Generator>>;
    generator: HookMap<SyncBailHook<[any, GeneratorOptions], void>>;
    createModuleClass: HookMap<SyncBailHook<[any, ResolveData], Module>>;
  }>;
  resolverFactory: ResolverFactory;
  ruleSet: RuleSet;
  context: string;
  fs: InputFileSystem;
  parserCache: Map<string, WeakMap<object, Parser>>;
  generatorCache: Map<string, WeakMap<object, Generator>>;
  cleanupForCache(): void;
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
  resolveRequestArray(
    contextInfo: ModuleFactoryCreateDataContextInfo,
    context: string,
    array: LoaderItem[],
    resolver: ResolverWithOptions,
    resolveContext: ResolveContext,
    callback: CallbackNormalModuleFactory<LoaderItem[]>,
  ): void;
  getParser(type: string, parserOptions?: ParserOptions): Parser;
  createParser(type: string, parserOptions?: ParserOptions): Parser;
  getGenerator(type: string, generatorOptions?: GeneratorOptions): Generator;
  createGenerator(type: string, generatorOptions?: GeneratorOptions): Generator;
  getResolver(
    type: string,
    resolveOptions?: ResolveOptionsWithDependencyType,
  ): ResolverWithOptions;
}

declare namespace NormalModuleFactory {
  export {
    ModuleOptions,
    RuleSetRule,
    Generator,
    ModuleFactoryCreateData,
    ModuleFactoryResult,
    NormalModuleCreateData,
    Parser,
    ResolverFactory,
    ModuleDependency,
    InputFileSystem,
    ModuleSettings,
    CreateData,
    ResolveData,
    ResourceData,
    ResourceDataWithData,
    ParsedLoaderRequest,
  };
}
import ModuleFactory = require('./ModuleFactory');
import { AsyncSeriesBailHook } from 'tapable';
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
import Module = require('./Module');
import { HookMap } from 'tapable';
type ResourceDataWithData = ResourceData & {
  data: Record<string, any>;
};
import NormalModule = require('./NormalModule');
type ModuleSettings = Pick<
  RuleSetRule,
  'type' | 'sideEffects' | 'parser' | 'generator' | 'resolve' | 'layer'
>;
import { SyncWaterfallHook } from 'tapable';
import { SyncBailHook } from 'tapable';
import { SyncHook } from 'tapable';
import RuleSetCompiler from './rules/RuleSetCompiler';
type Generator = import('./Generator');
type Parser = import('./Parser');
type InputFileSystem = import('./util/fs').InputFileSystem;
type ResolverFactory = import('./ResolverFactory');
type ModuleOptions =
  import('../declarations/WebpackOptions').ModuleOptionsNormalized;
type RuleSetRule = import('../declarations/WebpackOptions').RuleSetRule;
type ModuleFactoryCreateData =
  import('./ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult = import('./ModuleFactory').ModuleFactoryResult;
type NormalModuleCreateData = import('./NormalModule').NormalModuleCreateData;
type ModuleDependency = import('./dependencies/ModuleDependency');
type CreateData = Partial<
  NormalModuleCreateData & {
    settings: ModuleSettings;
  }
>;
type ResourceData = {
  resource: string;
  path: string;
  query: string;
  fragment: string;
  context?: string | undefined;
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
import LazySet = require('./util/LazySet');
