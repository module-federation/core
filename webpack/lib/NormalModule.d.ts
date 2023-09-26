export = NormalModule;
declare class NormalModule extends Module {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {NormalModuleCompilationHooks} the attached hooks
   */
  static getCompilationHooks(
    compilation: Compilation,
  ): NormalModuleCompilationHooks;
  static deserialize(context: any): NormalModule;
  /**
   * @param {NormalModuleCreateData} options options object
   */
  constructor({
    layer,
    type,
    request,
    userRequest,
    rawRequest,
    loaders,
    resource,
    resourceResolveData,
    context,
    matchResource,
    parser,
    parserOptions,
    generator,
    generatorOptions,
    resolveOptions,
  }: NormalModuleCreateData);
  /** @type {string} */
  request: string;
  /** @type {string} */
  userRequest: string;
  /** @type {string} */
  rawRequest: string;
  /** @type {boolean} */
  binary: boolean;
  /** @type {Parser} */
  parser: Parser;
  parserOptions: Record<string, any>;
  /** @type {Generator} */
  generator: Generator;
  generatorOptions: Record<string, any>;
  /** @type {string} */
  resource: string;
  resourceResolveData: Record<string, any>;
  /** @type {string | undefined} */
  matchResource: string | undefined;
  /** @type {LoaderItem[]} */
  loaders: LoaderItem[];
  /** @type {(WebpackError | null)=} */
  error: (WebpackError | null) | undefined;
  /** @private @type {Source=} */
  private _source;
  /** @private @type {Map<string, number> | undefined} **/
  private _sourceSizes;
  /** @private @type {Set<string>} */
  private _sourceTypes;
  _lastSuccessfulBuildMeta: {};
  _forceBuild: boolean;
  _isEvaluatingSideEffects: boolean;
  /** @type {WeakSet<ModuleGraph> | undefined} */
  _addedSideEffectsBailout: WeakSet<ModuleGraph> | undefined;
  /** @type {Map<string, any>} */
  _codeGeneratorData: Map<string, any>;
  context: any;
  restoreFromUnsafeCache(unsafeCacheData: any, normalModuleFactory: any): void;
  /**
   * @param {string} context the compilation context
   * @param {string} name the asset name
   * @param {string} content the content
   * @param {string | TODO} sourceMap an optional source map
   * @param {Object=} associatedObjectForCache object for caching
   * @returns {Source} the created source
   */
  createSourceForAsset(
    context: string,
    name: string,
    content: string,
    sourceMap: string | TODO,
    associatedObjectForCache?: any | undefined,
  ): any;
  /**
   * @param {ResolverWithOptions} resolver a resolver
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {InputFileSystem} fs file system from reading
   * @param {NormalModuleCompilationHooks} hooks the hooks
   * @returns {NormalModuleLoaderContext} loader context
   */
  _createLoaderContext(
    resolver: ResolverWithOptions,
    options: WebpackOptions,
    compilation: Compilation,
    fs: InputFileSystem,
    hooks: NormalModuleCompilationHooks,
  ): import('../declarations/LoaderContext').NormalModuleLoaderContext<any>;
  getCurrentLoader(loaderContext: any, index?: any): LoaderItem;
  /**
   * @param {string} context the compilation context
   * @param {string | Buffer} content the content
   * @param {string | TODO} sourceMap an optional source map
   * @param {Object=} associatedObjectForCache object for caching
   * @returns {Source} the created source
   */
  createSource(
    context: string,
    content: string | Buffer,
    sourceMap: string | TODO,
    associatedObjectForCache?: any | undefined,
  ): any;
  /**
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {ResolverWithOptions} resolver the resolver
   * @param {InputFileSystem} fs the file system
   * @param {NormalModuleCompilationHooks} hooks the hooks
   * @param {function((WebpackError | null)=): void} callback callback function
   * @returns {void}
   */
  _doBuild(
    options: WebpackOptions,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    hooks: NormalModuleCompilationHooks,
    callback: (arg0: (WebpackError | null) | undefined) => void,
  ): void;
  _ast: any;
  /**
   * @param {WebpackError} error the error
   * @returns {void}
   */
  markModuleAsErrored(error: WebpackError): void;
  applyNoParseRule(rule: any, content: any): any;
  shouldPreventParsing(noParseRule: any, request: any): any;
  _initBuildHash(compilation: any): void;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace NormalModule {
  export {
    Source,
    NormalModuleLoaderContext,
    Mode,
    ResolveOptions,
    WebpackOptions,
    ChunkGraph,
    Compiler,
    UpdateHashContext,
    DependencyTemplates,
    Generator,
    CodeGenerationContext,
    CodeGenerationResult,
    ConcatenationBailoutReasonContext,
    LibIdentOptions,
    NeedBuildContext,
    ModuleGraph,
    ConnectionState,
    JavaScriptModuleTypes,
    NormalModuleFactory,
    Parser,
    RequestShortener,
    ResolverWithOptions,
    RuntimeTemplate,
    WebpackLogger,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    InputFileSystem,
    RuntimeSpec,
    SourceMap,
    LoaderItem,
    NormalModuleCompilationHooks,
    NormalModuleCreateData,
  };
}
import Module = require('./Module');
type Parser = import('./Parser');
type Generator = import('./Generator');
type LoaderItem = {
  loader: string;
  options: any;
  ident: string | null;
  type: string | null;
};
import WebpackError = require('./WebpackError');
type ModuleGraph = import('./ModuleGraph');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
import Compilation = require('./Compilation');
type InputFileSystem = import('./util/fs').InputFileSystem;
type NormalModuleCompilationHooks = {
  loader: SyncHook<[object, NormalModule]>;
  beforeLoaders: SyncHook<[LoaderItem[], NormalModule, object]>;
  beforeParse: SyncHook<[NormalModule]>;
  beforeSnapshot: SyncHook<[NormalModule]>;
  readResourceForScheme: HookMap<
    AsyncSeriesBailHook<[string, NormalModule], string | Buffer>
  >;
  readResource: HookMap<AsyncSeriesBailHook<[object], string | Buffer>>;
  needBuild: AsyncSeriesBailHook<[NormalModule, NeedBuildContext], boolean>;
};
type Hash = import('./util/Hash');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type NormalModuleCreateData = {
  /**
   * an optional layer in which the module is
   */
  layer?: string | undefined;
  /**
   * module type. When deserializing, this is set to an empty string "".
   */
  type: JavaScriptModuleTypes | '';
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
  resourceResolveData?: Record<string, any> | undefined;
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
  parser: Parser;
  /**
   * the options of the parser used
   */
  parserOptions?: Record<string, any> | undefined;
  /**
   * the generator used
   */
  generator: Generator;
  /**
   * the options of the generator used
   */
  generatorOptions?: Record<string, any> | undefined;
  /**
   * options used for resolving requests from this module
   */
  resolveOptions?: ResolveOptions | undefined;
};
type Source = any;
type NormalModuleLoaderContext =
  import('../declarations/LoaderContext').NormalModuleLoaderContext<any>;
type Mode = import('../declarations/WebpackOptions').Mode;
type ResolveOptions = import('../declarations/WebpackOptions').ResolveOptions;
type ChunkGraph = import('./ChunkGraph');
type Compiler = import('./Compiler');
type DependencyTemplates = import('./DependencyTemplates');
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type ConcatenationBailoutReasonContext =
  import('./Module').ConcatenationBailoutReasonContext;
type LibIdentOptions = import('./Module').LibIdentOptions;
type NeedBuildContext = import('./Module').NeedBuildContext;
type ConnectionState = import('./ModuleGraphConnection').ConnectionState;
type JavaScriptModuleTypes =
  import('./ModuleTypeConstants').JavaScriptModuleTypes;
type NormalModuleFactory = import('./NormalModuleFactory');
type RequestShortener = import('./RequestShortener');
type RuntimeTemplate = import('./RuntimeTemplate');
type WebpackLogger = import('./logging/Logger').Logger;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type SourceMap = {
  version: number;
  sources: string[];
  mappings: string;
  file?: string | undefined;
  sourceRoot?: string | undefined;
  sourcesContent?: string[] | undefined;
  names?: string[] | undefined;
};
import { SyncHook } from 'tapable';
import { HookMap } from 'tapable';
import { AsyncSeriesBailHook } from 'tapable';
