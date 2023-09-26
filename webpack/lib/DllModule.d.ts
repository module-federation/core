export = DllModule;
declare class DllModule extends Module {
  /**
   * @param {string} context context path
   * @param {Dependency[]} dependencies dependencies
   * @param {string} name name
   */
  constructor(context: string, dependencies: Dependency[], name: string);
  name: string;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace DllModule {
  export {
    Source,
    WebpackOptions,
    ChunkGraph,
    Compilation,
    Dependency,
    UpdateHashContext,
    DependencyTemplates,
    CodeGenerationContext,
    CodeGenerationResult,
    NeedBuildContext,
    SourceContext,
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
type Dependency = import('./Dependency');
type Source = any;
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type ChunkGraph = import('./ChunkGraph');
type Compilation = import('./Compilation');
type DependencyTemplates = import('./DependencyTemplates');
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type NeedBuildContext = import('./Module').NeedBuildContext;
type SourceContext = import('./Module').SourceContext;
type RequestShortener = import('./RequestShortener');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type RuntimeTemplate = import('./RuntimeTemplate');
type WebpackError = import('./WebpackError');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type InputFileSystem = import('./util/fs').InputFileSystem;
