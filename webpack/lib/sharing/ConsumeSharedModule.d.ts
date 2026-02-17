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
import Module = require('../Module');
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
  requiredVersion: import('../util/semver').SemVerRange | false | undefined;
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
type Hash = import('../util/Hash');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
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
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type InputFileSystem = import('../util/fs').InputFileSystem;
type SemVerRange = import('../util/semver').SemVerRange;
