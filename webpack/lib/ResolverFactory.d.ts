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
import { SyncHook } from 'tapable';
type ResolveOptions = import('enhanced-resolve').ResolveOptions;
type Resolver = import('enhanced-resolve').Resolver;
type WebpackResolveOptions =
  import('../declarations/WebpackOptions').ResolveOptions;
type ResolvePluginInstance =
  import('../declarations/WebpackOptions').ResolvePluginInstance;
type ResolveOptionsWithDependencyType = WebpackResolveOptions & {
  dependencyType?: string;
  resolveToContext?: boolean;
};
type WithOptions = {
  /**
   * create a resolver with additional/different options
   */
  withOptions: (
    options: Partial<ResolveOptionsWithDependencyType>,
  ) => ResolverWithOptions;
};
type ResolverWithOptions = Resolver & WithOptions;
type ResolverCache = {
  direct: WeakMap<ResolveOptionsWithDependencyType, ResolverWithOptions>;
  stringified: Map<string, ResolverWithOptions>;
};
