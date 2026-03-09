export = FallbackModule;
declare class FallbackModule extends Module {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {FallbackModule} deserialized fallback module
   */
  static deserialize(context: ObjectDeserializerContext): FallbackModule;
  /**
   * @param {ExternalRequests} requests list of requests to choose one
   */
  constructor(requests: ExternalRequests);
  requests: import('./RemoteModule').ExternalRequests;
  _identifier: string;
}
declare namespace FallbackModule {
  export {
    WebpackOptions,
    Chunk,
    Compilation,
    BuildCallback,
    CodeGenerationContext,
    CodeGenerationResult,
    LibIdentOptions,
    LibIdent,
    NameForCondition,
    NeedBuildCallback,
    NeedBuildContext,
    SourceTypes,
    RequestShortener,
    ResolverWithOptions,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    InputFileSystem,
    ExternalRequests,
  };
}
import Module = require('../Module');
type WebpackOptions =
  import('../config/defaults').WebpackOptionsNormalizedWithDefaults;
type Chunk = import('../Chunk');
type Compilation = import('../Compilation');
type BuildCallback = import('../Module').BuildCallback;
type CodeGenerationContext = import('../Module').CodeGenerationContext;
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type LibIdentOptions = import('../Module').LibIdentOptions;
type LibIdent = import('../Module').LibIdent;
type NameForCondition = import('../Module').NameForCondition;
type NeedBuildCallback = import('../Module').NeedBuildCallback;
type NeedBuildContext = import('../Module').NeedBuildContext;
type SourceTypes = import('../Module').SourceTypes;
type RequestShortener = import('../RequestShortener');
type ResolverWithOptions = import('../ResolverFactory').ResolverWithOptions;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type InputFileSystem = import('../util/fs').InputFileSystem;
type ExternalRequests = import('./RemoteModule').ExternalRequests;
