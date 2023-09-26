export = ContextModuleFactory;
declare class ContextModuleFactory extends ModuleFactory {
  /**
   * @param {ResolverFactory} resolverFactory resolverFactory
   */
  constructor(resolverFactory: ResolverFactory);
  hooks: Readonly<{
    /** @type {AsyncSeriesWaterfallHook<[TODO]>} */
    beforeResolve: AsyncSeriesWaterfallHook<[TODO]>;
    /** @type {AsyncSeriesWaterfallHook<[TODO]>} */
    afterResolve: AsyncSeriesWaterfallHook<[TODO]>;
    /** @type {SyncWaterfallHook<[string[]]>} */
    contextModuleFiles: SyncWaterfallHook<[string[]]>;
    /** @type {FakeHook<Pick<AsyncSeriesWaterfallHook<[TODO[]]>, "tap" | "tapAsync" | "tapPromise" | "name">>} */
    alternatives: FakeHook<
      Pick<
        AsyncSeriesWaterfallHook<[TODO[]]>,
        'tap' | 'tapAsync' | 'tapPromise' | 'name'
      >
    >;
    alternativeRequests: AsyncSeriesWaterfallHook<
      [TODO[], ContextModule.ContextModuleOptions],
      import('tapable').UnsetAdditionalOptions
    >;
  }>;
  resolverFactory: import('./ResolverFactory');
  /**
   * @param {InputFileSystem} fs file system
   * @param {ContextModuleOptions} options options
   * @param {ResolveDependenciesCallback} callback callback function
   * @returns {void}
   */
  resolveDependencies(
    fs: InputFileSystem,
    options: ContextModuleOptions,
    callback: ResolveDependenciesCallback,
  ): void;
}
declare namespace ContextModuleFactory {
  export {
    ContextModuleOptions,
    ResolveDependenciesCallback,
    Module,
    ModuleFactoryCreateData,
    ModuleFactoryResult,
    ResolverFactory,
    ContextDependency,
    FakeHook,
    InputFileSystem,
  };
}
import ModuleFactory = require('./ModuleFactory');
import { AsyncSeriesWaterfallHook } from 'tapable';
import { SyncWaterfallHook } from 'tapable';
/**
 * <T>
 */
type FakeHook<T> = import('./util/deprecation').FakeHook<T>;
import ContextModule = require('./ContextModule');
type InputFileSystem = import('./util/fs').InputFileSystem;
type ContextModuleOptions = import('./ContextModule').ContextModuleOptions;
type ResolveDependenciesCallback =
  import('./ContextModule').ResolveDependenciesCallback;
type ResolverFactory = import('./ResolverFactory');
type Module = import('./Module');
type ModuleFactoryCreateData =
  import('./ModuleFactory').ModuleFactoryCreateData;
type ModuleFactoryResult = import('./ModuleFactory').ModuleFactoryResult;
type ContextDependency = import('./dependencies/ContextDependency');
