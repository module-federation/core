export = DelegatedModule;
declare class DelegatedModule extends Module {
  /**
   * @param {ObjectDeserializerContext} context context\
   * @returns {DelegatedModule} DelegatedModule
   */
  static deserialize(context: ObjectDeserializerContext): DelegatedModule;
  /**
   * @param {string} sourceRequest source request
   * @param {TODO} data data
   * @param {"require" | "object"} type type
   * @param {string} userRequest user request
   * @param {string | Module} originalRequest original request
   */
  constructor(
    sourceRequest: string,
    data: TODO,
    type: 'require' | 'object',
    userRequest: string,
    originalRequest: string | Module,
  );
  sourceRequest: string;
  request: any;
  delegationType: 'object' | 'require';
  userRequest: string;
  originalRequest: string | Module;
  /** @type {ManifestModuleData | undefined} */
  delegateData: ManifestModuleData | undefined;
  delegatedSourceDependency: DelegatedSourceDependency;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace DelegatedModule {
  export {
    Source,
    WebpackOptions,
    ChunkGraph,
    Compilation,
    UpdateHashContext,
    DependencyTemplates,
    ManifestModuleData,
    CodeGenerationContext,
    CodeGenerationResult,
    LibIdentOptions,
    NeedBuildContext,
    SourceContext,
    RequestShortener,
    ResolverWithOptions,
    RuntimeTemplate,
    WebpackError,
    ModuleDependency,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    InputFileSystem,
  };
}
import Module = require('./Module');
type ManifestModuleData = import('./LibManifestPlugin').ManifestModuleData;
import DelegatedSourceDependency = require('./dependencies/DelegatedSourceDependency');
type Hash = import('./util/Hash');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type Source = any;
type WebpackOptions =
  import('../declarations/WebpackOptions').WebpackOptionsNormalized;
type ChunkGraph = import('./ChunkGraph');
type Compilation = import('./Compilation');
type DependencyTemplates = import('./DependencyTemplates');
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type LibIdentOptions = import('./Module').LibIdentOptions;
type NeedBuildContext = import('./Module').NeedBuildContext;
type SourceContext = import('./Module').SourceContext;
type RequestShortener = import('./RequestShortener');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type RuntimeTemplate = import('./RuntimeTemplate');
type WebpackError = import('./WebpackError');
type ModuleDependency = import('./dependencies/ModuleDependency');
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type InputFileSystem = import('./util/fs').InputFileSystem;
