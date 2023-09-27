export = ContextModule;
declare class ContextModule extends Module {
  /**
   * @param {ResolveDependencies} resolveDependencies function to get dependencies in this context
   * @param {ContextModuleOptions} options options object
   */
  constructor(
    resolveDependencies: ResolveDependencies,
    options: ContextModuleOptions,
  );
  /** @type {ContextModuleOptions} */
  options: ContextModuleOptions;
  resolveDependencies: ResolveDependencies;
  resolveOptions: any;
  _identifier: string;
  _forceBuild: boolean;
  _prettyRegExp(regexString: any, stripSlash?: boolean): string;
  _createIdentifier(): string;
  /**
   * @param {ContextElementDependency[]} dependencies all dependencies
   * @param {ChunkGraph} chunkGraph chunk graph
   * @returns {TODO} TODO
   */
  getUserRequestMap(
    dependencies: ContextElementDependency[],
    chunkGraph: ChunkGraph,
  ): TODO;
  /**
   * @param {ContextElementDependency[]} dependencies all dependencies
   * @param {ChunkGraph} chunkGraph chunk graph
   * @returns {TODO} TODO
   */
  getFakeMap(
    dependencies: ContextElementDependency[],
    chunkGraph: ChunkGraph,
  ): TODO;
  getFakeMapInitStatement(fakeMap: any): string;
  getReturn(type: any, asyncModule: any): string;
  getReturnModuleObjectSource(
    fakeMap: any,
    asyncModule: any,
    fakeMapDataExpression?: string,
  ): string;
  /**
   * @param {TODO} dependencies TODO
   * @param {TODO} id TODO
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @returns {string} source code
   */
  getSyncSource(dependencies: TODO, id: TODO, chunkGraph: ChunkGraph): string;
  /**
   * @param {TODO} dependencies TODO
   * @param {TODO} id TODO
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @returns {string} source code
   */
  getWeakSyncSource(
    dependencies: TODO,
    id: TODO,
    chunkGraph: ChunkGraph,
  ): string;
  /**
   * @param {TODO} dependencies TODO
   * @param {TODO} id TODO
   * @param {Object} context context
   * @param {ChunkGraph} context.chunkGraph the chunk graph
   * @param {RuntimeTemplate} context.runtimeTemplate the chunk graph
   * @returns {string} source code
   */
  getAsyncWeakSource(
    dependencies: TODO,
    id: TODO,
    {
      chunkGraph,
      runtimeTemplate,
    }: {
      chunkGraph: ChunkGraph;
      runtimeTemplate: RuntimeTemplate;
    },
  ): string;
  /**
   * @param {TODO} dependencies TODO
   * @param {TODO} id TODO
   * @param {Object} context context
   * @param {ChunkGraph} context.chunkGraph the chunk graph
   * @param {RuntimeTemplate} context.runtimeTemplate the chunk graph
   * @returns {string} source code
   */
  getEagerSource(
    dependencies: TODO,
    id: TODO,
    {
      chunkGraph,
      runtimeTemplate,
    }: {
      chunkGraph: ChunkGraph;
      runtimeTemplate: RuntimeTemplate;
    },
  ): string;
  /**
   * @param {TODO} block TODO
   * @param {TODO} dependencies TODO
   * @param {TODO} id TODO
   * @param {Object} options options object
   * @param {RuntimeTemplate} options.runtimeTemplate the runtime template
   * @param {ChunkGraph} options.chunkGraph the chunk graph
   * @returns {string} source code
   */
  getLazyOnceSource(
    block: TODO,
    dependencies: TODO,
    id: TODO,
    {
      runtimeTemplate,
      chunkGraph,
    }: {
      runtimeTemplate: RuntimeTemplate;
      chunkGraph: ChunkGraph;
    },
  ): string;
  /**
   * @param {TODO} blocks TODO
   * @param {TODO} id TODO
   * @param {Object} context context
   * @param {ChunkGraph} context.chunkGraph the chunk graph
   * @param {RuntimeTemplate} context.runtimeTemplate the chunk graph
   * @returns {string} source code
   */
  getLazySource(
    blocks: TODO,
    id: TODO,
    {
      chunkGraph,
      runtimeTemplate,
    }: {
      chunkGraph: ChunkGraph;
      runtimeTemplate: RuntimeTemplate;
    },
  ): string;
  getSourceForEmptyContext(id: any, runtimeTemplate: any): string;
  getSourceForEmptyAsyncContext(id: any, runtimeTemplate: any): string;
  /**
   * @param {string} asyncMode module mode
   * @param {CodeGenerationContext} context context info
   * @returns {string} the source code
   */
  getSourceString(
    asyncMode: string,
    { runtimeTemplate, chunkGraph }: CodeGenerationContext,
  ): string;
  /**
   * @param {string} sourceString source content
   * @param {Compilation=} compilation the compilation
   * @returns {Source} generated source
   */
  getSource(sourceString: string, compilation?: Compilation | undefined): any;
}
declare namespace ContextModule {
  export {
    Source,
    WebpackOptions,
    ChunkGraph,
    RawChunkGroupOptions,
    Compilation,
    DependencyTemplates,
    BuildMeta,
    CodeGenerationContext,
    CodeGenerationResult,
    LibIdentOptions,
    NeedBuildContext,
    ModuleGraph,
    RequestShortener,
    ResolverWithOptions,
    RuntimeTemplate,
    ContextElementDependency,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    LazySet,
    InputFileSystem,
    ContextMode,
    ContextOptions,
    ContextModuleOptionsExtras,
    ContextModuleOptions,
    ResolveDependenciesCallback,
    ResolveDependencies,
  };
}
import Module = require('./Module');
type ContextModuleOptions = ContextOptions & ContextModuleOptionsExtras;
type ResolveDependencies = (
  fs: InputFileSystem,
  options: ContextModuleOptions,
  callback: ResolveDependenciesCallback,
) => any;
type ContextElementDependency =
  import('./dependencies/ContextElementDependency');
type ChunkGraph = import('./ChunkGraph');
type RuntimeTemplate = import('./RuntimeTemplate');
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type Compilation = import('./Compilation');
type Source = any;
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type RawChunkGroupOptions = import('./ChunkGroup').RawChunkGroupOptions;
type DependencyTemplates = import('./DependencyTemplates');
type BuildMeta = import('./Module').BuildMeta;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type LibIdentOptions = import('./Module').LibIdentOptions;
type NeedBuildContext = import('./Module').NeedBuildContext;
type ModuleGraph = import('./ModuleGraph');
type RequestShortener = import('./RequestShortener');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
/**
 * <T>
 */
type LazySet<T> = import('./util/LazySet')<T>;
type InputFileSystem = import('./util/fs').InputFileSystem;
/**
 * Context mode
 */
type ContextMode =
  | 'sync'
  | 'eager'
  | 'weak'
  | 'async-weak'
  | 'lazy'
  | 'lazy-once';
type ContextOptions = {
  mode: ContextMode;
  recursive: boolean;
  regExp: RegExp;
  namespaceObject?: ('strict' | boolean) | undefined;
  addon?: string | undefined;
  chunkName?: string | undefined;
  include?: RegExp | undefined;
  exclude?: RegExp | undefined;
  groupOptions?: RawChunkGroupOptions | undefined;
  typePrefix?: string | undefined;
  category?: string | undefined;
  /**
   * exports referenced from modules (won't be mangled)
   */
  referencedExports?: (string[][] | null) | undefined;
  layer?: string | undefined;
};
type ContextModuleOptionsExtras = {
  resource: false | string | string[];
  resourceQuery?: string | undefined;
  resourceFragment?: string | undefined;
  resolveOptions: TODO;
};
type ResolveDependenciesCallback = (
  err?: (Error | null) | undefined,
  dependencies?: ContextElementDependency[] | undefined,
) => any;
