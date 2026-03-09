export = ExternalModule;
/** @typedef {Record<string, string | string[]>} RequestRecord */
/** @typedef {string | string[] | RequestRecord} ExternalModuleRequest */
declare class ExternalModule extends Module {
  /**
   * @param {ExternalModuleRequest} request request
   * @param {ExternalsType} type type
   * @param {string} userRequest user request
   * @param {DependencyMeta=} dependencyMeta dependency meta
   */
  constructor(
    request: ExternalModuleRequest,
    type: ExternalsType,
    userRequest: string,
    dependencyMeta?: DependencyMeta | undefined,
  );
  /** @type {ExternalModuleRequest} */
  request: ExternalModuleRequest;
  /** @type {ExternalsType} */
  externalType: ExternalsType;
  /** @type {string} */
  userRequest: string;
  /** @type {DependencyMeta=} */
  dependencyMeta: DependencyMeta | undefined;
  /**
   * restore unsafe cache data
   * @param {UnsafeCacheData} unsafeCacheData data from getUnsafeCacheData
   * @param {NormalModuleFactory} normalModuleFactory the normal module factory handling the unsafe caching
   */
  restoreFromUnsafeCache(
    unsafeCacheData: UnsafeCacheData,
    normalModuleFactory: NormalModuleFactory,
  ): void;
  /**
   * @private
   * @returns {{ request: string | string[], externalType: ExternalsType }} the request and external type
   */
  private _getRequestAndExternalType;
  /**
   * Resolve the detailed external type from the raw external type.
   * e.g. resolve "module" or "import" from "module-import" type
   * @param {ExternalsType} externalType raw external type
   * @returns {ExternalsType} resolved external type
   */
  _resolveExternalType(externalType: ExternalsType): ExternalsType;
  /**
   * @private
   * @param {string | string[]} request request
   * @param {ExternalsType} externalType the external type
   * @param {RuntimeTemplate} runtimeTemplate the runtime template
   * @param {ModuleGraph} moduleGraph the module graph
   * @param {ChunkGraph} chunkGraph the chunk graph
   * @param {RuntimeSpec} runtime the runtime
   * @param {DependencyMeta | undefined} dependencyMeta the dependency meta
   * @param {ConcatenationScope=} concatenationScope concatenationScope
   * @returns {SourceData} the source data
   */
  private _getSourceData;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace ExternalModule {
  export {
    ModuleExternalInitFragment,
    getExternalModuleNodeCommonjsInitFragment,
    Source,
    ExternalsType,
    HashFunction,
    WebpackOptions,
    Chunk,
    ChunkGraph,
    Compilation,
    UnsafeCacheData,
    UpdateHashContext,
    ExportsInfo,
    GenerateContext,
    SourceTypes,
    ModuleId,
    BuildCallback,
    BuildInfo,
    CodeGenerationContext,
    CodeGenerationResult,
    ConcatenationBailoutReasonContext,
    LibIdentOptions,
    LibIdent,
    NeedBuildCallback,
    NeedBuildContext,
    ReadOnlyRuntimeRequirements,
    ModuleGraph,
    NormalModuleFactory,
    RequestShortener,
    ResolverWithOptions,
    RuntimeTemplate,
    ChunkRenderContext,
    ImportAttributes,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    InputFileSystem,
    RuntimeSpec,
    ImportDependencyMeta,
    CssImportDependencyMeta,
    AssetDependencyMeta,
    DependencyMeta,
    SourceData,
    Imported,
    ModuleAndSpecifiers,
    RequestRecord,
    ExternalModuleRequest,
  };
}
import Module = require('./Module');
/**
 * @extends {InitFragment<GenerateContext>}
 */
declare class ModuleExternalInitFragment extends InitFragment<
  import('./Generator').GenerateContext
> {
  /**
   * @param {string} request import source
   * @param {Imported} imported the imported specifiers
   * @param {string=} ident recomputed ident
   * @param {ImportDependencyMeta=} dependencyMeta the dependency meta
   * @param {HashFunction=} hashFunction the hash function to use
   */
  constructor(
    request: string,
    imported: Imported,
    ident?: string | undefined,
    dependencyMeta?: ImportDependencyMeta | undefined,
    hashFunction?: HashFunction | undefined,
  );
  _ident: string;
  _request: string;
  _dependencyMeta: ImportDependencyMeta;
  _identifier: string;
  _imported: Imported;
  /**
   * @returns {Imported} imported
   */
  getImported(): Imported;
  /**
   * @param {Imported} imported imported
   */
  setImported(imported: Imported): void;
  getNamespaceIdentifier(): string;
  /**
   * @param {string} ident ident
   * @returns {string} identifier
   */
  buildIdentifier(ident: string): string;
  /**
   * @param {Imported} imported imported
   * @returns {Imported} normalized imported
   */
  buildImported(imported: Imported): Imported;
}
/**
 * @param {RuntimeTemplate} runtimeTemplate the runtime template
 * @returns {InitFragment<ChunkRenderContext>} code
 */
declare function getExternalModuleNodeCommonjsInitFragment(
  runtimeTemplate: RuntimeTemplate,
): InitFragment<ChunkRenderContext>;
type Source = import('webpack-sources').Source;
type ExternalsType = import('../declarations/WebpackOptions').ExternalsType;
type HashFunction = import('../declarations/WebpackOptions').HashFunction;
type WebpackOptions =
  import('./config/defaults').WebpackOptionsNormalizedWithDefaults;
type Chunk = import('./Chunk');
type ChunkGraph = import('./ChunkGraph');
type Compilation = import('./Compilation');
type UnsafeCacheData = import('./Compilation').UnsafeCacheData;
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type ExportsInfo = import('./ExportsInfo');
type GenerateContext = import('./Generator').GenerateContext;
type SourceTypes = import('./Generator').SourceTypes;
type ModuleId = import('./Module').ModuleId;
type BuildCallback = import('./Module').BuildCallback;
type BuildInfo = import('./Module').BuildInfo;
type CodeGenerationContext = import('./Module').CodeGenerationContext;
type CodeGenerationResult = import('./Module').CodeGenerationResult;
type ConcatenationBailoutReasonContext =
  import('./Module').ConcatenationBailoutReasonContext;
type LibIdentOptions = import('./Module').LibIdentOptions;
type LibIdent = import('./Module').LibIdent;
type NeedBuildCallback = import('./Module').NeedBuildCallback;
type NeedBuildContext = import('./Module').NeedBuildContext;
type ReadOnlyRuntimeRequirements =
  import('./Module').ReadOnlyRuntimeRequirements;
type ModuleGraph = import('./ModuleGraph');
type NormalModuleFactory = import('./NormalModuleFactory');
type RequestShortener = import('./RequestShortener');
type ResolverWithOptions = import('./ResolverFactory').ResolverWithOptions;
type RuntimeTemplate = import('./RuntimeTemplate');
type ChunkRenderContext =
  import('./javascript/JavascriptModulesPlugin').ChunkRenderContext;
type ImportAttributes =
  import('./javascript/JavascriptParser').ImportAttributes;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('./util/Hash');
type InputFileSystem = import('./util/fs').InputFileSystem;
type RuntimeSpec = import('./util/runtime').RuntimeSpec;
type ImportDependencyMeta = {
  attributes?: ImportAttributes;
  externalType: 'import' | 'module' | undefined;
};
type CssImportDependencyMeta = {
  layer?: string;
  supports?: string;
  media?: string;
};
type AssetDependencyMeta = {
  sourceType: 'css-url';
};
type DependencyMeta =
  | ImportDependencyMeta
  | CssImportDependencyMeta
  | AssetDependencyMeta;
type SourceData = {
  iife?: boolean | undefined;
  init?: string | undefined;
  expression: string;
  chunkInitFragments?: InitFragment<ChunkRenderContext>[] | undefined;
  runtimeRequirements?: ReadOnlyRuntimeRequirements | undefined;
  specifiers?: [string, string][] | undefined;
};
type Imported = true | [string, string][];
type ModuleAndSpecifiers = string | string[];
type RequestRecord = Record<string, string | string[]>;
type ExternalModuleRequest = string | string[] | RequestRecord;
import InitFragment = require('./InitFragment');
