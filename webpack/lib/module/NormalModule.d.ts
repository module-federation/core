export = NormalModule;
declare class NormalModule extends Module {
    /**
     * @param {Compilation} compilation the compilation
     * @returns {NormalModuleCompilationHooks} the attached hooks
     */
    static getCompilationHooks(compilation: Compilation): NormalModuleCompilationHooks;
    /**
     * @param {ObjectDeserializerContext} context context
     * @returns {NormalModule} module
     */
    static deserialize(context: ObjectDeserializerContext): NormalModule;
    /**
     * @param {NormalModuleCreateData} options options object
     */
    constructor({ layer, type, request, userRequest, rawRequest, loaders, resource, resourceResolveData, context, matchResource, parser, parserOptions, generator, generatorOptions, resolveOptions, extractSourceMap }: NormalModuleCreateData);
    /** @type {NormalModuleCreateData['request']} */
    request: NormalModuleCreateData["request"];
    /** @type {NormalModuleCreateData['userRequest']} */
    userRequest: NormalModuleCreateData["userRequest"];
    /** @type {NormalModuleCreateData['rawRequest']} */
    rawRequest: NormalModuleCreateData["rawRequest"];
    /** @type {boolean} */
    binary: boolean;
    /** @type {NormalModuleCreateData['parser'] | undefined} */
    parser: NormalModuleCreateData["parser"] | undefined;
    /** @type {NormalModuleCreateData['parserOptions']} */
    parserOptions: NormalModuleCreateData["parserOptions"];
    /** @type {NormalModuleCreateData['generator'] | undefined} */
    generator: NormalModuleCreateData["generator"] | undefined;
    /** @type {NormalModuleCreateData['generatorOptions']} */
    generatorOptions: NormalModuleCreateData["generatorOptions"];
    /** @type {NormalModuleCreateData['resource']} */
    resource: NormalModuleCreateData["resource"];
    /** @type {NormalModuleCreateData['resourceResolveData']} */
    resourceResolveData: NormalModuleCreateData["resourceResolveData"];
    /** @type {NormalModuleCreateData['matchResource']} */
    matchResource: NormalModuleCreateData["matchResource"];
    /** @type {NormalModuleCreateData['loaders']} */
    loaders: NormalModuleCreateData["loaders"];
    /** @type {NormalModuleCreateData['extractSourceMap']} */
    extractSourceMap: NormalModuleCreateData["extractSourceMap"];
    /** @type {boolean} */
    hot: boolean;
    /** @type {Error | null} */
    error: Error | null;
    /**
     * @private
     * @type {Source | null}
     */
    private _source;
    /**
     * @private
     * @type {PreparsedAst | null}
     */
    private _ast;
    /**
     * @private
     * @type {Map<undefined | SourceType, number> | undefined}
     */
    private _sourceSizes;
    /**
     * @private
     * @type {undefined | SourceTypes}
     */
    private _sourceTypes;
    /**
     * @private
     * @type {BuildMeta}
     */
    private _lastSuccessfulBuildMeta;
    /**
     * @private
     * @type {boolean}
     */
    private _forceBuild;
    /**
     * @type {boolean}
     */
    _isEvaluatingSideEffects: boolean;
    /**
     * @type {WeakSet<ModuleGraph> | undefined}
     */
    _addedSideEffectsBailout: WeakSet<ModuleGraph> | undefined;
    /**
     * Memoizes the result of `getSideEffectsConnectionState`. The
     * graph slot keys the cached value to the `ModuleGraph` it was
     * computed against so stale values never leak across compilations
     * — a walk that targets a different graph just overwrites both
     * slots. Populated only for context-independent results (cycle-free
     * or SCC-root modules; see `walkSideEffects`).
     * @type {ModuleGraph | undefined}
     */
    _sideEffectsStateGraph: ModuleGraph | undefined;
    /** @type {ConnectionState | undefined} */
    _sideEffectsStateValue: ModuleGraphConnection.ConnectionState | undefined;
    /**
     * @returns {string | null} return the resource path
     */
    getResource(): string | null;
    /**
     * restore unsafe cache data
     * @param {UnsafeCacheData} unsafeCacheData data from getUnsafeCacheData
     * @param {NormalModuleFactory} normalModuleFactory the normal module factory handling the unsafe caching
     */
    restoreFromUnsafeCache(unsafeCacheData: Compilation.UnsafeCacheData, normalModuleFactory: NormalModuleFactory): void;
    /**
     * @param {string} context the compilation context
     * @param {string} name the asset name
     * @param {string | Buffer} content the content
     * @param {(string | RawSourceMap)=} sourceMap an optional source map
     * @param {AssociatedObjectForCache=} associatedObjectForCache object for caching
     * @returns {Source} the created source
     */
    createSourceForAsset(context: string, name: string, content: string | Buffer, sourceMap?: (string | RawSourceMap) | undefined, associatedObjectForCache?: AssociatedObjectForCache | undefined): Source;
    /**
     * @private
     * @template T
     * @param {ResolverWithOptions} resolver a resolver
     * @param {WebpackOptions} options webpack options
     * @param {Compilation} compilation the compilation
     * @param {InputFileSystem} fs file system from reading
     * @param {NormalModuleCompilationHooks} hooks the hooks
     * @returns {LoaderContext<T>} loader context
     */
    private _createLoaderContext;
    /**
     * @param {AnyLoaderContext} loaderContext loader context
     * @param {number} index index
     * @returns {LoaderItem | null} loader
     */
    getCurrentLoader(loaderContext: AnyLoaderContext, index?: number): LoaderItem | null;
    /**
     * @param {string} context the compilation context
     * @param {string | Buffer} content the content
     * @param {(string | RawSourceMap | null)=} sourceMap an optional source map
     * @param {AssociatedObjectForCache=} associatedObjectForCache object for caching
     * @returns {Source} the created source
     */
    createSource(context: string, content: string | Buffer, sourceMap?: (string | RawSourceMap | null) | undefined, associatedObjectForCache?: AssociatedObjectForCache | undefined): Source;
    /**
     * @param {WebpackOptions} options webpack options
     * @param {Compilation} compilation the compilation
     * @param {ResolverWithOptions} resolver the resolver
     * @param {InputFileSystem} fs the file system
     * @param {NormalModuleCompilationHooks} hooks the hooks
     * @param {BuildCallback} callback callback function
     * @returns {void}
     */
    _doBuild(options: WebpackOptions, compilation: Compilation, resolver: ResolverWithOptions, fs: InputFileSystem, hooks: NormalModuleCompilationHooks, callback: Module.BuildCallback): void;
    /**
     * Marks the module as failed, so what it generates says so. A tap or a
     * loader may fail with anything, and what reads the failure expects an error.
     * @param {EXPECTED_ANY} error what the module failed with
     * @returns {void}
     */
    markModuleAsErrored(error: EXPECTED_ANY): void;
    /**
     * An absolute path string is a prefix of `content`; a relative one is a glob
     * matched against the resource path, without loaders and query.
     * @param {string | RegExp | NoParseFn} rule rule
     * @param {string} content content
     * @returns {boolean} result
     */
    applyNoParseRule(rule: string | RegExp | NoParseFn, content: string): boolean;
    /**
     * @param {undefined | NoParse} noParseRule no parse rule
     * @param {string} request request
     * @returns {boolean} check if module should not be parsed, returns "true" if the module should !not! be parsed, returns "false" if the module !must! be parsed
     */
    shouldPreventParsing(noParseRule: undefined | NoParse, request: string): boolean;
    /**
     * @param {Compilation} compilation compilation
     * @private
     */
    private _initBuildHash;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context: Dependency.UpdateHashContext): void;
}
declare namespace NormalModule {
    export { KINDS, ESMStarExportsList, FakeHook, ParserOptions, GeneratorOptions, ResolveCallback, Schema, GetOptionsMethod, DualModeResolve, LoaderContextUtils, NormalModuleLoaderContext, LoaderContext, NoParseFn, LoaderItem, Result, AnyLoaderContext, DeprecatedReadResourceForScheme, NormalModuleCompilationHooks, NormalModuleCreateData, ReadResource, KnownNormalModuleBuildInfo, NormalModuleBuildInfo };
}
import Module = require("./Module");
import type ModuleGraph from "../graph/ModuleGraph";
import ModuleGraphConnection = require("../graph/ModuleGraphConnection");
import type Compilation from "../Compilation";
import type NormalModuleFactory from "./NormalModuleFactory";
import type { RawSourceMap } from "webpack-sources";
import type { AssociatedObjectForCache } from "../util/identifier";
import type { Source } from "webpack-sources";
import type { WebpackOptionsNormalizedWithDefaults as WebpackOptions } from "../config/defaults";
import type { ResolverWithOptions } from "../resolve/ResolverFactory";
import type { InputFileSystem } from "../fs/fs";
import type { NoParse } from "../../declarations/WebpackOptions";
import type Hash from "../util/Hash";
import Dependency = require("../graph/Dependency");
import type { ObjectDeserializerContext } from "../serialization/ObjectMiddleware";
declare var KINDS: Set<keyof Module.ModuleKinds>;
type ESMStarExportsList = InstanceType<typeof import("../dependencies/esm/ESMExportImportedSpecifierDependency").ESMStarExportsList>;
type FakeHook<T> = import("../util/deprecation").FakeHook<T>;
type ParserOptions = {
    [k: string]: EXPECTED_ANY;
};
type GeneratorOptions = {
    [k: string]: EXPECTED_ANY;
};
type ResolveCallback = Parameters<Resolver["resolve"]>[4];
type Schema = Parameters<typeof import("schema-utils").validate>[0];
/**
 * `getOptions` validates against a schema when given one, and TypeScript reads
 * an intersection of call signatures as an overload set
 */
type GetOptionsMethod<OptionsType> = {
    (): OptionsType;
} & {
    (schema: Schema): OptionsType;
};
type DualModeResolve = ((context: string, request: string, callback: ResolveCallback) => void) & ((context: string, request: string) => Promise<string>);
type LoaderContextUtils = {
    /**
     * returns a new request string using absolute paths when possible
     */
    absolutify: (context: string, request: string) => string;
    /**
     * returns a new request string avoiding absolute paths when possible
     */
    contextify: (context: string, request: string) => string;
    /**
     * creates a hash with the compilation's function
     */
    createHash: (algorithm?: string | typeof Hash) => Hash;
};
/**
 * These properties are added by the NormalModule
 */
type NormalModuleLoaderContext<OptionsType> = {
    version: number;
    /**
     * Extracts and parses the options of the current loader.
     * Parses string options as JSON or a query string.
     */
    getOptions: GetOptionsMethod<OptionsType>;
    /**
     * Emits a warning for this module.
     * The warning will be displayed to the user during compilation.
     */
    emitWarning: (warning: Error | string) => void;
    /**
     * Emits an error for this module.
     * The error will be displayed to the user and typically causes the compilation to fail.
     */
    emitError: (error: Error | string) => void;
    /**
     * Gets a logger instance scoped to this loader and module.
     * Useful for emitting debug or compilation information in a structured way.
     */
    getLogger: (name?: string) => Logger;
    /**
     * Resolves a module request (e.g., a relative path or module name) to an absolute file path.
     * It uses Webpack's internal resolver, taking into account configured aliases and extensions.
     */
    resolve: (context: string, request: string, callback: ResolveCallback) => void;
    /**
     * Creates a resolve function with specific options.
     * The returned function can be used as a Promise-based resolver or a callback-based resolver.
     */
    getResolve: (options?: ResolveOptionsWithDependencyType) => DualModeResolve;
    /**
     * Emits a new file (asset) to the compilation output directory.
     * This allows loaders to generate additional files alongside the main module output.
     */
    emitFile: (name: string, content: string | Buffer, sourceMap?: string, assetInfo?: Compilation.AssetInfo) => void;
    addBuildDependency: (dep: string) => void;
    utils: LoaderContextUtils;
    rootContext: string;
    fs: InputFileSystem;
    sourceMap?: boolean | undefined;
    mode: "development" | "production" | "none";
    webpack?: boolean | undefined;
    hashFunction: HashFunction;
    hashDigest: HashDigest;
    hashDigestLength: HashDigestLength;
    hashSalt?: HashSalt | undefined;
    _module?: NormalModule | undefined;
    _compilation?: Compilation | undefined;
    _compiler?: Compiler | undefined;
};
type LoaderContext<T, DataType = LoaderData> = NormalModuleLoaderContext<T> & import("../loaders/LoaderRunner").LoaderRunnerLoaderContext<T, DataType> & import("../loaders/LoaderPlugin").LoaderPluginLoaderContext & import("../hmr/HotModuleReplacementPlugin").HotModuleReplacementPluginLoaderContext;
type NoParseFn = (content: string) => boolean;
type LoaderItem = {
    loader: string;
    options: string | null | undefined | Record<string, EXPECTED_ANY>;
    ident?: (string | null) | undefined;
    type?: (string | null) | undefined;
};
type Result = [string | Buffer, string | RawSourceMap | undefined, Parser.PreparsedAst | undefined];
type AnyLoaderContext = LoaderContext<EXPECTED_ANY>;
type DeprecatedReadResourceForScheme = HookMap<FakeHook<AsyncSeriesBailHook<[string, NormalModule], string | Buffer | null>>>;
type NormalModuleCompilationHooks = ReturnType<typeof createCompilationHooks>;
type NormalModuleCreateData<T extends NormalModuleFactory.NormalModuleTypes | "" = string> = {
    /**
     * an optional layer in which the module is
     */
    layer?: string | undefined;
    /**
     * module type. When deserializing, this is set to an empty string "".
     */
    type: T;
    /**
     * request string
     */
    request: string;
    /**
     * request intended by user (without loaders from config)
     */
    userRequest: string;
    /**
     * request without resolving
     */
    rawRequest: string;
    /**
     * list of loaders
     */
    loaders: LoaderItem[];
    /**
     * path + query of the real resource
     */
    resource: string;
    /**
     * resource resolve data
     */
    resourceResolveData?: (NormalModuleFactory.ResourceSchemeData & Partial<ResolveRequest>) | undefined;
    /**
     * context directory for resolving
     */
    context: string;
    /**
     * path + query of the matched resource (virtual)
     */
    matchResource?: string | undefined;
    /**
     * the parser used
     */
    parser: NormalModuleFactory.ParserByType[T];
    /**
     * the options of the parser used
     */
    parserOptions?: NormalModuleFactory.ParserOptionsByType[T] | undefined;
    /**
     * the generator used
     */
    generator: NormalModuleFactory.GeneratorByType[T];
    /**
     * the options of the generator used
     */
    generatorOptions?: NormalModuleFactory.GeneratorOptionsByType[T] | undefined;
    /**
     * options used for resolving requests from this module
     */
    resolveOptions?: ResolveOptions | undefined;
    /**
     * enable/disable extracting source map
     */
    extractSourceMap: boolean;
};
type ReadResource = (resourcePath: string, getLoaderContext: (resourcePath: string) => AnyLoaderContext) => Promise<string | Buffer<ArrayBufferLike>>;
/**
 * Defines the build info properties of normal modules (filesystem-backed, loader-processed).
 */
type KnownNormalModuleBuildInfo = {
    parsed?: boolean | undefined;
    hash?: string | undefined;
    fileDependencies?: Compilation.FileSystemDependencies | undefined;
    contextDependencies?: Compilation.FileSystemDependencies | undefined;
    missingDependencies?: Compilation.FileSystemDependencies | undefined;
    buildDependencies?: Compilation.FileSystemDependencies | undefined;
    valueDependencies?: Module.ValueCacheVersions | undefined;
    snapshot?: (InstanceType<{
        new (): {
            _flags: number;
            _cachedFileIterable: Iterable<string> | undefined;
            _cachedContextIterable: Iterable<string> | undefined;
            _cachedMissingIterable: Iterable<string> | undefined;
            startTime: number | undefined;
            fileTimestamps: import("../fs/FileSystemInfo").FileTimestamps | undefined;
            fileHashes: import("../fs/FileSystemInfo").FileHashes | undefined;
            fileTshs: import("../fs/FileSystemInfo").FileTshs | undefined;
            contextTimestamps: import("../fs/FileSystemInfo").ContextTimestamps | undefined;
            contextHashes: import("../fs/FileSystemInfo").ContextHashes | undefined;
            contextTshs: import("../fs/FileSystemInfo").ContextTshs | undefined;
            missingExistence: import("../fs/FileSystemInfo").MissingExistence | undefined;
            managedItemInfo: import("../fs/FileSystemInfo").ManagedItemInfo | undefined;
            managedFiles: import("../fs/FileSystemInfo").ManagedFiles | undefined;
            managedContexts: import("../fs/FileSystemInfo").ManagedContexts | undefined;
            managedMissing: import("../fs/FileSystemInfo").ManagedMissing | undefined;
            children: import("../fs/FileSystemInfo").Children | undefined;
            hasStartTime(): boolean;
            setStartTime(value: number): void;
            setMergedStartTime(value: number | undefined, snapshot: /*elided*/ any): void;
            hasFileTimestamps(): boolean;
            setFileTimestamps(value: FileTimestamps): void;
            hasFileHashes(): boolean;
            setFileHashes(value: FileHashes): void;
            hasFileTshs(): boolean;
            setFileTshs(value: FileTshs): void;
            hasContextTimestamps(): boolean;
            setContextTimestamps(value: ContextTimestamps): void;
            hasContextHashes(): boolean;
            setContextHashes(value: ContextHashes): void;
            hasContextTshs(): boolean;
            setContextTshs(value: ContextTshs): void;
            hasMissingExistence(): boolean;
            setMissingExistence(value: MissingExistence): void;
            hasManagedItemInfo(): boolean;
            setManagedItemInfo(value: ManagedItemInfo): void;
            hasManagedFiles(): boolean;
            setManagedFiles(value: ManagedFiles): void;
            hasManagedContexts(): boolean;
            setManagedContexts(value: ManagedContexts): void;
            hasManagedMissing(): boolean;
            setManagedMissing(value: ManagedMissing): void;
            hasChildren(): boolean;
            setChildren(value: Children): void;
            addChild(child: /*elided*/ any): void;
            serialize({ write }: ObjectSerializerContext): void;
            deserialize({ read }: ObjectDeserializerContext): void;
            _createIterable<T extends {
                keys(): IterableIterator<string>;
            } | undefined>(getMaps: import("../fs/FileSystemInfo").GetMapsFunction<T>): {
                snapshot: /*elided*/ any;
                getMaps: import("../fs/FileSystemInfo").GetMapsFunction<T>;
                [Symbol.iterator](): {
                    next: () => IteratorResult<string>;
                };
            };
            getFileIterable(): Iterable<string>;
            getContextIterable(): Iterable<string>;
            getMissingIterable(): Iterable<string>;
        };
    }> | null) | undefined;
    /**
     * using in HttpUriPlugin
     */
    resourceIntegrity?: string | undefined;
};
type NormalModuleBuildInfo = Module.BuildInfo & KnownNormalModuleBuildInfo;
import type { Resolver } from "enhanced-resolve";
import type { Logger } from "../logging/Logger";
import type { ResolveOptionsWithDependencyType } from "../resolve/ResolverFactory";
import type { HashFunction } from "../../declarations/WebpackOptions";
import type { HashDigest } from "../../declarations/WebpackOptions";
import type { HashDigestLength } from "../../declarations/WebpackOptions";
import type { HashSalt } from "../../declarations/WebpackOptions";
import type Compiler from "../Compiler";
import type { LoaderData } from "../loaders/LoaderRunner";
import type Parser from "./Parser";
import { HookMap } from "tapable";
import { AsyncSeriesBailHook } from "tapable";
/** @typedef {[string | Buffer, string | RawSourceMap | undefined, PreparsedAst | undefined]}  Result */
/** @typedef {LoaderContext<EXPECTED_ANY>} AnyLoaderContext */
/**
 * @deprecated Use the `readResource` hook instead.
 * @typedef {HookMap<FakeHook<AsyncSeriesBailHook<[string, NormalModule], string | Buffer | null>>>} DeprecatedReadResourceForScheme
 */
declare function createCompilationHooks(): {
    /**
     * @deprecated Use the `readResource` hook instead.
     * @type {DeprecatedReadResourceForScheme}
     */
    readResourceForScheme: DeprecatedReadResourceForScheme;
    /**
     * @since 5.58.0
     */
    readResource: HookMap<AsyncSeriesBailHook<[AnyLoaderContext], string | Buffer<ArrayBufferLike>, import("tapable").UnsetAdditionalOptions>>;
    /** @type {SyncHook<[AnyLoaderContext, NormalModule]>} */
    loader: SyncHook<[AnyLoaderContext, NormalModule]>;
    /** @type {SyncHook<[LoaderItem[], NormalModule, AnyLoaderContext]>} */
    beforeLoaders: SyncHook<[LoaderItem[], NormalModule, AnyLoaderContext]>;
    /**
     * Async since 5.112.0, so a tap can resolve values a module needs
     * before it is parsed. `tap` keeps working.
     * @type {AsyncSeriesHook<[NormalModule]>}
     * @since 5.59.0
     */
    beforeParse: AsyncSeriesHook<[NormalModule]>;
    /**
     * @type {SyncHook<[NormalModule]>}
     * @since 5.59.0
     */
    beforeSnapshot: SyncHook<[NormalModule]>;
    /**
     * Async since 5.111.0, so a tap can await work of its own — minifying an
     * asset, say, which before only a loader could do. `tap` keeps working.
     * @type {AsyncSeriesWaterfallHook<[Result, NormalModule]>}
     * @since 5.99.0
     */
    processResult: AsyncSeriesWaterfallHook<[Result, NormalModule]>;
    /**
     * @type {AsyncSeriesBailHook<[NormalModule, NeedBuildContext], boolean>}
     * @since 5.49.0
     */
    needBuild: AsyncSeriesBailHook<[NormalModule, Module.NeedBuildContext], boolean>;
};
import type { ResolveRequest } from "enhanced-resolve";
import type { ResolveOptions } from "../../declarations/WebpackOptions";
import type { ObjectSerializerContext } from "../serialization/ObjectMiddleware";
import { SyncHook } from "tapable";
import { AsyncSeriesHook } from "tapable";
import { AsyncSeriesWaterfallHook } from "tapable";
