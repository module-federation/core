export = Module;
/** @typedef {string} LibIdent */
/** @typedef {string} NameForCondition */
/** @typedef {(requestShortener: RequestShortener) => string} OptimizationBailoutFunction */
/**
 * The kinds a module can be, each naming the class `is(kind)` narrows to.
 * @typedef {{
 * external: ExternalModule,
 * normal: NormalModule,
 * runtime: RuntimeModule,
 * context: ContextModule,
 * remote: RemoteModule,
 * "consume-shared": ConsumeSharedModule,
 * css: CssModule,
 * html: HtmlModule,
 * concatenated: ConcatenatedModule,
 * }} ModuleKinds
 */
declare class Module extends DependenciesBlock {
    /**
     * Gets source basic types.
     * @deprecated In the next major release, call getSourceBasicTypes() directly on the module instance instead of using this static method.
     * @param {Module} module the module
     * @returns {ReturnType<Module["getSourceBasicTypes"]>} the source types of the module
     */
    static getSourceBasicTypes(module: Module): ReturnType<Module["getSourceBasicTypes"]>;
    /**
     * Creates an instance of Module.
     * @param {ModuleTypes | ""} type the module type, when deserializing the type is not known and is an empty string
     * @param {(string | null)=} context an optional context
     * @param {(string | null)=} layer an optional layer in which the module is
     */
    constructor(type: ModuleTypes | "", context?: (string | null) | undefined, layer?: (string | null) | undefined);
    /** @type {ModuleTypes} */
    type: ModuleTypes;
    /** @type {string | null} */
    context: string | null;
    /** @type {string | null} */
    layer: string | null;
    /** @type {boolean} */
    needId: boolean;
    /** @type {number} */
    debugId: number;
    /** @type {ResolveOptions | undefined} */
    resolveOptions: ResolveOptions | undefined;
    /** @type {FactoryMeta | undefined} */
    factoryMeta: FactoryMeta | undefined;
    /** @type {boolean} */
    useSourceMap: boolean;
    /** @type {boolean} */
    useSimpleSourceMap: boolean;
    /** @type {Error[] | undefined} */
    _warnings: Error[] | undefined;
    /** @type {Error[] | undefined} */
    _errors: Error[] | undefined;
    /** @type {BuildMeta | undefined} */
    buildMeta: BuildMeta | undefined;
    /** @type {BuildInfo | undefined} */
    buildInfo: BuildInfo | undefined;
    /** @type {Dependency[] | undefined} */
    presentationalDependencies: Dependency[] | undefined;
    /** @type {Dependency[] | undefined} */
    codeGenerationDependencies: Dependency[] | undefined;
    /**
     * Updates the module id using the provided value.
     * @deprecated
     * @param {ModuleId} value value
     */
    set id(value: ChunkGraph.ModuleId);
    /**
     * Returns the module id assigned by the chunk graph.
     * @deprecated
     * @returns {ModuleId | null} module id
     */
    get id(): ChunkGraph.ModuleId | null;
    /**
     * Returns the hash of the module.
     * @deprecated
     * @returns {string} the hash of the module
     */
    get hash(): string;
    /**
     * Returns the rendered hash of the module.
     * @deprecated
     * @returns {string} the shortened hash of the module
     */
    get renderedHash(): string;
    /**
     * @deprecated
     * @param {ModuleProfile | undefined} value module profile
     */
    set profile(value: ModuleProfile | undefined);
    /**
     * @deprecated
     * @returns {ModuleProfile | undefined} module profile
     */
    get profile(): ModuleProfile | undefined;
    /**
     * Updates the pre-order index using the provided value.
     * @deprecated
     * @param {number} value the pre order index
     */
    set index(value: number);
    /**
     * Returns the pre-order index.
     * @deprecated
     * @returns {number | null} the pre order index
     */
    get index(): number | null;
    /**
     * Updates the post-order index using the provided value.
     * @deprecated
     * @param {number} value the post order index
     */
    set index2(value: number);
    /**
     * Returns the post-order index.
     * @deprecated
     * @returns {number | null} the post order index
     */
    get index2(): number | null;
    /**
     * Updates the depth using the provided value.
     * @deprecated
     * @param {number} value the depth
     */
    set depth(value: number);
    /**
     * Returns the depth.
     * @deprecated
     * @returns {number | null} the depth
     */
    get depth(): number | null;
    /**
     * Updates the issuer using the provided value.
     * @deprecated
     * @param {Module | null} value issuer
     */
    set issuer(value: Module | null);
    /**
     * Returns the issuer.
     * @deprecated
     * @returns {Module | null | undefined} issuer
     */
    get issuer(): Module | null | undefined;
    /**
     * @deprecated
     * @returns {boolean | SortableSet<string> | null} used exports
     */
    get usedExports(): boolean | SortableSet<string> | null;
    /**
     * Gets optimization bailout.
     * @deprecated
     * @returns {OptimizationBailouts} list
     */
    get optimizationBailout(): ModuleGraph.OptimizationBailouts;
    /**
     * @deprecated
     * @returns {boolean} true when optional, otherwise false
     */
    get optional(): boolean;
    /**
     * Adds the provided chunk to the module.
     * @deprecated
     * @param {Chunk} chunk the chunk
     * @returns {boolean} true, when the module was added
     */
    addChunk(chunk: Chunk): boolean;
    /**
     * Removes the provided chunk from the module.
     * @deprecated
     * @param {Chunk} chunk the chunk
     * @returns {void}
     */
    removeChunk(chunk: Chunk): void;
    /**
     * Checks whether this module is in the provided chunk.
     * @deprecated
     * @param {Chunk} chunk the chunk
     * @returns {boolean} true, when the module is in the chunk
     */
    isInChunk(chunk: Chunk): boolean;
    /**
     * @deprecated
     * @returns {boolean} true when is entry module, otherwise false
     */
    isEntryModule(): boolean;
    /**
     * @deprecated
     * @returns {Chunk[]} chunks
     */
    getChunks(): Chunk[];
    /**
     * @deprecated
     * @returns {number} number of chunks
     */
    getNumberOfChunks(): number;
    /**
     * @deprecated
     * @returns {Iterable<Chunk>} chunks
     */
    get chunksIterable(): Iterable<Chunk>;
    /**
     * Checks whether this module provides the specified export.
     * @deprecated
     * @param {string} exportName a name of an export
     * @returns {boolean | null} true, if the export is provided why the module.
     * null, if it's unknown.
     * false, if it's not provided.
     */
    isProvided(exportName: string): boolean | null;
    /**
     * Gets exports argument.
     * @returns {string} name of the exports argument
     */
    get exportsArgument(): string;
    /**
     * Gets module argument.
     * @returns {string} name of the module argument
     */
    get moduleArgument(): string;
    /**
     * Returns export type.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {boolean | undefined} strict the importing module is strict
     * @returns {ExportsType} export type
     * "namespace": Exports is already a namespace object. namespace = exports.
     * "dynamic": Check at runtime if __esModule is set. When set: namespace = { ...exports, default: exports }. When not set: namespace = { default: exports }.
     * "default-only": Provide a namespace object with only default export. namespace = { default: exports }
     * "default-with-named": Provide a namespace object with named and default export. namespace = { ...exports, default: exports }
     */
    getExportsType(moduleGraph: ModuleGraph, strict: boolean | undefined): ExportsType;
    /**
     * Adds presentational dependency.
     * @param {Dependency} presentationalDependency dependency being tied to module.
     * This is a Dependency without edge in the module graph. It's only for presentation.
     * @returns {void}
     */
    addPresentationalDependency(presentationalDependency: Dependency): void;
    /**
     * Adds code generation dependency.
     * @param {Dependency} codeGenerationDependency dependency being tied to module.
     * This is a Dependency where the code generation result of the referenced module is needed during code generation.
     * The Dependency should also be added to normal dependencies via addDependency.
     * @returns {void}
     */
    addCodeGenerationDependency(codeGenerationDependency: Dependency): void;
    /**
     * Adds the provided warning to the module.
     * @param {Error} warning the warning
     * @returns {void}
     */
    addWarning(warning: Error): void;
    /**
     * Returns list of warnings if any.
     * @returns {Error[] | undefined} list of warnings if any
     */
    getWarnings(): Error[] | undefined;
    /**
     * Gets number of warnings.
     * @returns {number} number of warnings
     */
    getNumberOfWarnings(): number;
    /**
     * Adds the provided error to the module.
     * @param {Error} error the error
     * @returns {void}
     */
    addError(error: Error): void;
    /**
     * Returns list of errors if any.
     * @returns {Error[] | undefined} list of errors if any
     */
    getErrors(): Error[] | undefined;
    /**
     * Gets number of errors.
     * @returns {number} number of errors
     */
    getNumberOfErrors(): number;
    /**
     * removes all warnings and errors
     * @returns {void}
     */
    clearWarningsAndErrors(): void;
    /**
     * Checks whether this module is optional.
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {boolean} true, if the module is optional
     */
    isOptional(moduleGraph: ModuleGraph): boolean;
    /**
     * Checks whether this module is accessible in chunk.
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {Chunk} chunk a chunk
     * @param {Chunk=} ignoreChunk chunk to be ignored
     * @returns {boolean} true, if the module is accessible from "chunk" when ignoring "ignoreChunk"
     */
    isAccessibleInChunk(chunkGraph: ChunkGraph, chunk: Chunk, ignoreChunk?: Chunk | undefined): boolean;
    /**
     * Checks whether this module is accessible in chunk group.
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @param {ChunkGroup} chunkGroup a chunk group
     * @param {Chunk=} ignoreChunk chunk to be ignored
     * @returns {boolean} true, if the module is accessible from "chunkGroup" when ignoring "ignoreChunk"
     */
    isAccessibleInChunkGroup(chunkGraph: ChunkGraph, chunkGroup: ChunkGroup, ignoreChunk?: Chunk | undefined): boolean;
    /**
     * Checks whether this module contains the chunk.
     * @param {Chunk} chunk a chunk
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {ChunkGraph} chunkGraph the chunk graph
     * @returns {boolean} true, if the module has any reason why "chunk" should be included
     */
    hasReasonForChunk(chunk: Chunk, moduleGraph: ModuleGraph, chunkGraph: ChunkGraph): boolean;
    /**
     * Checks whether this module contains the module graph.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {RuntimeSpec} runtime the runtime
     * @returns {boolean} true if at least one other module depends on this module
     */
    hasReasons(moduleGraph: ModuleGraph, runtime: RuntimeSpec): boolean;
    /**
     * Checks whether the module needs to be rebuilt for the current build state.
     * @param {NeedBuildContext} context context info
     * @param {NeedBuildCallback} callback callback function, returns true, if the module needs a rebuild
     * @returns {void}
     */
    needBuild(context: NeedBuildContext, callback: NeedBuildCallback): void;
    /**
     * Checks whether it needs rebuild.
     * @deprecated Use needBuild instead
     * @param {Map<string, number | null>} fileTimestamps timestamps of files
     * @param {Map<string, number | null>} contextTimestamps timestamps of directories
     * @returns {boolean} true, if the module needs a rebuild
     */
    needRebuild(fileTimestamps: Map<string, number | null>, contextTimestamps: Map<string, number | null>): boolean;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash used to track dependencies
     * @param {UpdateHashContext} context context
     * @returns {void}
     */
    updateHash(hash: Hash, context?: Dependency.UpdateHashContext): void;
    /**
     * Invalidates the cached state associated with this value.
     * @returns {void}
     */
    invalidateBuild(): void;
    /**
     * Returns the unique identifier used to reference this module.
     * @abstract
     * @returns {string} a unique identifier of the module
     */
    identifier(): string;
    /**
     * Returns a human-readable identifier for this module.
     * @abstract
     * @param {RequestShortener} requestShortener the request shortener
     * @returns {string} a user readable identifier of the module
     */
    readableIdentifier(requestShortener: RequestShortener): string;
    /**
     * Builds the module using the provided compilation context.
     * @abstract
     * @param {WebpackOptions} options webpack options
     * @param {Compilation} compilation the compilation
     * @param {ResolverWithOptions} resolver the resolver
     * @param {InputFileSystem} fs the file system
     * @param {BuildCallback} callback callback function
     * @returns {void}
     */
    build(options: WebpackOptions, compilation: Compilation, resolver: ResolverWithOptions, fs: InputFileSystem, callback: BuildCallback): void;
    /**
     * Returns the source types this module can generate.
     * @abstract
     * @returns {SourceTypes} types available (do not mutate)
     */
    getSourceTypes(): SourceTypes;
    /**
     * Freshly recomputed source types when they depend on incoming connections, for chunk-graph cache invalidation; undefined otherwise. #20800
     * @returns {SourceTypes | undefined} source types or undefined
     */
    getReferencedSourceTypes(): SourceTypes | undefined;
    /**
     * Returns whether this module is of the given kind; a subclass is every kind its parent is.
     * @template {keyof ModuleKinds} K
     * @param {K} kind a module kind
     * @returns {this is ModuleKinds[K]} true when this module is of that kind
     */
    is<K extends keyof ModuleKinds>(kind: K): this is ModuleKinds[K];
    /**
     * Basic source types are high-level categories like javascript, css, webassembly, etc.
     * We only have built-in knowledge about the javascript basic type here; other basic types may be
     * added or changed over time by generators and do not need to be handled or detected here.
     *
     * Some modules, e.g. RemoteModule, may return non-basic source types like "remote" and "share-init"
     * from getSourceTypes(), but their generated output is still JavaScript, i.e. their basic type is JS.
     * @returns {BasicSourceTypes} types available (do not mutate)
     */
    getSourceBasicTypes(): BasicSourceTypes;
    /**
     * Returns generated source.
     * @abstract
     * @deprecated Use codeGeneration() instead
     * @param {DependencyTemplates} dependencyTemplates the dependency templates
     * @param {RuntimeTemplate} runtimeTemplate the runtime template
     * @param {SourceType=} type the type of source that should be generated
     * @returns {Source} generated source
     */
    source(dependencyTemplates: DependencyTemplates, runtimeTemplate: RuntimeTemplate, type?: SourceType | undefined): Source;
    /**
     * Returns the estimated size for the requested source type.
     * @abstract
     * @param {string=} type the source type for which the size should be estimated
     * @returns {number} the estimated size of the module (must be non-zero)
     */
    size(type?: string | undefined): number;
    /**
     * Gets the library identifier.
     * @param {LibIdentOptions} options options
     * @returns {LibIdent | null} an identifier for library inclusion
     */
    libIdent(options: LibIdentOptions): LibIdent | null;
    /**
     * Returns the path used when matching this module against rule conditions.
     * @returns {NameForCondition | null} absolute path which should be used for condition matching (usually the resource path)
     */
    nameForCondition(): NameForCondition | null;
    /**
     * Returns the module this one was built around: itself, or the root of a scope-hoisted concatenation.
     * @returns {Module} the root module
     */
    getRootModule(): Module;
    /**
     * Returns the modules this one was built from: itself, or every module merged by scope hoisting.
     * @returns {Iterable<Module>} the source modules (do not mutate)
     */
    getSourceModules(): Iterable<Module>;
    /**
     * Returns the reason this module cannot be concatenated, when one exists.
     * @param {ConcatenationBailoutReasonContext} context context
     * @returns {string | undefined} reason why this module can't be concatenated, undefined when it can be concatenated
     */
    getConcatenationBailoutReason(context: ConcatenationBailoutReasonContext): string | undefined;
    /**
     * Whether a concatenation may defer this module behind its lazy CommonJS
     * accessor. A generator ignoring `ConcatenationScope#isWrapped` answers false.
     * @returns {boolean} true, when it may be wrapped
     */
    canBeWrappedInConcatenation(): boolean;
    /**
     * Gets side effects connection state.
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {ConnectionState} how this module should be connected to referencing modules when consumed for side-effects only
     */
    getSideEffectsConnectionState(moduleGraph: ModuleGraph): ConnectionState;
    /**
     * Generates code and runtime requirements for this module.
     * @param {CodeGenerationContext} context context for code generation
     * @returns {CodeGenerationResult} result
     */
    codeGeneration(context: CodeGenerationContext): CodeGenerationResult;
    /**
     * Returns true if the module can be placed in the chunk.
     * @param {Chunk} chunk the chunk which condition should be checked
     * @param {Compilation} compilation the compilation
     * @returns {boolean} true if the module can be placed in the chunk
     */
    chunkCondition(chunk: Chunk, compilation: Compilation): boolean;
    hasChunkCondition(): boolean;
    /**
     * Assuming this module is in the cache. Update the (cached) module with
     * the fresh module from the factory. Usually updates internal references
     * and properties.
     * @param {Module} module fresh module
     * @returns {void}
     */
    updateCacheModule(module: Module): void;
    /**
     * Module should be unsafe cached. Get data that's needed for that.
     * This data will be passed to restoreFromUnsafeCache later.
     * @returns {UnsafeCacheData} cached data
     */
    getUnsafeCacheData(): Compilation.UnsafeCacheData;
    /**
     * restore unsafe cache data
     * @param {UnsafeCacheData} unsafeCacheData data from getUnsafeCacheData
     * @param {NormalModuleFactory} normalModuleFactory the normal module factory handling the unsafe caching
     */
    _restoreFromUnsafeCache(unsafeCacheData: Compilation.UnsafeCacheData, normalModuleFactory: NormalModuleFactory): void;
    /**
     * Assuming this module is in the cache. Remove internal references to allow freeing some memory.
     */
    cleanupForCache(): void;
    /**
     * Re-acquire factory-derived helpers (parser/generator) for an incremental
     * rebuild so this compilation's plugin hooks apply.
     * @param {NormalModuleFactory} normalModuleFactory the normal module factory
     * @returns {void}
     */
    _restoreParserAndGenerator(normalModuleFactory: NormalModuleFactory): void;
    /**
     * Releases the cached parser between incremental rebuilds so it doesn't keep
     * the previous compilation alive.
     * @returns {void}
     */
    _cleanupParserForCache(): void;
    /**
     * Gets the original source.
     * @returns {Source | null} the original source for the module before webpack transformation
     */
    originalSource(): Source | null;
    /**
     * Adds the provided file dependencies to the module.
     * @param {FileSystemDependencies} fileDependencies set where file dependencies are added to
     * @param {FileSystemDependencies} contextDependencies set where context dependencies are added to
     * @param {FileSystemDependencies} missingDependencies set where missing dependencies are added to
     * @param {FileSystemDependencies} buildDependencies set where build dependencies are added to
     */
    addCacheDependencies(fileDependencies: Compilation.FileSystemDependencies, contextDependencies: Compilation.FileSystemDependencies, missingDependencies: Compilation.FileSystemDependencies, buildDependencies: Compilation.FileSystemDependencies): void;
    get hasEqualsChunks(): EXPECTED_ANY;
    get isUsed(): EXPECTED_ANY;
    get errors(): any;
    get warnings(): any;
    set used(value: EXPECTED_ANY);
    get used(): EXPECTED_ANY;
}
declare namespace Module {
    export { KINDS, InitFragment, SortableSet, ExportsType, LazySet, SourceContext, KnownSourceType, SourceType, SourceTypes, BasicSourceTypes, CodeGenerationContext, ConcatenationBailoutReasonContext, RuntimeRequirements, ReadOnlyRuntimeRequirements, AllCodeGenerationSchemas, CodeGenValue, CodeGenMapOverloads, CodeGenerationResultData, Sources, CodeGenerationResult, LibIdentOptions, KnownBuildMeta, BuildDiagnostics, KnownBuildInfo, ValueCacheVersion, ValueCacheVersions, NeedBuildContext, NeedBuildCallback, BuildCallback, BuildMeta, BuildInfo, FactoryMeta, LibIdent, NameForCondition, OptimizationBailoutFunction, ModuleKinds };
}
import DependenciesBlock = require("../graph/DependenciesBlock");
import type { ModuleTypes } from "./ModuleTypeConstants";
import type { ResolveOptions } from "../../declarations/WebpackOptions";
import type Dependency from "../graph/Dependency";
import ChunkGraph = require("../graph/ChunkGraph");
import type ModuleProfile from "./ModuleProfile";
import ModuleGraph = require("../graph/ModuleGraph");
import type Chunk from "../graph/Chunk";
import type ChunkGroup from "../graph/ChunkGroup";
import type { RuntimeSpec } from "../util/runtime";
import type Hash from "../util/Hash";
import type RequestShortener from "../util/RequestShortener";
import type { WebpackOptionsNormalizedWithDefaults as WebpackOptions } from "../config/defaults";
import type Compilation from "../Compilation";
import type { ResolverWithOptions } from "../resolve/ResolverFactory";
import type { InputFileSystem } from "../fs/fs";
import type DependencyTemplates from "../template/DependencyTemplates";
import type RuntimeTemplate from "../template/RuntimeTemplate";
import type { Source } from "webpack-sources";
import type { ConnectionState } from "../graph/ModuleGraphConnection";
import type NormalModuleFactory from "./NormalModuleFactory";
declare var KINDS: Set<keyof ModuleKinds>;
/**
 * Defines the init fragment type used by this module.
 */
type InitFragment<T> = import("../template/InitFragment")<T>;
type SortableSet<T> = import("../util/SortableSet")<T>;
type ExportsType = "namespace" | "default-only" | "default-with-named" | "dynamic";
/**
 * <T>
 */
type LazySet<T> = import("../util/LazySet")<T>;
/**
 * Defines the source context type used by this module.
 */
type SourceContext = {
    /**
     * the dependency templates
     */
    dependencyTemplates: DependencyTemplates;
    /**
     * the runtime template
     */
    runtimeTemplate: RuntimeTemplate;
    /**
     * the module graph
     */
    moduleGraph: ModuleGraph;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the runtimes code should be generated for
     */
    runtime: RuntimeSpec;
    /**
     * the type of source that should be generated
     */
    type?: string | undefined;
};
type KnownSourceType = AllTypes;
type SourceType = KnownSourceType | string;
type SourceTypes = ReadonlySet<SourceType>;
type BasicSourceTypes = ReadonlySet<typeof JAVASCRIPT_TYPE | string>;
/**
 * Defines the code generation context type used by this module.
 */
type CodeGenerationContext = {
    /**
     * the dependency templates
     */
    dependencyTemplates: DependencyTemplates;
    /**
     * the runtime template
     */
    runtimeTemplate: RuntimeTemplate;
    /**
     * the module graph
     */
    moduleGraph: ModuleGraph;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the runtimes code should be generated for
     */
    runtime: RuntimeSpec;
    /**
     * all runtimes code should be generated for
     */
    runtimes: RuntimeSpec[];
    /**
     * when in concatenated module, information about other concatenated modules
     */
    concatenationScope?: ConcatenationScope | undefined;
    /**
     * code generation results of other modules (need to have a codeGenerationDependency to use that)
     */
    codeGenerationResults: CodeGenerationResults | undefined;
    /**
     * the compilation
     */
    compilation?: Compilation | undefined;
    /**
     * source types
     */
    sourceTypes?: SourceTypes | undefined;
};
/**
 * Defines the concatenation bailout reason context type used by this module.
 */
type ConcatenationBailoutReasonContext = {
    /**
     * the module graph
     */
    moduleGraph: ModuleGraph;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * whether eligible CommonJS modules may be concatenated
     */
    concatenateCommonJsModules?: boolean | undefined;
};
type RuntimeRequirements = Set<string>;
type ReadOnlyRuntimeRequirements = ReadonlySet<string>;
/**
 * Defines the all code generation schemas type used by this module.
 */
type AllCodeGenerationSchemas = {
    /**
     * top level declarations for javascript modules
     */
    topLevelDeclarations: Set<string>;
    /**
     * free identifier names in the rendered source for javascript modules
     */
    freeNames: Set<string>;
    /**
     * chunk init fragments for javascript modules
     */
    chunkInitFragments: InitFragment<import("../javascript/JavascriptModulesPlugin").ChunkRenderContext>[];
    /**
     * native external reexport source and attributes
     */
    externalReexport: string;
    /**
     * export definitions left out of a javascript module's source on demand (see `KnownMeta.onDemandExports`), to be placed before its body where it is wrapped
     */
    exportsSource: string;
    /**
     * export definitions left out on demand that read the module's own declarations, to be placed after its body where it is wrapped
     */
    exportsBindingSource: string;
    /**
     * final name of each used export of a concatenated module whose definitions were left out on demand
     */
    exportsFinalName: Record<string, string>;
    /**
     * url for asset modules
     */
    url: {
        javascript?: string;
        ["asset-url"]?: string;
    };
    /**
     * a filename for asset modules
     */
    filename: string;
    /**
     * an asset info for asset modules
     */
    assetInfo: Compilation.AssetInfo;
    /**
     * a full content hash for asset modules
     */
    fullContentHash: string;
    /**
     * share-init for modules federation
     */
    "share-init": [{
        shareScope: string;
        initStage: number;
        init: string;
    }];
};
/**
 * Defines the code gen value type used by this module.
 */
type CodeGenValue<K extends string> = K extends (keyof AllCodeGenerationSchemas) ? AllCodeGenerationSchemas[K] : EXPECTED_ANY;
/**
 * Defines the code gen map overloads type used by this module.
 */
type CodeGenMapOverloads = {
    get: <K extends string>(key: K) => CodeGenValue<K> | undefined;
    set: <K extends string>(key: K, value: CodeGenValue<K>) => CodeGenerationResultData;
    has: <K extends string>(key: K) => boolean;
    delete: <K extends string>(key: K) => boolean;
};
/**
 * Defines the code generation result data type used by this module.
 */
type CodeGenerationResultData = Omit<Map<string, EXPECTED_ANY>, "get" | "set" | "has" | "delete"> & CodeGenMapOverloads;
type Sources = Map<SourceType, Source>;
/**
 * Defines the code generation result type used by this module.
 */
type CodeGenerationResult = {
    /**
     * the resulting sources for all source types
     */
    sources: Sources;
    /**
     * the resulting data for all source types
     */
    data?: CodeGenerationResultData | undefined;
    /**
     * the runtime requirements
     */
    runtimeRequirements: ReadOnlyRuntimeRequirements | null;
    /**
     * a hash of the code generation result (will be automatically calculated from sources and runtimeRequirements if not provided)
     */
    hash?: string | undefined;
};
/**
 * Defines the lib ident options type used by this module.
 */
type LibIdentOptions = {
    /**
     * absolute context path to which lib ident is relative to
     */
    context: string;
    /**
     * object for caching
     */
    associatedObjectForCache?: AssociatedObjectForCache | undefined;
};
/**
 * Defines the build meta properties common to all module types.
 * Module type specific properties live in the `Known*BuildMeta` typedef of the dedicated module class.
 */
type KnownBuildMeta = {
    exportsType?: ("default" | "namespace" | "flagged" | "dynamic") | undefined;
    defaultObject?: (false | "redirect" | "redirect-warn") | undefined;
    async?: boolean | undefined;
    sideEffectFree?: boolean | undefined;
};
/**
 * What a build recorded for stats and the performance hints to report, kept on the build info so a module restored from the cache still has it.
 */
type BuildDiagnostics = {
    /**
     * what parser plugins reported as optimization bailouts, replayed into the module graph of every compilation that reuses the module
     */
    optimizationBailouts?: string[] | undefined;
    /**
     * the statement whose side effect keeps the module in the bundle, as `type at location`
     */
    sideEffectStatement?: string | undefined;
    /**
     * how many `#__PURE__` annotations sit where the parser does not read them
     */
    ineffectivePureAnnotations?: number | undefined;
    /**
     * how many times the module reads `this` at its top level
     */
    topLevelThis?: number | undefined;
    /**
     * true when the module calls `eval` directly
     */
    usesEval?: boolean | undefined;
    /**
     * reasons why the module is not cacheable (e.g. paths of loaders that marked it)
     */
    notCacheableReasons?: string[] | undefined;
};
/**
 * Defines the build info properties common to all module types.
 * Module type specific properties live in the `Known*BuildInfo` typedef of the dedicated module class.
 */
type KnownBuildInfo = {
    /**
     * the module hands out a spec Module Namespace Exotic Object
     */
    specNamespaceObject?: boolean | undefined;
    cacheable?: boolean | undefined;
    strict?: boolean | undefined;
    moduleArgument?: string | undefined;
    exportsArgument?: string | undefined;
    /**
     * assets added by loaders or plugins
     */
    assets?: Record<string, Source> | undefined;
    assetsInfo?: Map<string, Compilation.AssetInfo | undefined> | undefined;
    /**
     * top level declaration names
     */
    topLevelDeclarations?: Set<string> | undefined;
    /**
     * true when the module is in a synchronous circular dependency chain
     */
    isCircular?: boolean | undefined;
    /**
     * CircularKind bit flags from CircularModulesPlugin; unset when the plugin did not run
     */
    circularKind?: number | undefined;
    /**
     * module uses top-level `for await…of` or `await using`, which can't be lowered to a generator
     */
    usesTopLevelAwaitForOf?: boolean | undefined;
    /**
     * what the build recorded for stats and the performance hints to report
     */
    diagnostics?: BuildDiagnostics | undefined;
};
type ValueCacheVersion = string | Set<string>;
type ValueCacheVersions = Map<string, ValueCacheVersion>;
/**
 * Defines the need build context type used by this module.
 */
type NeedBuildContext = {
    compilation: Compilation;
    fileSystemInfo: FileSystemInfo;
    valueCacheVersions: ValueCacheVersions;
};
type NeedBuildCallback = (err?: WebpackError | null, needBuild?: boolean) => void;
type BuildCallback = (err?: WebpackError) => void;
type BuildMeta = KnownBuildMeta & Record<string, EXPECTED_ANY>;
type BuildInfo = KnownBuildInfo & Record<string, EXPECTED_ANY>;
/**
 * Defines the factory meta type used by this module.
 */
type FactoryMeta = {
    sideEffectFree?: boolean | undefined;
};
type LibIdent = string;
type NameForCondition = string;
type OptimizationBailoutFunction = (requestShortener: RequestShortener) => string;
/**
 * The kinds a module can be, each naming the class `is(kind)` narrows to.
 */
type ModuleKinds = {
    external: ExternalModule;
    normal: NormalModule;
    runtime: RuntimeModule;
    context: ContextModule;
    remote: RemoteModule;
    "consume-shared": ConsumeSharedModule;
    css: CssModule;
    html: HtmlModule;
    concatenated: ConcatenatedModule;
};
import type { AllTypes } from "./ModuleSourceTypeConstants";
import { JAVASCRIPT_TYPE } from "./ModuleSourceTypeConstants";
import type ConcatenationScope from "../optimize/ConcatenationScope";
import type CodeGenerationResults from "./CodeGenerationResults";
import type { AssociatedObjectForCache } from "../util/identifier";
import type FileSystemInfo from "../fs/FileSystemInfo";
import type WebpackError from "../errors/WebpackError";
import type ExternalModule from "../externals/ExternalModule";
import type NormalModule from "./NormalModule";
import type RuntimeModule from "../runtime/RuntimeModule";
import type ContextModule from "../context/ContextModule";
import type RemoteModule from "../container/RemoteModule";
import type ConsumeSharedModule from "../sharing/ConsumeSharedModule";
import type CssModule from "../css/CssModule";
import type HtmlModule from "../html/HtmlModule";
import type ConcatenatedModule from "../optimize/ConcatenatedModule";
