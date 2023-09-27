export = FallbackModule;
declare class FallbackModule extends Module {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {FallbackModule} deserialized fallback module
   */
  static deserialize(context: ObjectDeserializerContext): FallbackModule;
  /**
   * @param {string[]} requests list of requests to choose one
   */
  constructor(requests: string[]);
  requests: string[];
  _identifier: string;
}
declare namespace FallbackModule {
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
