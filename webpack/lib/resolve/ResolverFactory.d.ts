export = ResolverFactory;
declare class ResolverFactory {
    hooks: Readonly<{
        /** @type {HookMap<SyncWaterfallHook<[ResolveOptionsWithDependencyType]>>} */
        resolveOptions: HookMap<SyncWaterfallHook<[ResolveOptionsWithDependencyType]>>;
        /** @type {HookMap<SyncHook<[Resolver, ResolveOptions, ResolveOptionsWithDependencyType]>>} */
        resolver: HookMap<SyncHook<[Resolver, ResolveOptions, ResolveOptionsWithDependencyType]>>;
    }>;
    /** @type {Map<string, ResolverCache>} */
    cache: Map<string, ResolverCache>;
    /**
     * Returns the resolver.
     * @param {string} type type of resolver
     * @param {ResolveOptionsWithDependencyType=} resolveOptions options
     * @returns {ResolverWithOptions} the resolver
     */
    get(type: string, resolveOptions?: ResolveOptionsWithDependencyType | undefined): ResolverWithOptions;
    /**
     * Returns the resolver.
     * @param {string} type type of resolver
     * @param {ResolveOptionsWithDependencyType} resolveOptionsWithDepType options
     * @returns {ResolverWithOptions} the resolver
     */
    _create(type: string, resolveOptionsWithDepType: ResolveOptionsWithDependencyType): ResolverWithOptions;
}
declare namespace ResolverFactory {
    export { Resolver, ResolvePluginInstance, ResolveOptionsWithDependencyType, WithOptions, ResolverWithOptions, ResolverCache };
}
import { HookMap } from "tapable";
import { SyncWaterfallHook } from "tapable";
import { SyncHook } from "tapable";
import type { ResolveOptions } from "enhanced-resolve";
type Resolver = import("enhanced-resolve").Resolver;
type ResolvePluginInstance = import("../../declarations/WebpackOptions").ResolvePluginInstance;
type ResolveOptionsWithDependencyType = WebpackResolveOptions & {
    dependencyType?: string;
    resolveToContext?: boolean;
};
/**
 * Defines the with options type used by this module.
 */
type WithOptions = {
    /**
     * create a resolver with additional/different options
     */
    withOptions: (options: Partial<ResolveOptionsWithDependencyType>) => ResolverWithOptions;
};
type ResolverWithOptions = Resolver & WithOptions;
/**
 * Represents the resolver factory runtime component.
 */
type ResolverCache = {
    direct: WeakMap<ResolveOptionsWithDependencyType, ResolverWithOptions>;
    stringified: Map<string, ResolverWithOptions>;
};
import type { ResolveOptions as WebpackResolveOptions } from "../../declarations/WebpackOptions";
