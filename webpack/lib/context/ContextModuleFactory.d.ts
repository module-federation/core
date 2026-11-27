export = ContextModuleFactory;
declare class ContextModuleFactory extends ModuleFactory {
    /**
     * Creates an instance of ContextModuleFactory.
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
    /** @type {ResolverFactory} */
    resolverFactory: ResolverFactory;
    /**
     * Resolves dependencies.
     * @param {InputFileSystem} fs file system
     * @param {ContextModuleOptions} options options
     * @param {ResolveDependenciesCallback} callback callback function
     * @returns {void}
     */
    resolveDependencies(fs: InputFileSystem, options: ContextModule.ContextModuleOptions, callback: ContextModule.ResolveDependenciesCallback): void;
}
declare namespace ContextModuleFactory {
    export { AddSubDirectoryFn, FakeHook, ContextAlternativeRequest, ContextResolveData, BeforeContextResolveData, AfterContextResolveData };
}
import ModuleFactory = require("../module/ModuleFactory");
import { AsyncSeriesWaterfallHook } from "tapable";
import { SyncWaterfallHook } from "tapable";
import ContextModule = require("./ContextModule");
import type ResolverFactory from "../resolve/ResolverFactory";
import type { InputFileSystem } from "../fs/fs";
type AddSubDirectoryFn = (context: string, subResource: string, callback: () => void, resolvedGlobPatterns?: ResolvedContextModuleGlobPattern[]) => void;
/**
 * <T>
 */
type FakeHook<T> = import("../util/deprecation").FakeHook<T>;
type ContextAlternativeRequest = {
    context: string;
    request: string;
};
/**
 * Defines the context resolve data type used by this module.
 */
type ContextResolveData = {
    context: string;
    request: string;
    resolveOptions: ModuleFactory.ModuleFactoryCreateData["resolveOptions"];
    fileDependencies: FileSystemDependencies;
    missingDependencies: FileSystemDependencies;
    contextDependencies: FileSystemDependencies;
    dependencies: ContextDependency[];
};
type BeforeContextResolveData = ContextResolveData & ContextModule.ContextOptions;
type AfterContextResolveData = BeforeContextResolveData & {
    resource: string | string[];
    resourceQuery: string | undefined;
    resourceFragment: string | undefined;
    resolveDependencies: ContextModuleFactory["resolveDependencies"];
};
import type { ResolvedContextModuleGlobPattern } from "../util/globUtils";
import type { FileSystemDependencies } from "../Compilation";
import type ContextDependency from "../dependencies/context/ContextDependency";
