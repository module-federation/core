export = RemoteModule;
/** @typedef {string[]} ExternalRequests */
declare class RemoteModule extends Module {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {RemoteModule} deserialized module
   */
  static deserialize(context: ObjectDeserializerContext): RemoteModule;
  /**
   * @param {string} request request string
   * @param {ExternalRequests} externalRequests list of external requests to containers
   * @param {string} internalRequest name of exposed module in container
   * @param {string} shareScope the used share scope name
   */
  constructor(
    request: string,
    externalRequests: ExternalRequests,
    internalRequest: string,
    shareScope: string,
  );
  request: string;
  externalRequests: ExternalRequests;
  internalRequest: string;
  shareScope: string;
  _identifier: string;
}
declare namespace RemoteModule {
  export {
    WebpackOptions,
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
type ExternalRequests = string[];
