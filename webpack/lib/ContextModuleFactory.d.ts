export = ContextModuleFactory;
declare class ContextModuleFactory extends ModuleFactory {
    /**
     * @param {ResolverFactory} resolverFactory resolverFactory
     */
    constructor(resolverFactory: ResolverFactory);
    hooks: Readonly<{
        /** @type {AsyncSeriesWaterfallHook<[BeforeContextResolveData], BeforeContextResolveData | false | void>} */
        beforeResolve: AsyncSeriesWaterfallHook<[BeforeContextResolveData], BeforeContextResolveData | false | void>;
        /** @type {AsyncSeriesWaterfallHook<[AfterContextResolveData], AfterContextResolveData | false | void>} */
        afterResolve: AsyncSeriesWaterfallHook<[AfterContextResolveData], AfterContextResolveData | false | void>;
        /** @type {SyncWaterfallHook<[string[]]>} */
        contextModuleFiles: SyncWaterfallHook<[string[]]>;
        /** @type {FakeHook<Pick<AsyncSeriesWaterfallHook<[ContextAlternativeRequest[]]>, "tap" | "tapAsync" | "tapPromise" | "name">>} */
        alternatives: FakeHook<Pick<AsyncSeriesWaterfallHook<[ContextAlternativeRequest[]]>, "tap" | "tapAsync" | "tapPromise" | "name">>;
        alternativeRequests: AsyncSeriesWaterfallHook<[ContextAlternativeRequest[], ContextModule.ContextModuleOptions], ContextAlternativeRequest[], import("tapable").UnsetAdditionalOptions>;
    }>;
    resolverFactory: import("./ResolverFactory");
    /**
     * @param {InputFileSystem} fs file system
     * @param {ContextModuleOptions} options options
     * @param {ResolveDependenciesCallback} callback callback function
     * @returns {void}
     */
    resolveDependencies(fs: InputFileSystem, options: ContextModuleOptions, callback: ResolveDependenciesCallback): void;
}
declare namespace ContextModuleFactory {
    export { ResolveRequest, FileSystemDependencies, ContextModuleOptions, ResolveDependenciesCallback, ModuleFactoryCreateData, ModuleFactoryCallback, ResolverFactory, ContextDependency, ContextOptions, FakeHook, IStats, InputFileSystem, ContextAlternativeRequest, ContextResolveData, BeforeContextResolveData, AfterContextResolveData };
}
import ModuleFactory = require("./ModuleFactory");
import { AsyncSeriesWaterfallHook } from "tapable";
import { SyncWaterfallHook } from "tapable";
import ContextModule = require("./ContextModule");
type ResolveRequest = import("enhanced-resolve").ResolveRequest;
type FileSystemDependencies = import("./Compilation").FileSystemDependencies;
type ContextModuleOptions = import("./ContextModule").ContextModuleOptions;
type ResolveDependenciesCallback = import("./ContextModule").ResolveDependenciesCallback;
type ModuleFactoryCreateData = import("./ModuleFactory").ModuleFactoryCreateData;
type ModuleFactoryCallback = import("./ModuleFactory").ModuleFactoryCallback;
type ResolverFactory = import("./ResolverFactory");
type ContextDependency = import("./dependencies/ContextDependency");
type ContextOptions = import("./dependencies/ContextDependency").ContextOptions;
/**
 * <T>
 */
type FakeHook<T> = import("./util/deprecation").FakeHook<T>;
type IStats = import("./util/fs").IStats;
type InputFileSystem = import("./util/fs").InputFileSystem;
type ContextAlternativeRequest = {
    context: string;
    request: string;
};
type ContextResolveData = {
    context: string;
    request: string;
    resolveOptions: ModuleFactoryCreateData["resolveOptions"];
    fileDependencies: FileSystemDependencies;
    missingDependencies: FileSystemDependencies;
    contextDependencies: FileSystemDependencies;
    dependencies: ContextDependency[];
};
type BeforeContextResolveData = ContextResolveData & ContextOptions;
type AfterContextResolveData = BeforeContextResolveData & {
    resource: string | string[];
    resourceQuery: string | undefined;
    resourceFragment: string | undefined;
    resolveDependencies: ContextModuleFactory["resolveDependencies"];
};
