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
