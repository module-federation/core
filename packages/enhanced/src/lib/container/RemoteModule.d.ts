export default RemoteModule;
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
  /**
   * @param {NeedBuildContext} context context info
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
   * @returns {void}
   */
  needBuild(
    context: NeedBuildContext,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: boolean | undefined,
    ) => void,
  ): void;
  /**
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {ResolverWithOptions} resolver the resolver
   * @param {InputFileSystem} fs the file system
   * @param {function(WebpackError=): void} callback callback function
   * @returns {void}webpack
   */
  build(
    options: WebpackOptions,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    callback: (arg0: WebpackError | undefined) => void,
  ): void;
}
declare namespace RemoteModule {
  export {
    WebpackOptionsohunkGraph,
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
type NeedBuildContext = import('webpack/lib/Module').NeedBuildContext;
type WebpackError = import('webpack/lib/WebpackError');
type WebpackOptions =
  import('webpack/declarations/WebpackOptions').WebpackOptionsNormalized;
type Compilation = import('webpack/lib/Compilation');
type ResolverWithOptions =
  import('webpack/lib/ResolverFactory').ResolverWithOptions;
type InputFileSystem = import('webpack/lib/util/fs').InputFileSystem;
type ObjectDeserializerContext =
  import('webpack/lib/serialization/ObjectMiddleware').ObjectDeserializerContext;
type ChunkGraph = import('webpack/lib/ChunkGraph');
type ChunkGroup = import('webpack/lib/ChunkGroup');
type CodeGenerationContext = import('webpack/lib/Module').CodeGenerationContext;
type CodeGenerationResult = import('webpack/lib/Module').CodeGenerationResult;
type LibIdentOptions = import('webpack/lib/Module').LibIdentOptions;
type RequestShortener = import('webpack/lib/RequestShortener');
type ObjectSerializerContext =
  import('webpack/lib/serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('webpack/lib/util/Hash');
