export = NormalModuleFactory;
/** @import JavascriptGenerator from "../javascript/JavascriptGenerator" */
/** @import JsonParser from "../json/JsonParser" */
/** @import JsonGenerator from "../json/JsonGenerator" */
/** @import AssetParser from "../asset/AssetParser" */
/** @import AssetSourceParser from "../asset/AssetSourceParser" */
/** @import AssetBytesParser from "../asset/AssetBytesParser" */
/** @import AssetGenerator from "../asset/AssetGenerator" */
/** @import AssetSourceGenerator from "../asset/AssetSourceGenerator" */
/** @import AssetBytesGenerator from "../asset/AssetBytesGenerator" */
/** @import AsyncWebAssemblyParser from "../wasm/AsyncWebAssemblyParser" */
/** @import WebAssemblyParser from "../wasm-sync/WebAssemblyParser" */
/** @import CssParser from "../css/CssParser" */
/** @import CssGenerator from "../css/CssGenerator" */
/** @import HtmlParser from "../html/HtmlParser" */
/** @import HtmlGenerator from "../html/HtmlGenerator" */
/**
 * Defines the shared type used by this module.
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
 * [WEBASSEMBLY_MODULE_TYPE_ASYNC, AsyncWebAssemblyParser, EmptyParserOptions, Generator, EmptyGeneratorOptions],
 * [WEBASSEMBLY_MODULE_TYPE_SYNC, WebAssemblyParser, EmptyParserOptions, Generator, EmptyGeneratorOptions],
 * [CSS_MODULE_TYPE, CssParser, CssParserOptions, CssGenerator, CssGeneratorOptions],
 * [CSS_MODULE_TYPE_AUTO, CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions],
 * [CSS_MODULE_TYPE_MODULE, CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions],
 * [CSS_MODULE_TYPE_GLOBAL, CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions],
 * [HTML_MODULE_TYPE, HtmlParser, HtmlParserOptions, HtmlGenerator, HtmlGeneratorOptions],
 * [string, Parser, ParserOptions, Generator, GeneratorOptions],
 * ]} ParsersAndGeneratorsByTypes
 */
/** @typedef {[string, Parser<never>, ParserOptions, Generator<never>, GeneratorOptions]} ParserAndGeneratorTuple */
/**
 * Defines the extract tuple elements type used by this module.
 * @template {ParserAndGeneratorTuple} T
 * @template {number[]} I
 * @typedef {{ [K in keyof I]: K extends keyof I ? I[K] extends keyof T ? T[I[K]] : never : never }} ExtractTupleElements
 */
/**
 * Represents the normal module factory runtime component.
 * @template {ParserAndGeneratorTuple[]} T
 * @template {number[]} A
 * @template [R=void]
 * @typedef {T extends [infer Head extends ParserAndGeneratorTuple] ? Record<Head[0], SyncBailHook<ExtractTupleElements<Head, A>, R extends number ? Head[R] : R>> : T extends [infer Head extends ParserAndGeneratorTuple, ...infer Tail extends ParserAndGeneratorTuple[]] ? Record<Head[0], SyncBailHook<ExtractTupleElements<Head, A>, R extends number ? Head[R] : R>> & RecordFactoryFromTuple<Tail, A, R> : never } RecordFactoryFromTuple
 */
/**
 * Maps each tuple in `T` to a record from its `[0]` key to its `[I]` value.
 * @template {ParserAndGeneratorTuple[]} T
 * @template {number} I
 * @typedef {T extends [infer Head extends ParserAndGeneratorTuple] ? Record<Head[0], I extends keyof Head ? Head[I] : never> : T extends [infer Head extends ParserAndGeneratorTuple, ...infer Tail extends ParserAndGeneratorTuple[]] ? Record<Head[0], I extends keyof Head ? Head[I] : never> & TupleToTypeMap<Tail, I> : never } TupleToTypeMap
 */
/** @typedef {TupleToTypeMap<ParsersAndGeneratorsByTypes, 1>} ParserByType */
/** @typedef {TupleToTypeMap<ParsersAndGeneratorsByTypes, 2>} ParserOptionsByType */
/** @typedef {TupleToTypeMap<ParsersAndGeneratorsByTypes, 3>} GeneratorByType */
/** @typedef {TupleToTypeMap<ParsersAndGeneratorsByTypes, 4>} GeneratorOptionsByType */
declare class NormalModuleFactory extends ModuleFactory {
    /**
     * Creates an instance of NormalModuleFactory.
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
        /**
         * @type {HookMap<AsyncSeriesBailHook<[ResourceDataWithData, ResolveData], true | void>>}
         * @since 5.49.0
         */
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
        /**
         * @type {HookMap<AsyncSeriesHook<[]>>}
         * @since 5.110.0
         */
        prepareModuleType: HookMap<AsyncSeriesHook<[]>>;
        /** @type {import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [2], 1>>} */
        createParser: import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [2], 1>>;
        /** @type {import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [1, 2]>>} */
        parser: import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [1, 2]>>;
        /** @type {import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [4], 3>>} */
        createGenerator: import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [4], 3>>;
        /** @type {import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [3, 4]>>} */
        generator: import("tapable").TypedHookMap<RecordFactoryFromTuple<ParsersAndGeneratorsByTypes, [3, 4]>>;
        /**
         * @type {HookMap<SyncBailHook<[CreateData, ResolveData], Module | void>>}
         * @since 5.81.0
         */
        createModuleClass: HookMap<SyncBailHook<[CreateData, ResolveData], Module | void>>;
    }>;
    /** @type {ResolverFactory} */
    resolverFactory: ResolverFactory;
    /** @type {RuleSet} */
    ruleSet: RuleSetCompiler.RuleSet;
    /** @type {string} */
    context: string;
    /** @type {InputFileSystem} */
    fs: InputFileSystem;
    _globalParserOptions: import("../../declarations/WebpackOptions").ParserOptionsByModuleType;
    _globalGeneratorOptions: import("../../declarations/WebpackOptions").GeneratorOptionsByModuleType;
    /** @type {Map<string, WeakMap<ParserOptions, Parser>>} */
    parserCache: Map<string, WeakMap<NormalModule.ParserOptions, Parser>>;
    /** @type {Map<string, WeakMap<GeneratorOptions, Generator>>} */
    generatorCache: Map<string, WeakMap<NormalModule.GeneratorOptions, Generator>>;
    /** @type {Map<string, true | Callback<void>[]>} */
    _moduleTypePreparation: Map<string, true | Callback<void>[]>;
    /** @type {Set<Module>} */
    _restoredUnsafeCacheEntries: Set<Module>;
    /** @type {Map<string, LoaderResolveCacheEntry>} */
    _loaderResolveCache: Map<string, LoaderResolveCacheEntry>;
    _parseResourceWithoutFragment: import("../util/identifier").BindCacheResultFn<import("../util/identifier").ParsedResourceWithoutFragment>;
    cleanupForCache(): void;
    /**
     * Processes the provided context info.
     * @param {ModuleFactoryCreateDataContextInfo} contextInfo context info
     * @param {string} context context
     * @param {string} unresolvedResource unresolved resource
     * @param {ResolverWithOptions} resolver resolver
     * @param {ResolveContext} resolveContext resolver context
     * @param {(err: null | Error, res?: string | false, req?: ResolveRequest) => void} callback callback
     */
    resolveResource(contextInfo: ModuleFactory.ModuleFactoryCreateDataContextInfo, context: string, unresolvedResource: string, resolver: ResolverFactory.ResolverWithOptions, resolveContext: ResolveContext, callback: (err: null | Error, res?: string | false, req?: ResolveRequest) => void): void;
    /**
     * Resolve resource error hints.
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
     * Resolves request array.
     * @param {ModuleFactoryCreateDataContextInfo} contextInfo context info
     * @param {string} context context
     * @param {LoaderItem[]} array array
     * @param {ResolverWithOptions} resolver resolver
     * @param {ResolveContext} resolveContext resolve context
     * @param {Callback<LoaderItem[]>} callback callback
     * @returns {void} result
     */
    resolveRequestArray(contextInfo: ModuleFactory.ModuleFactoryCreateDataContextInfo, context: string, array: NormalModule.LoaderItem[], resolver: ResolverFactory.ResolverWithOptions, resolveContext: ResolveContext, callback: Callback<NormalModule.LoaderItem[]>): void;
    /**
     * Runs `prepareModuleType` for a type once, so a plugin can load what its
     * synchronous `createParser`/`createGenerator` tap needs. Calls back
     * synchronously for a type nothing taps or that is already prepared.
     * @param {string} type module type
     * @param {Callback<void>} callback signals the type is ready
     * @returns {void}
     */
    _prepareModuleType(type: string, callback: Callback<void>): void;
    /**
     * Returns parser.
     * @template {string} T
     * @param {T} type type
     * @param {ParserOptions} parserOptions parser options
     * @returns {ParserByType[T]} parser
     */
    getParser<T extends string>(type: T, parserOptions?: NormalModule.ParserOptions): ParserByType[T];
    /**
     * Creates a parser from the provided type.
     * @template {string} T
     * @param {T} type type
     * @param {ParserOptions} parserOptions parser options
     * @returns {ParserByType[T]} parser
     */
    createParser<T extends string>(type: T, parserOptions?: NormalModule.ParserOptions): ParserByType[T];
    /**
     * Returns generator.
     * @template {string} T
     * @param {T} type type of generator
     * @param {GeneratorOptions} generatorOptions generator options
     * @returns {GeneratorByType[T]} generator
     */
    getGenerator<T extends string>(type: T, generatorOptions?: NormalModule.GeneratorOptions): GeneratorByType[T];
    /**
     * Creates a generator.
     * @template {string} T
     * @param {T} type type of generator
     * @param {GeneratorOptions} generatorOptions generator options
     * @returns {GeneratorByType[T]} generator
     */
    createGenerator<T extends string>(type: T, generatorOptions?: NormalModule.GeneratorOptions): GeneratorByType[T];
    /**
     * Returns the resolver.
     * @param {Parameters<ResolverFactory["get"]>[0]} type type of resolver
     * @param {Parameters<ResolverFactory["get"]>[1]=} resolveOptions options
     * @returns {ReturnType<ResolverFactory["get"]>} the resolver
     */
    getResolver(type: Parameters<ResolverFactory["get"]>[0], resolveOptions?: Parameters<ResolverFactory["get"]>[1] | undefined): ReturnType<ResolverFactory["get"]>;
}
declare namespace NormalModuleFactory {
    export { AliasOptions, Callback, ModuleSettings, CreateData, ResolveData, ResourceData, ResourceSchemeData, ResourceDataWithData, ParsedLoaderRequest, ResolveDependencies, LoaderResolveCacheEntry, KnownNormalModuleTypes, NormalModuleTypes, ParsersAndGeneratorsByTypes, ParserAndGeneratorTuple, ExtractTupleElements, RecordFactoryFromTuple, TupleToTypeMap, ParserByType, ParserOptionsByType, GeneratorByType, GeneratorOptionsByType };
}
import ModuleFactory = require("./ModuleFactory");
import { AsyncSeriesBailHook } from "tapable";
import Module = require("./Module");
import { HookMap } from "tapable";
import { SyncWaterfallHook } from "tapable";
import { AsyncSeriesHook } from "tapable";
import { SyncBailHook } from "tapable";
import type ResolverFactory from "../resolve/ResolverFactory";
import RuleSetCompiler = require("../rules/RuleSetCompiler");
import type { InputFileSystem } from "../fs/fs";
import NormalModule = require("./NormalModule");
import type Parser from "./Parser";
import type Generator from "./Generator";
import type { ResolveContext } from "enhanced-resolve";
import type { ResolveRequest } from "enhanced-resolve";
import type { ModuleOptionsNormalized as ModuleOptions } from "../../declarations/WebpackOptions";
import type { AssociatedObjectForCache } from "../util/identifier";
type AliasOptions = import("enhanced-resolve").Resolver["options"]["alias"];
/**
 * Defines the callback type used by this module.
 */
type Callback<T> = import("../Compiler").Callback<T>;
type ModuleSettings = Pick<RuleSetRule, "type" | "sideEffects" | "parser" | "generator" | "resolve" | "layer" | "extractSourceMap">;
type CreateData = NormalModule.NormalModuleCreateData & {
    settings: ModuleSettings;
};
/**
 * Defines the resolve data type used by this module.
 */
type ResolveData = {
    contextInfo: ModuleFactory.ModuleFactoryCreateData["contextInfo"];
    resolveOptions: ModuleFactory.ModuleFactoryCreateData["resolveOptions"];
    context: string;
    request: string;
    phase?: ImportPhaseName | undefined;
    attributes?: JavascriptParser.ImportAttributes | undefined;
    dependencies: ModuleDependency[];
    dependencyType: string;
    createData: Partial<CreateData>;
    fileDependencies: FileSystemDependencies;
    missingDependencies: FileSystemDependencies;
    contextDependencies: FileSystemDependencies;
    ignoredModule?: Module | undefined;
    /**
     * allow to use the unsafe cache
     */
    cacheable: boolean;
};
/**
 * Defines the resource data type used by this module.
 */
type ResourceData = {
    resource: string;
    path?: string | undefined;
    query?: string | undefined;
    fragment?: string | undefined;
    context?: string | undefined;
};
/**
 * Defines the resource scheme data type used by this module.
 */
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
/**
 * Defines the parsed loader request type used by this module.
 */
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
/**
 * Dependencies captured while resolving a loader.
 */
type ResolveDependencies = {
    /**
     * file dependencies of the resolve
     */
    fileDependencies: LazySet<string>;
    /**
     * context dependencies of the resolve
     */
    contextDependencies: LazySet<string>;
    /**
     * missing dependencies of the resolve
     */
    missingDependencies: LazySet<string>;
};
/**
 * Memoized result of resolving a loader for a given (context, request).
 */
type LoaderResolveCacheEntry = ResolveDependencies & {
    loader: string;
    query: string | undefined;
    type: string | undefined;
};
type KnownNormalModuleTypes = "javascript/auto" | "javascript/dynamic" | "javascript/esm" | "json" | "asset" | "asset/inline" | "asset/resource" | "asset/source" | "webassembly/async" | "webassembly/sync" | "css" | "css/global" | "css/module" | "css/auto" | "html";
type NormalModuleTypes = KnownNormalModuleTypes | string;
/**
 * Defines the shared type used by this module.
 */
type ParsersAndGeneratorsByTypes = [["javascript/auto", JavascriptParser, JavascriptParserOptions, JavascriptGenerator, EmptyGeneratorOptions], ["javascript/dynamic", JavascriptParser, JavascriptParserOptions, JavascriptGenerator, EmptyGeneratorOptions], ["javascript/esm", JavascriptParser, JavascriptParserOptions, JavascriptGenerator, EmptyGeneratorOptions], ["json", JsonParser, JsonParserOptions, JsonGenerator, JsonGeneratorOptions], ["asset", AssetParser, AssetParserOptions, AssetGenerator, AssetGeneratorOptions], ["asset/inline", AssetParser, EmptyParserOptions, AssetGenerator, AssetGeneratorOptions], ["asset/resource", AssetParser, EmptyParserOptions, AssetGenerator, AssetGeneratorOptions], ["asset/source", AssetSourceParser, EmptyParserOptions, AssetSourceGenerator, EmptyGeneratorOptions], ["asset/bytes", AssetBytesParser, EmptyParserOptions, AssetBytesGenerator, EmptyGeneratorOptions], ["webassembly/async", AsyncWebAssemblyParser, EmptyParserOptions, Generator, EmptyGeneratorOptions], ["webassembly/sync", WebAssemblyParser, EmptyParserOptions, Generator, EmptyGeneratorOptions], ["css", CssParser, CssParserOptions, CssGenerator, CssGeneratorOptions], ["css/auto", CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions], ["css/module", CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions], ["css/global", CssParser, CssModuleParserOptions, CssGenerator, CssModuleGeneratorOptions], ["html", HtmlParser, EmptyParserOptions, HtmlGenerator, HtmlGeneratorOptions], [string, Parser, NormalModule.ParserOptions, Generator, NormalModule.GeneratorOptions]];
type ParserAndGeneratorTuple = [string, Parser<never>, NormalModule.ParserOptions, Generator<never>, NormalModule.GeneratorOptions];
/**
 * Defines the extract tuple elements type used by this module.
 */
type ExtractTupleElements<T extends ParserAndGeneratorTuple, I extends number[]> = { [K in keyof I]: K extends keyof I ? I[K] extends keyof T ? T[I[K]] : never : never; };
/**
 * Represents the normal module factory runtime component.
 */
type RecordFactoryFromTuple<T extends ParserAndGeneratorTuple[], A extends number[], R = void> = T extends [infer Head extends ParserAndGeneratorTuple] ? Record<Head[0], SyncBailHook<ExtractTupleElements<Head, A>, R extends number ? Head[R] : R>> : T extends [infer Head extends ParserAndGeneratorTuple, ...infer Tail extends ParserAndGeneratorTuple[]] ? Record<Head[0], SyncBailHook<ExtractTupleElements<Head, A>, R extends number ? Head[R] : R>> & RecordFactoryFromTuple<Tail, A, R> : never;
/**
 * Maps each tuple in `T` to a record from its `[0]` key to its `[I]` value.
 */
type TupleToTypeMap<T extends ParserAndGeneratorTuple[], I extends number> = T extends [infer Head extends ParserAndGeneratorTuple] ? Record<Head[0], I extends keyof Head ? Head[I] : never> : T extends [infer Head extends ParserAndGeneratorTuple, ...infer Tail extends ParserAndGeneratorTuple[]] ? Record<Head[0], I extends keyof Head ? Head[I] : never> & TupleToTypeMap<Tail, I> : never;
type ParserByType = TupleToTypeMap<ParsersAndGeneratorsByTypes, 1>;
type ParserOptionsByType = TupleToTypeMap<ParsersAndGeneratorsByTypes, 2>;
type GeneratorByType = TupleToTypeMap<ParsersAndGeneratorsByTypes, 3>;
type GeneratorOptionsByType = TupleToTypeMap<ParsersAndGeneratorsByTypes, 4>;
import type { RuleSetRule } from "../../declarations/WebpackOptions";
import type { ImportPhaseName } from "../dependencies/core/ImportPhase";
import type JavascriptParser from "../javascript/JavascriptParser";
import type ModuleDependency from "../dependencies/core/ModuleDependency";
import type { FileSystemDependencies } from "../Compilation";
import LazySet = require("../util/LazySet");
import type { JavascriptParserOptions } from "../../declarations/WebpackOptions";
import type JavascriptGenerator from "../javascript/JavascriptGenerator";
import type { EmptyGeneratorOptions } from "../../declarations/WebpackOptions";
import type JsonParser from "../json/JsonParser";
import type { JsonParserOptions } from "../../declarations/WebpackOptions";
import type JsonGenerator from "../json/JsonGenerator";
import type { JsonGeneratorOptions } from "../../declarations/WebpackOptions";
import type AssetParser from "../asset/AssetParser";
import type { AssetParserOptions } from "../../declarations/WebpackOptions";
import type AssetGenerator from "../asset/AssetGenerator";
import type { AssetGeneratorOptions } from "../../declarations/WebpackOptions";
import type { EmptyParserOptions } from "../../declarations/WebpackOptions";
import type AssetSourceParser from "../asset/AssetSourceParser";
import type AssetSourceGenerator from "../asset/AssetSourceGenerator";
import type AssetBytesParser from "../asset/AssetBytesParser";
import type AssetBytesGenerator from "../asset/AssetBytesGenerator";
import type AsyncWebAssemblyParser from "../wasm/AsyncWebAssemblyParser";
import type WebAssemblyParser from "../wasm-sync/WebAssemblyParser";
import type CssParser from "../css/CssParser";
import type { CssParserOptions } from "../../declarations/WebpackOptions";
import type CssGenerator from "../css/CssGenerator";
import type { CssGeneratorOptions } from "../../declarations/WebpackOptions";
import type { CssModuleParserOptions } from "../../declarations/WebpackOptions";
import type { CssModuleGeneratorOptions } from "../../declarations/WebpackOptions";
import type HtmlParser from "../html/HtmlParser";
import type HtmlGenerator from "../html/HtmlGenerator";
import type { HtmlGeneratorOptions } from "../../declarations/WebpackOptions";
