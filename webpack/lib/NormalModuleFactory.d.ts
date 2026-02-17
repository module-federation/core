export = NormalModuleFactory;
/** @typedef {import("./javascript/JavascriptParser")} JavascriptParser */
/** @typedef {import("../declarations/WebpackOptions").JavascriptParserOptions} JavascriptParserOptions */
/** @typedef {import("./javascript/JavascriptGenerator")} JavascriptGenerator */
/** @typedef {import("../declarations/WebpackOptions").EmptyGeneratorOptions} EmptyGeneratorOptions */
/** @typedef {import("./json/JsonParser")} JsonParser */
/** @typedef {import("../declarations/WebpackOptions").JsonParserOptions} JsonParserOptions */
/** @typedef {import("./json/JsonGenerator")} JsonGenerator */
/** @typedef {import("../declarations/WebpackOptions").JsonGeneratorOptions} JsonGeneratorOptions */
/** @typedef {import("./asset/AssetParser")} AssetParser */
/** @typedef {import("./asset/AssetSourceParser")} AssetSourceParser */
/** @typedef {import("./asset/AssetBytesParser")} AssetBytesParser */
/** @typedef {import("../declarations/WebpackOptions").AssetParserOptions} AssetParserOptions */
/** @typedef {import("../declarations/WebpackOptions").EmptyParserOptions} EmptyParserOptions */
/** @typedef {import("./asset/AssetGenerator")} AssetGenerator */
/** @typedef {import("../declarations/WebpackOptions").AssetGeneratorOptions} AssetGeneratorOptions */
/** @typedef {import("../declarations/WebpackOptions").AssetInlineGeneratorOptions} AssetInlineGeneratorOptions */
/** @typedef {import("../declarations/WebpackOptions").AssetResourceGeneratorOptions} AssetResourceGeneratorOptions */
/** @typedef {import("./asset/AssetSourceGenerator")} AssetSourceGenerator */
/** @typedef {import("./asset/AssetBytesGenerator")} AssetBytesGenerator */
/** @typedef {import("./wasm-async/AsyncWebAssemblyParser")} AsyncWebAssemblyParser */
/** @typedef {import("./wasm-sync/WebAssemblyParser")} WebAssemblyParser */
/** @typedef {import("./css/CssParser")} CssParser */
/** @typedef {import("../declarations/WebpackOptions").CssParserOptions} CssParserOptions */
/** @typedef {import("../declarations/WebpackOptions").CssModuleParserOptions} CssModuleParserOptions */
/** @typedef {import("./css/CssGenerator")} CssGenerator */
/** @typedef {import("../declarations/WebpackOptions").CssGeneratorOptions} CssGeneratorOptions */
/** @typedef {import("../declarations/WebpackOptions").CssModuleGeneratorOptions} CssModuleGeneratorOptions */
/**
 * @typedef {[
 * [JAVASCRIPT_MODULE_TYPE_AUTO, JavascriptParser, JavascriptParserOptions, JavascriptGenerator, EmptyGeneratorOptions],
 * [JAVASCRIPT_MODULE_TYPE_DYNAMIC, JavascriptParser, JavascriptParserOptions, JavascriptGenerator, EmptyGeneratorOptions],
 * [JAVASCRIPT_MODULE_TYPE_ESM, JavascriptParser, JavascriptParserOptions, JavascriptGenerator, EmptyGeneratorOptions],
 * [JSON_MODULE_TYPE, JsonParser, JsonParserOptions, JsonGenerator, JsonGeneratorOptions],
 * [ASSET_MODULE_TYPE, AssetParser, AssetParserOptions, AssetGenerator, AssetGeneratorOptions],
 * [ASSET_MODULE_TYPE_INLINE, AssetParser, EmptyParserOptions, AssetGenerator, AssetGeneratorOptions],
 * [ASSET_MODULE_TYPE_RESOURCE, AssetParser, EmptyParserOptions, AssetGenerator, AssetGeneratorOptions],
 * [ASSET_MODULE_TYPE_SOURCE, AssetSourceParser, EmptyParserOptions, AssetSourceGenerator, EmptyGeneratorOptions],
 * [ASSET_MODULE_TYPE_BYTES, AssetBytesParser, EmptyParserOptions, AssetBytesGenerator, EmptyGeneratorOptions],
 * [WEBASSEMBLY_MODULE_TYPE_ASYNC, AsyncWebAssemblyParser, EmptyParserOptions, Generator, EmptyParserOptions],
 * [WEBASSEMBLY_MODULE_TYPE_SYNC, WebAssemblyParser, EmptyParserOptions, Generator, EmptyParserOptions],
 * [CSS_MODULE_TYPE, CssParser, CssParserOptions, CssGenerator, CssGeneratorOptions],
 * [CSS_MODULE_TYPE_AUTO, CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions],
 * [CSS_MODULE_TYPE_MODULE, CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions],
 * [CSS_MODULE_TYPE_GLOBAL, CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions],
 * [string, Parser, ParserOptions, Generator, GeneratorOptions],
 * ]} ParsersAndGeneratorsByTypes
 */
/**
 * @template {unknown[]} T
 * @template {number[]} I
 * @typedef {{ [K in keyof I]: K extends keyof I ? I[K] extends keyof T ? T[I[K]] : never : never }} ExtractTupleElements
 */
/**
 * @template {unknown[]} T
 * @template {number[]} A
 * @template [R=void]
 * @typedef {T extends [infer Head extends [string, ...unknown[]], ...infer Tail extends [string, ...unknown[]][]] ? Record<Head[0], SyncBailHook<ExtractTupleElements<Head, A>, R extends number ? Head[R] : R>> & RecordFactoryFromTuple<Tail, A, R> : unknown } RecordFactoryFromTuple
 */
declare class NormalModuleFactory extends ModuleFactory {
    /**
     * @param {object} param params
     * @param {string=} param.context context
     * @param {InputFileSystem} param.fs file system
     * @param {ResolverFactory} param.resolverFactory resolverFactory
     * @param {ModuleOptions} param.options options
     * @param {AssociatedObjectForCache} param.associatedObjectForCache an object to which the cache will be attached
     */
    constructor({ context, fs, resolverFactory, options, associatedObjectForCache }: {
        context?: string | undefined;
        fs: InputFileSystem;
        resolverFactory: ResolverFactory;
        options: ModuleOptions;
        associatedObjectForCache: AssociatedObjectForCache;
    });
    hooks: Readonly<{
        /** @type {AsyncSeriesBailHook<[ResolveData], Module | false | void>} */
        resolve: AsyncSeriesBailHook<[ResolveData], Module | false | void>;
        /** @type {HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>} */
        resolveForScheme: HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>;
        /** @type {HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>} */
        resolveInScheme: HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>;
        /** @type {AsyncSeriesBailHook<[ResolveData], Module | undefined>} */
        factorize: AsyncSeriesBailHook<[ResolveData], Module | undefined>;
        /** @type {AsyncSeriesBailHook<[ResolveData], false | void>} */
        beforeResolve: AsyncSeriesBailHook<[ResolveData], false | void>;
        /** @type {AsyncSeriesBailHook<[ResolveData], false | void>} */
        afterResolve: AsyncSeriesBailHook<[ResolveData], false | void>;
        /** @type {AsyncSeriesBailHook<[CreateData, ResolveData], Module | void>} */
        createModule: AsyncSeriesBailHook<[CreateData, ResolveData], Module | void>;
        /** @type {SyncWaterfallHook<[Module, CreateData, ResolveData]>} */
        module: SyncWaterfallHook<[Module, CreateData, ResolveData]>;
        /** @type {import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [2], 1>>} */
        createParser: import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [2], 1>>;
        /** @type {import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [1, 2]>>} */
        parser: import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [1, 2]>>;
        /** @type {import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [4], 3>>} */
        createGenerator: import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [4], 3>>;
        /** @type {import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [3, 4]>>} */
        generator: import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [3, 4]>>;
        /** @type {HookMap<SyncBailHook<[CreateData, ResolveData], Module | void>>} */
        createModuleClass: HookMap<SyncBailHook<[CreateData, ResolveData], Module | void>>;
    }>;
    resolverFactory: import("./ResolverFactory");
    ruleSet: RuleSetCompiler.RuleSet;
    context: string;
    fs: import("./util/fs").InputFileSystem;
    _globalParserOptions: import("../declarations/WebpackOptions").ParserOptionsByModuleType;
    _globalGeneratorOptions: import("../declarations/WebpackOptions").GeneratorOptionsByModuleType;
    /** @type {Map<string, WeakMap<ParserOptions, Parser>>} */
    parserCache: Map<string, WeakMap<ParserOptions, Parser>>;
    /** @type {Map<string, WeakMap<GeneratorOptions, Generator>>} */
    generatorCache: Map<string, WeakMap<GeneratorOptions, Generator>>;
    /** @type {Set<Module>} */
    _restoredUnsafeCacheEntries: Set<Module>;
    _parseResourceWithoutFragment: import("./util/identifier").BindCacheResultFn<import("./util/identifier").ParsedResourceWithoutFragment>;
    cleanupForCache(): void;
    /**
     * @param {ModuleFactoryCreateDataContextInfo} contextInfo context info
     * @param {string} context context
     * @param {string} unresolvedResource unresolved resource
     * @param {ResolverWithOptions} resolver resolver
     * @param {ResolveContext} resolveContext resolver context
     * @param {(err: null | Error, res?: string | false, req?: ResolveRequest) => void} callback callback
     */
    resolveResource(contextInfo: ModuleFactoryCreateDataContextInfo, context: string, unresolvedResource: string, resolver: ResolverWithOptions, resolveContext: ResolveContext, callback: (err: null | Error, res?: string | false, req?: ResolveRequest) => void): void;
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
    resolveRequestArray(contextInfo: ModuleFactoryCreateDataContextInfo, context: string, array: LoaderItem[], resolver: ResolverWithOptions, resolveContext: ResolveContext, callback: Callback<LoaderItem[]>): void;
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
    getResolver(type: Parameters<ResolverFactory["get"]>[0], resolveOptions?: Parameters<ResolverFactory["get"]>[1] | undefined): ReturnType<ResolverFactory["get"]>;
}
declare namespace NormalModuleFactory {
    export { ResolveContext, ResolveRequest, ModuleOptions, RuleSetRule, FileSystemDependencies, Generator, ModuleFactoryCallback, ModuleFactoryCreateData, ModuleFactoryCreateDataContextInfo, ModuleFactoryResult, GeneratorOptions, LoaderItem, NormalModuleCreateData, ParserOptions, Parser, ResolverFactory, ResolverWithOptions, ModuleDependency, ImportAttributes, RuleSetRules, InputFileSystem, AssociatedObjectForCache, Callback, ModuleSettings, CreateData, ResolveData, ResourceData, ResourceSchemeData, ResourceDataWithData, ParsedLoaderRequest, JAVASCRIPT_MODULE_TYPE_AUTO, JAVASCRIPT_MODULE_TYPE_DYNAMIC, JAVASCRIPT_MODULE_TYPE_ESM, JSON_MODULE_TYPE, ASSET_MODULE_TYPE, ASSET_MODULE_TYPE_INLINE, ASSET_MODULE_TYPE_RESOURCE, ASSET_MODULE_TYPE_SOURCE, ASSET_MODULE_TYPE_BYTES, WEBASSEMBLY_MODULE_TYPE_ASYNC, WEBASSEMBLY_MODULE_TYPE_SYNC, CSS_MODULE_TYPE, CSS_MODULE_TYPE_GLOBAL, CSS_MODULE_TYPE_MODULE, CSS_MODULE_TYPE_AUTO, KnownNormalModuleTypes, NormalModuleTypes, JavascriptParser, JavascriptParserOptions, JavascriptGenerator, EmptyGeneratorOptions, JsonParser, JsonParserOptions, JsonGenerator, JsonGeneratorOptions, AssetParser, AssetSourceParser, AssetBytesParser, AssetParserOptions, EmptyParserOptions, AssetGenerator, AssetGeneratorOptions, AssetInlineGeneratorOptions, AssetResourceGeneratorOptions, AssetSourceGenerator, AssetBytesGenerator, AsyncWebAssemblyParser, WebAssemblyParser, CssParser, CssParserOptions, CssModuleParserOptions, CssGenerator, CssGeneratorOptions, CssModuleGeneratorOptions, ParsersAndGeneratorsByTypes, ExtractTupleElements, RecordFactoryFromTuple };
}
import ModuleFactory = require("./ModuleFactory");
import { AsyncSeriesBailHook } from "tapable";
import Module = require("./Module");
import { HookMap } from "tapable";
import { SyncWaterfallHook } from "tapable";
import { SyncBailHook } from "tapable";
import RuleSetCompiler = require("./rules/RuleSetCompiler");
type ResolveContext = import("enhanced-resolve").ResolveContext;
type ResolveRequest = import("enhanced-resolve").ResolveRequest;
type ModuleOptions = import("../declarations/WebpackOptions").ModuleOptionsNormalized;
type RuleSetRule = import("../declarations/WebpackOptions").RuleSetRule;
type FileSystemDependencies = import("./Compilation").FileSystemDependencies;
type Generator = import("./Generator");
type ModuleFactoryCallback = import("./ModuleFactory").ModuleFactoryCallback;
type ModuleFactoryCreateData = import("./ModuleFactory").ModuleFactoryCreateData;
type ModuleFactoryCreateDataContextInfo = import("./ModuleFactory").ModuleFactoryCreateDataContextInfo;
type ModuleFactoryResult = import("./ModuleFactory").ModuleFactoryResult;
type GeneratorOptions = import("./NormalModule").GeneratorOptions;
type LoaderItem = import("./NormalModule").LoaderItem;
type NormalModuleCreateData = import("./NormalModule").NormalModuleCreateData;
type ParserOptions = import("./NormalModule").ParserOptions;
type Parser = import("./Parser");
type ResolverFactory = import("./ResolverFactory");
type ResolverWithOptions = import("./ResolverFactory").ResolverWithOptions;
type ModuleDependency = import("./dependencies/ModuleDependency");
type ImportAttributes = import("./javascript/JavascriptParser").ImportAttributes;
type RuleSetRules = import("./rules/RuleSetCompiler").RuleSetRules;
type InputFileSystem = import("./util/fs").InputFileSystem;
type AssociatedObjectForCache = import("./util/identifier").AssociatedObjectForCache;
type Callback<T> = import("./Compiler").Callback<T>;
type ModuleSettings = Pick<RuleSetRule, "type" | "sideEffects" | "parser" | "generator" | "resolve" | "layer" | "extractSourceMap">;
type CreateData = Partial<NormalModuleCreateData & {
    settings: ModuleSettings;
}>;
type ResolveData = {
    contextInfo: ModuleFactoryCreateData["contextInfo"];
    resolveOptions: ModuleFactoryCreateData["resolveOptions"];
    context: string;
    request: string;
    attributes: ImportAttributes | undefined;
    dependencies: ModuleDependency[];
    dependencyType: string;
    createData: CreateData;
    fileDependencies: FileSystemDependencies;
    missingDependencies: FileSystemDependencies;
    contextDependencies: FileSystemDependencies;
    ignoredModule?: Module | undefined;
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
type ResourceSchemeData = {
    /**
     * mime type of the resource
     */
    mimetype?: string | undefined;
    /**
     * additional parameters for the resource
     */
    parameters?: string | undefined;
    /**
     * encoding of the resource
     */
    encoding?: ("base64" | false) | undefined;
    /**
     * encoded content of the resource
     */
    encodedContent?: string | undefined;
};
type ResourceDataWithData = ResourceData & {
    data: ResourceSchemeData & Partial<ResolveRequest>;
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
type JAVASCRIPT_MODULE_TYPE_AUTO = "javascript/auto";
type JAVASCRIPT_MODULE_TYPE_DYNAMIC = "javascript/dynamic";
type JAVASCRIPT_MODULE_TYPE_ESM = "javascript/esm";
type JSON_MODULE_TYPE = "json";
type ASSET_MODULE_TYPE = "asset";
type ASSET_MODULE_TYPE_INLINE = "asset/inline";
type ASSET_MODULE_TYPE_RESOURCE = "asset/resource";
type ASSET_MODULE_TYPE_SOURCE = "asset/source";
type ASSET_MODULE_TYPE_BYTES = "asset/bytes";
type WEBASSEMBLY_MODULE_TYPE_ASYNC = "webassembly/async";
type WEBASSEMBLY_MODULE_TYPE_SYNC = "webassembly/sync";
type CSS_MODULE_TYPE = "css";
type CSS_MODULE_TYPE_GLOBAL = "css/global";
type CSS_MODULE_TYPE_MODULE = "css/module";
type CSS_MODULE_TYPE_AUTO = "css/auto";
type KnownNormalModuleTypes = JAVASCRIPT_MODULE_TYPE_AUTO | JAVASCRIPT_MODULE_TYPE_DYNAMIC | JAVASCRIPT_MODULE_TYPE_ESM | JSON_MODULE_TYPE | ASSET_MODULE_TYPE | ASSET_MODULE_TYPE_INLINE | ASSET_MODULE_TYPE_RESOURCE | ASSET_MODULE_TYPE_SOURCE | WEBASSEMBLY_MODULE_TYPE_ASYNC | WEBASSEMBLY_MODULE_TYPE_SYNC | CSS_MODULE_TYPE | CSS_MODULE_TYPE_GLOBAL | CSS_MODULE_TYPE_MODULE | CSS_MODULE_TYPE_AUTO;
type NormalModuleTypes = KnownNormalModuleTypes | string;
type JavascriptParser = import("./javascript/JavascriptParser");
type JavascriptParserOptions = import("../declarations/WebpackOptions").JavascriptParserOptions;
type JavascriptGenerator = import("./javascript/JavascriptGenerator");
type EmptyGeneratorOptions = import("../declarations/WebpackOptions").EmptyGeneratorOptions;
type JsonParser = import("./json/JsonParser");
type JsonParserOptions = import("../declarations/WebpackOptions").JsonParserOptions;
type JsonGenerator = import("./json/JsonGenerator");
type JsonGeneratorOptions = import("../declarations/WebpackOptions").JsonGeneratorOptions;
type AssetParser = import("./asset/AssetParser");
type AssetSourceParser = import("./asset/AssetSourceParser");
type AssetBytesParser = import("./asset/AssetBytesParser");
type AssetParserOptions = import("../declarations/WebpackOptions").AssetParserOptions;
type EmptyParserOptions = import("../declarations/WebpackOptions").EmptyParserOptions;
type AssetGenerator = import("./asset/AssetGenerator");
type AssetGeneratorOptions = import("../declarations/WebpackOptions").AssetGeneratorOptions;
type AssetInlineGeneratorOptions = import("../declarations/WebpackOptions").AssetInlineGeneratorOptions;
type AssetResourceGeneratorOptions = import("../declarations/WebpackOptions").AssetResourceGeneratorOptions;
type AssetSourceGenerator = import("./asset/AssetSourceGenerator");
type AssetBytesGenerator = import("./asset/AssetBytesGenerator");
type AsyncWebAssemblyParser = import("./wasm-async/AsyncWebAssemblyParser");
type WebAssemblyParser = import("./wasm-sync/WebAssemblyParser");
type CssParser = import("./css/CssParser");
type CssParserOptions = import("../declarations/WebpackOptions").CssParserOptions;
type CssModuleParserOptions = import("../declarations/WebpackOptions").CssModuleParserOptions;
type CssGenerator = import("./css/CssGenerator");
type CssGeneratorOptions = import("../declarations/WebpackOptions").CssGeneratorOptions;
type CssModuleGeneratorOptions = import("../declarations/WebpackOptions").CssModuleGeneratorOptions;
type ParsersAndGeneratorsByTypes = [[JAVASCRIPT_MODULE_TYPE_AUTO, JavascriptParser, JavascriptParserOptions, JavascriptGenerator, EmptyGeneratorOptions], [JAVASCRIPT_MODULE_TYPE_DYNAMIC, JavascriptParser, JavascriptParserOptions, JavascriptGenerator, EmptyGeneratorOptions], [JAVASCRIPT_MODULE_TYPE_ESM, JavascriptParser, JavascriptParserOptions, JavascriptGenerator, EmptyGeneratorOptions], [JSON_MODULE_TYPE, JsonParser, JsonParserOptions, JsonGenerator, JsonGeneratorOptions], [ASSET_MODULE_TYPE, AssetParser, AssetParserOptions, AssetGenerator, AssetGeneratorOptions], [ASSET_MODULE_TYPE_INLINE, AssetParser, EmptyParserOptions, AssetGenerator, AssetGeneratorOptions], [ASSET_MODULE_TYPE_RESOURCE, AssetParser, EmptyParserOptions, AssetGenerator, AssetGeneratorOptions], [ASSET_MODULE_TYPE_SOURCE, AssetSourceParser, EmptyParserOptions, AssetSourceGenerator, EmptyGeneratorOptions], [ASSET_MODULE_TYPE_BYTES, AssetBytesParser, EmptyParserOptions, AssetBytesGenerator, EmptyGeneratorOptions], [WEBASSEMBLY_MODULE_TYPE_ASYNC, AsyncWebAssemblyParser, EmptyParserOptions, Generator, EmptyParserOptions], [WEBASSEMBLY_MODULE_TYPE_SYNC, WebAssemblyParser, EmptyParserOptions, Generator, EmptyParserOptions], [CSS_MODULE_TYPE, CssParser, CssParserOptions, CssGenerator, CssGeneratorOptions], [CSS_MODULE_TYPE_AUTO, CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions], [CSS_MODULE_TYPE_MODULE, CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions], [CSS_MODULE_TYPE_GLOBAL, CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions], [string, Parser, ParserOptions, Generator, GeneratorOptions]];
type ExtractTupleElements<T extends unknown[], I extends number[]> = { [K in keyof I]: K extends keyof I ? I[K] extends keyof T ? T[I[K]] : never : never; };
type RecordFactoryFromTuple<T extends unknown[], A extends number[], R = void> = T extends [infer Head extends [string, ...unknown[]], ...infer Tail extends [string, ...unknown[]][]] ? Record<Head[0], SyncBailHook<ExtractTupleElements<Head, A>, R extends number ? Head[R] : R>> & RecordFactoryFromTuple<Tail, A, R> : unknown;
