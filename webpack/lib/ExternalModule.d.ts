export = ExternalModule;
declare class ExternalModule extends Module {
  /**
   * @param {string | string[] | Record<string, string | string[]>} request request
   * @param {TODO} type type
   * @param {string} userRequest user request
   */
  constructor(
    request: string | string[] | Record<string, string | string[]>,
    type: TODO,
    userRequest: string,
  );
  /** @type {string | string[] | Record<string, string | string[]>} */
  request: string | string[] | Record<string, string | string[]>;
  /** @type {string} */
  externalType: string;
  /** @type {string} */
  userRequest: string;
  restoreFromUnsafeCache(unsafeCacheData: any, normalModuleFactory: any): void;
  _getRequestAndExternalType(): {
    request: string | string[];
    externalType: string;
  };
  _getSourceData(
    request: any,
    externalType: any,
    runtimeTemplate: any,
    moduleGraph: any,
    chunkGraph: any,
    runtime: any,
  ): SourceData;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace ExternalModule {
  export {
    Source,
    WebpackOptions,
    Chunk,
    ChunkGraph,
    Compilation,
    UpdateHashContext,
    DependencyTemplates,
    ExportsInfo,
    CodeGenerationContext,
    CodeGenerationResult,
    ConcatenationBailoutReasonContext,
    LibIdentOptions,
    NeedBuildContext,
    NormalModuleFactory,
    RequestShortener,
    ResolverWithOptions,
    RuntimeTemplate,
    WebpackError,
    ChunkRenderContext,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    HashConstructor,
    InputFileSystem,
    RuntimeSpec,
    SourceData,
  };
}
import Module = require('./Module');
type SourceData = {
  iife?: boolean | undefined;
  init?: string | undefined;
  expression: string;
  chunkInitFragments?: InitFragment<ChunkRenderContext>[] | undefined;
  runtimeRequirements?: ReadonlySet<string> | undefined;
};
type Hash = import('./util/Hash');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type Source = any;
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type Chunk = import('./Chunk');
type ChunkGraph = import('./ChunkGraph');
type Compilation = import('./Compilation');
type DependencyTemplates = import('./DependencyTemplates');
type ExportsInfo = import('./ExportsInfo');
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type ConcatenationBailoutReasonContext =
  import('./Module').ConcatenationBailoutReasonContext;
type LibIdentOptions = import('./Module').LibIdentOptions;
type NeedBuildContext = import('./Module').NeedBuildContext;
type NormalModuleFactory = import('./NormalModuleFactory');
type RequestShortener = import('./RequestShortener');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type RuntimeTemplate = import('./RuntimeTemplate');
type WebpackError = import('./WebpackError');
type ChunkRenderContext =
  import('./javascript/JavascriptModulesPlugin').ChunkRenderContext;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type HashConstructor = typeof import('./util/Hash');
type InputFileSystem = import('./util/fs').InputFileSystem;
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
import InitFragment = require('./InitFragment');
