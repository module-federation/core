export = ContainerEntryModule;
declare class ContainerEntryModule extends Module {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ContainerEntryModule} deserialized container entry module
   */
  static deserialize(context: ObjectDeserializerContext): ContainerEntryModule;
  /**
   * @param {string} name container entry name
   * @param {[string, ExposeOptions][]} exposes list of exposed modules
   * @param {string} shareScope name of the share scope
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string,
  );
  _name: string;
  _exposes: [string, ExposeOptions][];
  _shareScope: string;
}
declare namespace ContainerEntryModule {
  export {
    WebpackOptions,
    ChunkGraph,
    ChunkGroup,
    Compilation,
    CodeGenerationContext,
    CodeGenerationResult,
    LibIdentOptions,
    NeedBuildContext,
    RequestShortener,
    ResolverWithOptions,
    WebpackError,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    InputFileSystem,
    ContainerEntryDependency,
    ExposeOptions,
  };
}
import Module = require('../Module');
type ExposeOptions = {
  /**
   * requests to exposed modules (last one is exported)
   */
  import: string[];
  /**
   * custom chunk name for the exposed module
   */
  name: string;
};
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type WebpackOptions =
  import('../../declarations/WebpackOptions').WebpackOptionsNormalized;
type ChunkGraph = import('../ChunkGraph');
type ChunkGroup = import('../ChunkGroup');
type Compilation = import('../Compilation');
type CodeGenerationContext = import('../Module').CodeGenerationContext;
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type LibIdentOptions = import('../Module').LibIdentOptions;
type NeedBuildContext = import('../Module').NeedBuildContext;
type RequestShortener = import('../RequestShortener');
type ResolverWithOptions = import('../ResolverFactory').ResolverWithOptions;
type WebpackError = import('../WebpackError');
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type InputFileSystem = import('../util/fs').InputFileSystem;
type ContainerEntryDependency = import('./ContainerEntryDependency');
