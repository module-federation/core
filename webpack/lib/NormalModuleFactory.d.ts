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
    constructor({ context, fs, resolverFactory, options, associatedObjectForCache, layers }: {
        context?: string | undefined;
        fs: InputFileSystem;
        resolverFactory: ResolverFactory;
        options: ModuleOptions;
        associatedObjectForCache?: any | undefined;
        layers?: boolean | undefined;
    });
    hooks: Readonly<{
        /** @type {AsyncSeriesBailHook<[ResolveData], Module | false | void>} */
        resolve: AsyncSeriesBailHook<[ResolveData], Module | false | void>;
        /** @type {HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>} */
        resolveForScheme: HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>;
        /** @type {HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>} */
        resolveInScheme: HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>;
        /** @type {AsyncSeriesBailHook<[ResolveData], Module>} */
        factorize: AsyncSeriesBailHook<[ResolveData], Module>;
        /** @type {AsyncSeriesBailHook<[ResolveData], false | void>} */
        beforeResolve: AsyncSeriesBailHook<[ResolveData], false | void>;
        /** @type {AsyncSeriesBailHook<[ResolveData], false | void>} */
        afterResolve: AsyncSeriesBailHook<[ResolveData], false | void>;
        /** @type {AsyncSeriesBailHook<[ResolveData["createData"], ResolveData], Module | void>} */
        createModule: AsyncSeriesBailHook<[Partial<NormalModule.NormalModuleCreateData & {
            settings: ModuleSettings;
        }>, ResolveData], void | Module, import("tapable").UnsetAdditionalOptions>;
        /** @type {SyncWaterfallHook<[Module, ResolveData["createData"], ResolveData], Module>} */
        module: SyncWaterfallHook<[Module, Partial<NormalModule.NormalModuleCreateData & {
            settings: ModuleSettings;
        }>, ResolveData], Module>;
        createParser: HookMap<SyncBailHook<any, any, import("tapable").UnsetAdditionalOptions>>;
        parser: HookMap<SyncHook<any, void, import("tapable").UnsetAdditionalOptions>>;
        createGenerator: HookMap<SyncBailHook<any, any, import("tapable").UnsetAdditionalOptions>>;
        generator: HookMap<SyncHook<any, void, import("tapable").UnsetAdditionalOptions>>;
        createModuleClass: HookMap<SyncBailHook<any, any, import("tapable").UnsetAdditionalOptions>>;
    }>;
    resolverFactory: import("./ResolverFactory");
    ruleSet: RuleSetCompiler.RuleSet;
    context: string;
    fs: import("./util/fs").InputFileSystem;
    _globalParserOptions: import("../declarations/WebpackOptions").ParserOptionsByModuleType;
    _globalGeneratorOptions: import("../declarations/WebpackOptions").GeneratorOptionsByModuleType;
    /** @type {Map<string, WeakMap<Object, TODO>>} */
    parserCache: Map<string, WeakMap<any, TODO>>;
    /** @type {Map<string, WeakMap<Object, Generator>>} */
    generatorCache: Map<string, WeakMap<any, Generator>>;
    /** @type {Set<Module>} */
    _restoredUnsafeCacheEntries: Set<Module>;
    _parseResourceWithoutFragment: (str: any) => any;
    cleanupForCache(): void;
    resolveResource(contextInfo: any, context: any, unresolvedResource: any, resolver: any, resolveContext: any, callback: any): void;
    _resolveResourceErrorHints(error: any, contextInfo: any, context: any, unresolvedResource: any, resolver: any, resolveContext: any, callback: any): void;
    resolveRequestArray(contextInfo: any, context: any, array: any, resolver: any, resolveContext: any, callback: any): any;
    getParser(type: any, parserOptions?: {}): TODO;
    /**
     * @param {string} type type
     * @param {{[k: string]: any}} parserOptions parser options
     * @returns {Parser} parser
     */
    createParser(type: string, parserOptions?: {
        [k: string]: any;
    }): Parser;
    getGenerator(type: any, generatorOptions?: {}): import("./Generator");
    createGenerator(type: any, generatorOptions?: {}): any;
    getResolver(type: any, resolveOptions: any): import("./ResolverFactory").ResolverWithOptions;
}
declare namespace NormalModuleFactory {
    export { ModuleOptions, RuleSetRule, Generator, ModuleFactoryCreateData, ModuleFactoryResult, NormalModuleCreateData, Parser, ResolverFactory, ModuleDependency, InputFileSystem, ModuleSettings, CreateData, ResolveData, ResourceData, ResourceDataWithData, ParsedLoaderRequest };
}
import ModuleFactory = require("./ModuleFactory");
import { AsyncSeriesBailHook } from "tapable";
type ResolveData = {
    contextInfo: ModuleFactoryCreateData["contextInfo"];
    resolveOptions: ModuleFactoryCreateData["resolveOptions"];
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
import Module = require("./Module");
import { HookMap } from "tapable";
type ResourceDataWithData = ResourceData & {
    data: Record<string, any>;
};
import NormalModule = require("./NormalModule");
type ModuleSettings = Pick<RuleSetRule, 'type' | 'sideEffects' | 'parser' | 'generator' | 'resolve' | 'layer'>;
import { SyncWaterfallHook } from "tapable";
import { SyncBailHook } from "tapable";
import { SyncHook } from "tapable";
import RuleSetCompiler = require("./rules/RuleSetCompiler");
type Generator = import("./Generator");
type Parser = import("./Parser");
type InputFileSystem = import("./util/fs").InputFileSystem;
type ResolverFactory = import("./ResolverFactory");
type ModuleOptions = import("../declarations/WebpackOptions").ModuleOptionsNormalized;
type RuleSetRule = import("../declarations/WebpackOptions").RuleSetRule;
type ModuleFactoryCreateData = import("./ModuleFactory").ModuleFactoryCreateData;
type ModuleFactoryResult = import("./ModuleFactory").ModuleFactoryResult;
type NormalModuleCreateData = import("./NormalModule").NormalModuleCreateData;
type ModuleDependency = import("./dependencies/ModuleDependency");
type CreateData = Partial<NormalModuleCreateData & {
    settings: ModuleSettings;
}>;
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
import LazySet = require("./util/LazySet");
