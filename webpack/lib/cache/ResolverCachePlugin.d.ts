export = ResolverCachePlugin;
declare class ResolverCachePlugin {
    /**
     * Apply the plugin
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace ResolverCachePlugin {
    export { ResolveContext, ResolveOptions, ResolveRequest, Resolver, ItemCacheFacade, Compiler, FileSystemInfo, Snapshot, SnapshotOptions, ResolveOptionsWithDependencyType, ObjectDeserializerContext, ObjectSerializerContext, SyncHook, Dependencies, Yield };
}
type ResolveContext = import("enhanced-resolve").ResolveContext;
type ResolveOptions = import("enhanced-resolve").ResolveOptions;
type ResolveRequest = import("enhanced-resolve").ResolveRequest;
type Resolver = import("enhanced-resolve").Resolver;
type ItemCacheFacade = import("../CacheFacade").ItemCacheFacade;
type Compiler = import("../Compiler");
type FileSystemInfo = import("../FileSystemInfo");
type Snapshot = import("../FileSystemInfo").Snapshot;
type SnapshotOptions = import("../FileSystemInfo").SnapshotOptions;
type ResolveOptionsWithDependencyType = import("../ResolverFactory").ResolveOptionsWithDependencyType;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type SyncHook<T> = import("tapable").SyncHook<T>;
type Dependencies = Set<string>;
type Yield = NonNullable<ResolveContext["yield"]>;
