import Module = require('webpack/lib/Module');
export type ExposeOptions = {
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
  import('webpack/lib/serialization/ObjectMiddleware').ObjectDeserializerContext;
type WebpackOptions = any;
type ChunkGraph = import('webpack/lib/ChunkGraph');
type ChunkGroup = import('webpack/lib/ChunkGroup');
type Compilation = import('webpack/lib/Compilation');
type CodeGenerationContext = import('webpack/lib/Module').CodeGenerationContext;
type CodeGenerationResult = import('webpack/lib/Module').CodeGenerationResult;
type LibIdentOptions = import('webpack/lib/Module').LibIdentOptions;
type NeedBuildContext = import('webpack/lib/Module').NeedBuildContext;
type RequestShortener = import('webpack/lib/RequestShortener');
type ResolverWithOptions =
  import('webpack/lib/ResolverFactory').ResolverWithOptions;
type WebpackError = import('webpack/lib/WebpackError');
type ObjectSerializerContext =
  import('webpack/lib/serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('webpack/lib/util/Hash');
type InputFileSystem = import('webpack/lib/util/fs').InputFileSystem;
type ContainerEntryDependency = typeof import('./ContainerEntryDependency');

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
   * @param {string[]} runtimePlugins Runtime plugin file paths or package name.
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string,
  );
  _name: string;
  _exposes: [string, ExposeOptions][];
  _shareScope: string;
  runtimePlugins: string[];
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
export default ContainerEntryModule;
