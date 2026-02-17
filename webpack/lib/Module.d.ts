export = Module;
/** @typedef {(requestShortener: RequestShortener) => string} OptimizationBailoutFunction */
declare class Module extends DependenciesBlock {
  /**
   * @param {ModuleTypes | ""} type the module type, when deserializing the type is not known and is an empty string
   * @param {(string | null)=} context an optional context
   * @param {(string | null)=} layer an optional layer in which the module is
   */
  constructor(
    type: ModuleTypes | '',
    context?: (string | null) | undefined,
    layer?: (string | null) | undefined,
  );
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
  /** @type {WebpackError[] | undefined} */
  _warnings: WebpackError[] | undefined;
  /** @type {WebpackError[] | undefined} */
  _errors: WebpackError[] | undefined;
  /** @type {BuildMeta | undefined} */
  buildMeta: BuildMeta | undefined;
  /** @type {BuildInfo | undefined} */
  buildInfo: BuildInfo | undefined;
  /** @type {Dependency[] | undefined} */
  presentationalDependencies: Dependency[] | undefined;
  /** @type {Dependency[] | undefined} */
  codeGenerationDependencies: Dependency[] | undefined;
  /**
   * @param {ModuleId} value value
   */
  set id(value: ChunkGraph.ModuleId);
  /**
   * @returns {ModuleId | null} module id
   */
  get id(): ChunkGraph.ModuleId;
  /**
   * @returns {string} the hash of the module
   */
  get hash(): string;
  /**
   * @returns {string} the shortened hash of the module
   */
  get renderedHash(): string;
  set profile(value: import('./ModuleProfile'));
  get profile(): import('./ModuleProfile');
  /**
   * @param {number} value the pre order index
   */
  set index(value: number);
  /**
   * @returns {number | null} the pre order index
   */
  get index(): number;
  /**
   * @param {number} value the post order index
   */
  set index2(value: number);
  /**
   * @returns {number | null} the post order index
   */
  get index2(): number;
  /**
   * @param {number} value the depth
   */
  set depth(value: number);
  /**
   * @returns {number | null} the depth
   */
  get depth(): number;
  /**
   * @param {Module | null} value issuer
   */
  set issuer(value: Module);
  /**
   * @returns {Module | null | undefined} issuer
   */
  get issuer(): Module;
  get usedExports(): boolean | import('./util/SortableSet')<string>;
  /**
   * @deprecated
   * @returns {(string | OptimizationBailoutFunction)[]} list
   */
  get optimizationBailout(): (string | OptimizationBailoutFunction)[];
  get optional(): boolean;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {boolean} true, when the module was added
   */
  addChunk(chunk: Chunk): boolean;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {void}
   */
  removeChunk(chunk: Chunk): void;
  /**
   * @param {Chunk} chunk the chunk
   * @returns {boolean} true, when the module is in the chunk
   */
  isInChunk(chunk: Chunk): boolean;
  isEntryModule(): boolean;
  getChunks(): import('./Chunk')[];
  getNumberOfChunks(): number;
  get chunksIterable(): Iterable<import('./Chunk')>;
  /**
   * @param {string} exportName a name of an export
   * @returns {boolean | null} true, if the export is provided why the module.
   * null, if it's unknown.
   * false, if it's not provided.
   */
  isProvided(exportName: string): boolean | null;
  /**
   * @returns {string} name of the exports argument
   */
  get exportsArgument(): string;
  /**
   * @returns {string} name of the module argument
   */
  get moduleArgument(): string;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {boolean | undefined} strict the importing module is strict
   * @returns {"namespace" | "default-only" | "default-with-named" | "dynamic"} export type
   * "namespace": Exports is already a namespace object. namespace = exports.
   * "dynamic": Check at runtime if __esModule is set. When set: namespace = { ...exports, default: exports }. When not set: namespace = { default: exports }.
   * "default-only": Provide a namespace object with only default export. namespace = { default: exports }
   * "default-with-named": Provide a namespace object with named and default export. namespace = { ...exports, default: exports }
   */
  getExportsType(
    moduleGraph: ModuleGraph,
    strict: boolean | undefined,
  ): 'namespace' | 'default-only' | 'default-with-named' | 'dynamic';
  /**
   * @param {Dependency} presentationalDependency dependency being tied to module.
   * This is a Dependency without edge in the module graph. It's only for presentation.
   * @returns {void}
   */
  addPresentationalDependency(presentationalDependency: Dependency): void;
  /**
   * @param {Dependency} codeGenerationDependency dependency being tied to module.
   * This is a Dependency where the code generation result of the referenced module is needed during code generation.
   * The Dependency should also be added to normal dependencies via addDependency.
   * @returns {void}
   */
  addCodeGenerationDependency(codeGenerationDependency: Dependency): void;
  /**
   * @param {WebpackError} warning the warning
   * @returns {void}
   */
  addWarning(warning: WebpackError): void;
  /**
   * @returns {Iterable<WebpackError> | undefined} list of warnings if any
   */
  getWarnings(): Iterable<WebpackError> | undefined;
  /**
   * @returns {number} number of warnings
   */
  getNumberOfWarnings(): number;
  /**
   * @param {WebpackError} error the error
   * @returns {void}
   */
  addError(error: WebpackError): void;
  /**
   * @returns {Iterable<WebpackError> | undefined} list of errors if any
   */
  getErrors(): Iterable<WebpackError> | undefined;
  /**
   * @returns {number} number of errors
   */
  getNumberOfErrors(): number;
  /**
   * removes all warnings and errors
   * @returns {void}
   */
  clearWarningsAndErrors(): void;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @returns {boolean} true, if the module is optional
   */
  isOptional(moduleGraph: ModuleGraph): boolean;
  /**
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {Chunk} chunk a chunk
   * @param {Chunk=} ignoreChunk chunk to be ignored
   * @returns {boolean} true, if the module is accessible from "chunk" when ignoring "ignoreChunk"
   */
  isAccessibleInChunk(
    chunkGraph: ChunkGraph,
    chunk: Chunk,
    ignoreChunk?: Chunk | undefined,
  ): boolean;
  /**
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {ChunkGroup} chunkGroup a chunk group
   * @param {Chunk=} ignoreChunk chunk to be ignored
   * @returns {boolean} true, if the module is accessible from "chunkGroup" when ignoring "ignoreChunk"
   */
  isAccessibleInChunkGroup(
    chunkGraph: ChunkGraph,
    chunkGroup: ChunkGroup,
    ignoreChunk?: Chunk | undefined,
  ): boolean;
  /**
   * @param {Chunk} chunk a chunk
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @returns {boolean} true, if the module has any reason why "chunk" should be included
   */
  hasReasonForChunk(
    chunk: Chunk,
    moduleGraph: ModuleGraph,
    chunkGraph: ChunkGraph,
  ): boolean;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {RuntimeSpec} runtime the runtime
   * @returns {boolean} true if at least one other module depends on this module
   */
  hasReasons(moduleGraph: ModuleGraph, runtime: RuntimeSpec): boolean;
  /**
   * @param {NeedBuildContext} context context info
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
   * @returns {void}
   */
  needBuild(
    context: NeedBuildContext,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: boolean | undefined,
    ) => void,
  ): void;
  /**
   * @deprecated Use needBuild instead
   * @param {Map<string, number|null>} fileTimestamps timestamps of files
   * @param {Map<string, number|null>} contextTimestamps timestamps of directories
   * @returns {boolean} true, if the module needs a rebuild
   */
  needRebuild(
    fileTimestamps: Map<string, number | null>,
    contextTimestamps: Map<string, number | null>,
  ): boolean;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context?: UpdateHashContext): void;
  /**
   * @returns {void}
   */
  invalidateBuild(): void;
  /**
   * @abstract
   * @returns {string} a unique identifier of the module
   */
  identifier(): string;
  /**
   * @abstract
   * @param {RequestShortener} requestShortener the request shortener
   * @returns {string} a user readable identifier of the module
   */
  readableIdentifier(requestShortener: RequestShortener): string;
  /**
   * @abstract
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {ResolverWithOptions} resolver the resolver
   * @param {InputFileSystem} fs the file system
   * @param {function(WebpackError=): void} callback callback function
   * @returns {void}
   */
  build(
    options: WebpackOptions,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    callback: (arg0: WebpackError | undefined) => void,
  ): void;
  /**
   * @abstract
   * @returns {SourceTypes} types available (do not mutate)
   */
  getSourceTypes(): SourceTypes;
  /**
   * @abstract
   * @deprecated Use codeGeneration() instead
   * @param {DependencyTemplates} dependencyTemplates the dependency templates
   * @param {RuntimeTemplate} runtimeTemplate the runtime template
   * @param {string=} type the type of source that should be generated
   * @returns {Source} generated source
   */
  source(
    dependencyTemplates: DependencyTemplates,
    runtimeTemplate: RuntimeTemplate,
    type?: string | undefined,
  ): Source;
  /**
   * @abstract
   * @param {string=} type the source type for which the size should be estimated
   * @returns {number} the estimated size of the module (must be non-zero)
   */
  size(type?: string | undefined): number;
  /**
   * @param {LibIdentOptions} options options
   * @returns {string | null} an identifier for library inclusion
   */
  libIdent(options: LibIdentOptions): string | null;
  /**
   * @returns {string | null} absolute path which should be used for condition matching (usually the resource path)
   */
  nameForCondition(): string | null;
  /**
   * @param {ConcatenationBailoutReasonContext} context context
   * @returns {string | undefined} reason why this module can't be concatenated, undefined when it can be concatenated
   */
  getConcatenationBailoutReason(
    context: ConcatenationBailoutReasonContext,
  ): string | undefined;
  /**
   * @param {ModuleGraph} moduleGraph the module graph
   * @returns {ConnectionState} how this module should be connected to referencing modules when consumed for side-effects only
   */
  getSideEffectsConnectionState(moduleGraph: ModuleGraph): ConnectionState;
  /**
   * @param {CodeGenerationContext} context context for code generation
   * @returns {CodeGenerationResult} result
   */
  codeGeneration(context: CodeGenerationContext): CodeGenerationResult;
  /**
   * @param {Chunk} chunk the chunk which condition should be checked
   * @param {Compilation} compilation the compilation
   * @returns {boolean} true, if the chunk is ok for the module
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
  getUnsafeCacheData(): UnsafeCacheData;
  /**
   * restore unsafe cache data
   * @param {object} unsafeCacheData data from getUnsafeCacheData
   * @param {NormalModuleFactory} normalModuleFactory the normal module factory handling the unsafe caching
   */
  _restoreFromUnsafeCache(
    unsafeCacheData: object,
    normalModuleFactory: NormalModuleFactory,
  ): void;
  /**
   * Assuming this module is in the cache. Remove internal references to allow freeing some memory.
   */
  cleanupForCache(): void;
  /**
   * @returns {Source | null} the original source for the module before webpack transformation
   */
  originalSource(): Source | null;
  /**
   * @param {LazySet<string>} fileDependencies set where file dependencies are added to
   * @param {LazySet<string>} contextDependencies set where context dependencies are added to
   * @param {LazySet<string>} missingDependencies set where missing dependencies are added to
   * @param {LazySet<string>} buildDependencies set where build dependencies are added to
   */
  addCacheDependencies(
    fileDependencies: LazySet<string>,
    contextDependencies: LazySet<string>,
    missingDependencies: LazySet<string>,
    buildDependencies: LazySet<string>,
  ): void;
  get hasEqualsChunks(): any;
  get isUsed(): any;
  get errors(): any;
  get warnings(): any;
  set used(value: any);
  get used(): any;
}
declare namespace Module {
  export {
    Source,
    ResolveOptions,
    WebpackOptions,
    Chunk,
    ModuleId,
    ChunkGroup,
    CodeGenerationResults,
    Compilation,
    AssetInfo,
    ValueCacheVersion,
    ConcatenationScope,
    Dependency,
    UpdateHashContext,
    DependencyTemplates,
    UsageStateType,
    FileSystemInfo,
    Snapshot,
    ConnectionState,
    ModuleTypes,
    NormalModuleFactory,
    RequestShortener,
    ResolverWithOptions,
    RuntimeTemplate,
    WebpackError,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    LazySet,
    SortableSet,
    InputFileSystem,
    RuntimeSpec,
    SourceContext,
    CodeGenerationContext,
    ConcatenationBailoutReasonContext,
    RuntimeRequirements,
    ReadOnlyRuntimeRequirements,
    CodeGenerationResult,
    LibIdentOptions,
    KnownBuildMeta,
    KnownBuildInfo,
    NeedBuildContext,
    BuildMeta,
    BuildInfo,
    FactoryMeta,
    SourceTypes,
    UnsafeCacheData,
    OptimizationBailoutFunction,
  };
}
import DependenciesBlock = require('./DependenciesBlock');
import ChunkGraph = require('./ChunkGraph');
import ModuleGraph = require('./ModuleGraph');
type Source = import('webpack-sources').Source;
type ResolveOptions = import('../declarations/WebpackOptions').ResolveOptions;
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type Chunk = import('./Chunk');
type ModuleId = import('./ChunkGraph').ModuleId;
type ChunkGroup = import('./ChunkGroup');
type CodeGenerationResults = import('./CodeGenerationResults');
type Compilation = import('./Compilation');
type AssetInfo = import('./Compilation').AssetInfo;
type ValueCacheVersion = import('./Compilation').ValueCacheVersion;
type ConcatenationScope = import('./ConcatenationScope');
type Dependency = import('./Dependency');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type DependencyTemplates = import('./DependencyTemplates');
type UsageStateType = import('./ExportsInfo').UsageStateType;
type FileSystemInfo = import('./FileSystemInfo');
type Snapshot = import('./FileSystemInfo').Snapshot;
type ConnectionState = import('./ModuleGraphConnection').ConnectionState;
type ModuleTypes = import('./ModuleTypeConstants').ModuleTypes;
type NormalModuleFactory = import('./NormalModuleFactory');
type RequestShortener = import('./RequestShortener');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type RuntimeTemplate = import('./RuntimeTemplate');
type WebpackError = import('./WebpackError');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('./util/Hash');
/**
 * <T>
 */
type LazySet<T> = import('./util/LazySet')<T>;
/**
 * <T>
 */
type SortableSet<T> = import('./util/SortableSet')<T>;
type InputFileSystem = import('./util/fs').InputFileSystem;
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
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
  sourceTypes?: ReadonlySet<string> | undefined;
};
type ConcatenationBailoutReasonContext = {
  /**
   * the module graph
   */
  moduleGraph: ModuleGraph;
  /**
   * the chunk graph
   */
  chunkGraph: ChunkGraph;
};
type RuntimeRequirements = Set<string>;
type ReadOnlyRuntimeRequirements = ReadonlySet<string>;
type CodeGenerationResult = {
  /**
   * the resulting sources for all source types
   */
  sources: Map<string, Source>;
  /**
   * the resulting data for all source types
   */
  data?: Map<string, any> | undefined;
  /**
   * the runtime requirements
   */
  runtimeRequirements: ReadOnlyRuntimeRequirements | null;
  /**
   * a hash of the code generation result (will be automatically calculated from sources and runtimeRequirements if not provided)
   */
  hash?: string | undefined;
};
type LibIdentOptions = {
  /**
   * absolute context path to which lib ident is relative to
   */
  context: string;
  /**
   * object for caching
   */
  associatedObjectForCache?: object | undefined;
};
type KnownBuildMeta = {
  moduleArgument?: string | undefined;
  exportsArgument?: string | undefined;
  strict?: boolean | undefined;
  moduleConcatenationBailout?: string | undefined;
  exportsType?: ('default' | 'namespace' | 'flagged' | 'dynamic') | undefined;
  defaultObject?: (false | 'redirect' | 'redirect-warn') | undefined;
  strictHarmonyModule?: boolean | undefined;
  async?: boolean | undefined;
  sideEffectFree?: boolean | undefined;
};
type KnownBuildInfo = {
  cacheable?: boolean | undefined;
  parsed?: boolean | undefined;
  fileDependencies?: LazySet<string> | undefined;
  contextDependencies?: LazySet<string> | undefined;
  missingDependencies?: LazySet<string> | undefined;
  buildDependencies?: LazySet<string> | undefined;
  valueDependencies?: Map<string, ValueCacheVersion> | undefined;
  hash?: TODO | undefined;
  assets?: Record<string, Source> | undefined;
  assetsInfo?: Map<string, AssetInfo | undefined> | undefined;
  snapshot?: (Snapshot | null) | undefined;
};
type NeedBuildContext = {
  compilation: Compilation;
  fileSystemInfo: FileSystemInfo;
  valueCacheVersions: Map<string, string | Set<string>>;
};
type BuildMeta = KnownBuildMeta & Record<string, any>;
type BuildInfo = KnownBuildInfo & Record<string, any>;
type FactoryMeta = {
  sideEffectFree?: boolean | undefined;
};
type SourceTypes = Set<string>;
type UnsafeCacheData = {
  factoryMeta: FactoryMeta | undefined;
  resolveOptions: ResolveOptions | undefined;
};
type OptimizationBailoutFunction = (
  requestShortener: RequestShortener,
) => string;
