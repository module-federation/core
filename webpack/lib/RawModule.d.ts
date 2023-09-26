export = RawModule;
declare class RawModule extends Module {
  /**
   * @param {string} source source code
   * @param {string} identifier unique identifier
   * @param {string=} readableIdentifier readable identifier
   * @param {ReadonlySet<string>=} runtimeRequirements runtime requirements needed for the source code
   */
  constructor(
    source: string,
    identifier: string,
    readableIdentifier?: string | undefined,
    runtimeRequirements?: ReadonlySet<string> | undefined,
  );
  sourceStr: string;
  identifierStr: string;
  readableIdentifierStr: string;
  runtimeRequirements: ReadonlySet<string>;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace RawModule {
  export {
    Source,
    WebpackOptions,
    ChunkGraph,
    Compilation,
    UpdateHashContext,
    DependencyTemplates,
    CodeGenerationContext,
    CodeGenerationResult,
    NeedBuildContext,
    RequestShortener,
    ResolverWithOptions,
    RuntimeTemplate,
    WebpackError,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    InputFileSystem,
  };
}
import Module = require('./Module');
type Hash = import('./util/Hash');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type Source = any;
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type ChunkGraph = import('./ChunkGraph');
type Compilation = import('./Compilation');
type DependencyTemplates = import('./DependencyTemplates');
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type NeedBuildContext = import('./Module').NeedBuildContext;
type RequestShortener = import('./RequestShortener');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type RuntimeTemplate = import('./RuntimeTemplate');
type WebpackError = import('./WebpackError');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type InputFileSystem = import('./util/fs').InputFileSystem;
