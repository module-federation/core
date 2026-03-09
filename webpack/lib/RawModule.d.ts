export = RawModule;
/** @typedef {import("./config/defaults").WebpackOptionsNormalizedWithDefaults} WebpackOptions */
/** @typedef {import("./Compilation")} Compilation */
/** @typedef {import("./Dependency").UpdateHashContext} UpdateHashContext */
/** @typedef {import("./Generator").SourceTypes} SourceTypes */
/** @typedef {import("./Module").BuildCallback} BuildCallback */
/** @typedef {import("./Module").CodeGenerationContext} CodeGenerationContext */
/** @typedef {import("./Module").CodeGenerationResult} CodeGenerationResult */
/** @typedef {import("./Module").NeedBuildCallback} NeedBuildCallback */
/** @typedef {import("./Module").NeedBuildContext} NeedBuildContext */
/** @typedef {import("./Module").ReadOnlyRuntimeRequirements} ReadOnlyRuntimeRequirements */
/** @typedef {import("./ModuleGraph")} ModuleGraph */
/** @typedef {import("./ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("./RequestShortener")} RequestShortener */
/** @typedef {import("./ResolverFactory").ResolverWithOptions} ResolverWithOptions */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./util/Hash")} Hash */
/** @typedef {import("./util/fs").InputFileSystem} InputFileSystem */
declare class RawModule extends Module {
  /**
   * @param {string} source source code
   * @param {string} identifier unique identifier
   * @param {string=} readableIdentifier readable identifier
   * @param {ReadOnlyRuntimeRequirements=} runtimeRequirements runtime requirements needed for the source code
   */
  constructor(
    source: string,
    identifier: string,
    readableIdentifier?: string | undefined,
    runtimeRequirements?: ReadOnlyRuntimeRequirements | undefined,
  );
  sourceStr: string;
  identifierStr: string;
  readableIdentifierStr: string;
  runtimeRequirements: Module.ReadOnlyRuntimeRequirements;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace RawModule {
  export {
    WebpackOptions,
    Compilation,
    UpdateHashContext,
    SourceTypes,
    BuildCallback,
    CodeGenerationContext,
    CodeGenerationResult,
    NeedBuildCallback,
    NeedBuildContext,
    ReadOnlyRuntimeRequirements,
    ModuleGraph,
    ConnectionState,
    RequestShortener,
    ResolverWithOptions,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    InputFileSystem,
  };
}
import Module = require('./Module');
type WebpackOptions =
  import('./config/defaults').WebpackOptionsNormalizedWithDefaults;
type Compilation = import('./Compilation');
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type SourceTypes = import('./Generator').SourceTypes;
type BuildCallback = import('./Module').BuildCallback;
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type NeedBuildCallback = import('./Module').NeedBuildCallback;
type NeedBuildContext = import('./Module').NeedBuildContext;
type ReadOnlyRuntimeRequirements =
  import('./Module').ReadOnlyRuntimeRequirements;
type ModuleGraph = import('./ModuleGraph');
type ConnectionState = import('./ModuleGraphConnection').ConnectionState;
type RequestShortener = import('./RequestShortener');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('./util/Hash');
type InputFileSystem = import('./util/fs').InputFileSystem;
