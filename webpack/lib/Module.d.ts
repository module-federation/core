export = Module;
/** @typedef {(requestShortener: RequestShortener) => string} OptimizationBailoutFunction */
declare class Module extends DependenciesBlock {
  constructor(type: string, context?: null | string, layer?: null | string);
  type: string;
  context: null | string;
  layer: null | string;
  needId: boolean;
  debugId: number;
  resolveOptions?: ResolveOptions;
  factoryMeta?: FactoryMeta;
  useSourceMap: boolean;
  useSimpleSourceMap: boolean;
  buildMeta?: BuildMeta;
  buildInfo?: BuildInfo;
  presentationalDependencies?: Dependency[];
  codeGenerationDependencies?: Dependency[];
  id: ModuleId;
  get hash(): string;
  get renderedHash(): string;
  profile?: ModuleProfile;
  index: null | number;
  index2: null | number;
  depth: null | number;
  issuer?: null | Module;
  get usedExports(): null | boolean | SortableSet<string>;
  get optimizationBailout(): (
    | string
    | ((requestShortener: RequestShortener) => string)
  )[];
  get optional(): boolean;
  addChunk(chunk: Chunk): boolean;
  removeChunk(chunk: Chunk): void;
  isInChunk(chunk: Chunk): boolean;
  isEntryModule(): boolean;
  getChunks(): Chunk[];
  getNumberOfChunks(): number;
  get chunksIterable(): Iterable<Chunk>;
  isProvided(exportName: string): null | boolean;
  get exportsArgument(): string;
  get moduleArgument(): string;
  getExportsType(
    moduleGraph: ModuleGraph,
    strict?: boolean,
  ): 'namespace' | 'default-only' | 'default-with-named' | 'dynamic';
  addPresentationalDependency(presentationalDependency: Dependency): void;
  addCodeGenerationDependency(codeGenerationDependency: Dependency): void;
  addWarning(warning: WebpackError): void;
  getWarnings(): undefined | Iterable<WebpackError>;
  getNumberOfWarnings(): number;
  addError(error: WebpackError): void;
  getErrors(): undefined | Iterable<WebpackError>;
  getNumberOfErrors(): number;

  /**
   * removes all warnings and errors
   */
  clearWarningsAndErrors(): void;
  isOptional(moduleGraph: ModuleGraph): boolean;
  isAccessibleInChunk(
    chunkGraph: ChunkGraph,
    chunk: Chunk,
    ignoreChunk?: Chunk,
  ): boolean;
  isAccessibleInChunkGroup(
    chunkGraph: ChunkGraph,
    chunkGroup: ChunkGroup,
    ignoreChunk?: Chunk,
  ): boolean;
  hasReasonForChunk(
    chunk: Chunk,
    moduleGraph: ModuleGraph,
    chunkGraph: ChunkGraph,
  ): boolean;
  hasReasons(moduleGraph: ModuleGraph, runtime: RuntimeSpec): boolean;
  needBuild(
    context: NeedBuildContext,
    callback: (arg0?: null | WebpackError, arg1?: boolean) => void,
  ): void;
  needRebuild(
    fileTimestamps: Map<string, null | number>,
    contextTimestamps: Map<string, null | number>,
  ): boolean;
  invalidateBuild(): void;
  identifier(): string;
  readableIdentifier(requestShortener: RequestShortener): string;
  build(
    options: WebpackOptionsNormalized,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    callback: (arg0?: WebpackError) => void,
  ): void;
  getSourceTypes(): Set<string>;
  source(
    dependencyTemplates: DependencyTemplates,
    runtimeTemplate: RuntimeTemplate,
    type?: string,
  ): Source;
  size(type?: string): number;
  libIdent(options: LibIdentOptions): null | string;
  nameForCondition(): null | string;
  getConcatenationBailoutReason(
    context: ConcatenationBailoutReasonContext,
  ): undefined | string;
  getSideEffectsConnectionState(moduleGraph: ModuleGraph): ConnectionState;
  codeGeneration(context: CodeGenerationContext): CodeGenerationResult;
  chunkCondition(chunk: Chunk, compilation: Compilation): boolean;
  hasChunkCondition(): boolean;

  /**
   * Assuming this module is in the cache. Update the (cached) module with
   * the fresh module from the factory. Usually updates internal references
   * and properties.
   */
  updateCacheModule(module: Module): void;

  /**
   * Module should be unsafe cached. Get data that's needed for that.
   * This data will be passed to restoreFromUnsafeCache later.
   */
  getUnsafeCacheData(): UnsafeCacheData;

  /**
   * Assuming this module is in the cache. Remove internal references to allow freeing some memory.
   */
  cleanupForCache(): void;
  originalSource(): null | Source;
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
  used: any;
}

declare namespace Module {
  export {
    Source,
    ResolveOptions,
    WebpackOptions,
    Chunk,
    ChunkGroup,
    CodeGenerationResults,
    Compilation,
    ConcatenationScope,
    Dependency,
    UpdateHashContext,
    DependencyTemplates,
    UsageStateType,
    FileSystemInfo,
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
    CodeGenerationResult,
    LibIdentOptions,
    KnownBuildMeta,
    NeedBuildContext,
    BuildMeta,
    BuildInfo,
    FactoryMeta,
    OptimizationBailoutFunction,
  };
}
import DependenciesBlock = require('./DependenciesBlock');
type ModuleTypes = import('./ModuleTypeConstants').ModuleTypes;
type ResolveOptions = import('../declarations/WebpackOptions').ResolveOptions;
type FactoryMeta = {
  sideEffectFree?: boolean | undefined;
};
type WebpackError = import('./WebpackError');
type BuildMeta = KnownBuildMeta & Record<string, any>;
type BuildInfo = Record<string, any>;
type Dependency = import('./Dependency');
type OptimizationBailoutFunction = (
  requestShortener: RequestShortener,
) => string;
type Chunk = import('./Chunk');
import ModuleGraph = require('./ModuleGraph');
import ChunkGraph = require('./ChunkGraph');
type ChunkGroup = import('./ChunkGroup');
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type NeedBuildContext = {
  compilation: Compilation;
  fileSystemInfo: FileSystemInfo;
  valueCacheVersions: Map<string, string | Set<string>>;
};
type Hash = import('./util/Hash');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type RequestShortener = import('./RequestShortener');
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type Compilation = import('./Compilation');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type InputFileSystem = import('./util/fs').InputFileSystem;
type DependencyTemplates = import('./DependencyTemplates');
type RuntimeTemplate = import('./RuntimeTemplate');
type LibIdentOptions = {
  /**
   * absolute context path to which lib ident is relative to
   */
  context: string;
  /**
   * object for caching
   */
  associatedObjectForCache?: any | undefined;
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
type ConnectionState = import('./ModuleGraphConnection').ConnectionState;
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
  codeGenerationResults: CodeGenerationResults;
  /**
   * the compilation
   */
  compilation?: Compilation | undefined;
  /**
   * source types
   */
  sourceTypes?: ReadonlySet<string> | undefined;
};
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
  runtimeRequirements: ReadonlySet<string>;
  /**
   * a hash of the code generation result (will be automatically calculated from sources and runtimeRequirements if not provided)
   */
  hash?: string | undefined;
};
type NormalModuleFactory = import('./NormalModuleFactory');
type Source = any;
/**
 * <T>
 */
type LazySet<T> = import('./util/LazySet')<T>;
type CodeGenerationResults = import('./CodeGenerationResults');
type ConcatenationScope = import('./ConcatenationScope');
type UsageStateType = import('./ExportsInfo').UsageStateType;
type FileSystemInfo = import('./FileSystemInfo');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
/**
 * <T>
 */
type SortableSet<T> = import('./util/SortableSet')<T>;
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
