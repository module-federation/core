export = NormalModule;
declare class NormalModule extends Module {
  /**
   * @param {Compilation} compilation the compilation
   * @returns {NormalModuleCompilationHooks} the attached hooks
   */
  static getCompilationHooks(
    compilation: Compilation,
  ): NormalModuleCompilationHooks;
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {NormalModule} module
   */
  static deserialize(context: ObjectDeserializerContext): NormalModule;
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
    extractSourceMap,
  }: NormalModuleCreateData);
  /** @type {NormalModuleCreateData['request']} */
  request: NormalModuleCreateData['request'];
  /** @type {NormalModuleCreateData['userRequest']} */
  userRequest: NormalModuleCreateData['userRequest'];
  /** @type {NormalModuleCreateData['rawRequest']} */
  rawRequest: NormalModuleCreateData['rawRequest'];
  /** @type {boolean} */
  binary: boolean;
  /** @type {NormalModuleCreateData['parser'] | undefined} */
  parser: NormalModuleCreateData['parser'] | undefined;
  /** @type {NormalModuleCreateData['parserOptions']} */
  parserOptions: NormalModuleCreateData['parserOptions'];
  /** @type {NormalModuleCreateData['generator'] | undefined} */
  generator: NormalModuleCreateData['generator'] | undefined;
  /** @type {NormalModuleCreateData['generatorOptions']} */
  generatorOptions: NormalModuleCreateData['generatorOptions'];
  /** @type {NormalModuleCreateData['resource']} */
  resource: NormalModuleCreateData['resource'];
  /** @type {NormalModuleCreateData['resourceResolveData']} */
  resourceResolveData: NormalModuleCreateData['resourceResolveData'];
  /** @type {NormalModuleCreateData['matchResource']} */
  matchResource: NormalModuleCreateData['matchResource'];
  /** @type {NormalModuleCreateData['loaders']} */
  loaders: NormalModuleCreateData['loaders'];
  /** @type {NormalModuleCreateData['extractSourceMap']} */
  extractSourceMap: NormalModuleCreateData['extractSourceMap'];
  /** @type {WebpackError | null} */
  error: WebpackError | null;
  /**
   * @private
   * @type {Source | null}
   */
  private _source;
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
  _lastSuccessfulBuildMeta: {};
  _forceBuild: boolean;
  _isEvaluatingSideEffects: boolean;
  /** @type {WeakSet<ModuleGraph> | undefined} */
  _addedSideEffectsBailout: WeakSet<ModuleGraph> | undefined;
  /** @type {CodeGenerationResultData} */
  _codeGeneratorData: CodeGenerationResultData;
  /**
   * @returns {string | null} return the resource path
   */
  getResource(): string | null;
  /**
   * restore unsafe cache data
   * @param {UnsafeCacheData} unsafeCacheData data from getUnsafeCacheData
   * @param {NormalModuleFactory} normalModuleFactory the normal module factory handling the unsafe caching
   */
  restoreFromUnsafeCache(
    unsafeCacheData: UnsafeCacheData,
    normalModuleFactory: NormalModuleFactory,
  ): void;
  /**
   * @param {string} context the compilation context
   * @param {string} name the asset name
   * @param {string | Buffer} content the content
   * @param {(string | RawSourceMap)=} sourceMap an optional source map
   * @param {AssociatedObjectForCache=} associatedObjectForCache object for caching
   * @returns {Source} the created source
   */
  createSourceForAsset(
    context: string,
    name: string,
    content: string | Buffer,
    sourceMap?: (string | RawSourceMap) | undefined,
    associatedObjectForCache?: AssociatedObjectForCache | undefined,
  ): Source;
  /**
   * @private
   * @template T
   * @param {ResolverWithOptions} resolver a resolver
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {InputFileSystem} fs file system from reading
   * @param {NormalModuleCompilationHooks} hooks the hooks
   * @returns {import("../declarations/LoaderContext").LoaderContext<T>} loader context
   */
  private _createLoaderContext;
  /**
   * @param {AnyLoaderContext} loaderContext loader context
   * @param {number} index index
   * @returns {LoaderItem | null} loader
   */
  getCurrentLoader(
    loaderContext: AnyLoaderContext,
    index?: number,
  ): LoaderItem | null;
  /**
   * @param {string} context the compilation context
   * @param {string | Buffer} content the content
   * @param {(string | RawSourceMap | null)=} sourceMap an optional source map
   * @param {AssociatedObjectForCache=} associatedObjectForCache object for caching
   * @returns {Source} the created source
   */
  createSource(
    context: string,
    content: string | Buffer,
    sourceMap?: (string | RawSourceMap | null) | undefined,
    associatedObjectForCache?: AssociatedObjectForCache | undefined,
  ): Source;
  /**
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {ResolverWithOptions} resolver the resolver
   * @param {InputFileSystem} fs the file system
   * @param {NormalModuleCompilationHooks} hooks the hooks
   * @param {BuildCallback} callback callback function
   * @returns {void}
   */
  _doBuild(
    options: WebpackOptions,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    hooks: NormalModuleCompilationHooks,
    callback: BuildCallback,
  ): void;
  _ast: any;
  /**
   * @param {WebpackError} error the error
   * @returns {void}
   */
  markModuleAsErrored(error: WebpackError): void;
  /**
   * @param {Exclude<NoParse, EXPECTED_ANY[]>} rule rule
   * @param {string} content content
   * @returns {boolean} result
   */
  applyNoParseRule(
    rule: Exclude<NoParse, EXPECTED_ANY[]>,
    content: string,
  ): boolean;
  /**
   * @param {undefined | NoParse} noParseRule no parse rule
   * @param {string} request request
   * @returns {boolean} check if module should not be parsed, returns "true" if the module should !not! be parsed, returns "false" if the module !must! be parsed
   */
  shouldPreventParsing(
    noParseRule: undefined | NoParse,
    request: string,
  ): boolean;
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
    ResolveContext,
    ResolveRequest,
    Source,
    RawSourceMap,
    ResolveOptions,
    NoParse,
    WebpackOptions,
    UpdateHashContext,
    Generator,
    GenerateErrorFn,
    BuildInfo,
    FileSystemDependencies,
    BuildMeta,
    CodeGenerationContext,
    CodeGenerationResult,
    CodeGenerationResultData,
    ConcatenationBailoutReasonContext,
    KnownBuildInfo,
    LibIdentOptions,
    LibIdent,
    NameForCondition,
    NeedBuildContext,
    NeedBuildCallback,
    BuildCallback,
    RuntimeRequirements,
    SourceType,
    SourceTypes,
    UnsafeCacheData,
    ModuleGraph,
    ConnectionState,
    NormalModuleFactory,
    NormalModuleTypes,
    ResourceSchemeData,
    Parser,
    PreparsedAst,
    RequestShortener,
    ResolverWithOptions,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    InputFileSystem,
    HashFunction,
    AssociatedObjectForCache,
    FakeHook,
    ParserOptions,
    GeneratorOptions,
    LoaderContext,
    NormalModuleLoaderContext,
    LoaderItem,
    Result,
    AnyLoaderContext,
    NormalModuleCompilationHooks,
    NormalModuleCreateData,
    ReadResource,
  };
}
import Module = require('./Module');
import WebpackError = require('./WebpackError');
import Compilation = require('./Compilation');
type ResolveContext = import('enhanced-resolve').ResolveContext;
type ResolveRequest = import('enhanced-resolve').ResolveRequest;
type Source = import('webpack-sources').Source;
type RawSourceMap = import('webpack-sources').RawSourceMap;
type ResolveOptions = import('../declarations/WebpackOptions').ResolveOptions;
type NoParse = import('../declarations/WebpackOptions').NoParse;
type WebpackOptions =
  import('./config/defaults').WebpackOptionsNormalizedWithDefaults;
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type Generator = import('./Generator');
type GenerateErrorFn = import('./Generator').GenerateErrorFn;
type BuildInfo = import('./Module').BuildInfo;
type FileSystemDependencies = import('./Module').FileSystemDependencies;
type BuildMeta = import('./Module').BuildMeta;
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type CodeGenerationResultData = import('./Module').CodeGenerationResultData;
type ConcatenationBailoutReasonContext =
  import('./Module').ConcatenationBailoutReasonContext;
type KnownBuildInfo = import('./Module').KnownBuildInfo;
type LibIdentOptions = import('./Module').LibIdentOptions;
type LibIdent = import('./Module').LibIdent;
type NameForCondition = import('./Module').NameForCondition;
type NeedBuildContext = import('./Module').NeedBuildContext;
type NeedBuildCallback = import('./Module').NeedBuildCallback;
type BuildCallback = import('./Module').BuildCallback;
type RuntimeRequirements = import('./Module').RuntimeRequirements;
type SourceType = import('./Module').SourceType;
type SourceTypes = import('./Module').SourceTypes;
type UnsafeCacheData = import('./Module').UnsafeCacheData;
type ModuleGraph = import('./ModuleGraph');
type ConnectionState = import('./ModuleGraphConnection').ConnectionState;
type NormalModuleFactory = import('./NormalModuleFactory');
type NormalModuleTypes = import('./NormalModuleFactory').NormalModuleTypes;
type ResourceSchemeData = import('./NormalModuleFactory').ResourceSchemeData;
type Parser = import('./Parser');
type PreparsedAst = import('./Parser').PreparsedAst;
type RequestShortener = import('./RequestShortener');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('./util/Hash');
type InputFileSystem = import('./util/fs').InputFileSystem;
type HashFunction = import('../declarations/WebpackOptions').HashFunction;
type AssociatedObjectForCache =
  import('./util/identifier').AssociatedObjectForCache;
type FakeHook<T> = import('./util/deprecation').FakeHook<T>;
type ParserOptions = {
  [k: string]: EXPECTED_ANY;
};
type GeneratorOptions = {
  [k: string]: EXPECTED_ANY;
};
type LoaderContext<T> =
  import('../declarations/LoaderContext').LoaderContext<T>;
type NormalModuleLoaderContext<T> =
  import('../declarations/LoaderContext').NormalModuleLoaderContext<T>;
type LoaderItem = {
  loader: string;
  options: string | null | undefined | Record<string, EXPECTED_ANY>;
  ident?: (string | null) | undefined;
  type?: (string | null) | undefined;
};
type Result = [
  string | Buffer,
  string | RawSourceMap | undefined,
  PreparsedAst | undefined,
];
type AnyLoaderContext = LoaderContext<EXPECTED_ANY>;
type NormalModuleCompilationHooks = {
  loader: SyncHook<[AnyLoaderContext, NormalModule]>;
  beforeLoaders: SyncHook<[LoaderItem[], NormalModule, AnyLoaderContext]>;
  beforeParse: SyncHook<[NormalModule]>;
  beforeSnapshot: SyncHook<[NormalModule]>;
  readResourceForScheme: HookMap<
    FakeHook<
      AsyncSeriesBailHook<[string, NormalModule], string | Buffer | null>
    >
  >;
  readResource: HookMap<
    AsyncSeriesBailHook<[AnyLoaderContext], string | Buffer | null>
  >;
  processResult: SyncWaterfallHook<[Result, NormalModule]>;
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
  type: NormalModuleTypes | '';
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
  resourceResolveData?:
    | (ResourceSchemeData & Partial<ResolveRequest>)
    | undefined;
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
  /**
   * enable/disable extracting source map
   */
  extractSourceMap: boolean;
};
type ReadResource = (
  resourcePath: string,
  getLoaderContext: (resourcePath: string) => AnyLoaderContext,
) => Promise<string | Buffer<ArrayBufferLike>>;
import { SyncHook } from 'tapable';
import { HookMap } from 'tapable';
import { AsyncSeriesBailHook } from 'tapable';
import { SyncWaterfallHook } from 'tapable';
