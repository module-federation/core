export = RemoteModule;
declare class RemoteModule extends Module {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {RemoteModule} deserialized module
   */
  static deserialize(context: ObjectDeserializerContext): RemoteModule;
  /**
   * @param {string} request request string
   * @param {string[]} externalRequests list of external requests to containers
   * @param {string} internalRequest name of exposed module in container
   * @param {string} shareScope the used share scope name
   */
  constructor(
    request: string,
    externalRequests: string[],
    internalRequest: string,
    shareScope: string,
  );
  request: string;
  externalRequests: string[];
  internalRequest: string;
  shareScope: string;
  _identifier: string;
}
declare namespace RemoteModule {
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
  };
}
import Module = require('../Module');
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
