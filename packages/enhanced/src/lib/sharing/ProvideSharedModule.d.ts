export = ProvideSharedModule;
declare class ProvideSharedModule extends Module {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ProvideSharedModule} deserialize fallback dependency
   */
  static deserialize(context: ObjectDeserializerContext): ProvideSharedModule;
  /**
   * @param {string} shareScope shared scope name
   * @param {string} name shared key
   * @param {string | false} version version
   * @param {string} request request to the provided module
   * @param {boolean} eager include the module in sync way
   */
  constructor(
    shareScope: string,
    name: string,
    version: string | false,
    request: string,
    eager: boolean,
  );
  _shareScope: string;
  _name: string;
  _version: string | false;
  _request: string;
  _eager: boolean;
}
declare namespace ProvideSharedModule {
  export {
    WebpackOptions,
    Chunk,
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
import Module = require('webpack/lib/Module');
type ObjectDeserializerContext =
  import('webpack/lib/serialization/ObjectMiddleware').ObjectDeserializerContext;
type WebpackOptions = any;
type Chunk = import('webpack/lib/Chunk');
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
