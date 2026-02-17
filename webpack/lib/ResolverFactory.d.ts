export = ResolverFactory;
declare class ResolverFactory {
  hooks: Readonly<{
    /** @type {HookMap<SyncWaterfallHook<[ResolveOptionsWithDependencyType]>>} */
    resolveOptions: HookMap<
      SyncWaterfallHook<[ResolveOptionsWithDependencyType]>
    >;
    /** @type {HookMap<SyncHook<[Resolver, ResolveOptions, ResolveOptionsWithDependencyType]>>} */
    resolver: HookMap<
      SyncHook<[Resolver, ResolveOptions, ResolveOptionsWithDependencyType]>
    >;
  }>;
  /** @type {Map<string, ResolverCache>} */
  cache: Map<string, ResolverCache>;
  /**
   * @param {string} type type of resolver
   * @param {ResolveOptionsWithDependencyType=} resolveOptions options
   * @returns {ResolverWithOptions} the resolver
   */
  get(
    type: string,
    resolveOptions?: ResolveOptionsWithDependencyType | undefined,
  ): ResolverWithOptions;
  /**
   * @param {string} type type of resolver
   * @param {ResolveOptionsWithDependencyType} resolveOptionsWithDepType options
   * @returns {ResolverWithOptions} the resolver
   */
  _create(
    type: string,
    resolveOptionsWithDepType: ResolveOptionsWithDependencyType,
  ): ResolverWithOptions;
}
declare namespace ResolverFactory {
  export {
    ResolveOptions,
    Resolver,
    WebpackResolveOptions,
    ResolvePluginInstance,
    ResolveOptionsWithDependencyType,
    WithOptions,
    ResolverWithOptions,
    ResolverCache,
  };
}
import { HookMap } from 'tapable';
import { SyncWaterfallHook } from 'tapable';
type ResolveOptionsWithDependencyType = WebpackResolveOptions & {
  dependencyType?: string;
  resolveToContext?: boolean;
};
import { SyncHook } from 'tapable';
type Resolver = import('enhanced-resolve').Resolver;
type ResolveOptions = import('enhanced-resolve').ResolveOptions;
type ResolverCache = {
  direct: WeakMap<any, ResolverWithOptions>;
  stringified: Map<string, ResolverWithOptions>;
};
type ResolverWithOptions = Resolver & WithOptions;
type WebpackResolveOptions =
  import('../declarations/WebpackOptions').ResolveOptions;
type ResolvePluginInstance =
  import('../declarations/WebpackOptions').ResolvePluginInstance;
type WithOptions = {
  /**
   * create a resolver with additional/different options
   */
  withOptions: (
    arg0: Partial<ResolveOptionsWithDependencyType>,
  ) => ResolverWithOptions;
};
