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
  /** @type {undefined | Parser} */
  parser: undefined | Parser;
  /** @type {undefined | ParserOptions} */
  parserOptions: undefined | ParserOptions;
  /** @type {undefined | Generator} */
  generator: undefined | Generator;
  /** @type {undefined | GeneratorOptions} */
  generatorOptions: undefined | GeneratorOptions;
  /** @type {string} */
  resource: string;
  resourceResolveData: Record<string, any>;
  /** @type {string | undefined} */
  matchResource: string | undefined;
  /** @type {LoaderItem[]} */
  loaders: LoaderItem[];
  /** @type {WebpackError | null} */
  error: WebpackError | null;
  /**
   * @private
   * @type {Source | null}
   */
  private _source;
  /**
   * @private
   * @type {Map<string | undefined, number> | undefined}
   */
  private _sourceSizes;
  /**
   * @private
   * @type {undefined | SourceTypes}
   */
  private _sourceTypes;
  _lastSuccessfulBuildMeta: {};
  _forceBuild: boolean;
  _isEvaluatingSideEffects: boolean;
  /** @type {WeakSet<ModuleGraph> | undefined} */
  _addedSideEffectsBailout: WeakSet<ModuleGraph> | undefined;
  /** @type {Map<string, any>} */
  _codeGeneratorData: Map<string, any>;
  /**
   * restore unsafe cache data
   * @param {NormalModuleUnsafeCacheData} unsafeCacheData data from getUnsafeCacheData
   * @param {NormalModuleFactory} normalModuleFactory the normal module factory handling the unsafe caching
   */
  restoreFromUnsafeCache(
    unsafeCacheData: NormalModuleUnsafeCacheData,
    normalModuleFactory: NormalModuleFactory,
  ): void;
  /**
   * @param {string} context the compilation context
   * @param {string} name the asset name
   * @param {string | Buffer} content the content
   * @param {(string | SourceMap)=} sourceMap an optional source map
   * @param {object=} associatedObjectForCache object for caching
   * @returns {Source} the created source
   */
  createSourceForAsset(
    context: string,
    name: string,
    content: string | Buffer,
    sourceMap?: (string | SourceMap) | undefined,
    associatedObjectForCache?: object | undefined,
  ): Source;
  /**
   * @private
   * @template T
   * @param {ResolverWithOptions} resolver a resolver
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {InputFileSystem} fs file system from reading
   * @param {NormalModuleCompilationHooks} hooks the hooks
   * @returns {import("../declarations/LoaderContext").NormalModuleLoaderContext<T>} loader context
   */
  private _createLoaderContext;
  /**
   * @param {TODO} loaderContext loader context
   * @param {number} index index
   * @returns {LoaderItem | null} loader
   */
  getCurrentLoader(loaderContext: TODO, index?: number): LoaderItem | null;
  /**
   * @param {string} context the compilation context
   * @param {string | Buffer} content the content
   * @param {(string | SourceMapSource | null)=} sourceMap an optional source map
   * @param {object=} associatedObjectForCache object for caching
   * @returns {Source} the created source
   */
  createSource(
    context: string,
    content: string | Buffer,
    sourceMap?: (string | SourceMapSource | null) | undefined,
    associatedObjectForCache?: object | undefined,
  ): Source;
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
  /**
   * @param {TODO} rule rule
   * @param {string} content content
   * @returns {boolean} result
   */
  applyNoParseRule(rule: TODO, content: string): boolean;
  /**
   * @param {TODO} noParseRule no parse rule
   * @param {string} request request
   * @returns {boolean} check if module should not be parsed, returns "true" if the module should !not! be parsed, returns "false" if the module !must! be parsed
   */
  shouldPreventParsing(noParseRule: TODO, request: string): boolean;
  /**
   * @param {Compilation} compilation compilation
   * @private
   */
  private _initBuildHash;
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
    Mode,
    ResolveOptions,
    WebpackOptions,
    ChunkGraph,
    Compiler,
    UpdateHashContext,
    DependencyTemplates,
    Generator,
    BuildInfo,
    BuildMeta,
    CodeGenerationContext,
    CodeGenerationResult,
    ConcatenationBailoutReasonContext,
    KnownBuildInfo,
    LibIdentOptions,
    NeedBuildContext,
    SourceTypes,
    UnsafeCacheData,
    ModuleGraph,
    ConnectionState,
    JavaScriptModuleTypes,
    NormalModuleFactory,
    Parser,
    RequestShortener,
    ResolveContext,
    ResolverWithOptions,
    RuntimeTemplate,
    WebpackLogger,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    InputFileSystem,
    RuntimeSpec,
    Algorithm,
    FakeHook,
    ParserOptions,
    GeneratorOptions,
    NormalModuleUnsafeCacheData,
    LoaderContext,
    NormalModuleLoaderContext,
    SourceMap,
    LoaderItem,
    NormalModuleCompilationHooks,
    NormalModuleCreateData,
  };
}
import Module = require('./Module');
import WebpackError = require('./WebpackError');
import { SourceMapSource } from 'webpack-sources';
import Compilation = require('./Compilation');
type Source = import('webpack-sources').Source;
type Mode = import('../declarations/WebpackOptions').Mode;
type ResolveOptions = import('../declarations/WebpackOptions').ResolveOptions;
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type ChunkGraph = import('./ChunkGraph');
type Compiler = import('./Compiler');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type DependencyTemplates = import('./DependencyTemplates');
type Generator = import('./Generator');
type BuildInfo = import('./Module').BuildInfo;
type BuildMeta = import('./Module').BuildMeta;
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type ConcatenationBailoutReasonContext =
  import('./Module').ConcatenationBailoutReasonContext;
type KnownBuildInfo = import('./Module').KnownBuildInfo;
type LibIdentOptions = import('./Module').LibIdentOptions;
type NeedBuildContext = import('./Module').NeedBuildContext;
type SourceTypes = import('./Module').SourceTypes;
type UnsafeCacheData = import('./Module').UnsafeCacheData;
type ModuleGraph = import('./ModuleGraph');
type ConnectionState = import('./ModuleGraphConnection').ConnectionState;
type JavaScriptModuleTypes =
  import('./ModuleTypeConstants').JavaScriptModuleTypes;
type NormalModuleFactory = import('./NormalModuleFactory');
type Parser = import('./Parser');
type RequestShortener = import('./RequestShortener');
type ResolveContext = import('./ResolverFactory').ResolveContext;
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type RuntimeTemplate = import('./RuntimeTemplate');
type WebpackLogger = import('./logging/Logger').Logger;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('./util/Hash');
type InputFileSystem = import('./util/fs').InputFileSystem;
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type Algorithm = import('./util/createHash').Algorithm;
type FakeHook<T> = import('./util/deprecation').FakeHook<T>;
type ParserOptions = {
  [k: string]: any;
};
type GeneratorOptions = {
  [k: string]: any;
};
type NormalModuleUnsafeCacheData = UnsafeCacheData & {
  parser: undefined | Parser;
  parserOptions: undefined | ParserOptions;
  generator: undefined | Generator;
  generatorOptions: undefined | GeneratorOptions;
};
type LoaderContext<T> =
  import('../declarations/LoaderContext').LoaderContext<T>;
type NormalModuleLoaderContext<T> =
  import('../declarations/LoaderContext').NormalModuleLoaderContext<T>;
type SourceMap = {
  version: number;
  sources: string[];
  mappings: string;
  file?: string | undefined;
  sourceRoot?: string | undefined;
  sourcesContent?: string[] | undefined;
  names?: string[] | undefined;
};
type LoaderItem = {
  loader: string;
  options: any;
  ident: string | null;
  type: string | null;
};
type NormalModuleCompilationHooks = {
  loader: SyncHook<[LoaderContext<any>, NormalModule]>;
  beforeLoaders: SyncHook<[LoaderItem[], NormalModule, LoaderContext<any>]>;
  beforeParse: SyncHook<[NormalModule]>;
  beforeSnapshot: SyncHook<[NormalModule]>;
  readResourceForScheme: HookMap<
    FakeHook<
      AsyncSeriesBailHook<[string, NormalModule], string | Buffer | null>
    >
  >;
  readResource: HookMap<
    AsyncSeriesBailHook<[LoaderContext<any>], string | Buffer | null>
  >;
  needBuild: AsyncSeriesBailHook<[NormalModule, NeedBuildContext], boolean>;
};
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
  parserOptions?: ParserOptions | undefined;
  /**
   * the generator used
   */
  generator: Generator;
  /**
   * the options of the generator used
   */
  generatorOptions?: GeneratorOptions | undefined;
  /**
   * options used for resolving requests from this module
   */
  resolveOptions?: ResolveOptions | undefined;
};
import { SyncHook } from 'tapable';
import { HookMap } from 'tapable';
import { AsyncSeriesBailHook } from 'tapable';
