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
import Module = require('../Module');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type WebpackOptions =
  import('../../declarations/WebpackOptions').WebpackOptionsNormalized;
type Chunk = import('../Chunk');
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
