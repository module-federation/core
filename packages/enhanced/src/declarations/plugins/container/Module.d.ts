declare class Module extends DependenciesBlock {
  constructor(type: string, context?: null | string, layer?: null | string);
  type: string;
  context: null | string;
  layer: null | string;
  needId: boolean;
  debugId: number;
  resolveOptions?: ResolveOptionsWebpackOptions;
  factoryMeta?: FactoryMeta;
  useSourceMap: boolean;
  useSimpleSourceMap: boolean;
  buildMeta?: BuildMeta;
  buildInfo?: BuildInfo;
  presentationalDependencies?: Dependency[];
  codeGenerationDependencies?: Dependency[];
  id: string | number;
  get hash(): string;
  get renderedHash(): string;
  profile: null | ModuleProfile;
  index: null | number;
  index2: null | number;
  depth: null | number;
  issuer: null | Module;
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
  getUnsafeCacheData(): object;

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
