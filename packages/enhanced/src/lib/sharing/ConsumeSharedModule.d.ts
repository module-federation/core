export = ConsumeSharedModule;
declare class ConsumeSharedModule extends Module {
  /**
   * @param {string} context context
   * @param {ConsumeOptions} options consume options
   */
  constructor(context: string, options: ConsumeOptions);
  options: ConsumeOptions;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace ConsumeSharedModule {
  export {
    WebpackOptions,
    ChunkGraph,
    ChunkGroup,
    Compilation,
    UpdateHashContext,
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
    SemVerRange,
    ConsumeOptions,
  };
}
import Module = require('webpack/lib/Module');
type ConsumeOptions = {
  /**
   * fallback request
   */
  import?: string | undefined;
  /**
   * resolved fallback request
   */
  importResolved?: string | undefined;
  /**
   * global share key
   */
  shareKey: string;
  /**
   * share scope
   */
  shareScope: string;
  /**
   * version requirement
   */
  requiredVersion:
    | import('webpack/lib/util/semver').SemVerRange
    | false
    | undefined;
  /**
   * package name to determine required version automatically
   */
  packageName: string;
  /**
   * don't use shared version even if version isn't valid
   */
  strictVersion: boolean;
  /**
   * use single global version
   */
  singleton: boolean;
  /**
   * include the fallback module in a sync way
   */
  eager: boolean;
};
type Hash = import('webpack/lib/util/Hash');
type UpdateHashContext = import('webpack/lib/Dependency').UpdateHashContext;
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
type ObjectDeserializerContext =
  import('webpack/lib/serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('webpack/lib/serialization/ObjectMiddleware').ObjectSerializerContext;
type InputFileSystem = import('webpack/lib/util/fs').InputFileSystem;
type SemVerRange = import('webpack/lib/util/semver').SemVerRange;
